/* 主流程：開始 → 潛入 → 偷罐 → 逃脫 → 回箱開罐 → 練習區 → 下一關；被抓與檢查點；結局與彩蛋 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,W=PH.World,UI=PH.UI,AU=PH.AU,S=PH.S;
const Game=PH.Game={obj:null};
let last=0,objT=0,cut=null,eggN=0;
const $=function(id){return document.getElementById(id);};

function loadLevel(id){
  const def=PH.LEVELS[id],SV=PH.SAVE;
  S.level=id;S.practice=false;S.yaw=def.start.yaw==null?-Math.PI/2:def.start.yaw;S.pitch=0;S.camSnap=true;
  const L=W.load(id);
  // 已經收過的收藏不會重複出現
  for(const e of L.by.item)if((e.kind==='collect'&&SV.collect[e.id])||(e.kind==='bowl'&&SV.bowls[e.id])||(e.kind==='flavor'&&SV.flavor[e.id]))e.taken=true;
  PH.Player.spawn(def.start.x,def.start.y,def.start.box);
  PH.Dogs.init();PH.Seams.reset();PH.Boss.reset();
  PH.GFX.cut=null;PH.GFX.cutCat=false;
  PH.GFX.load(L);
  W.checkpoint('enter',def.start.x,def.start.y);
  Game.obj=null;objT=0;cut=null;
  return L;
}
Game.start=function(id){
  const def=PH.LEVELS[id];if(!def)return;
  UI.hideAll();UI.clearInput();
  loadLevel(id);
  S.mode='play';
  if(id==='escape')AU.music('boss');else AU.mood('calm');
  if(id!=='escape'){PH.SAVE.at=id;PH.saveGame();}
  UI.say(def.title+'　'+def.name,4);
  UI.lock();
};
Game.toTitle=function(){
  UI.hideAll();UI.clearInput();PH.saveGame();
  loadLevel('prologue');S.mode='title';AU.mood('calm');UI.title();
};
Game.togglePause=function(){
  if(S.mode==='play'){S.mode='pause';UI.clearInput();PH.Seams.end();UI.pause(false);}
  else if(S.mode==='pause'){S.mode='play';UI.overlay('ovPause',false);PH.saveGame();UI.lock();}
};

/* ---------- 被抓與重試 ---------- */
const GAGS={
  pounce:['柴柴把咪嚕叼起來，一臉「我有好好上班」的表情。','「依據秩序局第 3 條：貓不得吃飽。」','咪嚕假裝自己是一顆抱枕。沒有用。','狗撲過來——這次抓到的不是假尾巴。'],
  box:['紙箱被掀開了。咪嚕和狗對看了三秒。','「紙箱不是隱形斗篷。」秩序局這樣寫報告。'],
  sniff:['罐罐太香了，連紙箱都在流口水。','鼻鼻警官：「這個箱子聞起來像晚餐。」'],
  plant:['會走路的盆栽引起了懷疑。','貴賓的燈照過來：這株植物有鬍鬚。'],
  walker:['夢遊犬一把抱住你，還說了一句夢話：「抓到……雞腿……」'],
  collapse:['罐蓋的影子蓋了下來。總督喊：「我撐不了那麼久！」']
};
const WHY={pounce:'原因：牠親眼確認了你的位置，撲抓命中。',box:'原因：牠親眼看見你躲進去。',sniff:'原因：罐罐的香味從藏身處飄出來，被聞到了。',
  plant:'原因：你在盆栽裡亂動時被看見了。',walker:'原因：你擋在夢遊犬的路線上（牠閉著眼，只會被聲音帶偏）。',collapse:'原因：月亮消氣得比你跑得快。'};
Game.caught=function(why,dog){
  const L=PH.L;
  if(S.mode!=='play')return;
  if(L.f.bossOn&&PH.Boss.active){PH.Boss.fault(why==='pounce'||why==='box'?'minion':why);return;}
  L.stats.caught++;S.mode='caught';AU.play('caught');PH.FX.shake(8);UI.clearInput();PH.Seams.end();
  UI.caught(why==='collapse'?'被罐蓋追上了！':'被逮到了！',U.pick(GAGS[why]||GAGS.pounce),
    (WHY[why]||'')+(L.def.tutorial?'　序章不會懲罰你：回到起點，學會的縮小會保留。':L.theft?'　會回到偷罐後的檢查點，罐罐還在身上。':'　會回到最近的安全點，已完成的機關會保留。'));
};
Game.bossRetry=function(){
  S.mode='caught';UI.clearInput();PH.Seams.end();
  UI.caught('三次失誤！','總督把咪嚕拎起來，放回場邊，還拍了拍灰塵。','已解開的月蓋鎖會保留；這個階段的機關與位置會重設，從階段開頭再來一次。');
};
Game.retry=function(){
  if(S.mode!=='caught'&&S.mode!=='play')return;
  UI.overlay('ovCaught',false);
  W.restore();
  S.mode='play';UI.lock();
  AU.mood(PH.Boss.active?'boss':PH.L.theft?'escape':'calm');
};

/* ---------- 過場字卡 ---------- */
function playCut(lines,done){cut={lines:lines,i:0,t:0,done:done};S.mode='cut';UI.cut(lines[0]);}
Game.cutNext=function(){
  if(!cut||cut.t<0.35)return;
  cut.i++;cut.t=0;
  if(cut.i>=cut.lines.length){const d=cut.done;cut=null;UI.overlay('ovCut',false);d();}
  else{UI.cut(cut.lines[cut.i]);AU.play('blip');}
};

/* ---------- 回箱開罐、結算 ---------- */
const RW={mini:'迷你貓',giant:'巨大貓',liquid:'液體貓',shadow:'影子貓',echo:'喵聲投射'};
Game.finish=function(box){
  const L=PH.L,def=L.def,P=PH.P;
  if(S.mode!=='play')return;
  P.hidden=box;P.x=box.x;P.y=box.y;P.vx=P.vy=0;UI.clearInput();PH.Seams.reset();
  PH.GFX.cut={x:box.x,y:box.y};S.camSnap=true;
  AU.play('canopen');
  if(def.final){S.mode='cut';Game.ending();return;}
  AU.mood('calm');
  playCut((def.openCut||['咪嚕回到紙箱。']).slice(),function(){
    // 開罐演出結束才寫入永久能力；重複通關不會重複發獎
    const SV=PH.SAVE;let unlock='';
    if(def.reward){
      if(!SV.unl[def.reward]){SV.unl[def.reward]=true;unlock='永久解鎖：'+RW[def.reward];}
      else unlock=RW[def.reward]+'之前就解鎖過了，不會重複給。';
    }
    SV.cleared[def.id]=1;
    const st=L.stats,b=SV.best[def.id];
    if(!b||st.time<b.time)SV.best[def.id]={time:Math.round(st.time),caught:st.caught};
    if(def.next&&def.next!=='escape')SV.at=def.next;
    PH.saveGame();AU.play('unlock');
    showResult(unlock);
  });
};
function rank(st){
  if(st.caught===0&&st.detected===0)return '宇宙級隱形貓';
  if(st.extreme>=2)return '極限鑽縫藝術家';
  if(st.caught===0)return '沒被抓到的毛球';
  if(st.falls>=3)return '落湯貓';
  if(st.seams===0)return '堅持走路派';
  if(st.caught>=4)return '汪汪秩序局常客';
  if(Object.keys(st.forms).length>=4)return '形態收藏家';
  return '今晚有罐罐的貓';
}
function showResult(unlock){
  const L=PH.L,st=L.stats,def=L.def;
  S.mode='result';
  const forms=Object.keys(st.forms).map(function(k){return PH.FORMS[k].name;}).join('、')||'普通貓';
  UI.result({title:def.title+'完成　'+(def.canName||'練習地圖罐')+'到手',
    rows:[['時間',U.fmtTime(st.time)],['被發現',st.detected+' 次'],['被逮到',st.caught+' 次'],['落水',st.falls+' 次'],['用過的形態',forms],['畫出的貓縫',st.seams+' 組'],['極限鑽縫',st.extreme+' 次']],
    rank:rank(st),unlock:unlock,practice:L.by.exit.length>0,nextLabel:def.next?'直接前往下一關':'看結局'});
}
// 安全練習區：沒有狗，試用剛解鎖的能力
Game.practice=function(){
  const L=PH.L,P=PH.P,box=W.finishBox();
  UI.overlay('ovResult',false);
  S.practice=true;L.theft=false;L.can=null;L.alert=0;P.hasCan=false;L.T={};
  for(const d of L.dogs)d.active=false;
  W.set('practice');W.set('backdoor');
  P.hidden=null;const q=W.findFit(box.x,box.y+0.9,'normal',1.5)||W.nearest(box.x,box.y,'normal');
  P.x=q.x;P.y=q.y;P.form='normal';P.r=PH.FORMS.normal.r;P.energy=100;P.grace=1;
  PH.GFX.cut=null;S.mode='play';S.camSnap=true;UI.lock();
  UI.say('安全練習區開放了：這裡沒有狗。試試新能力，再從亮著的出口前往下一關。',7);
};
Game.next=function(){
  const def=PH.L.def;
  if(def.next)Game.start(def.next);else Game.ending();
};
// 取得宇宙第一罐 → 月亮消氣逃亡
Game.moonEscape=function(){
  const L=PH.L;
  UI.clearInput();PH.Seams.reset();
  PH.GFX.cut={x:15.5,y:6.4};PH.GFX.cutCat=true;AU.play('take');
  playCut(['三道鎖全開。咪嚕抱起了宇宙第一罐。','月亮總督卸下頭盔，小聲說：「……其實我也餓了。」','轟——罐頭月亮開始消氣！','總督用背撐住倒下來的罐蓋：「快走！原本的紙箱在那一頭！」'],function(){
    const SV=PH.SAVE,st=L.stats;SV.cleared.moon=1;
    if(!SV.best.moon||st.time<SV.best.moon.time)SV.best.moon={time:Math.round(st.time),caught:st.caught};
    PH.saveGame();Game.start('escape');
  });
};

/* ---------- 結局 ---------- */
function cards(list,done){
  let i=0;
  const step=function(){
    if(i>=list.length){done();return;}
    const c=list[i++];AU.play('blip');
    UI.ending({title:c[0],text:c[1],buttons:[['繼續',step]]});
  };
  step();
}
Game.ending=function(){
  const SV=PH.SAVE,n=Object.keys(SV.bowls).length;
  S.mode='ending';UI.hideAll();AU.music('bgm');AU.mood('calm');
  SV.cleared.escape=1;
  const fin=function(hidden){
    SV.ended=1;if(hidden)SV.hidden=1;PH.saveGame();AU.play('choir');
    UI.ending({title:hidden?'隱藏結局：今晚不分貓狗':'一般結局：宇宙最好的罐罐',
      text:(hidden?'汪汪秩序局隔天換了招牌——宵夜秩序局。':'「有些宇宙，是從一罐開始的。」')+'\n\n感謝遊玩《喵不可罐：抓開宇宙的縫》。\n隱藏收藏 '+Object.keys(SV.collect).length+'/5　空餐碗 '+n+'/5'+(n<5&&!hidden?'\n（每一關都藏著一個空餐碗。集齊五個，結局會多一個選擇。）':'')+'\n新能力可以回舊關卡探索隱藏區域。標題畫面多了一個空罐，可以去戳戳看。',
      buttons:[['回標題',function(){Game.toTitle();}]]});
  };
  const normal=function(){
    cards([['','咪嚕踩了兩下，在暖毯上睡著了。'],['','鏡頭拉遠——一隻流浪貓在紙箱裡做夢。'],['','一雙人手，把一個真正的罐罐輕輕放在箱子旁邊。']],function(){fin(false);});
  };
  cards([['回到原本的紙箱','咪嚕撬開宇宙第一罐。'],['','罐裡不是魚。\n是一片陽光、一條暖毯，還有一句話：\n「這裡可以安心睡覺。」']],function(){
    if(n>=5){
      UI.ending({title:'總督站在箱子外面',text:'一路上那五個空餐碗，都是秩序局的。\n總督看著罐罐，肚子叫了一聲。',buttons:[
        ['分一口',function(){cards([['','你把罐罐往外推了一點。'],['','總督愣了一下：「我可以……不用抓你了嗎？」'],['','那天晚上，貓和狗在月亮上一起吃宵夜。']],function(){fin(true);});}],
        ['自己吃',normal]]});
    }else normal();
  });
};
// 彩蛋：通關後對空罐互動九次
Game.egg=function(){
  eggN++;AU.play(eggN>=9?'unlock':'click');
  if(eggN>=9){eggN=0;PH.SAVE.egg=1;PH.saveGame();UI.say('（切到罐視角）「恭喜，你成功僱用一隻貓，把自己送到安全地點。」——空罐長出腿，跑掉了。',9);}
  else UI.say('空罐被戳了 '+eggN+' 下'+(eggN>5?'……它好像在忍笑。':'。'),2);
};

/* ---------- 主迴圈 ---------- */
function tick(rdt){
  UI.poll(rdt);
  if(S.mode==='play'){
    const SM=PH.Seams,P=PH.P;
    let sc=1;
    if(SM.draw&&P.focus>0){sc=PH.CFG.seam.slow;P.focus=Math.max(0,P.focus-rdt);}   // 畫縫專注：只在畫縫時變慢，最多 2 秒現實時間
    const dt=rdt*sc;
    PH.Player.update(dt,rdt);
    if(S.mode==='play')W.update(dt);
    if(S.mode==='play')PH.Dogs.update(dt);
    if(S.mode==='play')PH.Boss.update(dt);
    if(S.mode==='play')SM.update(dt);
    objT-=rdt;
    if(objT<=0&&S.mode==='play'){objT=0.2;const d=PH.L.def;Game.obj=d.objective?d.objective(PH.L):null;}
  }else if(S.mode==='cut'&&cut){cut.t+=rdt;if(cut.t>7)Game.cutNext();}
}
function frame(ts){
  requestAnimationFrame(frame);
  const rdt=Math.min(0.05,Math.max(0,(ts-last)/1000));last=ts;
  try{tick(rdt);}catch(e){console.error(e);Game.err=String(e&&e.stack||e);}
  AU.tick(rdt);
  PH.GFX.draw(rdt);
  UI.sync(rdt);
}
Game.boot=function(){
  PH.loadSave();
  UI.init();
  if(!PH.GFX.init($('cv'),$('ov')))return;
  loadLevel('prologue');S.mode='title';UI.title();
  requestAnimationFrame(function(ts){last=ts;requestAnimationFrame(frame);});
};
// 測試與除錯用
PH.debug={
  tick:function(n,dt){for(let i=0;i<(n||1);i++)tick(dt||1/60);},
  tp:function(x,y){const P=PH.P;P.x=x;P.y=y;P.vx=P.vy=0;P.lastSafe={x:x,y:y};P.hidden=null;S.camSnap=true;},
  state:function(){
    const P=PH.P,L=PH.L,B=PH.Boss;
    return {mode:S.mode,level:S.level,practice:S.practice,x:+P.x.toFixed(2),y:+P.y.toFixed(2),form:P.form,energy:Math.round(P.energy),hasCan:P.hasCan,hidden:P.hidden?P.hidden.id:null,
      theft:L.theft,alert:L.alert,flags:Object.keys(L.f).filter(function(k){return L.f[k];}),obj:Game.obj&&Game.obj.t,err:Game.err||null,
      dogs:L.dogs.filter(function(d){return d.active;}).map(function(d){return d.id+':'+d.state;}),
      boss:{on:B.active,phase:B.phase,state:B.state,move:B.move,locks:B.locks.slice(),faults:B.faults}};
  }
};
window.addEventListener('DOMContentLoaded',Game.boot);
})();
