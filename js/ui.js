/* 介面：HUD、提示、聲音字幕、選單，以及鍵盤／滑鼠／觸控輸入 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,UI=PH.UI,IN=PH.IN;
const $=function(id){return document.getElementById(id);};
const keys={};
let cv,stage,toastT=0,hintSeen={},fine=false,vc={x:0,y:0},lastTxt={};
const FKEY={Digit1:'normal',Digit2:'mini',Digit3:'giant',Digit4:'liquid',Digit5:'shadow'};
const LOOK={sens:0.0026,psens:0.002,pmin:-0.45,pmax:0.55,turn:2.4};

function set(id,txt){if(lastTxt[id]!==txt){lastTxt[id]=txt;$(id).textContent=txt;}}
function show(id,v){const e=$(id);if(e.hidden===v)e.hidden=!v;}

/* ---------- 提示 ---------- */
UI.say=function(t,dur){const e=$('toast');e.textContent=t;e.hidden=false;toastT=dur||3.2;};
UI.once=function(k,t,dur){if(hintSeen[k]||!PH.opt.hints)return;hintSeen[k]=1;UI.say(t,dur||5);};
UI.fatal=function(t){$('fatalTxt').textContent=t;$('ovFatal').hidden=false;};
// 聲音字幕：只標方向，不標精確座標
const CUEP={'0':[50,17,'↑'],'1':[82,24,'↗'],'2':[90,48,'→'],'3':[82,70,'↘'],'4':[50,78,'↓'],'-4':[50,78,'↓'],'-3':[18,70,'↙'],'-2':[10,48,'←'],'-1':[18,24,'↖']};
let cueN=0,cueLast='',cueLastT=0;
UI.cue=function(text,x,y){
  if(!PH.opt.cap||PH.S.mode!=='play')return;
  const now=performance.now();if(text===cueLast&&now-cueLastT<1800)return;cueLast=text;cueLastT=now;
  const P=PH.P,S=PH.S;let idx=0;
  if(x!=null&&P)idx=Math.round(U.angd(S.yaw,Math.atan2(y-P.y,x-P.x))/(Math.PI/4));
  if(x!=null&&P&&U.dist(x,y,P.x,P.y)<1.2)idx=0;
  const q=CUEP[idx]||CUEP[0],sp=$('caps').children[cueN++%3];
  sp.textContent=q[2]+' '+text;sp.style.left=q[0]+'%';sp.style.top=q[1]+'%';
  sp.hidden=false;sp.style.animation='none';void sp.offsetWidth;sp.style.animation='capfade 2.6s forwards';
};
UI.audioState=function(){
  const a=PH.AU,e=$('audioState');
  if(!a.ready)e.textContent='按「開始」會同時開啟聲音。';
  else if(a.sfxFail&&a.musicFail)e.textContent='聲音啟動失敗——可以按「重試聲音」，或直接靜音遊玩。';
  else if(a.musicFail)e.textContent='配樂沒有播出來（音效正常）。可以按「重試聲音」。';
  else e.textContent=PH.opt.mute?'目前靜音。':'聲音已開啟。';
  $('btnAudioRetry').hidden=!(a.ready&&(a.musicFail||a.sfxFail));
};
UI.setCursor=function(x,y){vc.x=x;vc.y=y;};

/* ---------- HUD ---------- */
const ALERT=['','一級騷動','二級封鎖','三級增援','四級搜查'];
UI.sync=function(dt){
  const S=PH.S,L=PH.L,P=PH.P,SM=PH.Seams;
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').hidden=true;}
  const play=S.mode==='play';
  show('hud',play||S.mode==='pause');show('pad',play);show('joy',play&&!fine);show('keys',play&&fine&&S.keys!==false);
  if(!L||!P||!(play||S.mode==='pause'))return;
  const F=PH.FORMS[P.form];
  set('formName',F.name);set('eNum',String(Math.round(P.energy)));
  $('ebar').style.width=Math.round(P.energy)+'%';$('formChip').classList.toggle('low',P.energy<20);
  let nf=0;   // 只顯示已解鎖的形態；只有普通貓時整排藏起來
  PH.FORM_ORDER.forEach(function(f){const b=$('f_'+f),h=PH.has(f);if(h)nf++;show('f_'+f,h);b.setAttribute('aria-pressed',P.form===f?'true':'false');});
  show('forms',nf>1);
  const ob=PH.Game.obj;set('goal',ob?ob.t:'');
  const s=SM.seam;show('seamChip',!!s);
  if(s)set('seamT',s.state==='build'?'建立中…':s.life.toFixed(1)+' 秒　剩 '+s.uses+' 次');
  // 罐罐麻煩
  let ct='',warn=false;const tr=L.def.trouble;
  if(L.theft&&(P.hasCan||L.can)){
    if(tr==='burp'){warn=L.T.burp<PH.CFG.burp.warn;ct=warn?'要打嗝了！停下不動安撫':'打嗝倒數 '+Math.ceil(L.T.burp);}
    else if(tr==='scent'){warn=L.T.scent<PH.CFG.scent.warn;ct=warn?'香味要飄出來了！':'飄香倒數 '+Math.ceil(L.T.scent);}
    else if(tr==='glow')ct=P.hidden?'月光罐被遮住了':'月光罐發亮中（容易被看見）';
    else if(tr==='walk'&&L.can)ct='罐罐在夢遊，記得抱回來';
  }
  show('canChip',!!ct);if(ct){set('canTxt',ct);$('canChip').classList.toggle('warn',warn);}
  show('itemChip',!!P.item);if(P.item)set('itemChip','道具：'+PH.ITEMS[P.item]+(fine?'（右鍵使用）':''));
  show('btnItem',!!P.item);
  const hasT=L.id==='market'&&!L.theft;show('tickChip',hasT);if(hasT)set('tickChip','魚骨票 '+P.tickets+'/3');
  show('ambChip',!!L.amb.loud||!!L.amb.warn);if(L.amb.loud||L.amb.warn)set('ambChip',L.amb.loud?'洗衣機運轉中：聲音被蓋住':'洗衣機要開始轉了…');
  const B=PH.Boss;show('locks',!!(B&&B.active));
  if(B&&B.active)set('locks','月蓋鎖 '+B.locks.map(function(k){return k?'○':'●';}).join('')+'　失誤 '+B.faults+'/'+PH.CFG.boss.faults);
  show('lvl',L.alert>0);if(L.alert>0){set('lvl',ALERT[L.alert]);$('lvl').className='chip lvl l'+Math.min(3,L.alert);}
  let st='',txt='沒被注意';
  if(PH.Dogs.any(['chase','pounce','bark','inspect'])){st='chase';txt='被追捕！';}
  else if(PH.Dogs.any(['sus','inv','search','look','seal','guard']) ){st='sus';txt='有狗起疑';}
  if(B&&B.active&&!B.yield){st=B.state==='tele'||B.state==='dash'?'chase':'sus';txt=B.state==='stun'||B.state==='dizzy'||B.state==='frost'?'總督暈住了':B.state==='tele'?'總督出招！':'總督在找你';}
  if(L.spotT>0.05){st='sus';txt='被光照到！';}
  const al=$('alert');if(al.dataset.s!==st){al.dataset.s=st;al.className='chip alert '+st;}set('alertTxt',txt);
  show('sneakChip',P.sneak&&!P.hidden);
  // 互動提示
  const a=PH.Player.cur,pr=$('prompt');
  if(a&&play&&!SM.draw){
    pr.hidden=false;pr.classList.toggle('dis',!!a.dis);
    set('promptTxt',(fine?'點擊／E　':'')+a.label+(a.hold&&!a.dis?'（按住）':''));
    const k=a.purr?(P.holdId===a.id&&a.dog?a.dog.sleepy/2.5:0):(a.hold&&P.holdId===a.id?P.holdT/a.hold:0);
    $('promptBar').style.width=Math.min(100,k*100)+'%';
  }else if(play&&SM.draw){
    pr.hidden=false;pr.classList.remove('dis');
    set('promptTxt','點另一個縫點完成　點空白處取消');
    $('promptBar').style.width='0%';
  }else pr.hidden=true;
  syncKeys(P);
  // 紙箱裡的窺視縫
  const inBox=play&&P.hidden&&P.hidden.t==='box';show('slit',!!inBox);
  if(inBox)$('slit').style.setProperty('--h',(31-P.lift*18)+'%');
  $('stage').classList.toggle('drawing',!!SM.draw);
};

// 按鍵說明跟著解鎖進度出現，不一次全列
const FNUM={normal:'1 普通',mini:'2 迷你',giant:'3 巨大',liquid:'4 液體',shadow:'5 影子'};
function syncKeys(P){
  if(!fine)return;
  const echo=PH.has('echo'),giant=PH.has('giant'),fs=PH.FORM_ORDER.filter(function(f){return PH.has(f);});
  const rows=['WASD 移動　滑鼠轉視角（先點一下畫面）',
    '左鍵點擊 互動（照畫面下方的提示，E 也可以）',
    '畫貓縫：在縫點旁點一下，再點另一個縫點',
    '空白鍵 喵'+(giant?'（巨大時是威嚇）':'')+(echo?'　按住瞄準、放開投射喵聲':''),
    'Shift 輕腳，停在遮蔽物後會自動探頭'];
  if(fs.length>1)rows.push('Q 切換形態　'+fs.map(function(f){return FNUM[f];}).join('　'));
  if(P.item)rows.push('右鍵 使用道具');
  rows.push('Esc 暫停　H 收起說明');
  set('keys',rows.join('\n'));
}

/* ---------- 選單 ---------- */
function ov(id,v){$(id).hidden=!v;if(v)UI.unlock();}
UI.overlay=ov;
UI.hideAll=function(){['ovTitle','ovLevels','ovPause','ovCaught','ovCut','ovResult','ovEnding'].forEach(function(k){$(k).hidden=true;});};
UI.title=function(){
  UI.hideAll();ov('ovTitle',true);
  const sv=PH.SAVE,any=Object.keys(sv.cleared).length>0;
  $('btnStart').textContent=any?'繼續遊戲':'開始遊戲';
  $('titleSub').textContent=sv.ended?'今晚整座宇宙都是我的罐罐（已通關'+(sv.hidden?'・隱藏結局':'')+'）':'今晚整座宇宙都是我的罐罐';
  $('btnEgg').hidden=!sv.ended;
  UI.audioState();
};
UI.levels=function(){
  const box=$('lvList');box.textContent='';
  const sv=PH.SAVE;let open=true;
  PH.ORDER.forEach(function(id){
    if(id==='escape')return;
    const d=PH.LEVELS[id],b=document.createElement('button'),done=!!sv.cleared[id],best=sv.best[id];
    b.textContent=d.title+'　'+d.name+(done?'　✓':'')+(best?'（'+U.fmtTime(best.time)+'）':'');
    b.disabled=!open&&!done;
    b.addEventListener('click',function(){PH.AU.init();goFull();PH.Game.start(id);});
    box.appendChild(b);
    if(!done)open=false;
  });
  const n=Object.keys(sv.collect).length,bw=Object.keys(sv.bowls).length;
  $('lvInfo').textContent='隱藏收藏 '+n+'/5　空餐碗線索 '+bw+'/5　隱藏口味 '+Object.keys(sv.flavor).length+'/2';
  ov('ovTitle',false);ov('ovLevels',true);
};
function syncOpts(){
  const o=PH.opt;
  $('volM').value=Math.round(o.music*100);$('volS').value=Math.round(o.sfx*100);$('sens').value=Math.round(o.sens*100);
  ['mute','calm','flash','cap','cone','assist','hints','lowfx'].forEach(function(k){$('o_'+k).checked=!!o[k];});
}
UI.pause=function(fromTitle){
  syncOpts();
  $('pauseTitle').textContent=fromTitle?'設定':'暫停';
  ['btnResume','btnRetryCp','btnRestart','btnQuit'].forEach(function(k){$(k).hidden=!!fromTitle;});
  $('btnBack').hidden=!fromTitle;
  if(fromTitle)ov('ovTitle',false);
  ov('ovPause',true);
};
UI.caught=function(title,gag,why){$('caughtTitle').textContent=title;$('gag').textContent=gag;$('why').textContent=why;ov('ovCaught',true);};
UI.cut=function(text,more){$('cutTxt').textContent=text;$('cutMore').textContent=more||'點一下繼續';ov('ovCut',true);};
UI.result=function(r){
  $('resTitle').textContent=r.title;
  const st=$('stats');st.textContent='';
  r.rows.forEach(function(q){const a=document.createElement('span'),b=document.createElement('b');a.textContent=q[0];b.textContent=q[1];st.appendChild(a);st.appendChild(b);});
  $('rank').textContent=r.rank;$('unlock').textContent=r.unlock||'';
  $('btnPractice').hidden=!r.practice;$('btnNext').textContent=r.nextLabel;
  ov('ovResult',true);
};
UI.ending=function(o){
  $('endTitle').textContent=o.title||'';$('endTxt').textContent=o.text;
  const row=$('endBtns');row.textContent='';
  o.buttons.forEach(function(q){const b=document.createElement('button');b.textContent=q[0];b.addEventListener('click',q[1]);row.appendChild(b);});
  ov('ovEnding',true);
};

/* ---------- 輸入 ---------- */
function locked(){return document.pointerLockElement===cv;}
UI.lock=function(){if(fine&&!locked()&&cv.requestPointerLock){try{const p=cv.requestPointerLock();if(p&&p.catch)p.catch(function(){});}catch(e){}}};
UI.unlock=function(){if(locked()&&document.exitPointerLock)document.exitPointerLock();};
function clearInput(){for(const k in keys)keys[k]=false;IN.mx=IN.my=0;IN.eHeld=IN.sneak=IN.aim=false;spT=-1;joy.id=null;joy.x=joy.y=0;jk.style.transform='';jo.style.left=jo.style.bottom='';}
// 手機：按「開始」時順便進全螢幕、鎖橫向（iPhone Safari 不支援，會直接略過）
function goFull(){
  if(!PH.mobile||document.fullscreenElement||document.webkitFullscreenElement)return;
  const d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;if(!f)return;
  try{
    const p=f.call(d,{navigationUI:'hide'});
    const lock=function(){try{const q=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape');if(q&&q.catch)q.catch(function(){});}catch(x){}};
    if(p&&p.then)p.then(lock).catch(function(){});else lock();
  }catch(x){}
}
// 空白鍵／喵鈕：點一下喵；解鎖喵聲投射後，按住超過一下下就變成瞄準，放開投出
const AIM_DELAY=220;let spT=-1;
function canAim(){return PH.has('echo')&&PH.P&&PH.P.form!=='giant'&&!PH.P.hidden;}
function meowDown(){const PL=PH.Player;if(spT>=0)return;if(!canAim()){PL.meow();return;}spT=performance.now();}
function meowUp(){
  if(spT<0)return;spT=-1;
  if(PH.S.mode!=='play')return;
  const PL=PH.Player;
  if(PH.P&&PH.P.aim)PL.echo();else PL.meow();
}
UI.clearInput=clearInput;
function typing(e){const t=e.target;return !!t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT');}
const joy={x:0,y:0,id:null,bx:0,by:0};let jo,jk;
const look={id:null,x:0,y:0,btn:{}};
function stagePos(e){const r=stage.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function rotate(dx,dy){
  const S=PH.S,m=PH.opt.sens;
  S.yaw+=U.clamp(dx,-120,120)*LOOK.sens*m;S.pitch=U.clamp(S.pitch-U.clamp(dy,-120,120)*LOOK.psens*m,LOOK.pmin,LOOK.pmax);
}
UI.poll=function(dt){
  const S=PH.S;
  let mx=(keys.KeyD?1:0)-(keys.KeyA?1:0),my=(keys.KeyW?1:0)-(keys.KeyS?1:0);
  if(keys.ArrowLeft)S.yaw-=LOOK.turn*dt;if(keys.ArrowRight)S.yaw+=LOOK.turn*dt;
  if(keys.ArrowUp)my=Math.max(my,1);if(keys.ArrowDown)my=Math.min(my,-1);
  if(joy.id!==null){mx=joy.x;my=-joy.y;}
  IN.mx=mx;IN.my=my;
  IN.sneak=!!(keys.ShiftLeft||keys.ShiftRight||IN.sneakT);
  IN.aim=spT>=0&&performance.now()-spT>AIM_DELAY&&canAim();
};
function bindBtn(id,down,up){
  const b=$(id);
  b.addEventListener('pointerdown',function(e){e.preventDefault();PH.AU.init();try{b.setPointerCapture(e.pointerId);}catch(x){}down();});
  if(up){const f=function(){up();};b.addEventListener('pointerup',f);b.addEventListener('pointercancel',f);}
  b.addEventListener('contextmenu',function(e){e.preventDefault();});
}
UI.init=function(){
  cv=$('cv');stage=$('stage');jo=$('joy');jk=jo.firstElementChild;
  try{fine=window.matchMedia('(pointer:fine)').matches;}catch(e){fine=true;}
  UI.fine=fine;
  for(let i=0;i<3;i++){const sp=document.createElement('span');sp.hidden=true;$('caps').appendChild(sp);}
  const G=PH.Game,PL=PH.Player,SM=PH.Seams;
  // 鍵盤
  window.addEventListener('keydown',function(e){
    if(typing(e))return;
    const S=PH.S,c=e.code;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].indexOf(c)>=0)e.preventDefault();
    if(e.repeat){return;}
    keys[c]=true;
    if((c==='Escape'||c==='KeyP')&&S.mode==='play'&&SM.draw){SM.end();return;}   // 畫縫中按 Esc 先取消畫縫
    if(c==='Escape'||c==='KeyP'){G.togglePause();return;}
    if(S.mode==='cut'&&(c==='KeyE'||c==='Space'||c==='Enter')){G.cutNext();return;}
    if(S.mode==='caught'&&(c==='KeyE'||c==='Enter'||c==='Space')){G.retry();return;}
    if(S.mode!=='play')return;
    PH.AU.init();
    if(c==='KeyE'){if(SM.draw)SM.confirm();else{IN.eHeld=true;PL.pressE();}}
    else if(c==='KeyQ')PL.cycle();
    else if(FKEY[c])PL.transform(FKEY[c]);
    else if(c==='Space')meowDown();
    else if(c==='KeyF'){if(SM.draw)SM.end();else if(SM.begin()){vc.x=-1;}}
    else if(c==='KeyM'){PH.opt.mute=!PH.opt.mute;PH.AU.setVol();PH.saveGame();UI.say(PH.opt.mute?'已靜音':'聲音開啟',1.5);}
    else if(c==='KeyH'){S.keys=S.keys===false;}
  });
  window.addEventListener('keyup',function(e){
    const c=e.code;keys[c]=false;
    if(c==='KeyE')IN.eHeld=false;
    if(c==='Space')meowUp();
  });
  window.addEventListener('blur',function(){clearInput();if(PH.S.mode==='play')G.togglePause();});
  document.addEventListener('pointerlockchange',function(){if(!locked())look.btn={};});
  // 滑鼠／觸控：轉鏡頭；畫縫模式內拖曳只用來畫縫
  cv.addEventListener('pointerdown',function(e){
    PH.AU.init();
    const S=PH.S;
    if(S.mode==='cut'){G.cutNext();return;}
    if(S.mode!=='play')return;
    look.btn[e.button]=true;
    if(SM.draw){
      if(e.button===2){SM.end();return;}   // 右鍵取消畫縫
      if(e.button===0){if(locked())SM.ptr('down',vc.x,vc.y);else{const p=stagePos(e);vc.x=p.x;vc.y=p.y;SM.ptr('down',p.x,p.y);}}
      look.id=e.pointerId;return;
    }
    if(e.pointerType!=='mouse'&&!fine&&joy.id===null){   // 觸控：左半邊畫面任一處按下就是搖桿（浮動搖桿）
      const p=stagePos(e);
      if(p.x<stage.clientWidth*0.42){
        const w=jo.offsetWidth||150,h=jo.offsetHeight||150;
        jo.style.left=Math.max(4,p.x-w/2)+'px';jo.style.bottom=Math.max(4,stage.clientHeight-p.y-h/2)+'px';
        const r=jo.getBoundingClientRect();joy.id=e.pointerId;joy.bx=r.left+r.width/2;joy.by=r.top+r.height/2;
        try{cv.setPointerCapture(e.pointerId);}catch(x){}
        jmove(e);return;
      }
    }
    if(e.pointerType==='mouse'&&locked()){   // 已鎖定滑鼠時：左鍵＝互動（可按住），右鍵＝道具
      if(e.button===0){IN.eHeld=true;PL.pressE();}
      else if(e.button===2&&PH.P&&PH.P.item)PL.useItem();
    }
    if(e.pointerType==='mouse'&&fine&&!locked()){UI.lock();}
    look.id=e.pointerId;look.x=e.clientX;look.y=e.clientY;look.sx=e.clientX;look.sy=e.clientY;look.t0=performance.now();
    try{cv.setPointerCapture(e.pointerId);}catch(x){}
  });
  cv.addEventListener('pointermove',function(e){
    const S=PH.S;if(S.mode!=='play')return;
    if(e.pointerId===joy.id){jmove(e);return;}
    if(SM.draw){
      if(locked()){vc.x=U.clamp(vc.x+e.movementX,0,stage.clientWidth);vc.y=U.clamp(vc.y+e.movementY,0,stage.clientHeight);SM.ptr('move',vc.x,vc.y);}
      else if(e.pointerType==='mouse'||e.pointerId===look.id){const p=stagePos(e);vc.x=p.x;vc.y=p.y;SM.ptr('move',p.x,p.y);}
      return;
    }
    if(locked()){rotate(e.movementX,e.movementY);return;}
    if(e.pointerId===look.id){rotate((e.clientX-look.x)*1.6,(e.clientY-look.y)*1.6);look.x=e.clientX;look.y=e.clientY;}
  });
  const pup=function(e){
    if(e.pointerId===joy.id){jend(e);return;}
    look.btn[e.button]=false;
    if(e.button===0&&e.pointerType==='mouse'&&!keys.KeyE)IN.eHeld=false;
    if(SM.draw&&e.button===0){if(locked())SM.ptr('up',vc.x,vc.y);else{const p=stagePos(e);SM.ptr('up',p.x,p.y);}}
    else if(e.type==='pointerup'&&e.pointerType!=='mouse'&&e.pointerId===look.id&&PH.S.mode==='play'&&
      performance.now()-look.t0<260&&Math.hypot(e.clientX-look.sx,e.clientY-look.sy)<12)PH.Player.pressE();   // 觸控：輕點畫面＝互動
    if(e.pointerId===look.id)look.id=null;
  };
  cv.addEventListener('pointerup',pup);cv.addEventListener('pointercancel',pup);
  cv.addEventListener('contextmenu',function(e){e.preventDefault();});
  // 虛擬搖桿
  const jmove=function(e){
    const R=jo.clientWidth*0.36;let dx=e.clientX-joy.bx,dy=e.clientY-joy.by;const d=Math.hypot(dx,dy);
    if(d>R){dx*=R/d;dy*=R/d;}
    joy.x=dx/R;joy.y=dy/R;jk.style.transform='translate('+dx+'px,'+dy+'px)';
  };
  jo.addEventListener('pointerdown',function(e){e.preventDefault();PH.AU.init();const r=jo.getBoundingClientRect();joy.id=e.pointerId;joy.bx=r.left+r.width/2;joy.by=r.top+r.height/2;try{jo.setPointerCapture(e.pointerId);}catch(x){}jmove(e);});
  jo.addEventListener('pointermove',function(e){if(e.pointerId===joy.id)jmove(e);});
  const jend=function(e){if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;jk.style.transform='';jo.style.left=jo.style.bottom='';}};
  jo.addEventListener('pointerup',jend);jo.addEventListener('pointercancel',jend);
  // 畫面按鈕
  bindBtn('btnE',function(){if(SM.draw){SM.confirm();return;}IN.eHeld=true;PL.pressE();},function(){IN.eHeld=false;});
  bindBtn('btnMeow',meowDown,meowUp);
  bindBtn('btnSneak',function(){IN.sneakT=!IN.sneakT;$('btnSneak').setAttribute('aria-pressed',IN.sneakT?'true':'false');});
  bindBtn('btnItem',function(){PL.useItem();});
  PH.FORM_ORDER.forEach(function(f){bindBtn('f_'+f,function(){PL.transform(f);});});
  $('btnPause').addEventListener('click',function(){G.togglePause();});
  // 標題與選單
  $('btnRotOk').addEventListener('click',function(){stage.classList.add('portrait-ok');});
  $('btnStart').addEventListener('click',function(){PH.AU.init();goFull();G.start(PH.SAVE.at&&PH.LEVELS[PH.SAVE.at]?PH.SAVE.at:'prologue');});
  $('btnLevels').addEventListener('click',function(){UI.levels();});
  $('btnOpts').addEventListener('click',function(){UI.pause(true);});
  $('btnLvBack').addEventListener('click',function(){UI.title();});
  $('btnBack').addEventListener('click',function(){PH.saveGame();UI.title();});
  $('btnAudioRetry').addEventListener('click',function(){PH.AU.init();});
  $('btnEgg').addEventListener('click',function(){G.egg();});
  $('btnResume').addEventListener('click',function(){G.togglePause();});
  $('btnRetryCp').addEventListener('click',function(){$('ovPause').hidden=true;PH.S.mode='play';G.retry();});
  $('btnRestart').addEventListener('click',function(){G.start(PH.S.level);});
  $('btnQuit').addEventListener('click',function(){G.toTitle();});
  $('btnWipe').addEventListener('click',function(){
    const b=$('btnWipe');
    if(b.dataset.sure){PH.wipeSave();delete b.dataset.sure;b.textContent='清除遊戲進度';UI.say('進度已清除。',3);G.toTitle();}
    else{b.dataset.sure='1';b.textContent='再按一次確認清除（無法復原）';setTimeout(function(){delete b.dataset.sure;b.textContent='清除遊戲進度';},4000);}
  });
  $('btnTest').addEventListener('click',function(){PH.AU.test();UI.audioState();});
  $('volM').addEventListener('input',function(e){PH.opt.music=e.target.value/100;});
  $('volS').addEventListener('input',function(e){PH.opt.sfx=e.target.value/100;PH.AU.setVol();});
  $('sens').addEventListener('input',function(e){PH.opt.sens=e.target.value/100;});
  ['mute','calm','flash','cap','cone','assist','hints','lowfx'].forEach(function(k){
    $('o_'+k).addEventListener('change',function(e){PH.opt[k]=e.target.checked;if(k==='mute'){PH.AU.setVol();UI.audioState();}if(k==='lowfx')PH.GFX.setLow();PH.saveGame();});
  });
  $('btnRetry').addEventListener('click',function(){G.retry();});
  $('ovCut').addEventListener('click',function(){G.cutNext();});
  $('btnPractice').addEventListener('click',function(){G.practice();});
  $('btnNext').addEventListener('click',function(){G.next();});
  $('btnResTitle').addEventListener('click',function(){G.toTitle();});
};
})();
