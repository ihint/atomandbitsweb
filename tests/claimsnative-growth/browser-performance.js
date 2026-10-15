async (page) => {
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
 return {results,note:'One local cold-cache run per page/viewport; no field INP or production CWV claim.'};
}
