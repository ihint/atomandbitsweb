async (page) => {
  const results=[];
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  const routes=['/','/how-we-start/','/chiropractors/','/insurance-opportunity/','/keep-your-ehr/','/billing-setup/','/remittance-and-deposits/','/404.html'];
  await page.addInitScript(() => {
    window.lab={lcp:0,cls:0};
    new PerformanceObserver(list=>{for(const e of list.getEntries())window.lab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value}).observe({type:'layout-shift',buffered:true});
  });
  const cdp=await page.context().newCDPSession(page);
  for (const width of [1440,390,320]) {
    await page.setViewportSize({width,height:900});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:width===1440?1:4});
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:width===1440?0:150,downloadThroughput:width===1440?-1:200000,uploadThroughput:width===1440?-1:93750});
    for(const route of routes){
      await page.goto('http://127.0.0.1:4187'+route);
      await page.waitForTimeout(500);
      const row=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,lab:window.lab,dom:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,bytes:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0),h1:document.querySelector('h1').innerText}));
      results.push({width,route,...row});
      if(row.overflow)throw Error('Horizontal overflow: '+route+' '+width);
      if((width===1440||width===390)&&['/','/keep-your-ehr/','/billing-setup/','/remittance-and-deposits/'].includes(route))await page.screenshot({path:'output/playwright/growth/'+(route==='/'?'home':route.split('/')[1])+'-'+width+'.png',fullPage:true});
    }
  }
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors));
  return {results,errors};
}
