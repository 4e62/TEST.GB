const {run,T}=require('./bot');
const [slot,spd,cor]=[+process.argv[2],+process.argv[3],+process.argv[4]];
const N=+process.argv[5]||6,THR=+process.argv[6]||2.0;
const B=T.BIKES[slot];if(spd>0){B.spd=spd;B.cor=cor}
const out=[];
for(const st of [0,1,2,3]){
  const rs=[];for(let i=0;i<N;i++)rs.push(run({stage:st,bike:slot,thr:THR}));
  const fin=rs.filter(r=>r.rank>0);
  out.push(`s${st+1}: fin ${fin.length}/${N} T ${(fin.reduce((a,r)=>a+r.t,0)/Math.max(1,fin.length)).toFixed(1)} rk ${(fin.reduce((a,r)=>a+r.rank,0)/Math.max(1,fin.length)).toFixed(2)} hit ${(rs.reduce((a,r)=>a+r.obsHits,0)/N).toFixed(1)}`);
}
console.log(`thr ${THR} slot${slot} spd ${spd} cor ${cor} | `+out.join(' | '));
