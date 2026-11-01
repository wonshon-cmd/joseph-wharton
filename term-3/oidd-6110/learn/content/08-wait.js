(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
function tq(a,sa,p,sp,m){const u=p/(a*m),f2=Math.pow(u,Math.sqrt(2*(m+1))-1)/(1-u),f3=((sa/a)**2+(sp/p)**2)/2;return{u,f1:p/m,f2,f3,Tq:p/m*f2*f3};}
OM.waitTq=tq;
OM.modules.push({
id:"wait",n:8,code:"WAIT",icon:"⏳",color:"#2a63c7",title:"Waiting Times: Transient Queues & Variability",
status:"slides + lecture",
blurb:"Why lines form: (1) demand > capacity for a while (build-up diagrams, transient queues) and (2) variability even when capacity > demand (the waiting time formula).",
intro:"Americans spend ~37 billion hours a year waiting in line. This module explains <b>both</b> reasons queues happen and gives you the formula the professor uses for call centers, help desks and clinics.",
objectives:["Draw a <b>build-up diagram</b> of inventory/backlog when demand and supply rates differ over time","Compute total and average wait in a <b>transient queue</b> (the triangle)","Quantify variability with the <b>coefficient of variation</b> (CVa, CVp)","Use the <b>waiting time formula</b> for one and for m servers, and Little's Law for queue length","Explain why waiting explodes as utilization → 100%"],
lesson:[
{h:"Two very different reasons for waiting",html:`
<table class="t"><tr><th></th><th>🔺 Transient queue</th><th>🎲 Variability-induced queue</th></tr>
<tr><td>Cause</td><td><b>Demand &gt; capacity</b> for a period (seasonality, a rush)</td><td>Capacity &gt; demand <u>on average</u>, but arrivals and service times are <b>random</b></td></tr>
<tr><td>Implied utilization</td><td>&gt; 100% during the rush (utilization = 100%)</td><td>&lt; 100% (there's idle time too)</td></tr>
<tr><td>Predictable?</td><td>Yes: deterministic, draw it</td><td>Statistical: use the formula</td></tr>
<tr><td>Tool</td><td>Build-up diagram / triangle</td><td>Waiting time formula</td></tr>
<tr><td>Example</td><td>Brewery pick-up at lunch; Queen Elizabeth's lying in state (12-hour lines)</td><td>Email help desk, call center within a half-hour, doctor's office</td></tr></table>
<div class="callout why"><b>💡 What does a queue DO?</b>It <u>rations</u> scarce capacity when demand exceeds supply (alternatives: reservations, prices/auctions). How long people are willing to wait signals how much they value the service.</div>`},
{h:"Build-up diagrams: inventory and backlog over time",html:`
<p>When supply and demand run at <b>constant rates</b> that change at certain times, the stock level changes in straight lines:</p>
<div class="formula"><span class="eq">Slope of the line = Supply rate − Demand rate</span><div class="why">💡 Positive → stock (inventory) builds up. Negative → stock falls, and below zero it's a <b>backlog</b> (customers waiting for product).</div></div>
<p><b>Recipe:</b> ① list the times where any rate changes, ② compute the slope in each period, ③ connect the dots, ④ read off the max/min and when the line returns to 0.</p>
<div class="callout case"><b>🍩 Practice example: Donut shop</b>Bakes <b>60 donuts/hr from 4am</b>. Customers come <b>7am–11am</b> and buy <b>120 donuts/hr</b> in total. Customers wait if there are no donuts; baking continues until everyone is served.</div>
${V("buildup",{pts:[[4,0],[7,180],[10,0],[11,-60],[12,0]],xt:[[4,"4am"],[7,"7am"],[10,"10am"],[11,"11am"],[12,"noon"]],yt:[[180,"180"],[0,"0"],[-60,"−60"]],marks:[[7,180,"peak inventory 180","#0f7b6c"],[11,-60,"largest backlog 60","#c0392b",30]],xl:"Time",yl:"Donuts on shelf (+) / owed (−)",cap:"4–7am: +60/hr → 180. 7–11am: 60 − 120 = −60/hr → hits 0 at 10am, then backlog grows to −60 at 11am. After 11am: +60/hr → backlog cleared at noon."})}
<table class="t"><tr><th>Question</th><th>Answer</th><th>Why</th></tr>
<tr><td>Inventory at 7am</td><td>3 h × 60 = 180</td><td>Baking with no demand</td></tr>
<tr><td>When do donuts run out?</td><td>180 / 60 per hr = 3 h after 7am = <b>10am</b></td><td>Net slope −60/hr</td></tr>
<tr><td>Largest backlog</td><td>1 h × 60 = <b>60 donuts</b> at 11am</td><td>Last customer arrives at 11; backlog peaks there</td></tr>
<tr><td>When is the last customer served?</td><td>60 / 60 per hr = 1 h after 11 → <b>noon</b></td><td>Check: total demand 4 × 120 = 480 = 8 h × 60 baked by noon ✔</td></tr></table>
<div class="callout trap"><b>⚠️ Traps</b>Use the <u>net</u> rate. If customers each buy several units, convert customers/hr into units/hr. Check the answer with a total-units balance (total produced = total demanded at the end).</div>
${OM.T("buildup")}`},
{h:"Transient queue: the triangle method",html:`
<div class="callout case"><b>🍺 Brewery pick-up (from class)</b>Noon–1pm customers arrive on average every 30 sec (<b>2/min</b>); it takes <b>1 min</b> to serve one (1/min); after 1pm nobody arrives; everyone waits.</div>
${V("buildup",{pts:[[0,0],[60,60],[120,0]],xt:[[0,"12:00"],[60,"1:00"],[120,"2:00"]],yt:[[60,"60"],[0,"0"]],marks:[[60,60,"longest queue = 60","#c0392b"]],xl:"Time",yl:"# customers waiting",fill:"rgba(192,57,43,.18)",color:"#c0392b",cap:"Build-up: +1/min (2 in, 1 out) for 60 min. Depletion: −1/min for 60 min. The area of the triangle = total waiting."})}
<ol><li>Implied utilization = demand/capacity = 2/1 = <b>200%</b> → transient queue.</li>
<li>By 1pm: 120 arrived, 60 served → <b>longest queue = 60</b> (at the end of the build-up).</li>
<li>Depletion at 1/min → takes <b>60 min</b> → queue gone at 2pm.</li>
<li><b>Total wait</b> = area of triangle = ½ × (60 + 60 min) × 60 people = <b>3,600 customer-minutes</b> (60 hours).</li>
<li><b>Average wait</b> = 3,600 / 120 customers = <b>30 min</b>. First customer waits 0; last waits the longest.</li></ol>
<div class="formula"><span class="eq">Total wait = ½ × (length of build-up + length of depletion) × longest queue</span>&nbsp;&nbsp;<span class="eq">Average wait = ${fr("Total wait","# customers")}</span></div>`},
{h:"Variability: the Dr. Toyota thought experiment",html:`
<p>Patients arrive <b>exactly</b> every 5 min; each takes <b>exactly</b> 4 min. Utilization = 4/5 = 80%. Does anyone wait? <span class="grn">No!</span> Each patient finds the doctor free.</p>
<p>Now keep the <u>same averages</u> but make arrivals and service random (like real life: arrivals at 0, 7, 9, 12, 18… min; service 5, 6, 7, 6, 5, 2…). Suddenly some patients wait <b>several times</b> their service time, even though the doctor is idle 20% of the time.</p>
<div class="callout key"><b>📌 The insight</b>Queues form even when capacity &gt; demand on average, purely because of <b>variability</b>. Idle time when nobody's there can't be “saved” for later when a burst arrives.</div>
<div class="callout key"><b>📌 Measuring variability: coefficient of variation</b>
<span class="eq">CV<sub>a</sub> = ${fr("St.dev(inter-arrival times)","Average(inter-arrival times)")}</span> &nbsp; <span class="eq">CV<sub>p</sub> = ${fr("St.dev(processing times)","Average(processing times)")}</span><br>
CV = 0 means perfectly regular. Random independent arrivals (Poisson process, exponential inter-arrivals, “no memory”) have <b>CV<sub>a</sub> = 1</b>. CV<sub>p</sub> depends on standardization.</div>
<div class="callout trap"><b>⚠️ Seasonality ≠ variability</b>Predictable patterns (lunch peak, the Edmonton water use spikes during the Olympic hockey final intermissions) are <b>seasonality</b>: plan for them by analyzing each time slot separately (e.g., each 30 min of the call center). <b>Variability</b> is the random noise left within a slot, captured by CV.</div>`},
{h:"The waiting time formula",html:`
<p>Notation: <b>a</b> = average inter-arrival time, <b>p</b> = average processing time, <b>m</b> = number of servers, <b>u = p / (a × m)</b> = utilization (must be &lt; 100%).</p>
<div class="formula"><span class="eq">Time in queue T<sub>q</sub> = <span class="blu">${fr("p","m")}</span> × <span class="red">${fr("u<sup>√(2(m+1)) − 1</sup>","1 − u")}</span> × <span class="pur">${fr("CV<sub>a</sub>² + CV<sub>p</sub>²","2")}</span></span>
<div class="why">With one server (m = 1) the exponent is √4 − 1 = 1, so it becomes <b>T<sub>q</sub> = p × u/(1−u) × (CV<sub>a</sub>² + CV<sub>p</sub>²)/2</b>.</div></div>
<table class="t"><tr><th>Factor</th><th>Meaning (the “why”)</th></tr>
<tr><td><span class="blu">Service time factor p/m</span></td><td>Longer jobs → longer waits. Scales the whole thing.</td></tr>
<tr><td><span class="red">Utilization factor</span></td><td>How busy the servers are. <b>Explodes</b> near 100%: u/(1−u) = 4 at 80%, 9 at 90%, 19 at 95%.</td></tr>
<tr><td><span class="pur">Variability factor</span></td><td>No variability → no waiting (Dr. Toyota). Poisson arrivals + exponential service → factor = 1.</td></tr></table>
${V("waitcurve",{p:1,m:1,cvs:[0.5,1,2],ymax:12,cap:"Waiting time vs utilization for three levels of variability: the hockey stick. Same 10% extra load costs a little at 50% but enormously at 90%."})}
<p>Then use Little's Law for everything else:</p>
<div class="formula"><span class="eq">Flow time T = T<sub>q</sub> + p</span> &nbsp; <span class="eq">I<sub>q</sub> = ${fr("1","a")} × T<sub>q</sub></span> &nbsp; <span class="eq">I<sub>p</sub> = ${fr("1","a")} × p</span> &nbsp; <span class="eq">I = I<sub>q</sub> + I<sub>p</sub></span><div class="why">💡 Flow rate = demand = 1/a (no one is lost since u &lt; 100%). I<sub>p</sub> = m × u = number of busy servers.</div></div>
<div class="callout prof"><b>🎓 No universal “right” utilization</b>Never plan for 100%. Ambulances run ~30% (delay is deadly); coffee shops can run high; the IRS gets away with long waits (no competition). Decide based on the cost of delay. Managers often push utilization up for the marginal revenue and ignore the congestion cost.</div>
${OM.T("wait")}`}
],
formulas:[
{name:"Build-up slope",f:"Change in inventory per time = Supply rate − Demand rate",why:"Positive = inventory builds, negative = backlog grows."},
{name:"Transient queue",f:"Total wait = ½ × (build-up + depletion time) × longest queue; Avg wait = total wait / # customers",why:"Area of the triangle."},
{name:"Coefficient of variation",f:`CV<sub>a</sub> = ${fr("σ inter-arrival","mean inter-arrival")}; CV<sub>p</sub> = ${fr("σ processing","mean processing")}`,why:"Poisson arrivals → CVa = 1."},
{name:"Utilization (m servers)",f:`u = ${fr("p","a × m")}`,why:"Must be < 1 for the formula."},
{name:"Waiting time, 1 server",f:`T<sub>q</sub> = p × ${fr("u","1−u")} × ${fr("CV<sub>a</sub>²+CV<sub>p</sub>²","2")}`,why:"Service × utilization × variability."},
{name:"Waiting time, m servers",f:`T<sub>q</sub> = ${fr("p","m")} × ${fr("u<sup>√(2(m+1))−1</sup>","1−u")} × ${fr("CV<sub>a</sub>²+CV<sub>p</sub>²","2")}`,why:"Reduces to the 1-server formula at m=1."},
{name:"Queue measures",f:"T = T<sub>q</sub> + p; I<sub>q</sub> = T<sub>q</sub>/a; I<sub>p</sub> = p/a; I = I<sub>q</sub> + I<sub>p</sub>",why:"Little's Law with R = 1/a."}
],
worked:[
{title:"Email help desk (class practice example)",src:"Slides WAIT #86",setup:"Emails arrive every <b>2 min</b> on average (st.dev 2 min). <b>3 employees</b>; a response takes <b>4 min</b> on average (st.dev 2 min). Estimate the average wait before being served.",steps:[
{ask:"Identify a, p, m and the CVs.",ans:"a = 2, p = 4, m = 3. CV<sub>a</sub> = 2/2 = <b>1</b>; CV<sub>p</sub> = 2/4 = <b>0.5</b>.",why:"CV = st.dev ÷ mean, for each of arrivals and service."},
{ask:"Utilization?",ans:"u = p/(a·m) = 4/(2 × 3) = <b>0.667</b>.",why:"Must be below 1, otherwise this is a transient-queue problem."},
{ask:"The three factors?",ans:"p/m = 4/3 = 1.333. Exponent √(2·4) − 1 = 1.828 → 0.667<sup>1.828</sup> = 0.4765 → ÷ (1 − 0.667) = <b>1.43</b>. Variability (1² + 0.5²)/2 = <b>0.625</b>."},
{ask:"T<sub>q</sub>?",ans:"1.333 × 1.43 × 0.625 = <b>≈ 1.19 min</b>."},
{ask:"Time until the customer has an answer, and how many emails wait on average?",ans:"T = 1.19 + 4 = <b>5.19 min</b>. I<sub>q</sub> = T<sub>q</sub>/a = 1.19/2 = <b>0.6 emails</b> waiting.",why:"Little's Law with flow rate = 1/a = 0.5 per min."}]},
{title:"Single server: a pharmacy counter",setup:"Customers arrive on average every 5 min (Poisson, CVa = 1). Service takes 4 min with st.dev 3 min. One pharmacist.",steps:[
{ask:"u and CVp?",ans:"u = 4/5 = <b>0.8</b>; CV<sub>p</sub> = 3/4 = <b>0.75</b>."},
{ask:"T<sub>q</sub>?",ans:"4 × (0.8/0.2) × (1 + 0.5625)/2 = 4 × 4 × 0.78125 = <b>12.5 min</b>.",why:"Notice: 4 minutes of service but 12.5 minutes of waiting, at only 80% utilization."},
{ask:"If arrivals rise so u = 0.9, what is T<sub>q</sub>?",ans:"p is the same, a = 4/0.9 = 4.44: 4 × 9 × 0.78125 = <b>28.1 min</b>: more than double.",why:"Utilization factor goes 4 → 9."},
{ask:"Instead, standardize service so CVp = 0.25 (u = 0.8). T<sub>q</sub>?",ans:"4 × 4 × (1 + 0.0625)/2 = <b>8.5 min</b>.",why:"Reducing variability reduces waiting without adding capacity."}]},
{title:"Call center, one half-hour (Picadilly case logic)",setup:"11:00–11:30: ≈ 50 calls arrive (CVa = 1). Calls take 5 min incl. wrap (st.dev 5 → CVp = 1). 9 agents.",steps:[
{ask:"a and u?",ans:"a = 30/50 = 0.6 min. u = 5/(0.6 × 9) = <b>0.926</b> (the case file has 49.6 calls → 0.918).",why:"Analyze each 30-min slot separately (seasonality); CV captures randomness within the slot."},
{ask:"T<sub>q</sub>?",ans:"(5/9) × 0.926<sup>√20−1</sup>/(1−0.926) × (1+1)/2 ≈ 0.556 × 0.766/0.074 × 1 ≈ <b>5.7 min</b> (≈ 5.0 min with 49.6 calls): way above the 2-minute target.",why:"Near 100% the formula is very sensitive: small changes in demand swing waits a lot."}]}
],
checks:[
{id:"wa1",q:"A queue forms although average capacity exceeds average demand. The cause is…",opts:["Seasonality","Variability in arrivals and/or service times","Bad management","The formula is wrong"],a:1,why:"That's a variability-induced queue (Dr. Toyota with randomness)."},
{id:"wa2",q:"For a Poisson arrival process, CVa equals…",opts:["0","0.5","1","Depends on demand"],a:2,why:"Exponential inter-arrival times have st.dev = mean → CV = 1."},
{id:"wa3",q:"Utilization goes from 80% to 90%. The utilization factor u/(1−u) goes from…",opts:["0.8 to 0.9","4 to 9","1.25 to 1.11","8 to 9"],a:1,why:"0.8/0.2 = 4; 0.9/0.1 = 9: more than double for 10 points of utilization."},
{id:"wa4",q:"If arrivals and service times were perfectly regular (CVa = CVp = 0) and u < 1, the waiting time would be…",opts:["Infinite","Zero","p","Equal to a"],a:1,why:"The variability factor is 0 → Tq = 0 (Dr. Toyota)."},
{id:"wa5",q:"Implied utilization is 150% for one hour, then demand stops. Which tool?",opts:["Waiting time formula","Triangle / build-up diagram (transient queue)","Erlang loss formula","Little's Law only"],a:1,why:"The waiting time formula requires u < 1. Over 100% the queue builds deterministically: draw it."},
{id:"wa6",q:"In a transient queue, who waits the longest?",opts:["The first customer","The customer who arrives at the end of the build-up period","The last customer served after depletion","Everyone equally"],a:1,why:"The longest queue occurs at the end of the build-up; that arrival waits through the whole depletion."},
{id:"wa7",q:"How should you treat the call center's busy lunch hour vs quiet 8:30am?",opts:["Average the whole day into one CVa","Analyze each 30-min slot separately (seasonality), with CVa = 1 within a slot","Ignore the quiet times","Use the transient-queue triangle for the whole day"],a:1,why:"Seasonality is predictable → handle it by slicing time; variability within the slot → CV."},
{id:"wa8",q:"Reducing CVp (standardizing service) with everything else equal will…",opts:["Raise utilization","Lower the waiting time","Not affect waiting","Increase capacity"],a:1,why:"It shrinks the variability factor."},
{id:"wa9",q:"Average number of customers in the queue (Iq) equals…",opts:["Tq × p","Tq / a","a / Tq","u × m"],a:1,why:"Little's Law: Iq = flow rate × Tq = (1/a) × Tq."}
],
calcs:[
{id:"wac1",q:"Single server: a = 10 min, p = 8 min, CVa = 1, CVp = 1. Tq (min)?",ans:32,unit:"min",steps:["u = 8/10 = 0.8.","Tq = 8 × (0.8/0.2) × (1+1)/2 = 8 × 4 × 1 = <b>32 min</b>."]},
{id:"wac2",q:"Single server: a = 6 min (st.dev 6), p = 5 min (st.dev 2.5). Flow time T (min)?",ans:20.63,unit:"min",steps:["u = 5/6 = 0.833.","CVa = 1, CVp = 0.5 → factor (1 + 0.25)/2 = 0.625.","Tq = 5 × (0.833/0.167) × 0.625 = 5 × 5 × 0.625 = 15.63 min.","T = 15.63 + 5 = <b>20.63 min</b>."]},
{id:"wac3",q:"From the previous question (a = 6, Tq = 15.63 min): average number of customers waiting in line (Iq)?",ans:2.6,unit:"customers",tol:0.06,steps:["Iq = Tq / a = 15.63/6 = <b>2.6</b>."]},
{id:"wac4",q:"(set below)",ans:0,unit:"min",steps:[]},
{id:"wac5",q:"Ticket booth: 3 customers/min arrive for 20 minutes; the booth serves 2/min. Then arrivals stop. Longest queue?",ans:20,unit:"customers",steps:["Build-up rate = 3 − 2 = 1/min.","After 20 min: <b>20 customers</b> waiting."]},
{id:"wac6",q:"Same booth (3/min for 20 min, serves 2/min). Average wait per customer (min)?",ans:5,unit:"min",steps:[]},
{id:"wac7",q:"Production 40 units/hr starting 6am; demand 70 units/hr from 8am to noon; customers wait for backorders. Largest backlog (units)?",ans:40,unit:"units",steps:["6–8am: inventory builds to 2 × 40 = 80.","From 8am net = 40 − 70 = −30/hr → inventory gone after 80/30 = 2.67 h (≈ 10:40am).","Backlog keeps growing until noon: −30 × (4 − 2.67) = −40 → <b>40 units</b>.","Shortcut: 80 − 30 × 4 = −40."]}
],
gens:[["wait_single","Waiting time, 1 server"],["wait_multi","Waiting time, m servers"],["wait_transient","Transient queue (triangle)"]],
cases:`<div class="callout case"><b>📂 Call Center at Picadilly Bank (the WAIT case)</b>9 agents, 5-min calls (CVp = 1), random arrivals (CVa = 1) per 30-min slot; target ≤ 2 min average wait; currently missed at lunch. <a href="#case/callcenter">Slot-by-slot analysis →</a></div>`,
traps:["Using the waiting time formula when u ≥ 100% (it gives nonsense: negative waits). Use the triangle.","Using inter-arrival time a vs arrival RATE: if 30 customers/hr arrive, a = 2 min, not 30.","Forgetting to square the CVs, or forgetting to divide by 2.","Reporting Tq when the question asks for total time (Tq + p), or vice versa. Read the wording."],
prof:["“There is no universal optimal utilization”; judge by the consequences of delay.","Long waits for short tasks come from system load, not from lazy workers.","AI agents booking restaurant reservations every 30 seconds, US Open security forcing ~20,000 fans to re-enter: queues ration demand."]
});
// fix the two calcs whose step text needs exact values
const m=OM.modules[OM.modules.length-1];
(function(){const q=m.calcs.find(x=>x.id==="wac4");const r=tq(3,3,5,5,2);q.ans=Math.round(r.Tq*100)/100;q.q="2 servers: a = 3 min, p = 5 min, CVa = 1, CVp = 1. Tq (min)? (Hint: √6 − 1 ≈ 1.449)";q.tol=0.15;
  q.steps=["u = 5/(3 × 2) = 0.833.","Service factor p/m = 5/2 = 2.5.",`Utilization factor = 0.833<sup>1.449</sup>/(1 − 0.833) = ${fmt(Math.pow(r.u,Math.sqrt(6)-1),3)}/0.167 = ${fmt(r.f2,2)}.`,"Variability factor = (1 + 1)/2 = 1.",`Tq = 2.5 × ${fmt(r.f2,2)} × 1 = <b>${fmt(r.Tq,2)} min</b>.`];q.why="Compare: one server at the same 83% utilization with p = 5 would wait 25 min. Pooling two servers cuts the wait by more than half.";
  const q6=m.calcs.find(x=>x.id==="wac6");q6.ans=5;q6.steps=["Longest queue = (3 − 2) × 20 = 20; depletion at 2/min takes 20/2 = 10 min.","Total wait = ½ × (20 + 10) × 20 = 300 customer-minutes.","Customers = 3 × 20 = 60 → average wait = 300/60 = <b>5 min</b>."];})();
OM.gens.wait_single=function(){const r=OM.rnd;const p=r(2,12),u=OM.pick([0.5,0.6,0.7,0.75,0.8,0.85,0.9]);const a=Math.round(p/u*10)/10;const cva=OM.pick([1,1,0.5,0.8]),cvp=OM.pick([1,0.5,0.25,0.75,1.2]);const res=tq(a,a*cva,p,p*cvp,1);
  return{q:`One server. Average inter-arrival time a = ${a} min (CVa = ${cva}); average service time p = ${p} min (CVp = ${cvp}). Average time in queue Tq (min)?`,ans:res.Tq,unit:"min",tol:Math.max(0.05,res.Tq*0.03),steps:[`u = p/a = ${p}/${a} = ${fmt(res.u,3)}`,`Utilization factor u/(1−u) = ${fmt(res.f2,3)}`,`Variability factor (${cva}² + ${cvp}²)/2 = ${fmt(res.f3,3)}`,`Tq = ${p} × ${fmt(res.f2,3)} × ${fmt(res.f3,3)} = <b>${fmt(res.Tq,2)} min</b>`]};};
OM.gens.wait_multi=function(){const r=OM.rnd;const m=r(2,6),p=r(3,15),u=OM.pick([0.6,0.7,0.75,0.8,0.85,0.9]);const a=Math.round(p/(u*m)*100)/100;const cvp=OM.pick([1,0.5,0.8]);const res=tq(a,a,p,p*cvp,m);const ex=Math.sqrt(2*(m+1))-1;
  return{q:`${m} servers. Customers arrive every ${a} min on average (Poisson, CVa = 1). Service takes ${p} min on average (CVp = ${cvp}). Average time in queue Tq (min)? (exponent √(2(m+1)) − 1 = ${fmt(ex,3)})`,ans:res.Tq,unit:"min",tol:Math.max(0.05,res.Tq*0.03),steps:[`u = p/(a·m) = ${p}/(${a}×${m}) = ${fmt(res.u,3)}`,`Service factor p/m = ${fmt(p/m,3)}`,`Utilization factor = ${fmt(res.u,3)}<sup>${fmt(ex,3)}</sup>/(1−${fmt(res.u,3)}) = ${fmt(res.f2,3)}`,`Variability factor = (1 + ${cvp}²)/2 = ${fmt(res.f3,3)}`,`Tq = <b>${fmt(res.Tq,2)} min</b>`]};};
OM.gens.wait_transient=function(){const r=OM.rnd;const cap=r(1,4),dem=cap+r(1,3),T=OM.pick([20,30,40,60]);const L=(dem-cap)*T,dep=L/cap,tot=0.5*(T+dep)*L,n=dem*T;const ask=OM.pick(["L","avg"]);
  const d=`For ${T} minutes, ${dem} customers/min arrive; the server handles ${cap}/min. Afterwards no one arrives; everyone waits.`;
  if(ask==="L")return{q:d+" Longest queue?",ans:L,unit:"customers",steps:[`Build-up rate = ${dem} − ${cap} = ${dem-cap}/min`,`× ${T} min = <b>${L}</b>`]};
  return{q:d+" Average wait per customer (min)?",ans:tot/n,unit:"min",steps:[`Longest queue = ${L}; depletion = ${L}/${cap} = ${fmt(dep,2)} min`,`Total wait = ½ × (${T} + ${fmt(dep,2)}) × ${L} = ${fmt(tot,1)}`,`Customers = ${dem} × ${T} = ${n}`,`Average = <b>${fmt(tot/n,2)} min</b>`]};};
})();
