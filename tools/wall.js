const load=require('./harness');
const {T}=load();const {G,P,inp}=T;
function step(n){for(let i=0;i<n;i++){T.update(1/60);if(i%30===0){T.render();T.updateHud()}}}
for(const side of [-1,1]){
  T.swapStage(0);T.STAGE.cf=0;T.startRace();step(60*4);
  for(let i=0;i<4;i++)T.doGear(1);
  inp.drag=0;P.x=0;step(60*6);
  console.log('SIDE',side,'cruise speed',Math.round(G.speed),'gear',P.gear,'x',P.x.toFixed(2));
  const log=[];
  inp.drag=side;
  for(let i=0;i<60*3;i++){T.update(1/60);if(i%15===0)log.push(`${(i/60).toFixed(2)}s v=${Math.round(G.speed)} x=${P.x.toFixed(2)} scr=${P.scrape}`)}
  console.log(log.join('\n'));
  inp.drag=-side;
  for(let i=0;i<60*4;i++){T.update(1/60);if(i%45===0)console.log(' release',(i/60).toFixed(2),'v=',Math.round(G.speed),'x=',P.x.toFixed(2))}
  inp.drag=0;
}
