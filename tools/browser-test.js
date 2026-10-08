const fs=require('fs');
const {chromium}=require('playwright');
(async()=>{
  let html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
  const tail="resize();goMenu();requestAnimationFrame(loop);\n})();";
  if(!html.includes(tail))throw new Error('tail');
  html=html.replace(tail,"resize();goMenu();requestAnimationFrame(loop);\nwindow.__t={G,P,inp,update,startRace,doGear,doNitro,pzOf,act,finishRace,failRace,STAGES,SAVE,BIKES,renderGarage,swapStage,get FINISH_Z(){return FINISH_Z},get STAGE(){return STAGE}};\n})();");
  fs.mkdirSync('out',{recursive:true});fs.writeFileSync('out/page.html',html);
  const b=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox']});
  const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await pg.goto('file://'+process.cwd()+'/out/page.html');
  await pg.waitForTimeout(700);
  await pg.screenshot({path:'out/g_menu.png'});
  await pg.click('[data-act="garage"]');await pg.waitForTimeout(400);
  await pg.screenshot({path:'out/g_garage0.png'});
  const prev=await pg.evaluate(()=>[...document.querySelectorAll('canvas[data-bike]')].map(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return [c.width,c.height,n]}));
  console.log('preview canvases (w,h,nonTransparentPx):',JSON.stringify(prev));
  await pg.evaluate(()=>{__t.SAVE.tips=3500;__t.renderGarage()});await pg.waitForTimeout(200);
  await pg.screenshot({path:'out/g_garage1.png'});
  // real taps: buy scooter twice
  await pg.click('[data-act="buy"][data-i="1"]');await pg.waitForTimeout(200);
  await pg.screenshot({path:'out/g_confirm.png'});
  await pg.click('[data-act="buy"][data-i="1"]');await pg.waitForTimeout(300);
  console.log('after buy:',JSON.stringify(await pg.evaluate(()=>({tips:__t.SAVE.tips,own:__t.SAVE.own,bike:__t.SAVE.bike,ls:Object.keys(localStorage)}))));
  await pg.screenshot({path:'out/g_garage2.png'});
  await pg.click('[data-act="ride"][data-i="0"]');await pg.waitForTimeout(200);
  console.log('ride starter:',await pg.evaluate(()=>__t.SAVE.bike));
  await pg.click('[data-act="ride"][data-i="1"]');await pg.waitForTimeout(200);
  await pg.click('[data-act="back"]');await pg.waitForTimeout(300);
  console.log('mode after back:',await pg.evaluate(()=>__t.G.mode));
  await pg.screenshot({path:'out/g_menu2.png'});
  // race with scooter, wall test
  await pg.click('[data-act="select"]');await pg.waitForTimeout(300);
  await pg.click('[data-act="pick"][data-i="0"]');await pg.waitForTimeout(400);
  await pg.screenshot({path:'out/g_brief.png'});
  await pg.click('[data-act="start"]');await pg.waitForTimeout(4500);
  await pg.evaluate(()=>{for(let i=0;i<4;i++)__t.doGear(1)});await pg.waitForTimeout(3500);
  await pg.screenshot({path:'out/g_race_scooter.png'});
  const L=await (await pg.$('#bL')).boundingBox();
  await pg.mouse.move(L.x+L.width/2,L.y+L.height/2);await pg.mouse.down();
  const sp=[];
  for(let i=0;i<8;i++){await pg.waitForTimeout(250);sp.push(await pg.evaluate(()=>[Math.round(__t.G.speed),+__t.P.x.toFixed(2),__t.P.scrape]))}
  await pg.screenshot({path:'out/g_wall.png'});
  await pg.mouse.up();
  console.log('hold left (speed,x,scrape):',JSON.stringify(sp));
  // race with the super bike (style 3)
  await pg.evaluate(()=>{__t.SAVE.own=[0,1,2,3];__t.SAVE.bike=3;__t.act('menu')});await pg.waitForTimeout(300);
  await pg.evaluate(()=>{__t.act('select');__t.act('pick','2');__t.act('start')});await pg.waitForTimeout(4500);
  await pg.screenshot({path:'out/g_race_super.png'});
  await pg.evaluate(()=>{__t.SAVE.bike=2});await pg.waitForTimeout(300);
  await pg.screenshot({path:'out/g_race_street.png'});
  // result with unlock hint
  await pg.evaluate(()=>{__t.SAVE.own=[0,1];__t.SAVE.bike=0;__t.SAVE.tips=2900;__t.act('menu');__t.act('select');__t.act('pick','0');__t.act('start')});await pg.waitForTimeout(4500);
  await pg.evaluate(()=>{__t.G.pos=__t.FINISH_Z-__t.pzOf()+__t.G.pos-300});await pg.waitForTimeout(4500);
  await pg.screenshot({path:'out/g_result.png'});
  console.log('mode',await pg.evaluate(()=>__t.G.mode),'unlock',await pg.evaluate(()=>__t.G.res&&__t.G.res.unlock));
  console.log('errors:',JSON.stringify(errs));
  await b.close();
})();
