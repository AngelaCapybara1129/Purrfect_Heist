/* 貓縫：預設縫點、點選連接、同時一組、合法性預覽、穿越、被封與洗痕 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,CFG=PH.CFG,W=PH.World;
const SM=PH.Seams={seam:null,draw:null,screen:[]};

SM.reset=function(){SM.seam=null;SM.draw=null;};

// 靠近才會發現縫點；沒發現的縫點不會顯示，也不能連
SM.discover=function(){
  const L=PH.L,P=PH.P;if(P.hidden)return;
  const rr=L.def.tutorial?6:4.8;
  for(const a of L.by.anchor){
    if(a.found||(a.off&&L.f[a.off])||(a.on&&a.found0&&!L.f[a.on]))continue;
    if(U.dist(P.x,P.y,a.x,a.y)<rr&&W.los(P.x,P.y,a.x,a.y,1.5)){
      a.found=true;PH.AU.play('blip');PH.FX.text(a.x,a.y,'魚骨縫線','#7fd0e6');
      PH.UI.once('anchor','發現魚骨縫線！走到它旁邊點一下開始畫縫，再點另一個縫點就完成。',7);
    }
  }
};
SM.usable=function(a){return a.found&&W.anchorOn(a)&&!(a.off&&PH.L.f[a.off]);};
SM.startable=function(a){const P=PH.P;return a.found&&!(a.off&&PH.L.f[a.off])&&U.dist(P.x,P.y,a.x,a.y)<=CFG.seam.reach+P.r;};
// 合法性：回傳距離、消耗與不合法的原因
SM.check=function(a,b){
  const L=PH.L,P=PH.P,cost=L.def.free?0:CFG.seam.cost;
  const r={ok:false,cost:cost,dist:U.dist(a.x,a.y,b.x,b.y),why:''};
  const pairs=[].concat(a.pair);
  if(!W.anchorOn(a))r.why=a.offMsg||'這個縫點現在不能用。';
  else if(!W.anchorOn(b))r.why=b.offMsg||'另一端現在不能用。';
  else if(pairs.indexOf(b.id)<0)r.why='這兩個縫點接不起來。';
  else if(a.sealUntil||b.sealUntil||a.sealing>0||b.sealing>0)r.why='被膠帶封住了，要等一陣子。';
  else if(a.wipedUntil||b.wipedUntil)r.why='爪痕被擦掉了，還沒乾。';
  else if(r.dist>CFG.seam.maxDist+1e-6)r.why='太遠了（'+r.dist.toFixed(1)+' 公尺，上限 '+CFG.seam.maxDist+'）。';
  else if(P.energy<cost)r.why='奇妙值不足（需要 '+cost+'）。';
  else r.ok=true;
  return r;
};
SM.begin=function(){
  const L=PH.L,P=PH.P;
  if(SM.draw)return true;
  if(PH.S.mode!=='play'||P.hidden||P.warp||P.pipe||P.fly)return false;
  if(P.form==='shadow'||P.form==='liquid'){PH.UI.say('這個形態抓不開縫，先變回來。',2.5);PH.AU.play('no');return false;}
  let any=false;for(const a of L.by.anchor)if(SM.startable(a))any=true;
  if(!any){PH.UI.say('附近沒有發現魚骨縫線。要先走近縫點。',2.5);PH.AU.play('no');return false;}
  // 起點自動選最近、能用的縫點；玩家只要點終點
  let from=null;
  for(const a of L.by.anchor)if(SM.startable(a)&&(!from||U.dist(P.x,P.y,a.x,a.y)<U.dist(P.x,P.y,from.x,from.y)))from=a;
  SM.draw={from:from,cx:-1,cy:-1,hover:null,res:null,fresh:true,downA:null};
  PH.AU.play('scratch');
  PH.UI.once('drawhow','畫縫模式：起點已經選好（黃色），指標也停在建議的縫點上——直接點一下就完成。點空白處取消。時間會變慢最多 2 秒。',8);
  return true;
};
SM.end=function(){SM.draw=null;};
// 起點能接的縫點（已發現的）
SM.cands=function(a){
  if(!a)return [];
  const out=[],pairs=[].concat(a.pair);
  for(const b of PH.L.by.anchor)if(b!==a&&b.found&&pairs.indexOf(b.id)>=0&&!(b.off&&PH.L.f[b.off]))out.push(b);
  return out;
};
function setHover(D,b){D.hover=b&&b!==D.from?b:null;D.res=D.hover&&D.from?SM.check(D.from,D.hover):null;}
function tryLink(D,b){
  const r=SM.check(D.from,b);
  if(r.ok){SM.create(D.from,b,r);SM.end();return true;}
  if(SM.startable(b)&&[].concat(D.from.pair).indexOf(b.id)<0){D.from=b;setHover(D,null);PH.AU.play('scratch');return false;}   // 點到另一個起點：改用它當起點
  PH.UI.say(r.why+'（沒有扣奇妙值）',3.2);PH.AU.play('no');   // 無效操作顯示原因，不扣能量
  return false;
}
// 點一下縫點：沒有起點就設為起點；點起點本身取消選取；點別的就嘗試連接
SM.click=function(a){
  const D=SM.draw;if(!D||!a)return;
  if(!D.from){
    if(SM.startable(a)){D.from=a;PH.AU.play('scratch');}
    else{PH.UI.say('起點要選你身邊的縫點（亮藍色的）。',2.6);PH.AU.play('no');}
    return;
  }
  if(a===D.from){D.from=null;setHover(D,null);return;}
  tryLink(D,a);
};
// E 確認：接到滑鼠指著的縫點，沒有的話接到建議的縫點
SM.confirm=function(){
  const D=SM.draw;if(!D)return;
  if(!D.from){PH.UI.say('先點你身邊的縫點當起點。',2.6);PH.AU.play('no');return;}
  let b=D.hover;
  if(!b){const c=SM.cands(D.from);let best=null;for(const x of c){const ok=SM.check(D.from,x).ok;if(!best||(ok&&!best.ok))best={a:x,ok:ok};}b=best&&best.a;}
  if(!b){PH.UI.say('這個縫點附近還沒發現能接的另一端。',2.8);PH.AU.play('no');return;}
  tryLink(D,b);
};
SM.pick=function(x,y,needStart){
  let best=null,bd=PH.L.def.tutorial?CFG.seam.tutorSnap:CFG.seam.snap;
  for(const s of SM.screen){
    if(needStart&&!s.start)continue;
    const d=Math.hypot(s.x-x,s.y-y);if(d<bd){bd=d;best=s.a;}
  }
  return best;
};
// 指標事件（座標是舞台像素）。畫縫模式裡滑鼠／手指只用來選縫點，不轉鏡頭。
// 主要是「點一下」；從起點拖到終點放開也可以（觸控習慣）。
SM.ptr=function(type,x,y){
  const D=SM.draw;if(!D)return;
  D.cx=x;D.cy=y;
  const a=SM.pick(x,y,false);
  if(type==='down'){D.downA=a;D.pressed=true;return;}
  if(type==='move'){if(D.from)setHover(D,a);return;}
  if(type==='up'){
    if(!D.pressed)return;   // 進入畫縫模式的那一下點擊，放開時不算數
    const s=D.downA;D.downA=null;D.pressed=false;
    if(s&&a&&s!==a&&SM.startable(s)){D.from=s;tryLink(D,a);return;}   // 拖曳連接
    if(a&&a===s)SM.click(a);
    else if(!a&&!s)SM.end();   // 點空白處：取消畫縫
  }
};
SM.create=function(a,b,r){
  const L=PH.L,P=PH.P;
  P.energy-=r.cost;
  SM.seam={a:a,b:b,t:0,state:'build',life:CFG.seam.life,uses:CFG.seam.uses};   // 新的一組取代舊的一組
  a.marked=b.marked=true;L.stats.seams++;
  PH.AU.play('seam');PH.AU.note(0);
  PH.FX.poof(a.x,a.y,8,'#7fd0e6');PH.FX.poof(b.x,b.y,8,'#7fd0e6');
};
SM.close=function(msg){
  if(!SM.seam)return;
  SM.seam=null;if(msg)PH.UI.say(msg,2.6);PH.AU.play('seamclose');
};
SM.update=function(dt){
  const s=SM.seam;if(!s)return;
  s.t+=dt;
  if(s.state==='build'&&s.t>=CFG.seam.build){s.state='open';PH.AU.play('seamopen');}
  if(s.state==='open'){
    s.life-=dt;
    if(!W.anchorOn(s.a)||!W.anchorOn(s.b))return SM.close('縫點移位了，貓縫合起來了。');
    if((s.life<=0||s.uses<=0)&&!PH.P.warp)SM.close(s.uses<=0?'貓縫用了兩次，合起來了。':'貓縫時間到，合起來了。');
  }
};
SM.other=function(a){const s=SM.seam;return s.a===a?s.b:s.a;};
SM.nearEnd=function(){
  const s=SM.seam,P=PH.P;if(!s||s.state!=='open')return null;
  const da=U.dist(P.x,P.y,s.a.x,s.a.y),db=U.dist(P.x,P.y,s.b.x,s.b.y);
  const d=Math.min(da,db);
  return d<1.05+P.r?{a:da<db?s.a:s.b,d:d}:null;
};
SM.enter=function(a){
  const L=PH.L,P=PH.P;if(!SM.seam||P.warp)return;
  const b=SM.other(a);
  if(P.form==='shadow'||P.form==='liquid'){PH.UI.say('這個形態鑽不了貓縫。',2.5);PH.AU.play('no');return;}
  const land=W.findFit(b.x,b.y,P.form,0.75);
  if(!land){PH.UI.say('出口被堵住了，鑽不過去。',3);PH.AU.play('no');return;}   // 不把貓擠進物件
  let danger=false,ext=null;
  for(const d of L.dogs){
    if(!d.active)continue;
    if(U.dist(d.x,d.y,b.x,b.y)<1.7&&d.stunT<=0&&d.state!=='sleep')danger=true;
    if((d.state==='chase'||d.state==='pounce')&&U.dist(d.x,d.y,P.x,P.y)<CFG.seam.extreme)ext=d;
  }
  const bossExt=PH.Boss&&PH.Boss.extreme&&PH.Boss.extreme();
  P.warp={from:a,to:b,land:land,t:0,done:false};P.vx=P.vy=0;
  PH.Dogs.sawSeam(a,b,'enter');
  PH.AU.play('warp');PH.AU.note(1);
  if(ext||bossExt){
    // 極限鑽縫：小量回能＋毛球假尾巴，不是必須才能逃脫
    L.stats.extreme++;P.energy=Math.min(CFG.energyMax,P.energy+CFG.seam.extremeBonus);
    PH.FX.text(P.x,P.y,'極限鑽縫！','#ffd23f');PH.AU.note(2);
    if(ext)PH.Dogs.stun(ext,'faketail',1.8);
    PH.UI.once('extreme','極限鑽縫！狗只咬到一條毛球假尾巴。',5);
  }
  if(danger)PH.UI.say('小心，出口旁邊有狗！',2.5);
};
// 穿越：前半段還在入口（可被抓），後半段已經在出口
SM.warpTick=function(dt){
  const P=PH.P,w=P.warp;w.t+=dt;
  if(!w.done&&w.t>=0.32){
    w.done=true;P.x=w.land.x;P.y=w.land.y;P.lastSafe.x=P.x;P.lastSafe.y=P.y;
    if(SM.seam)SM.seam.uses--;
    PH.Dogs.sawSeam(w.to,w.from,'exit');
    PH.FX.poof(P.x,P.y,8,'#7fd0e6');PH.S.camSnap=true;
  }
  if(w.t>=0.62){P.warp=null;P.grace=Math.max(P.grace,0.2);}
};
SM.seal=function(a,dur){
  a.sealUntil=PH.L.t+(dur||CFG.seam.sealDur);a.sealing=0;
  if(SM.seam&&(SM.seam.a===a||SM.seam.b===a)&&!PH.P.warp)SM.close('貓縫被膠帶封住了！換另一條路。');
};
SM.wipe=function(a){
  a.wipedUntil=PH.L.t+CFG.seam.wipeDur;a.marked=false;
  if(SM.seam&&(SM.seam.a===a||SM.seam.b===a)&&!PH.P.warp)SM.close('爪痕被拖把擦掉了！');
};
})();
