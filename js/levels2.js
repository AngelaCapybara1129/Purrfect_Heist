/* 關卡資料（下）：第三關博物館、第四關天空市場、最終關罐頭月亮、月亮消氣逃亡 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,W=PH.World;

/* ===================== 第三關：禁止做夢的博物館 ===================== */
PH.defLevel({
  id:'museum',title:'第三關',name:'禁止做夢的博物館',size:[22,21],next:'market',
  reward:'shadow',canName:'午夜墨魚罐',trouble:'glow',coreR:99,cpTheft:[11.5,2.6],
  lockMsg:'秩序局廣播：展櫃失竊！所有夢境甦醒，探照燈改掃主通道。',
  pal:{sky:'#141026',sky2:'#3a2a5c',fog:'#1c1634',fogNear:12,fogFar:40,wall:'#4a3f6b',trim:'#c9a24a',floor:['#3b3358','#463c66','#5a3f4f','#66485a'],block:'#7a5a3c',top:'#c9a24a'},
  mood:{hemi:['#8f7fd0','#2a2140',0.5],sun:['#b9a8ff',0.32,[10,14,3]],amb:'#241c3c',dark:true},
  ops:[['.',8,1,18,3],['P',11,1,11,1],['.',8,4,8,4],['.',18,4,18,4],['.',1,5,20,8],['L',16,5,16,7],
    [',',1,10,4,12],[',',6,10,9,12],['.',8,9,8,9],[',',12,10,20,12],['.',18,9,18,9],[',',20,13,20,13],[',',1,14,20,15],[',',2,13,2,13],
    [',',5,16,5,16],[',',1,17,12,19],['%',7,17,7,19]],
  legend:{L:{k:'solid',h:0.55,m:'block',col:'#8a2f3f',top:'#c9a24a'},P:{k:'solid',h:0.8,m:'block',col:'#2a2140',top:'#c9a24a'}},
  shade:[[4,17,10,19]],
  start:{x:2.5,y:11.5,box:'home'},
  ents:[
    {t:'box',id:'home',x:2.5,y:11.5,safe:1,finish:1},
    {t:'anchor',id:'M1a',x:4.4,y:10.5,pair:'M1b',name:'寄物櫃'},
    {t:'anchor',id:'M1b',x:6.6,y:10.5,pair:'M1a',name:'維修間'},
    {t:'anchor',id:'M2a',x:6.5,y:5.5,pair:'M2b',name:'公車站牌'},
    {t:'anchor',id:'M2b',x:13.4,y:5.5,pair:'M2a',name:'考卷架'},
    {t:'anchor',id:'M3a',x:15.4,y:5.5,pair:'M3b',name:'展櫃外'},
    {t:'anchor',id:'M3b',x:17.6,y:7.5,pair:'M3a',name:'害羞門前'},
    {t:'pipe',id:'pipeA',a:[4.5,11.5],b:[6.5,11.5]},
    {t:'pipe',id:'pipeC',a:[13.5,8.5],b:[13.5,10.5]},
    {t:'sw',id:'sponge',x:7.5,y:12.4,label:'關掉海綿阻擋裝置',hold:1.2,flag:'sponge',model:'lever',snd:'crank'},
    {t:'gate',id:'gSponge',tiles:[[8,9]],open:'sponge',close:'lockdown',h:2.2,model:'sponge'},
    {t:'gate',id:'gW',tiles:[[8,4]],open:'theft',h:2.4,model:'shutter'},
    {t:'gate',id:'gE',tiles:[[18,4]],close:'lockdown',h:2.4,model:'shutter'},
    {t:'gate',id:'turn',tiles:[[16,8]],close:'lockdown',h:0.55,dp:1,model:'rail'},
    {t:'gate',id:'pA',tiles:[[14,5],[14,7]],base:1,cycle:{on:'lockdown',period:5,from:0,to:2.5},h:1.8,model:'panel'},
    {t:'gate',id:'pB',tiles:[[14,6]],base:1,cycle:{on:'lockdown',period:5,from:2.5,to:5},h:1.8,model:'panel'},
    {t:'gate',id:'pC',tiles:[[14,8]],cycle:{on:'lockdown',period:5,from:2.5,to:5},h:1.8,model:'panel'},
    {t:'shy',id:'shy',flag:'shy',zone:[17,7,19.99,8.99],dir:[0,1],tiles:[[18,9]]},
    {t:'gate',id:'gShy',tiles:[[18,9]],open:'shy',h:2.2,model:'shydoor'},
    {t:'gate',id:'gBack',tiles:[[2,13]],open:'backdoor',h:2.2,model:'door'},
    {t:'zone',id:'zBack',rect:[1,14,3.99,15.99],flag:'backdoor',say:'從走廊這一側推開了寄物處的後門。'},
    {t:'light',id:'spot1',mx:18.6,my:2.5,pts:[[9.5,2.5],[17.3,2.5]],r:1.25,period:8,off:'lockdown'},
    {t:'light',id:'spot2',mx:10.3,my:5.2,pts:[[10.0,7],[10.6,7]],r:2.0,period:4,on:'lockdown'},
    {t:'push',id:'board',slots:[[14,3],[14,2]],form:'any',h:1.9,model:'board',label:'推動遮光板'},
    {t:'ped',id:'ped',x:11.5,y:1.5,fx:11.5,fy:2.45,hold:0.8},
    {t:'mover',id:'bus',pts:[[3.5,7.5],[13.2,7.5]],speed:1.7,wait:3,r:0.75,on:'lockdown',park:1,hide:1,model:'bus',name:'夢境公車'},
    {t:'plant',id:'pl1',x:5.5,y:5.5},{t:'plant',id:'pl2',x:10.5,y:8.5},{t:'plant',id:'pl3',x:19.5,y:8.5},{t:'plant',id:'pl4',x:15.5,y:8.5},
    {t:'item',id:'i_furball',x:3.5,y:5.5,kind:'furball'},
    {t:'item',id:'i_sticker2',x:12.5,y:11.5,kind:'sticker'},
    {t:'item',id:'sc_m',x:17.5,y:1.5,kind:'smallcan',name:'普通小罐'},
    {t:'item',id:'c_museum',x:1.5,y:8.5,kind:'collect',name:'忘記寫名字的學生證'},
    {t:'item',id:'bowl_museum',x:19.5,y:11.5,kind:'bowl',name:'空餐碗'},
    {t:'door',id:'wdoor',x:1.05,y:6.5,ry:0},
    {t:'gate',id:'pgate',tiles:[[5,16]],open:'practice',h:2.2,model:'door'},
    {t:'exit',id:'next',x:11.5,y:18.5,label:'鑽進通風口（前往下一關）'}
  ],
  dogs:[
    {id:'poodle',kind:'poodle',x:19,y:6.5,route:[[19,6.5,1],[17.5,8.5],[15,8.3],[9.5,6.5,1],[4.5,6.5,1],[9.5,6.5],[15,8.3],[17.5,8.5]],route2:[[19,6,1],[17.5,6.2],[19.5,7.6,1]]},
    {id:'guard',kind:'shiba',at:'lockdown',door:'wdoor',x:1.5,y:6.5,guardExit:1,route:[[3.5,6.5,1],[9,5.6],[12.5,8.3,1],[7.5,5.5]]}
  ],
  openCut:['咪嚕打開午夜墨魚罐。','牠的影子伸了個懶腰，自己走掉了。','咪嚕一把拉住它——結果被影子拉進了地面。','解鎖：影子貓（5）。只能走連在一起的陰影，強光會把牠逼出來，也摸不到實體機關。'],
  onTheft:function(L){W.lockdown();PH.UI.say('夢境甦醒了！西側捲門打開。搭夢境公車穿過探照燈，趁考卷翻頁通過。',8);},
  objective:function(L){
    const P=PH.P;
    if(PH.S.practice)return {t:'練習：站進陰影變成影子貓（5），穿過光柵欄',x:P.x<7?7.5:11.5,y:18.5};
    if(!L.f.sponge){
      if(P.x<5&&P.y>9&&P.y<13)return {t:'變成液體貓（4）流進維修管，或用寄物櫃的貓縫',x:4.5,y:11.5};
      return {t:'關掉海綿阻擋裝置',x:7.5,y:12.4};
    }
    if(!L.theft){
      if(P.y>8.99&&P.x<10)return {t:'從維修間的門進展廳',x:8.5,y:9.5};
      if(!L.E.board.slot)return P.y<4?{t:'趁光束掃到另一邊，推動遮光板',x:14.5,y:3.5}:{t:'用盆栽躲過燈泡貴賓，從東側入口進展間',x:18.5,y:4.5};
      return {t:'在遮光板的暗處拿走午夜墨魚罐',x:11.5,y:2.3};
    }
    if(P.y<4.99&&P.x<19)return {t:'從西側捲門離開展間',x:8.5,y:4.5};
    if(P.y<9&&P.x<14)return {t:'搭夢境公車穿過探照燈（或走液體維修管）',x:L.E.bus.x,y:L.E.bus.y};
    if(P.y<9&&P.x<16)return {t:'用展櫃外的貓縫到害羞門前',x:15.4,y:5.5};
    if(P.y<9)return {t:'背對害羞門站兩秒，等它偷偷打開',x:18.5,y:8.5};
    if(P.y<13&&P.x>11)return {t:'沿走廊繞回寄物處',x:20.5,y:13.5};
    return {t:'帶午夜墨魚罐回寄物處紙箱',x:2.5,y:11.5};
  },
  build:function(B,L){
    B.sign('禁止做夢',10.5,2.6,4.06,0,2.4,.5,'#2a2140','#ffd23f');
    B.sign('考卷展區',12,2.5,4.98,Math.PI,2,.4,'#2a2140','#e8e0ff');
    B.sign('寄物處',2.5,2.3,9.06,0,1.4,.4,'#2a2140','#e8e0ff');
    B.cyl(.07,1.6,'#c9a24a',6.9,.8,5.15);B.sign('站牌',6.9,1.5,5.2,0,.6,.3,'#ffd23f','#2a2140');
    [[3,5.03],[6,5.03],[15.5,8.97],[19,5.03]].forEach(function(q,i){B.box(1.2,.9,.06,['#ff8fa3','#7fd0e6','#ffd23f','#8fc3b4'][i],q[0],1.7,q[1]);B.box(1.34,1.04,.04,'#c9a24a',q[0],1.7,q[1]+(q[1]<6?-.02:.02));});
    B.lantern(4,2.2,6.5,'#ffb86b');B.lantern(12,2.2,6.5,'#ffb86b');B.lantern(19,2.2,6.5,'#ffb86b');B.lantern(2.5,1.8,10.6,'#ffcf7a');B.lantern(16,1.8,11,'#ffb86b');
    B.shaft(11.5,2.2,1.3,3,'#b9a8ff');
    [[1.6,10.4],[1.6,12.5],[3.4,12.5]].forEach(function(q){B.box(.7,1.5,.5,'#5a6aa8',q[0],.75,q[1]);});
    B.rug(11.5,2.6,1.2,'#8a2f3f','#c9a24a');
    for(let i=0;i<4;i++)B.box(.5,.04,.36,'#f3ead2',9.4+i*1.1,.03,5.5+(i%2)*.5,0,i*.5,0);
    B.bunting(1,14.05,20,14.05,2.3);
  },
  checks:[
    {name:'寄物處被封死',form:'normal',from:[2.5,11.5],to:[8.5,8.5],expect:false},
    {name:'關掉海綿後進得了展間',flags:['sponge'],form:'normal',from:[7.5,11.5],to:[18.5,2.5],expect:true},
    {name:'遮光板推開後走得到罐台前',flags:['sponge'],slots:{board:1},form:'normal',from:[18.5,2.5],to:[11.5,2.45],expect:true},
    {name:'偷罐後西側捲門可走',flags:['sponge','theft','lockdown'],form:'normal',from:[11.5,2.45],to:[8.5,5.5],expect:true},
    {name:'封鎖後閘門擋住',flags:['sponge','theft','lockdown'],form:'normal',from:[15.5,5.5],to:[17.6,7.5],expect:false},
    {name:'害羞門開了才到側廊',flags:['theft','lockdown','shy'],form:'normal',from:[17.6,7.5],to:[18.5,10.5],expect:true},
    {name:'側廊繞回紙箱',flags:['theft','lockdown','backdoor'],form:'normal',from:[18.5,10.5],to:[2.5,11.5],expect:true},
    {name:'練習區光柵欄只有影子能過',flags:['practice','backdoor'],form:'normal',from:[2.5,18.5],to:[11.5,18.5],expect:false},
    {name:'影子貓穿過光柵欄',flags:['practice'],form:'shadow',from:[5.5,18.5],to:[9.5,18.5],expect:true}
  ]
});

/* ===================== 第四關：倒著下雨的天空市場 ===================== */
PH.defLevel({
  id:'market',title:'第四關',name:'倒著下雨的天空市場',size:[24,21],next:'moon',
  reward:'echo',canName:'回音飛魚罐',trouble:'walk',coreR:99,cpTheft:[12,3],exitRoute:[[18.5,14.6,1],[17.6,17,1]],exitR:6,
  lockMsg:'收攤鐘響了！市場開始打烊折疊，三秒後拉起封鎖線。',
  pal:{sky:'#f6a56b',sky2:'#7a5aa8',fog:'#e8a07a',fogNear:22,fogFar:64,wall:'#f3ead2',trim:'#e98fb0',floor:['#f1cf8e','#e9bf78','#bfe0d4','#a9d2c4'],block:'#d9694f',top:'#ffe9c4'},
  mood:{hemi:['#ffd9b0','#7a5aa8',0.75],sun:['#ffe0a8',0.6,[4,12,14]]},
  ops:[['.',8,7,15,12],['.',11,5,12,6],['c',10,5,10,6],['.',8,1,15,4],['P',11,1,12,1],
    ['.',1,6,6,11],['.',7,8,7,9],[',',1,3,3,4],[',',2,5,2,5],
    ['.',17,6,22,12],['.',16,9,16,10],['%',20,6,20,12],
    ['.',1,13,6,19],['.',7,14,8,14],['.',8,13,8,13],['c',2,15,5,18],[',',3,16,4,17],[',',8,17,8,17],[',',7,17,7,17],
    [',',10,14,13,17],['.',11,13,12,13],['.',15,13,15,14],['.',16,14,16,14],['.',17,14,22,18],[',',19,16,22,18]],
  legend:{'#':{k:'solid',h:1.5,m:'cloudwall'},c:{k:'gap',h:0.9,lo:0.32,m:'gapblock',col:'#b98250'},P:{k:'solid',h:0.9,m:'block',col:'#7a5aa8',top:'#ffd23f'}},
  shade:[[18,6,22,12]],
  start:{x:11.5,y:16.5,box:'home'},
  ents:[
    {t:'box',id:'home',x:11.5,y:16.5,safe:1},
    {t:'box',id:'ferry',x:21.5,y:17.5,safe:1,finish:1},
    {t:'anchor',id:'S1a',x:5.5,y:14.5,pair:'S1b',name:'抽屜側'},
    {t:'anchor',id:'S1b',x:8.5,y:9.5,pair:'S1a',name:'中央廣場'},
    {t:'anchor',id:'S2a',x:5.5,y:6.5,pair:'S2b',name:'天平卡位',on:'scale',offMsg:'天平還沒壓下去，這個縫點被攤位擋住。'},
    {t:'anchor',id:'S2b',x:8.5,y:3.5,pair:'S2a',name:'交換所外'},
    {t:'anchor',id:'S3a',x:21.5,y:11.5,pair:'S3b',name:'影魚終站'},
    {t:'anchor',id:'S3b',x:18.5,y:15.5,pair:'S3a',name:'碼頭'},
    {t:'item',id:'t1',x:2.5,y:3.5,kind:'ticket',name:'魚骨票（天平攤）'},
    {t:'item',id:'t2',x:21.5,y:7.5,kind:'ticket',name:'魚骨票（影魚步道）'},
    {t:'item',id:'t3',x:3.5,y:16.5,kind:'ticket',name:'魚骨票（收銀抽屜）'},
    {t:'plate',id:'scale',x:4,y:9,r:1.0,form:'giant',flag:'scale',say:'天平壓下去了！攤位升起，露出魚骨票的小間和新的縫點。'},
    {t:'gate',id:'gAlcove',tiles:[[2,5]],open:'scale',h:1.6,model:'stall'},
    {t:'ped',id:'ped',x:12,y:1.5,fx:12,fy:2.45,tickets:3,hold:1.0,label:'交出三張魚骨票，換回音飛魚罐'},
    {t:'bell',id:'b1',x:3.5,y:15.5},{t:'bell',id:'b2',x:2.5,y:17.5},{t:'bell',id:'b3',x:5.5,y:16.5},{t:'bell',id:'b4',x:4.5,y:18.5},
    {t:'light',id:'lampA',mx:19.5,my:6.2,x:19.4,y:7.6,r:1.9,blink:{on:3,off:3,phase:0}},
    {t:'light',id:'lampB',mx:19.5,my:12.6,x:19.4,y:10.6,r:1.9,blink:{on:3,off:3,phase:3}},
    {t:'gate',id:'st1',tiles:[[9,8],[10,8]],open:'fold1',h:1.1,model:'stall'},
    {t:'gate',id:'st2',tiles:[[13,8],[14,8]],open:'fold2',h:1.1,model:'stall'},
    {t:'gate',id:'st3',tiles:[[9,11],[10,11]],open:'fold3',h:1.1,model:'stall'},
    {t:'gate',id:'st4',tiles:[[13,11],[14,11]],open:'fold4',h:1.1,model:'stall'},
    {t:'gate',id:'barA',tiles:[[8,10],[9,10],[10,10]],cycle:{on:'lockdown',period:15,from:0,to:5},h:0.6,model:'tape'},
    {t:'gate',id:'barB',tiles:[[11,10],[12,10]],cycle:{on:'lockdown',period:15,from:5,to:10},h:0.6,model:'tape'},
    {t:'gate',id:'barC',tiles:[[13,10],[14,10],[15,10]],cycle:{on:'lockdown',period:15,from:10,to:15},h:0.6,model:'tape'},
    {t:'gate',id:'gDock',tiles:[[16,14]],open:'theft',h:0.9,model:'rail'},
    {t:'plate',id:'dogplate',x:1.5,y:19.4,r:0.8,by:'dog',flag:'stash',say:'夢遊犬踩到踏板——角落的暗格打開了。'},
    {t:'gate',id:'gStash',tiles:[[7,17]],open:'stash',h:1.2,model:'stall'},
    {t:'item',id:'c_market',x:8.5,y:17.5,kind:'collect',name:'翹班的招牌字母'},
    {t:'item',id:'i_furball2',x:8.5,y:7.5,kind:'furball'},
    {t:'item',id:'i_sticker3',x:1.5,y:10.5,kind:'sticker'},
    {t:'item',id:'i_fish2',x:17.5,y:12.5,kind:'fish'},
    {t:'item',id:'sc_s',x:8.5,y:1.5,kind:'smallcan',name:'普通小罐'},
    {t:'item',id:'fl_market',x:15.5,y:1.5,kind:'flavor',name:'隱藏口味：彩虹飛魚罐'},
    {t:'item',id:'bowl_market',x:22.5,y:12.5,kind:'bowl',name:'空餐碗'},
    {t:'door',id:'sdoor',x:8.02,y:11.5,ry:0},
    {t:'exit',id:'next',x:22.5,y:15.5,need:'teapot',needMsg:'先試試新能力：對著碼頭的茶壺投射一聲喵。',label:'走上跳板（前往罐頭月亮）'}
  ],
  dogs:[
    {id:'corgi',kind:'corgi',x:9,y:9.3,route:[[9,9.3,1],[14.5,9.3,1],[14.5,7.5],[9,7.5]],route2:[[15.3,12.4,1],[13,12.3,1]],exitGuard:1},
    {id:'bull',kind:'bulldog',x:12,y:5.7,post:1,face:1.5708,route:[[12,5.7]]},
    {id:'poodle',kind:'poodle',x:18.5,y:7,route:[[18.5,7,1],[18.5,11.5,1]]},
    {id:'walker',kind:'sleepwalk',x:1.5,y:13.6,route:[[1.5,13.6],[6,13.6]]},
    {id:'sealer',kind:'shiba',at:'lockdown',door:'sdoor',x:8.5,y:11.5,sealer:1,route:[[9,11.6,1],[12,9],[14.5,11.6,1],[12,7.5]]}
  ],
  openCut:['咪嚕打開回音飛魚罐，張開嘴——沒有聲音。','遠處的茶壺突然「喵」了一聲，連壺蓋都嚇了一跳。','解鎖：喵聲投射（按住 R 瞄準、放開投出）。站在貓縫旁邊時，聲音會從另一端先傳出去。'],
  onItem:function(L,e){
    if(e.kind==='ticket'&&PH.P.tickets===3){PH.UI.say('三張魚骨票到手！到北邊的交換所換罐罐。重裝鬥牛犬守著大路。',7);W.checkpoint('tickets',11.5,12.5);}
  },
  onTheft:function(L){W.lockdown();L.T.fold=0;PH.UI.say('拿到回音飛魚罐和已蓋章的通行憑證！碼頭只驗憑證。經影魚終站的貓縫或貨物側道去渡船。',9);},
  update:function(L,dt){
    if(L.f.lockdown&&!L.f.fold4){
      L.T.fold=(L.T.fold||0)+dt;
      for(let i=1;i<=4;i++)if(L.T.fold>i*5&&!L.f['fold'+i]){W.set('fold'+i);PH.AU.play('clunk');PH.UI.cue('攤位收起來了',12,9.5);}
    }
    if(PH.S.practice&&!L.f.teapot&&L.lastNoise&&L.lastNoise.kind==='echo'&&L.t-L.lastNoise.t<0.3&&U.dist(L.lastNoise.x,L.lastNoise.y,17.5,17.5)<2.2){
      W.set('teapot');PH.AU.play('unlock');PH.FX.text(17.5,17.5,'喵？！','#ffd23f');PH.UI.say('茶壺替你叫了一聲。跳板放下來了。',5);
    }
  },
  objective:function(L){
    const P=PH.P;
    if(PH.S.practice)return L.f.teapot?{t:'走上跳板，前往罐頭月亮',x:22.5,y:15.5}:{t:'練習：按住 R 瞄準碼頭的茶壺，放開投射喵聲',x:17.5,y:17.5};
    if(!L.theft){
      if(P.tickets<3){
        const need=[];
        if(!L.E.t1.taken)need.push({t:'巨大支線：壓下天平，拿攤位裡的魚骨票',x:L.f.scale?2.5:4,y:L.f.scale?3.5:9});
        if(!L.E.t2.taken)need.push({t:'影子支線：沿影魚步道避開路燈，穿過光柵欄',x:21.5,y:7.5});
        if(!L.E.t3.taken)need.push({t:'迷你支線：鑽收銀抽屜，別碰響硬幣鈴鐺',x:3.5,y:16.5});
        let b=need[0];for(const n of need)if(U.dist(P.x,P.y,n.x,n.y)<U.dist(P.x,P.y,b.x,b.y))b=n;
        return {t:'魚骨票 '+P.tickets+'/3　'+b.t,x:b.x,y:b.y};
      }
      return {t:'到交換所交出三張魚骨票',x:12,y:2.3};
    }
    if(L.can)return {t:'罐罐放在地上會夢遊，記得抱回來',x:L.can.x,y:L.can.y};
    return {t:'帶回音飛魚罐上沙丁魚渡船的紙箱',x:21.5,y:17.5};
  },
  build:function(B,L){
    B.cyl(.9,4.2,'#f3ead2',17,2.1,2);B.cone(1.2,1.3,'#d9694f',17,4.85,2);B.clock(17,3.2,2.92,-Math.PI/2);B.sign('收攤鐘塔',17,1.4,2.93,0,1.4,.34,'#7a5aa8','#fff');
    B.sign('交換所',12,2.6,1.06,0,2.2,.5,'#7a5aa8','#ffd23f');
    B.bunting(8,7.1,15,7.1,2.5);B.bunting(8,12.9,15,12.9,2.5);B.bunting(1,6.1,6,11.9,2.4);B.bunting(17,14.1,22,14.1,2.4);
    B.lantern(8.3,2,7.3,'#ffcf7a');B.lantern(15.7,2,7.3,'#ffcf7a');B.lantern(8.3,2,12.7,'#ffcf7a');B.lantern(15.7,2,12.7,'#ffcf7a');B.lantern(11.5,1.8,14.3,'#ffcf7a');B.lantern(17.3,2,18.6,'#ffb86b');
    B.box(2.2,.12,1.2,'#b98250',4,.5,9);B.cyl(.08,2.2,'#7a4a2b',4,1.1,7.6);B.box(3,.08,.12,'#7a4a2b',4,2.2,7.6);B.cyl(.5,.06,'#ffd23f',2.7,1.5,7.6);B.cyl(.5,.06,'#ffd23f',5.3,1.9,7.6);
    B.sign('巨大天平攤',4,2.7,6.06,0,2,.4,'#d9694f','#fff');B.sign('收銀抽屜',3.5,1.5,14.95,0,1.6,.36,'#b98250','#fff');B.sign('影魚步道',19,2.6,6.06,0,1.8,.4,'#16425b','#bfe0d4');
    B.box(3.6,.7,2.6,'#5fb3c9',20.5,-.05,17).castShadow=false;B.box(3.9,.5,.2,'#3fa9e0',20.5,.4,18.4);B.cyl(.06,2.6,'#7a4a2b',22.3,1.3,18.3);B.box(.9,.6,.04,'#fff',21.8,2.2,18.3);
    B.cyl(.45,.6,'#fff6e3',17.5,.3,17.5);B.cone(.16,.5,'#fff6e3',18.05,.4,17.5,0,0,-1.2);B.ball(.1,.1,.1,'#e98fb0',17.5,.68,17.5);
    for(let i=0;i<12;i++){const a=i/12*6.283;B.cloud(12+Math.cos(a)*(24+i%3*4),-1.5+i%4,10+Math.sin(a)*(22+i%2*5),3+i%3);}
    for(let i=0;i<7;i++)B.cloud(3+i*3.2,-2.2,-1+i%2*23,2.5);
    B.rain(12,10.5,22,19);
    B.shaft(12,9.5,2.6,6,'#ffe0a8');
  },
  checks:[
    {name:'休息站接廣場',form:'normal',from:[11.5,16.5],to:[12,9.5],expect:true},
    {name:'大路通交換所',form:'normal',from:[12,9.5],to:[12,2.45],expect:true},
    {name:'天平小間關著',form:'mini',from:[4,9],to:[2.5,3.5],expect:false},
    {name:'天平壓下後開啟',flags:['scale'],form:'normal',from:[4,9],to:[2.5,3.5],expect:true},
    {name:'影魚終站普通貓過不去',form:'mini',from:[18.5,9.5],to:[21.5,7.5],expect:false},
    {name:'影子貓穿過光柵欄',form:'shadow',from:[18.5,9.5],to:[21.5,7.5],expect:true},
    {name:'抽屜小間普通貓進不去',form:'normal',from:[5.5,14.5],to:[3.5,16.5],expect:false},
    {name:'迷你貓鑽進抽屜',form:'mini',from:[5.5,14.5],to:[3.5,16.5],expect:true},
    {name:'沒憑證進不了碼頭',form:'mini',from:[12,9.5],to:[21.5,17.5],expect:false},
    {name:'有憑證走貨物側道上船',flags:['theft'],form:'normal',from:[12,9.5],to:[21.5,17.5],expect:true},
    {name:'封鎖線留一段可通行',flags:['theft','lockdown'],form:'normal',from:[12,3],to:[21.5,17.5],expect:true},
    {name:'暗格關著',form:'mini',from:[6.5,17.5],to:[8.5,17.5],expect:false}
  ]
});

/* ===================== 最終關：罐頭月亮（外圈潛入＋BOSS 戰） ===================== */
PH.defLevel({
  id:'moon',title:'最終關',name:'罐頭月亮',size:[31,27],next:'escape',
  canName:'宇宙第一罐',maxAlert:0,
  pal:{sky:'#0b0f2a',sky2:'#3b2f6b',fog:'#141a3c',fogNear:22,fogFar:70,wall:'#8a93a8',trim:'#ffd23f',floor:['#c9cfda','#b6bdcb','#e8d9a8','#dccb94'],block:'#7f8aa3',top:'#d5dde4'},
  mood:{hemi:['#aab6ff','#3b2f6b',0.7],sun:['#fff2c4',0.55,[22,18,6]],amb:'#1a2040',dark:true},
  ops:[['.',1,1,29,25],['M','o',15.5,12.5,9.4],[',','o',15.5,12.5,8.3],['H',13,1,18,2],
    ['H',1,1,6,6],['.',2,2,5,5],['c',3,6,3,6],['H',25,1,29,6],['.',26,2,28,5],
    ['C',1,15,6,15],['.',3,15,3,15],['c',5,15,5,15],['%',24,15,29,15],['c',29,15,29,15],['.',15,21,16,21],
    ['P',15,4,15,4],['J',13,4,14,4],['J',14,5,14,5],['%',13,6,13,6],['%',12,5,12,5],
    ['L',11,9,12,9],['L',19,9,20,9],['L',11,16,12,16],['c',19,16,20,16],['o',15,12,15,12],
    ['J',21,11,23,13],[',',22,12,22,12]],
  legend:{M:{k:'solid',h:2.6,m:'rim'},J:{k:'solid',h:1.3,m:'block',col:'#5a6a8a',top:'#7fd0e6'},L:{k:'solid',h:0.55,m:'block',col:'#e8d9a8',top:'#ffd23f'},
    H:{k:'solid',h:2.4,m:'block',col:'#6f7a94',top:'#aab4c8'},P:{k:'solid',h:0.9,m:'block',col:'#3b2f6b',top:'#ffd23f'},c:{k:'gap',h:1.0,lo:0.34,m:'gapblock',col:'#7f8aa3'}},
  shade:[[10,5,13,8],[24,13,29,17]],
  start:{x:11.5,y:24.5,box:'home'},
  boss:{c:[15.5,12.5],R:8.3,plate:[8.6,12.5],proj:[13.5,5.5],peg:[15.5,12.5],cold:[19.5,12.5,2.1],ringR:5,rest:[10,14,1.1],start:[15.5,9.5],safe:[14.5,19.2],anchors:['BA','BB','BC','BD']},
  ents:[
    {t:'box',id:'home',x:11.5,y:24.5,safe:1},
    {t:'anchor',id:'L1a',x:7.5,y:19.5,pair:'L1b',name:'入口',off:'bossOn'},
    {t:'anchor',id:'L1b',x:4.5,y:14.3,pair:'L1a',name:'標籤背',off:'bossOn'},
    {t:'anchor',id:'L2a',x:12.4,y:1.5,pair:'L2b',name:'齒輪室外',off:'bossOn'},
    {t:'anchor',id:'L2b',x:19.6,y:1.5,pair:'L2a',name:'冷卻室外',off:'bossOn'},
    {t:'anchor',id:'L3a',x:23.5,y:22.5,pair:'L3b',name:'開罐器旁',off:'bossOn'},
    {t:'anchor',id:'L3b',x:17.6,y:22.6,pair:'L3a',name:'廣場外圈',off:'bossOn'},
    {t:'anchor',id:'BA',x:9.5,y:16.5,pair:'BB',name:'外圈 A',on:'bossOn',found0:1},
    {t:'anchor',id:'BB',x:9.5,y:8.5,pair:'BA',name:'外圈 B',on:'bossOn',found0:1},
    {t:'anchor',id:'BC',x:21.5,y:16.5,pair:'BD',name:'外圈 C',on:'bossOn',found0:1},
    {t:'anchor',id:'BD',x:21.5,y:8.5,pair:'BC',name:'外圈 D',on:'bossOn',found0:1},
    {t:'push',id:'label',slots:[[3,15],[3,13]],form:'giant',h:1.6,model:'label',label:'推開標籤布'},
    {t:'sw',id:'gear',x:3.5,y:3.5,form:'mini',hold:1.5,flag:'gear',label:'把卡住的齒輪推回去',model:'gear',snd:'crank'},
    {t:'pipe',id:'cpipe',a:[25.5,7.5],b:[26.5,4.5]},
    {t:'sw',id:'cool',x:27.5,y:3.5,hold:1.2,flag:'cool',label:'接通外環輸送管',model:'valve',any:1,snd:'crank'},
    {t:'plate',id:'press',x:25.5,y:21.5,r:1.0,form:'giant',flag:'press'},
    {t:'gate',id:'agate',tiles:[[15,21],[16,21]],open:'devices',close:'bossOn',h:2.6,model:'gate'},
    {t:'light',id:'elamp',mx:27,my:12.4,pts:[[26.5,13.9],[26.5,16.4]],r:1.7,period:7,off:'bossOn'},
    {t:'zone',id:'zBoss',rect:[13,18.6,18,20.9],need:'devices',not:'bossOn',fn:'startBoss',once:false},
    {t:'ped',id:'ped',x:15.5,y:4.5,fx:15.5,fy:5.5,need:'locks3',msg:'三道月蓋鎖還沒全部解開。',hold:1.0,label:'抱起宇宙第一罐'},
    {t:'sw',id:'lever1',x:11.5,y:6.6,show:'p1',need:'lever1ready',needMsg:'封印還在。把總督引去撞西側的反光板。',hold:0.8,flag:'lock1',label:'拉下魚骨拉桿',model:'lever'},
    {t:'sw',id:'proj',x:13.5,y:5.5,r:0.9,show:'p2',hold:1.0,fn:'bossProj',repeat:1,label:'把魚影貼到總督尾巴上',model:'proj'},
    {t:'sw',id:'pathsw',x:11.5,y:18.5,show:'p2',need:'fish',needMsg:'要先讓總督開始追自己的尾巴。',hold:0.6,fn:'bossPath',repeat:1,label:'啟動環形路徑開關',model:'button'},
    {t:'sw',id:'lever2',x:19.5,y:6.6,show:'p2',need:'lever2ready',needMsg:'三個踏板還沒充滿月光。',hold:0.8,flag:'lock2',label:'拉下魚骨拉桿',model:'lever'},
    {t:'sw',id:'p3door',x:20,y:16.5,r:1.0,show:'p3',form:'mini',hold:0.8,flag:'p3door',label:'打開冷卻室門鎖',model:'button'},
    {t:'pipe',id:'p3pipe',a:[20.5,14.5],b:[22.5,12.5],show:'p3',need:'p3door',needMsg:'冷卻室的門鎖還沒打開（迷你貓鑽南東的側道）。'},
    {t:'sw',id:'pump',x:22.5,y:12.5,r:0.9,show:'p3',hold:0.8,fn:'bossPump',repeat:1,any:1,label:'接通冷卻泵',model:'valve'},
    {t:'plate',id:'p3press',x:18,y:18,r:1.0,form:'giant',flag:'p3press',need:'p3',say:'開罐器壓台卡住了，最後一道鎖的拉桿升起來。不用一直維持巨大。'},
    {t:'sw',id:'lever3',x:15.5,y:19.6,show:'p3press',need:'lever3ready',needMsg:'鎖的外殼還沒破。讓結霜的總督撞上中央卡榫。',hold:0.8,flag:'lock3',label:'拉下最後的拉桿',model:'lever'},
    {t:'item',id:'sc_o1',x:27.5,y:24.5,kind:'smallcan',name:'普通小罐'},
    {t:'item',id:'sc_o2',x:1.5,y:8.5,kind:'smallcan',name:'普通小罐'},
    {t:'item',id:'bowl_moon',x:1.5,y:24.5,kind:'bowl',name:'空餐碗'},
    {t:'item',id:'fl_moon',x:28.5,y:8.5,kind:'flavor',name:'隱藏口味：月光起司罐'},
    {t:'item',id:'i_furball3',x:9.5,y:24.5,kind:'furball'},
    {t:'item',id:'i_sticker4',x:20.5,y:24.5,kind:'sticker'}
  ],
  dogs:[
    {id:'gatedog',kind:'bulldog',x:15.5,y:23.1,post:1,face:1.5708,route:[[15.5,23.1]]},
    {id:'shiba',kind:'shiba',x:3.5,y:17.5,route:[[3.5,17.5,1],[3.5,22.5],[8.5,23.5,1],[3.5,22.5]]},
    {id:'bigear',kind:'ear',x:3,y:9,route:[[3,9,1],[3,13],[8.5,4.5,1],[10.5,1.6,1],[8.5,4.5]]},
    {id:'poodle',kind:'poodle',x:26.5,y:8.5,route:[[26.5,8.5,1],[26.5,13.2,1]]}
  ],
  init:function(L){L.T.said=0;},
  onFlag:function(L,k,v){
    if(!v)return;
    if(k==='gear')PH.UI.say('齒輪室供電完成。',4);
    if(k==='cool')PH.UI.say('外環輸送管接通了。',4);
    if(k==='press')PH.UI.say('外部升降台壓到位了。',4);
    if((k==='gear'||k==='cool'||k==='press')&&L.f.gear&&L.f.cool&&L.f.press){
      W.set('devices');PH.AU.play('unlock');PH.UI.say('三座外部設備全部啟動！BOSS 廣場的南門開了。守門的鬥牛犬可以用聲音引開。',8);
      W.checkpoint('devices',11.5,23.6);
    }
    if(k==='lock1'||k==='lock2'||k==='lock3')PH.Boss.onLock(+k.charAt(4));
  },
  startBoss:function(L){PH.Boss.start();},
  bossProj:function(L){PH.Boss.useProjector();},
  bossPath:function(L){PH.Boss.usePath();},
  bossPump:function(L){PH.Boss.usePump();},
  onTheft:function(L){PH.Game.moonEscape();},
  objective:function(L){
    const P=PH.P;
    if(L.f.bossOn)return PH.Boss.objective();
    if(L.f.devices)return {t:'引開守門犬，從南門進入 BOSS 廣場',x:16,y:21.5};
    const need=[];
    if(!L.f.gear)need.push({t:'西北齒輪室：迷你貓鑽進去解開卡住的齒輪',x:3.5,y:P.y>15?14.5:6.5});
    if(!L.f.cool)need.push({t:'東北冷卻管室：液體貓流進輸送管接通',x:25.5,y:P.y>15.5&&P.x>20?15.5:7.5});
    if(!L.f.press)need.push({t:'東南開罐器：巨大貓壓住外部升降台',x:25.5,y:21.5});
    let b=need[0];for(const n of need)if(U.dist(P.x,P.y,n.x,n.y)<U.dist(P.x,P.y,b.x,b.y))b=n;
    return {t:'外部設備 '+(3-need.length)+'/3　'+b.t,x:b.x,y:b.y};
  },
  build:function(B,L){
    B.stars(15.5,12.5,60);
    B.ball(7,7,7,'#3b6ea8',-26,10,-18).castShadow=false;B.ball(2.2,2.2,2.2,'#e98fb0',44,16,2).castShadow=false;
    B.cyl(3.4,.5,'#d5dde4',15.5,3.1,3.2);B.cyl(2.6,.3,'#ffd23f',15.5,3.5,3.2);B.torus(1.2,.14,'#aab4c8',15.5,3.75,3.2,Math.PI/2,0);
    B.sign('汪汪秩序局　月面保管庫',15.5,3.0,2.98,0,5,.5,'#3b2f6b','#ffd23f');
    for(let i=0;i<28;i++){const a=i/28*6.283;B.ball(.16,.1,.16,'#aab4c8',15.5+Math.cos(a)*9.0,2.66,12.5+Math.sin(a)*9.0);}
    B.sign('齒輪室',3.5,1.7,6.98,Math.PI,1.6,.36,'#3b2f6b','#fff');B.sign('冷卻管室',27,1.7,6.98,Math.PI,1.8,.36,'#3b2f6b','#7fd0e6');B.sign('開罐器壓台',25.5,1.3,25.95,Math.PI,2.2,.36,'#3b2f6b','#fff');
    B.torus(.9,.2,'#ffd23f',3.5,2.7,4.5,Math.PI/2,0);B.torus(.5,.14,'#aab4c8',4.6,2.7,3.2,Math.PI/2,0);
    B.cyl(.22,5,'#7fd0e6',27,2.6,9.5,Math.PI/2,0,0);B.cyl(.22,3.5,'#7fd0e6',24.6,2.6,7.7,0,0,Math.PI/2);
    B.box(.3,2.6,.3,'#aab4c8',26.8,1.3,23.4);B.box(2.4,.3,.3,'#aab4c8',25.7,2.6,23.4);B.cone(.4,.9,'#ffd23f',24.6,2.1,23.4,Math.PI,0,0);
    B.lantern(11.5,1.5,25.6,'#ffcf7a');B.lantern(15.5,3.0,21.9,'#ffb86b');B.lantern(2,1.8,7.4,'#ffcf7a');B.lantern(24.4,1.8,7.3,'#7fd0e6');
    B.bunting(1,25.9,29,25.9,2.3);
    [[8,22.5],[21,24.2],[7.2,3.4],[22.5,2.2],[28.4,19]].forEach(function(q,i){B.rock(q[0],q[1],.5+i%3*.2,'#9aa3b8');});
  },
  checks:[
    {name:'入口走得到東南壓台',form:'normal',from:[11.5,24.5],to:[25.5,21.5],expect:true},
    {name:'標籤牆擋住西側',form:'normal',from:[11.5,24.5],to:[3.5,7.5],expect:false},
    {name:'迷你貓鑽罐接縫',form:'mini',from:[11.5,24.5],to:[3.5,7.5],expect:true},
    {name:'巨大推開標籤後可通行',slots:{label:1},form:'normal',from:[11.5,24.5],to:[3.5,7.5],expect:true},
    {name:'齒輪室只有迷你貓進得去',form:'normal',from:[3.5,7.5],to:[3.5,3.5],expect:false},
    {name:'迷你貓進齒輪室',form:'mini',from:[3.5,7.5],to:[3.5,3.5],expect:true},
    {name:'光柵欄擋住東側',form:'normal',from:[26.5,21.5],to:[26.5,9.5],expect:false},
    {name:'影子貓穿過光柵欄',form:'shadow',from:[26.5,16.5],to:[26.5,13.5],expect:true},
    {name:'北側被主罐台擋住',form:'normal',from:[19.6,1.5],to:[12.4,1.5],expect:false},
    {name:'廣場南門關著',form:'mini',from:[15.5,23.5],to:[15.5,19.5],expect:false},
    {name:'三設備後南門開啟',flags:['devices'],form:'normal',from:[15.5,23.5],to:[15.5,5.5],expect:true},
    {name:'投射器後方只有影子進得去',flags:['devices'],form:'normal',from:[15.5,19.5],to:[13.5,5.5],expect:false},
    {name:'影子帶接投射器後方',flags:['devices'],form:'shadow',from:[11.5,7.5],to:[13.5,5.5],expect:true},
    {name:'冷卻泵小間封閉',flags:['devices'],form:'mini',from:[15.5,19.5],to:[22.5,12.5],expect:false}
  ]
});

/* ===================== 第四段：抱罐逃月亮（四段回顧路線） ===================== */
PH.defLevel({
  id:'escape',title:'最終關',name:'月亮消氣逃亡',size:[44,9],next:null,final:true,startCan:true,maxAlert:0,
  canName:'宇宙第一罐',fallMsg:'噗通！爬回最近的落腳點。月亮還在消氣，動作快。',
  pal:{sky:'#0b0f2a',sky2:'#6b3f6b',fog:'#241a3c',fogNear:20,fogFar:60,wall:'#8a93a8',trim:'#ffd23f',floor:['#c9cfda','#b6bdcb','#f1cf8e','#e9bf78'],block:'#7f8aa3',top:'#d5dde4',liquid:'#f6992b',liquidY:-0.32},
  mood:{hemi:['#aab6ff','#6b3f6b',0.75],sun:['#ffe0a8',0.55,[10,14,8]],amb:'#1a2040',dark:true},
  ops:[['.',1,2,3,6],['~',4,2,10,6],['.',7,3,7,5],['.',11,2,13,6],['~',14,2,21,6],['.',22,2,24,6],
    [',',25,2,34,6],['L',28,3,28,4],['L',31,4,31,5],[',',35,2,42,6],['H',38,2,38,6],['c',38,2,38,2]],
  start:{x:2.5,y:4.5},
  ents:[
    {t:'mover',id:'toast1',pts:[[4.6,4.5],[6.4,4.5]],speed:1.3,wait:1.6,r:0.62,model:'toast'},
    {t:'mover',id:'toast2',pts:[[8.6,4.5],[10.4,4.5]],speed:1.3,wait:1.6,r:0.62,model:'plate'},
    {t:'mover',id:'sockboat',pts:[[14.6,4.5],[21.4,4.5]],speed:2.3,wait:1.8,r:0.7,model:'sock'},
    {t:'mover',id:'bus',pts:[[25.8,5.6],[33.6,5.6]],speed:1.9,wait:2.2,r:0.75,park:1,hide:1,model:'bus',name:'夢境公車'},
    {t:'anchor',id:'E1a',x:36.5,y:4.5,pair:'E1b',name:'月面裂縫'},
    {t:'anchor',id:'E1b',x:40.4,y:4.5,pair:'E1a',name:'紙箱旁'},
    {t:'box',id:'final',x:41.5,y:4.5,safe:1,finish:1},
    {t:'zone',id:'z2',rect:[11,2,13.99,6.99],cp:['seg2',12,4.5],say:'第二段：襪子船。等它靠岸再踩上去。'},
    {t:'zone',id:'z3',rect:[22,2,24.99,6.99],cp:['seg3',23,4.5],say:'第三段：最後一隻秩序犬在巡邏。躲進夢境公車，或趁牠轉身通過。'},
    {t:'zone',id:'z4',rect:[35,2,37.99,6.99],cp:['seg4',36,4.5],say:'最後一段：畫一道貓縫穿過罐蓋，回到原本的紙箱！'},
    {t:'item',id:'sc_e',x:23.5,y:2.6,kind:'smallcan',name:'普通小罐'}
  ],
  dogs:[{id:'last',kind:'shiba',x:33,y:2.6,route:[[33,2.6,1],[27,2.6,1],[27,4.6],[33,4.4]]}],
  init:function(L){L.T.front=-7;},
  onRestore:function(L){L.T.front=L.cp.x-8;},
  update:function(L,dt){
    const P=PH.P;
    L.T.front+=dt*0.42;
    if(L.T.front>P.x-0.2&&P.grace<=0&&!P.warp){PH.Game.caught('collapse');}
    if(!L.T.h1){L.T.h1=1;PH.UI.say('月亮開始消氣！總督在後面撐住倒下的罐蓋。一路往東：吐司浮台→襪子船→夢境公車→原本的紙箱。',9);}
  },
  objective:function(L){
    const P=PH.P;
    if(P.x<11)return {t:'第一段：踩吐司浮台過湯',x:12,y:4.5};
    if(P.x<22)return {t:'第二段：搭襪子船',x:23,y:4.5};
    if(P.x<35)return {t:'第三段：躲進夢境公車，避開最後的巡邏',x:36,y:4.5};
    if(P.x<38)return {t:'畫貓縫穿過罐蓋',x:36.5,y:4.5};
    return {t:'回到原本的紙箱！',x:41.5,y:4.5};
  },
  build:function(B,L){
    B.stars(22,4.5,70);
    L.gx={front:B.box(.6,7,9,'#3b2f6b',0,3.5,4.5)};L.gx.front.castShadow=false;
    L.gx.gov=B.governor(-3,4.5);
    B.sign('吐司浮台',7,2.4,1.98,Math.PI,1.6,.34,'#d9694f','#fff');B.sign('襪子船',17.5,2.4,1.98,Math.PI,1.4,.34,'#16425b','#fff');
    B.sign('夢境公車',29.5,2.4,1.98,Math.PI,1.6,.34,'#7a5aa8','#fff');B.sign('原本的紙箱',40.5,2.4,1.98,Math.PI,2,.34,'#3b2f6b','#ffd23f');
    B.lantern(12,1.8,2.3,'#ffcf7a');B.lantern(23,1.8,2.3,'#ffcf7a');B.lantern(36,1.8,2.3,'#ffcf7a');B.lantern(41.5,1.9,2.4,'#ffb86b');
    B.bunting(1,1.98,42,1.98,2.9);
    B.shaft(41.5,4.5,1.2,5,'#fff2c4');
  },
  draw:function(L,t){
    if(!L.gx)return;
    L.gx.front.position.x=L.T.front-0.3;
    L.gx.gov.position.x=L.T.front-2.2;L.gx.gov.position.y=Math.sin(t*5)*.05;
  },
  checks:[
    {name:'起點被湯隔開',form:'mini',from:[2.5,4.5],to:[12,4.5],expect:false},
    {name:'第三段接第四段',form:'normal',from:[23,4.5],to:[36.5,4.5],expect:true},
    {name:'罐蓋擋住紙箱',form:'normal',from:[36.5,4.5],to:[41.5,4.5],expect:false},
    {name:'迷你貓也能鑽過去',form:'mini',from:[36.5,4.5],to:[41.5,4.5],expect:true}
  ]
});
})();
