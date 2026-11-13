/* 世界：格子地圖、碰撞、視線、尋路、機關、警戒與檢查點
   邏輯都在 2D 平面上（x 向東、y 向南），3D 只負責把狀態擺出來。 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,CFG=PH.CFG;
const W=PH.World={};
let L=null;

/* 圖例：k 種類、h 高度（擋視線與鏡頭）、lo 底部離地、m 模型、see 不擋視線 */
PH.LEGEND={
  '#':{k:'solid',h:3.2,m:'wall'},
  ' ':{k:'solid',h:3.2,m:'none'},
  '.':{k:'floor',h:0,fl:0},
  ',':{k:'floor',h:0,fl:1},
  'w':{k:'water',h:0,fl:2},
  '~':{k:'hazard',h:0,m:'none'},
  'C':{k:'solid',h:1.0,m:'block'},
  'c':{k:'gap',h:1.0,lo:0.34,m:'gapblock'},
  'T':{k:'gap',h:0.62,lo:0.5,m:'table'},
  'L':{k:'solid',h:0.55,m:'block'},
  'H':{k:'solid',h:2.2,m:'block'},
  'P':{k:'solid',h:0.8,m:'block'},
  '=':{k:'pipe',h:0.3,m:'grate',see:1},
  '%':{k:'shade',h:1.2,m:'fence',see:1},
  'o':{k:'solid',h:3,m:'pillar'}
};
const TYPES=['box','anchor','ped','sw','push','plate','pipe','towel','soap','toy','knock','item','light','mover','wind','plant','shy','gate','zone','exit','bell','door','chute'];

function buildGrid(def){
  const w=def.size[0],h=def.size[1],g=new Array(w*h).fill(def.fill||'#');
  for(const o of def.ops){
    const ch=o[0];
    if(o[1]==='o'){for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(Math.hypot(x+.5-o[2],y+.5-o[3])<=o[4])g[y*w+x]=ch;}
    else for(let y=o[2];y<=o[4];y++)for(let x=o[1];x<=o[3];x++)if(x>=0&&y>=0&&x<w&&y<h)g[y*w+x]=ch;
  }
  return g;
}
function resetEnt(e){
  switch(e.t){
    case 'anchor':e.found=!!e.found0;e.known=false;e.link=false;e.sealUntil=0;e.sealing=0;e.wipedUntil=0;e.marked=false;break;
    case 'push':{if(e.slot==null)e.slot=0;const s=e.slots[e.slot];e.px=s[0]+.5;e.py=s[1]+.5;e.anim=0;break;}
    case 'toy':e.x=e.x0;e.y=e.y0;e.vx=e.vy=0;e.rolling=false;break;
    case 'mover':e.u=0;e.dir=1;e.state='wait';e.timer=e.wait*0.5;e.x=e.pts[0][0];e.y=e.pts[0][1];e.dx=e.dy=0;break;
    case 'towel':case 'knock':e.fall=0;break;
    case 'soap':case 'bell':e.cd=0;break;
    case 'shy':e.tt=0;e.openT=0;break;
    case 'light':e.sx=e.pts[0][0];e.sy=e.pts[0][1];e.active=false;break;
  }
}
function addEnt(d){
  const e=Object.assign({},d);
  if(e.t==='toy'){e.x0=e.x;e.y0=e.y;}
  if(e.t==='mover'){
    e.seg=[];e.len=0;
    for(let i=1;i<e.pts.length;i++){const l=Math.hypot(e.pts[i][0]-e.pts[i-1][0],e.pts[i][1]-e.pts[i-1][1]);e.seg.push(l);e.len+=l;}
    e.r=e.r||0.6;e.wait=e.wait==null?2.4:e.wait;e.speed=e.speed||1.5;
  }
  if(e.t==='light'&&!e.pts)e.pts=[[e.x,e.y],[e.x,e.y]];
  L.ents.push(e);if(e.id)L.E[e.id]=e;L.by[e.t].push(e);resetEnt(e);
  return e;
}
function moverPos(m,u){
  for(let i=0;i<m.seg.length;i++){
    if(u<=m.seg[i]||i===m.seg.length-1){const t=m.seg[i]?Math.min(1,u/m.seg[i]):0,a=m.pts[i],b=m.pts[i+1];return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t};}
    u-=m.seg[i];
  }
  return {x:m.pts[0][0],y:m.pts[0][1]};
}

/* ---------- 載入 ---------- */
W.load=function(id){
  const def=PH.LEVELS[id];
  L=PH.L={id:id,def:def,w:def.size[0],h:def.size[1],t:0,f:{},T:{},alert:0,theft:false,can:null,crumbs:[],
    ents:[],E:{},by:{},dogs:[],amb:{loud:false},spotT:0,rev:0,cp:null,lastNoise:null,
    stats:{time:0,detected:0,caught:0,falls:0,forms:{},extreme:0,seams:0,stuns:0,hides:0,faults:0}};
  TYPES.forEach(function(t){L.by[t]=[];});
  L.leg=Object.assign({},PH.LEGEND,def.legend||{});
  L.base=buildGrid(def);L.dyn=new Array(L.w*L.h);
  L.shade=new Uint8Array(L.w*L.h);
  (def.shade||[]).forEach(function(r){for(let y=r[1];y<=r[3];y++)for(let x=r[0];x<=r[2];x++)L.shade[y*L.w+x]=1;});
  for(let i=0;i<L.base.length;i++)if(L.leg[L.base[i]].k==='shade')L.shade[i]=1;
  (def.ents||[]).forEach(addEnt);
  if(def.init)def.init(L);
  L.by.gate.forEach(evalGate);
  W.rebuild();
  return L;
};
W.addEnt=function(d){return addEnt(d);};

/* ---------- 動態地形：閘門、可推物、關卡自訂 ---------- */
function evalGate(g){
  let c=!!g.base;
  if(g.open)c=!L.f[g.open];
  if(g.close&&L.f[g.close])c=true;
  g.warn=false;
  if(g.cycle&&(!g.cycle.on||L.f[g.cycle.on])&&!(g.cycle.off&&L.f[g.cycle.off])){
    const cy=g.cycle,ph=(L.t+(cy.phase||0))%cy.period;
    c=!(ph>=cy.from&&ph<cy.to);g.warn=!c&&ph>cy.to-1.3;
  }
  g.closed=c;
}
W.rebuild=function(){
  L.dyn.fill(undefined);
  const set=function(c,r,k,h,lo,dp){if(c>=0&&r>=0&&c<L.w&&r<L.h)L.dyn[r*L.w+c]={k:k,h:h||0,lo:lo||0,dp:!!dp};};
  if(L.def.dyn)L.def.dyn(L,set);
  for(const g of L.by.gate)if(g.closed)for(const q of g.tiles)set(q[0],q[1],g.k||'solid',g.h==null?1.4:g.h,g.lo||0,g.dp);
  for(const p of L.by.push){const s=p.slots[p.slot];set(s[0],s[1],'solid',p.h||1.0);}
  L.rev++;
};
W.set=function(k,v){
  v=v===undefined?true:!!v;
  if(!!L.f[k]===v)return false;
  L.f[k]=v;
  for(const g of L.by.gate){const was=g.closed;evalGate(g);if(was!==g.closed)onGate(g);}
  W.rebuild();
  if(L.def.onFlag)L.def.onFlag(L,k,v);
  return true;
};
function onGate(g){
  const P=PH.P;
  if(!P||!g.closed)return;
  // 門關上時貓剛好站在裡面：推到最近的合法位置，不把貓夾在物件裡
  for(const q of g.tiles)if(Math.floor(P.x)===q[0]&&Math.floor(P.y)===q[1]&&!P.hidden)L.T.unstick=1;
}

/* ---------- 查詢 ---------- */
W.kind=function(c,r){
  if(c<0||r<0||c>=L.w||r>=L.h)return 'solid';
  const d=L.dyn[r*L.w+c];return d?d.k:L.leg[L.base[r*L.w+c]].k;
};
// 擋視線的高度
W.hgt=function(c,r){
  if(c<0||r<0||c>=L.w||r>=L.h)return 9;
  const d=L.dyn[r*L.w+c];if(d)return d.h;
  const g=L.leg[L.base[r*L.w+c]];return g.see?0:g.h;
};
// 鏡頭碰撞用：[底, 頂]
W.camBox=function(c,r){
  if(c<0||r<0||c>=L.w||r>=L.h)return [0,9];
  const d=L.dyn[r*L.w+c];if(d)return d.h>0?[d.lo||0,d.h]:null;
  const g=L.leg[L.base[r*L.w+c]];if(!g.h||g.m==='fence'||g.m==='grate')return null;
  return [g.lo||0,g.h];
};
W.isShade=function(c,r){return c>=0&&r>=0&&c<L.w&&r<L.h&&L.shade[r*L.w+c]===1;};
W.pass=function(form,c,r){
  const k=W.kind(c,r);
  if(form==='shadow')return k!=='solid'&&k!=='gap'&&k!=='pipe'&&k!=='hazard'&&W.isShade(c,r);
  if(k==='floor'||k==='water'||k==='hazard')return true;
  if(k==='gap')return form==='mini';
  if(k==='pipe')return form==='liquid';
  return false;
};
// 圓形對方格：只有真的碰到格子才算擋住，轉角不會被方框的角勾住
W.fits=function(x,y,r,form){
  const c0=Math.floor(x-r),c1=Math.floor(x+r),r0=Math.floor(y-r),r1=Math.floor(y+r),r2=r*r;
  for(let rr=r0;rr<=r1;rr++)for(let cc=c0;cc<=c1;cc++){
    if(W.pass(form,cc,rr))continue;
    const dx=x-U.clamp(x,cc,cc+1),dy=y-U.clamp(y,rr,rr+1);
    if(dx*dx+dy*dy<r2)return false;
  }
  return true;
};
// 腳下是不是穩固的地面（不是湯、海、縫隙），用來記錄落水後的重生點
W.ground=function(x,y,r){
  const c0=Math.floor(x-r),c1=Math.floor(x+r),r0=Math.floor(y-r),r1=Math.floor(y+r);
  for(let rr=r0;rr<=r1;rr++)for(let cc=c0;cc<=c1;cc++){const k=W.kind(cc,rr);if(k!=='floor'&&k!=='water')return false;}
  return true;
};
// 在附近找一個站得下的位置；找不到就回傳 null
W.findFit=function(x,y,form,maxR){
  const r=PH.FORMS[form].r;maxR=maxR||1.2;
  if(W.fits(x,y,r,form)&&(form==='shadow'||W.kind(Math.floor(x),Math.floor(y))!=='hazard'))return {x:x,y:y};
  for(let d=0.1;d<=maxR;d+=0.1)for(let a=0;a<16;a++){
    const px=x+Math.cos(a*0.3927)*d,py=y+Math.sin(a*0.3927)*d;
    if(W.fits(px,py,r,form)&&W.kind(Math.floor(px),Math.floor(py))!=='hazard')return {x:px,y:py};
  }
  return null;
};
// 全圖找最近的合法落腳點（能量耗盡、門關上時的保底）
W.nearest=function(x,y,form){
  const q=W.findFit(x,y,form,1.6);if(q)return q;
  const r=PH.FORMS[form].r;let best=null,bd=1e9;
  for(let rr=0;rr<L.h;rr++)for(let cc=0;cc<L.w;cc++){
    const k=W.kind(cc,rr);if(k!=='floor'&&k!=='water')continue;
    const px=cc+.5,py=rr+.5;if(!W.fits(px,py,r,form))continue;
    const d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best={x:px,y:py};}
  }
  return best||{x:x,y:y};
};
W.los=function(x0,y0,x1,y1,minH){
  minH=minH||0.5;
  const dx=x1-x0,dy=y1-y0,n=Math.ceil(Math.hypot(dx,dy)/0.2);
  for(let i=1;i<n;i++){const t=i/n;if(W.hgt(Math.floor(x0+dx*t),Math.floor(y0+dy*t))>=minH)return false;}
  return true;
};
W.dogPass=function(c,r){
  if(c<0||r<0||c>=L.w||r>=L.h)return false;
  const d=L.dyn[r*L.w+c];if(d&&d.dp)return true;
  const k=d?d.k:L.leg[L.base[r*L.w+c]].k;
  return k==='floor'||k==='water'||(k==='hazard'&&!!L.def.dogBoat&&L.theft);
};
// BFS：回傳走到「到得了、且離目標最近」那一格的路徑
W.path=function(sx,sy,tx,ty,passFn){
  passFn=passFn||W.dogPass;
  const w=L.w,N=w*L.h,sc=Math.floor(sx),sr=Math.floor(sy);
  const prev=new Int32Array(N),seen=new Uint8Array(N),q=[sr*w+sc];
  let head=0,best=q[0],bd=1e9;seen[q[0]]=1;prev[q[0]]=-1;
  const DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1];
  while(head<q.length){
    const cur=q[head++],c=cur%w,r=(cur-c)/w,d=Math.hypot(c+.5-tx,r+.5-ty);
    if(d<bd){bd=d;best=cur;}
    for(let i=0;i<8;i++){
      const nc=c+DX[i],nr=r+DY[i];
      if(nc<0||nr<0||nc>=w||nr>=L.h||!passFn(nc,nr))continue;
      if(i>3&&(!passFn(c+DX[i],r)||!passFn(c,r+DY[i])))continue;
      const ni=nr*w+nc;if(seen[ni])continue;seen[ni]=1;prev[ni]=cur;q.push(ni);
    }
  }
  const out=[];
  for(let k=best;k!==-1&&prev[k]!==-1;k=prev[k]){const kc=k%w;out.unshift({x:kc+.5,y:(k-kc)/w+.5});}
  out.reach=bd<0.8;
  return out;
};
// 驗證用：某形態從 (x,y) 走得到哪些格子
W.reach=function(x,y,form){
  const w=L.w,seen=new Uint8Array(w*L.h),q=[Math.floor(y)*w+Math.floor(x)];seen[q[0]]=1;let head=0;
  while(head<q.length){
    const cur=q[head++],c=cur%w,r=(cur-c)/w;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
      const nc=c+d[0],nr=r+d[1];if(nc<0||nr<0||nc>=w||nr>=L.h)return;
      const ni=nr*w+nc;if(seen[ni])return;
      const k=W.kind(nc,nr);if(k==='hazard'||!W.pass(form,nc,nr))return;
      seen[ni]=1;q.push(ni);
    });
  }
  return seen;
};
W.moverAt=function(x,y){
  for(const m of L.by.mover)if(m.present&&Math.hypot(x-m.x,y-m.y)<=m.r+0.05)return m;
  return null;
};
// 這個點有沒有被光照到（聚光燈、貴賓的燈、BOSS 掃射）
W.lit=function(x,y){
  for(const l of L.by.light)if(l.active&&Math.hypot(x-l.sx,y-l.sy)<l.r&&W.los(l.mx,l.my,x,y,1.5))return l;
  for(const d of L.dogs){
    if(!d.active||!d.K.lamp||d.stunT>0||d.state==='sleep')continue;
    const dd=Math.hypot(x-d.x,y-d.y);
    if(dd<6.5&&dd>0.1&&Math.abs(U.angd(d.ang,Math.atan2(y-d.y,x-d.x)))<0.45&&W.los(d.x,d.y,x,y,1.5))return d;
  }
  if(PH.Boss&&PH.Boss.lit(x,y))return PH.Boss;
  return null;
};
W.finishBox=function(){for(const b of L.by.box)if(b.finish)return b;return L.by.box[0];};
W.anchorOn=function(a){return (!a.on||!!L.f[a.on])&&!(a.off&&L.f[a.off]);};

/* ---------- 聲音、氣味、通報：只給「事件位置」，不給貓的即時座標 ---------- */
W.noise=function(x,y,rad,kind){
  if(L.amb.loud&&kind!=='burp'&&kind!=='echo'&&kind!=='alarm')rad*=0.4;
  if(rad<0.3)return;
  if(kind!=='step')PH.FX.ring(x,y,rad,kind);
  L.lastNoise={x:x,y:y,t:L.t,kind:kind};
  PH.Dogs.hearAll(x,y,rad,kind);
  if(PH.Boss)PH.Boss.hear(x,y,rad,kind);
};
W.scentPulse=function(x,y){
  PH.FX.ring(x,y,6,'scent');PH.AU.play('scent');
  PH.Dogs.smellAll(x,y);
  if(PH.Boss)PH.Boss.hear(x,y,99,'scent');
};
W.report=function(x,y){PH.Dogs.hearAll(x,y,14,'alarm');};
W.kick=function(b,dx,dy){b.vx=dx*6.5;b.vy=dy*6.5;b.rolling=true;PH.AU.play('kick');};

/* ---------- 警戒 ---------- */
W.setAlert=function(n,msg){
  const mx=L.def.maxAlert==null?4:L.def.maxAlert;
  if(n>mx||n<=L.alert)return false;
  L.alert=n;if(msg)PH.UI.say(msg,5.5);PH.AU.play('alarm');return true;
};
W.theft=function(ped){
  const P=PH.P,def=L.def;
  if(L.theft)return;
  L.theft=true;ped.taken=true;P.hasCan=true;
  L.T.burp=CFG.burp.every;L.T.scent=CFG.scent.every;
  W.set('theft');
  W.setAlert(1,def.theftMsg||'底座空了！附近的狗會過來查看。');
  PH.Dogs.onTheft(ped);
  if(def.onTheft)def.onTheft(L);
  const cp=def.cpTheft||[ped.fx||ped.x,ped.fy||ped.y];
  W.checkpoint('theft',cp[0],cp[1]);
  PH.AU.play('take');PH.AU.mood('escape');
};
W.lockdown=function(){
  if(!W.setAlert(2,L.def.lockMsg||'秩序局廣播：罐罐失竊！三秒後封鎖部分通道。'))return;
  L.T.lock=3;
};
W.reinforce=function(){
  if(!L.theft||!W.setAlert(3,'警報成功，增援要從側門進來了！'))return;
  L.T.reinf=2.5;L.T.calm=0;
};

/* ---------- 檢查點：以快照一致還原 ---------- */
W.checkpoint=function(name,x,y){
  const P=PH.P;
  L.cp={name:name,x:x,y:y,f:Object.assign({},L.f),alert:Math.min(L.alert,2),theft:L.theft,T:Object.assign({},L.T),
    ents:L.ents.map(function(e){return {taken:e.taken,slot:e.slot,used:e.used,done:e.done};}),
    P:{hasCan:P.hasCan||!!L.can,item:P.item,tickets:P.tickets},
    dogs:L.dogs.map(function(d){return d.active;}),
    boss:PH.Boss&&PH.Boss.snap?PH.Boss.snap():null};
};
W.restore=function(){
  const c=L.cp;
  L.f=Object.assign({},c.f);L.alert=c.alert;L.theft=c.theft;L.T=Object.assign({},c.T);L.T.chase=0;L.T.confirm=0;
  L.can=null;L.crumbs=[];L.spotT=0;
  L.ents.forEach(function(e,i){const s=c.ents[i];if(!s)return;e.taken=s.taken;e.slot=s.slot;e.used=s.used;e.done=s.done;resetEnt(e);});
  L.by.gate.forEach(evalGate);
  PH.Seams.reset();
  W.rebuild();
  PH.Player.respawn(c.x,c.y,c.P);
  PH.Dogs.reset(c.dogs);
  if(PH.Boss&&c.boss)PH.Boss.restore(c.boss);
  if(L.def.onRestore)L.def.onRestore(L);
};

/* ---------- 每幀更新 ---------- */
function updMover(m,dt){
  const act=(!m.on||L.f[m.on])&&!(m.off&&L.f[m.off]);
  m.present=act||!!m.park;m.dx=m.dy=0;
  if(!act)return;
  if(m.state==='wait'){m.timer-=dt;if(m.timer<=0)m.state='move';return;}
  const ox=m.x,oy=m.y;m.u+=m.dir*m.speed*dt;
  if(m.u>=m.len){m.u=m.len;m.dir=-1;m.state='wait';m.timer=m.wait;}
  else if(m.u<=0){m.u=0;m.dir=1;m.state='wait';m.timer=m.wait;}
  const p=moverPos(m,m.u);m.x=p.x;m.y=p.y;m.dx=m.x-ox;m.dy=m.y-oy;
}
function updLight(l){
  let a=(!l.on||L.f[l.on])&&!(l.off&&L.f[l.off]);
  l.warn=false;
  if(a&&l.blink){const tot=l.blink.on+l.blink.off,ph=(L.t+(l.blink.phase||0))%tot;a=ph<l.blink.on;l.warn=!a&&ph>tot-1;}
  l.active=a;
  let k=0;
  if(l.period){k=((L.t+(l.phase||0))%l.period)/l.period;k=k<0.5?k*2:2-k*2;k=k*k*(3-2*k);}
  l.sx=U.lerp(l.pts[0][0],l.pts[1][0],k);l.sy=U.lerp(l.pts[0][1],l.pts[1][1],k);
}
function updToys(dt){
  for(const b of L.by.toy){
    if(!b.rolling)continue;
    const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt,k=W.kind(Math.floor(nx),Math.floor(ny));
    if(k==='floor'||k==='water'){b.x=nx;b.y=ny;}else{b.vx=-b.vx*0.3;b.vy=-b.vy*0.3;}
    const f=Math.pow(0.22,dt);b.vx*=f;b.vy*=f;
    if(Math.hypot(b.vx,b.vy)<0.5){b.rolling=false;b.vx=b.vy=0;PH.AU.play('squeak');W.noise(b.x,b.y,7.5,'toy');}
  }
}
function updTraps(dt){
  const P=PH.P;
  for(const tw of L.by.towel)if(tw.fall>0){
    tw.fall-=dt;
    if(tw.fall<=0){
      tw.used=true;let hit=false;
      for(const d of L.dogs)if(d.active&&U.dist(d.x,d.y,tw.dx,tw.dy)<1.35){if(PH.Dogs.stun(d,'towel',5.5))hit=true;}
      PH.AU.play('thud');PH.FX.poof(tw.dx,tw.dy,10,'#ff5fa2');
      if(!hit){W.noise(tw.dx,tw.dy,4,'thud');PH.UI.say('毛巾掉在地上，沒蓋到狗。',3);}
    }
  }
  for(const k of L.by.knock)if(k.fall>0){k.fall-=dt;if(k.fall<=0){PH.AU.play('thud');W.noise(k.fx,k.fy,7.5,'knock');}}
  for(const s of L.by.soap){
    s.cd=Math.max(0,s.cd-dt);if(s.cd>0)continue;
    for(const d of L.dogs)if(d.active&&(d.state==='chase'||d.state==='pounce')&&U.dist(d.x,d.y,s.x,s.y)<0.7&&PH.Dogs.stun(d,'slip',4.5)){
      d.slide={x:s.bx,y:s.by};s.cd=6;PH.AU.play('slip');PH.FX.text(d.x,d.y,'滑——！','#7fd0e6');
    }
    if(s.cd<=0&&P.moving&&!P.hidden&&P.form!=='shadow'&&P.form!=='liquid'&&U.dist(P.x,P.y,s.x,s.y)<0.42){P.slip=0.7;s.cd=3;PH.AU.play('slip');PH.UI.once('soap','肥皂會讓衝過來的狗滑進籃子——貓踩到也會滑。');}
  }
  for(const b of L.by.bell){
    b.cd=Math.max(0,b.cd-dt);
    if(b.cd<=0&&P.moving&&!P.sneak&&!P.hidden&&P.form!=='shadow'&&U.dist(P.x,P.y,b.x,b.y)<0.5){
      b.cd=2;PH.AU.play('bell');PH.FX.text(b.x,b.y,'叮鈴！','#ffd23f');W.noise(b.x,b.y,6.5,'bell');
      PH.UI.once('bell','硬幣鈴鐺！按住 Shift 輕腳走過去就不會響。');
    }
  }
}
function updZones(){
  const P=PH.P,def=L.def;
  for(const z of L.by.zone){
    if(z.done&&z.once!==false)continue;
    if(z.need&&!L.f[z.need])continue;
    if(z.not&&L.f[z.not])continue;
    if(P.hidden||!U.inRect(P.x,P.y,z.rect))continue;
    z.done=true;
    if(z.flag)W.set(z.flag);
    if(z.say)PH.UI.say(z.say,5.5);
    if(z.fn&&def[z.fn])def[z.fn](L,z);
    if(z.cp)W.checkpoint(z.cp[0],z.cp[1],z.cp[2]);
  }
  for(const p of L.by.plate){
    if(p.done)continue;
    if(p.need&&!L.f[p.need])continue;
    let on=false;
    if(p.by==='dog'){for(const d of L.dogs)if(d.active&&U.dist(d.x,d.y,p.x,p.y)<(p.r||0.8))on=true;}
    else on=!P.hidden&&P.form===(p.form||'giant')&&U.dist(P.x,P.y,p.x,p.y)<(p.r||1.0);
    if(on){p.done=true;PH.AU.play('clunk');PH.FX.shake(4);PH.FX.poof(p.x,p.y,10,'#ffd23f');W.set(p.flag);if(p.say)PH.UI.say(p.say,5);}
  }
}
function updWind(){
  const P=PH.P;
  for(const w of L.by.wind){
    const ph=(L.t+(w.phase||0))%w.period,ok=!L.T.captAwake&&(!w.on||L.f[w.on]);
    w.blow=ok&&ph<w.dur;w.warn=ok&&!w.blow&&ph>w.period-1.4;
    if(w.blow&&P.form==='mini'&&!P.fly&&!P.hidden&&U.dist(P.x,P.y,w.from[0],w.from[1])<0.75){
      P.fly={x0:P.x,y0:P.y,x1:w.to[0],y1:w.to[1],t:0,dur:1.6,h:1.4};PH.AU.play('whoosh');
      PH.UI.once('wind','迷你貓搭上泡泡，順著呼嚕風飄過去了！');
    }
  }
}
function updShy(dt){
  const P=PH.P,S=PH.S;
  for(const s of L.by.shy){
    const inz=!P.hidden&&U.inRect(P.x,P.y,s.zone);
    const away=(Math.cos(S.yaw)*s.dir[0]+Math.sin(S.yaw)*s.dir[1])<-0.25&&(Math.cos(P.face)*s.dir[0]+Math.sin(P.face)*s.dir[1])<-0.25;
    if(inz&&!L.f[s.flag]){
      if(away){s.tt+=dt;if(s.tt>=(s.time||2)){s.tt=0;s.openT=8;W.set(s.flag,true);PH.AU.play('door');PH.UI.say('害羞門趁你沒看的時候，悄悄打開了。',4);}}
      else{s.tt=Math.max(0,s.tt-dt*2);PH.UI.once('shy','害羞門被盯著就不敢開。背對它站一下（鏡頭也要轉開）。',6);}
    }else if(!inz)s.tt=0;
    if(L.f[s.flag]){
      s.openT-=dt;
      const c=Math.floor(P.x),r=Math.floor(P.y);let inDoor=false;
      for(const q of s.tiles)if(q[0]===c&&q[1]===r)inDoor=true;
      if(s.openT<=0&&!inDoor&&!inz)W.set(s.flag,false);
    }
  }
}
function updLightDetect(dt){
  const P=PH.P;
  const vis=P.grace<=0&&(!P.hidden||(P.hidden.t==='plant'&&P.moving))&&P.form!=='shadow'&&!P.warp&&!P.pipe;
  let l=null;
  if(vis)for(const q of L.by.light)if(q.active&&q.detect!==false&&Math.hypot(P.x-q.sx,P.y-q.sy)<q.r&&W.los(q.mx,q.my,P.x,P.y,1.5)){l=q;break;}
  if(l){
    L.spotT+=dt;
    if(L.spotT>0.5){
      L.spotT=-2;L.stats.detected++;
      PH.UI.say('被探照燈照到了！狗會過來查看這個位置。',4);PH.AU.play('alarm');PH.FX.flash('#fff6c0');
      W.report(P.x,P.y);if(L.theft)L.T.confirm=1;
    }
  }else if(L.spotT>0)L.spotT=Math.max(0,L.spotT-dt*2);else L.spotT=Math.min(0,L.spotT+dt);
}
// 罐罐麻煩：打嗝、超香、夢遊
function updCan(dt){
  const P=PH.P,tr=L.def.trouble;
  if(!L.theft||!tr)return;
  const c=L.can||(P.hasCan?P:null);if(!c)return;
  if(tr==='burp'){
    L.T.burp-=dt;
    if(L.T.burp<CFG.burp.warn&&P.hasCan&&!P.moving){
      L.T.still=(L.T.still||0)+dt;
      if(L.T.still>=CFG.burp.soothe){L.T.burp=CFG.burp.every*0.85;L.T.still=0;PH.AU.play('purr');PH.FX.text(P.x,P.y,'乖～','#8fc3b4');PH.UI.once('soothed','安撫成功，打嗝延後了。也可以停下來長按互動，把罐罐放下，故意讓它在別處出聲。',6);}
    }else L.T.still=0;
    if(L.T.burp<=0){
      L.T.burp=CFG.burp.every;PH.AU.play('burp');PH.FX.text(c.x,c.y,'嗝！','#ffd23f');
      W.noise(c.x,c.y,CFG.burp.rad,'burp');
      PH.UI.once('burp','罐罐打嗝了！看到預告時停下來不動，就能安撫它。',6);
    }
  }else if(tr==='scent'){
    L.T.scent-=dt;
    if(L.T.scent<=0){L.T.scent=CFG.scent.every;W.scentPulse(c.x,c.y);PH.UI.once('scent','超香罐每隔幾秒飄一次香。狗只會查「剛剛飄香的位置」；走過淺水可以洗掉地上的氣味。',7);}
    if(P.hasCan&&!P.hidden){
      if(W.kind(Math.floor(P.x),Math.floor(P.y))==='water'){L.T.wet=1.5;L.crumbs.length=0;}
      else{
        L.T.wet=Math.max(0,(L.T.wet||0)-dt);
        const last=L.crumbs[L.crumbs.length-1];
        if(!L.T.wet&&(!last||U.dist(last.x,last.y,P.x,P.y)>1)){L.crumbs.push({x:P.x,y:P.y,t:L.t});if(L.crumbs.length>36)L.crumbs.shift();}
      }
    }
    while(L.crumbs.length&&L.t-L.crumbs[0].t>26)L.crumbs.shift();
  }else if(tr==='walk'&&L.can){
    // 夢遊罐：放下後短距離亂走，但不會走到拿不回來的地方
    const k=L.can;k.wt=(k.wt||0)-dt;
    if(k.wt<=0){k.wt=U.rand(1,2.2);const a=Math.random()*6.283;k.vx=Math.cos(a)*0.9;k.vy=Math.sin(a)*0.9;}
    const nx=k.x+k.vx*dt,ny=k.y+k.vy*dt;
    if(W.ground(nx,ny,0.3)&&U.dist(nx,ny,k.hx,k.hy)<2.6){k.x=nx;k.y=ny;}else k.wt=0;
  }
}
function updAlert(dt){
  const P=PH.P,def=L.def,D=PH.Dogs;
  if(L.T.lock>0){L.T.lock-=dt;if(L.T.lock<=0){W.set('lockdown');D.spawnAt('lockdown');D.routes();PH.AU.play('clunk');PH.FX.shake(5);}}
  if(L.T.reinf>0){L.T.reinf-=dt;if(L.T.reinf<=0)D.spawnAt('reinforce');}
  if(!L.theft)return;
  if(L.alert<2&&(P.hasCan||L.can)){
    const p=L.E[def.ped||'ped'],c=L.can||P;
    if((p&&U.dist(c.x,c.y,p.x,p.y)>(def.coreR||4.5))||L.T.confirm)W.lockdown();
  }
  const hot=D.any(['chase','pounce','bark']);
  if(hot){L.T.chase=(L.T.chase||0)+dt;if(L.T.chase>7&&L.alert>=2)W.reinforce();}
  if(L.alert===3){
    if(!hot&&!D.any(['search','inv'])){L.T.calm=(L.T.calm||0)+dt;if(L.T.calm>CFG.dog.calm){L.alert=2;L.T.calm=0;L.T.chase=0;PH.UI.say('風頭稍微過去了。但已經封住的路不會恢復。',4);}}
    else L.T.calm=0;
  }
  if(L.alert>=2&&def.exitRoute&&!L.T.exit4&&L.f.lockdown){
    const fb=W.finishBox();
    if(U.dist(P.x,P.y,fb.x,fb.y)<(def.exitR||7)&&W.setAlert(4,'出口區域開始搜查！可以用聲音或玩具把牠引開。')){L.T.exit4=1;D.exitSearch();}
  }
}
W.update=function(dt){
  const P=PH.P,def=L.def;
  L.t+=dt;L.stats.time+=dt;
  if(def.ambient){const ph=L.t%def.ambient.period;L.amb.loud=ph<def.ambient.on;L.amb.warn=!L.amb.loud&&ph>def.ambient.period-1.5;}
  for(const m of L.by.mover)updMover(m,dt);
  for(const l of L.by.light)updLight(l);
  let ch=false;
  for(const g of L.by.gate){const was=g.closed;evalGate(g);if(was!==g.closed){ch=true;onGate(g);}}
  if(ch)W.rebuild();
  if(L.T.unstick){L.T.unstick=0;if(!W.fits(P.x,P.y,P.r,P.form)){const q=W.nearest(P.x,P.y,P.form);P.x=q.x;P.y=q.y;P.vx=P.vy=0;}}
  for(const p of L.by.push)if(p.anim>0){
    p.anim=Math.max(0,p.anim-dt/0.8);const s=p.slots[p.slot],k=1-p.anim;
    p.px=U.lerp(p.fx0,s[0]+.5,k);p.py=U.lerp(p.fy0,s[1]+.5,k);
  }
  for(const a of L.by.anchor){
    if(a.follow){const p=L.E[a.follow[0]];a.x=p.px+a.follow[1];a.y=p.py+a.follow[2];}
    if(a.sealUntil&&L.t>a.sealUntil)a.sealUntil=0;
    if(a.wipedUntil&&L.t>a.wipedUntil)a.wipedUntil=0;
  }
  updToys(dt);updTraps(dt);updZones();updWind();updShy(dt);updLightDetect(dt);updCan(dt);updAlert(dt);
  if(def.update)def.update(L,dt);
};
// 推動可推物到下一個卡位
W.push=function(p){
  const n=p.slots.length,to=n===2?1-p.slot:Math.min(n-1,p.slot+1);
  if(to===p.slot)return false;
  const s=p.slots[to];
  for(const d of L.dogs)if(d.active&&Math.floor(d.x)===s[0]&&Math.floor(d.y)===s[1])return false;
  p.fx0=p.px;p.fy0=p.py;p.slot=to;p.anim=1;
  W.rebuild();
  PH.AU.play('push');PH.FX.shake(3);
  W.noise(p.px,p.py,p.form==='giant'?6:3.5,'push');
  if(p.flags&&p.flags[to])W.set(p.flags[to]);
  if(p.unflag)for(const k in p.unflag)if(+k!==to)W.set(p.unflag[k],false);
  return true;
};
})();
