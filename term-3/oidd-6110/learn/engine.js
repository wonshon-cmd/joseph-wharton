/* =====================================================================
   OIDD 6110 study app engine. Content lives in content/*.js (one file
   per module) and is pushed into window.OM. Records are saved under
   localStorage key "oidd6110_learn_v1" (synced by assets/sync.js).
   ===================================================================== */
(function(){
"use strict";
const OM=window.OM, KEY="oidd6110_learn_v1", APP=document.getElementById("app");
const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fmt=(x,d=2)=>{if(x==null||isNaN(x))return"–";if(!isFinite(x))return"∞";const r=Math.round(x*Math.pow(10,d))/Math.pow(10,d);return r.toLocaleString("en-US",{maximumFractionDigits:d});};
const $=s=>APP.querySelector(s);
OM.fmt=fmt;

/* ---------------- records ---------------- */
function load(){let s;try{s=JSON.parse(localStorage.getItem(KEY));}catch(e){}s=s||{};s.mc=s.mc||{};s.sa=s.sa||{};s.drafts=s.drafts||{};s.settings=s.settings||{};return s;}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));}
function rec(id,ok,a){const s=load();(s.mc[id]=s.mc[id]||[]).push({ts:Date.now(),ok:!!ok,a:String(a).slice(0,40)});save(s);}
function hist(id){return load().mc[id]||[];}
function lastOk(id){const h=hist(id);return h.length?h[h.length-1].ok:null;}

/* ---------------- question registry ---------------- */
const REG={};
function regQ(q,where){if(q&&q.id){REG[q.id]=Object.assign({where},q);}}
OM.modules.forEach(m=>{(m.checks||[]).forEach(q=>regQ(q,{mod:m.id,sec:"checks"}));(m.calcs||[]).forEach(q=>regQ(q,{mod:m.id,sec:"calcs"}));});
(OM.cases||[]).forEach(c=>(c.questions||[]).forEach(q=>regQ(q,{cas:c.id})));
Object.keys(OM.hw||{}).forEach(k=>{(OM.hw[k].sets||[]).forEach(st=>(st.qs||[]).forEach(q=>regQ(q,{hw:k})));});
const FIXED=Object.keys(REG);

/* ---------------- question rendering ---------------- */
let qCounter=0;
function histLine(id){const h=hist(id);if(!h.length)return"";const ok=h.filter(x=>x.ok).length;const l=h[h.length-1];return `Tried ${h.length}× · ${ok} right · last: ${l.ok?'<span class="grn">✓ right</span>':'<span class="red">✗ wrong</span>'}`;}
function qHTML(q,label){
  const n=label!=null?label:(++qCounter);
  const head=`<div class="qh"><span class="qn">${n}.</span><div>${q.q}${q.src?` <span class="src">${esc(q.src)}</span>`:""}</div></div>`;
  let body="";
  if(q.type==="num"||q.ans!=null&&!q.opts){
    body=`<div class="calcrow"><input type="text" inputmode="decimal" placeholder="your answer" data-in="${q.id}"><span class="unit">${esc(q.unit||"")}</span>
      <button class="btn small" data-act="check" data-id="${q.id}">Check</button>
      ${q.hint?`<button class="btn small ghost" data-act="hint" data-id="${q.id}">💡 Hint</button>`:""}
      <button class="btn small ghost" data-act="steps" data-id="${q.id}">👣 Show step-by-step</button></div>
      ${q.hint?`<div class="fb" data-hint="${q.id}" style="background:var(--gold-l)">💡 ${q.hint}</div>`:""}
      <div class="fb" data-fb="${q.id}"></div>
      <div class="steps" data-steps="${q.id}"><b>Step-by-step (with the why):</b><ol>${(q.steps||[]).map(s=>`<li>${s}</li>`).join("")}</ol>${q.why?`<div class="callout why"><b>💡 Why this works</b>${q.why}</div>`:""}</div>`;
  }else if(q.multi){
    body=`<div class="opts">${q.opts.map((o,i)=>`<label class="opt" data-ms="${q.id}"><input type="checkbox" value="${i}"> ${o}</label>`).join("")}</div>
      <button class="btn small" data-act="mscheck" data-id="${q.id}">Check</button><div class="fb" data-fb="${q.id}"></div>`;
  }else{
    body=`<div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-act="opt" data-id="${q.id}" data-i="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div><div class="fb" data-fb="${q.id}"></div>`;
  }
  return `<div class="q" id="q-${q.id}">${head}${body}<div class="hist" data-h="${q.id}">${histLine(q.id)}</div></div>`;
}
function parseNum(v){if(v==null)return NaN;v=String(v).replace(/[,$£\s]/g,"").replace(/%$/,"");if(/^-?\d*\.?\d+\/\d*\.?\d+$/.test(v)){const[a,b]=v.split("/");return parseFloat(a)/parseFloat(b);}return parseFloat(v);}
function numOk(q,v){let x=parseNum(v);if(isNaN(x))return null;const a=q.ans;if(q.unit==="%"&&Math.abs(x)<=1.5&&Math.abs(a)>1.5)x*=100;const tol=q.tol!=null?q.tol:Math.max(Math.abs(a)*0.02,0.011);return Math.abs(x-a)<=tol;}
function getQ(id){return REG[id]||GEN[id];}
function refreshHist(id){const el=APP.querySelector(`[data-h="${id}"]`);if(el)el.innerHTML=histLine(id);}

/* ---------------- generators (random-number drills) ---------------- */
const GEN={};
OM.rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
OM.pick=arr=>arr[Math.floor(Math.random()*arr.length)];
function genHTML(name,title){
  const g=OM.gens[name];if(!g)return"";
  const q=g();q.id="gen:"+name;q.type="num";GEN[q.id]=q;
  return `<div class="gen" data-gen="${name}" data-title="${esc(title)}"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><b>🎲 ${esc(title)}</b><button class="btn small gold" data-act="regen" data-gen="${name}">🎲 New numbers</button></div>${qHTML(q,"🎲")}</div>`;
}

/* ---------------- visualizations ---------------- */
const VIZ={};OM.VIZ=VIZ;
const C={navy:"#011f5b",teal:"#0f7b6c",rose:"#c0392b",gold:"#b7791f",blue:"#2a63c7",gray:"#8a877f",green:"#1e8449",purple:"#6b46c1",line:"#d9d6cc"};
function svg(w,h,inner){return `<svg viewBox="0 0 ${w} ${h}" width="${w}" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,Roboto,Arial" >${inner}</svg>`;}
function tx(x,y,t,o={}){return `<text x="${x}" y="${y}" font-size="${o.s||13}" fill="${o.c||'#1b1b1b'}" text-anchor="${o.a||'middle'}" font-weight="${o.w||400}" ${o.extra||''}>${t}</text>`;}
const UNIT_SEC={sec:1,min:60,hr:3600,day:86400};
/* Process flow diagram: boxes = resources, triangles = inventory */
VIZ.flow=function(cfg){
  const st=cfg.steps, tu=cfg.tu||"min", ru=cfg.ru||"hr", conv=UNIT_SEC[ru]/UNIT_SEC[tu];
  st.forEach(s=>{s.m=s.m||1;s.cap=s.cap!=null?s.cap:(s.m/s.p)*conv;});
  let bi=-1;if(cfg.bn!==false){let mn=Infinity;st.forEach((s,i)=>{const key=s.iu!=null?-s.iu:s.cap;if(key<mn){mn=key;bi=i;}});}
  const bw=132,gap=46,W=40+st.length*(bw+gap)+30,H=cfg.demand!=null?205:185;
  let g=`<defs><marker id="ar" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${C.navy}"/></marker></defs>`;
  let x=12;
  st.forEach((s,i)=>{
    const tri=x+4, bx=x+gap;
    // arrow + triangle (buffer)
    g+=`<line x1="${x-6}" y1="80" x2="${tri+2}" y2="80" stroke="${C.navy}" stroke-width="2" marker-end="url(#ar)"/>`;
    g+=`<polygon points="${tri+6},92 ${tri+20},66 ${tri+34},92" fill="#fff3cd" stroke="${C.gold}" stroke-width="2"/>`;
    g+=`<line x1="${tri+36}" y1="80" x2="${bx-2}" y2="80" stroke="${C.navy}" stroke-width="2" marker-end="url(#ar)"/>`;
    const isB=i===bi, fill=isB?"#fdecea":"#eef4ff", stroke=isB?C.rose:C.navy;
    g+=`<rect x="${bx}" y="40" width="${bw}" height="80" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${isB?3:2}"/>`;
    g+=tx(bx+bw/2,60,esc(s.name),{w:700,s:13});
    g+=tx(bx+bw/2,79,s.ptxt||`p = ${fmt(s.p)} ${tu}`,{s:12,c:"#333"});
    g+=tx(bx+bw/2,96,`m = ${s.m}`,{s:12,c:"#333"});
    g+=tx(bx+bw/2,113,s.captxt||`cap = ${fmt(s.cap)}/${ru}`,{s:12,c:isB?C.rose:C.teal,w:700});
    if(s.iu!=null)g+=tx(bx+bw/2,140,`implied util = ${fmt(s.iu*100,0)}%`,{s:12,c:isB?C.rose:"#333",w:700});
    if(isB)g+=tx(bx+bw/2,30,"🔴 BOTTLENECK",{s:12,c:C.rose,w:800});
    x=bx+bw;
  });
  g+=`<line x1="${x}" y1="80" x2="${x+26}" y2="80" stroke="${C.navy}" stroke-width="2" marker-end="url(#ar)"/>`;
  const capP=Math.min(...st.map(s=>s.cap));
  let foot=cfg.foot!=null?cfg.foot:`Process capacity = min of the capacities = <tspan font-weight="800" fill="${C.rose}">${fmt(capP)}/${ru}</tspan>`;
  if(cfg.demand!=null){const fr=Math.min(cfg.demand,capP);foot+=`  ·  Demand = ${fmt(cfg.demand)}/${ru}  →  Flow rate = min(${fmt(cfg.demand)}, ${fmt(capP)}) = <tspan font-weight="800" fill="${C.navy}">${fmt(fr)}/${ru}</tspan>`;}
  if(foot)g+=`<text x="12" y="${H-30}" font-size="13" fill="#333">${foot}</text>`;
  g+=`<text x="12" y="${H-10}" font-size="11.5" fill="${C.gray}">△ triangle = waiting inventory (buffer) · ▭ box = resource (a worker/machine, NOT an activity) · cap = m ÷ p</text>`;
  return svg(Math.max(W,560),H,g);
};
/* generic line chart for build-up diagrams */
VIZ.buildup=function(cfg){
  const pts=cfg.pts, W=cfg.w||640, H=cfg.h||270, L=58, R=20, T=22, B=48;
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
  const x0=cfg.x0!=null?cfg.x0:Math.min(...xs), x1=cfg.x1!=null?cfg.x1:Math.max(...xs);
  const y0=Math.min(0,...ys), y1=Math.max(...ys,cfg.ymax||0)*1.12||1;
  const X=x=>L+(x-x0)/(x1-x0)*(W-L-R), Y=y=>T+(y1-y)/(y1-y0)*(H-T-B);
  let g=`<line x1="${L}" y1="${Y(0)}" x2="${W-R}" y2="${Y(0)}" stroke="#333" stroke-width="1.5"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#333" stroke-width="1.5"/>`;
  const d=pts.map((p,i)=>(i?"L":"M")+X(p[0])+","+Y(p[1])).join(" ");
  g+=`<path d="${d} L${X(pts[pts.length-1][0])},${Y(0)} L${X(pts[0][0])},${Y(0)} Z" fill="${cfg.fill||'rgba(42,99,199,.18)'}"/>`;
  g+=`<path d="${d}" fill="none" stroke="${cfg.color||C.blue}" stroke-width="3"/>`;
  (cfg.xt||[]).forEach(t=>{g+=`<line x1="${X(t[0])}" y1="${Y(0)}" x2="${X(t[0])}" y2="${Y(0)+5}" stroke="#333"/>`+tx(X(t[0]),H-B+18,t[1],{s:12});});
  (cfg.yt||[]).forEach(t=>{g+=`<line x1="${L-5}" y1="${Y(t[0])}" x2="${L}" y2="${Y(t[0])}" stroke="#333"/>`+tx(L-8,Y(t[0])+4,t[1],{s:12,a:"end"});});
  (cfg.marks||[]).forEach(m=>{g+=`<circle cx="${X(m[0])}" cy="${Y(m[1])}" r="5" fill="${m[3]||C.rose}"/>`+tx(X(m[0])+(m[4]||0),Y(m[1])+(m[1]<0?20:-10),m[2],{s:12.5,w:700,c:m[3]||C.rose});});
  (cfg.vlines||[]).forEach(v=>{g+=`<line x1="${X(v[0])}" y1="${T}" x2="${X(v[0])}" y2="${H-B}" stroke="${C.gray}" stroke-dasharray="4 4"/>`+(v[1]?tx(X(v[0]),T+10,v[1],{s:11.5,c:C.gray}):"");});
  if(cfg.xl)g+=tx((L+W-R)/2,H-8,cfg.xl,{s:13,w:700});
  if(cfg.yl)g+=tx(16,(T+H-B)/2,cfg.yl,{s:13,w:700,extra:`transform="rotate(-90 16 ${(T+H-B)/2})"`});
  return svg(W,H,g);
};
/* waiting-time curve: Tq vs utilization */
VIZ.waitcurve=function(cfg){
  const W=600,H=280,L=56,R=20,T=20,B=46,p=cfg.p||1,m=cfg.m||1,cv=cfg.cv!=null?cfg.cv:1,ymax=cfg.ymax||10*p;
  const tq=u=>(p/m)*Math.pow(u,Math.sqrt(2*(m+1))-1)/(1-u)*cv;
  const X=u=>L+u*(W-L-R), Y=y=>T+(1-Math.min(y,ymax)/ymax)*(H-T-B);
  let g=`<line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#333" stroke-width="1.5"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#333" stroke-width="1.5"/>`;
  (cfg.cvs||[cv]).forEach((c,k)=>{let d="";for(let u=0.01;u<0.995;u+=0.005){const y=(p/m)*Math.pow(u,Math.sqrt(2*(m+1))-1)/(1-u)*c;if(y>ymax*1.02)break;d+=(d?"L":"M")+X(u)+","+Y(y);}
    g+=`<path d="${d}" fill="none" stroke="${[C.blue,C.rose,C.teal][k%3]}" stroke-width="3"/>`;if(cfg.cvs)g+=tx(W-R-6,T+16+k*16,`(CVa²+CVp²)/2 = ${c}`,{s:12,a:"end",c:[C.blue,C.rose,C.teal][k%3],w:700});});
  [0.2,0.4,0.6,0.8,1].forEach(u=>{g+=tx(X(u),H-B+18,Math.round(u*100)+"%",{s:12});});
  (cfg.marks||[]).forEach(u=>{const y=tq(u);g+=`<circle cx="${X(u)}" cy="${Y(y)}" r="5" fill="${C.rose}"/>`+tx(X(u)-6,Y(y)-9,`u=${Math.round(u*100)}% → Tq=${fmt(y,1)}`,{s:12,w:700,c:C.rose,a:"end"});});
  g+=tx((L+W-R)/2,H-8,"Utilization u",{s:13,w:700});g+=tx(16,(T+H-B)/2,"Time in queue Tq",{s:13,w:700,extra:`transform="rotate(-90 16 ${(T+H-B)/2})"`});
  return svg(W,H,g);
};
/* efficiency frontier */
VIZ.frontier=function(cfg){
  const W=560,H=330,L=60,R=20,T=24,B=50,X=x=>L+x*(W-L-R),Y=y=>T+(1-y)*(H-T-B);
  let g=`<defs><marker id="ar2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#333"/></marker></defs>`;
  g+=`<line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#333" stroke-width="1.5" marker-end="url(#ar2)"/><line x1="${L}" y1="${H-B}" x2="${L}" y2="${T}" stroke="#333" stroke-width="1.5" marker-end="url(#ar2)"/>`;
  const f=cfg.curve||[[0.08,0.95],[0.35,0.85],[0.6,0.65],[0.8,0.42],[0.95,0.12]];
  let d="M"+f.map(p=>X(p[0])+","+Y(p[1])).join(" L");
  g+=`<path d="${d}" fill="none" stroke="${C.teal}" stroke-width="3"/>`+tx(X(f[1][0])+40,Y(f[1][1])-12,cfg.flabel||"Efficiency frontier",{s:13,w:800,c:C.teal});
  if(cfg.curve2){let d2="M"+cfg.curve2.map(p=>X(p[0])+","+Y(p[1])).join(" L");g+=`<path d="${d2}" fill="none" stroke="${C.purple}" stroke-width="3" stroke-dasharray="7 5"/>`+tx(X(cfg.curve2[1][0])+60,Y(cfg.curve2[1][1])-10,cfg.f2label||"New frontier (innovation)",{s:13,w:800,c:C.purple});}
  (cfg.pts||[]).forEach(p=>{g+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="8" fill="${p.c||C.navy}"/>`+tx(X(p.x)+12,Y(p.y)+5,p.l,{s:13,w:700,a:"start",c:p.c||C.navy});});
  (cfg.arrows||[]).forEach(a=>{g+=`<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(a[2])}" y2="${Y(a[3])}" stroke="${C.rose}" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#ar2)"/>`;});
  g+=tx((L+W-R)/2,H-14,cfg.xl||"Efficiency / labor productivity (low cost) →",{s:13,w:700});
  g+=tx(18,(T+H-B)/2,cfg.yl||"Quality / responsiveness (WTP) →",{s:13,w:700,extra:`transform="rotate(-90 18 ${(T+H-B)/2})"`});
  return svg(W,H,g);
};
/* waterfall (OEE, attrition) */
VIZ.waterfall=function(cfg){
  const bars=cfg.bars,W=Math.max(560,bars.length*92+70),H=300,L=50,T=26,B=64,bw=Math.min(64,(W-L-20)/bars.length-18);
  const max=cfg.max||Math.max(...bars.map(b=>b.v));const Y=v=>T+(1-v/max)*(H-T-B);
  let g=`<line x1="${L}" y1="${H-B}" x2="${W-10}" y2="${H-B}" stroke="#333"/>`;let level=0;
  bars.forEach((b,i)=>{const x=L+14+i*((W-L-20)/bars.length);let top,bot,col;
    if(b.type==="loss"){top=level;bot=level-b.v;level=bot;col=C.rose;}else{top=b.v;bot=0;level=b.v;col=b.type==="end"?C.green:C.navy;}
    g+=`<rect x="${x}" y="${Y(top)}" width="${bw}" height="${Math.max(1,Y(bot)-Y(top))}" fill="${col}" opacity="${b.type==="loss"?.8:1}" rx="3"/>`;
    g+=tx(x+bw/2,Y(top)-6,(b.type==="loss"?"−":"")+fmt(b.v,1)+(cfg.unit||""),{s:12.5,w:800,c:col});
    String(b.l).split("|").forEach((ln,k)=>{g+=tx(x+bw/2,H-B+16+k*14,ln,{s:11.5});});
  });
  return svg(W,H,g);
};
/* staggered Gantt: empty system */
VIZ.gantt=function(cfg){
  const p=cfg.p,n=cfg.n||4,ct=Math.max(...p),lc=p.reduce((a,b)=>a+b,0),tot=lc+(n-1)*ct;
  const W=640,H=60+p.length*34+40,L=86,R=16,X=t=>L+t/tot*(W-L-R);
  let g="";const cols=[C.blue,C.teal,C.gold,C.purple,C.rose,C.green];
  const fin=p.map(()=>[]);
  p.forEach((pi,j)=>{g+=tx(L-8,52+j*34,cfg.names?cfg.names[j]:`Worker ${j+1}`,{s:12,a:"end",w:700});
    for(let u=0;u<n;u++){
      // a unit starts at worker j once worker j-1 finished it AND worker j finished the previous unit
      const start=Math.max(j?fin[j-1][u]:0,u?fin[j][u-1]:0);fin[j][u]=start+pi;
      g+=`<rect x="${X(start)}" y="${36+j*34}" width="${Math.max(2,X(start+pi)-X(start))}" height="24" rx="4" fill="${cols[u%cols.length]}" opacity=".85"/>`+tx((X(start)+X(start+pi))/2,52+j*34,"#"+(u+1),{s:11,c:"#fff",w:800});}});
  const yb=40+p.length*34;g+=`<line x1="${L}" y1="${yb}" x2="${W-R}" y2="${yb}" stroke="#333"/>`;
  g+=`<line x1="${X(lc)}" y1="28" x2="${X(lc)}" y2="${yb+4}" stroke="${C.rose}" stroke-dasharray="4 3"/>`+tx(X(lc),22,`unit 1 done at ${fmt(lc)} (= labor content)`,{s:11.5,c:C.rose,w:700});
  g+=tx(X(tot),yb+18,`unit ${n} done at ${fmt(lc)} + ${n-1}×${fmt(ct)} = ${fmt(tot)}`,{s:11.5,w:800,a:"end",c:C.navy});
  return svg(W,H+6,g);
};
/* line-balance bars vs takt */
VIZ.balance=function(cfg){
  const st=cfg.st,W=Math.max(520,st.length*74+80),H=260,L=46,T=20,B=46;const max=Math.max(cfg.takt||0,...st.map(s=>s.p))*1.15;const Y=v=>T+(1-v/max)*(H-T-B);const bw=Math.min(54,(W-L-20)/st.length-16);
  let g=`<line x1="${L}" y1="${H-B}" x2="${W-10}" y2="${H-B}" stroke="#333"/>`;const ct=Math.max(...st.map(s=>s.p));
  st.forEach((s,i)=>{const x=L+12+i*((W-L-20)/st.length);g+=`<rect x="${x}" y="${Y(ct)}" width="${bw}" height="${Y(s.p)-Y(ct)}" fill="#f1efe9" stroke="${C.gray}" stroke-dasharray="3 3"/>`;
    g+=`<rect x="${x}" y="${Y(s.p)}" width="${bw}" height="${Y(0)-Y(s.p)}" fill="${s.p===ct?C.rose:C.blue}" rx="3"/>`+tx(x+bw/2,Y(s.p)-5,fmt(s.p),{s:12,w:800});
    if(ct-s.p>max*0.06)g+=tx(x+bw/2,Y((ct+s.p)/2)+4,"idle "+fmt(ct-s.p),{s:10.5,c:C.gray});g+=tx(x+bw/2,H-B+16,s.name,{s:11.5});});
  if(cfg.takt){g+=`<line x1="${L}" y1="${Y(cfg.takt)}" x2="${W-10}" y2="${Y(cfg.takt)}" stroke="${C.green}" stroke-width="2.5" stroke-dasharray="7 4"/>`+tx(W-12,Y(cfg.takt)-6,`takt = ${fmt(cfg.takt)}`,{s:12,a:"end",w:800,c:C.green});}
  g+=tx(L,H-8,"Bar = processing time per worker · grey dashed = idle time per cycle · tallest bar (red) = bottleneck = cycle time",{s:11.5,a:"start",c:C.gray});
  return svg(W,H,g);
};
/* Little's law picture */
VIZ.little=function(cfg){const W=600,H=170;let g=`<defs><marker id="ar3" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${C.navy}"/></marker></defs>`;
  g+=`<line x1="20" y1="80" x2="170" y2="80" stroke="${C.navy}" stroke-width="3" marker-end="url(#ar3)"/>`+tx(95,68,cfg.r||"Flow rate R (in)",{s:13,w:700,c:C.blue});
  g+=`<rect x="180" y="30" width="240" height="100" rx="12" fill="#eef4ff" stroke="${C.navy}" stroke-width="2"/>`;for(let i=0;i<10;i++)g+=`<circle cx="${205+(i%5)*46}" cy="${62+Math.floor(i/5)*36}" r="11" fill="${C.teal}" opacity=".8"/>`;
  g+=tx(300,150,cfg.i||"Inventory I = units inside right now",{s:13,w:700,c:C.teal});
  g+=`<line x1="430" y1="80" x2="580" y2="80" stroke="${C.navy}" stroke-width="3" marker-end="url(#ar3)"/>`+tx(505,68,cfg.o||"Flow rate R (out)",{s:13,w:700,c:C.blue});
  g+=`<line x1="180" y1="18" x2="420" y2="18" stroke="${C.rose}" stroke-width="2" marker-end="url(#ar3)"/>`+tx(300,12,cfg.t||"Flow time T = how long one unit stays inside",{s:12.5,w:700,c:C.rose});
  return svg(W,H+4,g);};
/* simple bar chart */
VIZ.bars=function(cfg){const b=cfg.bars,W=Math.max(520,b.length*60+60),H=250,L=46,T=20,B=50;const max=cfg.max||Math.max(...b.map(x=>x.v))*1.15;const Y=v=>T+(1-v/max)*(H-T-B);const bw=Math.min(46,(W-L-20)/b.length-10);
  let g=`<line x1="${L}" y1="${H-B}" x2="${W-10}" y2="${H-B}" stroke="#333"/>`;
  b.forEach((x,i)=>{const xx=L+8+i*((W-L-20)/b.length);g+=`<rect x="${xx}" y="${Y(x.v)}" width="${bw}" height="${Y(0)-Y(x.v)}" fill="${x.c||(cfg.hi&&cfg.hi(x)?C.rose:C.blue)}" rx="3"/>`+tx(xx+bw/2,Y(x.v)-5,x.t!=null?x.t:fmt(x.v,1),{s:11,w:700});String(x.l).split("|").forEach((ln,k)=>{g+=tx(xx+bw/2,H-B+15+k*13,ln,{s:10.5});});});
  if(cfg.line!=null){g+=`<line x1="${L}" y1="${Y(cfg.line)}" x2="${W-10}" y2="${Y(cfg.line)}" stroke="${C.green}" stroke-width="2" stroke-dasharray="6 4"/>`+tx(W-12,Y(cfg.line)-5,cfg.linel||"",{s:12,a:"end",w:800,c:C.green});}
  if(cfg.yl)g+=tx(14,(T+H-B)/2,cfg.yl,{s:12,w:700,extra:`transform="rotate(-90 14 ${(T+H-B)/2})"`});
  return svg(W,H,g);};
/* normal curve with spec limits (quality) */
VIZ.normal=function(cfg){const W=600,H=240,L=20,R=20,T=20,B=40,mu=cfg.mu,sd=cfg.sd,lo=cfg.lsl,hi=cfg.usl,x0=Math.min(lo,mu-4*sd)-sd*0.5,x1=Math.max(hi,mu+4*sd)+sd*0.5;
  const X=x=>L+(x-x0)/(x1-x0)*(W-L-R),pdf=x=>Math.exp(-0.5*Math.pow((x-mu)/sd,2));const Y=y=>T+(1-y)*(H-T-B);
  let d="",dl="",dr="";for(let i=0;i<=300;i++){const x=x0+(x1-x0)*i/300;d+=(i?"L":"M")+X(x)+","+Y(pdf(x));}
  let g=`<path d="${d}" fill="rgba(42,99,199,.15)" stroke="${C.blue}" stroke-width="3"/>`;
  [lo,hi].forEach((v,k)=>{g+=`<line x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${H-B}" stroke="${C.rose}" stroke-width="2.5"/>`+tx(X(v),T+12,k?"USL "+v:"LSL "+v,{s:12,w:800,c:C.rose});});
  g+=`<line x1="${X(mu)}" y1="${Y(1)}" x2="${X(mu)}" y2="${H-B}" stroke="${C.navy}" stroke-dasharray="4 3"/>`+tx(X(mu),H-B+16,"mean "+mu,{s:12,w:700});
  g+=`<line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#333"/>`;if(cfg.label)g+=tx(W/2,H-6,cfg.label,{s:12.5,w:700,c:C.navy});return svg(W,H,g);};

/* ---------------- interactive calculators ---------------- */
const TOOLS={};OM.TOOLS=TOOLS;
TOOLS.process={title:"🏭 Process calculator (bottleneck, flow rate, utilization, cycle time, labor)",html(){return `
  <p class="sub" style="margin:0 0 8px">Type the processing time of each <b>resource</b> (worker or team), how many people work there (m), demand and wage. Everything recalculates instantly. Change one number at a time and <u>watch what moves</u>; that's how the intuition is built.</p>
  <div><label>Time unit <select data-t="tu"><option>sec</option><option selected>min</option></select></label>
  <label>Demand / hr <input data-t="dem" value="50"></label><label>Wage $/hr per worker <input data-t="wage" value="15"></label><label>Units starting empty (X) <input data-t="x" value="10"></label></div>
  <table class="t" style="max-width:520px"><tr><th>Resource</th><th>p (time/unit)</th><th>m (workers)</th></tr>
  ${[["LTV",1,1],["Front+Back",2,1],["Word count",3,1],["Underwrite",0.5,1],["",0,1],["",0,1]].map((r,i)=>`<tr><td><input data-t="n${i}" value="${r[0]}" style="width:120px"></td><td><input data-t="p${i}" value="${r[1]||""}"></td><td><input data-t="m${i}" value="${r[2]}"></td></tr>`).join("")}</table>
  <div class="out" data-t="out"></div>`;},
 run(root){const v=k=>root.querySelector(`[data-t="${k}"]`).value;const tu=v("tu"),conv=3600/UNIT_SEC[tu];const st=[];for(let i=0;i<6;i++){const p=parseNum(v("p"+i)),m=parseNum(v("m"+i))||1;if(p>0)st.push({name:v("n"+i)||("R"+(i+1)),p,m});}
  if(!st.length){root.querySelector('[data-t="out"]').innerHTML="";return;}
  const dem=parseNum(v("dem")),wage=parseNum(v("wage"))||0,X=parseNum(v("x"))||1;st.forEach(s=>s.cap=s.m/s.p*conv);const cap=Math.min(...st.map(s=>s.cap));const fr=isNaN(dem)?cap:Math.min(dem,cap);
  const ct=conv/fr; /* time units per unit */ const lc=st.reduce((a,s)=>a+s.p,0);const N=st.reduce((a,s)=>a+s.m,0);const alu=lc/(ct*N);const cdl=wage*N/fr;
  const takt=isNaN(dem)?NaN:conv/dem;const tm=lc/takt;const empty=lc+(X-1)*(conv/cap);
  root.querySelector('[data-t="out"]').innerHTML=`<div class="viz">${VIZ.flow({steps:st.map(s=>Object.assign({},s)),tu,ru:"hr",demand:isNaN(dem)?null:dem})}</div>
  <table class="t"><tr><th>Resource</th><th>Capacity = m/p</th><th>Utilization = flow rate / capacity</th><th>Idle time per cycle (per worker)</th></tr>${st.map(s=>`<tr class="${s.cap===cap?'bn':''}"><td>${esc(s.name)}</td><td>${fmt(s.cap)}/hr</td><td>${fmt(fr/s.cap*100,1)}%</td><td>${fmt(ct*s.m-s.p)} ${tu}</td></tr>`).join("")}</table>
  <div><span class="kpi">Process capacity<b>${fmt(cap)}/hr</b></span><span class="kpi">Flow rate<b>${fmt(fr)}/hr</b></span><span class="kpi">${fr<cap?"Demand-constrained":"Capacity-constrained"}<b>${fr<cap?"demand < capacity":"bottleneck at 100%"}</b></span><span class="kpi">Cycle time = 1/flow rate<b>${fmt(ct)} ${tu}</b></span><span class="kpi">Labor content<b>${fmt(lc)} ${tu}</b></span><span class="kpi">Avg labor utilization<b>${fmt(alu*100,1)}%</b></span><span class="kpi">Cost of direct labor<b>$${fmt(cdl)}/unit</b></span>${isNaN(takt)?"":`<span class="kpi">Takt time (for this demand)<b>${fmt(takt)} ${tu}</b></span><span class="kpi">Target manpower<b>${fmt(tm)} → ${Math.ceil(tm-1e-9)} people</b></span>`}<span class="kpi">Time for ${X} units from empty<b>${fmt(empty)} ${tu}</b></span></div>`;}};
TOOLS.wait={title:"⏳ Waiting-time calculator (single or m servers)",html(){return `<p class="sub" style="margin:0 0 8px">a = average time <b>between</b> arrivals, p = average processing time, m = number of servers. All times in the same unit.</p>
  <label>a <input data-t="a" value="2"></label><label>st.dev of a <input data-t="sa" value="2"></label><label>p <input data-t="p" value="4"></label><label>st.dev of p <input data-t="sp" value="2"></label><label>m <input data-t="m" value="3"></label><div class="out" data-t="out"></div>`;},
 run(root){const v=k=>parseNum(root.querySelector(`[data-t="${k}"]`).value);const a=v("a"),p=v("p"),m=Math.max(1,Math.round(v("m")||1)),cva=v("sa")/a,cvp=v("sp")/p;const u=p/(a*m);let out;
  if(!(a>0&&p>0)){out="";}else if(u>=1){out=`<div class="callout trap"><b>u = ${fmt(u*100,1)}% ≥ 100%</b>Demand is larger than capacity: the formula does not apply. The queue just keeps growing (a <u>transient queue</u>) until demand drops. Use the triangle / build-up method instead.</div>`;}
  else{const f1=p/m,f2=Math.pow(u,Math.sqrt(2*(m+1))-1)/(1-u),f3=(cva*cva+cvp*cvp)/2,Tq=f1*f2*f3,T=Tq+p,R=1/a;
   out=`<div class="formula"><span class="eq">Tq = (p/m) × u<sup>√(2(m+1))−1</sup>/(1−u) × (CVa²+CVp²)/2</span><br>= <span class="blu">${fmt(f1,3)}</span> × <span class="red">${fmt(f2,3)}</span> × <span class="pur">${fmt(f3,3)}</span> = <b>${fmt(Tq,3)}</b></div>
   <div><span class="kpi">u = p/(a·m)<b>${fmt(u*100,1)}%</b></span><span class="kpi">CVa = sd/mean<b>${fmt(cva,2)}</b></span><span class="kpi">CVp<b>${fmt(cvp,2)}</b></span><span class="kpi">Time in queue Tq<b>${fmt(Tq,2)}</b></span><span class="kpi">Flow time T = Tq + p<b>${fmt(T,2)}</b></span><span class="kpi">Iq = R × Tq (in line)<b>${fmt(R*Tq,2)}</b></span><span class="kpi">Ip = R × p (in service)<b>${fmt(R*p,2)}</b></span><span class="kpi">I = R × T (total)<b>${fmt(R*T,2)}</b></span></div>
   <div class="viz">${VIZ.waitcurve({p,m,cv:f3,marks:[u],ymax:Math.max(Tq*2.2,p*2)})}<div class="cap">Your point on the curve. Notice how steeply it rises near 100%.</div></div>`;}
  root.querySelector('[data-t="out"]').innerHTML=out;}};
TOOLS.little={title:"💧 Little's Law + inventory turns calculator",html(){return `<p class="sub" style="margin:0 0 8px">Fill any <b>two</b> of I, R, T (same time unit!) and leave one blank. Below: turns from financials.</p>
  <label>I (inventory) <input data-t="i" value="391"></label><label>R (flow rate per year) <input data-t="r" value="20000"></label><label>T (flow time, years) <input data-t="tt" value=""></label>
  <div style="margin-top:8px"><label>COGS / yr <input data-t="cogs" value="1000"></label><label>Avg inventory <input data-t="inv" value="250"></label><label>Annual holding cost % <input data-t="h" value="30"></label><label>Item cost $ <input data-t="c" value="60"></label></div><div class="out" data-t="out"></div>`;},
 run(root){const v=k=>parseNum(root.querySelector(`[data-t="${k}"]`).value);let I=v("i"),R=v("r"),T=v("tt");let msg="";
  if(isNaN(T)&&I>=0&&R>0){T=I/R;msg=`T = I / R = ${fmt(I)} / ${fmt(R)} = <b>${fmt(T,4)}</b> (× 365 = ${fmt(T*365,1)} days)`;}
  else if(isNaN(I)&&R>0&&T>=0){I=R*T;msg=`I = R × T = ${fmt(R)} × ${fmt(T)} = <b>${fmt(I)}</b>`;}
  else if(isNaN(R)&&I>=0&&T>0){R=I/T;msg=`R = I / T = ${fmt(I)} / ${fmt(T)} = <b>${fmt(R)}</b>`;}else msg="Leave exactly one of I, R, T blank.";
  const cogs=v("cogs"),inv=v("inv"),h=v("h"),c=v("c");const turns=cogs/inv,dos=inv/cogs*365,pu=h/turns;
  root.querySelector('[data-t="out"]').innerHTML=`<div class="formula">${msg}</div><div><span class="kpi">Inventory turns = COGS / Inventory<b>${fmt(turns,2)} per yr</b></span><span class="kpi">Days of supply = Inv/COGS × 365<b>${fmt(dos,1)} days</b></span><span class="kpi">Per-unit inventory cost = h% / turns<b>${fmt(pu,2)}%</b></span><span class="kpi">For a $${fmt(c)} item<b>$${fmt(c*pu/100,2)} per unit</b></span></div>`;}};
TOOLS.buildup={title:"📈 Inventory / backlog build-up diagram",html(){return `<p class="sub" style="margin:0 0 8px">Describe the day in phases. For each phase give its length (hours), the <b>supply</b> rate and the <b>demand</b> rate (units/hr). Positive = inventory on the shelf, negative = backlog (customers waiting). Starting level usually 0.</p>
  <label>Start level <input data-t="s0" value="0"></label><label>Start clock (hour, e.g. 5 = 5am) <input data-t="c0" value="12"></label>
  <table class="t" style="max-width:520px"><tr><th>Phase length (hr)</th><th>Supply/hr</th><th>Demand/hr</th></tr>${[[1,60,120],[1,60,0],[0,0,0],[0,0,0]].map((r,i)=>`<tr><td><input data-t="d${i}" value="${r[0]||""}"></td><td><input data-t="u${i}" value="${r[1]||""}"></td><td><input data-t="w${i}" value="${r[2]||""}"></td></tr>`).join("")}</table>
  <div class="note sub" style="font-size:13px">Tip: the build-up tool lets the level go up/down linearly. If a backlog hits 0 and supply stops, put supply = demand = 0 for the rest.</div><div class="out" data-t="out"></div>`;},
 run(root){const v=k=>parseNum(root.querySelector(`[data-t="${k}"]`).value);let t=v("c0")||0,y=v("s0")||0;const pts=[[t,y]];let mx=y,mn=y,mxt=t,mnt=t;
  for(let i=0;i<4;i++){const d=v("d"+i),s=v("u"+i)||0,w=v("w"+i)||0;if(!(d>0))continue;const net=s-w;const yEnd=y+net*d;
   // clip at 0 when backlog clears and supply would build inventory? keep linear.
   t+=d;y=yEnd;pts.push([t,y]);if(y>mx){mx=y;mxt=t;}if(y<mn){mn=y;mnt=t;}}
  const clock=h=>{const hh=Math.floor(h),mm=Math.round((h-hh)*60);const ap=hh%24>=12?"pm":"am";let h12=hh%12;if(h12===0)h12=12;return h12+(mm?":"+String(mm).padStart(2,"0"):"")+ap;};
  const xt=pts.map(p=>[p[0],clock(p[0])]);
  root.querySelector('[data-t="out"]').innerHTML=`<div class="viz">${VIZ.buildup({pts,xt,yt:[[mx,fmt(mx)],[mn,fmt(mn)],[0,"0"]],xl:"Time",yl:"Inventory (+) / Backlog (−)",marks:[[mxt,mx,"max "+fmt(mx),"#0f7b6c"],[mnt,mn,"min "+fmt(mn),"#c0392b"]]})}</div>
  <div><span class="kpi">Highest inventory<b>${fmt(mx)}</b></span><span class="kpi">Largest backlog<b>${fmt(Math.max(0,-mn))}</b></span></div>`;}};
TOOLS.multi={title:"🔀 Multiple flow units: implied utilization (minutes-of-work method)",html(){return `<p class="sub" style="margin:0 0 8px">Up to 3 flow-unit types with demand per hour; for each resource give m and the minutes each type needs there (0 or blank if that type skips the resource).</p>
  <label>Type A demand/hr <input data-t="da" value="3"></label><label>Type B <input data-t="db" value="11"></label><label>Type C <input data-t="dc" value="4"></label>
  <table class="t"><tr><th>Resource</th><th>m</th><th>min/unit A</th><th>min/unit B</th><th>min/unit C</th></tr>${[["File",1,3,3,3],["Foreign Dep.",2,20,0,0],["Department 1",3,15,15,0],["Department 2",2,0,0,8],["Print invoice",1,2,2,2]].map((r,i)=>`<tr><td><input data-t="rn${i}" value="${r[0]}" style="width:120px"></td><td><input data-t="rm${i}" value="${r[1]}"></td><td><input data-t="ra${i}" value="${r[2]||""}"></td><td><input data-t="rb${i}" value="${r[3]||""}"></td><td><input data-t="rc${i}" value="${r[4]||""}"></td></tr>`).join("")}</table><div class="out" data-t="out"></div>`;},
 run(root){const g=k=>root.querySelector(`[data-t="${k}"]`).value;const n=k=>parseNum(g(k))||0;const D=[n("da"),n("db"),n("dc")];let rows=[],mx=-1;
  for(let i=0;i<5;i++){const m=n("rm"+i)||0;if(!m)continue;const t=[n("ra"+i),n("rb"+i),n("rc"+i)];const work=D.reduce((a,d,k)=>a+d*t[k],0);const avail=m*60;const iu=work/avail;rows.push({name:g("rn"+i),m,t,work,avail,iu});if(iu>mx)mx=iu;}
  root.querySelector('[data-t="out"]').innerHTML=`<table class="t"><tr><th>Resource</th><th>Minutes of work demanded per hour</th><th>Minutes available per hour (m × 60)</th><th>Implied utilization</th></tr>${rows.map(r=>`<tr class="${r.iu===mx?'bn':''}"><td>${esc(r.name)}</td><td>${r.t.map((x,k)=>x?`${fmt(D[k])}×${fmt(x)}`:"").filter(Boolean).join(" + ")||0} = ${fmt(r.work)}</td><td>${fmt(r.avail)}</td><td>${fmt(r.iu*100,1)}%${r.iu===mx?" 🔴 bottleneck":""}</td></tr>`).join("")}</table>
  <p>The bottleneck is the resource with the <span class="k">highest implied utilization</span>. ${mx>1?`It is above 100%, so the process cannot serve all demand. Max flow rate (same mix) = total demand ÷ ${fmt(mx,3)} = <b>${fmt(D.reduce((a,b)=>a+b,0)/mx)}/hr</b>.`:"It is below 100%, so all demand can be served."}</p>`;}};
TOOLS.loss={title:"📵 Erlang loss calculator (no waiting room: busy → customer lost)",html(){return `<p class="sub" style="margin:0 0 8px">a = avg time between arrivals, p = avg processing time, m = servers.</p><label>a <input data-t="a" value="3"></label><label>p <input data-t="p" value="9"></label><label>m <input data-t="m" value="4"></label><div class="out" data-t="out"></div>`;},
 run(root){const v=k=>parseNum(root.querySelector(`[data-t="${k}"]`).value);const a=v("a"),p=v("p"),m=Math.round(v("m"));if(!(a>0&&p>0&&m>=1)){return;}const r=p/a;let B=1;for(let k=1;k<=m;k++)B=r*B/(k+r*B);
  const R=(1-B)/a;root.querySelector('[data-t="out"]').innerHTML=`<div><span class="kpi">r = p / a (offered load)<b>${fmt(r,3)}</b></span><span class="kpi">P(all m busy) = P<sub>m</sub>(r)<b>${fmt(B*100,2)}%</b></span><span class="kpi">Flow rate = (1 − P<sub>m</sub>)/a<b>${fmt(R,4)} per time unit</b></span><span class="kpi">Lost per time unit = P<sub>m</sub>/a<b>${fmt(B/a,4)}</b></span><span class="kpi">Utilization = flow rate × p / m<b>${fmt(R*p/m*100,1)}%</b></span></div>
  <table class="t" style="max-width:420px"><tr><th>m</th><th>P<sub>m</sub>(r) = probability of loss</th></tr>${(()=>{let b=1,o="";for(let k=1;k<=Math.max(m+3,6);k++){b=r*b/(k+r*b);o+=`<tr class="${k===m?'bn':''}"><td>${k}</td><td>${fmt(b*100,2)}%</td></tr>`;}return o;})()}</table>`;}};

function toolHTML(name){const T=TOOLS[name];return `<div class="tool" data-tool="${name}"><h3>${T.title}</h3>${T.html()}</div>`;}
function hydrate(){
  APP.querySelectorAll("[data-viz]").forEach(el=>{if(el.dataset.done)return;el.dataset.done=1;let cfg={};try{cfg=JSON.parse(el.dataset.cfg||"{}");}catch(e){console.error(e,el.dataset.cfg);}
    if(el.dataset.viz==="tool"){el.outerHTML=toolHTML(cfg.t);return;}
    const f=VIZ[el.dataset.viz];if(f){el.innerHTML=f(cfg)+(cfg.cap?`<div class="cap">${cfg.cap}</div>`:"");el.classList.add("viz");}});
  APP.querySelectorAll("[data-tool]").forEach(el=>{if(el.dataset.bound)return;el.dataset.bound=1;const T=TOOLS[el.dataset.tool];const go=()=>T.run(el);el.addEventListener("input",go);go();});
}

/* ---------------- event handling ---------------- */
APP.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const act=b.dataset.act,id=b.dataset.id;
  if(act==="opt"){const q=getQ(id);const i=+b.dataset.i;const ok=i===q.a;const box=b.closest(".q");
    box.querySelectorAll(".opt").forEach((o,k)=>{o.classList.remove("right","wrong");if(k===q.a)o.classList.add("right");});if(!ok)b.classList.add("wrong");
    const fb=box.querySelector(`[data-fb="${id}"]`);fb.className="fb show "+(ok?"ok":"no");fb.innerHTML=(ok?"✅ <b>Right.</b> ":"❌ <b>Not quite.</b> The answer is <b>"+String.fromCharCode(65+q.a)+"</b>. ")+(q.why||"");
    rec(id,ok,i);refreshHist(id);}
  if(act==="mscheck"){const q=getQ(id);const box=b.closest(".q");const sel=[...box.querySelectorAll("input[type=checkbox]")].filter(c=>c.checked).map(c=>+c.value).sort().join(",");const ok=sel===q.a.slice().sort().join(",");
    box.querySelectorAll(".opt").forEach((o,k)=>{o.classList.remove("right","wrong");if(q.a.includes(k))o.classList.add("right");else if(o.querySelector("input").checked)o.classList.add("wrong");});
    const fb=box.querySelector(`[data-fb="${id}"]`);fb.className="fb show "+(ok?"ok":"no");fb.innerHTML=(ok?"✅ <b>Right.</b> ":"❌ <b>Not quite.</b> Correct set: <b>"+q.a.map(k=>String.fromCharCode(65+k)).join(", ")+"</b>. ")+(q.why||"");rec(id,ok,sel);refreshHist(id);}
  if(act==="check"){const q=getQ(id);const inp=APP.querySelector(`[data-in="${CSS.escape(id)}"]`);const r=numOk(q,inp.value);const fb=APP.querySelector(`[data-fb="${CSS.escape(id)}"]`);
    if(r===null){fb.className="fb show no";fb.innerHTML="Type a number first (fractions like 3/8 are OK).";return;}
    fb.className="fb show "+(r?"ok":"no");fb.innerHTML=r?`✅ <b>Right!</b> Answer: <b>${fmt(q.ans,3)} ${esc(q.unit||"")}</b>. ${q.after||""} <a href="#" data-act="steps" data-id="${esc(id)}">See the full logic →</a>`:`❌ <b>Not yet.</b> Try again, use the 💡 hint, or open 👣 step-by-step.`;
    if(!id.startsWith("gen:")||true)rec(id,r,inp.value);refreshHist(id);if(!r&&!q._shownHint){}}
  if(act==="steps"){e.preventDefault();const el=APP.querySelector(`[data-steps="${CSS.escape(id)}"]`);if(el)el.classList.toggle("show");}
  if(act==="hint"){const el=APP.querySelector(`[data-hint="${CSS.escape(id)}"]`);if(el)el.classList.toggle("show");}
  if(act==="regen"){const wrap=b.closest(".gen");wrap.outerHTML=genHTML(b.dataset.gen,wrap.dataset.title);hydrate();}
  if(act==="wnext"){const w=b.closest(".wex");const hidden=w.querySelector(".wstep:not(.show)");if(hidden){hidden.classList.add("show");}if(!w.querySelector(".wstep:not(.show)")){b.textContent="✔ All steps shown";b.disabled=true;}}
  if(act==="wall"){const w=b.closest(".wex");w.querySelectorAll(".wstep").forEach(s=>s.classList.add("show"));const nb=w.querySelector('[data-act="wnext"]');if(nb){nb.textContent="✔ All steps shown";nb.disabled=true;}}
  if(act==="reset"){if(confirm("Erase ALL your OIDD 6110 practice records on every device?")){const s=load();s.mc={};s.resetAt=Date.now();save(s);route();}}
});
APP.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.matches("[data-in]")){const btn=e.target.parentElement.querySelector('[data-act="check"]');if(btn)btn.click();}});

/* ---------------- page pieces ---------------- */
function modProg(m){const ids=[...(m.checks||[]),...(m.calcs||[])].map(q=>q.id);let seen=0,ok=0;ids.forEach(id=>{const h=hist(id);if(h.length){seen++;if(h[h.length-1].ok)ok++;}});return{n:ids.length,seen,ok};}
function wexHTML(w,i){return `<div class="wex"><h3 style="margin-top:4px">🧩 ${w.title}</h3>${w.src?`<span class="src">${esc(w.src)}</span>`:""}<div class="setup">${w.setup}</div>${w.viz||""}
  ${w.steps.map((s,k)=>`<div class="wstep"><div class="ask"><span class="stepnum">${k+1}</span><span>${s.ask}</span></div><div class="ans">${s.ans}</div>${s.why?`<div class="wy">💡 <b>Why:</b> ${s.why}</div>`:""}</div>`).join("")}
  <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn small teal" data-act="wnext">▶ Show next step</button><button class="btn small ghost" data-act="wall">Show all steps</button></div>
  <p class="sub" style="font-size:13.5px;margin:8px 0 0">Try each step yourself <u>before</u> revealing it: cover the screen, write your answer, then click.</p></div>`;}
function nav(on){document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.getAttribute("href")==="#"+on));}
const DATES=[["HW1 due","2026-11-20","First half of last year's final"],["HW2 due","2026-12-05","Second half of last year's final"],["HW3 due","2026-12-10","Final from two years ago (practice exam)"],["FINAL EXAM","2026-12-12","2 hours · closed book · 1 page own cheat sheet + calculator (a move to Dec 11 was proposed in class; check Canvas)"]];
function daysTo(d){const t=new Date(d+"T23:59:00");return Math.ceil((t-Date.now())/86400000);}

/* ---------------- pages ---------------- */
function pHome(){nav("home");
  const mods=OM.modules.map(m=>{const p=modProg(m);return `<a class="mod" href="#m/${m.id}" style="border-left-color:${m.color||'#0f7b6c'}"><span class="n">MODULE ${m.n} · ${esc(m.code)}</span><h3>${m.icon||""} ${esc(m.title)}</h3><p>${esc(m.blurb)}</p>
   <div class="bar"><div style="width:${p.n?Math.round(p.seen/p.n*100):0}%"></div></div><p style="font-size:12.5px">${p.seen}/${p.n} questions tried · ${p.seen?Math.round(p.ok/p.seen*100):0}% right ${m.status?`· <span class="src">${esc(m.status)}</span>`:""}</p></a>`;}).join("");
  APP.innerHTML=`<span class="tag">Term 3 · Fall 2026 · Prof. Christian Terwiesch</span>
  <h1>OIDD 6110: Operations Management, learned from zero</h1>
  <p class="sub">Every module explained in plain English as if you've never taken a business class, with pictures, the <b>logic and the "why"</b> behind each formula, step-by-step worked examples, and auto-graded practice. Everything here points at one goal: <b>the final exam</b>.</p>
  <div class="count">${DATES.map(d=>{const n=daysTo(d[1]);return `<div class="c ${n<=7&&n>=0?'urgent':''}"><span class="sub" style="font-size:13px">${d[0]}</span><b>${n>=0?n+" days":"done"}</b><span style="font-size:12.5px">${new Date(d[1]+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})} · ${d[2]}</span></div>`;}).join("")}</div>
  <div class="callout key"><b>🗺️ How to use this site (recommended order)</b>
   <span class="stepnum">1</span><b>Learn</b> a module (read the lesson; it's short and visual) →
   <span class="stepnum">2</span>walk through the <b>worked examples</b> one step at a time →
   <span class="stepnum">3</span>answer the <b>concept checks</b> →
   <span class="stepnum">4</span>do the <b>calculation drills</b> (🎲 gives unlimited new numbers) →
   <span class="stepnum">5</span>see it applied in a <b>case</b> → <span class="stepnum">6</span>clean up with <b>🎯 Weak Spots</b>.
   Then use <a href="#hw1"><b>📝 HW1 Prep</b></a>: a skill map and a full HW1-style practice test, so you can do the real homework on your own.</div>
  <h2>The 10 modules</h2><div class="mods">${mods}</div>
  <h2>Course at a glance</h2>
  <table class="t"><tr><th>Session</th><th>Modules</th><th>Case / prep</th></tr>
  <tr><td>1 · Sat Oct 17</td><td>INTRO, PROCESS, LITTLE</td><td>Mortgage exercise (Huntsman Bank A), retailer inventory turns</td></tr>
  <tr><td>2 · Fri Oct 30</td><td>FLOW, MULTI, LEAN</td><td>Subway (live in class)</td></tr>
  <tr><td>3 · Sat Oct 31</td><td>WAIT</td><td>Capital One case</td></tr>
  <tr><td>4 · Fri Nov 20</td><td>WAIT (ctd), LOSS, QUALITY</td><td>Call Center case, Huntsman Bank (B)</td></tr>
  <tr><td>5 · Sat Nov 21</td><td>KPI, AI / future of operations, review</td><td>none</td></tr></table>
  <div class="callout prof"><b>🎓 What the professor said about the exam</b>
  • <b>Closed book</b>, 2 hours, calculator plus <b>one letter-size cheat sheet you write yourself</b> (handed in with the exam; don't share it).<br>
  • Only material presented in class. <b>Each module's "Summary" slide holds all the definitions and equations</b>; master those and you're prepared.<br>
  • Assume processes are in steady state unless told "starting empty".<br>
  • Use <u>his</u> definitions (e.g., cost of direct labor <b>includes idle time</b>); AI tools often use different ones.<br>
  • The list of the seven wastes (TIM WOOD) is <b>not</b> needed for the exam.<br>
  • HW = past finals. Do them under exam conditions, <b>no AI</b>. HW1 &amp; HW2 6% each, HW3 12%, participation 26%, final 50%.</div>
  <h2>What I've digested so far</h2>
  <div class="card"><ul style="margin:0;padding-left:20px">
   <li>Course outline (Fall 2026, WEMBA Q2)</li><li>Slides Day 1: INTRO, PROCESS, LITTLE (74 slides)</li><li>Slides Day 2–3: FLOW, MULTI, LEAN, Capital One, WAIT (89 slides)</li>
   <li>Lecture recordings (notes): session 1 (intro/process/Little), session 2 (Subway/flow/multi/lean), session 3 (Capital One/wait)</li>
   <li>Cases: Capital One (loan processing), Call Center at Picadilly Bank (+ Excel data)</li><li>HW1 (used <u>only</u> to see which skills it tests; it is not solved here)</li></ul>
   <p class="sub" style="margin:6px 0 0">⏳ Not uploaded yet: slides for <b>KPI, LOSS, QUALITY</b> (those modules currently use the course textbook, Cachon &amp; Terwiesch, and are marked 📗), Huntsman Bank B, HW2/HW3.</p></div>
  <p class="foot">Records sync to all your devices (☁️ bottom-right). HW policy reminder: the syllabus bans AI for completing homework, so this site never solves HW questions. It teaches the skills with different numbers so you can solve them yourself.</p>`;
}
function pModule(id){
  const i=OM.modules.findIndex(m=>m.id===id),m=OM.modules[i];if(!m){APP.innerHTML="Module not found";return;}nav("");qCounter=0;
  const prev=OM.modules[i-1],next=OM.modules[i+1];
  const secs=[["learn","📖 Learn"],["formulas","📐 Formulas"],["worked","🧩 Worked examples"],["checks","✅ Concept checks"],["calcs","🔢 Calculation drills"],["cases","📂 In the cases"],["traps","⚠️ Traps & prof tips"]];
  APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Module ${m.n}</div>
  <span class="tag" style="background:${m.color||'#0f7b6c'}">Module ${m.n} · ${esc(m.code)}</span> ${m.status?`<span class="src">${esc(m.status)}</span>`:""}
  <h1>${m.icon||""} ${esc(m.title)}</h1><p class="sub">${m.intro||esc(m.blurb)}</p>
  ${m.objectives?`<div class="callout key"><b>🎯 After this module you can…</b><ol style="margin:4px 0 0;padding-left:22px">${m.objectives.map(o=>`<li>${o}</li>`).join("")}</ol></div>`:""}
  <div class="tabs">${secs.map(s=>`<a href="#m/${m.id}/${s[0]}" data-jump="${s[0]}">${s[1]}</a>`).join("")}</div>
  <section class="sec" id="s-learn"><h2>📖 Learn it (plain English)</h2><div class="lesson">${(m.lesson||[]).map((s,k)=>`<div class="lsec"><h3><span class="stepnum">${k+1}</span>${s.h}</h3>${s.html}</div>`).join("")}</div></section>
  <section class="sec" id="s-formulas"><h2>📐 Formulas (and why they make sense)</h2>${(m.formulas||[]).map(f=>`<div class="formula"><div style="font-size:14px;font-weight:800;color:var(--teal)">${f.name}</div><div class="eq">${f.f}</div>${f.why?`<div class="why">💡 ${f.why}</div>`:""}</div>`).join("")||"<p class='sub'>No equations in this module (the professor's summary slide literally says “Equations: None!!”).</p>"}</section>
  <section class="sec" id="s-worked"><h2>🧩 Worked examples, step by step</h2>${(m.worked||[]).map(wexHTML).join("")}</section>
  <section class="sec" id="s-checks"><h2>✅ Concept checks</h2><p class="sub">Quick questions to make sure the <u>idea</u> landed. Every answer comes with the reasoning.</p>${(m.checks||[]).map(q=>qHTML(q)).join("")}</section>
  <section class="sec" id="s-calcs"><h2>🔢 Calculation drills</h2><p class="sub">Type the number; units are shown. Percent answers can be typed as 67 or 0.67. Stuck? Use 💡 Hint, then 👣 Step-by-step.</p>${(m.calcs||[]).map(q=>qHTML(Object.assign({type:"num"},q))).join("")}
   ${(m.gens||[]).length?`<h3>🎲 Unlimited practice (new numbers every click)</h3>${m.gens.map(g=>genHTML(g[0],g[1])).join("")}`:""}</section>
  <section class="sec" id="s-cases"><h2>📂 Where this shows up in the cases</h2>${m.cases||"<p class='sub'>Coming as cases are uploaded.</p>"}</section>
  <section class="sec" id="s-traps"><h2>⚠️ Traps &amp; 🎓 professor tips</h2>${(m.traps||[]).map(t=>`<div class="callout trap"><b>⚠️ Trap</b>${t}</div>`).join("")}${(m.prof||[]).map(t=>`<div class="callout prof"><b>🎓 From the lecture</b>${t}</div>`).join("")}</section>
  <div style="display:flex;justify-content:space-between;margin-top:30px;gap:10px;flex-wrap:wrap">${prev?`<a class="btn ghost" href="#m/${prev.id}">← ${esc(prev.code)}</a>`:"<span></span>"}${next?`<a class="btn" href="#m/${next.id}">Next: ${esc(next.code)} →</a>`:`<a class="btn" href="#hw1">Go to HW1 Prep →</a>`}</div>`;
  hydrate();
}
function pHW(k){nav("hw1");qCounter=0;const H=OM.hw[k];if(!H){APP.innerHTML="<p>Coming soon.</p>";return;}
  APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › ${esc(H.title)}</div><h1>${esc(H.title)}</h1>${H.intro}
  ${(H.sets||[]).map(st=>`<h2>${st.title}</h2>${st.intro||""}${(st.qs||[]).map(q=>qHTML(Object.assign(q.opts?{}:{type:"num"},q))).join("")}`).join("")}${H.outro||""}`;hydrate();}
function pCases(){nav("cases");APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Cases</div><h1>📂 Cases, organized by module</h1><p class="sub">Each case is broken down by the module it teaches, so you can see every concept in a real business. Case prep may use AI (allowed by the syllabus); homework may not.</p>
  <div class="grid">${OM.cases.map(c=>`<a class="card" href="#case/${c.id}"><span class="tag ${c.ready?'':'gray'}">${c.ready?"full breakdown":"preview"}</span><h3>${esc(c.title)}</h3><p class="sub" style="margin:0 0 6px">${esc(c.blurb)}</p>${(c.mods||[]).map(x=>`<span class="pill">${esc(x)}</span>`).join("")}</a>`).join("")}</div>`;}
function pCase(id){nav("cases");qCounter=0;const c=OM.cases.find(x=>x.id===id);if(!c){APP.innerHTML="Case not found";return;}
  APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › <a href="#cases">Cases</a> › ${esc(c.title)}</div><h1>${esc(c.title)}</h1>${(c.mods||[]).map(x=>`<span class="pill">${esc(x)}</span>`).join("")}<p class="sub">${esc(c.blurb)}</p>
  ${(c.parts||[]).map((p,k)=>`<div class="lsec"><h3><span class="stepnum">${k+1}</span>${p.h}</h3>${p.html}</div>`).join("")}
  ${(c.questions||[]).length?`<h2>✅ Case questions</h2>${c.questions.map(q=>qHTML(Object.assign(q.opts?{}:{type:"num"},q))).join("")}`:""}`;hydrate();}
function pTools(){nav("tools");APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Calculators</div><h1>🧮 Calculators to build intuition</h1><p class="sub">Use these to <b>check</b> your own work and to play "what if". Change a number and watch which outputs move. (Not for homework, which must be done by hand per the syllabus. Great for practice and cases.)</p>
  ${Object.keys(TOOLS).map(toolHTML).join("")}`;hydrate();}
function pFormulas(){nav("formulas");APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Formulas</div><h1>📐 Every formula, one page</h1><p class="sub">Use this to build your own one-page cheat sheet (the exam requires you to write it yourself). Print with Ctrl/Cmd+P.</p>
  ${OM.modules.map(m=>(m.formulas||[]).length?`<h2>${m.icon||""} ${esc(m.code)}: ${esc(m.title)}</h2>${m.formulas.map(f=>`<div class="formula"><div style="font-size:14px;font-weight:800;color:var(--teal)">${f.name}</div><div class="eq">${f.f}</div>${f.why?`<div class="why">💡 ${f.why}</div>`:""}</div>`).join("")}`:"").join("")}`;}
function pWeak(){nav("weak");qCounter=0;const s=load();const wrong=Object.keys(s.mc).filter(id=>REG[id]&&s.mc[id].length&&!s.mc[id][s.mc[id].length-1].ok);
  APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Weak Spots</div><h1>🎯 Weak Spots</h1><p class="sub">Every question whose <b>latest</b> attempt was wrong. Answer it right and it leaves this list. Each one links back to its lesson.</p>
  ${wrong.length?wrong.map(id=>{const q=REG[id];const m=q.where.mod?OM.modules.find(x=>x.id===q.where.mod):null;return `<div style="margin-top:14px"><span class="pill">${m?`<a href="#m/${m.id}">${esc(m.code)}: review the lesson →</a>`:q.where.cas?`<a href="#case/${q.where.cas}">Case →</a>`:"HW1 prep"}</span></div>`+qHTML(Object.assign(q.opts?{}:{type:"num"},q));}).join(""):`<div class="callout key"><b>Nothing here yet 🎉</b>Either you haven't missed anything, or you haven't started. Go to a module and try the checks.</div>`}`;hydrate();}
function pRecords(){nav("records");const s=load();let tot=0,ok=0,att=0;const rows=OM.modules.map(m=>{const p=modProg(m);tot+=p.n;return `<tr><td><a href="#m/${m.id}">${esc(m.code)}</a></td><td>${p.seen}/${p.n}</td><td>${p.seen?Math.round(p.ok/p.seen*100)+"%":"–"}</td></tr>`;}).join("");
  const all=[];Object.keys(s.mc).forEach(id=>s.mc[id].forEach(h=>{all.push(Object.assign({id},h));att++;if(h.ok)ok++;}));all.sort((a,b)=>b.ts-a.ts);
  const hw=Object.keys(REG).filter(id=>REG[id].where.hw);const hs=hw.filter(id=>hist(id).length);
  APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Records</div><h1>📊 My Records</h1><p class="sub">Synced across devices. ${att} answers so far, ${att?Math.round(ok/att*100):0}% right.</p>
  <table class="t"><tr><th>Module</th><th>Questions tried</th><th>Latest-attempt accuracy</th></tr>${rows}<tr class="tot"><td>HW1-style practice test</td><td>${hs.length}/${hw.length}</td><td>${hs.length?Math.round(hs.filter(id=>lastOk(id)).length/hs.length*100)+"%":"–"}</td></tr></table>
  <h2>Recent answers</h2><table class="t"><tr><th>When</th><th>Question</th><th>Your answer</th><th></th></tr>${all.slice(0,60).map(h=>{const q=REG[h.id];const t=q?q.q.replace(/<[^>]+>/g,"").slice(0,90):h.id.replace("gen:","🎲 ");return `<tr><td style="white-space:nowrap">${new Date(h.ts).toLocaleString([],{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</td><td>${esc(t)}</td><td>${esc(h.a)}</td><td>${h.ok?"✅":"❌"}</td></tr>`;}).join("")}</table>
  <p><button class="btn ghost small" data-act="reset">Reset all OIDD 6110 records</button></p>`;}

/* ---------------- router ---------------- */
function route(){const h=(location.hash||"#home").slice(1).split("/");
  if(h[0]==="m"){const same=APP.dataset.page==="m/"+h[1];if(!same){pModule(h[1]);APP.dataset.page="m/"+h[1];}if(h[2]){const el=document.getElementById("s-"+h[2]);if(el)setTimeout(()=>el.scrollIntoView({behavior:same?"smooth":"auto"}),same?0:30);}else if(!same)scrollTo(0,0);
    document.querySelectorAll(".tabs a").forEach(a=>a.classList.toggle("on",a.dataset.jump===h[2]));return;}
  APP.dataset.page=h.join("/");scrollTo(0,0);
  if(h[0]==="hw1")pHW("hw1");else if(h[0]==="cases")pCases();else if(h[0]==="case")pCase(h[1]);else if(h[0]==="tools")pTools();else if(h[0]==="formulas")pFormulas();else if(h[0]==="weak")pWeak();else if(h[0]==="records")pRecords();else pHome();}
window.addEventListener("hashchange",route);
window.addEventListener("jw-sync-applied",()=>{});
route();
})();
