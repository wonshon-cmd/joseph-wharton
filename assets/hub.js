(function(){
const C=window.CATALOG, B=document.body, ROOT=B.dataset.root||"", PAGE=B.dataset.page;
const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const $=id=>document.getElementById(id);
function progress(c){ if(!c.progressKey)return null; let s; try{s=JSON.parse(localStorage.getItem(c.progressKey));}catch(e){} if(!s)return null;
  let mcSeen=0,mcOk=0,sa=0,saSum=0,last=0;
  for(const k in (s.mc||{})){const h=s.mc[k];if(h.length){mcSeen++;if(h[h.length-1].ok)mcOk++;last=Math.max(last,h[h.length-1].ts);}}
  for(const k in (s.sa||{})){s.sa[k].forEach(e=>{sa++;saSum+=(e.ai!=null?e.ai:e.auto);last=Math.max(last,e.ts);});}
  if(!mcSeen&&!sa)return null; return {mcSeen,mcOk,sa,saAvg:sa?saSum/sa:0,last};}
function progHTML(c){const p=progress(c);if(!p)return `<p class="sub" style="font-size:14px;margin:6px 0 0">No practice yet.</p>`;
  const T=c.progressTotals||{};const pct=T.mc?Math.round(p.mcSeen/T.mc*100):0;
  return `<div class="bar"><div style="width:${pct}%"></div></div><p class="sub" style="font-size:14px;margin:0">MC tried ${p.mcSeen}${T.mc?'/'+T.mc:''} · ${p.mcSeen?Math.round(p.mcOk/p.mcSeen*100):0}% right · ${p.sa} essay${p.sa===1?'':'s'}${p.sa?' (avg '+p.saAvg.toFixed(1)+'/9)':''}<br>Last studied ${new Date(p.last).toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</p>`;}
const crumbs=[`<a href="${ROOT}">${esc(C.owner)}</a>`];
if(PAGE==="home"){
  document.title=C.owner;
  $("main").innerHTML=`<h1>${esc(C.owner)}</h1><p class="sub">${esc(C.tagline)}</p>
  <h2>Terms</h2><div class="grid">${C.terms.map(t=>`<a class="card" href="${t.id}/"><span class="tag">${esc(t.when||"")}</span><h3>${esc(t.name)}</h3><p class="sub" style="margin:0">${t.courses.length} course${t.courses.length===1?'':'s'}: ${t.courses.map(c=>esc(c.code)).join(", ")||'none yet'}</p></a>`).join("")}
  <div class="card empty"><h3>＋ Next term</h3><p style="margin:0">Add it in <code>assets/catalog.js</code> (or ask Claude to).</p></div></div>
  <h2>Jump back in</h2><div class="grid">${C.terms.flatMap(t=>t.courses.map(c=>`<a class="card" href="${t.id}/${c.slug}/" style="border-left:6px solid ${c.color||'#011f5b'}"><span class="pill">${esc(t.name)}</span><h3>${esc(c.code)} · ${esc(c.title)}</h3>${progHTML(c)}</a>`)).join("")}</div>`;
}
if(PAGE==="term"){
  const t=C.terms.find(x=>x.id===B.dataset.term);document.title=t.name+" · "+C.owner;crumbs.push(esc(t.name));
  $("main").innerHTML=`<h1>${esc(t.name)}</h1><p class="sub">${esc(t.when||"")}</p>
  <h2>Courses</h2><div class="grid">${t.courses.map(c=>`<a class="card" href="${c.slug}/" style="border-left:6px solid ${c.color||'#011f5b'}"><h3>${esc(c.code)}</h3><p style="margin:0 0 4px"><b>${esc(c.title)}</b><br><span class="sub">${esc(c.prof||"")}</span></p>${c.status?`<span class="pill">${esc(c.status)}</span>`:''}${progHTML(c)}</a>`).join("")}
  <div class="card empty"><h3>＋ Add a course</h3><p style="margin:0">New folder in <code>${esc(t.id)}/</code> + an entry in <code>assets/catalog.js</code>.</p></div></div>`;
}
if(PAGE==="course"){
  const t=C.terms.find(x=>x.id===B.dataset.term);const c=t.courses.find(x=>x.slug===B.dataset.course);
  document.title=c.code+" · "+C.owner;crumbs.push(`<a href="${ROOT}${t.id}/">${esc(t.name)}</a>`,esc(c.code));
  $("main").innerHTML=`<span class="tag" style="background:${c.color||'#011f5b'}">${esc(t.name)}</span><h1>${esc(c.code)} · ${esc(c.title)}</h1><p class="sub">${esc(c.prof||"")}${c.status?' · '+esc(c.status):''}</p>
  <div class="card" style="margin-top:14px"><b>My progress</b>${progHTML(c)}</div>
  <h2>Materials</h2><div class="grid">${c.items.map(it=>`<div class="card${it.primary?' primary':''}"><h3><a href="${it.href}" style="text-decoration:none">${it.icon||''} ${esc(it.title)}</a></h3><p class="sub" style="margin:0">${esc(it.desc||'')}</p>
    <div class="extra"><a href="${it.href}">Open →</a>${(it.extra||[]).map(x=>`<a href="${x.href}">${esc(x.label)}</a>`).join("")}</div></div>`).join("")}</div>`;
}
$("crumbs").innerHTML=crumbs.join(" › ");
})();
