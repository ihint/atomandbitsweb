# Claims Native inquiry recipient

October 16, 2026. Ian chose `daniel@claimsnative.com` for the marketing contact and inquiry flow. Input: growth `eb795564942414ba5def21841bebad6f2e462f38`.

Expected: every Claims Native marketing email link, fallback, draft recipient and service contact uses that exact address. Keep the “we/us” copy, legal operator, offer, source labels, three required fields, optional estimate and local draft behavior. This is a user-selected named address; do not call it a verified shared inbox.

Checks: inspect the address-only diff; run the existing marketing gate; have a separate agent check routing and stale-address cases; rebuild from committed inputs and show the local synthetic unsent draft. Keep old evidence tied to its original source. Stop before opening the email app.

Critical failures: a wrong or stale recipient, lost subject/body encoding, invented shared-inbox or delivery proof, sent email, collector activation, merge or deployment. Passing local checks does not prove delivery or Daniel's receipt.
