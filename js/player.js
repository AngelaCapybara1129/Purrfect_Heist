/* 咪嚕：移動、形態、奇妙值、互動、躲藏、喵叫與道具 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,CFG=PH.CFG,W=PH.World,F=PH.FORMS;
const PL=PH.Player={cur:null};
let P=null;
const say=function(t,d){PH.UI.say(t,d||2.6);},no=function(t){PH.UI.say(t,2.8);PH.AU.play('no');};

PL.spawn=function(x,y,boxId){
  const L=PH.L;
  P=PH.P={x:x,y:y,vx:0,vy:0,face:-1.57,form:'normal',r:F.normal.r,energy:CFG.energyMax,focus:CFG.seam.focusMax,
    hasCan:!!L.def.startCan,item:null,tickets:0,hidden:boxId?L.E[boxId]:null,warp:null,fly:null,pipe:null,slip:0,grace:1.2,
    lean:0,sneak:false,moving:false,stepT:0,meowCd:0,echoCd:0,holdT:0,holdId:null,lastSafe:{x:x,y:y},fallT:0,lift:0,
    purrT:0,aim:null,rest:false,vs:1,morph:0};
  return P;
};
PL.respawn=function(x,y,ps){
  P=PH.P;const q=W.nearest(x,y,'normal');
  P.x=q.x;P.y=q.y;P.vx=P.vy=0;P.form='normal';P.r=F.normal.r;P.energy=Math.max(P.energy,70);
  P.hasCan=ps.hasCan;P.item=ps.item;P.tickets=ps.tickets;
  P.hidden=null;P.warp=P.fly=P.pipe=null;P.slip=0;P.grace=2.6;P.lean=0;P.holdT=0;P.holdId=null;P.aim=null;P.fallT=0;
  P.lastSafe={x:P.x,y:P.y};PH.S.camSnap=true;
};

/* ---------- 形態 ---------- */
PL.transform=function(to,forced){
  const L=PH.L;P=PH.P;
  if(P.form===to)return true;
  if(!forced){
    if(P.hidden||P.warp||P.pipe||P.fly)return false;
    if(!PH.has(to)){no('還沒解鎖'+F[to].name+'。帶對應的罐罐回紙箱開罐才會解鎖。');return false;}
    if(to!=='normal'&&P.energy<8){no('奇妙值不夠。');return false;}
    if(to==='shadow'){
      if(!W.isShade(Math.floor(P.x),Math.floor(P.y))){no('影子貓要站在陰影帶裡才變得成。');return false;}
      if(W.lit(P.x,P.y)){no('這裡被光照著，影子站不住。');return false;}
    }
  }
  let pos={x:P.x,y:P.y};
  if(!W.fits(P.x,P.y,F[to].r,to)){
    const q=W.findFit(P.x,P.y,to,forced?1.6:0.8);
    if(q)pos=q;
    else if(forced)pos=W.nearest(P.x,P.y,to);            // 能量耗盡：回最近的合法落腳點，不卡牆
    else{no(to==='shadow'?'陰影太窄了。':'這裡太擠，變不了'+F[to].name+'。');return false;}   // 空間不足禁止變大
  }
  const big=F[to].r>F[P.form].r;
  P.x=pos.x;P.y=pos.y;P.form=to;P.r=F[to].r;P.morph=0.35;
  L.stats.forms[to]=1;
  PH.AU.play(to==='normal'?'back':to==='giant'?'grow':to==='mini'?'shrink':to==='liquid'?'splash2':'shade');
  PH.FX.poof(P.x,P.y,big?16:9,to==='shadow'?'#2b1b2e':to==='liquid'?'#7fd0e6':'#fff6e3');
  if(to==='giant'){PH.FX.shake(4);W.noise(P.x,P.y,5,'grow');}
  return true;
};
PL.cycle=function(){
  P=PH.P;const o=PH.FORM_ORDER;let i=o.indexOf(P.form);
  for(let k=1;k<=o.length;k++){const f=o[(i+k)%o.length];if(PH.has(f)){if(f==='shadow'&&(!W.isShade(Math.floor(P.x),Math.floor(P.y))||W.lit(P.x,P.y)))continue;PL.transform(f);return;}}
};

/* ---------- 躲藏 ---------- */
PL.hide=function(e){
  const L=PH.L;
  if(e.t==='box'&&e.finish&&P.hasCan){PH.Game.finish(e);return;}
  if(P.form!=='normal'&&P.form!=='mini')PL.transform('normal',true);
  P.hidden=e;P.x=e.x;P.y=e.y;P.vx=P.vy=0;P.lean=0;P.moving=false;L.stats.hides++;
  PH.AU.play('hop');PH.S.camSnap=true;
  PH.Dogs.sawHide(e);
  if(e.t==='box')PH.UI.once('boxhint','紙箱裡只能從縫往外看。按住 W 掀蓋看更多（也更容易被發現）；按 E 出來。',7);
};
PL.unhide=function(){
  const e=P.hidden;if(!e)return;
  const S=PH.S,ox=e.x+Math.cos(S.yaw)*0.75,oy=e.y+Math.sin(S.yaw)*0.75;
  const q=W.findFit(ox,oy,P.form,1.2)||W.nearest(e.x,e.y,P.form);
  P.hidden=null;P.x=q.x;P.y=q.y;P.lift=0;PH.AU.play('hop');PH.S.camSnap=true;
};

/* ---------- 喵、投射、呼嚕、道具、放下罐罐 ---------- */
PL.meow=function(){
  const L=PH.L;P=PH.P;
  if(P.meowCd>0||P.warp||P.pipe||PH.S.mode!=='play')return;
  P.meowCd=CFG.meow.cd;
  if(P.form==='giant'&&!P.hidden){
    PH.AU.play('roar');PH.FX.shake(6);W.noise(P.x,P.y,9,'roar');
    PH.Dogs.scareAll(P.x,P.y,3.5);
  }else{PH.AU.play('meow');W.noise(P.x,P.y,CFG.meow.rad,'meow');}
  PH.FX.text(P.x,P.y,P.form==='giant'?'喵嗚！！':'喵～','#fff');
};
PL.aimPoint=function(){
  const S=PH.S,sm=PH.Seams.seam;
  if(sm&&sm.state==='open'){
    const da=U.dist(P.x,P.y,sm.a.x,sm.a.y),db=U.dist(P.x,P.y,sm.b.x,sm.b.y);
    if(Math.min(da,db)<3){const o=da<db?sm.b:sm.a;return {x:o.x,y:o.y,seam:true};}
  }
  const d=U.clamp(6.5+S.pitch*14,2.5,CFG.echo.range),fx=Math.cos(S.yaw),fy=Math.sin(S.yaw);
  let x=P.x,y=P.y;
  for(let s=0.25;s<=d;s+=0.25){const nx=P.x+fx*s,ny=P.y+fy*s;if(W.hgt(Math.floor(nx),Math.floor(ny))>=2)break;x=nx;y=ny;}
  return {x:x,y:y,seam:false};
};
PL.echo=function(){
  P=PH.P;
  if(!PH.has('echo')||!P.aim||PH.S.mode!=='play')return;
  const a=P.aim;P.aim=null;
  if(P.echoCd>0){no('喵聲投射還在冷卻。');return;}
  if(P.energy<CFG.echo.cost){no('奇妙值不足。');return;}
  P.energy-=CFG.echo.cost;P.echoCd=CFG.echo.cd;
  PH.AU.play('echo');PH.FX.text(a.x,a.y,'喵～','#ffd23f');
  W.noise(a.x,a.y,CFG.echo.rad,'echo');
  if(a.seam)PH.UI.once('echoseam','聲音從貓縫的另一端先傳出去了。',4);
};
PL.useItem=function(){
  const L=PH.L;P=PH.P;
  if(!P.item||P.hidden||PH.S.mode!=='play'){if(!P.item)no('身上沒有道具。');return;}
  if(P.item==='furball'){
    P.face=PH.S.yaw;const fx=Math.cos(P.face),fy=Math.sin(P.face);   // 朝鏡頭方向丟
    L.decoy={x:P.x+fx*0.5,y:P.y+fy*0.5,vx:fx*3.4,vy:fy*3.4,t:0,run:1.6,life:7};
    P.item=null;PH.AU.play('hop');say('毛球替身跑出去了！看到的狗會先去查它，嗅一嗅就會識破。',4);
  }else if(P.item==='fish'){
    L.lure={x:P.x,y:P.y,t:12,pulse:0};P.item=null;PH.AU.play('click');say('放下小魚乾。靠鼻子的狗會先來聞這裡。',4);
  }else if(P.item==='sticker'){
    const d=PL.behindDog();
    if(!d){no('魚影貼紙要從狗的正後方近身才貼得上。');return;}
    if(d.K.heavy){no('重裝犬穿著護具，貼紙黏不上去。');return;}
    if(PH.Dogs.stun(d,'dizzy',5.5)){P.item=null;PH.AU.play('squeak');PH.FX.text(d.x,d.y,'尾巴上有魚！','#7fd0e6');}
    else no('牠剛轉完圈，暫時不會再上當。');
  }
};
PL.behindDog=function(){
  const L=PH.L;let best=null,bd=1.5;
  for(const d of L.dogs){
    if(!d.active||d.state==='chase'||d.state==='pounce')continue;
    const dd=U.dist(P.x,P.y,d.x,d.y);if(dd>bd)continue;
    if(Math.abs(U.angd(d.ang,Math.atan2(P.y-d.y,P.x-d.x)))>2.0){bd=dd;best=d;}
  }
  return best;
};
PL.dropCan=function(){
  const L=PH.L;P=PH.P;
  if(PH.S.mode!=='play'||P.hidden||P.warp||P.pipe||P.fly)return;
  if(!P.hasCan){if(L.can&&U.dist(P.x,P.y,L.can.x,L.can.y)<1.1)PL.pickCan();return;}
  if(!W.ground(P.x,P.y,0.3)){no('這裡放不穩。');return;}
  P.hasCan=false;L.can={x:P.x,y:P.y,hx:P.x,hy:P.y,vx:0,vy:0};PH.AU.play('click');
  say('把罐罐放在地上了。它還是會出聲、飄香——可以當成聲東擊西的誘餌，記得回來拿。',5);
};
PL.pickCan=function(){const L=PH.L;L.can=null;P.hasCan=true;PH.AU.play('take');};

/* ---------- 互動 ---------- */
function useSw(e){
  const L=PH.L;
  PH.AU.play(e.snd||'click');PH.FX.poof(e.x,e.y,6,'#ffd23f');
  if(!e.repeat)e.done=true;
  if(e.fn&&L.def[e.fn])L.def[e.fn](L,e);
  if(e.flag)W.set(e.flag);
}
function enterPipe(e,fromA){
  const pts=[fromA?e.a:e.b].concat(fromA?(e.via||[]):(e.via||[]).slice().reverse(),[fromA?e.b:e.a]);
  let len=0;const seg=[];
  for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);len+=l;}
  P.pipe={pts:pts,seg:seg,len:len,u:0};P.vx=P.vy=0;PH.AU.play('pipe');
}
// 目前最適合的一個互動；dis 表示看得到但現在做不了（附原因）
PL.action=function(){
  const L=PH.L,SM=PH.Seams;P=PH.P;
  let best=null;
  const add=function(d,pri,label,fn,hold,id,dis,ex){
    const s=d-pri+(dis?4:0);
    if(!best||s<best.s){best={s:s,label:label,fn:fn,hold:hold||0,id:id||label,dis:dis||null};if(ex)for(const k in ex)best[k]=ex[k];}
  };
  if(P.warp||P.pipe||P.fly)return null;
  if(P.hidden){const h=P.hidden;add(0,9,h.t==='mover'?'下車':h.t==='plant'?'離開盆栽':'離開紙箱',PL.unhide);return best;}
  const soft=P.form==='shadow',R=P.r;
  const se=SM.nearEnd();if(se)add(se.d,2.5,'鑽進貓縫',function(){SM.enter(se.a);},0,'seam');
  if(L.can){const d=U.dist(P.x,P.y,L.can.x,L.can.y);if(d<1.1+R)add(d,2,'抱起罐罐',PL.pickCan,0,'can',soft?'影子抱不了罐罐。':null);}
  if(P.item==='sticker'&&PL.behindDog())add(0,2,'貼上魚影貼紙',PL.useItem,0,'stick');
  for(const e of L.ents){
    let d;
    switch(e.t){
    case 'box':
      d=U.dist(P.x,P.y,e.x,e.y);if(d>1.1+R)break;
      add(d,e.finish&&P.hasCan?3:0.5,e.finish&&P.hasCan?'帶罐罐鑽進紙箱開罐':'躲進紙箱',function(){PL.hide(e);},0,'box'+e.id,
        P.form==='giant'?'太大了，鑽不進去。先變回來。':soft||P.form==='liquid'?'先變回普通貓。':null);
      break;
    case 'plant':
      d=U.dist(P.x,P.y,e.x,e.y);if(d>1.0+R)break;
      add(d,0.4,'躲進盆栽偽裝',function(){PL.hide(e);},0,'pl'+e.id,P.form==='giant'?'太大了，藏不住。':soft||P.form==='liquid'?'先變回普通貓。':null);
      break;
    case 'mover':
      if(!e.hide||!e.present)break;
      d=U.dist(P.x,P.y,e.x,e.y);if(d>e.r+1.0+R)break;
      add(d,0.6,'躲進'+(e.name||'車子'),function(){PL.hide(e);},0,'mv'+e.id,P.form==='giant'?'太大了，擠不進去。':soft||P.form==='liquid'?'先變回普通貓。':null);
      break;
    case 'ped':{
      if(e.taken)break;
      d=U.dist(P.x,P.y,e.fx||e.x,e.fy||e.y);if(d>1.25+R)break;
      let dis=null;
      if(e.need&&!L.f[e.need])dis=e.msg||'還拿不到。';
      else if(e.tickets&&P.tickets<e.tickets)dis='還差 '+(e.tickets-P.tickets)+' 張魚骨票。';
      else if(soft||P.form==='liquid')dis='這個形態抱不了罐罐。';
      add(d,1.5,e.label||'抱走'+(L.def.canName||'罐罐'),function(){W.theft(e);},e.hold||0.8,'ped',dis);
      break;}
    case 'sw':{
      if(e.done&&!e.repeat)break;
      if(e.show&&!L.f[e.show])break;
      d=U.dist(P.x,P.y,e.x,e.y);if(d>(e.r||1.25)+R)break;
      let dis=null;
      if(e.need&&!L.f[e.need])dis=e.needMsg||'現在還不能用。';
      else if(e.form&&P.form!==e.form)dis='需要'+F[e.form].name+'。';
      else if(soft)dis='影子摸不到實體機關。';
      else if(P.form==='liquid'&&!e.any&&e.form!=='liquid')dis='液體貓按不動，先變回來。';
      add(d,1.2,e.label,function(){useSw(e);},e.hold||0,'sw'+e.id,dis);
      break;}
    case 'push':{
      if(e.anim>0)break;
      const n=e.slots.length;if(n>2&&e.slot>=n-1)break;
      d=U.dist(P.x,P.y,e.px,e.py);if(d>1.85+R*0.5)break;
      const need=e.form==='giant'?'giant':null;
      add(d,1.0,e.label||'推',function(){if(!W.push(e))no('推不動，前面被擋住了。');},0.5,'push'+e.id,
        need&&P.form!==need?'太重了，需要巨大貓才推得動。':(!need&&(P.form==='mini'||soft||P.form==='liquid'))?'這個形態推不動。':null);
      break;}
    case 'pipe':{
      if(e.show&&!L.f[e.show])break;
      const da=U.dist(P.x,P.y,e.a[0],e.a[1]),db=U.dist(P.x,P.y,e.b[0],e.b[1]);d=Math.min(da,db);
      if(d>1.0+R)break;
      add(d,0.9,'流進管線',function(){enterPipe(e,da<db);},0,'pipe'+e.id,
        e.need&&!L.f[e.need]?(e.needMsg||'管線被堵住了。'):P.form!=='liquid'?'需要液體貓才流得進去。':null);
      break;}
    case 'towel':
      if(e.used||e.fall>0)break;
      d=U.dist(P.x,P.y,e.x,e.y);if(d>1.45+R)break;
      add(d,0.8,'把毛巾撥下去',function(){e.fall=0.45;PH.AU.play('push');},0,'tw'+e.id,soft?'影子摸不到。':null);
      break;
    case 'knock':
      if(e.used)break;
      d=U.dist(P.x,P.y,e.fx,e.fy);if(d>1.3+R)break;
      add(d,0.3,'把'+e.name+'撥下去',function(){e.used=true;e.fall=0.45;PH.AU.play('kick');},0,'kn'+e.id,soft?'影子摸不到。':null);
      break;
    case 'toy':
      d=U.dist(P.x,P.y,e.x,e.y);if(d>0.95+R||e.rolling)break;
      add(d,0.3,'踢玩具',function(){W.kick(e,Math.cos(P.face),Math.sin(P.face));},0,'toy'+e.id,soft?'影子踢不到。':null);
      break;
    case 'item':
      if(e.taken||!PH.ITEMS[e.kind]||e.kind==='handle')break;
      d=U.dist(P.x,P.y,e.x,e.y);if(d>0.95+R||!P.item||P.item===e.kind)break;
      add(d,0.2,'換成'+PH.ITEMS[e.kind],function(){const old=P.item;P.item=e.kind;e.kind=old;PH.AU.play('click');},0,'it'+e.id);
      break;
    case 'chute':
      d=U.dist(P.x,P.y,e.x,e.y);if(d>1.0+R)break;
      add(d,0.5,e.label||'滑下去',function(){P.fly={x0:P.x,y0:P.y,x1:e.to[0],y1:e.to[1],t:0,dur:0.9,h:0.6};PH.AU.play('whoosh');},0,'ch'+e.id);
      break;
    case 'exit':
      if(!PH.S.practice)break;
      d=U.dist(P.x,P.y,e.x,e.y);if(d>1.25+R)break;
      add(d,1,e.label||'前往下一關',function(){PH.Game.next();},0,'exit',e.need&&!L.f[e.need]?e.needMsg:null);
      break;
    }
  }
  // 情境動作（優先度最低，旁邊沒別的事可做時才出現）
  if(!soft){
    const dg=PH.Dogs.canPurr(P.x,P.y);   // 呼嚕：按住 E 讓附近沒起疑的狗睏
    if(dg)add(1.2+U.dist(P.x,P.y,dg.x,dg.y)*0.2,0,'呼嚕，讓狗睏',function(){},9,'purr',null,{purr:true,dog:dg});
  }
  if(P.hasCan&&!P.moving&&!P.holdId||P.hasCan&&P.holdId==='drop')   // 放下罐罐：停下來才出現，要按住，避免誤放
    add(3.5,0,'放下罐罐（當誘餌）',PL.dropCan,0.6,'drop',soft?'影子放不下罐罐。':null);
  return best;
};
PL.pressE=function(){
  P=PH.P;if(PH.S.mode!=='play')return;
  const a=PL.cur=PL.action();if(!a){return;}
  if(a.dis){no(a.dis);return;}
  if(!a.hold){a.fn();PL.cur=null;}else{P.holdId=a.id;P.holdT=0;}
};
function interactTick(dt){
  const a=PL.cur=PL.action(),I=PH.IN;
  if(a&&a.hold&&P.holdId===a.id&&I.eHeld&&!a.dis){
    P.holdT+=dt;
    if(a.purr){   // 呼嚕共鳴：按住期間持續施放
      P.purrT-=dt;if(P.purrT<=0){P.purrT=0.5;PH.AU.play('purr');}
      PH.Dogs.purr(P.x,P.y,dt);P.holdT=0;return;
    }
    if(P.holdT>=a.hold){P.holdT=0;P.holdId=null;a.fn();PL.cur=null;}
  }else{P.holdT=0;if(!I.eHeld)P.holdId=null;}
}
function pickups(){
  const L=PH.L;
  if(P.form==='shadow'||P.hidden)return;
  for(const e of L.by.item){
    if(e.taken||U.dist(P.x,P.y,e.x,e.y)>0.7+P.r)continue;
    const SV=PH.SAVE;let got=true;
    switch(e.kind){
      case 'smallcan':P.energy=Math.min(CFG.energyMax,P.energy+50);PH.FX.text(e.x,e.y,'奇妙值 +50','#7fd0e6');break;
      case 'ticket':P.tickets++;PH.FX.text(e.x,e.y,'魚骨票 '+P.tickets+'/3','#ffd23f');break;
      case 'collect':SV.collect[e.id]=1;PH.saveGame();say('找到隱藏收藏：'+e.name+'！',4.5);break;
      case 'bowl':{SV.bowls[e.id]=1;PH.saveGame();const n=Object.keys(SV.bowls).length;say('空餐碗線索（'+n+'/5）……這裡的狗，好像也沒吃飽。',5);break;}
      case 'flavor':SV.flavor[e.id]=1;PH.saveGame();say('找到'+e.name+'！（收藏用，開罐動畫會多一點彩色亮粉）',5);break;
      case 'key':W.set(e.flag);say('拿到'+e.name+'！',4);break;
      default:if(P.item){got=false;}else{P.item=e.kind;say('撿到'+PH.ITEMS[e.kind]+'（'+(PH.UI.fine?'點滑鼠左鍵':'按「道具」')+'使用）。',4);PH.UI.once('item_'+e.kind,
        e.kind==='furball'?'毛球替身：丟出去會短距離跑動，吸引看到它的狗去調查。':e.kind==='sticker'?'魚影貼紙：從狗的正後方近身貼上，牠會追著尾巴轉到頭暈。':'小魚乾：放在地上當假氣味，靠鼻子的狗會先去聞。',7);}
    }
    if(!got)continue;
    e.taken=true;PH.AU.play('pick');PH.FX.poof(e.x,e.y,8,'#ffd23f');
    if(e.cp)W.checkpoint(e.cp[0],e.cp[1],e.cp[2]);
    if(L.def.onItem)L.def.onItem(L,e);
  }
}
PL.fall=function(){
  const L=PH.L;
  L.stats.falls++;PH.AU.play('splash');PH.FX.poof(P.x,P.y,16,L.def.pal.liquid||'#7fd0e6');
  W.noise(P.x,P.y,5,'splash');
  P.x=P.lastSafe.x;P.y=P.lastSafe.y;P.vx=P.vy=0;P.fallT=0;P.energy=Math.max(0,P.energy-10);P.grace=Math.max(P.grace,1.2);
  if(!W.fits(P.x,P.y,P.r,P.form))PL.transform('normal',true);
  PH.S.camSnap=true;say(L.def.fallMsg||'噗通！爬回最近的落腳點。',3);
};

// 前面有遮蔽物、而且只有一側空著時，回傳要探出去的方向（1 右、-1 左），否則 0
function peekSide(){
  const S=PH.S,fx=Math.cos(S.yaw),fy=Math.sin(S.yaw),rx=-fy,ry=fx;
  const blk=function(x,y){return W.hgt(Math.floor(x),Math.floor(y))>=0.5;};
  if(!blk(P.x+fx*0.9,P.y+fy*0.9))return 0;
  let side=0;
  for(const s of [1,-1]){
    const sx=P.x+rx*0.75*s,sy=P.y+ry*0.75*s;
    if(blk(sx,sy)||blk(sx+fx*0.9,sy+fy*0.9)||blk(sx+fx*1.8,sy+fy*1.8))continue;
    if(side)return 0;   // 兩側都空：不是牆角
    side=s;
  }
  return side;
}

/* ---------- 每幀 ---------- */
PL.update=function(dt,rdt){
  const L=PH.L,S=PH.S,I=PH.IN,SM=PH.Seams;P=PH.P;
  P.grace=Math.max(0,P.grace-dt);P.meowCd=Math.max(0,P.meowCd-dt);P.echoCd=Math.max(0,P.echoCd-dt);P.morph=Math.max(0,P.morph-dt);
  if(!SM.draw)P.focus=Math.min(CFG.seam.focusMax,P.focus+rdt*CFG.seam.focusRegen);
  // 誘餌：毛球替身、小魚乾
  if(L.decoy){
    const k=L.decoy;k.t+=dt;
    if(k.t<k.run){const nx=k.x+k.vx*dt,ny=k.y+k.vy*dt;if(W.ground(nx,ny,0.25)){k.x=nx;k.y=ny;}else k.run=0;}
    if(k.t>k.life)L.decoy=null;
  }
  if(L.lure){const k=L.lure;k.t-=dt;k.pulse-=dt;if(k.pulse<=0){k.pulse=3;PH.Dogs.smellAll(k.x,k.y,true);PH.FX.ring(k.x,k.y,3,'scent');}if(k.t<=0)L.lure=null;}

  if(P.warp){SM.warpTick(dt);return;}
  if(P.fly){
    const f=P.fly;f.t+=dt;const k=Math.min(1,f.t/f.dur);
    P.x=U.lerp(f.x0,f.x1,k);P.y=U.lerp(f.y0,f.y1,k);P.fz=Math.sin(k*Math.PI)*f.h;P.moving=false;
    if(k>=1){P.fly=null;P.fz=0;P.lastSafe.x=P.x;P.lastSafe.y=P.y;PH.AU.play('hop');if(!W.fits(P.x,P.y,P.r,P.form)){const q=W.nearest(P.x,P.y,P.form);P.x=q.x;P.y=q.y;}}
    return;
  }
  if(P.pipe){
    const pp=P.pipe;pp.u+=dt*5.5;let u=pp.u,i=0;
    while(i<pp.seg.length-1&&u>pp.seg[i]){u-=pp.seg[i];i++;}
    const t=pp.seg[i]?Math.min(1,u/pp.seg[i]):1,a=pp.pts[i],b=pp.pts[i+1];
    P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;P.moving=false;
    if(pp.u>=pp.len){P.pipe=null;const q=W.findFit(P.x,P.y,P.form,1)||W.nearest(P.x,P.y,P.form);P.x=q.x;P.y=q.y;P.lastSafe.x=P.x;P.lastSafe.y=P.y;PH.AU.play('splash2');PH.S.camSnap=true;P.grace=Math.max(P.grace,0.5);}
    return;
  }
  // 奇妙值
  if(P.form==='normal')P.energy=Math.min(CFG.energyMax,P.energy+CFG.regen*(P.rest?3:1)*dt);
  else{
    P.energy-=F[P.form].drain*dt;
    if(P.energy<=0){P.energy=0;PL.transform('normal',true);say('奇妙值用完了，變回普通貓。',3);}
  }
  if(P.hidden){
    const h=P.hidden;P.vx=P.vy=0;P.moving=false;
    if(h.t==='mover'){P.x=h.x;P.y=h.y;if(!h.present)PL.unhide();}
    else if(h.t==='plant'&&Math.abs(I.mx)+Math.abs(I.my)>0.5){P.moving=true;PL.unhide();}
    P.lift=U.clamp(P.lift+((h.t==='box'&&I.my>0.3)?dt*3:-dt*4),0,1);
    interactTick(dt);
    return;
  }
  // 影子遇光
  if(P.form==='shadow'&&(W.lit(P.x,P.y)||!W.isShade(Math.floor(P.x),Math.floor(P.y)))){
    PL.transform('normal',true);P.slip=0.25;P.vx=P.vy=0;PH.AU.play('yelp');say('強光把影子逼了出來！',3);
  }
  // 滑倒／被吹開：短暫失去控制
  let mx=I.mx,my=I.my;
  if(P.slip>0){P.slip-=dt;mx=my=0;}
  if(SM.draw||P.aim){mx*=0.0;my*=0.0;}
  // 自動探頭：輕腳停在遮蔽物後面時，往空著的那一側探出去
  const want=(I.sneak&&Math.abs(mx)+Math.abs(my)<0.05&&P.slip<=0&&!P.holdId)?peekSide():0;
  P.lean+=(want-P.lean)*Math.min(1,dt*(want?6:9));
  if(Math.abs(P.lean)<0.01)P.lean=0;
  const fx=Math.cos(S.yaw),fy=Math.sin(S.yaw);
  let dx=fx*my-fy*mx,dy=fy*my+fx*mx;const il=Math.hypot(dx,dy);
  if(il>1){dx/=il;dy/=il;}
  P.sneak=!!I.sneak;
  const sp=F[P.form].speed*(P.sneak?0.5:1)*(P.holdId?0:1);
  if(P.slip<=0){
    const acc=(il>0.05?32:46)*dt,tx=dx*sp,ty=dy*sp;
    P.vx+=U.clamp(tx-P.vx,-acc,acc);P.vy+=U.clamp(ty-P.vy,-acc,acc);
  }else{const f=Math.pow(0.08,dt);P.vx*=f;P.vy*=f;}
  const nx=P.x+P.vx*dt;if(W.fits(nx,P.y,P.r,P.form))P.x=nx;else P.vx=0;
  const ny=P.y+P.vy*dt;if(W.fits(P.x,ny,P.r,P.form))P.y=ny;else P.vy=0;
  const v=Math.hypot(P.vx,P.vy);P.moving=v>0.35;
  if(P.moving&&P.slip<=0)P.face=U.turn(P.face,Math.atan2(P.vy,P.vx),dt*14);
  if(PH.Boss&&PH.Boss.active)PH.Boss.pushOut(P);
  // 浮台：站在上面會被載著走
  const m=W.moverAt(P.x,P.y);
  if(m){P.x+=m.dx;P.y+=m.dy;}
  const tk=W.kind(Math.floor(P.x),Math.floor(P.y));
  if(tk==='hazard'&&!m&&P.form!=='shadow'){P.fallT+=dt;if(P.fallT>0.2){PL.fall();return;}}
  else{P.fallT=0;if(!m&&W.ground(P.x,P.y,0.32)){P.lastSafe.x=P.x;P.lastSafe.y=P.y;}}
  // 腳步聲：輕腳無聲；迷你、液體、影子本來就安靜；踩水會有水聲
  if(P.moving&&!P.sneak){
    P.stepT-=dt*(v/3.2);
    if(P.stepT<=0){
      P.stepT=0.34;let n=F[P.form].noise;if(tk==='water')n=Math.max(n,3.5);
      if(n>0){W.noise(P.x,P.y,n,'step');PH.AU.play(tk==='water'?'wstep':P.form==='giant'?'thud':'step');if(P.form==='giant')PH.FX.shake(1.5);}
    }
  }
  // 喵聲投射瞄準（按住空白鍵）
  if(I.aim&&PH.has('echo')&&!SM.draw)P.aim=PL.aimPoint();
  else if(P.aim&&!I.aim)P.aim=null;
  SM.discover();
  pickups();
  interactTick(dt);
};
})();
