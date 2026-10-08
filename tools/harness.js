const fs=require('fs');
const path=require('path');
const {createCanvas}=require('@napi-rs/canvas');
module.exports=function load(file){
  const html=fs.readFileSync(file||path.join(__dirname,'..','index.html'),'utf8');
  let js=html.match(/<script>([\s\S]*)<\/script>/)[1];
  const tail="resize();goMenu();requestAnimationFrame(loop);\n})();";
  if(!js.includes(tail))throw new Error('tail not found');
  js=js.replace(tail,"resize();goMenu();requestAnimationFrame(loop);\nglobalThis.__t={BIKES,buyBike,rideBike,goGarage,garageHTML,renderGarage,baht,G,P,inp,RIVALS,update,render,updateHud,startRace,doGear,doNitro,segs,segAt,SEG,PLAYER_Z,pzOf,act,cv,setMode,hudC,SAVE,STAGES,swapStage,pickStage,goSelect,goMenu,finishRace,failRace,get FINISH_Z(){return FINISH_Z},get STAGE(){return STAGE},get SEL(){return SEL},get TH(){return TH}};\n})();");
  const real=createCanvas(360,640);
  const mk=()=>{const o={classList:{add(){},remove(){},toggle(){}},style:{setProperty(){}},dataset:{},addEventListener(){},
    getBoundingClientRect:()=>({width:390,height:640,left:0,top:0}),setPointerCapture(){},closest(){return null},offsetWidth:1,scrollTop:0,
    children:[{classList:{toggle(){}}},{classList:{toggle(){}}},{classList:{toggle(){}}}]};
    return new Proxy(o,{get(t,p){return p in t?t[p]:(()=>{})},set(t,p,v){t[p]=v;return true}})};
  real.addEventListener=()=>{};real.setPointerCapture=()=>{};real.getBoundingClientRect=()=>({width:360,height:640,left:0,top:0});
  const els={c:real};
  globalThis.document={getElementById:id=>els[id]||(els[id]=mk()),addEventListener(){},hidden:false};
  globalThis.window=globalThis;globalThis.addEventListener=()=>{};
  globalThis.localStorage={getItem:()=>null,setItem(){}};
  globalThis.requestAnimationFrame=()=>{};globalThis.devicePixelRatio=1;
  globalThis.performance=globalThis.performance||{now:()=>0};
  (0,eval)(js);
  return {T:globalThis.__t,canvas:real};
};
