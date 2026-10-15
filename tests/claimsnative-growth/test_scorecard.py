import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('scorecard',Path(__file__).resolve().parents[2]/'scripts/claimsnative-scorecard.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Scorecard(unittest.TestCase):
 def lead(self,key='a',source='google',**kw):
  return dict(opportunity_key=key,received_at='2026-10-13T10:00:00-04:00',first_source=source,conversion_source=source,qualified_at='',booking_confirmed_at='',pilot_started_at='',is_test='false',is_spam='false',**kw)
 def receipt(self,**kw):return dict(receipt_key='r',opportunity_key='a',settled_at='2026-10-14T10:00:00-04:00',amount_usd='500.00',is_test='false',**kw)
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
if __name__=='__main__':unittest.main()
