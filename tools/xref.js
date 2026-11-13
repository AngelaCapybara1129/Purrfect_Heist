// 靜態交叉檢查：各模組之間呼叫到的函式是否都有定義（不執行遊戲）
const fs=require('fs');
const src=fs.readdirSync('js').map(f=>fs.readFileSync('js/'+f,'utf8')).join('\n');
const alias={World:['W'],Seams:['SM'],Player:['PL'],Dogs:['D'],Boss:['B'],GFX:['G'],UI:['UI'],AU:['AU'],Game:['Game'],FX:[]};
const defs={};
for(const m of Object.keys(alias)){
  defs[m]=new Set();
  for(const n of ['PH.'+m].concat(alias[m])){
    const re=new RegExp('(^|[^A-Za-z0-9_.])'+n.replace('.','[.]')+'[.]([A-Za-z0-9_]+)\s*=\s*function','gm');
    let x;while((x=re.exec(src)))defs[m].add(x[2]);
  }
}
['poof','ring','text','shake','flash'].forEach(k=>defs.FX.add(k));
let bad=0;const seen=new Set();
const re=/PH[.](World|Seams|Player|Dogs|Boss|GFX|UI|AU|Game|FX)[.]([A-Za-z0-9_]+)[(]/g;let x;
while((x=re.exec(src))){const k=x[1]+'.'+x[2];if(seen.has(k))continue;seen.add(k);if(!defs[x[1]].has(x[2])){console.log('未定義？',k);bad++;}}
console.log('檢查 '+seen.size+' 個跨模組呼叫，疑似未定義 '+bad);
