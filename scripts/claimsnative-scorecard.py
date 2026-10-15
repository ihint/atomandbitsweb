#!/usr/bin/env python3
"""Aggregate private lead/payment CSV exports. Never upload or print record IDs."""
import argparse, csv, json
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo
SOURCES = {'direct_unknown','google','bing','chatgpt','perplexity','claude','copilot','duckduckgo','newsletter','partner','other_referral'}
TZ=ZoneInfo('America/New_York')
def timestamp(value):
    if not value: return None
    dt=datetime.fromisoformat(value.replace('Z','+00:00'))
    if dt.tzinfo is None: raise ValueError('Dates must have a timezone')
    return dt.astimezone(TZ)
def excluded(row):
    for key in ['is_test','is_spam']:
        if key in row and row[key] not in ['true','false']: raise ValueError('Test and spam flags must be true or false')
    return row.get('is_test')=='true' or row.get('is_spam')=='true'
def unique(rows,key):
    out={}
    for row in rows:
        value=row.get(key)
        if not value: raise ValueError('A private record key is missing')
        if value in out and row!=out[value]: raise ValueError('Conflicting duplicate records; reconcile privately')
        out[value]=row
    return out

def score(leads,payments,week_start,as_of,model='conversion'):
    start=datetime.combine(date.fromisoformat(week_start),time(),TZ)
    if start.weekday()!=0: raise ValueError('Week must start on Monday')
    end=start+timedelta(days=7)
    cutoff=datetime.combine(date.fromisoformat(as_of)+timedelta(days=1),time(),TZ)
    if cutoff<end: raise ValueError('As-of date must include the full reporting week')
    all_leads=unique(leads,'opportunity_key'); valid={k:r for k,r in all_leads.items() if not excluded(r)}
    receipts=unique(payments,'receipt_key'); groups={}
    def source(row):
        val=row.get(model+'_source','direct_unknown');return val if val in SOURCES else 'direct_unknown'
    def group(row):
        src=source(row)
        if src not in groups: groups[src]={'received':0,'qualified_cohort':0,'booked_cohort':0,'pilot_started_cohort':0,'paid_pilots_cohort':0,'gross_collected_week_usd':Decimal(0),'refunds_week_usd':Decimal(0),'net_collected_week_usd':Decimal(0)}
        return groups[src]
    net={}
    for r in receipts.values():
        if excluded(r):continue
        if r['opportunity_key'] not in all_leads: raise ValueError('Payment lacks a private lead join')
        lead=valid.get(r['opportunity_key'])
        if lead is None:continue
        at=timestamp(r['settled_at']);amount=Decimal(r['amount_usd'])
        if not at or not amount.is_finite():raise ValueError('Payment date or amount is invalid')
        if amount<0 and not r.get('original_receipt_key'):raise ValueError('Refund lacks its original receipt')
        if at<cutoff:net[r['opportunity_key']]=net.get(r['opportunity_key'],Decimal(0))+amount
        if start<=at<end:
            g=group(lead);g['net_collected_week_usd']+=amount
            g['gross_collected_week_usd']+=max(amount,Decimal(0));g['refunds_week_usd']+=-min(amount,Decimal(0))
    for key,r in valid.items():
        received=timestamp(r['received_at'])
        if not received:raise ValueError('Inquiry receipt date is required')
        if not start<=received<end:continue
        g=group(r);g['received']+=1
        qualified=timestamp(r.get('qualified_at',''));booked=timestamp(r.get('booking_confirmed_at',''));pilot=timestamp(r.get('pilot_started_at',''))
        if any(at and at < received for at in [qualified,booked,pilot]): raise ValueError('A stage predates its inquiry')
        if pilot and (not qualified or pilot<qualified): raise ValueError('Pilot needs prior qualification')
        if qualified and qualified<cutoff:
            if not r.get('qualification_evidence'):raise ValueError('Qualification evidence is required')
            g['qualified_cohort']+=1
        if booked and booked<cutoff:
            if not r.get('booking_evidence'):raise ValueError('Booking evidence is required')
            g['booked_cohort']+=1
        if pilot and pilot<cutoff:
            g['pilot_started_cohort']+=1
            if net.get(key,0)>0:g['paid_pilots_cohort']+=1
    for g in groups.values():
        g['qualified_rate']={'count':g['qualified_cohort'],'denominator':g['received'],'rate':g['qualified_cohort']/g['received'] if g['received'] else None}
        g['booking_rate']={'count':g['booked_cohort'],'denominator':g['received'],'rate':g['booked_cohort']/g['received'] if g['received'] else None}
        g['paid_per_qualified_rate']={'count':g['paid_pilots_cohort'],'denominator':g['qualified_cohort'],'rate':g['paid_pilots_cohort']/g['qualified_cohort'] if g['qualified_cohort'] else None}
        for k,v in list(g.items()):
            if isinstance(v,Decimal):g[k]=str(v.quantize(Decimal('.01')))
    return {'week_start':week_start,'as_of':as_of,'source_model':model,'groups':groups}
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--leads',required=True);p.add_argument('--payments',required=True);p.add_argument('--week-start',required=True);p.add_argument('--as-of',required=True);p.add_argument('--source-model',choices=['first','conversion'],default='conversion');a=p.parse_args()
    try:
        with open(a.leads,newline='') as f:leads=list(csv.DictReader(f))
        with open(a.payments,newline='') as f:payments=list(csv.DictReader(f))
        print(json.dumps(score(leads,payments,a.week_start,a.as_of,a.source_model),indent=2))
    except (ValueError,KeyError,ArithmeticError) as e:
        p.exit(1,'Invalid private input; reconcile dates, joins, flags, evidence and duplicates before reporting.\n')
