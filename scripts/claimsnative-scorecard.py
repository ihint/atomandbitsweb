#!/usr/bin/env python3
"""Aggregate private lead/payment CSV exports. Never upload or print record IDs."""
import argparse
import csv
import json
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo

SOURCES = {
    'direct_unknown', 'google', 'bing', 'chatgpt', 'perplexity', 'claude',
    'copilot', 'duckduckgo', 'newsletter', 'partner', 'other_referral',
}
TZ = ZoneInfo('America/New_York')


def timestamp(value):
    if not value:
        return None
    result = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if result.tzinfo is None:
        raise ValueError('Dates must have a timezone')
    return result.astimezone(TZ)


def require_text(row, key):
    value = row.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError('A required private record field is missing')
    return value


def excluded(row, flags):
    for key in flags:
        if row.get(key) not in ('true', 'false'):
            raise ValueError('Explicit test and spam flags are required')
    return any(row[key] == 'true' for key in flags)


def unique(rows, key):
    result = {}
    for row in rows:
        value = require_text(row, key)
        if value in result and row != result[value]:
            raise ValueError('Conflicting duplicate records; reconcile privately')
        result[value] = row
    return result


def validate_lead(row):
    received = timestamp(require_text(row, 'received_at'))
    stages = {
        'qualified': timestamp(row.get('qualified_at')),
        'booked': timestamp(row.get('booking_confirmed_at')),
        'pilot': timestamp(row.get('pilot_started_at')),
    }
    if any(at and at < received for at in stages.values()):
        raise ValueError('A stage predates its inquiry')
    if stages['qualified']:
        require_text(row, 'qualification_evidence')
    if stages['booked']:
        require_text(row, 'booking_evidence')
    if stages['pilot'] and (
        not stages['qualified'] or stages['pilot'] < stages['qualified']
    ):
        raise ValueError('Pilot needs prior qualification')
    return received, stages


def validate_receipts(rows, all_leads, leads):
    receipts = {}
    for key, row in unique(rows, 'receipt_key').items():
        if excluded(row, ('is_test',)):
            continue
        opportunity = require_text(row, 'opportunity_key')
        if opportunity not in all_leads:
            raise ValueError('Payment lacks a private lead join')
        if opportunity not in leads:
            continue
        at = timestamp(require_text(row, 'settled_at'))
        amount = Decimal(require_text(row, 'amount_usd'))
        if not amount.is_finite() or amount != amount.quantize(Decimal('.01')):
            raise ValueError('Payment amount must be finite whole cents')
        require_text(row, 'evidence')
        if at < leads[opportunity][1]:
            raise ValueError('Payment predates its inquiry')
        original = row.get('original_receipt_key') or ''
        if amount >= 0 and original:
            raise ValueError('Only refunds link to an original receipt')
        receipts[key] = (opportunity, at, amount, original)

    refunded = {}
    for opportunity, at, amount, original in receipts.values():
        if amount >= 0:
            continue
        if original not in receipts:
            raise ValueError('Refund lacks its original included receipt')
        original_opportunity, original_at, original_amount, _ = receipts[original]
        if original_opportunity != opportunity or original_amount <= 0:
            raise ValueError('Refund must refer to a payment for the same opportunity')
        if at < original_at:
            raise ValueError('Refund predates its original receipt')
        refunded[original] = refunded.get(original, Decimal(0)) - amount
        if refunded[original] > original_amount:
            raise ValueError('Refunds exceed the original payment')
    return receipts


def score(leads, payments, week_start, as_of, model='conversion'):
    if model not in ('first', 'conversion'):
        raise ValueError('Unknown source model')
    start = datetime.combine(date.fromisoformat(week_start), time(), TZ)
    if start.weekday() != 0:
        raise ValueError('Week must start on Monday')
    end = start + timedelta(days=7)
    cutoff = datetime.combine(date.fromisoformat(as_of) + timedelta(days=1), time(), TZ)
    if cutoff < end:
        raise ValueError('As-of date must include the full reporting week')

    all_leads = unique(leads, 'opportunity_key')
    # Validate all included records before selecting the inquiry cohort.
    valid = {}
    for key, row in all_leads.items():
        if not excluded(row, ('is_test', 'is_spam')):
            received, stages = validate_lead(row)
            valid[key] = (row, received, stages)
    receipts = validate_receipts(payments, all_leads, valid)
    groups = {}

    def group(row):
        source = row.get(model + '_source', 'direct_unknown')
        source = source if source in SOURCES else 'direct_unknown'
        if source not in groups:
            groups[source] = {
                'received': 0, 'qualified_cohort': 0, 'booked_cohort': 0,
                'pilot_started_cohort': 0, 'paid_pilots_cohort': 0,
                'gross_collected_week_usd': Decimal(0),
                'refunds_week_usd': Decimal(0), 'net_collected_week_usd': Decimal(0),
            }
        return groups[source]

    net = {}
    for opportunity, at, amount, _ in receipts.values():
        if at < cutoff:
            net[opportunity] = net.get(opportunity, Decimal(0)) + amount
        if start <= at < end:
            result = group(valid[opportunity][0])
            result['net_collected_week_usd'] += amount
            result['gross_collected_week_usd'] += max(amount, Decimal(0))
            result['refunds_week_usd'] -= min(amount, Decimal(0))

    for key, (row, received, stages) in valid.items():
        if not start <= received < end:
            continue
        result = group(row)
        result['received'] += 1
        for stage in ('qualified', 'booked'):
            if stages[stage] and stages[stage] < cutoff:
                result[stage + '_cohort'] += 1
        if stages['pilot'] and stages['pilot'] < cutoff:
            result['pilot_started_cohort'] += 1
            if net.get(key, 0) > 0:
                result['paid_pilots_cohort'] += 1

    for result in groups.values():
        for name, numerator, denominator in (
            ('qualified_rate', 'qualified_cohort', 'received'),
            ('booking_rate', 'booked_cohort', 'received'),
            ('paid_per_qualified_rate', 'paid_pilots_cohort', 'qualified_cohort'),
        ):
            count, total = result[numerator], result[denominator]
            result[name] = {
                'count': count, 'denominator': total,
                'rate': count / total if total else None,
            }
        for key, value in list(result.items()):
            if isinstance(value, Decimal):
                result[key] = str(value.quantize(Decimal('.01')))
    return {'week_start': week_start, 'as_of': as_of, 'source_model': model, 'groups': groups}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--leads', required=True)
    parser.add_argument('--payments', required=True)
    parser.add_argument('--week-start', required=True)
    parser.add_argument('--as-of', required=True)
    parser.add_argument('--source-model', choices=['first', 'conversion'], default='conversion')
    args = parser.parse_args()
    try:
        with open(args.leads, newline='') as source:
            leads = list(csv.DictReader(source))
        with open(args.payments, newline='') as source:
            payments = list(csv.DictReader(source))
        print(json.dumps(score(leads, payments, args.week_start, args.as_of, args.source_model), indent=2))
    except (ValueError, KeyError, ArithmeticError):
        parser.exit(1, 'Invalid private input; reconcile dates, joins, flags, evidence and duplicates before reporting.\n')
