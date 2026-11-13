/* 聲音：程序音效（Web Audio）＋兩首配樂（一般關卡 BGM、BOSS 戰）
   音訊一定由「開始／開啟聲音」按鈕啟動；失敗會顯示重試，靜音也能通關。 */
(function(){
'use strict';
const PH=window.PH,AU=PH.AU;
let AC=null,out=null,nbuf=null,voices=0;
const TR={bgm:{src:'assets/bgm_four_silent_feet.mp4',el:null,k:0},boss:{src:'assets/boss_forbidden_can_of_stars.mp4',el:null,k:0}};
let want=null,level=0.8,hiddenPause=false;
AU.ready=false;AU.musicFail=false;AU.sfxFail=false;

function mkTrack(t){
  const a=new Audio();a.src=t.src;a.loop=true;a.preload='auto';a.volume=0;
  a.addEventListener('error',function(){t.failed=true;AU.musicFail=true;if(PH.UI.audioState)PH.UI.audioState();});
  t.el=a;
}
// 由使用者點擊觸發：建立或恢復音訊
AU.init=function(){
  if(!AC){
    try{AC=new (window.AudioContext||window.webkitAudioContext)();out=AC.createGain();out.connect(AC.destination);AU.sfxFail=false;}
    catch(e){AC=null;AU.sfxFail=true;}
  }
  if(AC&&AC.state==='suspended')AC.resume();
  for(const k in TR)if(!TR[k].el||TR[k].failed){TR[k].failed=false;mkTrack(TR[k]);}
  AU.musicFail=false;AU.ready=true;AU.setVol();
  if(want)playTrack(TR[want]);
  if(PH.UI.audioState)PH.UI.audioState();
};
AU.setVol=function(){if(out)out.gain.value=PH.opt.mute?0:PH.opt.sfx*0.75;};
function playTrack(t){
  if(!t.el||t.failed||hiddenPause)return;
  const p=t.el.play();
  if(p&&p.catch)p.catch(function(){AU.musicFail=true;if(PH.UI.audioState)PH.UI.audioState();});
}
AU.music=function(name){
  if(want===name)return;
  want=name;
  if(AU.ready&&name)playTrack(TR[name]);       // 換曲時交叉淡入淡出，不會兩首疊播
};
// 動態音樂：依情境調整強度；BOSS 戰換成 BOSS 曲
AU.mood=function(m){
  if(m==='boss'){AU.music('boss');level=1;return;}
  if(m==='off'){AU.music(null);return;}
  const bossOn=PH.Boss&&PH.Boss.active&&!PH.Boss.yield;
  if(!(want==='boss'&&(bossOn||(PH.L&&PH.L.id==='escape'))))AU.music('bgm');
  level=m==='chase'?1:m==='escape'?0.9:0.72;
};
AU.tick=function(dt){
  if(!AU.ready)return;
  const o=PH.opt,paused=PH.S.mode==='pause';
  for(const k in TR){
    const t=TR[k];if(!t.el||t.failed)continue;
    const tg=(k===want&&!hiddenPause)?1:0;
    t.k+=Math.max(-dt*1.2,Math.min(dt*0.8,tg-t.k));
    const v=o.mute?0:Math.max(0,Math.min(1,t.k*o.music*level*(paused?0.45:1)));
    if(Math.abs(t.el.volume-v)>0.005)t.el.volume=v;
    if(t.k<=0.001&&!t.el.paused&&tg===0)t.el.pause();
    else if(tg===1&&t.el.paused&&!AU.musicFail)playTrack(t);
  }
};
// 切到背景時暫停，回來再恢復，不會疊播
document.addEventListener('visibilitychange',function(){
  hiddenPause=document.hidden;
  if(document.hidden){for(const k in TR)if(TR[k].el)TR[k].el.pause();if(AC&&AC.state==='running')AC.suspend();}
  else if(AU.ready){if(AC)AC.resume();if(want)playTrack(TR[want]);}
});

/* ---------- 程序音效 ---------- */
function tone(f,dur,type,vol,f2,delay){
  if(!AC||voices>18)return;
  const t0=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'triangle';o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  g.gain.setValueAtTime(vol||0.1,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(out);o.start(t0);o.stop(t0+dur+0.03);
  voices++;o.onended=function(){voices--;};
}
function hiss(dur,vol,freq,delay,type){
  if(!AC||voices>18)return;
  if(!nbuf){nbuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const t0=AC.currentTime+(delay||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=nbuf;f.type=type||'lowpass';f.frequency.value=freq||1200;
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  s.connect(f);f.connect(g);g.connect(out);s.start(t0);s.stop(t0+dur+0.03);
  voices++;s.onended=function(){voices--;};
}
const SFX={
  shrink:function(){tone(900,0.28,'sine',0.14,220);hiss(0.25,0.05,3000);},
  grow:function(){tone(90,0.3,'sine',0.25,160);tone(700,0.07,'square',0.08,1200,0.26);},
  back:function(){tone(400,0.15,'triangle',0.12,600);},
  shade:function(){tone(300,0.4,'sine',0.12,80);hiss(0.4,0.05,900);},
  splash2:function(){tone(500,0.25,'sine',0.12,180);hiss(0.3,0.08,1800);},
  meow:function(){tone(620,0.16,'sawtooth',0.07,880);tone(880,0.26,'sawtooth',0.06,520,0.14);},
  echo:function(){tone(620,0.16,'sine',0.08,880);tone(880,0.26,'sine',0.07,520,0.14);tone(880,0.2,'sine',0.03,520,0.5);tone(880,0.2,'sine',0.015,520,0.85);},
  roar:function(){tone(160,0.5,'sawtooth',0.18,90);hiss(0.5,0.12,500);},
  purr:function(){for(let i=0;i<6;i++)tone(48+i%2*6,0.07,'sawtooth',0.07,null,i*0.075);},
  no:function(){tone(180,0.12,'square',0.06,140);},
  thud:function(){tone(70,0.14,'sine',0.25,45);hiss(0.08,0.12,300);},
  step:function(){hiss(0.04,0.03,700);},
  wstep:function(){hiss(0.1,0.06,1800);tone(300,0.08,'sine',0.04,160);},
  push:function(){hiss(0.7,0.2,500);tone(110,0.6,'sawtooth',0.06,70);},
  crank:function(){for(let i=0;i<5;i++)tone(500+i*90,0.06,'square',0.06,null,i*0.08);},
  click:function(){tone(700,0.05,'square',0.07,500);},
  clunk:function(){tone(120,0.2,'square',0.14,60);hiss(0.15,0.12,600);},
  kick:function(){tone(300,0.1,'triangle',0.12,700);},
  squeak:function(){tone(1200,0.12,'sine',0.1,1700);tone(1500,0.1,'sine',0.08,1100,0.12);},
  sus:function(){tone(520,0.1,'triangle',0.1);tone(660,0.14,'triangle',0.1,null,0.11);},
  bark:function(){tone(260,0.09,'square',0.12,180);tone(300,0.12,'square',0.12,170,0.13);},
  howl:function(){for(let i=0;i<4;i++){tone(280,0.09,'square',0.13,190,i*0.16);}tone(500,0.5,'sawtooth',0.07,340,0.66);},
  growl:function(){tone(110,0.35,'sawtooth',0.1,80);},
  inhale:function(){hiss(1.2,0.08,2400,0,'bandpass');tone(300,1.2,'sine',0.03,700);},
  yelp:function(){tone(900,0.25,'sawtooth',0.08,400);},
  caught:function(){tone(500,0.5,'sine',0.14,120);hiss(0.3,0.08,2500);},
  hop:function(){tone(420,0.1,'triangle',0.1,640);},
  sneeze:function(){hiss(0.22,0.14,2600);tone(240,0.12,'sawtooth',0.04,120);},
  scent:function(){tone(1300,0.3,'sine',0.04,1700);},
  burp:function(){tone(150,0.22,'sawtooth',0.14,70);tone(90,0.18,'square',0.08,60,0.1);},
  alarm:function(){tone(660,0.14,'square',0.09);tone(520,0.14,'square',0.09,null,0.16);tone(660,0.14,'square',0.09,null,0.32);},
  splash:function(){tone(200,0.6,'sine',0.12,60);hiss(0.6,0.15,900);},
  whoosh:function(){hiss(0.35,0.12,1600,0,'bandpass');},
  slip:function(){tone(800,0.3,'sine',0.08,200);},
  bell:function(){tone(1760,0.5,'sine',0.1);tone(2640,0.4,'sine',0.05);},
  door:function(){tone(180,0.25,'square',0.07,120);hiss(0.25,0.06,700);},
  tape:function(){hiss(0.9,0.1,3200,0,'bandpass');hiss(0.5,0.1,3600,1.0,'bandpass');},
  scratch:function(){hiss(0.12,0.09,2800,0,'highpass');},
  blip:function(){tone(1046,0.08,'sine',0.07,1318);},
  seam:function(){hiss(0.5,0.08,2600,0,'bandpass');tone(392,0.5,'sine',0.07,784);},
  seamopen:function(){tone(784,0.2,'triangle',0.09,1046);},
  seamclose:function(){tone(700,0.2,'triangle',0.07,300);},
  warp:function(){tone(300,0.3,'sine',0.12,1200);hiss(0.3,0.06,3000);},
  pipe:function(){tone(200,0.5,'sine',0.1,500);hiss(0.5,0.08,1200);},
  take:function(){[784,988,1175].forEach(function(f,i){tone(f,0.16,'triangle',0.09,null,i*0.07);});},
  pick:function(){tone(988,0.08,'triangle',0.08);tone(1319,0.12,'triangle',0.08,null,0.07);},
  unlock:function(){[523,659,784,1046].forEach(function(f,i){tone(f,0.3,'triangle',0.09,null,i*0.09);});},
  rumble:function(){tone(55,1.6,'sawtooth',0.1,40);hiss(1.6,0.1,300);},
  choir:function(){[523,659,784,1046].forEach(function(f,i){tone(f,0.9,'sawtooth',0.035,f*1.02,i*0.09);tone(f*0.99,0.9,'sine',0.05,f,i*0.09);});},
  canopen:function(){tone(900,0.06,'square',0.1,400);hiss(0.25,0.1,4000,0.05,'highpass');tone(523,0.5,'triangle',0.08,null,0.3);}
};
AU.play=function(name){if(!AU.ready||PH.opt.mute)return;const f=SFX[name];if(f)f();};
// 短音階：貓縫建立、成功穿越、極限逃脫串成一小段旋律（不要求跟拍）
const SCALE=[523,587,659,784,880,1047,1175];
AU.note=function(i){if(!AU.ready||PH.opt.mute)return;const f=SCALE[i%SCALE.length];tone(f,0.3,'triangle',0.1);tone(f*2,0.2,'sine',0.04,null,0.05);};
AU.test=function(){AU.init();SFX.meow();AU.note(0);AU.note(2);};
})();
