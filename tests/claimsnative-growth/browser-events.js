async (page) => {
 const manifestResponse=await page.request.get('http://127.0.0.1:4187/build-manifest.json');
 if(!manifestResponse.ok())throw Error('Build identity missing');
 const build=await manifestResponse.json();
 if(!build.source_inputs_clean)throw Error('Browser proof requires committed build inputs');
 if(build.build_environment!=='production')throw Error('Wrong browser artifact environment');
 for(const [asset,expected]of Object.entries(build.artifact_sha256)){
  const response=await page.request.get('http://127.0.0.1:4187/'+asset);
  const bytes=await response.body();
  const actual=await page.evaluate(async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))).map(b=>b.toString(16).padStart(2,'0')).join(''),Array.from(bytes));
  if(!response.ok()||actual!==expected)throw Error('Built asset mismatch: '+asset);
 }

 const captures=[],unexpected=[],errors=[];
 const response=await page.request.get('http://127.0.0.1:4187/growth-config.js');
 const fixtureConfig=(await response.text()).replace("posthogKey: ''", "posthogKey: 'synthetic-no-service-key'");
 await page.unrouteAll({behavior:'wait'});
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.hostname.endsWith('.posthog.com')){
   captures.push(JSON.parse(route.request().postData()));
   await route.fulfill({status:200,contentType:'application/json',body:'{"status":1}'});return;
  }
  if(u.hostname==='claimsnative.com'){
   if(u.pathname==='/growth-config.js'){await route.fulfill({status:200,contentType:'text/javascript',body:fixtureConfig});return;}
   const r=await route.fetch({url:'http://127.0.0.1:4187'+u.pathname+u.search});await route.fulfill({response:r});return;
  }
  unexpected.push(u.origin);await route.abort();
 });
 await page.addInitScript(()=>{if (!Object.getOwnPropertyDescriptor(navigator,'webdriver')) Object.defineProperty(navigator,'webdriver',{get:()=>false});});
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:900});
 await page.goto('https://claimsnative.com/insurance-opportunity/?utm_source=google&utm_medium=organic&utm_campaign=existing-ehr&utm_content=guide&utm_term=private-health&email=private@example.test');
 await page.evaluate(()=>sessionStorage.clear()); await page.reload();
 if(captures.length)throw Error('Event before consent');
 await page.getByRole('button',{name:'Allow event counts'}).click();
 await page.getByText('Add practice details (optional)',{exact:true}).click();
 const fields={'Practice name':'Synthetic Practice','Specialty':'Synthetic specialty','City and state':'Test City, TN','Visits per week':'100','EHR or practice system':'Synthetic EHR','What would you like help with?':'Synthetic private concern','Your name':'Synthetic Person','Email':'synthetic@example.test'};
 for(const [label,value]of Object.entries(fields))await page.getByLabel(label,{exact:true}).fill(value);
 await page.getByLabel('Insurance status',{exact:true}).selectOption({label:'In network'});
 await page.getByLabel('How did you hear about us? (optional)',{exact:true}).selectOption({label:'AI assistant'});
 await page.getByRole('button',{name:'Review email draft'}).click();
 await page.getByRole('button',{name:'Review email draft'}).click();
 const draft=await page.locator('#draft-preview').innerText();
 if(!draft.includes('First observed campaign: Keep your EHR')||!draft.includes('How did you hear about us: AI assistant')||draft.includes('private-health'))throw Error('Draft source mismatch');
 if(!await page.getByText('Your draft is ready. Nothing has been sent.',{exact:true}).isVisible())throw Error('Missing draft truth');
 if(captures.filter(e=>e.event==='inquiry_form_started').length!==1||captures.filter(e=>e.event==='inquiry_draft_prepared').length!==1)throw Error('Duplicate events '+JSON.stringify(captures));
 const raw=JSON.stringify(captures);
 for(const forbidden of ['Synthetic','synthetic@example','private-health','private@example','Synthetic EHR','utm_term','$current_url','$referrer','session_id'])if(raw.includes(forbidden))throw Error('Payload leak '+forbidden);
 // Prevent navigation before clicking; only the local listener executes.
 const signup=page.locator('header [data-growth-cta="get-started"]');
 await signup.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));
 await signup.click();await signup.click();
 if(captures.filter(e=>e.event==='primary_cta_clicked').length!==1)throw Error('Primary CTA retry duplicated');
 const footer=page.locator('footer [data-growth-cta="talk-to-us"]');
 await footer.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await footer.click();
 const footerHref=await footer.getAttribute('href');
 if(!new URL(footerHref).searchParams.get('body').includes('first_utm_source: google'))throw Error('Footer source missing');
 const href=await page.locator('#open-email').getAttribute('href');
 if(!decodeURIComponent(href).includes('conversion_referral_source: google'))throw Error('Mailto missing source');
 await page.getByRole('button',{name:'Analytics choices'}).click();
 await page.screenshot({path:'output/playwright/growth/consent-390.png',fullPage:false});
 await page.getByRole('button',{name:'Decline',exact:true}).click();
 const before=captures.length;
 await page.locator('#specialty').fill('Another synthetic specialty');await page.getByRole('button',{name:'Review email draft'}).click();
 if(captures.length!==before)throw Error('Capture after revocation');
 if(await page.evaluate(()=>sessionStorage.getItem('claims-growth-v1'))!==null)throw Error('Source state survived revocation');
 await page.getByRole('button',{name:'Analytics choices'}).click();
 await page.getByRole('button',{name:'Allow event counts'}).click();
 await page.locator('#specialty').fill('Re-consent retry');await page.getByRole('button',{name:'Review email draft'}).click();
 if(captures.length!==before)throw Error('Re-consent reset page retry protection');
 await page.goto('https://claimsnative.com/billing-setup/?utm_content=guide',{referer:'https://claimsnative.com/insurance-opportunity/'});
 const internalLabels=await page.evaluate(()=>window.ClaimsGrowth.leadLines());
 if(!internalLabels.includes('conversion_referral_source: google')||!internalLabels.includes('conversion_utm_content: guide'))throw Error('Partial internal tags erased conversion source');
 if(unexpected.length||errors.length)throw Error(JSON.stringify({unexpected,errors}));
 return {build,reconsentRetriesSuppressed:true,internalPartialAttributionVerified:true,fixture:{posthogKey:'synthetic-no-service-key',webdriver:false,allExternalRequestsIntercepted:true},events:captures.map(e=>({event:e.event,properties:e.properties})),draftAttribution:true,receivedEvents:0,posthogRequestsForwarded:0,externalActions:0,unexpected,errors};
}
