const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const core=require('../../claimsnative/growth.js');
const registry={utm_source:['google','newsletter'],utm_medium:['organic','email'],utm_campaign:['existing-ehr'],utm_content:['guide']};
function environment(options={}) {
 const data=new Map(options.data||[]), listeners={}, sent=[];
 const w={location:{hostname:'claimsnative.com',pathname:'/insurance-opportunity/',search:'?utm_source=google&utm_campaign=existing-ehr&email=private@example.test',...options.location},
  ClaimsGrowthConfig:{posthogKey:'synthetic-key',posthogHost:'https://us.i.posthog.com',campaigns:registry,...options.config},
  document:{referrer:'https://www.google.com/search?q=private',addEventListener:(n,fn)=>listeners[n]=fn,querySelectorAll:()=>[],getElementById:()=>null},
  sessionStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},
  navigator:options.navigator||{},crypto:{randomUUID:()=>require('node:crypto').randomUUID()},fetch:(url,opts)=>{sent.push({url,...opts,payload:JSON.parse(opts.body)});return Promise.resolve({ok:true});}};
 if(options.storageFailure)w.sessionStorage={getItem(){throw Error()},setItem(){throw Error()},removeItem(){throw Error()}};
 return {w,sent,data,listeners};
}
test('only public normalized paths; unknown and healthcare routes fail closed',()=>{
 assert.equal(core.path('/claimsnative/billing-setup/index.html?email=x#y'),'/billing-setup/');
 for(const path of ['/patients/123','/signup','/api/inquiry','/unknown','/__proto__/'])assert.equal(core.path(path),null);
});
test('registry rejects arbitrary values, PII, duplicate parameters, and unapproved campaign keys',()=>{
 const t=core.touch('?utm_source=google&utm_source=bing&utm_campaign=private-email&utm_term=diagnosis&gclid=secret','',registry);
 assert.deepEqual(t,{referral_source:'direct_unknown'});
 assert.deepEqual(core.campaign({utm_source:'private@example.test',utm_medium:'EMAIL',email:'x',utm_campaign:'existing-ehr'},registry),{utm_campaign:'existing-ehr'});
});
test('referral normalization rejects lookalike hosts and strips paths/query',()=>{
 assert.equal(core.source('https://chatgpt.com/c/private?email=secret'),'chatgpt');
 assert.equal(core.source('https://chatgpt.com.evil.test/'),'other_referral');
 assert.equal(core.source('mailto:person@example.test'),'direct_unknown');
 assert.equal(core.source('garbage'),'direct_unknown');
});
test('internal navigation retains the eligible source; a direct entry stays direct',()=>{
 assert.deepEqual(core.touch('', 'https://claimsnative.com/keep-your-ehr/',registry,{referral_source:'google',utm_source:'google',email:'private'}),{utm_source:'google',referral_source:'google'});
 assert.equal(core.touch('', '',registry,{referral_source:'google'}).referral_source,'direct_unknown');
});
test('payload property allowlist drops fields, URL, query and caller category',()=>{
 const p=core.properties('primary_cta_clicked',{page_path:'/?email=private',page_category:'patient',cta_id:'get-started',cta_location:'hero',email:'private',first:{referral_source:'google',diagnosis:'x'},conversion:{referral_source:'chatgpt'}},registry);
 assert.deepEqual(p,{page_path:'/',page_category:'home',cta_id:'get-started',cta_location:'hero',first_referral_source:'google',conversion_referral_source:'chatgpt'});
 for(const event of ['inquiry_accepted','booking_confirmed','payment_received','__proto__'])assert.equal(core.properties(event,{page_path:'/'},registry),null);
});
test('no network or source storage before opt-in; decline and revocation stop collection',()=>{
 const e=environment(); const api=core.start(e.w); assert.equal(api.track('inquiry_form_started',{},true),false); assert.equal(e.sent.length,0);assert.equal(e.data.size,0);
 api.choose(false);assert.equal(api.track('inquiry_form_started',{},true),false);
 api.choose(true);assert.equal(api.track('inquiry_form_started',{},true),true);
 api.choose(false);assert.equal(api.track('inquiry_draft_prepared',{},true),false);assert.equal(e.data.has('claims-growth-v1'),false);
});
test('replays of form start and draft are deduplicated; no personal fields in serialized payload',()=>{
 const e=environment();const api=core.start(e.w);api.choose(true);
 for(let i=0;i<5;i++)api.track('inquiry_form_started',{email:'private',page_path:'/patient/123'},true);
 for(let i=0;i<5;i++)api.track('inquiry_draft_prepared',{name:'private'},true);
 assert.equal(e.sent.length,2);assert.equal(new Set(e.sent.map(x=>x.payload.uuid)).size,2);
 const serialized=JSON.stringify(e.sent);for(const s of ['private','example.test','search?','utm_term','gclid'])assert.ok(!serialized.includes(s),s);
 assert.equal(e.sent[0].referrerPolicy,'no-referrer');assert.equal(e.sent[0].credentials,'omit');
 assert.equal(e.sent[0].payload.distinct_id,'public-marketing');
});
test('rapid click retries count once; locations remain separate',()=>{
 const e=environment();const a=core.start(e.w);a.choose(true);
 for(let i=0;i<5;i++)a.track('primary_cta_clicked',{cta_id:'get-started',cta_location:'hero'});
 a.track('primary_cta_clicked',{cta_id:'get-started',cta_location:'header'});assert.equal(e.sent.length,2);
});
test('DNT, GPC, webdriver, app hosts, previews, unknown paths and missing provider fail closed',()=>{
 for(const options of [{navigator:{doNotTrack:'1'}},{navigator:{globalPrivacyControl:true}},{navigator:{webdriver:true}},{location:{hostname:'app.claimsnative.com'}},{location:{hostname:'branch.claimsnative.pages.dev'}},{location:{pathname:'/patients/123'}},{config:{posthogKey:''}},{config:{posthogHost:'https://evil.test'}}]){
 const e=environment(options);const api=core.start(e.w);api.choose(true);api.track('inquiry_form_started',{},true);assert.equal(e.sent.length,0,JSON.stringify(options));
 }
});
test('first touch persists; conversion touch updates; stored fields are revalidated',()=>{
 const e=environment();const a=core.start(e.w);a.choose(true);
 const next=environment({data:[...e.data],location:{search:''}}); next.w.document.referrer='https://chatgpt.com/c/secret';const b=core.start(next.w);b.track('inquiry_form_started',{},true);
 const p=next.sent[0].payload.properties;assert.equal(p.first_referral_source,'google');assert.equal(p.conversion_referral_source,'chatgpt');assert.equal(p.first_utm_campaign,'existing-ehr');
 assert.ok(!b.leadLines().join().includes('secret'));
});
test('expired, malformed and future state cannot override first touch',()=>{
 for(const stored of ['garbage',JSON.stringify({at:Date.now()-1800001,first:{referral_source:'partner'}}),JSON.stringify({at:Date.now()+100000,first:{referral_source:'partner'}})]){
 const e=environment({data:[['claims-growth-choice-v1','yes'],['claims-growth-v1',stored]]});const a=core.start(e.w);assert.ok(a.leadLines().includes('First visit source: Google'));
 }
});
test('storage failure preserves form use and in-memory opt-in',()=>{
 const e=environment({storageFailure:true});const a=core.start(e.w);a.choose(true);assert.equal(a.track('inquiry_form_started',{},true),true);assert.equal(e.sent.length,1);
});
test('loading script twice adds one listener set',()=>{
 const e=environment();const context=vm.createContext({window:e.w,URL,URLSearchParams,Set,Map,Date,JSON,Object,Number,String});
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../../claimsnative/growth.js'),'utf8'),context);const first=e.w.ClaimsGrowth;
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../../claimsnative/growth.js'),'utf8'),context);assert.equal(e.w.ClaimsGrowth,first);
});
test('network failure is not retried and never creates an acceptance event',()=>{
 const e=environment();let count=0;e.w.fetch=()=>{count++;throw Error('offline')};const a=core.start(e.w);a.choose(true);a.track('inquiry_form_started',{},true);a.track('inquiry_form_started',{},true);assert.equal(count,1);
});

test('missing secure random UUID fails closed without breaking email attribution',()=>{
 const e=environment();e.w.crypto={};const a=core.start(e.w);a.choose(true);assert.equal(a.track('inquiry_form_started',{},true),false);assert.ok(a.leadLines().length>0);
});

test('delegated footer email click preserves safe source labels without analytics consent',()=>{
 const e=environment();core.start(e.w);
 const el={dataset:{growthEvent:'inquiry_email_opened',growthCta:'talk-to-us',growthLocation:'footer'},href:'mailto:daniel@claimsnative.com'};
 e.listeners.click({target:{closest:()=>el}});
 assert.ok(decodeURIComponent(el.href.replace(/\+/g,' ')).includes('First visit source: Google'));assert.equal(e.sent.length,0);
});

test('consent toggles do not reset form and draft retry protection',()=>{
 const e=environment();const a=core.start(e.w);a.choose(true);
 for(const event of ['inquiry_form_started','inquiry_draft_prepared'])a.track(event,{},true);
 a.choose(false);a.choose(true);
 for(const event of ['inquiry_form_started','inquiry_draft_prepared'])a.track(event,{},true);
 assert.equal(e.sent.length,2);
});
test('internal partial campaign labels retain the known conversion source',()=>{
 const previous={utm_source:'google',utm_medium:'organic',utm_campaign:'existing-ehr',referral_source:'google'};
 const t=core.touch('?utm_content=guide','https://claimsnative.com/',registry,previous);
 assert.deepEqual(t,{...previous,utm_content:'guide'});
 const replacement=core.touch('?utm_source=newsletter&utm_medium=email','https://claimsnative.com/',registry,previous);
 assert.equal(replacement.referral_source,'newsletter');assert.equal(replacement.utm_source,'newsletter');
 assert.equal(core.touch('?utm_content=guide','',registry,previous).referral_source,'direct_unknown');
});

test('guide inquiry navigation keeps its local destination and fixed event label',()=>{
 const e=environment();const a=core.start(e.w);a.choose(true);
 const el={dataset:{growthEvent:'primary_cta_clicked',growthCta:'start-inquiry',growthLocation:'body'},href:'https://claimsnative.com/insurance-opportunity/#review'};
 e.listeners.click({target:{closest:()=>el}});
 assert.equal(el.href,'https://claimsnative.com/insurance-opportunity/#review');
 assert.equal(e.sent.length,1);assert.equal(e.sent[0].payload.properties.cta_id,'start-inquiry');
 assert.equal(new URL(el.href).searchParams.has('body'),false);
});
