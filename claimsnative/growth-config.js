/* Owner setup only. Empty key keeps collection off. See docs/claimsnative-growth. */
window.ClaimsGrowthConfig = Object.freeze({
  posthogKey: '',
  posthogHost: 'https://us.i.posthog.com',
  campaigns: Object.freeze({
    utm_source: ['google', 'bing', 'chatgpt', 'perplexity', 'newsletter', 'partner'],
    utm_medium: ['organic', 'referral', 'email', 'cpc'],
    utm_campaign: ['existing-ehr', 'billing-setup', 'payment-reconciliation'],
    utm_content: ['guide', 'footer', 'profile']
  })
});
