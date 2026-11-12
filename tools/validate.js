/* 關卡驗證（Node）：印出每關地圖，檢查縫點距離、物件落點、關鍵路線該通／該擋。
   用法：node tools/validate.js [關卡 id] [--map] */
const fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global;
const root=path.join(__dirname,'..','js');
['core.js','world.js','levels1.js','levels2.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f}));
const PH=global.PH,W=PH.World;
const noop=()=>{};
PH.Dogs={hearAll:noop,smellAll:noop,onTheft:noop,spawnAt:noop,routes:noop,any:()=>false,reset:noop,exitSearch:noop,stun:noop};
PH.Seams={reset:noop};PH.Player={respawn:noop};PH.Boss=null;PH.Game={};
const only=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,showMap=process.argv.includes('--map');
let bad=0;
for(const id of PH.ORDER){
  if(only&&id!==only)continue;
  const def=PH.LEVELS[id];
  if(!def){console.log('!! 缺少關卡',id);bad++;continue;}
  PH.P={x:def.start.x,y:def.start.y,hidden:null,form:'normal',r:.3};
  let L=W.load(id);
  console.log('\n=== '+id+'　'+def.title+' '+def.name+'　'+L.w+'x'+L.h+' ===');
  if(showMap){
    const mark={};
    L.ents.forEach(e=>{if(e.x!=null&&e.t!=='light')mark[Math.floor(e.y)*L.w+Math.floor(e.x)]=e.t==='anchor'?'@':e.t==='box'?'B':e.t==='item'?'i':e.t==='ped'?'$':e.t==='sw'?'!':'*';});
    (def.dogs||[]).forEach(d=>{mark[Math.floor(d.y)*L.w+Math.floor(d.x)]='D';});
    console.log('     '+Array.from({length:L.w},(_,i)=>i%10).join(''));
    for(let r=0;r<L.h;r++){let s='';for(let c=0;c<L.w;c++){const i=r*L.w+c;s+=mark[i]&&L.base[i]!=='#'?mark[i]:L.base[i];}console.log(('  '+r).slice(-3)+'  '+s);}
  }
  const err=m=>{console.log('  ✗ '+m);bad++;};
  // 起點
  if(!W.fits(def.start.x,def.start.y,.3,'normal'))err('起點站不下');
  // 物件落點
  for(const e of L.ents){
    if(e.t==='anchor'){
      if(!W.fits(e.x,e.y,.3,'normal')&&!e.follow)err('縫點 '+e.id+' 落腳處站不下普通貓 ('+e.x+','+e.y+')');
      const p=L.E[e.pair];if(!p)err('縫點 '+e.id+' 找不到配對 '+e.pair);
      else if(!e.follow&&!p.follow){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d>PH.CFG.seam.maxDist+1e-6)err('縫點 '+e.id+'↔'+p.id+' 距離 '+d.toFixed(2)+' 超過上限');}
    }
    if((e.t==='box'||e.t==='item'||e.t==='toy'||e.t==='plant'||e.t==='exit')&&W.kind(Math.floor(e.x),Math.floor(e.y))==='solid')err(e.t+' '+(e.id||'')+' 在實心格裡 ('+e.x+','+e.y+')');
    if(e.t==='ped'){const fx=e.fx||e.x,fy=e.fy||e.y;if(!W.fits(fx,fy,.3,'normal'))err('罐台前方站不下');}
    if(e.t==='pipe'){[e.a,e.b].forEach(q=>{if(!W.fits(q[0],q[1],.28,'normal'))err('管線 '+e.id+' 端點站不下 ('+q+')');});}
    if(e.t==='push')e.slots.forEach(s=>{const k=L.leg[L.base[s[1]*L.w+s[0]]].k;if(k!=='floor')err('可推物 '+e.id+' 卡位不是地板 ('+s+')');});
    if(e.t==='gate')e.tiles.forEach(s=>{const k=L.leg[L.base[s[1]*L.w+s[0]]].k;if(k!=='floor')err('閘門 '+e.id+' 底下不是地板 ('+s+') '+k);});
    if(e.t==='mover')e.pts.forEach(q=>{const k=W.kind(Math.floor(q[0]),Math.floor(q[1]));if(k==='solid')err('浮台 '+e.id+' 路徑穿過實心格');});
  }
  for(const d of def.dogs||[]){
    const pts=[[d.x,d.y]].concat(d.route||[],d.route2||[]);
    pts.forEach(q=>{const k=L.leg[L.base[Math.floor(q[1])*L.w+Math.floor(q[0])]].k;if(k!=='floor'&&k!=='water'&&!(def.dogBoat&&k==='hazard'))err('狗 '+d.id+' 路線點不在地板上 ('+q[0]+','+q[1]+') '+k);});
  }
  // 路線檢查
  for(const c of def.checks||[]){
    L=W.load(id);
    for(const k in (c.slots||{})){L.E[k].slot=c.slots[k];}
    (c.flags||[]).forEach(f=>{if(f==='theft')L.theft=true;W.set(f);});
    W.rebuild();
    const seen=W.reach(c.from[0],c.from[1],c.form),ok=!!seen[Math.floor(c.to[1])*L.w+Math.floor(c.to[0])];
    const startOk=W.pass(c.form,Math.floor(c.from[0]),Math.floor(c.from[1]));
    if(!startOk)err(c.name+'：起點本身不可站');
    else if(ok!==c.expect)err(c.name+'：預期 '+(c.expect?'通':'擋')+'，實際 '+(ok?'通':'擋'));
    else console.log('  ✓ '+c.name);
  }
}
console.log(bad?'\n'+bad+' 個問題':'\n全部通過');
process.exit(bad?1:0);
