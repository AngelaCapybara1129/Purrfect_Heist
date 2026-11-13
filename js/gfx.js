/* 3D 繪圖核心（Three.js r128）：低多邊形切面造型、暖冷對比光、霧氣景深、燈籠與旗串
   遊戲邏輯在 2D 平面，這裡只把狀態「擺」成場景：x = 欄、z = 列、y 向上。 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,W=PH.World,T3=window.THREE;
const G=PH.GFX={ok:false,anim:[],shake:0,t:0,parts:[],rings:[],txt:[],flashT:0,flashC:'#fff',cur:null,lanterns:0};
let R3,scene,camera,root,sky,hemi,sun,amb,V3,cw=1,ch=1,cv,ov,ox,dpr=1;
const MATS={},GEO={};
const FONT="'Chiron GoRound TC','Noto Sans TC','Microsoft JhengHei','PingFang TC',sans-serif";

function M(c,o){
  if(typeof c!=='string')return c;
  const key=c+(o?JSON.stringify(o):'');
  return MATS[key]||(MATS[key]=new T3.MeshStandardMaterial(Object.assign({color:c,flatShading:true,roughness:0.86,metalness:0},o||{})));
}
function MB(c,op,addv){
  const key='b'+c+op+(addv?'a':'');
  return MATS[key]||(MATS[key]=new T3.MeshBasicMaterial({color:c,transparent:op<1,opacity:op,depthWrite:op>=1,side:T3.DoubleSide,blending:addv?T3.AdditiveBlending:T3.NormalBlending,fog:!addv}));
}
function add(geo,mat,sx,sy,sz,x,y,z,p){
  const m=new T3.Mesh(geo,M(mat));
  m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(p||G.cur).add(m);return m;
}
function bx(w,h,d,c,x,y,z,p){return add(GEO.box,c,w,h,d,x,y,z,p);}
function bl(rx,ry,rz,c,x,y,z,p){return add(GEO.ico,c,rx,ry,rz,x,y,z,p);}
function cy(r,h,c,x,y,z,p){return add(GEO.cyl,c,r,h,r,x,y,z,p);}
function cn(r,h,c,x,y,z,p){return add(GEO.cone,c,r,h,r,x,y,z,p);}
function gp(x,y,z,p){const g=new T3.Group();g.position.set(x||0,y||0,z||0);(p||G.cur).add(g);return g;}
function flat(geo,mat,x,y,z,p){const m=new T3.Mesh(geo,mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);(p||G.cur).add(m);return m;}
function rot(m,rx,ry,rz){if(rx)m.rotation.x=rx;if(ry)m.rotation.y=ry;if(rz)m.rotation.z=rz;return m;}
function tex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T3.CanvasTexture(c);return t;}
G.h={M:M,MB:MB,add:add,bx:bx,bl:bl,cy:cy,cn:cn,gp:gp,flat:flat,GEO:GEO,T3:T3,tex:tex,FONT:FONT};

/* ---------- 給關卡裝飾用的工具組 ---------- */
const B=G.kit={
  box:function(w,h,d,c,x,y,z,rx,ry,rz){return rot(bx(w,h,d,c,x,y,z),rx,ry,rz);},
  ball:function(rx,ry,rz,c,x,y,z){return bl(rx,ry,rz,c,x,y,z);},
  cyl:function(r,h,c,x,y,z,rx,ry,rz){return rot(cy(r,h,c,x,y,z),rx,ry,rz);},
  cone:function(r,h,c,x,y,z,rx,ry,rz){return rot(cn(r,h,c,x,y,z),rx,ry,rz);},
  torus:function(R,r,c,x,y,z,rx,ry){const m=add(new T3.TorusGeometry(R,r,6,14),c,1,1,1,x,y,z);return rot(m,rx,ry,0);},
  grp:function(x,y,z){return gp(x,y,z);},
  // 燈籠：暖色自發光＋有限數量的點光源（暖光對上冷色陰影）
  lantern:function(x,y,z,c){
    const g=gp(x,y,z);
    add(GEO.box,M(c,{emissive:c,emissiveIntensity:0.9}),.22,.28,.22,0,0,0,g).castShadow=false;
    bx(.3,.05,.3,'#3a2a2a',0,.17,0,g);bx(.26,.04,.26,'#3a2a2a',0,-.16,0,g);bx(.03,.3,.03,'#3a2a2a',0,.34,0,g);
    const halo=new T3.Mesh(GEO.ico,MB(c,0.16,true));halo.scale.set(.55,.55,.55);g.add(halo);
    if(G.lanterns<5&&!PH.opt.lowfx){G.lanterns++;const l=new T3.PointLight(c,0.75,7.5,1.6);l.position.set(0,-.1,0);g.add(l);}
    G.anim.push(function(t){halo.scale.setScalar(.5+Math.sin(t*2.3+x)*.05);});
    return g;
  },
  // 旗串：兩點之間下垂的一排小三角旗
  bunting:function(x0,z0,x1,z1,y){
    const cols=['#ef5d50','#ffd23f','#7fd0e6','#8fc3b4','#e98fb0','#f6a23c'],len=Math.hypot(x1-x0,z1-z0),n=Math.max(4,Math.round(len/0.55)),a=Math.atan2(z1-z0,x1-x0);
    for(let i=0;i<=n;i++){
      const k=i/n,sag=Math.sin(k*Math.PI)*Math.min(0.5,len*0.04);
      const m=add(GEO.tri,M(cols[i%6],{side:T3.DoubleSide}),.2,.26,.2,x0+(x1-x0)*k,y-sag,z0+(z1-z0)*k);
      m.rotation.y=-a;m.castShadow=false;
    }
  },
  // 光柱：半透明的光束，營造霧氣裡的光
  shaft:function(x,z,r,h,c){
    const m=new T3.Mesh(new T3.CylinderGeometry(r*0.3,r,h,12,1,true),MB(c,0.085,true));
    m.position.set(x,h/2,z);G.cur.add(m);
    const d=flat(GEO.circ,MB(c,0.1,true),x,.02,z);d.scale.set(r,r,1);
    return m;
  },
  photo:function(x,y,z,ry){
    const g=gp(x,y,z);g.rotation.y=ry||0;
    bx(.05,.6,.8,'#ffffff',0,0,0,g);bx(.06,.46,.66,'#ffcf9e',.012,0,0,g);bx(.07,.14,.36,'#f6a23c',.02,-.1,0,g);bl(.04,.07,.09,'#f6a23c',.03,-.02,.17,g);
    return g;
  },
  // 時鐘：全部停在三點
  clock:function(x,y,z,ry){
    const g=gp(x,y,z);g.rotation.y=ry||0;
    rot(cy(.3,.06,'#ffffff',0,0,0,g),0,0,Math.PI/2);bx(.02,.045,.2,'#2b1b2e',.04,0,.1,g);bx(.02,.22,.045,'#2b1b2e',.04,.1,0,g);
    return g;
  },
  rug:function(x,z,r,c1,c2){
    const a=flat(GEO.circ,M(c1,{side:T3.DoubleSide}),x,.012,z);a.scale.set(r,r,1);a.receiveShadow=true;
    const b=flat(GEO.circ,M(c2,{side:T3.DoubleSide}),x,.016,z);b.scale.set(r*.68,r*.68,1);b.receiveShadow=true;
  },
  sign:function(text,x,y,z,ry,w,h,bg,fg){
    const t=tex(256,Math.max(32,Math.round(256*h/w)),function(c,W_,H_){
      c.fillStyle=bg;c.fillRect(0,0,W_,H_);c.strokeStyle=fg;c.lineWidth=4;c.strokeRect(4,4,W_-8,H_-8);
      c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';
      let fs=H_*0.56;c.font='800 '+fs+'px '+FONT;while(c.measureText(text).width>W_-22&&fs>8){fs-=2;c.font='800 '+fs+'px '+FONT;}
      c.fillText(text,W_/2,H_/2+1);
    });
    const m=new T3.Mesh(GEO.plane,new T3.MeshBasicMaterial({map:t,side:T3.DoubleSide}));
    m.scale.set(w,h,1);m.position.set(x,y,z);m.rotation.y=ry||0;G.cur.add(m);return m;
  },
  cloud:function(x,y,z,s){
    const g=gp(x,y,z),c=PH.L&&PH.L.def.mood.dark?'#4a4a78':'#ffffff';
    [[0,0,0,1],[.8,-.1,.2,.7],[-.8,-.15,-.1,.75],[.2,.3,-.3,.6]].forEach(function(q){const m=bl(s*q[3],s*q[3]*.55,s*q[3]*.8,c,q[0]*s,q[1]*s,q[2]*s,g);m.castShadow=false;m.receiveShadow=false;});
    G.anim.push(function(t){g.position.x=x+Math.sin(t*.08+z)*1.5;});
    return g;
  },
  bubble:function(x,y,z,r){
    const m=new T3.Mesh(GEO.ico2,new T3.MeshStandardMaterial({color:'#dff6ff',transparent:true,opacity:.3,roughness:.1,depthWrite:false}));
    m.scale.set(r,r,r);m.position.set(x,y,z);G.cur.add(m);
    G.anim.push(function(t){m.position.y=y+Math.sin(t*.9+x*2)*.25;m.position.x=x+Math.sin(t*.4+z)*.2;});
    return m;
  },
  rock:function(x,z,s,c){const m=add(GEO.rock,c,s,s*.7,s*.9,x,s*.3,z);m.rotation.y=x*1.7;return m;},
  tree:function(x,z,s,c){
    const g=gp(x,0,z);cy(.12*s,.8*s,'#7a4a2b',0,.4*s,0,g);
    for(let i=0;i<3;i++)cn((.75-i*.18)*s,(.9-i*.1)*s,c||'#3f9f5a',0,(.95+i*.5)*s,0,g);
    return g;
  },
  stars:function(cx,cz,n){
    const pos=new Float32Array(n*6*3);
    for(let i=0;i<n*6;i++){const a=Math.random()*6.283,e=0.08+Math.random()*1.2,r=110;pos[i*3]=cx+Math.cos(a)*Math.cos(e)*r;pos[i*3+1]=Math.sin(e)*r;pos[i*3+2]=cz+Math.sin(a)*Math.cos(e)*r;}
    const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(pos,3));
    const p=new T3.Points(g,new T3.PointsMaterial({color:'#fff6d8',size:1.1,sizeAttenuation:true,fog:false,transparent:true,opacity:.9}));
    G.cur.add(p);return p;
  },
  // 倒著下的雨：往上飄的短線粒子，不影響物理
  rain:function(cx,cz,w,d){
    if(PH.opt.lowfx)return;
    const n=220,pos=new Float32Array(n*3),sp=new Float32Array(n);
    for(let i=0;i<n;i++){pos[i*3]=cx+(Math.random()-.5)*w;pos[i*3+1]=Math.random()*9;pos[i*3+2]=cz+(Math.random()-.5)*d;sp[i]=1.5+Math.random()*2;}
    const g=new T3.BufferGeometry(),at=new T3.BufferAttribute(pos,3);g.setAttribute('position',at);
    const p=new T3.Points(g,new T3.PointsMaterial({color:'#dff6ff',size:.09,transparent:true,opacity:.7}));G.cur.add(p);
    G.anim.push(function(t,dt){for(let i=0;i<n;i++){pos[i*3+1]+=sp[i]*dt;if(pos[i*3+1]>9)pos[i*3+1]=0;}at.needsUpdate=true;});
  },
  governor:function(x,z){const o=G.makeBoss();o.g.position.set(x,0,z);o.g.rotation.y=0;return o.g;}
};

/* ---------- 特效介面（世界邏輯透過 PH.FX 呼叫） ---------- */
Object.assign(PH.FX,{
  poof:function(x,y,n,col){
    if(PH.opt.lowfx)n=Math.ceil(n/3);
    for(let i=0;i<n&&G.parts.length<90;i++){const a=Math.random()*6.283,v=0.8+Math.random()*2.2;G.parts.push({x:x,y:.25+Math.random()*.3,z:y,vx:Math.cos(a)*v,vy:1+Math.random()*2.2,vz:Math.sin(a)*v,a:0.5+Math.random()*.4,c:col||'#fff'});}
  },
  ring:function(x,y,rad,kind){
    if(G.rings.length>10)G.rings.shift();
    G.rings.push({x:x,y:y,max:rad,t:0,c:kind==='scent'?'#ff8fa3':(kind==='echo'||kind==='meow'||kind==='roar')?'#ffd23f':'#ffffff'});
  },
  text:function(x,y,s,c){if(G.txt.length>14)G.txt.shift();G.txt.push({x:x,y:y,s:s,c:c||'#fff',t:0});},
  shake:function(v){G.shake=Math.max(G.shake,PH.opt.calm?v*0.12:v);},
  flash:function(c){if(PH.opt.flash)return;G.flashT=0.35;G.flashC=c||'#fff';}
});

/* ---------- 初始化 ---------- */
G.init=function(canvas,overlay){
  cv=canvas;ov=overlay;ox=ov.getContext('2d');
  if(!T3){PH.UI.fatal('3D 函式庫沒有載入成功，請確認 lib/three.min.js 存在後重新整理。');return false;}
  try{R3=new T3.WebGLRenderer({canvas:cv,antialias:true});}catch(e){PH.UI.fatal('這個瀏覽器無法啟動 3D 繪圖（WebGL）。');return false;}
  R3.shadowMap.enabled=!PH.opt.lowfx;R3.shadowMap.type=T3.PCFSoftShadowMap;
  V3=new T3.Vector3();
  scene=new T3.Scene();
  camera=new T3.PerspectiveCamera(56,1,0.05,400);
  GEO.box=new T3.BoxGeometry(1,1,1);GEO.ico=new T3.IcosahedronGeometry(1,1);GEO.ico2=new T3.IcosahedronGeometry(1,2);GEO.rock=new T3.IcosahedronGeometry(1,0);
  GEO.cyl=new T3.CylinderGeometry(1,1,1,10);GEO.cone=new T3.ConeGeometry(1,1,6);GEO.tri=new T3.ConeGeometry(1,1,3,1);GEO.tri.rotateX(Math.PI);GEO.tri.scale(1,1,0.12);
  GEO.circ=new T3.CircleGeometry(1,40);GEO.ring=new T3.RingGeometry(0.93,1,48);GEO.plane=new T3.PlaneGeometry(1,1);
  GEO.sec60=new T3.CircleGeometry(1,14,0,1.0472);GEO.quad=new T3.CircleGeometry(1,20,0,Math.PI/2);GEO.arc=new T3.CircleGeometry(1,24,-1.2,2.4);
  hemi=new T3.HemisphereLight('#fff','#888',0.7);scene.add(hemi);
  amb=new T3.AmbientLight('#000',1);scene.add(amb);
  sun=new T3.DirectionalLight('#fff',0.6);scene.add(sun);scene.add(sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.02;
  // 漸層天空球
  const sg=new T3.SphereGeometry(180,24,12);sg.setAttribute('color',new T3.BufferAttribute(new Float32Array(sg.attributes.position.count*3),3));
  sky=new T3.Mesh(sg,new T3.MeshBasicMaterial({vertexColors:true,side:T3.BackSide,fog:false,depthWrite:false}));scene.add(sky);
  G.ok=true;G.scene=scene;G.camera=camera;
  window.addEventListener('resize',G.resize);G.resize();
  return true;
};
function setSky(top,bot){
  const a=new T3.Color(top),b=new T3.Color(bot),p=sky.geometry.attributes.position,c=sky.geometry.attributes.color,q=new T3.Color();
  for(let i=0;i<p.count;i++){let k=U.clamp(p.getY(i)/180*1.6+0.12,0,1);k=k*k*(3-2*k);q.copy(b).lerp(a,k);c.setXYZ(i,q.r,q.g,q.b);}
  c.needsUpdate=true;
}
G.resize=function(){
  if(!G.ok)return;
  const st=cv.parentElement;cw=st.clientWidth||1;ch=st.clientHeight||1;
  dpr=Math.min(window.devicePixelRatio||1,PH.opt.lowfx?1:2);
  R3.setPixelRatio(dpr);R3.setSize(cw,ch,false);
  ov.width=Math.round(cw*dpr);ov.height=Math.round(ch*dpr);
  camera.aspect=cw/ch;camera.updateProjectionMatrix();
  G.cw=cw;G.ch=ch;
};

/* ---------- 建立關卡場景 ---------- */
function run(L,lg,c0,c1,r,g){
  const len=c1-c0+1,x=c0+len/2,z=r+.5,pal=L.def.pal,h=lg.h,m=lg.m;
  const col=lg.col||pal.block,top=lg.top||pal.top;
  switch(m){
  case 'wall':{
    const a=bx(len,h,1,pal.wall,x,h/2,z,g);a.castShadow=false;
    bx(len+.03,.9,1.03,pal.trim,x,.45,z,g).castShadow=false;bx(len+.05,.07,1.05,'#ffffff',x,.93,z,g).castShadow=false;
    break;}
  case 'cloudwall':{
    bx(len,h*.7,1,'#fff6ee',x,h*.35,z,g).castShadow=false;
    for(let i=0;i<len;i++){const m2=bl(.62,.5,.62,'#ffffff',c0+i+.5,h*.72+((c0+i+r)%2)*.12,z,g);m2.castShadow=false;}
    break;}
  case 'rim':{
    bx(len,h,1,'#aab4c8',x,h/2,z,g).castShadow=false;bx(len+.04,.14,1.04,'#ffd23f',x,h-.2,z,g).castShadow=false;bx(len+.02,.5,1.02,'#8a93a8',x,.25,z,g).castShadow=false;
    break;}
  case 'block':
    bx(len,h,1,col,x,h/2,z,g);bx(len+.04,.08,1.04,top,x,h+.02,z,g);
    if(h>1.6)for(let i=0;i<len;i++)bx(.5,.06,.02,top,c0+i+.5,h*.62,z+.51,g).castShadow=false;
    break;
  case 'gapblock':{
    const lo=lg.lo||.34;
    bx(len,h-lo,1,col,x,(h+lo)/2,z,g);bx(len+.04,.08,1.04,top,x,h+.02,z,g);
    [c0+.08,c1+.92].forEach(function(px){cy(.06,lo,'#5a3d24',px,lo/2,z-.4,g);cy(.06,lo,'#5a3d24',px,lo/2,z+.4,g);});
    const s=flat(GEO.plane,MB('#1a1022',0.35),x,.011,z,g);s.scale.set(len*.96,.96,1);
    break;}
  case 'table':
    bx(len,.1,1,col,x,h-.02,z,g);
    [c0+.12,c1+.88].forEach(function(px){cy(.07,h-.06,'#e58f4e',px,(h-.06)/2,z,g);});
    break;
  case 'sofa':
    bx(len,.3,1,'#5b8def',x,.38,z,g);bx(len,.62,.34,'#4a79d8',x,.64,z-.33,g);
    bx(.3,.5,1,'#4a79d8',c0+.15,.5,z,g);bx(.3,.5,1,'#4a79d8',c1+.85,.5,z,g);
    for(let i=0;i<len;i++)bx(.8,.12,.6,'#7aa5f5',c0+i+.5,.56,z+.1,g);
    break;
  case 'rack':
    cy(.05,1.5,'#b98250',x-.35,.75,z,g);cy(.05,1.5,'#b98250',x+.35,.75,z,g);bx(.8,.05,.05,'#b98250',x,1.45,z,g);
    break;
  case 'fence':
    // 光柵欄：只有影子穿得過
    for(let i=0;i<len*3;i++){const m2=new T3.Mesh(GEO.box,MB('#fff2c4',0.55,true));m2.scale.set(.05,h,.05);m2.position.set(c0+(i+.5)/3,h/2,z);g.add(m2);}
    bx(len,.08,.14,'#c9a24a',x,h+.02,z,g);bx(len,.06,.2,'#c9a24a',x,.03,z,g);
    break;
  case 'grate':
    bx(len,.06,1,'#3a3a4a',x,.03,z,g);
    break;
  case 'pillar':
    for(let i=0;i<len;i++){cy(.44,h,col,c0+i+.5,h/2,z,g);cy(.5,.12,top,c0+i+.5,.06,z,g);cy(.5,.12,top,c0+i+.5,h-.06,z,g);}
    break;
  }
}
G.load=function(L){
  if(!G.ok)return;
  if(root)scene.remove(root);
  root=new T3.Group();scene.add(root);G.cur=root;G.anim.length=0;G.lanterns=0;G.parts.length=0;G.rings.length=0;G.txt.length=0;G.shake=0;
  const def=L.def,pal=def.pal,mood=def.mood,w=L.w,h=L.h;
  scene.fog=new T3.Fog(pal.fog,pal.fogNear,pal.fogFar);
  setSky(pal.sky,pal.sky2||pal.fog);
  hemi.color.set(mood.hemi[0]);hemi.groundColor.set(mood.hemi[1]);hemi.intensity=mood.hemi[2];
  amb.color.set(mood.amb||'#000000');amb.intensity=mood.amb?0.6:0;
  sun.color.set(mood.sun[0]);sun.intensity=mood.sun[1];
  const sp=mood.sun[2];sun.position.set(sp[0],sp[1],sp[2]);sun.target.position.set(w/2,0,h/2);
  const sc=sun.shadow.camera,hs=Math.max(w,h)*0.62+4;sc.left=-hs;sc.right=hs;sc.top=hs;sc.bottom=-hs;sc.near=1;sc.far=120;sc.updateProjectionMatrix();
  sun.position.set(w/2+(sp[0]-w/2)*1.2,sp[1]*1.6,h/2+(sp[2]-h/2)*1.2);
  // 地板（每格一塊小磚；變成湯的格子會沉下去）
  const tiles=[];
  for(let r=0;r<h;r++)for(let c=0;c<w;c++){
    const lg=L.leg[L.base[r*w+c]];let fl=null;
    if(lg.fl!=null)fl=lg.fl;else if(lg.k==='gap'||lg.k==='pipe'||lg.k==='shade')fl=0;
    if(fl!=null)tiles.push({c:c,r:r,fl:fl,y:-.15,ty:-.15});
  }
  G.tiles=tiles;
  const fm=new T3.InstancedMesh(new T3.BoxGeometry(.985,.3,.985),new T3.MeshStandardMaterial({color:'#ffffff',flatShading:true,roughness:.92}),Math.max(1,tiles.length));
  fm.receiveShadow=true;fm.frustumCulled=false;
  const col=new T3.Color();G.mtx=new T3.Matrix4();
  tiles.forEach(function(q,i){
    const odd=(q.c+q.r)%2;
    col.set(q.fl===2?(pal.floor[4]||'#7fd0e6'):pal.floor[(q.fl?2:0)+odd]||pal.floor[odd]);
    fm.setColorAt(i,col);G.mtx.makeTranslation(q.c+.5,q.y,q.r+.5);fm.setMatrixAt(i,G.mtx);
  });
  if(fm.instanceColor)fm.instanceColor.needsUpdate=true;
  root.add(fm);G.floor=fm;G.floorRev=-1;G.floorAnim=false;
  // 牆、櫃子、家具：同一列連續的相同格子合併成一個長方塊
  const tg=gp(0,0,0);
  for(let r=0;r<h;r++){
    let c=0;
    while(c<w){
      const chh=L.base[r*w+c],lg=L.leg[chh];
      if(!lg.m||lg.m==='none'){c++;continue;}
      let c2=c;while(c2+1<w&&L.base[r*w+c2+1]===chh)c2++;
      run(L,lg,c,c2,r,tg);c=c2+1;
    }
  }
  // 影子帶：預設的陰影表面
  for(let r=0;r<h;r++){
    let c=0;
    while(c<w){
      if(!L.shade[r*w+c]||L.leg[L.base[r*w+c]].k==='shade'){c++;continue;}
      let c2=c;while(c2+1<w&&L.shade[r*w+c2+1]&&L.leg[L.base[r*w+c2+1]].k!=='shade')c2++;
      const s=flat(GEO.plane,MB('#140a26',0.42),(c+c2+1)/2,.013,r+.5);s.scale.set(c2-c+1,1,1);c=c2+1;
    }
  }
  // 湯／海
  G.liquid=null;
  if(pal.liquid){
    G.liquid=add(GEO.box,new T3.MeshStandardMaterial({color:pal.liquid,roughness:.3,flatShading:true,transparent:true,opacity:.93}),w+30,.3,h+30,w/2,pal.liquidY,h/2);
    G.liquid.castShadow=false;G.ly=pal.liquidY;
  }
  // 地基：關卡外圍的底色
  const base=bx(w+60,.4,h+60,pal.fog,w/2,pal.liquid?-1.9:-.52,h/2);base.castShadow=false;
  G.buildWorld(L);
  if(def.build)def.build(B,L);
  G.cd=2.3;G.chh=.95;G.cl=.5;G.look=new T3.Vector3(L.def.start.x,.5,L.def.start.y);G.want=new T3.Vector3();G.lookp=new T3.Vector3();
  PH.S.camSnap=true;
};
function updFloor(L,dt){
  if(G.floorRev!==L.rev){
    G.floorRev=L.rev;
    for(const q of G.tiles){const k=W.kind(q.c,q.r);q.ty=k==='hazard'?-.8:-.15;if(q.ty!==q.y)G.floorAnim=true;}
  }
  if(G.floorAnim){
    let any=false;
    G.tiles.forEach(function(q,i){
      if(q.y===q.ty)return;
      const d=q.ty-q.y,st=dt*(d<0?0.9:1.6)*(1+((q.c*7+q.r*13)%5)*0.25);
      q.y=Math.abs(d)<=st?q.ty:q.y+Math.sign(d)*st;any=true;
      G.mtx.makeTranslation(q.c+.5,q.y,q.r+.5);G.floor.setMatrixAt(i,G.mtx);
    });
    G.floor.instanceMatrix.needsUpdate=true;G.floorAnim=any;
  }
  if(G.liquid){
    const pal=L.def.pal,tg=pal.liquidRise&&L.f[pal.liquidRise]?-.3:pal.liquidY;
    G.ly+=(tg-G.ly)*Math.min(1,dt*1.4);G.liquid.position.y=G.ly+Math.sin(G.t*1.3)*.015;
  }
}

/* ---------- 鏡頭：貼在貓背後、略高；會被牆與家具擋住，不穿牆、不拉成俯瞰 ---------- */
function camBlock(x,y,z){
  if(y<0.07)return true;
  const b=W.camBox(Math.floor(x),Math.floor(z));
  return !!b&&y>b[0]-.05&&y<b[1]+.08;
}
function camRay(ax,ay,az,bx_,by,bz){
  const Lr=Math.hypot(bx_-ax,by-ay,bz-az),n=Math.max(1,Math.ceil(Lr/.07));
  for(let i=1;i<=n;i++){const t=i/n;if(camBlock(ax+(bx_-ax)*t,ay+(by-ay)*t,az+(bz-az)*t))return Math.max(.1,(i-2)/n);}
  return 1;
}
G.camSees=function(x,y,z){
  const cp=camera.position,dx=x-cp.x,dy=y-cp.y,dz=z-cp.z,Lr=Math.hypot(dx,dy,dz);
  camera.getWorldDirection(V3);
  if((dx*V3.x+dy*V3.y+dz*V3.z)/Math.max(.001,Lr)<.55)return false;
  return camRay(cp.x,cp.y,cp.z,x,y,z)>=1;
};
G.toScreen=function(x,y,z){
  V3.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);const front=V3.z<-.05;V3.applyMatrix4(camera.projectionMatrix);
  return {x:(V3.x*.5+.5)*cw,y:(-V3.y*.5+.5)*ch,front:front};
};
function updCamera(dt){
  const L=PH.L,P=PH.P,S=PH.S,F=PH.FORMS[P.form].cam;
  const snap=S.camSnap;S.camSnap=false;
  if(S.mode==='title'||S.mode==='ending'){
    const a=G.t*.12,cx=L.w/2-1,cz=L.h/2;
    camera.position.set(cx+Math.cos(a)*3.2,2.5,cz+Math.sin(a)*2.6);camera.lookAt(cx-Math.cos(a)*1.5,.6,cz-Math.sin(a)*1.5);
    sky.position.copy(camera.position);return;
  }
  if(S.mode==='cut'&&G.cut){
    const a=G.t*.5,q=G.cut;
    G.want.set(q.x+Math.cos(a)*2.7,1.5,q.y+Math.sin(a)*2.7);camera.position.lerp(G.want,snap?1:.08);
    G.look.lerp(G.lookp.set(q.x,.55,q.y),.15);camera.lookAt(G.look);sky.position.copy(camera.position);return;
  }
  const fx=Math.cos(S.yaw),fz=Math.sin(S.yaw),px=P.x,pz=P.y;
  const far=(PH.Boss&&PH.Boss.active)?1.45:1;
  G.cd+=(F.d*far-G.cd)*.08;G.chh+=(F.h*far-G.chh)*.08;G.cl+=(F.l-G.cl)*.08;
  if(P.hidden&&P.hidden.t==='box'){
    // 紙箱裡：只能從縫往外看，掀蓋看得多也更暴露
    const ey=.34+P.lift*.16;
    G.want.set(px-fx*.1,ey,pz-fz*.1);G.lookp.set(px+fx*2,ey+S.pitch*1.4,pz+fz*2);
    camera.position.lerp(G.want,snap?1:.35);G.look.lerp(G.lookp,snap?1:.45);
  }else{
    const m=P.lean*.55,tx=px-fz*m,tz=pz+fx*m,ty=G.cl+.05+(P.fz||0);
    const d=G.cd*(1-Math.abs(P.lean)*.3),cyy=Math.max(.14,G.chh-S.pitch*d*.75+(P.fz||0));
    const k=camRay(tx,ty,tz,tx-fx*d,cyy,tz-fz*d);
    G.want.set(tx-fx*d*k,ty+(cyy-ty)*k,tz-fz*d*k);
    G.lookp.set(tx+fx*1.1,G.cl+S.pitch*1.9+(P.fz||0),tz+fz*1.1);
    camera.position.lerp(G.want,snap?1:.28);G.look.lerp(G.lookp,snap?1:.32);
  }
  if(G.shake>0.05){camera.position.x+=(Math.random()-.5)*G.shake*.012;camera.position.y+=(Math.random()-.5)*G.shake*.012;G.shake*=Math.pow(.02,dt);}
  camera.lookAt(G.look);
  sky.position.copy(camera.position);
}

/* ---------- 粒子、聲音圈 ---------- */
function updFx(dt){
  const pool=G.pool;
  for(let i=G.parts.length-1;i>=0;i--){const p=G.parts[i];p.a-=dt*1.1;p.vy-=6*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<.03){p.y=.03;p.vy*=-.3;}if(p.a<=0)G.parts.splice(i,1);}
  for(let i=0;i<pool.parts.length;i++){
    const m=pool.parts[i],p=G.parts[i];
    if(!p){m.visible=false;continue;}
    m.visible=true;m.position.set(p.x,p.y,p.z);const s=.05+p.a*.07;m.scale.set(s,s,s);m.material.color.set(p.c);
  }
  for(let i=G.rings.length-1;i>=0;i--){const r=G.rings[i];r.t+=dt;if(r.t>.9)G.rings.splice(i,1);}
  for(let i=0;i<pool.rings.length;i++){
    const m=pool.rings[i],r=G.rings[i];
    if(!r){m.visible=false;continue;}
    const k=r.t/.9,s=Math.max(.2,r.max*k);
    m.visible=true;m.position.set(r.x,.06,r.y);m.scale.set(s,s,1);m.material.color.set(r.c);m.material.opacity=(1-k)*.7;
  }
}

/* ---------- 2D 疊層：浮字、狗的狀態圖示、目標指示、畫縫模式 ---------- */
function icon(x,y,type,ch_,s){
  const c=ox;s=s||13;
  c.beginPath();
  if(type==='tri'){c.moveTo(x,y-s);c.lineTo(x+s,y+s*.8);c.lineTo(x-s,y+s*.8);}
  else if(type==='dia'){c.moveTo(x,y-s);c.lineTo(x+s,y);c.lineTo(x,y+s);c.lineTo(x-s,y);}
  else c.arc(x,y,s,0,6.3);
  c.closePath();c.fill();c.lineWidth=2.5;c.strokeStyle='#2b1b2e';c.stroke();
  c.fillStyle='#2b1b2e';c.font='800 '+Math.round(s*1.15)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(ch_,x,y+(type==='tri'?s*.25:1));
}
const ICONS={chase:['tri','#ef5d50','!'],inspect:['tri','#ef5d50','嗅'],sus:['dia','#ffd23f','?'],search:['dia','#ffd23f','…'],stun:['cir','#ffffff','@'],
  sleep:['cir','#bfe0ff','Z'],seal:['dia','#ffd23f','封'],wipe:['cir','#7fd0e6','擦'],shield:['cir','#7fd0e6','盾'],spawn:['tri','#ef5d50','↓']};
function fishbone(x,y,s,col){
  const c=ox;c.strokeStyle=col;c.lineWidth=3;c.lineCap='round';
  c.beginPath();c.moveTo(x-s,y);c.lineTo(x+s*.8,y);
  for(let i=-1;i<=1;i++){c.moveTo(x+i*s*.45,y-s*.5);c.lineTo(x+i*s*.45,y+s*.5);}
  c.moveTo(x+s*.8,y);c.lineTo(x+s*1.25,y-s*.4);c.moveTo(x+s*.8,y);c.lineTo(x+s*1.25,y+s*.4);c.stroke();
  c.beginPath();c.arc(x-s*1.15,y,s*.28,0,6.3);c.fillStyle=col;c.fill();
}
function edge(p,m){
  if(!p.front){p.x=cw-p.x;p.y=ch+99;}
  p.off=p.x<m||p.x>cw-m||p.y<60||p.y>ch-100||!p.front;
  p.x=U.clamp(p.x,m,cw-m);p.y=U.clamp(p.y,64,ch-104);return p;
}
function drawOverlay(dt){
  const L=PH.L,P=PH.P,S=PH.S,SM=PH.Seams,c=ox;
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,cw,ch);
  if(G.flashT>0){G.flashT-=dt;c.globalAlpha=Math.max(0,G.flashT)*1.2;c.fillStyle=G.flashC;c.fillRect(0,0,cw,ch);c.globalAlpha=1;}
  if(S.mode==='title'||S.mode==='ending')return;
  // 浮字
  for(let i=G.txt.length-1;i>=0;i--){
    const t=G.txt[i];t.t+=dt;if(t.t>1.5){G.txt.splice(i,1);continue;}
    const p=G.toScreen(t.x,1.1+t.t*.7,t.y);if(!p.front)continue;
    c.globalAlpha=Math.min(1,(1.5-t.t)*2);c.font='800 17px '+FONT;c.textAlign='center';c.textBaseline='middle';
    c.lineWidth=4;c.strokeStyle='#2b1b2e';c.strokeText(t.s,p.x,p.y);c.fillStyle=t.c;c.fillText(t.s,p.x,p.y);c.globalAlpha=1;
  }
  // 狗的狀態（只有鏡頭真的看得到牠時才畫，不透牆）
  for(const d of L.dogs){
    if(!d.active)continue;
    const hy=d.K.heavy?1.25:d.kind==='corgi'?.95:1.2;
    if(!G.camSees(d.x,hy-.3,d.y))continue;
    const p=G.toScreen(d.x,hy+.25,d.y),ic=ICONS[PH.Dogs.icon(d)];
    if(ic){c.fillStyle=ic[1];icon(p.x,p.y-10,ic[0],ic[2],12);}
    if(d.meter>.05&&d.state!=='chase'&&d.state!=='pounce'&&d.stunT<=0){
      c.fillStyle='rgba(43,27,46,.8)';c.fillRect(p.x-22,p.y+6,44,7);c.fillStyle=d.meter>.7?'#ef5d50':'#ffd23f';c.fillRect(p.x-21,p.y+7,42*d.meter,5);
    }
    if(d.sleepy>.1&&d.stunT<=0){c.fillStyle='#8fc3b4';c.fillRect(p.x-21,p.y+15,42*Math.min(1,d.sleepy/2.5),4);}
  }
  // 目標指示（地圖罐的導航）
  const ob=PH.Game.obj;
  if(ob&&ob.x!=null&&PH.opt.hints&&S.mode==='play'&&!SM.draw){
    const p=edge(G.toScreen(ob.x,1.5,ob.y),26),bob=Math.sin(G.t*4)*4;
    c.fillStyle='#ffd23f';c.strokeStyle='#2b1b2e';c.lineWidth=2.5;
    if(p.off){
      const a=Math.atan2(p.y-ch/2,p.x-cw/2);c.save();c.translate(p.x,p.y);c.rotate(a);
      c.beginPath();c.moveTo(14,0);c.lineTo(-8,-10);c.lineTo(-8,10);c.closePath();c.fill();c.stroke();c.restore();
    }else{c.beginPath();c.moveTo(p.x,p.y+10+bob);c.lineTo(p.x-9,p.y-6+bob);c.lineTo(p.x+9,p.y-6+bob);c.closePath();c.fill();c.stroke();}
  }
  // 縫點的螢幕位置（畫縫模式的點選依據）
  SM.screen.length=0;
  if(SM.draw){
    const D=SM.draw;
    c.fillStyle='rgba(20,12,36,.28)';c.fillRect(0,0,cw,ch);
    for(const a of L.by.anchor){
      if(!a.found||(a.off&&L.f[a.off]))continue;
      const p=edge(G.toScreen(a.x,.55,a.y),30),start=SM.startable(a),bad=a.sealUntil||a.wipedUntil||a.sealing>0||!W.anchorOn(a);
      SM.screen.push({a:a,x:p.x,y:p.y,start:start});
      const pul=1+Math.sin(G.t*6)*.12,rad=(start?21:16)*(start&&!D.from?pul:1);
      c.beginPath();c.arc(p.x,p.y,rad,0,6.3);
      c.fillStyle=bad?'rgba(120,120,130,.85)':a===D.from?'#ffd23f':a===D.hover?(D.res&&D.res.ok?'#8fe3b4':'#ef5d50'):start?'rgba(127,208,230,.95)':'rgba(251,238,214,.9)';
      c.fill();c.lineWidth=3;c.strokeStyle='#2b1b2e';c.stroke();
      fishbone(p.x+1,p.y,9,'#2b1b2e');
      if(bad){c.strokeStyle='#ef5d50';c.lineWidth=4;c.beginPath();c.moveTo(p.x-12,p.y-12);c.lineTo(p.x+12,p.y+12);c.moveTo(p.x+12,p.y-12);c.lineTo(p.x-12,p.y+12);c.stroke();}
      c.font='800 13px '+FONT;c.textAlign='center';c.textBaseline='top';c.lineWidth=3;c.strokeStyle='#2b1b2e';
      c.strokeText(a.name,p.x,p.y+rad+3);c.fillStyle='#fbeed6';c.fillText(a.name,p.x,p.y+rad+3);
    }
    if(D.fresh){        // 進入模式時，起點已選好：把指標放到建議的終點（沒有的話放在起點）
      D.fresh=false;let b=null;
      const cs=SM.cands(D.from);let tgt=null;
      for(const x of cs){const ok=SM.check(D.from,x).ok;if(!tgt||(ok&&!tgt.ok))tgt={a:x,ok:ok};}
      for(const s of SM.screen){if(tgt&&s.a===tgt.a)b=s;}
      if(!b)for(const s of SM.screen)if(s.a===D.from)b=s;
      if(tgt){D.hover=tgt.a;D.res=SM.check(D.from,tgt.a);}
      if(b&&D.cx<0){D.cx=b.x;D.cy=b.y;if(PH.UI.setCursor)PH.UI.setCursor(b.x,b.y);}
    }
    if(D.from){
      let fp=null,hp=null;
      for(const s of SM.screen){if(s.a===D.from)fp=s;if(s.a===D.hover)hp=s;}
      if(fp){
        const ex=hp?hp.x:D.cx,ey=hp?hp.y:D.cy,ok=D.res&&D.res.ok;
        c.strokeStyle=hp?(ok?'#8fe3b4':'#ef5d50'):'#7fd0e6';c.lineWidth=5;c.setLineDash([10,7]);c.lineDashOffset=-G.t*40;
        c.beginPath();c.moveTo(fp.x,fp.y);c.lineTo(ex,ey);c.stroke();c.setLineDash([]);
        if(D.res){
          const tx=(fp.x+ex)/2,ty=(fp.y+ey)/2-16,s=ok?D.res.dist.toFixed(1)+' 公尺　消耗 '+D.res.cost+'　點一下或按 E 確認':D.res.why;
          c.font='800 15px '+FONT;c.textAlign='center';c.textBaseline='middle';
          const wd=c.measureText(s).width+18;c.fillStyle=ok?'#8fe3b4':'#ef5d50';c.fillRect(U.clamp(tx-wd/2,6,cw-wd-6),ty-14,wd,28);
          c.fillStyle='#2b1b2e';c.fillText(s,U.clamp(tx,wd/2+6,cw-wd/2-6),ty+1);
        }
      }
    }
    // 貓掌指標
    if(D.cx>=0){c.fillStyle='#fbeed6';c.strokeStyle='#2b1b2e';c.lineWidth=2.5;c.beginPath();c.arc(D.cx,D.cy,7,0,6.3);c.fill();c.stroke();
      for(let i=-1;i<=1;i++){c.beginPath();c.arc(D.cx+i*7,D.cy-10+Math.abs(i)*3,3.4,0,6.3);c.fill();c.stroke();}}
    // 專注值
    const fk=P.focus/PH.CFG.seam.focusMax;c.fillStyle='rgba(43,27,46,.8)';c.fillRect(cw/2-71,ch-150,142,12);c.fillStyle=fk>0?'#7fd0e6':'#777';c.fillRect(cw/2-70,ch-149,140*fk,10);
    c.font='800 12px '+FONT;c.textAlign='center';c.textBaseline='bottom';c.fillStyle='#fbeed6';c.fillText(fk>0?'畫縫專注（時間變慢）':'專注用完，時間恢復正常',cw/2,ch-153);
  }
}
G.draw=function(dt){
  if(!G.ok||!PH.L||!PH.P)return;
  const L=PH.L;G.t+=dt;
  updFloor(L,dt);
  G.sync(L,PH.P,G.t,dt);
  for(const f of G.anim)f(G.t,dt);
  if(L.def.draw)L.def.draw(L,G.t);
  updCamera(dt);
  updFx(dt);
  R3.render(scene,camera);
  drawOverlay(dt);
};
G.setLow=function(){if(R3){R3.shadowMap.enabled=!PH.opt.lowfx;G.resize();}};
})();
