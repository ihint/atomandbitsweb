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

 await page.unrouteAll({behavior:'wait'});
 await page.addInitScript(()=>{
  if(window.lab)return;window.lab={lcp:0,cls:0};
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.lab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value}).observe({type:'layout-shift',buffered:true});
 });
 const cdp=await page.context().newCDPSession(page),results=[];
 await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await cdp.send('Emulation.setCPUThrottlingRate',{rate:width===390?4:1});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:width===390?150:20,downloadThroughput:width===390?200000:1250000,uploadThroughput:93750});
  for(const route of ['/keep-your-ehr/','/billing-setup/','/remittance-and-deposits/']){
   await page.goto('http://127.0.0.1:4187'+route);await page.waitForTimeout(1000);
   results.push({width,route,...await page.evaluate(()=>({lcp:window.lab.lcp,cls:window.lab.cls,dom:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,transferred:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0)}))});
  }
 }
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 return {build,results,note:'One local cold-cache run per page/viewport; no field INP or production CWV claim.'};
}
