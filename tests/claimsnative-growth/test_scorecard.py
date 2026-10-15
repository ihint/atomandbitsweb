import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('scorecard',Path(__file__).resolve().parents[2]/'scripts/claimsnative-scorecard.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Scorecard(unittest.TestCase):
 def lead(self,key='a',source='google',**kw):
  return dict(opportunity_key=key,received_at='2026-10-13T10:00:00-04:00',first_source=source,conversion_source=source,qualified_at='',booking_confirmed_at='',pilot_started_at='',is_test='false',is_spam='false',**kw)
 def receipt(self,**kw):return dict(receipt_key='r',opportunity_key='a',settled_at='2026-10-14T10:00:00-04:00',amount_usd='500.00',is_test='false',evidence='synthetic-settled-receipt',**kw)
 def test_manual_loop_and_retries(self):
  a=self.lead();a.update(qualified_at='2026-10-14T10:00:00-04:00',qualification_evidence='private-record',booking_confirmed_at='2026-10-14T10:00:00-04:00',booking_evidence='private-calendar',pilot_started_at='2026-10-14T10:00:00-04:00')
  b=self.lead('b','direct_unknown');t=self.lead('test');t['is_test']='true';spam=self.lead('spam');spam['is_spam']='true';r=self.receipt()
  out=m.score([a,a,b,t,spam],[r,r],'2026-10-12','2026-10-18')['groups']
  self.assertEqual(sum(g['received'] for g in out.values()),2);self.assertEqual(out['google']['qualified_cohort'],1);self.assertEqual(out['google']['booked_cohort'],1);self.assertEqual(out['google']['paid_pilots_cohort'],1);self.assertEqual(out['google']['net_collected_week_usd'],'500.00');self.assertNotIn('private',str(out))
 def test_cash_week_is_separate_from_cohort(self):
  a=self.lead();a['received_at']='2026-10-01T10:00:00-04:00';out=m.score([a],[self.receipt()],'2026-10-12','2026-10-18')['groups']['google'];self.assertEqual(out['received'],0);self.assertEqual(out['net_collected_week_usd'],'500.00');self.assertIsNone(out['qualified_rate']['rate'])
 def test_refund_and_unknown_source(self):
  a=self.lead(source='private@example.test');r=self.receipt();refund=self.receipt(original_receipt_key='r');refund.update(receipt_key='refund',amount_usd='-100.00');out=m.score([a],[r,refund],'2026-10-12','2026-10-18')['groups'];self.assertEqual(out['direct_unknown']['net_collected_week_usd'],'400.00');self.assertNotIn('private',str(out))
 def test_conflicting_duplicate_or_unverified_booking_fails(self):
  a=self.lead();b=dict(a,conversion_source='bing')
  with self.assertRaises(ValueError):m.score([a,b],[],'2026-10-12','2026-10-18')
  a['booking_confirmed_at']='2026-10-14T10:00:00-04:00'
  with self.assertRaises(ValueError):m.score([a],[],'2026-10-12','2026-10-18')
 def test_source_views_and_eastern_boundaries(self):
  a=self.lead();a.update(first_source='partner',received_at='2026-10-19T02:00:00Z');out=m.score([a],[],'2026-10-12','2026-10-18','first')['groups'];self.assertEqual(out['partner']['received'],1)
 def test_refund_must_link_same_opportunity_and_follow_original(self):
  a=self.lead();b=self.lead('b');r=self.receipt()
  for original,opportunity,at,amount in [('missing','a','2026-10-14T11:00:00-04:00','-100'),('r','b','2026-10-14T11:00:00-04:00','-100'),('r','a','2026-10-14T09:00:00-04:00','-100'),('r','a','2026-10-14T11:00:00-04:00','-501')]:
   refund=dict(r,receipt_key='refund',original_receipt_key=original,opportunity_key=opportunity,settled_at=at,amount_usd=amount)
   with self.subTest(original=original,opportunity=opportunity,at=at,amount=amount),self.assertRaises(ValueError):m.score([a,b],[r,refund],'2026-10-12','2026-10-18')
  f1=dict(r,receipt_key='f1',original_receipt_key='r',amount_usd='-300');f2=dict(f1,receipt_key='f2')
  with self.assertRaises(ValueError):m.score([a],[r,f1,f2],'2026-10-12','2026-10-18')
 def test_payment_cannot_predate_inquiry_or_lack_evidence(self):
  a=self.lead();r=self.receipt();r['settled_at']='2026-10-12T10:00:00-04:00'
  with self.assertRaises(ValueError):m.score([a],[r],'2026-10-12','2026-10-18')
  r=self.receipt();r.pop('evidence')
  with self.assertRaises(ValueError):m.score([a],[r],'2026-10-12','2026-10-18')
 def test_older_opportunities_are_validated_before_cohort_filter(self):
  a=self.lead();a.update(received_at='2026-10-01T10:00:00-04:00',qualified_at='2026-09-01T10:00:00-04:00')
  with self.assertRaises(ValueError):m.score([a],[self.receipt()],'2026-10-12','2026-10-18')
  a.update(qualified_at='',booking_confirmed_at='2026-10-14T10:00:00-04:00')
  with self.assertRaises(ValueError):m.score([a],[self.receipt()],'2026-10-12','2026-10-18')
 def test_missing_exclusion_flags_stop_reporting(self):
  for key in ['is_test','is_spam']:
   a=self.lead();a.pop(key)
   with self.subTest(key=key),self.assertRaises(ValueError):m.score([a],[],'2026-10-12','2026-10-18')
  r=self.receipt();r.pop('is_test')
  with self.assertRaises(ValueError):m.score([self.lead()],[r],'2026-10-12','2026-10-18')
 def test_valid_partial_refunds_work_in_any_row_order(self):
  r=self.receipt();f=dict(r,receipt_key='f',amount_usd='-200',original_receipt_key='r',settled_at='2026-10-15T10:00:00-04:00')
  out=m.score([self.lead()],[f,r],'2026-10-12','2026-10-18')['groups']['google'];self.assertEqual(out['net_collected_week_usd'],'300.00')
if __name__=='__main__':unittest.main()
