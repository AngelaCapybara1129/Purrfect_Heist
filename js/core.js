/* 喵不可罐：抓開宇宙的縫 ── 核心設定、工具、存檔
   所有數值都是「測試起點」，集中在這裡方便調整。長度單位：公尺（1 格 = 1 公尺）。 */
(function(){
'use strict';
const noop=function(){};
const PH=window.PH={VERSION:3,LEVELS:{},ORDER:['prologue','kitchen','laundry','museum','market','moon','escape']};
// 裝置判斷：mobile＝觸控為主（手機、平板），phone＝螢幕短邊小於 600px 的手機
(function(){
  let coarse=false;try{coarse=window.matchMedia('(pointer:coarse)').matches;}catch(e){}
  const ua=navigator.userAgent||'',touchUA=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(navigator.maxTouchPoints>1&&/Macintosh/.test(ua));
  PH.mobile=coarse||touchUA;
  PH.phone=PH.mobile&&Math.min(screen.width||999,screen.height||999)<600;
})();

const U=PH.U={
  clamp:function(v,a,b){return v<a?a:v>b?b:v;},
  lerp:function(a,b,t){return a+(b-a)*t;},
  dist:function(ax,ay,bx,by){return Math.hypot(bx-ax,by-ay);},
  angd:function(a,b){let d=(b-a)%6.283185307;if(d>Math.PI)d-=6.283185307;if(d<-Math.PI)d+=6.283185307;return d;},
  turn:function(a,b,m){const d=U.angd(a,b);return Math.abs(d)<=m?b:a+Math.sign(d)*m;},
  rand:function(a,b){return a+Math.random()*(b-a);},
  pick:function(a){return a[Math.floor(Math.random()*a.length)];},
  inRect:function(x,y,r){return x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];},
  // 點到線段的距離
  segDist:function(px,py,ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;let t=l2?((px-ax)*dx+(py-ay)*dy)/l2:0;t=t<0?0:t>1?1:t;
    return Math.hypot(px-(ax+dx*t),py-(ay+dy*t));
  },
  fmtTime:function(s){s=Math.floor(s);return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
};

/* ===== 遊戲數值（設計總書的原型測試值） ===== */
PH.CFG={
  energyMax:100,regen:10,                    // 奇妙值上限、普通形態每秒回復
  seam:{cost:20,maxDist:8,build:0.6,life:12,uses:2,   // 貓縫：成本、最大距離、建立秒數、持續秒數、可用次數
    reach:3.4,snap:56,tutorSnap:110,         // 起點要多近、指標吸附半徑（像素）
    slow:0.3,focusMax:2,focusRegen:0.5,      // 畫縫專注：時間倍率、最長 2 秒現實時間
    sealTime:3,sealDur:25,wipeTime:2.5,wipeDur:20,   // 封縫施工 3 秒、封多久；洗痕
    extreme:1.9,extremeBonus:12},            // 極限鑽縫：狗在這個距離內才算
  dog:{seeNear:0.28,seeFar:0.95,scan:1.5,calm:6,
    pounceRange:1.75,pounceWind:0.4,pounceDash:0.28,pounceSpeed:9,recover:0.8,
    immune:8},
  burp:{every:9,warn:1.8,soothe:1.0,rad:8},  // 打嗝罐
  scent:{every:7,warn:1.2},                  // 超香罐
  echo:{cost:8,cd:3,range:11,rad:8},         // 喵聲投射
  meow:{cd:1.2,rad:7},
  boss:{pounceTele:1.35,gap:[4,6],window:5.5,faults:3,assistMul:1.5}
};
PH.FORMS={
  normal:{name:'普通貓',r:0.3,speed:3.7,noise:2.2,drain:0,h:0.5,vis:1,scale:1,cam:{d:2.3,h:0.95,l:0.5}},
  mini:{name:'迷你貓',r:0.13,speed:2.7,noise:0,drain:3,h:0.15,vis:0.6,scale:0.32,cam:{d:1.05,h:0.3,l:0.14}},
  giant:{name:'巨大貓',r:0.62,speed:2.4,noise:5,drain:15,h:1.4,vis:1.4,scale:2.7,cam:{d:4.4,h:2.4,l:1.1}},
  liquid:{name:'液體貓',r:0.28,speed:3.0,noise:0,drain:6,h:0.12,vis:0.75,scale:1,cam:{d:2.1,h:0.85,l:0.2}},
  shadow:{name:'影子貓',r:0.26,speed:4.0,noise:0,drain:8,h:0.02,vis:0,scale:1,cam:{d:2.3,h:1.0,l:0.2}}
};
PH.FORM_ORDER=['normal','mini','giant','liquid','shadow'];
PH.ITEMS={furball:'毛球替身',sticker:'魚影貼紙',fish:'小魚乾',handle:'魚骨把手'};

/* 其他模組還沒載入前的空殼，方便在 Node 裡單獨驗證關卡資料 */
PH.FX={poof:noop,ring:noop,text:noop,shake:noop,flash:noop};
PH.UI={say:noop,once:noop,cue:noop,sync:noop};
PH.AU={play:noop,note:noop,mood:noop};
PH.IN={mx:0,my:0};
PH.S={mode:'title',yaw:0,pitch:0,level:null,practice:false};

/* ===== 設定與存檔（只存在本機） ===== */
const KEY='purrfect-heist-v3';
function defSave(){return {v:PH.VERSION,unl:{},cleared:{},collect:{},bowls:{},flavor:{},best:{},ended:0,hidden:0,egg:0,at:'prologue',opt:{}};}
PH.opt={music:0.55,sfx:0.7,mute:false,calm:false,flash:false,cap:true,cone:false,assist:false,lowfx:false,hints:true,sens:1};
PH.SAVE=defSave();
PH.loadSave=function(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s&&s.v===PH.VERSION){const d=defSave();for(const k in d)if(s[k]!==undefined)d[k]=s[k];PH.SAVE=d;}
    if(PH.SAVE.opt)for(const k in PH.opt)if(PH.SAVE.opt[k]!==undefined)PH.opt[k]=PH.SAVE.opt[k];
    if(!PH.SAVE.opt){   // 第一次開：依裝置給預設值
      if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)PH.opt.calm=true;
      if(PH.phone)PH.opt.lowfx=true;   // 手機預設省電畫質，覺得順可以在設定關掉
    }
  }catch(e){}
};
PH.saveGame=function(){try{PH.SAVE.opt=Object.assign({},PH.opt);localStorage.setItem(KEY,JSON.stringify(PH.SAVE));}catch(e){}};
PH.wipeSave=function(){const o=PH.SAVE.opt;PH.SAVE=defSave();PH.SAVE.opt=o;PH.saveGame();};
PH.defLevel=function(d){PH.LEVELS[d.id]=d;};
PH.has=function(f){return f==='normal'||!!PH.SAVE.unl[f]||!!PH.cheat;};
})();
