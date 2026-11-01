/* =====================================================================
   EXAM PRACTICE: unlimited HW1-format mock exams built from
   "scenario block" generators (each block = one business scenario
   with 2–4 numeric/MC questions, exactly like the homework/final).
   ===================================================================== */
(function(){"use strict";
const E=OM.E,fmt=OM.fmt,esc=E.esc,R=OM.rnd,P=OM.pick;
const T=x=>Math.round(x*100)/100;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const clock=h=>{const hh=Math.floor(h+1e-9),mm=Math.round((h-hh)*60);const H=mm===60?hh+1:hh,M=mm===60?0:mm;const ap=H%24>=12?"pm":"am";let h12=H%12;if(!h12)h12=12;return h12+":"+String(M).padStart(2,"0")+ap;};
const num=(q,ans,unit,steps,o={})=>Object.assign({q,ans,unit,steps},o);
const mc=(q,opts,a,why)=>({q,opts,a,why});

/* ---------- block generators ---------- */
const B={};
B.single={half:1,title:"One resource: flow rate, utilization, cycle time",mod:"process",gen(){
  const thing=P([["A 3D printer","jobs"],["An MRI scanner","scans"],["A barista","drinks"],["A loan officer","applications"],["A paint robot","car bodies"]]);
  let cap=R(3,12),dem=R(2,14);if(dem===cap)dem++;const fr_=Math.min(cap,dem);
  return{title:thing[0],intro:`<p>${thing[0]} can handle <b>${cap} ${thing[1]} per hour</b>. Demand is <b>${dem} ${thing[1]} per hour</b>.</p>`,qs:[
   num("What is the flow rate?",fr_,thing[1]+"/hour",[`Flow rate = min(demand, capacity) = min(${dem}, ${cap}) = <b>${fr_}</b>`]),
   num("What is the utilization?",fr_/cap*100,"%",[`Utilization = flow rate / capacity = ${fr_}/${cap} = <b>${fmt(fr_/cap*100,1)}%</b>`]),
   num("What is the cycle time?",60/fr_,"minutes/"+thing[1].replace(/s$/,""),[`Cycle time = 1 / flow rate = 1/${fr_} hour`,`× 60 = <b>${fmt(60/fr_,2)} min</b> (uses flow rate, not capacity!)`])]};}};
B.parallel={half:1,title:"Stations with parallel units: capacity, empty system, best improvement",mod:"process",gen(){
  for(let tries=0;tries<200;tries++){
  const names=shuffle(["Rowing","Bike","Sled push","Wall balls","Lunges","Ski erg","Box jumps","Burpees","Treadmill","Kettlebell"]).slice(0,R(5,6));
  const st=names.map(n=>{const p=R(3,10);const m=R(6,20);return{n,p,m,cap:m/p*60};});
  const cap=Math.min(...st.map(s=>s.cap));const bi=st.findIndex(s=>s.cap===cap);if(st.filter(s=>Math.abs(s.cap-cap)<1e-9).length>1)continue;
  const X=P([40,50,60,80,100,120]);const lc=st.reduce((a,s)=>a+s.p,0);const ct=60/cap;
  const oi=(bi+R(1,st.length-1))%st.length;
  const pc=arr=>Math.min(...arr.map(s=>s.m/s.p*60));
  const opt=[["Add one unit at "+st[bi].n,st.map((s,i)=>i===bi?{...s,m:s.m+1}:s)],["Add one unit at "+st[oi].n,st.map((s,i)=>i===oi?{...s,m:s.m+1}:s)],["Cut the time at "+st[bi].n+" by 1 minute",st.map((s,i)=>i===bi?{...s,p:s.p-1}:s)],["Cut the time at "+st[oi].n+" by 1 minute",st.map((s,i)=>i===oi?{...s,p:s.p-1}:s)]];
  const caps=opt.map(o=>pc(o[1]));const best=Math.max(...caps);if(best<=cap+1e-9)continue;if(caps.filter(c=>Math.abs(c-best)<1e-6).length>1)continue;
  const order=shuffle([0,1,2,3]);const opts=order.map(i=>opt[i][0]).concat(["None of these increases capacity"]);const a=order.indexOf(caps.indexOf(best));
  return{title:"Fitness circuit",intro:`<p>Every athlete visits all stations in order. Each station has several identical units (one athlete per unit).</p><table class="t" style="max-width:520px"><tr><th>Station</th><th>Units</th><th>Time (min/athlete)</th></tr>${st.map(s=>`<tr><td>${s.n}</td><td>${s.m}</td><td>${s.p}</td></tr>`).join("")}</table>`,qs:[
   num("What is the capacity of the process (athletes per hour)? Ignore empty-system effects.",cap,"athletes/hour",[...st.map(s=>`${s.n}: ${s.m}/${s.p} × 60 = ${fmt(s.cap)}`),`Minimum = <b>${fmt(cap)}</b> (${st[bi].n})`]),
   num(`Starting with an empty system, how long until ${X} athletes have finished? Ignore transition times.`,lc+(X-1)*ct,"minutes",[`Time through empty system = ${st.map(s=>s.p).join("+")} = ${lc} min`,`Cycle time = 60/${fmt(cap)} = ${fmt(ct,3)} min`,`${lc} + (${X}−1) × ${fmt(ct,3)} = <b>${fmt(lc+(X-1)*ct,2)} min</b>`],{tol:Math.max(0.3,(lc+(X-1)*ct)*0.01)}),
   Object.assign(mc("Which action increases process capacity the most?",opts,a,opt.map((o,i)=>`${o[0]} → capacity ${fmt(caps[i])}`).join("; ")+". Only changes at the bottleneck help, and then only until the next station limits."),{})]};}
  return B.single.gen();}};
B.staffed={half:1,title:"Staffed steps: capacity, labor content, average labor utilization",mod:"flow",gen(){
  for(let t=0;t<100;t++){const names=P([["Register","Evaluate","Instruct"],["Intake","Review","Photo"],["Triage","Exam","Discharge"],["Check-in","Fitting","Payment"]]);
   const st=names.map(n=>{const m=R(1,6),p=R(2,30)*(R(0,1)?2:1);return{n,m,p,cap:m/p*60};});const cap=Math.min(...st.map(s=>s.cap));const lc=st.reduce((a,s)=>a+s.p,0),N=st.reduce((a,s)=>a+s.m,0),ct=60/cap,alu=lc/(ct*N);
   if(alu>0.98)continue;
   return{title:"Three staffed steps",intro:`<table class="t" style="max-width:560px"><tr><th></th>${st.map(s=>`<th>${s.n}</th>`).join("")}</tr><tr><td>Staffing</td>${st.map(s=>`<td>${s.m}</td>`).join("")}</tr><tr><td>Processing time (min/unit, per person)</td>${st.map(s=>`<td>${s.p}</td>`).join("")}</tr></table>`,qs:[
    num("What is the capacity of the process (units per hour)?",cap,"units/hour",[...st.map(s=>`${s.n}: ${s.m}/${s.p} × 60 = ${fmt(s.cap)}`),`Minimum = <b>${fmt(cap)}</b>`]),
    num("What is the labor content?",lc,"minutes/unit",[`Sum of processing times = ${st.map(s=>s.p).join(" + ")} = <b>${lc} min</b> (staffing doesn't matter)`]),
    num("What is the average labor utilization (unlimited demand)?",alu*100,"%",[`Cycle time = 60/${fmt(cap)} = ${fmt(ct,3)} min`,`Employees = ${N}`,`${lc} / (${fmt(ct,3)} × ${N}) = <b>${fmt(alu*100,1)}%</b>`])]};}return B.labor.gen();}};
B.labor={half:1,title:"Cost of direct labor, takt time, target manpower, worker allocation",mod:"flow",gen(){
  const p=[R(3,9),R(3,9),R(3,9)];const cap1=60/Math.max(...p);const w=P([12,14,15,18,20,22,25]);
  let d1=Math.max(1,Math.round(cap1*P([0.6,0.7,0.8,1.3])));const fr1=Math.min(d1,cap1);const d2=P([10,12,15,20,24,30]);const lc=p[0]+p[1]+p[2];const W=P([4,5,6]);
  let best=0,bestA=null;for(let a=1;a<=W-2;a++)for(let b=1;b<=W-1-a;b++){const c=W-a-b;if(c<1)continue;const k=Math.min(a/p[0],b/p[1],c/p[2])*60;if(k>best+1e-9){best=k;bestA=[a,b,c];}}
  return{title:"Three steps",intro:`<p>A process has three sequential resources with processing times of <b>${p[0]}, ${p[1]} and ${p[2]} minutes</b> per unit. Each is staffed by one worker.</p>`,qs:[
   num(`Assuming a demand of ${d1} units per hour and wages of $${w}/hour, what is the cost of direct labor?`,3*w/fr1,"$/unit",[`Capacity = 60/${Math.max(...p)} = ${fmt(cap1)}/hr; flow rate = min(${d1}, ${fmt(cap1)}) = ${fmt(fr1)}`,`Wages = 3 × $${w} = $${3*w}/hr`,`$${3*w} / ${fmt(fr1)} = <b>$${fmt(3*w/fr1,2)}</b>`],{tol:Math.max(0.011,3*w/fr1*0.01)}),
   num(`Assuming a demand of ${d2} units per hour, what is the takt time?`,60/d2,"minutes/unit",[`Takt = 60/${d2} = <b>${fmt(60/d2,3)} min</b>`]),
   num(`Assuming a demand of ${d2} units per hour, what is the target manpower?`,lc/(60/d2),"workers",[`Labor content = ${lc} min`,`${lc} / ${fmt(60/d2,3)} = <b>${fmt(lc*d2/60,2)}</b>`]),
   num(`With ${W} workers to assign to the three resources (each needs at least one), what is the highest process capacity you can achieve?`,best,"units/hour",[`Best allocation: ${bestA.join(", ")} workers`,`Capacities ${bestA.map((a,i)=>`${a}/${p[i]}×60 = ${fmt(a/p[i]*60)}`).join(", ")}`,`Process capacity = <b>${fmt(best)}</b>/hr`])]};}};
const turnConcepts=[
 ["Everything else equal, a company with higher inventory turns…",["holds each unit for a shorter time on average","necessarily has higher revenue","necessarily has a higher gross margin","has more inventory"],0,"Turns = 1/flow time. They say nothing about revenue or margin."],
 ["A retailer cuts its days of supply in half (same COGS). Its per-unit inventory holding cost…",["halves","doubles","is unchanged","can't be determined"],0,"Per-unit cost = annual % / turns; turns doubled → cost halves."],
 ["To compute inventory turns from an income statement and balance sheet, use…",["COGS / Inventory","Revenue / Inventory","Inventory / Revenue","Gross profit / Inventory"],0,"Inventory is valued at cost, so use COGS."],
 ["Firm A (luxury jeweler) turns inventory 0.7×/yr; firm B (grocer) 13×/yr. Which conclusion is valid?",["A's items sit far longer, so A's per-unit holding cost is much higher","A is badly managed","B is more profitable","A sells less"],0,"Compare turns only among direct competitors; turns tell you time in inventory and holding cost."]];
B.turns={half:1,title:"Inventory turns & per-unit inventory cost",mod:"little",gen(){
  const cogs=R(6,40)*100+R(0,99),inv=Math.round(cogs/P([3,4,5,6,8,2.5])),rev=Math.round(cogs*(1.3+Math.random()*0.8));const h=P([15,18,20,24,25,30]);const c=R(5,40)*10;const t=cogs/inv;const cc=P(turnConcepts);
  return{title:P(["Peacock-style industrial target","Retail chain","Apparel brand","Electronics distributor"]),intro:`<p>Financial data (million $): Revenue <b>${rev.toLocaleString()}</b> · Cost of goods sold <b>${cogs.toLocaleString()}</b> · Inventories <b>${inv.toLocaleString()}</b>.</p>`,qs:[
   mc(cc[0],cc[1],cc[2],cc[3]),
   num("What are the inventory turns?",t,"turns/year",[`Turns = COGS / Inventory = ${cogs}/${inv} = <b>${fmt(t,2)}</b> (revenue is a distractor)`]),
   num(`The annual inventory cost is ${h}% per year. What, in absolute terms, is the per-unit inventory cost for a product that costs $${c}?`,h/t/100*c,"$/unit",[`Per-unit % = ${h}% / ${fmt(t,3)} = ${fmt(h/t,3)}%`,`× $${c} = <b>$${fmt(h/t/100*c,2)}</b>`],{tol:Math.max(0.011,h/t/100*c*0.015)}),
   num("How many days of supply does the company hold?",inv/cogs*365,"days",[`${inv}/${cogs} × 365 = <b>${fmt(inv/cogs*365,1)} days</b>`])]};}};
B.buildup={half:1,title:"Build-up diagram: last customer served, largest backlog",mod:"wait",gen(){
  for(let t=0;t<300;t++){const s=P([4,5,6]),t1=P([6,7,8]),dur=P([5,6,8,10]),t2=t1+dur;const k=P([1,2,3,4]);const N=R(6,40)*10;const D=N*k/dur;const Pr=R(Math.round(D*0.5),Math.round(D*0.95));
   if(Pr<5||D<=Pr||t1<s)continue;const tot=N*k;const I=t=>Pr*Math.max(0,t-s)-D*Math.min(Math.max(0,t-t1),dur);
   const Iend=I(t2);if(Iend>=0)continue; const last=s+tot/Pr; if(Math.abs(last*4-Math.round(last*4))>1e-9)continue; // keep to quarter hours
   const I1=I(t1);const runOut=I1>0?(D*t1-Pr*s)/(D-Pr):t1;const maxB=-Iend;
   const item=P([["cakes","bakery"],["bagels","bagel shop"],["bottles of juice","juice bar"],["pies","pie shop"]]);
   return{title:"The "+item[1],intro:`<p>Demand of <b>${N} customers</b> arrives evenly between <b>${clock(t1)} and ${clock(t2)}</b>; each customer buys <b>${k}</b> ${item[0]}. The shop opens at ${clock(t1)} and closes after serving all customers. If nothing is available, customers wait until enough is produced. Production runs at a fixed <b>${Pr} ${item[0]}/hour starting at ${clock(s)}</b> and stops after all customers are served. Treat supply and demand as continuous.</p><p class="sub">Answer clock times as decimal hours on a 24-hour clock (e.g., 14.5 = 2:30pm).</p>`,qs:[
    num("When will the last customer be served?",last,"hour (24h)",[`Demand rate = ${N} × ${k} / ${dur} h = ${fmt(D,2)} per hour; total = ${tot}`,`Production needed: ${tot} / ${Pr} per hr = ${fmt(tot/Pr,2)} h after ${clock(s)}`,`Last customer served at <b>${clock(last)} = ${fmt(last,2)}</b> (later than the last arrival at ${clock(t2)}, because there is a backlog)`],{tol:0.02}),
    num("What is the largest backlog during the day (in units)?",maxB,item[0],[`Inventory at ${clock(t1)}: ${Pr} × ${t1-s} = ${fmt(I1,1)}`,`From ${clock(t1)} the level changes at ${Pr} − ${fmt(D,2)} = ${fmt(Pr-D,2)} per hour${I1>0?`, hitting 0 at ${clock(runOut)}`:""}`,`The backlog grows until arrivals stop at ${clock(t2)}: ${fmt(I1,1)} + (${fmt(Pr-D,2)}) × ${dur} = ${fmt(Iend,1)}`,`Largest backlog = <b>${fmt(maxB,1)}</b>`],{tol:Math.max(0.6,maxB*0.01)}),
    ...(I1>0?[num("At what time does the shop first run out of stock?",runOut,"hour (24h)",[`Solve ${Pr}(t − ${s}) = ${fmt(D,2)}(t − ${t1})`,`t = (${fmt(D,2)}×${t1} − ${Pr}×${s}) / (${fmt(D,2)} − ${Pr}) = <b>${fmt(runOut,2)}</b> (${clock(runOut)})`],{tol:0.03})]:[])]};}
  return B.single.gen();}};
B.multi={half:1,title:"Multiple flow units: implied utilization, bottleneck, max demand",mod:"multi",gen(){
  for(let t=0;t<300;t++){const types=P([["bowls","salads","juices"],["burritos","bowls","drinks"],["pizzas","pastas","salads"],["lattes","teas","smoothies"]]);
   let mix=P([[25,35,40],[30,50,20],[40,40,20],[20,30,50],[50,30,20]]);const dem=P([4,5,6,8,10]);
   const res=[{n:"Wash & prep",v:[1,1,0]},{n:"Cooking",v:[1,0,0]},{n:"Cold cutting",v:[0,1,0]},{n:"Blend/press",v:[0,0,1]},{n:"Assemble & pack",v:[1,1,1]}];
   if(R(0,1))res[0].v=[1,1,1];
   res.forEach(r=>{r.p=P([0.2,0.25,0.3,0.4,0.5,0.6,0.75,1,1.5,2]);r.d=dem*r.v.reduce((a,x,i)=>a+x*mix[i]/100,0);r.m=Math.max(1,Math.round(r.d*r.p/(0.4+Math.random()*0.8)));r.cap=r.m/r.p;r.iu=r.d/r.cap;});
   const mx=Math.max(...res.map(r=>r.iu));if(res.filter(r=>Math.abs(r.iu-mx)<0.01).length>1||mx<0.7||mx>1.35||res.some(r=>r.m>8))continue;const bi=res.findIndex(r=>r.iu===mx);const k=R(0,4);
   const route=i=>res.filter(r=>r.v[i]).map(r=>r.n).join(" → ");
   return{title:"Fast-casual restaurant",intro:`<p>Demand at peak: <b>${dem} orders per minute</b>; each customer orders one item; mix: <b>${mix.map((m,i)=>m+"% "+types[i]).join(", ")}</b>.</p><table class="t"><tr><th>Step</th><th>m (workers)</th><th>Time (min/order)</th></tr>${res.map(r=>`<tr><td>${r.n}</td><td>${r.m}</td><td>${r.p}</td></tr>`).join("")}</table><p>Routes: ${types.map((ty,i)=>`<b>${ty}</b>: ${route(i)}`).join(" · ")}</p>`,qs:[
    num(`Find the implied utilization of ${res[k].n}.`,res[k].iu*100,"%",[`Demand at ${res[k].n} = ${dem} × (${res[k].v.map((x,i)=>x?mix[i]+"%":null).filter(Boolean).join(" + ")}) = ${fmt(res[k].d,2)}/min`,`Capacity = ${res[k].m}/${res[k].p} = ${fmt(res[k].cap,2)}/min`,`Implied utilization = <b>${fmt(res[k].iu*100,1)}%</b>`]),
    mc("Where is the bottleneck?",res.map(r=>r.n).concat(["It cannot be determined"]),bi,res.map(r=>`${r.n} ${fmt(r.iu*100,0)}%`).join(", ")+" → highest implied utilization is the bottleneck."),
    num("What is the highest demand (orders per minute) they can serve with this mix? Use two decimals.",dem/mx,"orders/minute",[`Highest implied utilization = ${fmt(mx*100,1)}% (${res[bi].n})`,`Max demand = ${dem} / ${fmt(mx,4)} = <b>${fmt(dem/mx,2)}</b>`],{tol:0.011})]};}return B.staffed.gen();}};
/* ---- second half (topics after HW1: WAIT, LOSS, QUALITY, LEAN, LITTLE people, attrition) ---- */
B.queue={half:2,title:"Waiting time formula (m servers)",mod:"wait",gen(){
  const m=P([1,1,2,3,4,5]),p=R(3,12),u=P([0.6,0.7,0.75,0.8,0.85,0.9]);const a=T(p/(u*m));const cva=P([1,1,0.5]),sdp=T(p*P([0.5,1,0.75,0.25]));
  const r=OM.waitTq(a,a*cva,p,sdp,m);const ex=Math.sqrt(2*(m+1))-1;const ctx=P(["help desk answering emails","pharmacy counter","clinic triage nurses","bank tellers","IT ticket team"]);
  return{title:"Service desk",intro:`<p>A ${ctx}: requests arrive on average every <b>${a} minutes</b> (st.dev ${T(a*cva)} min). There ${m>1?`are <b>${m}</b> servers`:"is <b>1</b> server"}; service takes <b>${p} minutes</b> on average (st.dev ${sdp} min).</p>`,qs:[
   num("What is the utilization of the servers?",r.u*100,"%",[`u = p/(a·m) = ${p}/(${a}×${m}) = <b>${fmt(r.u*100,1)}%</b>`]),
   num("What is the average time a request waits before service begins?",r.Tq,"minutes",[`Service factor p/m = ${fmt(p/m,3)}`,`Utilization factor u<sup>${fmt(ex,3)}</sup>/(1−u) = ${fmt(r.f2,3)}`,`Variability (CVa² + CVp²)/2 = (${fmt(cva,2)}² + ${fmt(sdp/p,2)}²)/2 = ${fmt(r.f3,3)}`,`Tq = <b>${fmt(r.Tq,2)} min</b>`],{tol:Math.max(0.05,r.Tq*0.02)}),
   num("On average, how many requests are waiting (not yet in service)?",r.Tq/a,"requests",[`Little's Law: Iq = Tq / a = ${fmt(r.Tq,3)}/${a} = <b>${fmt(r.Tq/a,2)}</b>`],{tol:Math.max(0.03,r.Tq/a*0.02)}),
   num("What is the average total time in the system (wait + service)?",r.Tq+p,"minutes",[`T = Tq + p = ${fmt(r.Tq,2)} + ${p} = <b>${fmt(r.Tq+p,2)}</b>`],{tol:Math.max(0.05,(r.Tq+p)*0.015)})]};}};
B.transient={half:2,title:"Transient queue (demand > capacity for a while)",mod:"wait",gen(){
  const cap=R(1,4),dem=cap+R(1,3),Tm=P([20,30,40,45,60]);const L=(dem-cap)*Tm,dep=L/cap,tot=0.5*(Tm+dep)*L,n=dem*Tm;
  return{title:"Pick-up window",intro:`<p>For <b>${Tm} minutes</b>, customers arrive at <b>${dem} per minute</b>. The counter serves <b>${cap} per minute</b>. After that, no more customers arrive; everybody waits to be served.</p>`,qs:[
   num("What is the implied utilization during the rush?",dem/cap*100,"%",[`${dem}/${cap} = <b>${fmt(dem/cap*100,0)}%</b> → a transient queue (waiting formula doesn't apply)`]),
   num("What is the longest queue?",L,"customers",[`Build-up rate ${dem} − ${cap} = ${dem-cap}/min × ${Tm} = <b>${L}</b>`]),
   num("How long after the rush ends is the queue gone?",dep,"minutes",[`${L} / ${cap} per min = <b>${fmt(dep,2)} min</b>`]),
   num("What is the average wait per customer?",tot/n,"minutes",[`Total wait = ½ × (${Tm} + ${fmt(dep,2)}) × ${L} = ${fmt(tot,1)} customer-min`,`÷ ${n} customers = <b>${fmt(tot/n,2)} min</b>`])]};}};
B.oee={half:2,title:"OEE and flow time efficiency (%VAT)",mod:"lean",gen(){
  const avail=P([16,18,20,24]),n=R(8,30),va=P([20,25,30,40,45]);const vah=n*va/60;if(vah>=avail)return B.oee.gen();const flow=R(90,300),vat=R(10,40);
  return{title:"Imaging center",intro:`<p>An MRI scanner is available <b>${avail} hours</b> per day and performs <b>${n} scans</b> a day; each scan is <b>${va} minutes</b> of value-adding time. A patient spends <b>${flow} minutes</b> in the center, of which <b>${vat} minutes</b> add value.</p>`,qs:[
   num("What is the OEE of the scanner?",vah/avail*100,"%",[`Value-add time = ${n} × ${va} = ${n*va} min = ${fmt(vah,2)} h`,`OEE = ${fmt(vah,2)}/${avail} = <b>${fmt(vah/avail*100,1)}%</b>`]),
   num("What is the patient's flow time efficiency (%VAT)?",vat/flow*100,"%",[`${vat}/${flow} = <b>${fmt(vat/flow*100,1)}%</b>`])]};}};
B.attrition={half:2,title:"Attrition / yield & implied utilization",mod:"multi",gen(){
  const arr=R(10,40),y1=P([0.3,0.4,0.5,0.6]),y2=P([0.4,0.5,0.6,0.7]);const s=[{n:"Screen",p:P([5,6,8,10,12])},{n:"Interview",p:P([30,40,45,60])},{n:"Final review",p:P([20,30,40])}];
  const d=[arr,arr*y1,arr*y1*y2];s.forEach((x,i)=>{x.d=d[i];x.m=Math.max(1,Math.round(x.d*x.p/60/(0.5+Math.random()*0.7)));x.cap=x.m/x.p*60;x.iu=x.d/x.cap;});const mx=Math.max(...s.map(x=>x.iu));const bi=s.findIndex(x=>x.iu===mx);const Q=R(2,8);
  return{title:"Recruiting funnel",intro:`<p><b>${arr} applications/hour</b> arrive. ${s.map((x,i)=>`<b>${x.n}</b>: ${x.m} staff, ${x.p} min each${i<2?` → ${Math.round([y1,y2][i]*100)}% pass`:""}`).join("; ")}.</p>`,qs:[
   num("What is the process yield (share of applications that reach the end)?",y1*y2*100,"%",[`${y1} × ${y2} = <b>${fmt(y1*y2*100,1)}%</b>`]),
   num(`What is the implied utilization of ${s[1].n}?`,s[1].iu*100,"%",[`Demand = ${arr} × ${y1} = ${fmt(s[1].d,2)}/hr`,`Capacity = ${s[1].m}/${s[1].p} × 60 = ${fmt(s[1].cap,2)}/hr`,`<b>${fmt(s[1].iu*100,1)}%</b>`]),
   mc("Which step is the bottleneck?",s.map(x=>x.n).concat(["Cannot be determined"]),bi,s.map(x=>`${x.n}: ${fmt(x.d,2)}/${fmt(x.cap,2)} = ${fmt(x.iu*100,0)}%`).join("; ")),
   num(`How many applications per hour are needed for ${Q} candidates per hour to complete the process?`,Q/(y1*y2),"applications/hour",[`${Q} / ${fmt(y1*y2,3)} = <b>${fmt(Q/(y1*y2),2)}</b>`])]};}};
B.loss={half:2,title:"Erlang loss (no waiting room)",mod:"loss",gen(){
  const a=P([10,15,20,30,60]),r=P([1,1.5,2,2.5,3]),p=a*r,m=R(2,5);const Pm=OM.erlang(r,m);const tgt=P([5,10]);let need=1;while(OM.erlang(r,need)>tgt/100)need++;
  return{title:"Trauma bays",intro:`<p>Patients arrive on average every <b>${a} minutes</b> (random arrivals) and occupy a bay for <b>${p} minutes</b>. There are <b>${m} bays</b>; when all are occupied, the ambulance is diverted (no waiting).</p>`,qs:[
   num("What is the probability that an arriving patient is diverted?",Pm*100,"%",[`r = p/a = ${p}/${a} = ${r}`,`P<sub>${m}</sub>(${r}) = (r^m/m!) / Σ r^k/k! = <b>${fmt(Pm*100,2)}%</b>`],{tol:Math.max(0.3,Pm*100*0.02)}),
   num("How many patients per hour are treated?",60/a*(1-Pm),"patients/hour",[`Arrivals = 60/${a} = ${fmt(60/a,2)}/hr`,`× (1 − ${fmt(Pm,4)}) = <b>${fmt(60/a*(1-Pm),3)}</b>`],{tol:0.02}),
   num(`What is the minimum number of bays so that at most ${tgt}% of patients are diverted?`,need,"bays",[`Try m = 1, 2, …: ${[1,2,3,4,5,6,7].map(k=>`P${k} = ${fmt(OM.erlang(r,k)*100,1)}%`).join(", ")}`,`Smallest m with P ≤ ${tgt}% → <b>${need}</b>`],{tol:0.01})]};}};
B.quality={half:2,title:"Process capability & defects",mod:"quality",gen(){
  const mu=R(20,500),sd=P([0.5,1,2,2.5,4]),k=P([1.5,2,2.5,3]);const lsl=T(mu-k*sd),usl=T(mu+k*sd);const pdef=2*(1-OM.normcdf(k))*100;
  return{title:"Filling line",intro:`<p>Fill weight is normally distributed with mean <b>${mu} g</b> and standard deviation <b>${sd} g</b>. Specification: <b>${lsl} – ${usl} g</b>.</p>`,qs:[
   num("What is the process capability Cp?",(usl-lsl)/(6*sd),"",[`(${usl} − ${lsl}) / (6 × ${sd}) = <b>${fmt((usl-lsl)/(6*sd),3)}</b>`],{tol:0.02}),
   num("What percentage of units is defective?",pdef,"%",[`z = (${usl} − ${mu})/${sd} = ${k}`,`2 × (1 − Φ(${k})) = <b>${fmt(pdef,3)}%</b>`],{tol:Math.max(0.02,pdef*0.03)}),
   num("What standard deviation would make this a six-sigma process?",(usl-lsl)/12,"g",[`Six sigma ⇔ Cp = 2 ⇔ USL − LSL = 12σ`,`σ = ${fmt(usl-lsl,2)}/12 = <b>${fmt((usl-lsl)/12,3)}</b>`],{tol:0.005})]};}};
B.people={half:2,title:"Little's Law & employee turnover",mod:"little",gen(){
  const N=R(4,80)*1000,ten=P([1.5,2,2.5,3,4,5,6,9]);const I=R(20,200),Rr=R(10,90);
  return{title:"People and flows",intro:`<p>A firm has <b>${N.toLocaleString()}</b> employees with an average tenure (time with the company so far) of <b>${ten} years</b>. Separately, an ER sees <b>${Rr} patients per day</b> and has on average <b>${I}</b> patients present.</p>`,qs:[
   num("What is the average tenure on the day an employee leaves?",2*ten,"years",[`Average tenure = ½ × tenure at departure → <b>${2*ten}</b>`]),
   num("How many employees must be hired per year to keep headcount constant?",N/(2*ten),"hires/year",[`R = I/T = ${N}/${2*ten} = <b>${fmt(N/(2*ten),0)}</b>`],{tol:Math.max(1,N/(2*ten)*0.01)}),
   num("What is the average time a patient spends in the ER?",I/Rr*24,"hours",[`T = I/R = ${I}/${Rr} day = ${fmt(I/Rr,4)} day`,`× 24 = <b>${fmt(I/Rr*24,2)} h</b>`])]};}};
B.concepts={half:2,title:"Concept questions (MC)",mod:null,gen(){
  const pool=[];OM.modules.forEach(m=>(m.checks||[]).forEach(q=>{if(!q.multi)pool.push(q);}));const pick=shuffle(pool).slice(0,3);
  return{title:"Concepts",intro:"<p>Circle the best answer.</p>",qs:pick.map(q=>mc(q.q,q.opts,q.a,q.why))};}};

B.setup={half:2,title:"Set-ups & batch sizes (variety)",mod:"multi",gen(){
  const S=P([20,30,45,60,90,120]),p=P([0.25,0.5,1,1.5,2]);const B0=R(3,30)*10;const cap=B0/(S+B0*p);const Rr=T((1/p)*P([0.3,0.4,0.5,0.6,0.7]));const Bn=Rr*S/(1-Rr*p);
  return{title:"Stamping press",intro:`<p>A press needs a <b>${S}-minute</b> set-up before each batch; each part then takes <b>${p} minutes</b>.</p>`,qs:[
   num(`With a batch size of ${B0}, what is the capacity (parts per hour)?`,cap*60,"parts/hour",[`Batch time = ${S} + ${B0} × ${p} = ${S+B0*p} min`,`${B0}/${S+B0*p} × 60 = <b>${fmt(cap*60,2)}</b>`]),
   num(`Demand is ${Rr} parts per minute. What is the smallest batch size that meets demand?`,Bn,"parts",[`B = R·S/(1 − R·p) = ${Rr}×${S}/(1 − ${Rr}×${p})`,`= <b>${fmt(Bn,2)}</b>`]),
   mc("Cutting the set-up time in half (same demand) lets you…",["Use smaller batches → less inventory, same output","Only increase inventory","Lower the processing time","Nothing changes"],0,"Required batch B = R·S/(1−R·p) is proportional to S.")]};}};
B.priority={half:2,title:"Priority rules (FCFS vs SPT)",mod:"wait",gen(){
  const jobs=[R(2,15),R(2,15),R(2,15),R(2,15)];const w=a=>{let t=0,s=0;a.forEach(x=>{s+=t;t+=x;});return s/a.length;};const spt=jobs.slice().sort((a,b)=>a-b);
  return{title:"Copy shop jobs",intro:`<p>Four jobs are waiting at time 0 (in arrival order): <b>${jobs.join(", ")} minutes</b>. One machine.</p>`,qs:[
   num("Average waiting time (before a job starts) under FCFS?",w(jobs),"minutes",[`Starts: ${jobs.map((x,i)=>jobs.slice(0,i).reduce((a,b)=>a+b,0)).join(", ")}`,`Average = <b>${fmt(w(jobs),2)}</b>`]),
   num("Average waiting time under SPT (shortest first)?",w(spt),"minutes",[`Order ${spt.join(", ")}; starts ${spt.map((x,i)=>spt.slice(0,i).reduce((a,b)=>a+b,0)).join(", ")}`,`Average = <b>${fmt(w(spt),2)}</b>`]),
   mc("Which statement is true?",["SPT minimizes the average wait but long jobs may wait a long time","FCFS always minimizes the average wait","SPT increases total work","Priority rules change capacity"],0,"Priority rules reorder who waits; SPT minimizes the average.")]};}};
B.kpi={half:2,title:"KPI tree & operating leverage",mod:"kpi",gen(){
  const q=R(20,80)*10,pr=R(6,20),vc=R(1,pr-3),fc=Math.round(q*(pr-vc)*P([0.6,0.7,0.8])),inc=P([5,10,20]);const p0=q*(pr-vc)-fc,p1=q*(1+inc/100)*(pr-vc)-fc;const dem=Math.round(q*(1+inc/200));
  return{title:"Capacity and profit",intro:`<p>A shop is capacity-constrained at <b>${q} units/day</b> (demand is higher). Price <b>$${pr}</b>, variable cost <b>$${vc}</b>/unit, fixed cost <b>$${fc}</b>/day.</p>`,qs:[
   num("What is the profit per day?",p0,"$/day",[`${q} × (${pr} − ${vc}) − ${fc} = <b>$${fmt(p0)}</b>`]),
   num(`A process improvement raises bottleneck capacity by ${inc}% and demand is unlimited. New profit per day?`,p1,"$/day",[`Volume ${fmt(q*(1+inc/100))} × ${pr-vc} − ${fc} = <b>$${fmt(p1)}</b>`]),
   num(`If instead demand were only ${dem} units/day, what would the profit be after the improvement?`,Math.min(dem,q*(1+inc/100))*(pr-vc)-fc,"$/day",[`Flow rate = min(${dem}, ${fmt(q*(1+inc/100))}) = ${fmt(Math.min(dem,q*(1+inc/100)))}`,`× ${pr-vc} − ${fc} = <b>$${fmt(Math.min(dem,q*(1+inc/100))*(pr-vc)-fc)}</b>`])]};}};
B.frontier={half:2,title:"Efficiency frontier (Pareto dominance)",mod:"intro",gen(){
  for(let t=0;t<200;t++){const f=["P","Q","R","S","T"].map(n=>({n,c:T(2+Math.random()*3),w:R(10,120)}));
   const dom=x=>f.some(y=>y!==x&&y.c<=x.c&&y.w<=x.w&&(y.c<x.c||y.w<x.w));const on=f.filter(x=>!dom(x));const off=f.filter(dom);if(on.length<2||off.length<1)continue;
   const tgt=P(off);const by=f.find(y=>y!==tgt&&y.c<=tgt.c&&y.w<=tgt.w);const others=shuffle(f.filter(x=>x!==by&&x!==tgt)).slice(0,3);const opts=shuffle([by,...others]);
   return{title:"Call center benchmarking",intro:`<p>Five call centers (lower is better for both):</p><table class="t" style="max-width:380px"><tr><th>Firm</th><th>$ per call</th><th>Avg wait (sec)</th></tr>${f.map(x=>`<tr><td>${x.n}</td><td>${x.c.toFixed(2)}</td><td>${x.w}</td></tr>`).join("")}</table>`,qs:[
    num("How many firms are on the efficiency frontier?",on.length,"firms",[`A firm is off the frontier if another is at least as good on both and better on one.`,`On the frontier: <b>${on.map(x=>x.n).join(", ")}</b> → ${on.length}`],{tol:0.01}),
    mc(`Firm ${tgt.n} is Pareto dominated by which firm?`,opts.map(x=>"Firm "+x.n),opts.indexOf(by),`${by.n}: $${by.c.toFixed(2)} ≤ $${tgt.c.toFixed(2)} and ${by.w} ≤ ${tgt.w} sec.`)]};}
  return B.single.gen();}};
OM.examBlocks=B;

/* ---------- exam state ---------- */
const MODES={half1:{name:"HW1-style half exam",desc:"Exactly HW1's structure: 7 scenarios, ~22 questions (single resource, parallel stations, staffed steps, labor cost/takt/manpower, turns, build-up, multiple flow units).",blocks:["single","parallel","staffed","labor","turns","buildup","multi"],min:60},
 half2:{name:"Second-half exam (HW2-style topics)",desc:"Waiting time formula, transient queues, OEE/%VAT, attrition, Erlang loss, quality, Little's Law with people, concept MCs. (Adjusted once HW2 is uploaded.)",blocks:["queue","transient","oee","attrition","setup","loss","quality","people","kpi","concepts"],min:70},
 full:{name:"Full mock final (2 hours)",desc:"Both halves, like last year's final = HW1 + HW2. About 40+ questions.",blocks:["single","parallel","staffed","labor","turns","buildup","multi","queue","transient","oee","attrition","setup","loss","quality","concepts"],min:120}};
let X=null;  // current exam {mode, blocks:[{type,title,intro,qs}], start, end, answers, submitted}
function newExam(mode){const M=MODES[mode];X={mode,blocks:M.blocks.map(t=>Object.assign({type:t},B[t].gen())),start:Date.now(),end:Date.now()+M.min*60000,answers:{},submitted:false};saveExam();}
function loadExam(){const d=E.load().drafts||{};X=d.exam?JSON.parse(JSON.stringify(d.exam)):null;}
/* the in-progress exam lives in the synced record (drafts.exam) so it continues on any device */
function saveExam(){const s=E.load();s.drafts=s.drafts||{};s.drafts.exam=X;E.save(s);}
function isRight(q,v){if(q.opts)return v!=null&&v!==""&&+v===q.a;if(v==null||v==="")return false;return !!E.numOk(q,v);}

/* ---------- rendering ---------- */
let timer=null;
function qBox(q,id,n,show){const v=X.answers[id];let body;
  if(q.opts)body=`<div class="opts">${q.opts.map((o,i)=>`<label class="opt ${show?(i===q.a?"right":(+v===i?"wrong":"")):""}"><input type="radio" name="${id}" value="${i}" data-x="ans" data-id="${id}" ${+v===i&&v!==undefined&&v!==""?"checked":""} ${show?"disabled":""}> ${String.fromCharCode(65+i)}. ${o}</label>`).join("")}</div>`;
  else body=`<div class="calcrow"><input type="text" inputmode="decimal" data-x="ans" data-id="${id}" value="${esc(v||"")}" ${show?"disabled":""} placeholder="answer"><span class="unit">${esc(q.unit||"")}</span></div>`;
  let fb="";if(show){const ok=isRight(q,v);fb=`<div class="fb show ${ok?"ok":"no"}">${ok?"✅ Correct":"❌ "+(v===undefined||v===""?"Blank":"Wrong")} · Answer: <b>${q.opts?String.fromCharCode(65+q.a)+". "+q.opts[q.a]:fmt(q.ans,3)+" "+esc(q.unit||"")}</b>${q.opts?`<br>${q.why||""}`:`<ol style="margin:6px 0 0;padding-left:20px">${q.steps.map(s=>`<li>${s}</li>`).join("")}</ol>`}</div>`;}
  return `<div class="q"><div class="qh"><span class="qn">Q${n}.</span><div>${q.q}</div></div>${body}${fb}</div>`;}
function examHTML(){let n=0;const show=X.submitted;
  return X.blocks.map((b,bi)=>`<div class="lsec"><h3><span class="stepnum">${bi+1}</span>${esc(b.title)} ${show?`<span class="src">${esc(B[b.type].title)}</span>`:""}</h3>${b.intro}${b.qs.map((q,qi)=>qBox(q,bi+"_"+qi,++n,show)).join("")}${show&&B[b.type].mod?`<p class="sub" style="font-size:14px">Review: <a href="#m/${B[b.type].mod}">${esc(B[b.type].mod.toUpperCase())} module</a> · <a href="#drill/${b.type}">drill this question type →</a></p>`:""}</div>`).join("");}
function score(){let ok=0,n=0;X.blocks.forEach((b,bi)=>b.qs.forEach((q,qi)=>{n++;if(isRight(q,X.answers[bi+"_"+qi]))ok++;}));return{ok,n};}
function tick(){const el=document.getElementById("xtimer");if(!el||!X||X.submitted){clearInterval(timer);return;}const left=Math.max(0,X.end-Date.now());const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=`⏱ ${m}:${String(s).padStart(2,"0")} left`;el.style.color=left<300000?"#c0392b":"";}
function submit(){if(!X||X.submitted)return;X.submitted=true;saveExam();const s=E.load();const base=Date.now();let i=0;
  X.blocks.forEach((b,bi)=>b.qs.forEach((q,qi)=>{const v=X.answers[bi+"_"+qi];(s.mc["xt:"+b.type]=s.mc["xt:"+b.type]||[]).push({ts:base+(i++),ok:isRight(q,v),a:String(v==null?"":v).slice(0,20)});}));
  const sc=score();(s.mc["xs:"+X.mode]=s.mc["xs:"+X.mode]||[]).push({ts:base+(i++),ok:sc.ok/sc.n>=0.8,a:sc.ok+"/"+sc.n+" in "+Math.round((Date.now()-X.start)/60000)+" min"});E.save(s);}

function typeStats(){const s=E.load();return Object.keys(B).map(t=>{const h=s.mc["xt:"+t]||[];const last=h.slice(-12);return{t,n:h.length,acc:last.length?last.filter(x=>x.ok).length/last.length:null};});}
function pExam(h){E.nav("exam");const app=E.APP;
  if(h[1]==="run"){loadExam();if(!X){location.hash="#exam";return;}
    const sc=X.submitted?score():null;const M=MODES[X.mode];
    app.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › <a href="#exam">Exam Practice</a> › ${esc(M.name)}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;position:sticky;top:52px;background:var(--bg);padding:8px 0;z-index:9;border-bottom:1px solid var(--line)"><h1 style="margin:0;font-size:24px">${esc(M.name)}</h1>${X.submitted?`<b style="font-size:20px">Score: ${sc.ok}/${sc.n} (${Math.round(sc.ok/sc.n*100)}%)</b>`:`<span id="xtimer" style="font-weight:800;font-size:18px"></span><button class="btn" data-x="submit">Submit exam</button>`}</div>
    ${X.submitted?`<div class="callout ${sc.ok/sc.n>=0.8?"key":"trap"}"><b>${sc.ok/sc.n>=0.9?"🏆 Exam-ready on these question types.":sc.ok/sc.n>=0.8?"👍 Solid. Review the misses below.":"📚 Keep drilling."}</b>Every question shows the full solution below. Each block links to its module and to a drill for that question type. <button class="btn small" data-x="new" data-mode="${X.mode}">🎲 New exam (same mode)</button></div>`:`<div class="callout note"><b>Exam conditions</b>1 point per question, no partial credit, no feedback until you submit. Use a calculator and your own cheat-sheet draft only. Your answers are kept if you leave this page.</div>`}
    ${examHTML()}${X.submitted?"":`<p><button class="btn" data-x="submit">Submit exam</button></p>`}`;
    clearInterval(timer);if(!X.submitted){timer=setInterval(tick,1000);tick();}return;}
  const st=typeStats();const s=E.load();const hist=[];Object.keys(MODES).forEach(k=>(s.mc["xs:"+k]||[]).forEach(e=>hist.push(Object.assign({k},e))));hist.sort((a,b)=>b.ts-a.ts);
  app.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Exam Practice</div><h1>🎯 Exam Practice (HW1 format)</h1>
  <p class="sub">The final looks like the homework: business scenarios, each followed by 2–4 questions with a <b>numeric answer box</b> (or circle-one), <b>1 point each, no partial credit</b>. Every mock exam below is <b>generated fresh</b> with new businesses and numbers, so you can take as many as you want.</p>
  <div class="grid">${Object.keys(MODES).map(k=>`<div class="card ${k==="half1"?"primary":""}"><h3>${esc(MODES[k].name)}</h3><p class="sub" style="margin:0 0 8px">${esc(MODES[k].desc)}</p><span class="pill">⏱ ${MODES[k].min} min</span><span class="pill">${MODES[k].blocks.length} scenarios</span><div style="margin-top:10px"><button class="btn" data-x="new" data-mode="${k}">▶ Start a new exam</button></div></div>`).join("")}</div>
  ${(()=>{loadExam();return X&&!X.submitted?`<div class="callout gold" style="background:var(--gold-l);border-color:var(--gold)"><b>⏸ You have an unfinished exam</b><a class="btn small" href="#exam/run">Resume →</a></div>`:"";})()}
  <h2>🔁 Drill one question type</h2><p class="sub">Your accuracy on each exam question type (last 12 answers). Drill the red ones until they're green.</p>
  <table class="t"><tr><th>Question type</th><th>Half</th><th>Answered</th><th>Recent accuracy</th><th></th></tr>${st.map(x=>`<tr><td>${esc(B[x.t].title)}</td><td>${B[x.t].half===1?"HW1 / 1st half":"2nd half"}</td><td>${x.n}</td><td>${x.acc==null?"–":`<b style="color:${x.acc>=0.8?"#1e8449":x.acc>=0.6?"#b7791f":"#c0392b"}">${Math.round(x.acc*100)}%</b>`}</td><td><a class="btn small ${x.acc!=null&&x.acc<0.8?"gold":"ghost"}" href="#drill/${x.t}">Drill →</a></td></tr>`).join("")}</table>
  <h2>📜 My mock exam history</h2>${hist.length?`<table class="t"><tr><th>When</th><th>Mode</th><th>Score</th></tr>${hist.slice(0,30).map(e=>`<tr><td>${new Date(e.ts).toLocaleString([],{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</td><td>${esc(MODES[e.k].name)}</td><td>${esc(e.a)}</td></tr>`).join("")}</table>`:"<p class='sub'>No exams yet. Start with the HW1-style half exam.</p>"}`;}
let D=null;
function pDrill(h,keep){E.nav("exam");const t=h[1];if(!B[t]){location.hash="#exam";return;}if(!D||D.t!==t||(D.done&&!keep))D={t,b:B[t].gen(),ans:{},done:false};
  const b=D.b;const show=D.done;let n=0;
  E.APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › <a href="#exam">Exam Practice</a> › Drill</div><h1>🔁 ${esc(B[t].title)}</h1>
  <p class="sub">One exam-style scenario at a time. Answer all, then check. ${B[t].mod?`Need a refresher? <a href="#m/${B[t].mod}">Open the ${B[t].mod.toUpperCase()} lesson</a>.`:""}</p>
  <div class="lsec"><h3>${esc(b.title)}</h3>${b.intro}${b.qs.map((q,qi)=>{const sv=X;X={answers:D.ans};const html=qBox(q,"d_"+qi,++n,show);X=sv;return html;}).join("")}</div>
  <p>${show?`<button class="btn gold" data-x="dnext">🎲 Next scenario</button>`:`<button class="btn" data-x="dcheck">Check answers</button>`} <a class="btn ghost" href="#exam">Back to Exam Practice</a></p>`;}
function dCheck(){const s=E.load();const base=Date.now();D.b.qs.forEach((q,qi)=>{(s.mc["xt:"+D.t]=s.mc["xt:"+D.t]||[]).push({ts:base+qi,ok:isRight(q,D.ans["d_"+qi]),a:String(D.ans["d_"+qi]==null?"":D.ans["d_"+qi]).slice(0,20)});});E.save(s);D.done=true;pDrill(["drill",D.t],true);}

E.APP.addEventListener("input",e=>{const el=e.target;if(el.dataset.x!=="ans")return;const id=el.dataset.id;if(id.startsWith("d_")){if(D&&!D.done)D.ans[id]=el.value;return;}if(X&&!X.submitted){X.answers[id]=el.value;saveExam();}});
E.APP.addEventListener("change",e=>{const el=e.target;if(el.dataset.x!=="ans"||el.type!=="radio")return;const id=el.dataset.id;if(id.startsWith("d_")){if(D&&!D.done)D.ans[id]=el.value;return;}if(X&&!X.submitted){X.answers[id]=el.value;saveExam();}});
E.APP.addEventListener("click",e=>{const b=e.target.closest("[data-x]");if(!b||b.dataset.x==="ans")return;const x=b.dataset.x;
  if(x==="new"){loadExam();if(X&&!X.submitted&&!confirm("Discard your unfinished exam and start a new one?"))return;newExam(b.dataset.mode);location.hash="#exam/run";if(E.APP.dataset.page==="exam/run")pExam(["exam","run"]);}
  if(x==="submit"){const sc=(()=>{let blank=0;X.blocks.forEach((bl,bi)=>bl.qs.forEach((q,qi)=>{const v=X.answers[bi+"_"+qi];if(v==null||v==="")blank++;}));return blank;})();if(sc&&!confirm(sc+" question(s) are blank. Submit anyway?"))return;submit();pExam(["exam","run"]);scrollTo(0,0);}
  if(x==="dcheck")dCheck();
  if(x==="dnext"){D=null;pDrill(["drill",location.hash.split("/")[1]]);scrollTo(0,0);}});

/* ---------- exam playbook ---------- */
function pPlaybook(){E.nav("playbook");const rows=[
 ["“X can do A per hour, demand is B per hour”","Flow rate = min(A, B); utilization = flow rate / A; cycle time = 1/flow rate (not 1/capacity)","Using capacity for cycle time when demand is lower"],
 ["A table of stations/steps with staff or units (m) and minutes","Capacity of each = m/p × 60 → smallest = process capacity (bottleneck)","Picking the longest time instead of the lowest m/p"],
 ["“starting with an empty system… how long for X units”","Sum of processing times + (X − 1) × cycle time (CT = 1/process capacity)","X × labor content, or X × CT"],
 ["“Which action increases capacity the most?”","Recompute process capacity for each option; only bottleneck changes help; check the new bottleneck","Assuming the bigger-looking change wins"],
 ["“labor content”","Sum of all processing times (each step once, staffing irrelevant)","Multiplying by staff"],
 ["“average labor utilization”","Labor content / (CT × total # workers); CT = 1/flow rate","Forgetting workers at multi-staffed steps; using bottleneck CT when demand-constrained"],
 ["“cost of direct labor” with a demand given","Total wages per hour / flow rate, with flow rate = min(demand, capacity)","Labor content × wage (ignores idle time); dividing by capacity"],
 ["“takt time” / “target manpower”","Takt = available time / demand; target manpower = labor content / takt (don't round unless asked)","Using capacity in takt"],
 ["“you have N workers to assign”","Each resource ≥ 1; keep adding to the current bottleneck; check combos","Spreading evenly"],
 ["Revenue, COGS, Inventory","Turns = COGS / Inventory; per-unit cost = annual % / turns × item cost; days = Inv/COGS × 365","Using revenue"],
 ["Supply rate vs demand window (“customers arrive evenly between…”)","Draw the build-up: slope = supply − demand (convert customers → units); last served = start + total units / production rate; max backlog at end of arrivals","Forgetting to convert customers to units; forgetting inventory built before opening"],
 ["Several products with a mix % and a routing diagram","Demand at each resource = total × sum of mix % that visit it; implied util = demand / (m/p); bottleneck = highest; max demand = total / max implied util","Lowest-capacity rule"],
 ["Inter-arrival time, service time, st.devs, m servers","u = p/(a m); Tq formula; Iq = Tq/a; T = Tq + p","Using arrival RATE as a; forgetting to square CVs; u ≥ 1"],
 ["Demand > capacity for a period, then stops","Triangle: longest queue = (in − out) × duration; total wait = ½ × total time × longest queue; avg = total / customers","Using the waiting-time formula"],
 ["Customers lost when all busy","Erlang loss: r = p/a, P_m(r); flow rate = (1 − P_m)/a","Using waiting formula"],
 ["Pass rates / rejections","Demand at a step = arrivals × yields before it; units to start = Q / process yield","Applying yields after the step"],
 ["Mean, σ, spec limits","Cp = (USL − LSL)/6σ; defects = two tails beyond ±z","One tail only"],
 ["Paid time vs value-add time; patient timeline","OEE = value-add / paid time (resource); %VAT = value-add / flow time (flow unit)","Mixing the two"]];
  E.APP.innerHTML=`<div class="crumb"><a href="#home">OIDD 6110</a> › Exam Playbook</div><h1>🧠 Exam Playbook: recognize the question → apply the recipe</h1>
  <p class="sub">On the exam, the hard part is recognizing <b>which</b> tool a scenario wants. Use this table to learn the cue words. It's also the best skeleton for your one-page cheat sheet (write it yourself, as required).</p>
  <table class="t"><tr><th>If the question says / shows…</th><th>Do this</th><th>⚠️ Classic trap</th></tr>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td style="color:#c0392b">${r[2]}</td></tr>`).join("")}</table>
  <h2>⏱ Exam-day strategy (2 hours, ~40 questions ≈ 3 min each)</h2>
  <ol><li><b>First pass</b>: do every scenario's first question (usually the easiest: capacity, flow rate, utilization). Many later questions build on it.</li>
  <li><b>Write units on everything</b> (per hour vs per minute) and convert before you compare.</li>
  <li><b>Check “demand” every time</b>: is the process demand- or capacity-constrained? It changes flow rate, cycle time, utilization and labor cost.</li>
  <li>Keep 3–4 decimals until the final answer; answer in the unit of the answer box.</li>
  <li>No penalty for wrong answers: <b>never leave a box blank</b>.</li>
  <li>Sanity checks: utilization ≤ 100% (implied can exceed); Tq ≥ 0; flow rate ≤ capacity; last customer served after last arrival if there's a backlog.</li></ol>
  <h2>📄 Cheat-sheet layout that matches the exam</h2>
  <div class="grid"><div class="card"><b>Column 1: Process & flow</b><br>capacity m/p · bottleneck · flow rate = min · utilization · CT = 1/R · idle · labor content · avg labor util · cost of direct labor · empty system · takt · target manpower</div>
  <div class="card"><b>Column 2: Little, multi, lean</b><br>I = R·T · turns = COGS/Inv · per-unit cost · days of supply · turnover & tenure (×½) · implied util · yields · units to start · OEE · %VAT · build-up slope recipe</div>
  <div class="card"><b>Column 3: Wait, loss, quality</b><br>u = p/(a m) · Tq (1 and m servers) · Iq, Ip, T · transient triangle · Erlang P_m, flow rate · pooling · Cp · two-tail defects · six sigma = Cp 2</div></div>
  <p><a class="btn" href="#exam">Go practice →</a> <a class="btn ghost" href="#formulas">All formulas</a></p>`;}
OM.pages.exam=pExam;OM.pages.drill=pDrill;OM.pages.playbook=pPlaybook;
})();
