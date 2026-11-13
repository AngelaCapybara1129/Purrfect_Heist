/* 模型：貓（五種形態）、狗（九種）、月亮總督、機關與物件。全部用簡單幾何體拼成軟陶玩具風。 */
(function(){
'use strict';
const PH=window.PH,U=PH.U,W=PH.World,G=PH.GFX,H=G.h,T3=H.T3;
const M=H.M,MB=H.MB,add=H.add,bx=H.bx,bl=H.bl,cy=H.cy,cn=H.cn,gp=H.gp,flat=H.flat,GEO=H.GEO;
const EB={},ES={};
const CANCOL={prologue:'#8fc3b4',kitchen:'#3fa9e0',laundry:'#ff8f6a',museum:'#5a4a9a',market:'#ffd23f',moon:'#fff2c4',escape:'#fff2c4'};
function basic(c,op,addv){return new T3.MeshBasicMaterial({color:c,transparent:true,opacity:op==null?1:op,depthWrite:false,side:T3.DoubleSide,blending:addv?T3.AdditiveBlending:T3.NormalBlending});}
function tor(R,r,c,x,y,z,p){return add(new T3.TorusGeometry(R,r,6,12),c,1,1,1,x,y,z,p);}

function makeCan(p,col){
  const g=gp(0,0,0,p);
  cy(.13,.2,'#dfe6ec',0,.1,0,g);cy(.137,.1,col||'#3fa9e0',0,.1,0,g);bl(.05,.035,.03,'#ffffff',0,.1,.13,g);cy(.1,.02,'#f7fafc',0,.205,0,g);
  return g;
}
function fishboneMesh(p,mat,s){
  const g=gp(0,0,0,p);
  add(GEO.box,mat,.5*s,.05*s,.05*s,0,0,0,g);
  [-.14,0,.14].forEach(function(dx){add(GEO.box,mat,.05*s,.24*s,.05*s,dx*s,0,0,g);});
  add(GEO.ico,mat,.07*s,.07*s,.05*s,-.3*s,0,0,g);
  add(GEO.box,mat,.16*s,.045*s,.05*s,.3*s,.05*s,0,g).rotation.z=.7;add(GEO.box,mat,.16*s,.045*s,.05*s,.3*s,-.05*s,0,g).rotation.z=-.7;
  g.children.forEach(function(m){m.castShadow=false;m.receiveShadow=false;});
  return g;
}

/* ---------- 咪嚕 ---------- */
function makeCat(L){
  const o={},g=o.g=gp(),n=o.norm=gp(0,0,0,g),b=o.body=gp(0,0,0,n),OR='#f6a23c',CR='#fff1dc',DK='#d97f2a';
  bl(.27,.2,.2,OR,0,.26,0,b);bl(.14,.13,.16,CR,.13,.2,0,b);
  bx(.04,.02,.26,DK,-.02,.455,0,b);bx(.04,.02,.22,DK,-.12,.44,0,b);
  const h=o.head=gp(.24,.44,0,b);
  bl(.17,.155,.18,OR,0,0,0,h);bl(.075,.055,.1,CR,.12,-.05,0,h);bl(.022,.018,.026,'#e2748a',.195,-.03,0,h);
  [-1,1].forEach(function(s){bl(.026,.034,.022,'#2b1b2e',.135,.035,s*.075,h);cn(.065,.13,OR,-.02,.16,s*.1,h);cn(.035,.08,'#f7b8b0',.005,.15,s*.1,h);});
  o.legs=[];
  [[.15,.1],[.15,-.1],[-.15,.1],[-.15,-.1]].forEach(function(q){const l=gp(q[0],.18,q[1],n);cy(.05,.18,OR,0,-.09,0,l);bl(.058,.035,.065,CR,.01,-.165,0,l);o.legs.push(l);});
  const t=o.tail=gp(-.25,.3,0,b);
  cy(.036,.2,OR,-.04,.08,0,t).rotation.z=.5;cy(.034,.18,OR,-.1,.24,0,t).rotation.z=.15;bl(.045,.05,.045,CR,-.11,.35,0,t);
  // 液體貓：一攤果凍，尾巴掛在邊上
  const q=o.liq=gp(0,0,0,g),lm=new T3.MeshStandardMaterial({color:'#f9b860',transparent:true,opacity:.82,roughness:.15,flatShading:true});
  o.puddle=add(GEO.ico2,lm,.4,.08,.34,0,.07,0,q);add(GEO.ico2,lm,.17,.11,.17,.16,.13,0,q);
  [-1,1].forEach(function(s){add(GEO.cone,lm,.05,.09,.05,.13,.25,s*.09,q);bl(.022,.026,.02,'#2b1b2e',.29,.15,s*.06,q);});
  add(GEO.cyl,lm,.03,.2,.03,-.36,.1,.1,q).rotation.z=.9;
  // 影子貓：貼在地上的剪影，只有眼睛亮著
  const sh=o.shd=gp(0,0,0,g),sm=basic('#0d0716',.88);
  let m=flat(GEO.circ,sm,0,.02,0,sh);m.scale.set(.36,.24,1);m=flat(GEO.circ,sm,.3,.021,0,sh);m.scale.set(.19,.17,1);
  [-1,1].forEach(function(s){const e=flat(GEO.circ,sm,.36,.022,s*.13,sh);e.scale.set(.09,.06,1);const y=flat(GEO.circ,basic('#ffd23f',1),.38,.024,s*.07,sh);y.scale.set(.03,.04,1);});
  m=flat(GEO.plane,sm,-.5,.02,.06,sh);m.scale.set(.4,.06,1);m.rotation.z=.4;
  o.can=makeCan(g,CANCOL[L.id]);
  return o;
}

/* ---------- 狗 ---------- */
const DOGCOL={shiba:'#e89b3f',nose:'#b9773c',ear:'#9aa3b8',poodle:'#fff6ee',captain:'#6f7a94',corgi:'#f2b25e',bulldog:'#8a8f9a',sleepwalk:'#bfd6ff',mop:'#d9c8a0'};
function makeDog(kind){
  const cg=kind==='corgi',hv=kind==='bulldog'||kind==='captain',o={},g=o.g=gp(),b=o.body=gp(0,0,0,g),TN=DOGCOL[kind],CR='#fff1dc',BK='#2b1b2e';
  const wd=hv?1.25:1;
  bl(cg?.4:.36,.26,.25*wd,TN,0,.44,0,b);bl(.2,.2,.21*wd,CR,.2,.36,0,b);
  const h=o.head=gp(.38,.76,0,b);
  bl(.22,.2,.22*wd,TN,0,0,0,h);bl(.13,.09,.13,CR,.17,-.07,0,h);
  bl(kind==='nose'?.075:.04,kind==='nose'?.06:.032,kind==='nose'?.08:.045,kind==='nose'?'#e2748a':BK,.295,-.04,0,h);
  [-1,1].forEach(function(s){
    if(kind==='sleepwalk')bx(.02,.012,.06,BK,.19,.05,s*.095,h);else bl(.03,.036,.025,BK,.175,.05,s*.095,h);
    bl(.09,.08,.07,CR,.08,-.07,s*.15,h);
    if(kind==='ear')cn(.14,.46,TN,-.04,.34,s*.2,h);
    else if(kind==='poodle')bl(.12,.14,.1,'#ffffff',-.02,.1,s*.22,h);
    else if(kind==='bulldog')bl(.07,.05,.06,TN,-.02,.14,s*.19,h);
    else cn(cg?.1:.07,cg?.24:.15,TN,-.04,cg?.24:.19,s*.17,h);
  });
  if(cg){bl(.05,.12,.05,CR,.16,.08,0,h);tor(.17,.035,'#ef5d50',.3,.6,0,b).rotation.y=Math.PI/2;bl(.04,.04,.04,'#ffd23f',.42,.5,0,b);}
  else if(kind==='shiba'){cy(.135,.09,'#2f5fd0',-.01,.215,0,h);bx(.15,.025,.26,'#234aa8',.13,.18,0,h);bl(.04,.04,.02,'#ffd23f',.13,.225,0,h);}
  else if(kind==='nose'){cn(.2,.16,'#7a4a2b',-.01,.24,0,h);bx(.2,.03,.3,'#5a3d24',.1,.17,0,h);}
  else if(kind==='poodle'){bl(.13,.12,.13,'#ffffff',-.02,.22,0,h);add(GEO.box,M('#ffd23f',{emissive:'#ffd23f',emissiveIntensity:1}),.1,.08,.14,.2,.2,0,h).castShadow=false;
    o.beam=new T3.Mesh(new T3.CylinderGeometry(.08,1.4,3.6,10,1,true),MB('#fff2c4',.13,true));o.beam.rotation.z=Math.PI/2+.25;o.beam.position.set(2.0,-.25,0);h.add(o.beam);}
  else if(kind==='captain'){cy(.2,.1,'#1f2a5a',-.01,.22,0,h);bx(.2,.03,.36,'#1f2a5a',.14,.18,0,h);bl(.05,.05,.02,'#ffd23f',.17,.25,0,h);}
  else if(kind==='bulldog'){bx(.5,.12,.56,'#4a4f5a',0,.66,0,b);bx(.3,.1,.5,'#4a4f5a',-.2,.62,0,b);tor(.2,.045,'#2b1b2e',.3,.62,0,b).rotation.y=Math.PI/2;
    for(let i=0;i<5;i++)cn(.03,.08,'#dfe6ec',.3,.62+Math.cos(i*1.25)*.22,Math.sin(i*1.25)*.22,b);bl(.06,.03,.2,CR,.24,-.14,0,h);}
  else if(kind==='sleepwalk'){const c=cn(.15,.34,'#7fa0e6',-.03,.26,0,h);c.rotation.z=.5;bl(.05,.05,.05,'#ffffff',-.19,.38,0,h);}
  else if(kind==='mop'){for(let i=0;i<5;i++)bl(.09,.1,.09,TN,.1,.12,(i-2)*.08,h);o.mop=gp(.5,.3,.2,b);cy(.025,.9,'#7a4a2b',0,.2,0,o.mop).rotation.z=-.5;bl(.16,.06,.2,'#dff6ff',.25,-.26,0,o.mop);}
  o.legs=[];
  [[.22,.13*wd],[.22,-.13*wd],[-.22,.13*wd],[-.22,-.13*wd]].forEach(function(q){
    const l=gp(q[0],cg?.14:.26,q[1],g);if(cg)l.scale.y=.54;
    cy(.065,.26,TN,0,-.13,0,l);bl(.075,.04,.085,CR,.015,-.24,0,l);o.legs.push(l);
  });
  o.tail=cg?bl(.07,.07,.07,CR,-.4,.5,0,b):kind==='poodle'?bl(.1,.1,.1,'#ffffff',-.42,.66,0,b):add(new T3.TorusGeometry(.1,.045,5,8,5),TN,1,1,1,-.36,.66,0,b);
  o.lid=gp(0,0,0,g);cy(.64,.07,'#b9c4cf',0,0,0,o.lid);cy(.5,.05,'#d5dde4',0,.05,0,o.lid);
  o.towel=bx(.5,.1,.5,'#ff5fa2',.38,1.0,0,b);
  o.tape=tor(.09,.04,'#ffd23f',.62,.66,0,b);o.tape.rotation.y=Math.PI/2;
  if(hv||kind==='captain')g.scale.set(1.2,1.2,1.2);
  return o;
}
// 輔助模式：畫出狗的視線範圍（會被牆擋住）
function makeCone(){
  const n=20,pa=new T3.BufferAttribute(new Float32Array((n+2)*3),3),cg=new T3.BufferGeometry(),idx=[];
  cg.setAttribute('position',pa);for(let i=0;i<n;i++)idx.push(0,i+1,i+2);cg.setIndex(idx);
  const mesh=new T3.Mesh(cg,basic('#ffd23f',.28));mesh.frustumCulled=false;mesh.visible=false;G.cur.add(mesh);
  return {mesh:mesh,pa:pa,n:n};
}
function syncCone(c,d,P){
  const on=PH.opt.cone&&d.active&&d.K.vis>0&&d.stunT<=0&&d.state!=='sleep'&&d.state!=='lurk'&&d.spawnT<=0&&G.camSees(d.x,.8,d.y);
  c.mesh.visible=on;if(!on)return;
  const pa=c.pa,range=d.K.vis*PH.FORMS[P.form].vis*(d.busy?.3:1),half=d.K.cone;
  pa.setXYZ(0,d.x,.05,d.y);
  for(let i=0;i<=c.n;i++){
    const a=d.ang-half+2*half*i/c.n,cx=Math.cos(a),sy=Math.sin(a);let r=0;
    for(;r<range;r+=.25)if(W.hgt(Math.floor(d.x+cx*(r+.25)),Math.floor(d.y+sy*(r+.25)))>=.5)break;
    pa.setXYZ(i+1,d.x+cx*r,.05,d.y+sy*r);
  }
  pa.needsUpdate=true;
  c.mesh.material.color.set(d.state==='chase'?'#ef5d50':d.meter>.3?'#ff9646':'#ffd23f');
}

/* ---------- 月亮總督 ---------- */
G.makeBoss=function(){
  const o={},g=o.g=gp(),b=o.body=gp(0,0,0,g),TN='#c9b08a',CR='#fff1dc',BK='#2b1b2e',NV='#2a3170';
  bl(1.0,.75,.72,TN,0,1.25,0,b);bl(.55,.55,.6,CR,.55,1.0,0,b);bx(1.3,.5,1.3,NV,-.1,1.55,0,b);
  [-1,1].forEach(function(s){bx(.4,.12,.3,'#ffd23f',.2,1.86,s*.6,b);});
  const h=o.head=gp(1.05,2.15,0,b);
  bl(.6,.55,.6,TN,0,0,0,h);bl(.36,.25,.36,CR,.46,-.2,0,h);bl(.11,.09,.12,BK,.8,-.12,0,h);
  [-1,1].forEach(function(s){bl(.08,.1,.07,BK,.48,.14,s*.26,h);cn(.2,.42,TN,-.1,.52,s*.46,h);bl(.24,.22,.2,CR,.22,-.2,s*.42,h);});
  o.helm=gp(0,0,0,h);
  add(GEO.ico2,new T3.MeshStandardMaterial({color:'#bfe0ff',transparent:true,opacity:.28,roughness:.1,depthWrite:false}),.82,.8,.82,.05,.05,0,o.helm).castShadow=false;
  tor(.72,.07,'#ffd23f',.05,-.38,0,o.helm).rotation.x=Math.PI/2;
  o.lamp=add(GEO.box,new T3.MeshStandardMaterial({color:'#fff2c4',emissive:'#fff2c4',emissiveIntensity:.4}),.2,.14,.4,.68,.52,0,o.helm);
  o.frost=add(GEO.ico2,new T3.MeshStandardMaterial({color:'#eefaff',transparent:true,opacity:.86,roughness:.6,flatShading:true}),.86,.84,.86,.05,.05,0,h);o.frost.castShadow=false;
  o.legs=[];
  [[.6,.42],[.6,-.42],[-.6,.42],[-.6,-.42]].forEach(function(q){const l=gp(q[0],.75,q[1],g);cy(.19,.75,TN,0,-.37,0,l);bl(.23,.12,.26,CR,.04,-.7,0,l);o.legs.push(l);});
  const t=o.tail=gp(-.95,1.5,0,b);o.seg=[];
  for(let i=0;i<6;i++){const s=bl(.2-i*.018,.2-i*.018,.2-i*.018,i===5?CR:TN,-i*.3,i*.12,0,t);o.seg.push(s);}
  o.fish=add(GEO.ico,new T3.MeshStandardMaterial({color:'#7fd0e6',emissive:'#7fd0e6',emissiveIntensity:.9,flatShading:true}),.32,.2,.06,-1.75,.9,0,t);
  o.gun=gp(.9,1.0,.75,b);bx(.5,.2,.2,'#5a6a8a',0,0,0,o.gun);tor(.14,.06,'#ffd23f',-.1,.16,0,o.gun);
  o.fish.visible=false;o.frost.visible=false;
  return o;
};
function makeTele(){
  const T={arrow:[],arc:[],disc:[],quad:[],sector:[],ring:[],mark:[],line:[]};
  const mk=function(geo,n,list){for(let i=0;i<n;i++){const g=gp(),m=new T3.Mesh(geo,basic('#fff',.4));m.rotation.x=Math.PI/2;g.add(m);g.visible=false;g.userData.m=m;list.push(g);}};
  mk(GEO.plane,2,T.arrow);mk(GEO.arc,1,T.arc);mk(GEO.circ,8,T.disc);mk(GEO.quad,4,T.quad);mk(GEO.sec60,6,T.sector);mk(GEO.ring,3,T.ring);mk(GEO.ring,3,T.mark);mk(GEO.plane,2,T.line);
  return T;
}
function syncTele(T,L,t){
  for(const k in T)for(const g of T[k])g.visible=false;
  const B=PH.Boss;if(!B.active)return;
  const C=L.def.boss,used={};
  for(const s of B.gfx){
    const i=used[s.t]=(used[s.t]||0),list=T[s.t];if(!list||i>=list.length)continue;used[s.t]++;
    const g=list[i],m=g.userData.m;g.visible=true;m.material.color.set(s.col||'#fff');m.material.opacity=s.a==null?.45:s.a;
    g.rotation.y=0;g.position.set(0,.04+i*.002,0);m.position.set(0,0,0);
    switch(s.t){
      case 'arrow':g.position.set(s.x,.05,s.y);g.rotation.y=-s.a;m.scale.set(s.len,1.5,1);m.position.set(s.len/2,0,0);m.material.opacity=.25+.45*(s.k||0);break;
      case 'arc':g.position.set(s.x,.05,s.y);g.rotation.y=-s.a;m.scale.set(s.r,s.r,1);m.material.opacity=.2+.4*(s.k||0);break;
      case 'disc':g.position.set(s.x,.045+i*.003,s.y);m.scale.set(s.r,s.r,1);break;
      case 'quad':g.position.set(C.c[0],.04,C.c[1]);g.rotation.y=-s.q*Math.PI/2;m.scale.set(C.R,C.R,1);break;
      case 'sector':g.position.set(C.c[0],.04,C.c[1]);g.rotation.y=-(s.i*1.0472+s.off);m.scale.set(C.R,C.R,1);break;
      case 'ring':g.position.set(s.x,.04,s.y);m.scale.set(s.r+.7,s.r+.7,1);break;
      case 'mark':{const p=.7+Math.sin(t*8)*.15;g.position.set(s.x,.06,s.y);m.scale.set(p,p,1);m.material.opacity=.9;break;}
      case 'line':{const len=Math.hypot(s.x1-s.x0,s.y1-s.y0);g.position.set(s.x0,.05,s.y0);g.rotation.y=-Math.atan2(s.y1-s.y0,s.x1-s.x0);m.scale.set(len,.5,1);m.position.set(len/2,0,0);m.material.opacity=.35+Math.sin(t*5)*.15;break;}
    }
  }
}

/* ---------- 物件：建立 ---------- */
EB.box=function(e){
  const g=e.g=gp(e.x,0,e.y),CB='#d9a066',CD='#b98250';
  bx(.86,.5,.05,CB,0,.25,.405,g);bx(.86,.5,.05,CB,0,.25,-.405,g);bx(.05,.5,.8,CB,.405,.25,0,g);bx(.05,.5,.8,CB,-.405,.25,0,g);bx(.8,.04,.8,'#5a3d24',0,.03,0,g);
  e.lids=[1,-1].map(function(s){const l=gp(0,.5,s*.4,g);bx(.86,.03,.4,CD,0,0,-s*.2,l);l.userData.s=s;return l;});
  if(e.safe){[.435,-.435].forEach(function(z){const f=fishboneMesh(g,M('#ffffff'),.6);f.position.set(0,.27,z);});}
  if(e.finish){e.ring=flat(GEO.ring,basic('#ffd23f',.7),0,.03,0,g);e.ring.scale.set(.85,.85,1);}
  const p=e.peek=gp(0,0,0,g);
  bl(.2,.12,.2,'#f6a23c',0,.47,0,p);
  [-1,1].forEach(function(s){cn(.065,.13,'#f6a23c',s*.1,.6,-.02,p);bl(.03,.035,.02,'#ffd23f',s*.075,.5,.185,p);});
};
EB.anchor=function(e){
  const g=e.g=gp(e.x,0,e.y);
  e.mat=new T3.MeshBasicMaterial({color:'#fbeed6'});
  e.glyph=fishboneMesh(g,e.mat,.9);e.glyph.position.y=.5;
  e.gr=flat(GEO.ring,basic('#7fd0e6',.6),0,.03,0,g);e.gr.scale.set(.42,.42,1);
  e.portal=new T3.Mesh(GEO.circ,basic('#7fd0e6',.6,true));e.portal.position.y=.55;g.add(e.portal);
  e.pin=new T3.Mesh(GEO.circ,basic('#dff6ff',.85,true));e.pin.position.y=.55;g.add(e.pin);
  e.tape=gp(0,.5,0,g);
  [.6,-.6].forEach(function(r){const m=add(GEO.box,M('#ffd23f'),.8,.1,.04,0,0,0,e.tape);m.rotation.z=r;m.castShadow=false;});
};
EB.ped=function(e,L){
  const g=e.g=gp(e.x,0,e.y);let y0=W.hgt(Math.floor(e.x),Math.floor(e.y));
  if(y0<.1){cy(.3,.5,'#c9a24a',0,.25,0,g);cy(.36,.06,'#ffd23f',0,.52,0,g);y0=.55;}
  e.can=makeCan(g,CANCOL[L.id]);e.can.position.y=y0+.02;e.can.scale.setScalar(1.6);
  e.halo=flat(GEO.circ,basic('#fff2c4',.3,true),0,y0+.03,0,g);e.halo.scale.set(.5,.5,1);
  e.dome=add(GEO.ico2,new T3.MeshStandardMaterial({color:'#bfe0ff',transparent:true,opacity:.35,roughness:.1,depthWrite:false}),.36,.42,.36,0,y0+.22,0,g);e.dome.castShadow=false;
};
EB.sw=function(e){
  const g=e.g=gp(e.x,0,e.y),m=e.model||'lever';
  if(m==='oldcan'){cy(.12,.1,'#c9d3dc',0,.05,0,g);cy(.125,.05,'#ff6f61',0,.05,0,g);cy(.11,.015,'#e8eef3',.1,.14,0,g).rotation.z=-.9;bl(.05,.02,.03,'#7fd0e6',0,.11,0,g);}
  else if(m==='lever'){bx(.34,.14,.34,'#5a3d24',0,.07,0,g);e.arm=gp(0,.14,0,g);cy(.035,.55,'#fbeed6',0,.27,0,e.arm);bx(.24,.04,.04,'#fbeed6',0,.36,0,e.arm);bx(.2,.04,.04,'#fbeed6',0,.26,0,e.arm);bl(.08,.08,.08,'#ef5d50',0,.58,0,e.arm);}
  else if(m==='crank'){cy(.07,.75,'#e58f4e',0,.375,0,g);e.arm=fishboneMesh(g,M('#ffffff'),1);e.arm.position.y=.8;}
  else if(m==='button'){bx(.4,.2,.4,'#5a6a8a',0,.1,0,g);e.arm=cy(.13,.08,'#ef5d50',0,.24,0,g);}
  else if(m==='gear'){e.arm=tor(.3,.09,'#ffd23f',0,.42,0,g);bx(.5,.08,.08,'#c9a24a',0,0,0,e.arm);bx(.08,.5,.08,'#c9a24a',0,0,0,e.arm);}
  else if(m==='valve'){cy(.06,.6,'#7fd0e6',0,.3,0,g);e.arm=tor(.2,.05,'#ef5d50',0,.62,0,g);e.arm.rotation.x=Math.PI/2;}
  else if(m==='proj'){bx(.5,.4,.4,'#3b2f6b',0,.55,0,g);const c=cn(.2,.3,'#7fd0e6',.32,.55,0,g);c.rotation.z=Math.PI/2;cy(.04,.36,'#2b1b2e',0,.18,0,g);}
  e.gl=flat(GEO.ring,basic('#ffd23f',.7),0,.03,0,g);e.gl.scale.set(.5,.5,1);
};
EB.push=function(e){
  const g=e.g=gp(e.px,0,e.py),m=e.model;
  if(m==='bread'){bx(.86,.42,.62,'#d98c45',0,.21,0,g);bl(.44,.2,.32,'#eaa95a',0,.44,0,g);}
  else if(m==='bottle'){cy(.4,.9,'#7fd0e6',0,.45,0,g);cy(.2,.25,'#3fa9e0',0,1.02,0,g);cy(.24,.1,'#ffffff',0,1.2,0,g);bx(.5,.36,.03,'#ffffff',0,.5,.4,g);const f=fishboneMesh(g,new T3.MeshBasicMaterial({color:'#7fd0e6'}),.6);f.position.set(.42,.5,.3);}
  else if(m==='board'){bx(.9,1.9,.14,'#2a2140',0,.95,0,g);bx(.96,.08,.2,'#c9a24a',0,1.92,0,g);bx(.96,.1,.5,'#c9a24a',0,.05,0,g);}
  else if(m==='label'){bx(.96,1.6,.2,'#e98fb0',0,.8,0,g);bx(.7,.5,.22,'#fff6e3',0,.9,0,g);bx(.98,.08,.3,'#ffd23f',0,1.6,0,g);}
  else bx(.9,e.h||1,.9,'#b98250',0,(e.h||1)/2,0,g);
};
EB.plate=function(e){
  const g=e.g=gp(e.x,0,e.y);e.disc=cy(e.r||.9,.08,e.by==='dog'?'#8a93a8':'#ffd23f',0,.04,0,g);cy((e.r||.9)*.7,.04,'#fff6e3',0,.09,0,g);
  e.rg=flat(GEO.ring,basic('#ffd23f',.6),0,.03,0,g);e.rg.scale.set((e.r||.9)+.15,(e.r||.9)+.15,1);
};
EB.pipe=function(e){
  e.g=gp();
  [e.a,e.b].forEach(function(q){const t=tor(.3,.07,'#7fd0e6',q[0],.08,q[1],e.g);t.rotation.x=Math.PI/2;const d=flat(GEO.circ,basic('#0d0716',.85),q[0],.03,q[1],e.g);d.scale.set(.28,.28,1);});
};
EB.towel=function(e){
  e.g=gp();e.tw=gp(e.x,1.2,e.y,e.g);bx(.7,.5,.06,'#ff5fa2',0,0,0,e.tw);bx(.72,.08,.07,'#ffffff',0,.12,0,e.tw);bx(.72,.08,.07,'#ffffff',0,-.12,0,e.tw);
  e.rg=flat(GEO.ring,basic('#ff5fa2',.75),e.dx,.05,e.dy,e.g);e.rg.scale.set(1.1,1.1,1);
};
EB.soap=function(e){
  e.g=gp();const s=bx(.34,.1,.22,'#e98fb0',e.x,.05,e.y,e.g);s.rotation.y=.4;bl(.06,.06,.06,'#ffffff',e.x+.1,.14,e.y,e.g);
  const b=gp(e.bx,0,e.by,e.g);bx(.9,.06,.9,'#b98250',0,.03,0,b);[[.45,0,.06,.9],[-.45,0,.06,.9],[0,.45,.9,.06],[0,-.45,.9,.06]].forEach(function(q){bx(q[2],.4,q[3],'#e0b070',q[0],.2,q[1],b);});
};
EB.toy=function(e){e.g=gp(e.x,0,e.y);bl(.15,.15,.15,'#ff5fa2',0,.15,0,e.g);bl(.05,.05,.05,'#ffffff',.08,.24,.05,e.g);};
EB.knock=function(e){e.g=gp(e.x,1.05,e.y);cy(.11,.24,'#ff6f61',0,.12,0,e.g);cy(.115,.05,'#fff6e3',0,.26,0,e.g);};
function itemModel(e){
  const g=gp(0,0,0,e.g),k=e.kind;
  if(k==='smallcan'){const c=makeCan(g,'#8fc3b4');c.scale.setScalar(.85);}
  else if(k==='ticket'){bx(.36,.22,.03,'#ffd23f',0,.2,0,g);const f=fishboneMesh(g,new T3.MeshBasicMaterial({color:'#2b1b2e'}),.5);f.position.set(0,.2,.02);}
  else if(k==='collect'){add(GEO.rock,M('#ffd23f',{emissive:'#ffb000',emissiveIntensity:.5}),.16,.16,.06,0,.25,0,g);}
  else if(k==='bowl'){cy(.2,.1,'#e98fb0',0,.05,0,g);cy(.15,.02,'#2b1b2e',0,.1,0,g);}
  else if(k==='flavor'){const c=makeCan(g,'#ef5d50');cy(.14,.03,'#ffd23f',0,.13,0,c);cy(.14,.03,'#7fd0e6',0,.07,0,c);}
  else if(k==='key'){const f=fishboneMesh(g,M('#ffffff'),.9);f.position.y=.25;}
  else if(k==='furball'){bl(.15,.14,.15,'#b9a08a',0,.16,0,g);bl(.04,.04,.04,'#8a7460',.1,.25,.04,g);}
  else if(k==='sticker'){add(GEO.ico,M('#7fd0e6',{emissive:'#7fd0e6',emissiveIntensity:.6}),.2,.12,.03,0,.25,0,g);}
  else if(k==='fish'){bl(.2,.05,.08,'#b9773c',0,.12,0,g);cn(.06,.1,'#b9773c',-.22,.12,0,g).rotation.z=-Math.PI/2;}
  e.gm=g;e.gk=k;
}
EB.item=function(e){e.g=gp(e.x,0,e.y);itemModel(e);e.sh=flat(GEO.circ,basic('#ffd23f',.25,true),0,.02,0,e.g);e.sh.scale.set(.3,.3,1);};
EB.light=function(e){
  e.g=gp();bx(.3,.2,.3,'#2b1b2e',e.mx,2.9,e.my,e.g).castShadow=false;
  e.head=add(GEO.box,M('#fff2c4',{emissive:'#fff2c4',emissiveIntensity:1}),.2,.12,.2,e.mx,2.76,e.my,e.g);e.head.castShadow=false;
  e.disc=flat(GEO.circ,basic('#fff2c4',.34,true),0,.04,0,e.g);e.disc.scale.set(e.r,e.r,1);
  e.col=new T3.Mesh(new T3.CylinderGeometry(e.r*.25,e.r,2.7,14,1,true),basic('#fff2c4',.07,true));e.g.add(e.col);
};
EB.mover=function(e){
  const g=e.g=gp(e.x,0,e.y),m=e.model;
  if(m==='plate'){cy(.62,.06,'#ffffff',0,.0,0,g);cy(.44,.02,'#dcebf3',0,.035,0,g);}
  else if(m==='saucer'){cy(.62,.06,'#bfe9f2',0,0,0,g);cy(.44,.02,'#ffffff',0,.035,0,g);}
  else if(m==='toast'){bx(1.1,.1,1.0,'#c98440',0,-.02,0,g);bx(.96,.1,.86,'#f6d595',0,.02,0,g);}
  else if(m==='sock'){bx(1.1,.14,.8,'#ff8fa3',0,0,0,g);bl(.36,.12,.4,'#ff8fa3',.55,0,0,g);bx(.2,.16,.82,'#ffffff',-.5,0,0,g);}
  else if(m==='lidboat'){cy(.66,.07,'#b9c4cf',0,0,0,g);cy(.5,.05,'#d5dde4',0,.05,0,g);bl(.07,.05,.07,'#2b1b2e',0,.1,0,g);}
  else if(m==='bus'){
    bx(1.5,.7,.9,'#ffd23f',0,.55,0,g);bx(1.4,.3,.84,'#fff6e3',0,1.0,0,g);bx(1.52,.08,.92,'#ef5d50',0,.34,0,g);
    [-.45,0,.45].forEach(function(dx){bx(.3,.22,.92,'#7fd0e6',dx,1.0,0,g);});
    [[.5,.4],[.5,-.4],[-.5,.4],[-.5,-.4]].forEach(function(q){cy(.16,.1,'#2b1b2e',q[0],.16,q[1],g).rotation.x=Math.PI/2;});
    add(GEO.box,M('#fff2c4',{emissive:'#fff2c4',emissiveIntensity:.8}),.05,.12,.2,.76,.5,.25,g);
  }
};
EB.wind=function(e){
  e.g=gp();e.pad=flat(GEO.ring,basic('#dff6ff',.7),e.from[0],.04,e.from[1],e.g);e.pad.scale.set(.6,.6,1);
  e.bub=[];for(let i=0;i<4;i++){const m=new T3.Mesh(GEO.ico2,new T3.MeshStandardMaterial({color:'#dff6ff',transparent:true,opacity:.35,roughness:.1,depthWrite:false}));e.g.add(m);e.bub.push(m);}
};
EB.plant=function(e){
  const g=e.g=gp(e.x,0,e.y);cy(.3,.4,'#b9773c',0,.2,0,g);cy(.34,.07,'#d98c45',0,.42,0,g);
  e.lv=gp(0,.45,0,g);for(let i=0;i<6;i++){const c=cn(.16,.7,i%2?'#3f9f5a':'#5bc470',Math.cos(i*1.05)*.14,.3,Math.sin(i*1.05)*.14,e.lv);c.rotation.z=Math.cos(i*1.05)*-.4;c.rotation.x=Math.sin(i*1.05)*.4;}
  e.eyes=gp(0,.62,0,g);[-1,1].forEach(function(s){bl(.03,.035,.02,'#ffd23f',s*.07,0,.2,e.eyes);});
};
EB.gate=function(e,L){
  const g=e.g=gp(),m=e.model||'door',h=e.h==null?1.4:e.h;e.ak=e.closed?0:1;e.haz=e.k==='hazard';
  e.tiles.forEach(function(q,i){
    const c=q[0],r=q[1],s=gp(c+.5,0,r+.5,g),w=L.w;
    const horiz=L.leg[L.base[r*w+c-1]].k==='solid'&&L.leg[L.base[r*w+c+1]].k==='solid';
    const slab=function(col,th,hh){return horiz?bx(1,hh||h,th,col,0,(hh||h)/2,0,s):bx(th,hh||h,1,col,0,(hh||h)/2,0,s);};
    if(m==='lid'){const d=cy(.66,.1,'#b9c4cf',0,.68,0,s);d.rotation.z=Math.PI/2;const d2=cy(.5,.12,'#d5dde4',0,.68,0,s);d2.rotation.z=Math.PI/2;bx(.3,h,1,'#8a93a8',0,h/2,0,s);}
    else if(m==='mug'){cy(.45,.62,'#fff6e3',0,.75,0,s);cy(.455,.12,'#ff5fa2',0,.8,0,s);const t=tor(.26,.07,'#fff6e3',0,.24,0,s);t.rotation.y=Math.PI/2;}
    else if(m==='shutter'){slab('#8a93a8',.2);for(let k=0;k<4;k++)slab('#6f7a94',.24,.06).position.y=.4+k*.5;}
    else if(m==='sponge'){bx(.96,h,.96,'#ffd23f',0,h/2,0,s);for(let k=0;k<7;k++)bl(.09,.09,.09,'#d9a520',((k*37)%7-3)*.12,.3+((k*53)%9)*.2,.47*(k%2?1:-1),s);}
    else if(m==='rail'){cy(.05,h,'#c9a24a',horiz?-.45:0,h/2,horiz?0:-.45,s);cy(.05,h,'#c9a24a',horiz?.45:0,h/2,horiz?0:.45,s);slab('#8a2f3f',.07,.08).position.y=h-.06;}
    else if(m==='tape'){cy(.05,h,'#2b1b2e',-.45,h/2,0,s);cy(.05,h,'#2b1b2e',.45,h/2,0,s);bx(1,.12,.03,'#ffd23f',0,h-.1,0,s);for(let k=0;k<3;k++)bx(.12,.12,.035,'#2b1b2e',-.33+k*.33,h-.1,0,s);}
    else if(m==='panel'){slab('#f3ead2',.1);const p=horiz?bx(.6,.08,.12,'#ef5d50',0,h*.7,0,s):bx(.12,.08,.6,'#ef5d50',0,h*.7,0,s);p.castShadow=false;slab('#c9a24a',.16,.1);}
    else if(m==='shydoor'){slab('#e98fb0',.18);[-1,1].forEach(function(sg){const b=horiz?bl(.1,.07,.02,'#ef5d50',sg*.24,h*.5,.1,s):bl(.02,.07,.1,'#ef5d50',-.1,h*.5,sg*.24,s);b.castShadow=false;
      const ey=horiz?bx(.1,.025,.02,'#2b1b2e',sg*.2,h*.62,.1,s):bx(.02,.025,.1,'#2b1b2e',-.1,h*.62,sg*.2,s);ey.castShadow=false;});}
    else if(m==='stall'){bx(.96,.7,.9,'#b98250',0,.35,0,s);bx(1.02,.1,1.0,i%2?'#ef5d50':'#fff6e3',0,h+.5,0,s);bx(1.02,.1,1.0,i%2?'#fff6e3':'#ef5d50',0,h+.62,0,s).scale.x=.6;cy(.04,h+.5,'#7a4a2b',-.44,(h+.5)/2,-.4,s);cy(.04,h+.5,'#7a4a2b',.44,(h+.5)/2,-.4,s);bl(.14,.14,.14,'#ff8f5a',-.2,.8,0,s);bl(.14,.14,.14,'#8fc3b4',.2,.8,.1,s);}
    else if(m==='socks'){bx(1,.1,.8,['#ff8fa3','#ffd23f','#8fc3b4'][i%3],0,-.03,0,s);bx(.16,.11,.82,'#ffffff',-.3,-.03,0,s);}
    else if(m==='plank'||m==='bridge'){bx(.96,.08,.96,'#b98250',0,-.03,0,s);bx(.96,.09,.1,'#7a4a2b',0,-.03,.3,s);bx(.96,.09,.1,'#7a4a2b',0,-.03,-.3,s);}
    else if(m==='spoon'){bx(1,.08,.5,'#dfe6ec',0,-.02,0,s);if(i===e.tiles.length-1)bl(.5,.1,.42,'#eef3f7',.3,0,0,s);}
    else if(m==='gate'){slab('#6f7a94',.3);slab('#ffd23f',.34,.16).position.y=h*.5;}
    else slab('#7a4a2b',.16);
  });
};
EB.exit=function(e){
  const g=e.g=gp(e.x,0,e.y);
  e.ring=flat(GEO.ring,basic('#8fe3b4',.8),0,.04,0,g);e.ring.scale.set(.7,.7,1);
  e.beam=new T3.Mesh(new T3.CylinderGeometry(.5,.6,3,14,1,true),basic('#8fe3b4',.12,true));e.beam.position.y=1.5;g.add(e.beam);
};
EB.bell=function(e){const g=e.g=gp(e.x,0,e.y);cn(.09,.14,'#ffd23f',0,.1,0,g);bl(.035,.035,.035,'#c9a24a',0,.03,0,g);};
EB.door=function(e){
  const g=e.g=gp(e.x,0,e.y);g.rotation.y=e.ry||0;
  bx(.08,1.0,1.0,'#7a4a2b',0,.5,0,g).castShadow=false;bx(.1,.76,.8,'#b98250',.02,.42,0,g).castShadow=false;bx(.08,.3,.9,'#2f5fd0',.01,1.2,0,g).castShadow=false;
  e.bulbM=new T3.MeshBasicMaterial({color:'#5a3d24'});add(GEO.ico,e.bulbM,.1,.1,.1,.08,1.55,0,g).castShadow=false;
};
EB.chute=function(e){
  const g=e.g=gp(e.x,0,e.y);const a=Math.atan2(e.to[1]-e.y,e.to[0]-e.x);g.rotation.y=-a;
  bx(1.6,.06,.7,'#7fd0e6',.9,.05,0,g);bx(1.6,.14,.06,'#3fa9e0',.9,.1,.36,g);bx(1.6,.14,.06,'#3fa9e0',.9,.1,-.36,g);
};

/* ---------- 物件：每幀同步 ---------- */
ES.box=function(e,L,P){
  const inside=P.hidden===e&&PH.S.mode!=='cut';e.peek.visible=inside;
  const lift=inside?P.lift:0;e.lids.forEach(function(l){l.rotation.x=l.userData.s*(-.2-lift*1.1)*(inside?1:.15);});
  if(e.ring){e.ring.visible=P.hasCan;e.ring.scale.setScalar(.85+Math.sin(G.t*4)*.06);}
  e.g.rotation.y=inside?-PH.S.yaw+Math.PI/2:0;
};
ES.anchor=function(e,L,P,t){
  const SM=PH.Seams,s=SM.seam,isEnd=!!s&&(s.a===e||s.b===e);
  e.g.position.set(e.x,0,e.y);
  e.g.visible=!!e.found&&!(e.off&&L.f[e.off]);if(!e.g.visible)return;
  const bad=!!e.sealUntil||!!e.wipedUntil||!W.anchorOn(e);
  e.mat.color.set(isEnd?'#7fd0e6':bad?'#77778a':'#fbeed6');
  e.glyph.position.y=.5+Math.sin(t*2+e.x)*.04;e.glyph.rotation.y=t*.8;
  e.gr.material.opacity=bad?.2:.45+Math.sin(t*3)*.15;e.gr.material.color.set(e.wipedUntil?'#3fa9e0':'#7fd0e6');
  e.portal.visible=e.pin.visible=isEnd;
  if(isEnd){
    const k=s.state==='build'?s.t/PH.CFG.seam.build:1,pul=1+Math.sin(t*9)*.05,fade=Math.min(1,s.life/2);
    e.portal.rotation.y=e.pin.rotation.y=-PH.S.yaw+Math.PI/2;
    e.portal.scale.set(.36*k*pul,.62*k,1);e.pin.scale.set(.08*k,.56*k,1);e.portal.material.opacity=.3+.35*fade;
  }
  e.tape.visible=e.sealing>0||!!e.sealUntil;if(e.tape.visible)e.tape.scale.setScalar(e.sealUntil?1:Math.max(.1,e.sealing));
};
ES.ped=function(e,L,P,t){
  e.can.visible=!e.taken;e.halo.visible=!e.taken;e.can.rotation.y=t*.8;
  e.dome.visible=!e.taken&&((!!e.need&&!L.f[e.need])||(!!e.tickets&&P.tickets<e.tickets));
};
ES.sw=function(e,L,P,t){
  const vis=!(e.show&&!L.f[e.show])&&!(e.done&&(e.model==='oldcan'));e.g.visible=vis;if(!vis)return;
  const ready=(!e.done||e.repeat)&&(!e.need||L.f[e.need]),holding=P.holdId==='sw'+e.id&&P.holdT>0;
  e.gl.visible=ready;if(ready)e.gl.scale.setScalar(.5+Math.sin(t*5)*.06);
  if(!e.arm)return;
  const m=e.model||'lever';
  if(m==='lever')e.arm.rotation.z=e.done?1.0:holding?-.5+P.holdT*1.6:-.5;
  else if(m==='crank'){if(holding||L.f[e.flag])e.arm.rotation.z=holding?t*8:.6;}
  else if(m==='gear')e.arm.rotation.z=e.done?t*1.5:holding?t*4:.3;
  else if(m==='valve')e.arm.rotation.z=holding?t*6:0;
  else if(m==='button')e.arm.position.y=holding||e.done?.2:.24;
};
ES.push=function(e){e.g.position.set(e.px,0,e.py);if(e.anim>0)e.g.rotation.z=Math.sin(G.t*30)*.02;else e.g.rotation.z=0;};
ES.plate=function(e,L){const vis=!e.need||!!L.f[e.need];e.g.visible=vis;e.disc.position.y=e.done?.0:.04;e.rg.visible=!e.done;if(!e.done)e.rg.material.opacity=.4+Math.sin(G.t*4)*.2;};
ES.pipe=function(e,L){e.g.visible=!(e.show&&!L.f[e.show]);};
ES.towel=function(e){
  e.rg.visible=!e.used;
  if(e.used){e.tw.visible=false;return;}
  if(e.fall>0){const k=1-e.fall/.45;e.tw.position.set(U.lerp(e.x,e.dx,k),U.lerp(1.2,.6,k),U.lerp(e.y,e.dy,k));e.tw.rotation.x=k*1.5;}
  else{e.tw.position.set(e.x,1.2,e.y);e.tw.rotation.x=0;}
};
ES.toy=function(e){e.g.position.set(e.x,0,e.y);if(e.rolling)e.g.rotation.z-=.3;};
ES.knock=function(e){
  if(!e.used){e.g.position.set(e.x,1.05,e.y);e.g.rotation.z=0;return;}
  const k=e.fall>0?1-e.fall/.45:1;e.g.position.set(U.lerp(e.x,e.fx,k),U.lerp(1.05,.02,k*k),U.lerp(e.y,e.fy,k));e.g.rotation.z=k*1.5;
};
ES.item=function(e,L,P,t){
  e.g.visible=!e.taken;if(e.taken)return;
  if(e.gk!==e.kind){e.g.remove(e.gm);const cur=G.cur;G.cur=e.g;itemModel(e);G.cur=cur;}
  e.gm.position.y=.12+Math.sin(t*2.4+e.x)*.06;e.gm.rotation.y=t*1.2;
};
ES.light=function(e){
  e.disc.visible=e.col.visible=e.active;e.head.visible=e.active||e.warn&&Math.sin(G.t*20)>0;
  if(e.active){e.disc.position.set(e.sx,.04,e.sy);e.col.position.set(e.sx,1.35,e.sy);}
};
ES.mover=function(e){e.g.visible=!!e.present;e.g.position.set(e.x,e.model==='bus'?0:-.03+Math.sin(G.t*2+e.x)*.012,e.y);if(e.model==='bus'&&e.dx)e.g.rotation.y=e.dx>0?0:Math.PI;};
ES.wind=function(e,L,P,t){
  e.pad.material.opacity=e.blow?.9:e.warn?(.4+Math.sin(t*14)*.3):.25;
  e.bub.forEach(function(m,i){
    m.visible=e.blow;if(!e.blow)return;
    const k=((t*.5+i*.25)%1);m.position.set(U.lerp(e.from[0],e.to[0],k),.5+Math.sin(k*Math.PI)*1.2,U.lerp(e.from[1],e.to[1],k));const s=.22+i*.04;m.scale.set(s,s,s);
  });
};
ES.plant=function(e,L,P,t){const ins=P.hidden===e;e.eyes.visible=ins;e.lv.rotation.z=ins?Math.sin(t*3)*.05:0;};
ES.gate=function(e,L,P,t,dt){
  const tg=e.closed?0:1,h=e.h==null?1.4:e.h;
  e.ak+=U.clamp(tg-e.ak,-dt*2.2,dt*2.2);
  if(e.haz){e.g.position.y=-(1-e.ak)*.7;e.g.visible=e.ak>.02;}          // 橋：開啟時浮上來
  else{e.g.position.y=-e.ak*(h+1.4);e.g.visible=e.ak<.98&&!(e.warn&&Math.sin(t*22)>0.3);}   // 門：開啟時沉下去；快關上前會閃
};
ES.exit=function(e,L,P,t){
  const on=PH.S.practice&&(!e.need||!!L.f[e.need]);e.g.visible=PH.S.practice;
  e.ring.material.color.set(on?'#8fe3b4':'#888');e.beam.visible=on;e.ring.scale.setScalar(.7+Math.sin(t*4)*.05);
};
ES.door=function(e){e.bulbM.color.set(e.openT>0&&Math.sin(G.t*18)>0?'#ef5d50':'#5a3d24');};

/* ---------- 建立整個世界 ---------- */
G.buildWorld=function(L){
  for(const e of L.ents){const f=EB[e.t];if(f)f(e,L);}
  G.cat=makeCat(L);G.catS=1;
  G.dogm=L.dogs.map(function(d){const m=makeDog(d.kind);m.cone=makeCone();return m;});
  G.dropcan=makeCan(null,CANCOL[L.id]);
  G.decoy=gp();bl(.2,.16,.16,'#b9a08a',0,.18,0,G.decoy);bl(.12,.11,.12,'#b9a08a',.2,.3,0,G.decoy);[-1,1].forEach(function(s){cn(.05,.1,'#b9a08a',.2,.42,s*.07,G.decoy);});
  G.lure=gp();bl(.2,.05,.08,'#b9773c',0,.06,0,G.lure);
  G.aim=flat(GEO.ring,basic('#ffd23f',.9),0,.06,0);G.aimDot=flat(GEO.circ,basic('#ffd23f',.5),0,.055,0);G.aimDot.scale.set(.25,.25,1);
  // 特效池
  G.pool={parts:[],rings:[]};
  for(let i=0;i<70;i++){const m=new T3.Mesh(GEO.ico,new T3.MeshBasicMaterial({color:'#ffffff'}));m.visible=false;G.cur.add(m);G.pool.parts.push(m);}
  for(let i=0;i<10;i++){const m=flat(GEO.ring,basic('#ffffff',.6),0,.06,0);m.visible=false;G.pool.rings.push(m);}
  // BOSS 場地
  G.boss=null;
  if(L.def.boss){
    const C=L.def.boss;
    G.boss=G.makeBoss();G.boss.g.visible=false;G.tele=makeTele();
    G.plate=gp(C.plate[0],0,C.plate[1]);cy(.12,.3,'#5a6a8a',0,.15,0,G.plate);
    G.plateM=gp(0,.3,0,G.plate);add(GEO.box,M('#dff6ff',{emissive:'#bfe0ff',emissiveIntensity:.4,roughness:.1}),.14,1.8,2.2,0,.9,0,G.plateM);bx(.18,.12,2.3,'#ffd23f',0,1.84,0,G.plateM);bx(.18,.12,2.3,'#ffd23f',0,.02,0,G.plateM);
    const rr=flat(GEO.ring,basic('#8fe3b4',.6),C.rest[0],.03,C.rest[1]);rr.scale.set(C.rest[2],C.rest[2],1);
    const rd=flat(GEO.circ,basic('#8fe3b4',.14),C.rest[0],.025,C.rest[1]);rd.scale.set(C.rest[2],C.rest[2],1);
    G.locks=[-1,0,1].map(function(i){const m=add(GEO.box,new T3.MeshStandardMaterial({color:'#ef5d50',emissive:'#ef5d50',emissiveIntensity:.5,flatShading:true}),.34,.4,.2,15.5+i*.7,2.0,4.5);m.castShadow=false;return m;});
    G.frostBeam=null;
  }
};

/* ---------- 每幀同步角色 ---------- */
function syncCat(L,P,t,dt){
  const c=G.cat,S=PH.S,F=PH.FORMS[P.form];
  let vis=!P.hidden&&!P.pipe&&S.mode!=='title'&&S.mode!=='ending';
  if(P.grace>0&&S.mode==='play'&&Math.sin(t*26)>.4)vis=false;
  if(S.mode==='cut'&&G.cutCat)vis=true;
  c.g.visible=vis;if(!vis)return;
  c.g.position.set(P.x,(P.fz||0),P.y);c.g.rotation.y=-P.face;
  const big=P.form==='mini'||P.form==='giant'||P.form==='normal';
  G.catS+=((big?F.scale:1)-G.catS)*Math.min(1,dt*9);
  let sq=1;if(P.warp){const w=P.warp;sq=w.t<.32?Math.max(.05,1-w.t/.32):Math.min(1,(w.t-.32)/.3);}
  c.norm.visible=big;c.liq.visible=P.form==='liquid';c.shd.visible=P.form==='shadow';
  c.norm.scale.set(G.catS*sq,G.catS*(2-sq),G.catS*sq);
  c.liq.scale.set(sq,1,sq);c.shd.scale.set(sq,1,sq);
  if(P.form==='liquid'){const wv=Math.sin(t*6)*.05;c.puddle.scale.set(.4+wv,.08,.34-wv);}
  const mv=P.moving?1:0,sw=Math.sin(t*(P.form==='mini'?20:P.form==='giant'?9:14))*.6*mv;
  c.legs[0].rotation.z=sw;c.legs[3].rotation.z=sw;c.legs[1].rotation.z=-sw;c.legs[2].rotation.z=-sw;
  c.tail.rotation.z=Math.sin(t*3)*.2+(P.sneak?-.5:0);c.body.position.y=Math.abs(Math.sin(t*14))*.02*mv-(P.sneak?.04:0);
  c.head.rotation.y=-P.lean*.6;c.body.rotation.x=P.lean*.25;
  c.can.visible=P.hasCan;
  if(P.hasCan){const s=big?Math.max(.45,G.catS):1;c.can.scale.setScalar(s);c.can.position.set(-.04*s,big?.46*G.catS:.14,0);}
}
function syncDogs(L,P,t,dt){
  L.dogs.forEach(function(d,i){
    const m=G.dogm[i];if(!m)return;
    m.g.visible=d.active;syncCone(m.cone,d,P);if(!d.active)return;
    const onSoup=W.kind(Math.floor(d.x),Math.floor(d.y))==='hazard';
    m.g.position.set(d.x,onSoup?.05:0,d.y);m.g.rotation.y=-d.ang;
    const sc=(d.K.heavy||d.K.sleeper?1.2:1)*(d.spawnT>0?Math.max(.1,1-d.spawnT/1.3):1);m.g.scale.setScalar(sc);
    const sw=d.moving?Math.sin(t*13+i)*.6:0;
    m.legs[0].rotation.z=sw;m.legs[3].rotation.z=sw;m.legs[1].rotation.z=-sw;m.legs[2].rotation.z=-sw;
    const sleep=d.state==='sleep'||(d.stunT>0&&d.stunKind==='sleepy');
    let by=d.moving?Math.abs(Math.sin(t*13+i))*.03:0,lean=0;
    if(sleep){by=-.2+Math.sin(t*1.6)*.03;lean=-.35;}
    else if(d.state==='pounce'&&d.ph===0){by=-.1;lean=.25;}
    else if(d.state==='bark'){lean=-.3;}
    else if(d.busy){lean=.4;}
    m.body.position.y=by;m.head.rotation.z=lean+(d.state==='look'||d.state==='inv'?Math.sin(t*9)*.08:0);
    m.body.rotation.z=d.stunT>0&&d.stunKind==='slip'?1.3:0;
    m.towel.visible=d.stunT>0&&d.stunKind==='towel';
    m.tape.visible=d.state==='seal';
    m.lid.visible=onSoup;
    if(m.beam)m.beam.visible=!sleep&&d.stunT<=0;
    if(m.mop)m.mop.rotation.y=d.state==='wipe'&&d.busy?Math.sin(t*10)*.5:0;
  });
}
function syncBoss(L,P,t,dt){
  const o=G.boss,B=PH.Boss;if(!o)return;
  o.g.visible=B.active;
  G.plateM.rotation.y=U.lerp(G.plateM.rotation.y,L.f.lever1ready?.9:0,.1);
  G.locks.forEach(function(m,i){const open=B.locks[i];m.material.color.set(open?'#8fe3b4':'#ef5d50');m.material.emissive.set(open?'#8fe3b4':'#ef5d50');m.position.y=2.0+(open?.3:0)+Math.sin(t*2+i)*.03;m.visible=B.active;});
  syncTele(G.tele,L,t);
  if(!B.active)return;
  o.g.position.set(B.x,0,B.y);o.g.rotation.y=-B.ang;
  const st=B.state,walking=st==='walk'||st==='idle'||st==='ring'||st==='dash';
  const sw=walking?Math.sin(t*9)*.4:0;
  o.legs[0].rotation.z=sw;o.legs[3].rotation.z=sw;o.legs[1].rotation.z=-sw;o.legs[2].rotation.z=-sw;
  let by=0,hz=0;
  if(st==='tele'&&B.move==='pounce'){by=-.35;hz=.2;}
  else if(st==='tele'&&B.move==='sniff'){hz=-.5;}
  else if(st==='tele'&&(B.move==='shock'||B.move==='stomp')){by=.25+Math.sin(t*20)*.03;}
  else if(st==='stun'||st==='dizzy'){hz=Math.sin(t*6)*.3;by=-.2;}
  else if(st==='yield'){by=-.45;hz=-.15;}
  o.body.position.y+=(by-o.body.position.y)*.2;o.head.rotation.z=hz;
  o.tail.rotation.z=st==='tele'&&B.move==='tail'?.9:Math.sin(t*3)*.15;o.tail.rotation.y=st==='spin'||st==='ring'?Math.sin(t*10)*.5:0;
  o.fish.visible=!!L.f.fish;o.frost.visible=B.frostT>0;
  o.helm.visible=st!=='yield';o.gun.visible=st==='tele'&&B.move==='tape';
  o.lamp.material.emissiveIntensity=(st==='sweep'||(st==='tele'&&B.move==='sweep'))?2:.4;
}
G.sync=function(L,P,t,dt){
  for(const e of L.ents){const f=ES[e.t];if(f&&e.g)f(e,L,P,t,dt);}
  syncCat(L,P,t,dt);syncDogs(L,P,t,dt);syncBoss(L,P,t,dt);
  G.dropcan.visible=!!L.can;if(L.can){G.dropcan.position.set(L.can.x,Math.abs(Math.sin(t*5))*.03,L.can.y);G.dropcan.rotation.z=L.def.trouble==='walk'?Math.sin(t*8)*.15:0;}
  G.decoy.visible=!!L.decoy;if(L.decoy){G.decoy.position.set(L.decoy.x,0,L.decoy.y);G.decoy.rotation.y=-Math.atan2(L.decoy.vy,L.decoy.vx);}
  G.lure.visible=!!L.lure;if(L.lure)G.lure.position.set(L.lure.x,0,L.lure.y);
  const a=P.aim;G.aim.visible=G.aimDot.visible=!!a;
  if(a){const s=.5+Math.sin(t*8)*.08;G.aim.position.set(a.x,.06,a.y);G.aim.scale.set(s,s,1);G.aimDot.position.set(a.x,.055,a.y);}
};
})();
