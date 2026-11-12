/* 最終 BOSS：月亮總督・旺德爾
   不用爪子扣血，而是引導牠自己解除三道月蓋鎖。每招都有預告、破解方式與恢復窗口。 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,CFG=PH.CFG,W=PH.World;
const B=PH.Boss={active:false,gfx:[],locks:[false,false,false],phase:0};
let C=null;
const say=function(t,d){PH.UI.say(t,d||5);};
function am(){return PH.opt.assist?CFG.boss.assistMul:1;}

function clear(){
  Object.assign(B,{state:'intro',timer:2.4,move:'',moveCd:3.5,moveN:0,faults:0,known:null,sound:null,seenT:9,contact:0,
    tgt:null,dash:null,band:-1,bandT:0,bandOrd:[0,1,2,3],frostT:0,frostAt:0,coldT:0,coldCd:0,projCd:0,ringA:0,lap:0,onRing:false,
    pedals:[0,0,0],restT:0,blind:false,plateA:0,tapeCd:8,shockN:0,shockOff:0,hist:[],histT:0,yield:false,tailA:0,sweepA:0});
  B.gfx.length=0;
}
B.snap=function(){return {on:B.active,phase:B.phase,locks:B.locks.slice()};};
B.restore=function(s){
  B.active=!!s.on;B.phase=s.phase||0;B.locks=(s.locks||[false,false,false]).slice();
  if(!B.active){B.gfx.length=0;return;}
  C=PH.L.def.boss;clear();B.x=C.start[0];B.y=C.start[1];B.ang=Math.PI/2;
  PH.AU.mood('boss');
};
B.reset=function(){B.active=false;B.phase=0;B.locks=[false,false,false];B.gfx.length=0;};

/* ---------- 開戰與階段 ---------- */
B.start=function(){
  const L=PH.L;if(B.active)return;
  C=L.def.boss;B.active=true;B.locks=[false,false,false];
  for(const d of L.dogs)d.active=false;           // 外圈的狗留在外面；場內小兵最多一隻
  PH.Seams.reset();
  W.set('bossOn');
  PH.AU.mood('boss');PH.FX.shake(8);
  say('月亮總督・旺德爾降下了禁罐罩！牠不會受傷——要引導牠自己解開三道月蓋鎖。',8);
  startPhase(1);
};
function startPhase(n){
  const L=PH.L;
  B.phase=n;clear();B.x=C.start[0];B.y=C.start[1];B.ang=Math.PI/2;
  ['fish','ringrun','lever1ready','lever2ready'].forEach(function(k){W.set(k,false);});
  W.set('p'+n);
  for(const d of L.dogs)if(d.id==='minion')d.active=false;
  if(n===3)PH.Dogs.spawnAt('p3');
  W.checkpoint('boss'+n,C.safe[0],C.safe[1]);
  PH.AU.play('roar');
  if(n===1)PH.UI.once('b1','第一階段：站在西側反光板前的誘導線上讓總督看到你。牠壓低身體時，地上的箭頭就是衝刺路線——最後一刻往旁邊閃或鑽貓縫。',12);
  if(n===2)say('第二階段：北側尾巴機關開放。新招：探照掃射（禁止影子穿越被照亮的區塊）與尾巴橫掃（退到弧外或躲矮掩體）。',9);
  if(n===3)say('第三階段：總督護盾亮起。用迷你、液體、巨大三種形態接通場內冷卻，再讓結霜的牠撞上中央卡榫。',9);
}
B.onLock=function(n){
  const L=PH.L;
  B.locks[n-1]=true;PH.AU.play('unlock');PH.AU.note(n+1);PH.FX.shake(7);PH.FX.flash('#fff2c4');
  if(n<3){say('第 '+n+' 道月蓋鎖解開了！',4);startPhase(n+1);}
  else{
    W.set('locks3');B.yield=true;B.state='yield';B.gfx.length=0;B.coldT=0;
    for(const d of L.dogs)d.active=false;
    PH.AU.mood('calm');
    say('三道月蓋鎖全部解開！到北側的主罐台抱起宇宙第一罐。',8);
  }
};

/* ---------- 給其他模組的介面 ---------- */
function quad(x,y){const a=Math.atan2(y-C.c[1],x-C.c[0]);return Math.floor(((a+Math.PI*2)%(Math.PI*2))/(Math.PI/2))%4;}
B.lit=function(x,y){
  if(!B.active||B.band<0)return false;
  return U.dist(x,y,C.c[0],C.c[1])<C.R+0.5&&quad(x,y)===B.band;
};
B.hear=function(x,y,rad,kind){
  if(!B.active)return;
  if(kind==='step'&&U.dist(B.x,B.y,x,y)>rad*1.6)return;
  B.sound={x:x,y:y,t:PH.L.t,kind:kind};
  if(B.state==='walk'&&(kind==='echo'||kind==='meow'||kind==='roar'))B.tgt={x:x,y:y};
};
B.extreme=function(){return B.active&&(B.state==='dash'||(B.state==='tele'&&B.move==='pounce'&&B.timer<0.45))&&U.dist(B.x,B.y,PH.P.x,PH.P.y)<5;};
B.pushOut=function(P){
  if(B.state==='ring')return;
  const dx=P.x-B.x,dy=P.y-B.y,dd=Math.hypot(dx,dy);
  if(dd<1.15&&dd>0.01){const nx=B.x+dx/dd*1.15,ny=B.y+dy/dd*1.15;if(W.fits(nx,ny,P.r,P.form)){P.x=nx;P.y=ny;}}
};
function catchable(){const P=PH.P;return P.grace<=0&&!P.hidden&&!P.fly&&!P.pipe&&!(P.warp&&P.warp.done)&&PH.S.mode==='play';}
// 被抓一次送回場內安全位並短暫保護；三次失誤回該階段開頭
B.fault=function(why){
  const L=PH.L,P=PH.P;
  if(!catchable()||B.yield)return;
  B.faults++;L.stats.faults++;L.stats.caught++;
  PH.AU.play('caught');PH.FX.flash('#ef5d50');PH.FX.shake(8);
  if(B.faults>=CFG.boss.faults){PH.Game.bossRetry(why);return;}
  PH.Player.transform('normal',true);
  const s1=C.safe,s2=[C.c[0]*2-s1[0],C.c[1]*2-s1[1]+13.2-12.5*0];   // 兩個安全位，挑離總督遠的那個
  const far=U.dist(B.x,B.y,s1[0],s1[1])>U.dist(B.x,B.y,C.c[0],C.c[1]-6.2)?s1:[C.c[0]+1,C.c[1]-5.6];
  const q=W.nearest(far[0],far[1],'normal');
  P.x=q.x;P.y=q.y;P.vx=P.vy=0;P.warp=null;P.grace=2.8;P.lastSafe={x:P.x,y:P.y};PH.S.camSnap=true;
  B.contact=0;if(B.state==='dash'||B.state==='tele')toIdle(2.5);
  const why2={pounce:'被月面撲抓撞到',tail:'被尾巴掃到',shock:'站在震波扇區裡',swat:'離總督太近，被一掌按住',ring:'擋在總督追尾巴的路上',minion:'被場內小兵逮到'}[why]||'被抓到';
  say(why2+'！（失誤 '+B.faults+'/'+CFG.boss.faults+'）已送回場內安全位。',5);
};
B.useProjector=function(){
  const L=PH.L;
  if(L.f.fish){say('魚影已經貼在尾巴上了。',3);return;}
  if(B.projCd>0){say('魚影投射器重新充能中……',3);PH.AU.play('no');return;}
  const a=Math.atan2(C.proj[1]-B.y,C.proj[0]-B.x),ok=U.dist(B.x,B.y,C.proj[0],C.proj[1])<9&&Math.abs(U.angd(B.ang,a))<1.35&&(B.state==='idle'||B.state==='walk'||B.state==='tele');
  if(!ok){say('總督沒有看向投射器。先用喵聲投射（按住 R）在投射器附近叫一聲，把牠的頭引過來。',6);PH.AU.play('no');return;}
  W.set('fish');B.state='spin';B.timer=13*am();B.gfx.length=0;B.band=-1;
  PH.AU.play('squeak');PH.FX.text(B.x,B.y,'尾巴上有魚！','#7fd0e6');
  say('魚影貼上尾巴了！總督開始追自己的尾巴。離開投射器，去按西南的環形路徑開關。',7);
};
B.usePath=function(){
  const L=PH.L;
  if(B.state!=='spin'){say('要等總督追著尾巴轉的時候才有用。',3);return;}
  W.set('ringrun');B.state='ring';B.onRing=false;B.lap=0;B.pedals=[0,0,0];
  B.ringA=Math.atan2(B.y-C.c[1],B.x-C.c[0]);
  say('路徑打開！總督沿固定環形路線依序踩過三個踏板。別擋在環上——走外圈的安全路段去東北的拉桿。',8);
};
B.usePump=function(){
  if(B.coldT>0){say('冷卻泵已經在運轉，低溫區在場地東側。',3);return;}
  if(B.coldCd>0){say('冷卻泵重新準備中……',3);PH.AU.play('no');return;}
  B.coldT=15*am();PH.AU.play('whoosh');
  say('冷卻泵接通！東側出現短暫的低溫區。回到場上，把總督引到低溫區上面。',7);
};
B.objective=function(){
  const L=PH.L,E=L.E;
  if(L.f.locks3)return {t:'抱起宇宙第一罐',x:15.5,y:5.5};
  const lk='月蓋鎖 '+B.locks.filter(Boolean).length+'/3　';
  if(B.phase===1){
    if(L.f.lever1ready)return {t:lk+'趁總督暈住，快拉西北的魚骨拉桿！',x:E.lever1.x,y:E.lever1.y};
    return {t:lk+'站上反光板前的誘導線，等牠撲過來再閃開',x:C.plate[0]+1.9,y:C.plate[1]};
  }
  if(B.phase===2){
    if(L.f.lever2ready)return {t:lk+'踏板充滿月光，快拉東北的拉桿！',x:E.lever2.x,y:E.lever2.y};
    if(L.f.ringrun)return {t:lk+'走外圈安全路段到東北的拉桿',x:E.lever2.x,y:E.lever2.y};
    if(L.f.fish)return {t:lk+'按下西南的環形路徑開關',x:E.pathsw.x,y:E.pathsw.y};
    return {t:lk+'喵聲投射引牠看向投射器，再走影子帶繞到後方貼魚影',x:C.proj[0],y:C.proj[1]};
  }
  if(L.f.lever3ready)return {t:lk+'拉下南側最後的拉桿！',x:E.lever3.x,y:E.lever3.y};
  if(!L.f.p3door)return {t:lk+'迷你貓鑽南東側道，打開冷卻室門鎖',x:E.p3door.x,y:E.p3door.y};
  if(!L.f.p3press)return {t:lk+'巨大貓壓住南側的開罐器壓台',x:E.p3press.x,y:E.p3press.y};
  if(L.f.shell)return {t:lk+'拉下南側最後的拉桿！',x:E.lever3.x,y:E.lever3.y};
  if(B.frostT>0)return {t:lk+'站到中央卡榫另一側叫一聲，引結霜的總督撞上去',x:C.peg[0]-4,y:C.peg[1]};
  if(B.coldT>0)return {t:lk+'把總督引到東側的低溫區上',x:C.cold[0],y:C.cold[1]};
  return {t:lk+'液體貓流進管線，接通冷卻泵',x:PH.P.x>21.5?E.pump.x:E.p3pipe.a[0],y:PH.P.x>21.5?E.pump.y:E.p3pipe.a[1]};
};

/* ---------- 行為 ---------- */
function free(x,y){
  const f=Math.floor;
  return W.dogPass(f(x),f(y))&&W.dogPass(f(x+0.55),f(y))&&W.dogPass(f(x-0.55),f(y))&&W.dogPass(f(x),f(y+0.55))&&W.dogPass(f(x),f(y-0.55));
}
function walk(tx,ty,sp,dt){
  const dx=tx-B.x,dy=ty-B.y,dd=Math.hypot(dx,dy);
  if(dd<0.35)return true;
  const a=Math.atan2(dy,dx),offs=[0,0.7,-0.7,1.3,-1.3];
  for(let i=0;i<offs.length;i++){
    const nx=B.x+Math.cos(a+offs[i])*sp*dt,ny=B.y+Math.sin(a+offs[i])*sp*dt;
    if(free(nx,ny)){B.x=nx;B.y=ny;B.ang=U.turn(B.ang,a,dt*3.2);return false;}
  }
  return true;
}
function sees(){
  const P=PH.P;
  if(!catchable()||P.form==='shadow'||B.frostT>0)return false;
  const dd=U.dist(B.x,B.y,P.x,P.y);
  if(dd>15)return false;
  if(dd>3&&Math.abs(U.angd(B.ang,Math.atan2(P.y-B.y,P.x-B.x)))>1.8)return false;
  return W.los(B.x,B.y,P.x,P.y,P.form==='giant'?1.5:0.5);
}
function toIdle(cd){
  B.state='idle';B.move='';B.band=-1;B.blind=false;B.dash=null;
  const g=CFG.boss.gap;B.moveCd=cd!=null?cd:U.rand(g[0],g[1])*(PH.opt.assist?1.25:1);
}
function begin(move,t){B.state='tele';B.move=move;B.timer=t*am();B.teleT=B.timer;B.moveN++;B.lastMove=move;PH.AU.play(move==='pounce'?'growl':'sus');}
function pickMove(){
  const L=PH.L,P=PH.P,SM=PH.Seams,seen=B.seenT<1.6&&B.known,dd=U.dist(B.x,B.y,P.x,P.y);
  const opts=[];
  if(seen)opts.push('pounce','pounce');
  if(B.phase>=2){
    if(B.lastMove!=='sweep')opts.push('sweep');
    if(seen&&dd<5.6&&B.lastMove!=='tail')opts.push('tail','tail');
  }
  if(B.phase>=3){
    if(!seen&&B.lastMove!=='sniff')opts.push('sniff','sniff');
    if(B.lastMove!=='shock'&&B.moveN%3===2)opts.push('shock','shock');
  }
  if(B.tapeCd<=0){
    // 封縫膠帶：只封已使用或已發現的錨點，而且不會同時封住兩組
    let a=null;
    if(SM.seam)a=SM.seam.a;
    else for(const id of C.anchors){const q=L.E[id];if(q.marked&&!q.sealUntil)a=q;}
    if(a){
      let otherSealed=false;
      for(const id of C.anchors){const q=L.E[id];if(q.sealUntil&&q.id!==a.id&&q.id!==a.pair)otherSealed=true;}
      if(!otherSealed&&!a.sealUntil){B.tapeA=a;opts.push('tape','tape');}
    }
  }
  if(!opts.length){
    if(B.phase===1||B.phase===2){B.state='walk';B.tgt=B.known||B.sound||{x:C.c[0],y:C.c[1]+3};B.walkSp=1.9;B.timer=6;return;}
    opts.push('sniff');
  }
  const m=U.pick(opts);
  if(m==='pounce'){B.tgt={x:B.known.x,y:B.known.y};begin('pounce',CFG.boss.pounceTele);}
  else if(m==='tape'){B.tapeCd=20;begin('tape',1.5);PH.UI.cue('總督抬起膠帶槍，錨點在閃！',B.tapeA.x,B.tapeA.y);}
  else if(m==='sweep'){const s=Math.floor(Math.random()*4);B.bandOrd=[s,(s+1)%4,(s+2)%4,(s+3)%4];begin('sweep',1.3);PH.UI.once('bsweep','探照掃射：地上先出現掃描帶，接著逐段照亮。被照亮的區塊走不了影子；被照到會暴露位置。',8);}
  else if(m==='tail'){B.tailA=Math.atan2(P.y-B.y,P.x-B.x);begin('tail',1.25);PH.UI.once('btail','尾巴橫掃：退到地上的弧形範圍外，或躲到矮掩體後面。',7);}
  else if(m==='shock'){B.shockN=0;B.shockOff=Math.random()*1.047;begin('shock',1.7);PH.UI.once('bshock','秩序震波：紅色扇區會依序受影響，走到綠色的安全扇區。',7);}
  else{
    const h=B.hist.length?B.hist[0]:null;
    B.tgt=B.sound&&L.t-B.sound.t<8?{x:B.sound.x,y:B.sound.y}:h?{x:h.x,y:h.y}:{x:C.c[0],y:C.c[1]};
    begin('sniff',1.2);PH.UI.once('bsniff','吸鼻尋貓：牠只會去查「舊的」氣味或聲音位置。換個地方，或投射喵聲製造新的調查點。',8);
  }
}
function plateHit(){
  B.state='stun';B.timer=CFG.boss.window*am();B.plateA=1;B.dash=null;
  W.set('lever1ready');PH.AU.play('clunk');PH.FX.shake(9);PH.FX.poof(C.plate[0],C.plate[1],18,'#fff2c4');
  say('總督撞上反光板！月光照開了封印——趁牠暈住，快去拉西北的魚骨拉桿！',6);
}
function pegHit(){
  const L=PH.L;
  B.state='stun';B.timer=6.5*am();B.frostT=0;B.dash=null;B.blind=false;
  W.set('shell');PH.AU.play('clunk');PH.FX.shake(10);PH.FX.poof(C.peg[0],C.peg[1],20,'#bfefff');
  say(L.f.p3press?'總督撞上中央卡榫，最後一道鎖的外殼破了！快去拉南側的拉桿！':'鎖的外殼破了！還需要巨大貓壓住南側的開罐器壓台，拉桿才會升起。',7);
}
function dashStep(dt){
  const P=PH.P,L=PH.L,d=B.dash;
  let rem=13*dt;
  while(rem>0&&B.dash){
    const st=Math.min(0.25,rem);rem-=st;
    const nx=B.x+d.dx*st,ny=B.y+d.dy*st;
    if(B.phase===1&&!L.f.lever1ready&&U.dist(nx,ny,C.plate[0],C.plate[1])<1.55){plateHit();return;}
    if(B.phase===3&&B.blind&&U.dist(nx,ny,C.peg[0],C.peg[1])<1.65){pegHit();return;}
    if(!free(nx,ny)){B.state='stun';B.timer=1.7;B.dash=null;B.blind=false;PH.AU.play('thud');PH.FX.shake(6);return;}     // 撞到掩體或邊緣，短暫停頓
    B.x=nx;B.y=ny;d.left-=st;
    if(catchable()&&U.dist(B.x,B.y,P.x,P.y)<1.3+P.r*0.5){B.fault('pounce');return;}
    if(d.left<=0){B.state='recover';B.timer=0.9;B.dash=null;B.blind=false;return;}
  }
}
function shockSectors(n){return n===0?[0,2,4]:[1,3,5];}
function inSector(x,y,list){
  const a=((Math.atan2(y-C.c[1],x-C.c[0])-B.shockOff)%(Math.PI*2)+Math.PI*2)%(Math.PI*2),i=Math.floor(a/1.0472)%6;
  return list.indexOf(i)>=0;
}
B.update=function(dt){
  const L=PH.L,P=PH.P;
  if(!B.active)return;
  C=L.def.boss;B.gfx.length=0;
  if(B.yield){B.ang=U.turn(B.ang,Math.atan2(P.y-B.y,P.x-B.x),dt*2);P.rest=false;return;}
  const g=B.gfx;
  B.tapeCd-=dt;B.projCd=Math.max(0,B.projCd-dt);
  B.histT-=dt;if(B.histT<=0){B.histT=0.5;B.hist.push({x:P.x,y:P.y});if(B.hist.length>5)B.hist.shift();}
  const see=sees();
  if(see){B.known={x:P.x,y:P.y,t:L.t};B.seenT=0;}else B.seenT+=dt;
  if(L.f.shell&&L.f.p3press&&!L.f.lever3ready)W.set('lever3ready');
  // 場邊能量凹槽：回復比較快，但待太久會被趕出來
  const inRest=U.dist(P.x,P.y,C.rest[0],C.rest[1])<C.rest[2]&&!P.hidden;
  P.rest=inRest;
  if(inRest){B.restT+=dt;PH.UI.once('rest','能量凹槽：站在裡面奇妙值回得比較快。待太久總督會跺腳把你趕出來。',6);}else B.restT=Math.max(0,B.restT-dt*2);
  // 低溫區
  if(B.coldT>0){
    B.coldT-=dt;g.push({t:'disc',x:C.cold[0],y:C.cold[1],r:C.cold[2],col:'#7fd0e6',a:0.4+Math.sin(L.t*5)*0.1});
    if(B.frostT<=0&&B.state!=='stun'&&B.state!=='dash'&&U.dist(B.x,B.y,C.cold[0],C.cold[1])<C.cold[2]){
      B.frostT=7.5*am();B.frostAt=L.t;B.state='frost';B.move='';B.band=-1;B.coldT=0;B.coldCd=5;
      PH.AU.play('shade');PH.FX.poof(B.x,B.y,20,'#dff6ff');
      say('總督的頭盔結霜了，暫時看不見！站到中央卡榫的另一側，叫一聲（空白鍵）引牠撲過來。',8);
    }else if(B.coldT<=0){B.coldCd=5;say('低溫區消失了。冷卻泵會自動重新準備，再去接通一次。',4);}
  }else if(B.coldCd>0)B.coldCd-=dt;

  switch(B.state){
  case 'intro':
    B.timer-=dt;B.ang=U.turn(B.ang,Math.atan2(P.y-B.y,P.x-B.x),dt*2);
    if(B.timer<=0)toIdle(2.5);
    break;
  case 'idle':{
    // 慢慢逼近最後確認的位置，保持一段距離
    const t=B.seenT<4&&B.known?B.known:(B.sound&&L.t-B.sound.t<5?B.sound:null);
    if(t){
      const dd=U.dist(B.x,B.y,t.x,t.y);
      if(dd>5.5)walk(t.x,t.y,1.7,dt);else B.ang=U.turn(B.ang,Math.atan2(t.y-B.y,t.x-B.x),dt*2.6);
    }else if(U.dist(B.x,B.y,C.c[0],C.c[1]+3)>2)walk(C.c[0],C.c[1]+3,1.3,dt);
    B.moveCd-=dt;
    if(B.restT>6){B.restT=0;begin('stomp',1.5);PH.UI.cue('總督盯上能量凹槽了！',C.rest[0],C.rest[1]);break;}
    if(B.moveCd<=0)pickMove();
    break;}
  case 'walk':
    B.timer-=dt;
    if(walk(B.tgt.x,B.tgt.y,B.walkSp||2.8,dt)||B.timer<=0||(see&&B.phase<3))toIdle(1.6);
    if(B.move==='sniff')g.push({t:'mark',x:B.tgt.x,y:B.tgt.y,col:'#ff8fa3'});
    break;
  case 'tele':{
    B.timer-=dt;const k=1-B.timer/B.teleT;
    if(B.move==='pounce'){
      if(!B.blind&&see&&B.timer>0.35){B.tgt.x=P.x;B.tgt.y=P.y;}      // 起跳前才鎖定「最後確認位置」，之後不追蹤轉彎
      const a=Math.atan2(B.tgt.y-B.y,B.tgt.x-B.x),len=U.dist(B.x,B.y,B.tgt.x,B.tgt.y)+2.5;
      B.ang=U.turn(B.ang,a,dt*6);
      g.push({t:'arrow',x:B.x,y:B.y,a:a,len:len,col:'#ef5d50',k:k});
      if(B.timer<=0){B.state='dash';B.dash={dx:Math.cos(a),dy:Math.sin(a),left:len};PH.AU.play('whoosh');}
    }else if(B.move==='tape'){
      const a=B.tapeA;B.ang=U.turn(B.ang,Math.atan2(a.y-B.y,a.x-B.x),dt*4);
      g.push({t:'mark',x:a.x,y:a.y,col:'#ffd23f',k:k});
      if(B.timer<=0){PH.Seams.seal(a,14);PH.AU.play('tape');PH.FX.text(a.x,a.y,'封！','#ffd23f');toIdle();}
    }else if(B.move==='sweep'){
      for(let i=0;i<4;i++)g.push({t:'quad',q:B.bandOrd[i],col:'#fff2c4',a:0.12+0.05*(3-i)});
      if(B.timer<=0){B.state='sweep';B.bandI=0;B.band=B.bandOrd[0];B.bandT=1.5*am();}
    }else if(B.move==='tail'){
      B.ang=U.turn(B.ang,B.tailA+Math.PI,dt*5);
      g.push({t:'arc',x:B.x,y:B.y,r:5.4,a:B.tailA,half:1.2,col:'#ef5d50',k:k});
      if(B.timer<=0){
        PH.AU.play('whoosh');PH.FX.shake(5);
        const dd=U.dist(B.x,B.y,P.x,P.y),da=Math.abs(U.angd(B.tailA,Math.atan2(P.y-B.y,P.x-B.x)));
        if(catchable()&&dd<5.4&&da<1.2&&W.los(B.x,B.y,P.x,P.y,P.form==='giant'?1.5:0.5))B.fault('tail');
        if(B.state==='tele'){B.state='recover';B.timer=1.2;}
      }
    }else if(B.move==='shock'){
      const bad=shockSectors(B.shockN);
      for(let i=0;i<6;i++)g.push({t:'sector',i:i,off:B.shockOff,col:bad.indexOf(i)>=0?'#ef5d50':'#8fc3b4',a:bad.indexOf(i)>=0?0.25+0.3*k:0.16});
      if(B.timer<=0){
        PH.AU.play('thud');PH.FX.shake(7);
        if(catchable()&&U.dist(P.x,P.y,C.c[0],C.c[1])<C.R+0.5&&inSector(P.x,P.y,bad))B.fault('shock');
        if(B.state==='tele'){
          if(B.shockN===0){B.shockN=1;B.timer=B.teleT=1.9*am();}
          else{B.state='recover';B.timer=1.3;}
        }
      }
    }else if(B.move==='sniff'){
      g.push({t:'mark',x:B.tgt.x,y:B.tgt.y,col:'#ff8fa3',k:k});
      if(B.timer<=0){B.state='walk';B.walkSp=2.8;B.timer=7;}
    }else if(B.move==='stomp'){
      g.push({t:'disc',x:C.rest[0],y:C.rest[1],r:C.rest[2]+0.3,col:'#ef5d50',a:0.25+0.4*k});
      if(B.timer<=0){
        PH.AU.play('thud');PH.FX.shake(7);
        if(U.dist(P.x,P.y,C.rest[0],C.rest[1])<C.rest[2]+0.3){const a=Math.atan2(C.c[1]-P.y,C.c[0]-P.x);P.slip=0.6;P.vx=Math.cos(a)*7;P.vy=Math.sin(a)*7;say('被跺腳震出凹槽了！',3);}
        toIdle(2.5);
      }
    }
    break;}
  case 'dash':dashStep(dt);break;
  case 'sweep':
    // 探照掃射：逐段照亮，被照亮的區塊禁止影子穿越
    B.bandT-=dt;
    g.push({t:'quad',q:B.band,col:'#fff2c4',a:0.5});
    if(B.bandI<3)g.push({t:'quad',q:B.bandOrd[B.bandI+1],col:'#fff2c4',a:0.14});
    B.ang=U.turn(B.ang,(B.band+0.5)*Math.PI/2+Math.atan2(C.c[1]-B.y,C.c[0]-B.x)*0,dt*3);
    if(catchable()&&P.form!=='shadow'&&B.lit(P.x,P.y)&&W.los(B.x,B.y,P.x,P.y,P.form==='giant'?1.5:0.5)){B.known={x:P.x,y:P.y,t:L.t};B.seenT=0;if(!B.revealT||L.t-B.revealT>3){B.revealT=L.t;PH.UI.cue('被探照燈照到，位置暴露了！',P.x,P.y);}}
    if(B.bandT<=0){B.bandI++;if(B.bandI>=4){B.band=-1;B.state='recover';B.timer=1.0;}else{B.band=B.bandOrd[B.bandI];B.bandT=1.5*am();PH.AU.play('blip');}}
    break;
  case 'recover':
    B.timer-=dt;if(B.timer<=0)toIdle();
    break;
  case 'stun':
    B.timer-=dt;
    if(B.timer<=0){
      if(B.phase===1&&L.f.lever1ready&&!B.locks[0]){W.set('lever1ready',false);B.plateA=0;say('封印又合上了。反光板轉回原位——再引牠撞一次，不會消耗任何東西。',5);}
      toIdle(2);
    }
    break;
  case 'frost':
    // 結霜：看不見，只會朝聽到的聲音盲撲
    B.frostT-=dt;B.ang+=Math.sin(L.t*12)*dt*1.5;
    if(B.sound&&B.sound.t>B.frostAt+0.3&&B.sound.kind!=='step'){
      B.tgt={x:B.sound.x,y:B.sound.y};B.blind=true;begin('pounce',1.0);B.frostAt=L.t+99;
    }else if(B.frostT<=0){toIdle(2);say('霜化了。冷卻泵會重新準備，再接通一次。',4);}
    break;
  case 'spin':
    B.timer-=dt;B.ang+=dt*7;
    if(B.timer<=0){W.set('fish',false);B.projCd=6;toIdle(2.5);say('魚影消失了。投射器重新充能後可以再貼一次。',4);}
    break;
  case 'ring':{
    // 追尾巴：沿固定環形路線跑一圈，依序踩過三個踏板
    const rx=C.c[0]+Math.cos(B.ringA)*C.ringR,ry=C.c[1]+Math.sin(B.ringA)*C.ringR;
    g.push({t:'ring',x:C.c[0],y:C.c[1],r:C.ringR,col:'#ffd23f',a:0.35});
    if(!B.onRing){
      const dd=U.dist(B.x,B.y,rx,ry);
      if(dd<0.4)B.onRing=true;else{B.x+=(rx-B.x)/dd*Math.min(dd,6*dt);B.y+=(ry-B.y)/dd*Math.min(dd,6*dt);}
    }else{
      const da=5.6/C.ringR*dt;B.ringA+=da;B.lap+=da;B.x=rx;B.y=ry;B.ang=B.ringA+Math.PI/2;
      for(let i=0;i<3;i++){
        const pa=B.ringStart+ (i+1)*2.094;
        if(!B.pedals[i]&&B.lap>=(i+1)*2.094-0.05&&(i===0||B.pedals[i-1])){B.pedals[i]=1;PH.AU.note(i);PH.FX.poof(B.x,B.y,10,'#fff2c4');}
      }
      if(B.lap>=6.4){
        B.state='dizzy';B.timer=7.5*am();W.set('lever2ready');PH.AU.play('unlock');
        say('三個踏板充滿月光！總督轉到頭暈——快去拉東北的魚骨拉桿。',6);
      }
    }
    if(catchable()&&U.dist(B.x,B.y,P.x,P.y)<1.6+P.r*0.5)B.fault('ring');
    break;}
  case 'dizzy':
    B.timer-=dt;B.ang+=dt*2.5;
    g.push({t:'ring',x:C.c[0],y:C.c[1],r:C.ringR,col:'#fff2c4',a:0.25});
    if(B.timer<=0){
      W.set('lever2ready',false);W.set('fish',false);W.set('ringrun',false);B.projCd=5;B.pedals=[0,0,0];
      toIdle(2.5);say('總督回神了。等投射器充能，再貼一次魚影。',5);
    }
    break;
  }
  // 太靠近會被一掌按住（有預警）
  if((B.state==='idle'||B.state==='walk'||B.state==='recover')&&catchable()&&P.form!=='shadow'&&U.dist(B.x,B.y,P.x,P.y)<1.75){
    B.contact+=dt;g.push({t:'disc',x:B.x,y:B.y,r:1.75,col:'#ef5d50',a:0.2+B.contact*0.5});
    if(B.contact>0.85){B.contact=0;B.fault('swat');}
  }else B.contact=Math.max(0,B.contact-dt*2);
  // 反光板前的誘導線
  if(B.phase===1&&!B.locks[0]&&!L.f.lever1ready)g.push({t:'line',x0:C.plate[0]+1.1,y0:C.plate[1],x1:C.plate[0]+3.6,y1:C.plate[1],col:'#fff2c4'});
  if(B.phase===2&&L.f.ringrun){
    for(let i=0;i<3;i++){const a=B.ringStart+(i+1)*2.094;g.push({t:'disc',x:C.c[0]+Math.cos(a)*C.ringR,y:C.c[1]+Math.sin(a)*C.ringR,r:0.6,col:B.pedals[i]?'#fff2c4':'#7a6f4a',a:B.pedals[i]?0.9:0.5});}
  }
};
// 記錄環形路線的起點角度，三個踏板從這裡每 120 度一個
const _usePath=B.usePath;
B.usePath=function(){_usePath();if(B.state==='ring')B.ringStart=B.ringA;};
})();
