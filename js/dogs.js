/* 汪汪秩序局：巡邏 → 懷疑 → 調查 → 追逐 → 最後目擊位置搜尋 → 返回巡邏
   狗只靠視線、聲音、氣味、合法通報更新目標；不會憑空知道貓在哪，也不會憑空知道貓縫另一端。 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,CFG=PH.CFG,W=PH.World,F=PH.FORMS;
const D=PH.Dogs={};
// sp：[巡邏, 調查, 追逐] 速度（公尺/秒）
const KINDS=PH.DOGKINDS={
  shiba:{name:'哨兵柴柴',vis:7,cone:0.68,hear:1,sp:[1.75,2.6,3.85]},
  nose:{name:'鼻鼻警官',vis:5,cone:0.6,hear:1,smell:true,sp:[1.6,2.5,3.6]},
  ear:{name:'大耳警官',vis:5.5,cone:0.6,hear:2,sp:[1.7,2.7,3.8]},
  poodle:{name:'燈泡貴賓',vis:8.5,cone:0.45,hear:0.8,lamp:true,sp:[1.5,2.3,3.6]},
  captain:{name:'呼呼隊長',vis:6,cone:0.7,hear:1,sleeper:true,sp:[1.6,2.3,3.5]},
  corgi:{name:'警報柯基',vis:6.5,cone:0.7,hear:1.2,alarm:true,sp:[1.8,2.6,3.5]},
  bulldog:{name:'重裝鬥牛犬',vis:6,cone:0.6,hear:0.8,heavy:true,turn:1.3,sp:[1.2,1.9,3.0]},
  sleepwalk:{name:'夢遊犬',vis:0,cone:0,hear:1.5,walker:true,sp:[1.1,1.3,1.3]},
  mop:{name:'拖把犬',vis:3.5,cone:0.6,hear:0.6,mop:true,sp:[1.6,2.0,3.2]}
};
const CALM=['patrol','scan','post','return','look','walk'];
function mk(def){
  const K=KINDS[def.kind];
  return {def:def,id:def.id,kind:def.kind,K:K,x:def.x,y:def.y,ang:def.face||0,tang:def.face||0,state:'patrol',timer:0,meter:0,
    sees:false,lostT:9,last:{x:def.x,y:def.y},path:[],repath:0,tgx:0,tgy:0,wp:0,dir:1,route:def.route||[[def.x,def.y]],active:!def.at,
    stunT:0,stunKind:'',immune:{},sleepy:0,why:'',witness:null,tgtA:null,slide:null,barked:false,exit:false,busy:false,
    spawnT:0,moving:false,crumbT:0,prev:'patrol',susT:0,cueT:0,base:0,ph:0,pd:{x:0,y:0}};
}
function home(d){d.state=d.K.sleeper?'sleep':d.def.post?'post':d.K.walker?'walk':d.def.lurk&&!PH.L.T.dogIn?'lurk':'patrol';}
D.init=function(){
  const L=PH.L;L.dogs=(L.def.dogs||[]).map(mk);
  for(const d of L.dogs)home(d);
};
D.routes=function(){
  const L=PH.L;
  for(const d of L.dogs){
    const two=L.theft&&d.def.route2&&(L.f.lockdown||(L.def.maxAlert!=null&&L.def.maxAlert<2));
    d.route=d.exit&&L.def.exitRoute?L.def.exitRoute:two?d.def.route2:(d.def.route||[[d.def.x,d.def.y]]);
    if(d.wp>=d.route.length)d.wp=0;
  }
};
// 重來時：狗回到離貓最遠的巡邏點，重生點不會落在立即可抓的範圍
D.reset=function(act){
  const L=PH.L,P=PH.P;
  L.decoy=null;L.lure=null;
  L.dogs.forEach(function(d,i){
    d.active=act?!!act[i]:!d.def.at;d.exit=false;
    d.stunT=0;d.stunKind='';d.immune={};d.meter=0;d.sees=false;d.lostT=9;d.path=[];d.witness=null;d.tgtA=null;d.slide=null;d.busy=false;d.sleepy=0;d.spawnT=0;d.barked=false;
    home(d);
  });
  D.routes();
  for(const d of L.dogs){
    if(d.K.sleeper||d.def.post||d.state==='lurk'){d.x=d.def.x;d.y=d.def.y;d.ang=d.tang=d.def.face||0;continue;}
    let bi=0,bd=-1;
    d.route.forEach(function(w,i){const q=U.dist(w[0],w[1],P.x,P.y);if(q>bd){bd=q;bi=i;}});
    d.x=d.route[bi][0];d.y=d.route[bi][1];d.wp=bi;
  }
  L.T.captAwake=0;
};
D.any=function(list){for(const d of PH.L.dogs)if(d.active&&list.indexOf(d.state)>=0)return true;return false;};
D.release=function(id){for(const d of PH.L.dogs)if(d.id===id&&d.state==='lurk'){d.state='patrol';d.wp=0;}};

/* ---------- 感知 ---------- */
function rawSee(d,x,y,range){
  const dx=x-d.x,dy=y-d.y,dd=Math.hypot(dx,dy);
  if(dd>range)return false;
  if(dd>1.3&&Math.abs(U.angd(d.ang,Math.atan2(dy,dx)))>d.K.cone+0.15&&d.state!=='chase')return false;
  return W.los(d.x,d.y,x,y,0.5);
}
// 看見貓的程度（0 = 看不到，越接近 1 越近）。牆與大型物件擋視線。
function sight(d){
  const P=PH.P,L=PH.L,K=d.K,S=PH.S;
  if(!K.vis||(d.stunT>0)||P.grace>0||P.pipe||P.fly||P.form==='shadow')return 0;
  let range=K.vis*F[P.form].vis;
  if(P.hidden){
    if(P.hidden.t==='box'&&P.lift>0.55)range=Math.min(range,4.2);
    else if(P.hidden.t==='plant'&&P.moving)range=Math.min(range,5);
    else return 0;
  }
  if(L.def.trouble==='glow'&&P.hasCan&&!P.hidden)range*=1.35;     // 月光罐：照路也暴露
  if(d.busy)range=Math.min(range,2.2);                           // 低頭施工、擦地時看不遠
  const minH=P.form==='giant'?1.5:0.5;
  const test=function(x,y,mul){
    const dx=x-d.x,dy=y-d.y,dd=Math.hypot(dx,dy);
    if(dd>range)return 0;
    if(dd>1.3&&Math.abs(U.angd(d.ang,Math.atan2(dy,dx)))>K.cone)return 0;
    if(!W.los(d.x,d.y,x,y,minH))return 0;
    return Math.max(0.02,(1-dd/range))*mul;
  };
  let v=test(P.x,P.y,1);
  if(!v&&Math.abs(P.lean)>0.3){const m=P.lean*0.55;v=test(P.x-Math.sin(S.yaw)*m,P.y+Math.cos(S.yaw)*m,0.6);}   // 探頭：露出的部分會被看到
  return v;
}
function catchable(){
  const P=PH.P;
  return P.grace<=0&&!P.hidden&&!P.fly&&!P.pipe&&!(P.warp&&P.warp.done)&&PH.S.mode==='play';
}
function note(d,txt,col){
  if(d.cueT>0)return;d.cueT=1.2;
  PH.FX.text(d.x,d.y,txt,col||'#fff');PH.UI.cue(d.K.name+'：'+txt,d.x,d.y);
}
function investigate(d,x,y,why){
  d.prev=d.def.post?'post':'patrol';d.state='inv';d.last.x=x;d.last.y=y;d.why=why;d.path=[];d.repath=0;d.busy=false;
}
D.hearAll=function(x,y,rad,kind){
  const L=PH.L;
  for(const d of L.dogs){
    if(!d.active||d.stunT>0||d.spawnT>0||d.state==='lurk')continue;
    const dd=U.dist(d.x,d.y,x,y);
    if(dd>rad*d.K.hear)continue;
    if(d.state==='sleep'){
      if(kind==='step'&&rad<4)continue;           // 輕微腳步吵不醒；巨大貓的腳步會
      d.state='wake';d.timer=0.9;d.last.x=x;d.last.y=y;PH.AU.play('yelp');note(d,'嗯？！','#ffd23f');continue;
    }
    if(d.K.walker){if(kind!=='step'){d.state='drift';d.last.x=x;d.last.y=y;d.path=[];d.repath=0;}continue;}
    if(CALM.indexOf(d.state)>=0||d.state==='sus'||d.state==='inv'||d.state==='guard'||d.state==='search'){
      if(d.state==='inv'&&d.why==='pedestal'&&kind==='step')continue;
      investigate(d,x,y,kind);
      if(kind!=='step'||dd<2)note(d,'？','#ffd23f');
    }else if(d.state==='chase'&&!d.sees&&(kind==='echo'||kind==='meow'||kind==='toy'||kind==='burp')){d.last.x=x;d.last.y=y;d.path=[];d.repath=0;}
  }
};
// 氣味：靠鼻子的狗會去查「飄香的舊位置」
D.smellAll=function(x,y,lure){
  const L=PH.L;
  for(const d of L.dogs){
    if(!d.active||d.stunT>0||d.spawnT>0||d.K.walker||d.state==='sleep'||d.state==='lurk')continue;
    if(d.state==='chase'||d.state==='pounce'||d.state==='bark')continue;
    const dd=U.dist(d.x,d.y,x,y);
    if(d.K.smell||(!lure&&dd<5)){investigate(d,x,y,'scent');note(d,'嗅嗅…','#ff8fa3');}
  }
};
D.onTheft=function(ped){
  const L=PH.L;let best=null,bd=1e9;
  for(const d of L.dogs){
    if(!d.active||d.K.sleeper||d.def.post||d.K.walker||d.stunT>0)continue;
    const q=U.dist(d.x,d.y,ped.x,ped.y);if(q<bd){bd=q;best=d;}
  }
  D.routes();
  if(best&&(best.state!=='chase'&&best.state!=='pounce'))investigate(best,ped.fx||ped.x,ped.fy||ped.y,'pedestal');
};
D.spawnAt=function(tag){
  const L=PH.L;
  for(const d of L.dogs){
    if(d.active||d.def.at!==tag)continue;
    d.active=true;d.x=d.def.x;d.y=d.def.y;d.spawnT=1.3;home(d);d.wp=0;
    const door=L.E[d.def.door];if(door)door.openT=3;
    PH.UI.cue(d.K.name+'從側門進場！',d.x,d.y);PH.AU.play('door');
  }
  D.routes();
};
D.exitSearch=function(){
  const L=PH.L;let best=null,bd=1e9;const fb=W.finishBox();
  for(const d of L.dogs){
    if(!d.active||d.K.sleeper||d.def.post||d.K.walker||d.K.mop)continue;
    const q=U.dist(d.x,d.y,fb.x,fb.y)-(d.def.exitGuard?50:0);if(q<bd){bd=q;best=d;}
  }
  if(best){best.exit=true;D.routes();best.wp=0;if(CALM.indexOf(best.state)>=0)best.state='patrol';}
};

/* ---------- 干擾：毛巾、滑倒、轉圈、想睡、威嚇、假尾巴 ---------- */
D.stun=function(d,kind,dur){
  if(d.immune[kind]||d.spawnT>0||d.state==='lurk')return false;     // 恢復後有短暫同類免疫
  if(d.stunT>0&&d.stunKind===kind)return false;
  if(kind==='dizzy'&&d.K.heavy)return false;
  if(d.state==='sleep'&&kind!=='towel')return false;
  d.stunT=dur;d.stunKind=kind;d.meter=0;d.busy=false;d.path=[];d.sees=false;
  if(d.tgtA){d.tgtA.sealing=0;d.tgtA.busyDog=null;}
  PH.L.stats.stuns++;
  PH.AU.play(kind==='sleepy'?'purr':'yelp');
  return true;
};
D.scareAll=function(x,y,r){
  const L=PH.L;
  for(const d of L.dogs){
    if(!d.active||d.stunT>0||d.K.walker||d.state==='sleep'||d.state==='lurk'||U.dist(d.x,d.y,x,y)>r)continue;
    if(d.K.heavy&&Math.abs(U.angd(d.ang,Math.atan2(y-d.y,x-d.x)))<1.1){PH.FX.text(d.x,d.y,'哼！','#fff');PH.UI.once('heavy','重裝鬥牛犬不怕正面威嚇。牠轉身很慢，走窄路繞過去。',6);continue;}
    if(D.stun(d,'scared',2.6)){PH.FX.text(d.x,d.y,'嗚？！','#ffd23f');if(d.K.alarm&&!d.barked)d.pendBark=true;}
  }
};
// 附近有沒有呼嚕得睡的狗（給 E 的情境提示用）
D.canPurr=function(x,y){
  const L=PH.L;let best=null,bd=3.3;
  for(const d of L.dogs){
    if(!d.active||d.stunT>0||d.immune.sleepy||d.K.walker)continue;
    if(CALM.indexOf(d.state)<0||d.meter>0.3)continue;
    const dd=U.dist(d.x,d.y,x,y);if(dd<=bd){bd=dd;best=d;}
  }
  return best;
};
D.purr=function(x,y,dt){
  const L=PH.L;
  for(const d of L.dogs){
    if(!d.active||d.stunT>0||d.immune.sleepy||U.dist(d.x,d.y,x,y)>3.3)continue;
    if(CALM.indexOf(d.state)<0||d.meter>0.3||d.K.walker)continue;        // 追逐中無效，需持續施放
    d.sleepy+=dt*1.5;
    if(d.sleepy>=2.5){d.sleepy=0;D.stun(d,'sleepy',8);PH.FX.text(d.x,d.y,'呼嚕…好睏','#8fc3b4');PH.UI.once('purr','呼嚕共鳴成功！低警戒的狗會睏一陣子。',5);}
  }
};
// 親眼看到貓躲進去：會過去檢查
D.sawHide=function(e){
  const L=PH.L,P=PH.P;
  for(const d of L.dogs){
    if(!d.active||d.stunT>0||!d.K.vis||d.state==='sleep'||d.state==='lurk'||P.grace>0)continue;
    if(rawSee(d,e.x,e.y,d.K.vis)){d.witness=e;d.state='inspect';d.path=[];d.repath=0;d.why='box';note(d,'在那裡！','#ef5d50');}
  }
};
// 目擊貓使用貓縫：知道那一端；兩端都看過才知道關聯
D.sawSeam=function(a,b,type){
  const L=PH.L;if(L.def.tutorial)return;
  for(const d of L.dogs){
    if(!d.active||d.stunT>0||!d.K.vis||d.state==='sleep'||d.state==='lurk'||d.K.walker)continue;
    if(!rawSee(d,a.x,a.y,d.K.vis*1.15))continue;
    a.known=true;
    if(b.known){a.link=true;b.link=true;}
    if(type==='enter'){
      if(d.def.guardExit&&a.link){d.state='guard';d.tgtA=b;d.path=[];d.repath=0;d.timer=9;note(d,'繞去另一頭！','#ef5d50');}
      else if(!a.sealUntil&&!a.busyDog){d.state='seal';d.tgtA=a;a.busyDog=d;d.path=[];d.repath=0;note(d,'有縫！拿膠帶！','#ef5d50');}
    }
  }
};

/* ---------- 移動 ---------- */
function go(d,tx,ty,speed,dt){
  const L=PH.L;
  d.repath-=dt;
  if(d.repath<=0||Math.abs(d.tgx-tx)+Math.abs(d.tgy-ty)>0.7){d.path=W.path(d.x,d.y,tx,ty);d.repath=0.45;d.tgx=tx;d.tgy=ty;}
  if(L.def.dogBoat&&W.kind(Math.floor(d.x),Math.floor(d.y))==='hazard')speed*=0.6;      // 划鍋蓋船比較慢
  let px=tx,py=ty;if(d.path.length){px=d.path[0].x;py=d.path[0].y;}
  const dx=px-d.x,dy=py-d.y,dd=Math.hypot(dx,dy);
  if(dd<0.14){if(d.path.length){d.path.shift();return false;}return true;}
  const st=Math.min(dd,speed*dt),nx=d.x+dx/dd*st,ny=d.y+dy/dd*st;
  if(!d.path.length&&!W.dogPass(Math.floor(nx),Math.floor(ny)))return true;
  d.x=nx;d.y=ny;d.tang=Math.atan2(dy,dx);d.moving=true;
  return false;
}
function confirm(d,why){
  const L=PH.L,P=PH.P;
  d.why=why||'seen';d.meter=1;d.last.x=P.x;d.last.y=P.y;d.path=[];d.repath=0;d.busy=false;
  if(d.tgtA){d.tgtA.sealing=0;d.tgtA.busyDog=null;d.tgtA=null;}
  L.stats.detected++;L.T.calm=0;
  if(P.hasCan)L.T.confirm=1;
  if(d.K.alarm&&!d.barked&&L.theft&&L.alert<3&&(L.def.maxAlert==null||L.def.maxAlert>=3)){
    d.state='bark';d.timer=1.5;PH.AU.play('inhale');note(d,'吸——（要叫增援了）','#ef5d50');
    PH.UI.once('corgi','警報柯基吸氣時，躲到牠看不到的地方或用毛巾蓋住牠，就能打斷警報。',7);
  }else{d.state='chase';PH.AU.play('bark');d.cueT=0;note(d,'汪！','#ef5d50');}
  PH.AU.mood('chase');
}
function nextWp(d){
  const n=d.route.length;if(n<2)return;
  d.wp=(d.wp+1)%n;
}
function upd(d,dt){
  const L=PH.L,P=PH.P,K=d.K,SM=PH.Seams;
  d.moving=false;d.cueT=Math.max(0,d.cueT-dt);d.sleepy=Math.max(0,d.sleepy-dt*0.4);
  for(const k in d.immune){d.immune[k]-=dt;if(d.immune[k]<=0)delete d.immune[k];}
  if(d.spawnT>0){d.spawnT-=dt;return;}
  if(d.state==='lurk')return;
  if(d.stunT>0){
    d.stunT-=dt;
    if(d.stunKind==='dizzy')d.ang+=dt*9;
    else if(d.stunKind==='towel')d.ang+=Math.sin(L.t*9)*dt*4;
    else if(d.stunKind==='slip'&&d.slide){const q=d.slide,dd=U.dist(d.x,d.y,q.x,q.y);if(dd>0.15){d.x+=(q.x-d.x)/dd*Math.min(dd,7*dt);d.y+=(q.y-d.y)/dd*Math.min(dd,7*dt);d.ang+=dt*12;}}
    else if(d.stunKind==='scared'){
      const a=Math.atan2(d.y-P.y,d.x-P.x),nx=d.x+Math.cos(a)*2.6*dt,ny=d.y+Math.sin(a)*2.6*dt;
      if(W.dogPass(Math.floor(nx),Math.floor(ny))){d.x=nx;d.y=ny;}d.tang=a+Math.PI;d.ang=U.turn(d.ang,d.tang,dt*8);
    }
    if(d.stunT<=0){
      d.immune[d.stunKind]=CFG.dog.immune;d.slide=null;
      if(d.pendBark){d.pendBark=false;d.state='bark';d.timer=1.2;PH.AU.play('inhale');note(d,'吸——！','#ef5d50');}
      else if(K.walker)d.state='walk';
      else{d.state='search';d.timer=3;}      // 清醒後依最後線索搜尋，不是瞬間鎖定玩家
      d.stunKind='';
    }
    return;
  }
  // 視線與懷疑值
  const s=sight(d);d.sees=s>0;
  if(d.sees)d.lostT=0;else d.lostT+=dt;
  if(d.state!=='chase'&&d.state!=='pounce'&&d.state!=='recover'&&d.state!=='bark'&&d.state!=='sleep'&&d.state!=='wake'){
    if(s>0)d.meter=Math.min(1,d.meter+dt/U.lerp(CFG.dog.seeFar,CFG.dog.seeNear,s));
    else d.meter=Math.max(0,d.meter-dt*0.55);
    // 鼻鼻警官：近距離聞得到罐香（躲在紙箱裡也一樣）
    if(K.smell&&P.hasCan&&P.grace<=0&&U.dist(d.x,d.y,P.x,P.y)<2.3&&!P.pipe&&!P.fly){
      d.meter=Math.min(1,d.meter+dt*0.9);
      if(d.meter>=1&&P.hidden&&d.state!=='inspect'){d.witness=P.hidden;d.state='inspect';d.why='sniff';d.path=[];note(d,'罐香！','#ff8fa3');}
    }
    if(d.meter>=1&&s>0)confirm(d,'seen');
  }
  // 毛球替身：看到會先去查，嗅一嗅才識破
  const k=L.decoy;
  if(k&&K.vis&&(CALM.indexOf(d.state)>=0||d.state==='sus'||(d.state==='chase'&&!d.sees))&&rawSee(d,k.x,k.y,K.vis)){
    if(d.state==='chase'){d.last.x=k.x;d.last.y=k.y;}else{investigate(d,k.x,k.y,'decoy');note(d,'那是…貓？','#ffd23f');}
  }
  switch(d.state){
  case 'sleep':
    L.T.captSleep=1;
    if(P.form==='giant'&&!P.hidden&&U.dist(d.x,d.y,P.x,P.y)<3){d.state='wake';d.timer=0.9;d.last.x=P.x;d.last.y=P.y;note(d,'誰？！','#ffd23f');}
    break;
  case 'wake':
    d.timer-=dt;if(d.timer<=0){investigate(d,d.last.x,d.last.y,'woke');d.prev='sleep';}
    break;
  case 'post':
    d.tang=d.def.face||0;
    if(U.dist(d.x,d.y,d.def.x,d.def.y)>0.3){d.state='return';}
    else if(d.meter>0.35){d.prev='post';d.state='sus';d.susT=0;PH.AU.play('sus');}
    break;
  case 'walk':{        // 夢遊犬：閉著眼走固定路線
    const w=d.route[d.wp];
    if(go(d,w[0],w[1],K.sp[0],dt))nextWp(d);
    break;}
  case 'drift':        // 夢遊犬被聲音帶偏
    if(go(d,d.last.x,d.last.y,K.sp[1],dt)){d.timer=(d.timer||0)+dt;if(d.timer>1.5){d.timer=0;d.state='walk';}}
    break;
  case 'patrol':{
    const w=d.route[d.wp];
    if(d.meter>0.35){d.prev='patrol';d.state='sus';d.susT=0;PH.AU.play('sus');break;}
    // 封縫組：主動去封已經確認過的縫點
    if(d.def.sealer&&L.f.lockdown){
      for(const a of L.by.anchor)if(a.known&&!a.sealUntil&&!a.busyDog&&W.anchorOn(a)){d.state='seal';d.tgtA=a;a.busyDog=d;d.path=[];d.repath=0;break;}
      if(d.state==='seal')break;
    }
    // 拖把犬：去擦已經用過、現在閒置的爪痕
    if(K.mop){
      d.timer-=dt;
      if(d.timer<=0){
        d.timer=3;let best=null,bd=14;
        for(const a of L.by.anchor){
          if(!a.marked||a.wipedUntil||a.busyDog||(SM.seam&&(SM.seam.a===a||SM.seam.b===a)))continue;
          const pth=W.path(d.x,d.y,a.x,a.y);if(!pth.reach&&U.dist(d.x,d.y,a.x,a.y)>1.2)continue;
          const q=U.dist(d.x,d.y,a.x,a.y);if(q<bd){bd=q;best=a;}
        }
        if(best){d.state='wipe';d.tgtA=best;best.busyDog=d;d.path=[];d.repath=0;break;}
      }
    }
    if(go(d,w[0],w[1],K.sp[0],dt)){
      if(w[2]){d.state='scan';d.timer=CFG.dog.scan;d.base=d.ang;}
      else nextWp(d);
    }
    break;}
  case 'scan':
    d.timer-=dt;d.tang=d.base+Math.sin((CFG.dog.scan-d.timer)*3.2)*1.0;
    if(d.meter>0.35){d.prev='patrol';d.state='sus';d.susT=0;PH.AU.play('sus');}
    else if(d.timer<=0){nextWp(d);d.state='patrol';}
    break;
  case 'sus':
    d.susT+=dt;
    if(s>0){d.tang=Math.atan2(P.y-d.y,P.x-d.x);d.last.x=P.x;d.last.y=P.y;}
    if(d.meter<=0.02)d.state=d.prev==='post'?'post':'return';
    else if(d.susT>1.3&&s<=0){const pv=d.prev;investigate(d,d.last.x,d.last.y,'glimpse');d.prev=pv;}
    break;
  case 'inv':
    if(go(d,d.last.x,d.last.y,K.sp[1],dt)){d.state='look';d.timer=2.6;d.base=d.ang;if(d.why==='scent'||d.why==='trail')note(d,'嗅嗅…','#ff8fa3');}
    if(d.why==='decoy'&&L.decoy){d.last.x=L.decoy.x;d.last.y=L.decoy.y;if(U.dist(d.x,d.y,L.decoy.x,L.decoy.y)<1.1){L.decoy=null;note(d,'嗅…假的！','#fff');d.state='look';d.timer=2;d.base=d.ang;}}
    break;
  case 'look':
    d.timer-=dt;d.tang=d.base+Math.sin((2.6-d.timer)*3)*1.2;
    if(d.timer<=0){
      // 沿著地上的罐香一路聞過去；過水的地方線索會斷
      if(K.smell&&L.crumbs.length){
        let nx=null;
        for(const c of L.crumbs)if(c.t>d.crumbT&&U.dist(d.x,d.y,c.x,c.y)<2.8&&(!nx||c.t>nx.t))nx=c;
        if(nx){d.crumbT=nx.t;const pv=d.prev;investigate(d,nx.x,nx.y,'trail');d.prev=pv;break;}
      }
      d.state='return';
    }
    break;
  case 'bark':
    d.timer-=dt;d.tang=Math.atan2(P.y-d.y,P.x-d.x);
    if(d.lostT>0.6){d.state='chase';note(d,'嗚？（警報被打斷）','#fff');break;}       // 打斷視線就叫不出來
    if(d.timer<=0){d.barked=true;PH.AU.play('howl');PH.FX.text(d.x,d.y,'汪汪汪汪！','#ef5d50');W.reinforce();d.state='chase';}
    break;
  case 'chase':{
    if(d.sees){d.last.x=P.x;d.last.y=P.y;}
    const dd=U.dist(d.x,d.y,P.x,P.y);
    if(d.sees&&dd<CFG.dog.pounceRange){d.state='pounce';d.ph=0;d.timer=CFG.dog.pounceWind;PH.AU.play('growl');break;}
    const arrived=go(d,d.last.x,d.last.y,K.sp[2],dt);
    if(!d.sees&&(arrived||d.lostT>4)){d.state='search';d.timer=4;d.base=d.ang;note(d,'跑去哪了…','#ffd23f');}
    break;}
  case 'pounce':
    // 撲抓：先壓低預備，再沿固定方向衝出去；只在衝刺階段判定命中
    d.timer-=dt;
    if(d.ph===0){
      if(d.timer>0.14){d.tang=Math.atan2(P.y-d.y,P.x-d.x);d.pd.x=Math.cos(d.tang);d.pd.y=Math.sin(d.tang);}
      if(d.timer<=0){d.ph=1;d.timer=CFG.dog.pounceDash;PH.AU.play('whoosh');}
    }else{
      const nx=d.x+d.pd.x*CFG.dog.pounceSpeed*dt,ny=d.y+d.pd.y*CFG.dog.pounceSpeed*dt;
      if(W.dogPass(Math.floor(nx),Math.floor(ny))){d.x=nx;d.y=ny;}else d.timer=0;
      if(catchable()&&U.dist(d.x,d.y,P.x,P.y)<0.5+P.r*0.7){PH.Game.caught(d.why==='box'?'box':'pounce',d);return;}
      if(d.timer<=0){d.state='recover';d.timer=CFG.dog.recover;}
    }
    break;
  case 'recover':
    d.timer-=dt;if(d.timer<=0)d.state='chase';
    break;
  case 'search':
    d.timer-=dt;d.tang=(d.base||d.ang)+Math.sin((4-d.timer)*2.4)*1.4;
    if(d.timer<=0){d.state='return';PH.AU.mood('calm');}
    break;
  case 'inspect':{
    const e=d.witness;
    if(!e){d.state='search';d.timer=3;break;}
    if(go(d,e.x,e.y,K.sp[2],dt)||U.dist(d.x,d.y,e.x,e.y)<1.0){
      d.timer=(d.timer>0&&d.timer<1)?d.timer-dt:0.9;
      if(d.timer<=0.1){
        d.timer=0;d.witness=null;
        if(P.hidden===e&&P.grace<=0){PH.Game.caught(d.why==='sniff'?'sniff':e.t==='plant'?'plant':'box',d);return;}
        d.state='search';d.timer=3;d.base=d.ang;note(d,'空的…','#fff');
      }
    }
    break;}
  case 'seal':{
    const a=d.tgtA;
    if(!a||a.sealUntil||!W.anchorOn(a)){if(a)a.busyDog=null;d.tgtA=null;d.busy=false;d.state='return';break;}
    if(U.dist(d.x,d.y,a.x,a.y)<1.15||go(d,a.x,a.y,K.sp[1],dt)){
      // 封縫施工：有動畫與膠帶聲預告，約 3 秒完成
      if(!d.busy){d.busy=true;PH.AU.play('tape');PH.UI.cue('嘶——（膠帶聲）',a.x,a.y);PH.UI.once('seal','狗看到你用貓縫，正在拿膠帶封那個縫點（約 3 秒）。趁牠施工繞過去，或換另一組縫點。',8);}
      d.tang=Math.atan2(a.y-d.y,a.x-d.x);
      a.sealing+=dt/CFG.seam.sealTime;
      if(a.sealing>=1){SM.seal(a);a.busyDog=null;d.tgtA=null;d.busy=false;d.state='return';PH.FX.text(a.x,a.y,'封！','#ffd23f');}
    }
    break;}
  case 'wipe':{
    const a=d.tgtA;
    if(!a||a.wipedUntil){if(a)a.busyDog=null;d.tgtA=null;d.busy=false;d.state='return';break;}
    if(U.dist(d.x,d.y,a.x,a.y)<1.15||go(d,a.x,a.y,K.sp[0],dt)){
      if(!d.busy){d.busy=true;d.timer=CFG.seam.wipeTime;PH.UI.cue('唰、唰……（拖把聲）',a.x,a.y);PH.UI.once('mop','拖把犬會擦掉你用過、閒置的爪痕。牠低頭擦地時看不遠。',7);}
      d.timer-=dt;d.tang=Math.atan2(a.y-d.y,a.x-d.x)+Math.sin(L.t*8)*0.4;
      if(d.timer<=0){SM.wipe(a);a.busyDog=null;d.tgtA=null;d.busy=false;d.state='return';d.timer=4;}
    }
    break;}
  case 'guard':{       // 守口：繞到已知的另一端等
    const a=d.tgtA;
    if(!a){d.state='return';break;}
    if(U.dist(d.x,d.y,a.x,a.y)<1.3||go(d,a.x,a.y,K.sp[2],dt)){
      d.timer-=dt;d.tang=Math.atan2(a.y-d.y,a.x-d.x)+Math.sin(L.t*2)*0.8;
      if(d.meter>0.35&&s>0){d.prev='patrol';d.state='sus';d.susT=0;}
      if(d.timer<=0){d.tgtA=null;d.state='return';}
    }
    break;}
  case 'return':{
    if(K.sleeper){
      if(go(d,d.def.x,d.def.y,K.sp[0],dt)){d.state='sleep';L.T.captAwake=0;PH.UI.cue('呼……嚕……',d.x,d.y);}
    }else if(d.def.post){
      if(go(d,d.def.x,d.def.y,K.sp[0],dt))d.state='post';
    }else{
      const w=d.route[d.wp];
      if(go(d,w[0],w[1],K.sp[0],dt))d.state='patrol';
    }
    if(d.meter>0.35){d.prev=d.def.post?'post':'patrol';d.state='sus';d.susT=0;PH.AU.play('sus');}
    break;}
  }
  if(K.sleeper&&d.state!=='sleep')L.T.captAwake=1;
  d.ang=U.turn(d.ang,d.tang,(K.turn||7)*dt);
  // 貼身接觸：正在追的狗、夢遊犬
  if(catchable()&&P.form!=='shadow'){
    const dd=U.dist(d.x,d.y,P.x,P.y);
    if(K.walker&&dd<0.55+P.r*0.5){PH.Game.caught('walker',d);return;}
    if((d.state==='chase'||d.state==='guard')&&d.sees&&dd<0.45+P.r*0.5){PH.Game.caught('pounce',d);return;}
    if(d.state==='post'&&d.sees&&dd<1.0+P.r){confirm(d,'seen');}
  }
}
D.update=function(dt){
  const L=PH.L;
  L.T.captSleep=0;
  for(const d of L.dogs){
    if(!d.active)continue;
    upd(d,dt);
    if(PH.S.mode!=='play')return;
  }
  for(const e of L.by.door)if(e.openT>0)e.openT-=dt;
};
// 圖示：給畫面與字幕用
D.icon=function(d){
  if(d.spawnT>0)return 'spawn';
  if(d.stunT>0)return d.stunKind==='sleepy'?'sleep':'stun';
  switch(d.state){
    case 'chase':case 'pounce':case 'recover':case 'bark':return 'chase';
    case 'inspect':return 'inspect';
    case 'sus':return 'sus';
    case 'inv':return 'sus';
    case 'search':case 'look':case 'guard':return 'search';
    case 'seal':return 'seal';
    case 'wipe':return 'wipe';
    case 'sleep':return 'sleep';
    case 'walk':case 'drift':return 'sleep';
  }
  for(const k in d.immune)return 'shield';
  return '';
};
})();
