/* 關卡資料（上）：序章、第一關廚房、第二關洗衣機
   ops：[字元, 左, 上, 右, 下]（含邊界，單位：格）。ents：機關與物件。hooks：各關獨有的規則。 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,W=PH.World;
function inAny(c,r,rects){for(const q of rects)if(c>=q[0]&&c<=q[2]&&r>=q[1]&&r<=q[3])return true;return false;}

/* ===================== 序章：凌晨三點的犯罪現場 ===================== */
PH.defLevel({
  id:'prologue',title:'序章',name:'凌晨三點的犯罪現場',size:[14,10],next:'kitchen',
  free:true,maxAlert:1,tutorial:true,
  pal:{sky:'#1b2242',sky2:'#3b4a7a',fog:'#232a4c',fogNear:14,fogFar:46,wall:'#e9cfa0',trim:'#d98a5c',floor:['#d9b88a','#e6c99c','#c9a678','#d4b386'],block:'#c98b5a',top:'#f3dfbd'},
  mood:{hemi:['#8fa6ff','#ffc890',0.55],sun:['#ffd9a0',0.5,[3,8,6]],amb:'#3a3f66'},
  ops:[['.',1,1,10,8],['.',11,7,12,7],['.',12,5,12,8],['H',5,1,5,2],['S',1,3,5,3],['L',5,4,5,4],['c',1,5,4,5],['C',5,5,5,8],['T',8,4,9,4]],
  legend:{S:{k:'solid',h:0.95,m:'sofa'},H:{k:'solid',h:2.2,m:'block',col:'#8a5a3c',top:'#a8714a'}},
  start:{x:1.5,y:7.5,box:'home'},
  ents:[
    {t:'box',id:'home',x:1.5,y:7.5,safe:1},
    {t:'box',id:'window',x:1.5,y:1.5,finish:1,safe:1},
    {t:'sw',id:'oldcan',x:3.4,y:7.5,label:'吃掉剩一口的迷你沙丁魚罐',hold:0.8,flag:'ate',model:'oldcan',any:1},
    {t:'anchor',id:'P1a',x:4.4,y:4.5,pair:'P1b',name:'沙發腿'},
    {t:'anchor',id:'P1b',x:6.4,y:5.5,pair:'P1a',name:'櫃側'},
    {t:'anchor',id:'P2a',x:8.5,y:3.6,pair:'P2b',name:'茶几背面'},
    {t:'anchor',id:'P2b',x:3.5,y:1.5,pair:'P2a',name:'窗邊箱旁'},
    {t:'ped',id:'ped',x:9.5,y:1.45,hold:0.5,label:'拿走練習地圖罐'},
    {t:'toy',id:'ball',x:7.5,y:6.5},
    {t:'item',id:'c_prologue',x:7.5,y:1.35,kind:'collect',name:'照片後的月牙貼紙'}
  ],
  dogs:[{id:'shiba',kind:'shiba',x:12.5,y:5.5,lurk:1,route:[[10,6.5],[9.5,2.8,1],[7,2.8,1],[9.5,2.8],[10,5,1]],route2:[[6.6,1.6,1],[6.6,6.5,1],[9.5,6.5]]}],
  openCut:['咪嚕撬開練習地圖罐——裡面是一張會自己指路的地圖。','地圖罐只負責導航，不會再多解鎖一種能力。','地圖上畫著一間廚房，還有一個會發光的罐罐。'],
  init:function(L){if(PH.SAVE.unl.mini){L.f.ate=true;L.E.oldcan.done=true;}},
  onRestore:function(L){if(PH.SAVE.unl.mini){L.f.ate=true;L.E.oldcan.done=true;}},
  onFlag:function(L,k){
    if(k==='ate'&&!PH.SAVE.unl.mini){PH.SAVE.unl.mini=true;PH.saveGame();PH.AU.play('unlock');PH.UI.say('解鎖：迷你貓！按 2（或 Q）縮小，從櫃子底下鑽過去。',8);}
  },
  update:function(L){
    const P=PH.P;
    if(!L.T.dogIn&&P.y<5&&P.x<5&&!P.hidden){
      L.T.dogIn=1;PH.Dogs.release('shiba');
      PH.UI.cue('啪搭、啪搭……',11,7);
      PH.UI.say('有狗來了！沙發擋住牠的視線。站到發光的魚骨縫線旁邊按 F，再點另一端的縫點（或按 E），畫出貓縫。',10);
    }
    if(!L.T.t1&&PH.Seams.seam){L.T.t1=1;PH.UI.say('貓縫打開了！走到縫口按 E 鑽過去。教學中畫縫不扣奇妙值。',7);}
    if(!L.T.t2&&P.x>6&&!L.theft){L.T.t2=1;PH.UI.say('柴柴守在地圖罐附近。靠近玩具球按 E 踢出去，牠會去查聲音。',8);}
  },
  objective:function(L){
    const P=PH.P;
    if(!L.f.ate)return {t:'吃掉紙箱旁剩一口的迷你沙丁魚罐',x:3.4,y:7.5};
    if(P.x<5&&P.y>5.9)return {t:'縮小（2），從櫃子底下鑽出去',x:2.5,y:5.5};
    if(P.x<5&&P.y>3.9&&P.y<=5.9)return {t:'按 F 畫貓縫，再按 E 接到櫃側',x:4.4,y:4.5};
    if(!L.theft)return {t:'踢玩具球引開柴柴，拿走地圖罐',x:9.5,y:1.5};
    if(P.x<5&&P.y<3)return {t:'帶地圖罐鑽進窗邊紙箱',x:1.5,y:1.5};
    return {t:'從茶几背面畫貓縫，回到窗邊紙箱',x:8.5,y:3.6};
  },
  build:function(B){
    B.box(1.6,1.0,.08,'#bcd6ff',3,2.0,1.04).castShadow=false;B.box(1.7,.08,.12,'#f3dfbd',3,1.46,1.07);
    B.shaft(3,2.2,1.5,2.6,'#9fc0ff');
    B.lantern(9.5,1.25,5.2,'#ffcf7a');B.cyl(.05,1.2,'#7a4a2b',9.5,.6,5.2);
    [[1.03,7,0],[10.97,3,Math.PI],[10.97,5,Math.PI],[7.5,1.03,-Math.PI/2]].forEach(function(q){B.photo(q[0],1.7,q[1],q[2]);});
    B.clock(10.97,2.3,1.5,Math.PI);B.clock(1.03,2.3,6.5,0);
    B.rug(8.5,5.6,1.6,'#d9694f','#ffd23f');
    B.ball(.3,.22,.16,'#ff8f5a',2.2,1.1,3.3);B.ball(.3,.22,.16,'#ffd23f',4.2,1.1,3.3);
  },
  checks:[
    {name:'普通貓出不了出生小間',form:'normal',from:[1.5,7.5],to:[2.5,4.5],expect:false},
    {name:'迷你貓能鑽櫃底',form:'mini',from:[1.5,7.5],to:[2.5,4.5],expect:true},
    {name:'沙發後只能靠貓縫離開',form:'mini',from:[2.5,4.5],to:[6.5,5.5],expect:false},
    {name:'主房間走得到地圖罐',form:'normal',from:[6.4,5.5],to:[9.5,1.5],expect:true},
    {name:'窗邊只能靠貓縫',form:'mini',from:[6.4,5.5],to:[1.5,1.5],expect:false}
  ]
});

/* ===================== 第一關：會打噴嚏的廚房 ===================== */
const K_ISL=[[1,2,4,2],[6,3,11,7],[10,2,13,2],[9,11,12,12],[7,10,7,12]],K_SAFE=[[1,10,6,12],[1,13,16,17]];
PH.defLevel({
  id:'kitchen',title:'第一關',name:'會打噴嚏的廚房',size:[18,19],next:'laundry',
  reward:'giant',canName:'膨膨鮪魚罐',trouble:'burp',dogBoat:true,coreR:3.2,cpTheft:[6.6,3.5],
  lockMsg:'秩序局廣播：罐罐失竊！三秒後用鍋蓋封住走廊。',
  pal:{sky:'#8fd6f7',sky2:'#d8f1ff',fog:'#bfe6f7',fogNear:26,fogFar:70,wall:'#ffe2a8',trim:'#ffb07c',floor:['#bfe9f2','#fff7e6','#ffd9a0','#ffe9c4'],block:'#3fc1a5',top:'#fff6e3',liquid:'#f6992b',liquidY:-1.4,liquidRise:'theft'},
  mood:{hemi:['#e6f6ff','#ffcf9e',0.7],sun:['#fff2d0',0.6,[24,15,-2]]},
  ops:[['.',1,1,16,12],['H',1,1,1,1],['P',2,1,2,1],['H',3,1,3,1],['C',4,1,16,1],['K',11,1,12,1],
    ['C',1,3,3,3],['C',1,6,3,6],['C',3,5,3,5],['j',3,4,3,4],['T',7,4,10,6],['R',14,4,14,4],['L',6,8,6,8],['L',13,7,13,7],
    ['#',1,9,5,9],['C',14,10,16,10],['C',14,12,14,12],
    [',',2,13,2,13],[',',1,14,12,17],['C',4,14,4,14],['C',4,16,4,17],['~',7,14,8,17],[',',7,16,8,16]],
  legend:{H:{k:'solid',h:2.2,m:'block',col:'#eaf6ff',top:'#cfe4f2'},P:{k:'solid',h:0.3,m:'block',col:'#cfe4f2',top:'#eaf6ff'},
    K:{k:'solid',h:1.0,m:'block',col:'#b9c4cf',top:'#7fd0e6'},j:{k:'gap',h:1.0,lo:0.62,m:'gapblock',col:'#f3c98b'},
    R:{k:'solid',h:1.5,m:'rack',see:1},T:{k:'gap',h:0.62,lo:0.5,m:'table',col:'#ff6f61'}},
  start:{x:2.5,y:11.5,box:'home',yaw:0},
  ents:[
    {t:'box',id:'home',x:2.5,y:11.5,safe:1,finish:1},
    {t:'anchor',id:'K1a',x:8.5,y:7.4,pair:'K1b',name:'桌腳'},
    {t:'anchor',id:'K1b',x:4.5,y:4.5,pair:'K1a',name:'櫥櫃側'},
    {t:'anchor',id:'K2a',x:4.4,y:2.5,pair:'K2b',name:'冰箱側'},
    {t:'anchor',id:'K2b',x:11.5,y:2.5,pair:'K2a',name:'水槽下'},
    {t:'anchor',id:'K3a',x:10.5,y:11.5,pair:'K3b',name:'湯區平台'},
    {t:'anchor',id:'K3b',x:3.5,y:10.5,pair:'K3a',name:'出口走廊'},
    {t:'item',id:'handle',x:1.5,y:4.5,kind:'key',flag:'hasHandle',name:'魚骨把手',cp:['handle',4.5,4.5]},
    {t:'sw',id:'crank',x:3.5,y:2.4,label:'裝上魚骨把手並轉動',hold:2.2,need:'hasHandle',needMsg:'需要魚骨把手。它在餅乾罐隧道後面，只有迷你貓鑽得進去。',flag:'crank',model:'crank',snd:'crank'},
    {t:'ped',id:'ped',x:2.5,y:1.5,fx:2.5,fy:2.45,need:'crank',msg:'冰箱還在打噴嚏，罐台鎖著。先轉動魚骨把手。',hold:0.8},
    {t:'towel',id:'towel',x:14.5,y:4.5,dx:14.5,dy:5.7},
    {t:'knock',id:'spice',x:8.5,y:1.5,fx:8.5,fy:2.6,name:'香料罐'},
    {t:'knock',id:'ladle',x:15.5,y:1.5,fx:15.5,fy:2.6,name:'湯杓'},
    {t:'toy',id:'ball',x:9.5,y:9.5},
    {t:'item',id:'sc_k',x:16.5,y:2.5,kind:'smallcan',name:'普通小罐'},
    {t:'item',id:'bowl_kitchen',x:12.5,y:12.5,kind:'bowl',name:'空餐碗'},
    {t:'item',id:'c_kitchen',x:15.5,y:12.5,kind:'collect',name:'櫃背星星貼紙'},
    {t:'push',id:'bread',slots:[[14,11],[16,11]],form:'giant',h:0.7,model:'bread',label:'推開麵包'},
    {t:'mover',id:'plate1',pts:[[5.5,2.5],[5.5,4.5]],speed:1.3,wait:2.4,r:0.62,on:'theft',model:'plate'},
    {t:'mover',id:'plate2',pts:[[10.5,8.5],[10.5,10.4]],speed:1.3,wait:2.4,r:0.62,on:'theft',model:'toast'},
    {t:'mover',id:'plate3',pts:[[7.5,8.5],[7.5,9.45]],speed:1.0,wait:2.6,r:0.62,on:'theft',model:'saucer'},
    {t:'gate',id:'lid',tiles:[[6,10],[6,12]],close:'lockdown',h:1.9,model:'lid'},
    {t:'gate',id:'mug',tiles:[[6,11]],close:'lockdown',k:'gap',h:1.0,lo:0.4,model:'mug'},
    {t:'door',id:'edoor',x:16.95,y:7.5,ry:Math.PI},
    {t:'gate',id:'pgate',tiles:[[2,13]],open:'practice',h:2.4,model:'door'},
    {t:'push',id:'bread2',slots:[[4,15],[6,15]],form:'giant',h:0.7,model:'bread',label:'推開麵包'},
    {t:'plate',id:'spoon',x:6,y:16.9,r:1.0,form:'giant',flag:'spoon',say:'湯匙橋翹起來了！洗衣機的門在對面。'},
    {t:'gate',id:'sbridge',tiles:[[7,16],[8,16]],open:'spoon',k:'hazard',model:'spoon'},
    {t:'exit',id:'washer',x:11.5,y:15.5,label:'鑽進洗衣機（前往下一關）'}
  ],
  dogs:[
    {id:'shiba',kind:'shiba',x:12,y:2.5,route:[[5,2.5],[12,2.5,1],[15.5,3],[15.5,8,1],[12.5,8.8],[8,8.8,1],[5,7.5]],route2:[[5,5],[8.5,8.6,1],[13.5,8.5],[13.5,3.5,1],[8,2.4]]},
    {id:'corgi',kind:'corgi',at:'reinforce',door:'edoor',x:16.4,y:7.5,route:[[15.5,7.5],[13.5,9,1],[13.5,3.5,1]]}
  ],
  openCut:['咪嚕撬開膨膨鮪魚罐。鬍鬚先變大。','接著是整隻貓——紙箱被撐成一頂帽子。','「現在，問題不一定比你大。」','解鎖：巨大貓（3）。推得動重物、壓得下開關，但又吵又顯眼。'],
  dyn:function(L,set){
    if(!L.f.theft)return;
    for(let r=1;r<=12;r++)for(let c=1;c<=16;c++){
      if(L.leg[L.base[r*L.w+c]].k!=='floor'||inAny(c,r,K_ISL)||inAny(c,r,K_SAFE))continue;
      set(c,r,'hazard',0);
    }
  },
  init:function(L){L.T.sneeze=4;},
  update:function(L,dt){
    const P=PH.P;
    if(!L.f.crank){
      L.T.sneeze-=dt;
      if(L.T.sneeze<1&&!L.T.sneezeW){L.T.sneezeW=1;PH.UI.cue('哈……哈……',2.5,1.5);}
      if(L.T.sneeze<=0){
        L.T.sneeze=5.2;L.T.sneezeW=0;L.T.sneezeFx=0.5;PH.AU.play('sneeze');PH.FX.poof(2.5,2.3,14,'#dff3ff');
        if(!P.hidden&&U.inRect(P.x,P.y,[1,2,5.2,3])){P.slip=0.55;P.vx=6.5;P.vy=0.4;P.holdT=0;P.holdId=null;PH.UI.once('sneeze','冰箱打噴嚏會把貓吹開。抓準兩次噴嚏之間轉把手。',6);}
      }
    }
    if(L.T.sneezeFx>0)L.T.sneezeFx-=dt;
    if(L.f.theft&&!L.T.h1){L.T.h1=1;PH.UI.say('地板變成湯了！盤子會固定來回漂。K3 貓縫通往出口走廊；門口的杯子把手只有迷你貓鑽得過。',9);}
  },
  objective:function(L){
    const P=PH.P;
    if(PH.S.practice)return L.f.spoon?{t:'過湯匙橋，鑽進洗衣機',x:11.5,y:15.5}:(L.E.bread2.slot?{t:'在麵包後面變巨大，壓下湯匙',x:6,y:16.9}:{t:'練習：變巨大（3），推開麵包',x:3.3,y:15.5});
    if(!L.f.hasHandle)return {t:'找到魚骨把手（迷你貓鑽餅乾罐隧道）',x:3.6,y:4.5};
    if(!L.f.crank)return {t:'引開柴柴，到冰箱轉動魚骨把手',x:3.5,y:2.4};
    if(!L.theft)return {t:'抱走膨膨鮪魚罐',x:2.5,y:2.2};
    if(L.can)return {t:'罐罐被放在地上，記得抱回來',x:L.can.x,y:L.can.y};
    return {t:'帶罐罐回安全紙箱（盤子→K3，或杯柄窄道）',x:2.5,y:11.5};
  },
  build:function(B,L){
    B.box(.14,.14,.03,'#ff6f61',1.4,1.5,2.02);B.box(.12,.12,.03,'#ffd23f',3.6,1.4,2.02);
    B.cyl(.28,.24,'#ff6f61',6.5,1.16,1.5);B.cyl(.16,.2,'#e58f4e',9.5,1.14,1.5);B.ball(.26,.3,.26,'#5bc470',9.5,1.5,1.5);
    B.box(2.4,.9,.05,'#d6f1ff',7,2.2,1.03).castShadow=false;B.box(2.4,.9,.05,'#d6f1ff',14,2.2,1.03).castShadow=false;
    B.shaft(7,2.6,1.6,2.8,'#fff3c4');B.shaft(14,2.6,1.6,2.8,'#fff3c4');
    B.photo(1.03,1.7,8,0);B.photo(16.97,1.7,4,Math.PI);B.clock(16.97,2.4,10.5,Math.PI);
    B.bunting(7,1.1,16,1.1,2.75);
    B.lantern(8.5,1.9,5,'#ffcf7a');
    B.cyl(.3,.03,'#ffffff',8.2,.68,4.6);B.cyl(.3,.03,'#ffffff',9.6,.68,5.6);B.ball(.13,.13,.13,'#ff8f5a',8.2,.8,4.6);B.cyl(.12,.14,'#3fc1a5',9,.72,5);
    B.box(.9,1.1,.9,'#eaf6ff',11.5,.55,16.5);B.torus(.3,.06,'#b9c4cf',11.02,.55,15.5,0,Math.PI/2);
    B.sign('洗衣機',11.5,1.5,14.06,0,1.2,.36,'#3fa9e0','#fff');
    for(let i=0;i<10;i++){const a=i/10*6.283;B.cloud(9+Math.cos(a)*28,6+i%4*1.5,8+Math.sin(a)*24,3+i%3);}
  },
  checks:[
    {name:'普通貓走得到冰箱前',form:'normal',from:[2.5,11.5],to:[2.5,2.45],expect:true},
    {name:'普通貓拿不到把手',form:'normal',from:[2.5,11.5],to:[1.5,4.5],expect:false},
    {name:'迷你貓拿得到把手',form:'mini',from:[2.5,11.5],to:[1.5,4.5],expect:true},
    {name:'偷罐後冰箱島走不到餐桌島（要搭盤子或 K2）',flags:['theft'],form:'normal',from:[2.5,2.45],to:[6.5,3.5],expect:false},
    {name:'偷罐後水槽島接餐桌島',flags:['theft'],form:'normal',from:[11.5,2.5],to:[6.5,3.5],expect:true},
    {name:'封鎖後門口只剩迷你通道',flags:['theft','lockdown'],form:'normal',from:[7.5,11.5],to:[2.5,11.5],expect:false},
    {name:'封鎖後迷你貓鑽得過杯柄',flags:['theft','lockdown'],form:'mini',from:[7.5,11.5],to:[2.5,11.5],expect:true},
    {name:'K3 出口接安全紙箱',flags:['theft','lockdown'],form:'normal',from:[3.5,10.5],to:[2.5,11.5],expect:true},
    {name:'練習區關著',form:'mini',from:[2.5,11.5],to:[2.5,15.5],expect:false},
    {name:'練習區：麵包擋路',flags:['practice'],form:'normal',from:[2.5,11.5],to:[5.5,15.5],expect:false},
    {name:'練習區：湯匙橋接洗衣機',flags:['practice','spoon'],slots:{bread2:1},form:'normal',from:[2.5,11.5],to:[11.5,15.5],expect:true}
  ]
});

/* ===================== 第二關：洗衣機裡的海底宇宙 ===================== */
PH.defLevel({
  id:'laundry',title:'第二關',name:'洗衣機裡的海底宇宙',size:[22,21],next:'museum',
  reward:'liquid',canName:'流心鮭魚罐',trouble:'scent',coreR:3.4,cpTheft:[6.6,5.5],ambient:{period:11,on:6},
  lockMsg:'秩序局廣播：金庫失竊！脫水程序啟動，拖把犬出動。',fallMsg:'噗通！被水流沖回最近的浮台。',
  pal:{sky:'#0f3554',sky2:'#3aa0b8',fog:'#1c5a78',fogNear:16,fogFar:52,wall:'#5fb3c9',trim:'#e8f7ff',floor:['#f3ead2','#e4d7b8','#cfe9f2','#bfdfe9','#7fd0e6'],block:'#e98fb0',top:'#fff1f6',liquid:'#1f7ea8',liquidY:-0.32},
  mood:{hemi:['#bfefff','#3a7a9a',0.75],sun:['#dff6ff',0.5,[6,16,4]]},
  ops:[['~',1,1,20,15],['H',5,1,10,4],['.',6,2,9,3],['f',7,4,7,4],['.',6,5,9,6],['.',4,6,5,6],['.',1,6,3,11],
    ['H',15,1,20,4],[',',16,2,19,3],[',',17,4,17,4],['.',15,5,19,6],
    ['.',10,8,13,10],['Q',12,8,13,8],['.',10,11,10,11],['.',5,12,11,14],['w',12,12,13,14],['.',14,12,19,14],['.',18,8,19,11],['w',18,11,19,11],
    [',',6,15,6,15],[',',5,16,15,19],['H',10,16,10,19]],
  legend:{H:{k:'solid',h:2.4,m:'block',col:'#dfe9ef',top:'#b9c9d4'},f:{k:'gap',h:2.4,lo:0.3,m:'gapblock',col:'#9fb4c2'},
    Q:{k:'solid',h:1.1,m:'block',col:'#e0b070',top:'#f1cf8e'}},
  start:{x:6.5,y:13.5,box:'home'},
  ents:[
    {t:'box',id:'home',x:6.5,y:13.5,safe:1,finish:1},
    {t:'anchor',id:'W1a',x:10.4,y:9.5,pair:'W1b',name:'籃筐背'},
    {t:'anchor',id:'W1b',x:3.4,y:9.5,pair:'W1a',name:'襪子礁'},
    {t:'anchor',id:'W2a',x:19.5,y:10.5,pair:'W2b',name:'洗衣精瓶',follow:['bottle',1,0.5],on:'bottle',offMsg:'瓶子還沒推到卡位，離控制室太遠。'},
    {t:'anchor',id:'W2b',x:15.5,y:6.5,pair:'W2a',name:'控制室外'},
    {t:'anchor',id:'W3a',x:9.4,y:5.5,pair:'W3b',name:'金庫側'},
    {t:'anchor',id:'W3b',x:8.5,y:12.5,pair:'W3a',name:'出口碼頭'},
    {t:'push',id:'bottle',slots:[[15,13],[18,13],[18,10]],form:'giant',h:1.3,model:'bottle',label:'沿滑軌推洗衣精瓶',flags:{2:'bottle'}},
    {t:'sw',id:'dry',x:17.5,y:2.4,label:'操作乾燥開關',hold:1.5,flag:'bridge',model:'lever',snd:'crank'},
    {t:'gate',id:'sockbridge',tiles:[[4,6],[5,6]],open:'bridge',close:'stage2',k:'hazard',model:'socks'},
    {t:'gate',id:'plank',tiles:[[10,11]],close:'stage3',k:'hazard',model:'plank'},
    {t:'chute',id:'chute',x:19.5,y:6.5,to:[19.5,8.6],label:'滑下洗衣槽'},
    {t:'ped',id:'ped',x:8.5,y:2.5,hold:0.8},
    {t:'mover',id:'sockboat',pts:[[9.4,9.5],[4.6,9.5]],speed:1.5,wait:2.4,r:0.62,model:'sock'},
    {t:'mover',id:'lidboat',pts:[[7.5,7.5],[8.5,8.5],[9.4,8.5]],speed:1.3,wait:2.2,r:0.62,on:'stage2',model:'lidboat'},
    {t:'mover',id:'plankboat',pts:[[10.5,11.5],[8.5,11.5]],speed:1.1,wait:2.6,r:0.62,on:'stage3',model:'toast'},
    {t:'wind',id:'bubble',from:[13.5,9.5],to:[18.5,8.6],period:7,dur:3},
    {t:'soap',id:'soap',x:11.5,y:10.5,bx:11.5,by:9.2},
    {t:'toy',id:'duck',x:16.5,y:13.6},
    {t:'item',id:'i_sticker',x:2.5,y:6.5,kind:'sticker'},
    {t:'item',id:'i_fish',x:15.5,y:5.5,kind:'fish'},
    {t:'item',id:'sc_l',x:19.5,y:2.5,kind:'smallcan',name:'普通小罐'},
    {t:'item',id:'bowl_laundry',x:1.5,y:7.5,kind:'bowl',name:'空餐碗'},
    {t:'item',id:'c_laundry',x:1.5,y:11.5,kind:'collect',name:'襪子國王徽章'},
    {t:'door',id:'d1',x:19.95,y:13.5,ry:Math.PI},
    {t:'gate',id:'pgate',tiles:[[6,15]],open:'practice',k:'hazard',model:'plank'},
    {t:'pipe',id:'teapot',a:[9.5,17.5],b:[11.5,17.5],model:'teapot'},
    {t:'exit',id:'next',x:14.5,y:17.5,label:'順著水管流走（前往下一關）'}
  ],
  dogs:[
    {id:'nosey',kind:'nose',x:18.5,y:9,route:[[18.5,9,1],[18.5,13.4],[15,12.6,1],[18.5,13.4]],route2:[[10.5,13],[10.5,9.5,1],[7.5,13,1],[15.5,13.4]]},
    {id:'captain',kind:'captain',x:2.5,y:10.5,route:[[2.5,10.5]]},
    {id:'mop',kind:'mop',at:'lockdown',door:'d1',x:19.4,y:13.5,route:[[15.5,13.5],[8.5,13.5,1],[10.5,9.5,1]]}
  ],
  openCut:['咪嚕打開流心鮭魚罐。','腳還留在原地，身體先滑進了碗裡，尾巴掛在碗邊。','解鎖：液體貓（4）。可以流進指定的管線與窄口；海綿會把牠吸住。'],
  onFlag:function(L,k,v){
    if(!v)return;
    if(k==='bottle'){PH.UI.say('瓶子卡進卡位了！瓶身上的縫點現在連得到控制室外。',6);W.checkpoint('bottle',19.5,12.5);}
    if(k==='bridge'){PH.UI.say('乾燥開關啟動——襪子橋搭到金庫前了。金庫濾網只有迷你貓鑽得過。',7);PH.AU.play('unlock');}
    if(k==='stage2')PH.UI.say('脫水第二段：襪子橋被甩走了！鍋蓋浮台開始在金庫外和洗衣籃之間來回。',7);
    if(k==='stage3')PH.UI.say('脫水第三段：木板漂走了，改成來回漂的浮台。水流方向也變了。',7);
  },
  onTheft:function(L){L.T.stage=30;},
  update:function(L,dt){
    if(!L.theft)return;
    if(!L.f.stage3){
      L.T.stage-=dt;
      if(L.T.stage<4&&!L.T.stageW){L.T.stageW=1;PH.UI.cue('轟隆隆……脫水要換段了',10,8);PH.AU.play('rumble');}
      if(L.T.stage<=0){L.T.stage=30;L.T.stageW=0;W.set(L.f.stage2?'stage3':'stage2');PH.FX.shake(6);}
    }
  },
  objective:function(L){
    const b=L.E.bottle;
    if(PH.S.practice)return {t:'練習：變成液體貓（4），流進茶壺、從壺嘴出來',x:PH.P.x<10?9.5:14.5,y:17.5};
    if(!L.f.bottle)return {t:'變巨大（3），把洗衣精瓶沿滑軌推到卡位',x:b.px,y:b.py};
    if(!L.f.bridge)return PH.P.y>7?{t:'從瓶子的縫點畫貓縫到控制室外',x:L.E.W2a.x,y:L.E.W2a.y}:{t:'進控制室操作乾燥開關',x:17.5,y:2.4};
    if(!L.theft)return PH.P.x<6&&PH.P.y>5?{t:'走襪子橋，縮小鑽過濾網拿罐罐',x:7.5,y:4.5}:{t:'到襪子礁（籃筐背的貓縫或襪子船）',x:3.4,y:9.5};
    if(L.can)return {t:'罐罐被放在地上，記得抱回來',x:L.can.x,y:L.can.y};
    return {t:'脫水中！帶流心鮭魚罐回安全紙箱',x:6.5,y:13.5};
  },
  build:function(B,L){
    B.cyl(1.9,.4,'#b9c9d4',8,2.6,2.5,0,0,Math.PI/2);B.torus(1.5,.18,'#8fa3b0',8,1.4,4.06);
    B.sign('滾筒金庫',8,2.9,4.08,0,1.8,.4,'#16425b','#dff6ff');B.sign('脫水控制室',17.5,2.9,4.08,0,2,.4,'#16425b','#ffd23f');
    [[2,7,'#ff8fa3'],[3,8.5,'#ffd23f'],[1.6,9.6,'#8fc3b4'],[4.4,11,'#c9a0ff']].forEach(function(q){B.ball(.5,.22,.32,q[2],q[0],.2,q[1]);});
    B.box(1.9,.5,.9,'#f1cf8e',13,1.35,8.5).castShadow=false;
    for(let i=0;i<16;i++){const x=1.5+(i*7.3)%19,z=1.5+(i*4.9)%13;B.bubble(x,1.2+i%4*.7,z,.18+i%3*.1);}
    B.lantern(6.5,1.6,12.2,'#ffcf7a');B.lantern(15.2,1.6,12.2,'#ffcf7a');
    B.bunting(5,12.05,19,12.05,2.1);
    B.shaft(11,9,2.4,5,'#bfefff');B.shaft(4,13,2,5,'#bfefff');
    B.cyl(.7,.9,'#fff6e3',10.5,.45,17.5);B.cone(.25,.7,'#fff6e3',11.3,.6,17.5,0,0,-1.2);B.torus(.3,.07,'#fff6e3',9.6,.5,17.5,Math.PI/2,0);
    B.rock(1.2,13.6,1.2,'#2f6f8f');B.rock(20.3,7,1.5,'#2f6f8f');B.rock(12,1.6,1.3,'#2f6f8f');
  },
  checks:[
    {name:'安全碼頭走得到滑軌',form:'normal',from:[6.5,13.5],to:[16.5,12.5],expect:true},
    {name:'安全碼頭走得到洗衣籃',form:'normal',from:[6.5,13.5],to:[10.5,9.5],expect:true},
    {name:'走不到控制室外',form:'mini',from:[6.5,13.5],to:[15.5,6.5],expect:false},
    {name:'控制室外進得了控制室',form:'normal',from:[15.5,6.5],to:[17.5,2.5],expect:true},
    {name:'沒開橋到不了金庫前',form:'mini',from:[2.5,8.5],to:[7.5,5.5],expect:false},
    {name:'開橋後礁島接金庫前',flags:['bridge'],form:'normal',from:[2.5,8.5],to:[7.5,5.5],expect:true},
    {name:'濾網只有迷你貓能過',flags:['bridge'],form:'normal',from:[7.5,5.5],to:[8.5,2.9],expect:false},
    {name:'迷你貓進得了金庫',flags:['bridge'],form:'mini',from:[7.5,5.5],to:[8.5,2.9],expect:true},
    {name:'第三段木板漂走',flags:['stage3'],form:'normal',from:[10.5,9.5],to:[6.5,13.5],expect:false},
    {name:'瓶子卡位後東岸仍可通行',slots:{bottle:2},form:'normal',from:[16.5,13.5],to:[19.5,9.5],expect:true}
  ]
});
})();
