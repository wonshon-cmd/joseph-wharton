(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
OM.modules.push({
id:"process",n:2,code:"PROCESS",icon:"🏭",color:"#2a63c7",title:"Process Analysis: Capacity, Bottleneck, Flow Rate",
status:"slides + lecture",
blurb:"Draw a process flow diagram, compute each resource's capacity, find the bottleneck, flow rate and utilization.",
intro:"This is the <b>foundation of the whole course</b> (and of most exam points). Learn to look at any operation (a hospital, a bank, a gym, a sandwich shop) as boxes and triangles, and compute how much it can produce.",
objectives:["Map an operation as a <b>process flow diagram</b>","Compute the <b>capacity</b> of a resource and find the <b>bottleneck</b>","Compute <b>flow rate</b> and understand inventory, flow time and flow rate","Compute the <b>utilization</b> of a resource and of the process"],
lesson:[
{h:"Pick a flow unit, then draw boxes and triangles",html:`
<p>Step one of any process analysis: decide <span class="k">what you are following</span> through the process. That thing is the <b>flow unit</b>: a loan application, a patient, a sandwich, a guitar, an athlete.</p>
<p>At every moment, a flow unit is in one of two states, which gives the two shapes of a <b>process flow diagram</b>:</p>
<table class="t"><tr><th>Shape</th><th>Means</th><th>Example</th></tr>
<tr><td>▭ <b>Box</b></td><td>A <b>resource</b> is <u>working</u> on the unit</td><td>Doctor examining patient; worker making sandwich</td></tr>
<tr><td>△ <b>Triangle</b></td><td>The unit is <u>waiting</u> (inventory / buffer)</td><td>Patients in waiting room; files in an inbox</td></tr>
<tr><td>→ <b>Arrow</b></td><td>Direction of flow</td><td></td></tr></table>
${V("flow",{tu:"min",ru:"hr",steps:[{name:"LTV",p:1},{name:"Front + Back",p:2},{name:"Word count",p:3},{name:"Underwrite",p:0.5}],cap:"The professor's loan example (one person at each step). Each box shows processing time p, staffing m and capacity."})}
<div class="callout trap"><b>⚠️ Boxes are RESOURCES, not activities</b>If one worker does 3 activities, that's <u>one box</u> whose processing time is the <u>sum</u> of the 3 activities. The professor stressed this in Subway: “the bottleneck is a resource, not an activity.”</div>`},
{h:"Processing time and capacity",html:`
<p><span class="k">Processing time (p)</span>: how long a resource spends working on <b>one</b> flow unit. (Measured by watching with a stopwatch.)</p>
<p><span class="k">Capacity</span>: how many units the resource can produce <b>per unit of time</b>. It's simply the flip of processing time:</p>
<div class="formula"><span class="eq">Capacity of one worker = ${fr("1","processing time")}</span> &nbsp;&nbsp; <span class="eq">Capacity of a resource with m workers = ${fr("m","processing time")}</span></div>
<div class="callout why"><b>💡 Why 1/p?</b>If a task takes 3 minutes, one worker finishes 1 unit every 3 minutes = <b>1/3 unit per minute</b> = 1/3 × 60 = <b>20 units per hour</b>. If there are 2 identical workers side by side (m = 2), they produce twice as much: 2/3 per minute = 40/hr.</div>
<div class="callout analogy"><b>🍞 Analogy</b>A toaster toasts one slice in 2 minutes → 30 slices/hour. Buy a second toaster → 60 slices/hour. Same time per slice, double the capacity.</div>
<div class="callout trap"><b>⚠️ Units!</b>Always convert to <u>per hour</u> (or per minute) <u>consistently</u>. Per minute → per hour: × 60. Per second → per hour: × 3600.</div>`},
{h:"The bottleneck = the weakest link",html:`
<p>A process is a chain. Its output can never be higher than its <b>slowest link</b>.</p>
<div class="callout key"><b>📌 Definitions</b><b>Bottleneck</b> = the resource with the <u>lowest capacity</u>.<br><b>Process capacity</b> = the capacity of the bottleneck.</div>
<p>In the loan example: capacities are 60, 30, <span class="red">20</span>, 120 per hour → <b>Word count (20/hr) is the bottleneck</b>, and the whole process can make at most <b>20 loans/hour</b>.</p>
<div class="callout trap"><b>⚠️ “Longest processing time” ≠ always the bottleneck</b>That's only true when every resource has one worker. With staffing, compare <b>m/p</b>: a 20-minute step with 5 people (15/hr) has <u>more</u> capacity than a 6-minute step with 1 person (10/hr).</div>
<div class="callout why"><b>💡 Why improving a non-bottleneck does nothing</b>If you speed up underwriting from 0.5 to 0.1 min, the line still waits on Word count at 20/hr. Output stays 20. Improvements only increase capacity if they hit the bottleneck (or move work away from it).</div>
<p>A visual clue in real life: <b>work piles up in front of the bottleneck</b> (paper stacks at the DMV, patients in front of the doctor).</p>`},
{h:"Flow rate: what actually comes out",html:`
<p>The process can make 20/hr, but if customers only want 15/hr, only 15 flow through. So:</p>
<div class="formula"><span class="eq">Flow rate = Minimum { Demand rate , Process capacity }</span></div>
<table class="t"><tr><th>Situation</th><th>Name</th><th>Flow rate</th></tr>
<tr><td>Demand <b>&lt;</b> capacity</td><td><span class="grn">Demand-constrained</span></td><td>= demand (and nobody works at 100%)</td></tr>
<tr><td>Demand <b>&gt;</b> capacity</td><td><span class="red">Capacity-constrained</span></td><td>= process capacity (bottleneck works 100%; queue grows or customers leave)</td></tr></table>
<p>Other names for flow rate: <b>throughput</b>, volume, unit sales. And <u>flow rate is the same everywhere in a simple process</u>: what goes in eventually comes out.</p>`},
{h:"Utilization: how busy is a resource?",html:`
<div class="formula"><span class="eq">Utilization = ${fr("Flow rate","Capacity")}</span><div class="why">💡 It's the fraction of time the resource is working: what it actually does ÷ what it could do.</div></div>
<p>Loan example, unlimited demand → flow rate = 20/hr. Utilization of Underwrite = 20 / 120 = <b>16.7%</b>. Utilization of Word count = 20/20 = <b>100%</b>.</p>
<ul><li>Applies to a <b>resource</b> (flow rate / its capacity) and to the <b>process</b> (flow rate / process capacity).</li>
<li>Utilization can <span class="red">never exceed 100%</span>. (If a report says 110%, the capacity was measured wrong.) In MULTI you'll meet <i>implied</i> utilization, which <u>can</u> exceed 100%.</li>
<li>Only the bottleneck can reach 100%, and only if the process is capacity-constrained.</li></ul>
${V("bars",{bars:[{l:"LTV",v:33.3},{l:"Front+Back",v:66.7},{l:"Word count",v:100,c:"#c0392b"},{l:"Underwrite",v:16.7}],max:115,line:100,linel:"100%",yl:"Utilization %",cap:"Utilization of each step at flow rate 20/hr."})}
<div class="callout prof"><b>🎓 Real-world utilization</b>Auto plants and power plants: utilization differs on purpose. Nuclear plants run near 100%; gas peaker plants are mostly idle. Spare capacity buys <b>flexibility for peaks</b>. Executives worry at ~40% because fixed assets aren't earning their keep.</div>`},
{h:"Inventory and flow time (two more of the “big three”)",html:`
<div class="callout key"><b>📌 The three most important measures of ANY operation</b>
<b>Flow rate (R)</b>: units per time coming through.<br>
<b>Inventory (I)</b>: number of flow units <u>inside</u> the process right now (waiting <i>and</i> being worked on).<br>
<b>Flow time (T)</b>: how long one unit takes from entering to leaving (in hospitals: “length of stay”).<br>
…and they're usually <u>not</u> in the financial statements.</div>
<div class="callout trap"><b>⚠️ OM inventory ≠ accounting inventory</b>Patients in a waiting room <b>are</b> inventory. So is a patient lying in an ICU bed being treated. A loan application waiting for a decision is inventory.</div>
<p><b>Why inventory exists:</b> a mismatch between supply and demand. Two kinds:</p>
<table class="t"><tr><th>Case</th><th>What waits</th><th>Typical in</th></tr>
<tr><td>Capacity-constrained</td><td><b>Demand waits for supply</b> (inventory = waiting customers)</td><td>Services: you can't store a haircut</td></tr>
<tr><td>Demand-constrained</td><td><b>Supply waits for demand</b> (inventory = goods on the shelf, idle resources)</td><td>Manufacturing: you can build ahead</td></tr></table>`},
{h:"Two ways to look at a process + how the course thinks about improvement",html:`
<ol><li><b>Flow-unit view</b> (“be the patient”): follow one unit from start to end. Where does it wait? This is the customer's experience.</li>
<li><b>Resource view</b> (“shadow the doctor”): follow one resource all day, ideally the bottleneck. How does it spend its time?</li></ol>
<p>Japanese: <i>Genchi Genbutsu</i>, “go and see for yourself.”</p>
<h4>The professor's 3 improvement ideas for the loan process (base: 1, 2, 3, 0.5 min)</h4>
<table class="t"><tr><th>Idea</th><th>Effect on capacity</th><th>Why</th></tr>
<tr><td>1. AI cuts Word count to 0.5 min</td><td><span class="grn">↑ from 20 to 30/hr</span> (Front+Back becomes the new bottleneck)</td><td>Hits the bottleneck. New capacities 60, 30, 120, 120.</td></tr>
<tr><td>2. Do Word count and LTV/Front+Back <u>in parallel</u></td><td><span class="red">No change</span> (still 20/hr)</td><td>Each loan still needs every step; parallel work shortens <b>flow time</b> only.</td></tr>
<tr><td>3. Work cells: each of 4 workers does a whole loan (6.5 min)</td><td><span class="grn">↑ to 4/6.5 × 60 ≈ 36.9/hr</span></td><td>Idle time disappears: all 4 people work 100%. Caveats: lose specialization, add switching/setup time.</td></tr></table>`}
],
formulas:[
{name:"Capacity of a resource",f:`Capacity = ${fr("m","Processing time p")}`,why:"One worker makes 1 unit per p; m identical workers make m per p. Convert units (×60 for min→hr)."},
{name:"Bottleneck & process capacity",f:"Bottleneck = resource with the lowest capacity; Process capacity = min{ capacity<sub>i</sub> }",why:"The chain is only as strong as its weakest link."},
{name:"Flow rate",f:"Flow rate R = min { Demand , Process capacity }",why:"You can't sell more than customers want, nor make more than your bottleneck allows."},
{name:"Utilization",f:`Utilization<sub>i</sub> = ${fr("Flow rate","Capacity<sub>i</sub>")}`,why:"Fraction of time the resource is busy. ≤ 100%."}
],
worked:[
{title:"The professor's loan process",src:"Slides PROC #45",setup:`Four steps in sequence, one person each (m = 1): <b>LTV 1 min</b> → <b>Front+Back 2 min</b> → <b>Word count 3 min</b> → <b>Underwrite 0.5 min</b> per loan.<br>(a) Bottleneck? (b) Flow rate if demand = 50 loans/hr? (c) Utilization of Underwrite with unlimited demand?`,
steps:[
{ask:"Compute each capacity (per hour).",ans:"LTV 1/1 × 60 = <b>60/hr</b>; Front+Back 1/2 × 60 = <b>30/hr</b>; Word count 1/3 × 60 = <b>20/hr</b>; Underwrite 1/0.5 × 60 = <b>120/hr</b>.",why:"Capacity = m/p, then ×60 to get per hour."},
{ask:"Which is the bottleneck?",ans:"<span class='red'>Word count, 20/hr</span>: the lowest capacity. Process capacity = 20/hr."},
{ask:"Flow rate with demand 50/hr?",ans:"min(50, 20) = <b>20 loans/hr</b> → capacity-constrained.",why:"Demand exceeds what the bottleneck can do; 30 loans/hr pile up or go elsewhere."},
{ask:"Utilization of Underwrite?",ans:"20 / 120 = <b>16.7%</b>.",why:"It can do 120 but only receives 20 (the bottleneck feeds it). It's idle 83% of the time."}]},
{title:"Staffing changes the bottleneck",setup:`A clinic: <b>Check-in</b> 4 min (1 clerk), <b>Nurse vitals</b> 10 min (2 nurses), <b>Doctor</b> 18 min (3 doctors), <b>Checkout</b> 5 min (1 clerk). Demand: 12 patients/hr.`,
viz:V("flow",{tu:"min",ru:"hr",demand:12,steps:[{name:"Check-in",p:4,m:1},{name:"Nurse vitals",p:10,m:2},{name:"Doctor",p:18,m:3},{name:"Checkout",p:5,m:1}]}),
steps:[
{ask:"Which step has the LONGEST processing time? Is it the bottleneck?",ans:"Doctor (18 min) is longest, but it has 3 doctors: capacity = 3/18 × 60 = <b>10/hr</b>. Not automatically the bottleneck; we must compare all capacities.",why:"With m > 1, longest p ≠ lowest capacity."},
{ask:"Compute all capacities.",ans:"Check-in 60/4 = <b>15</b>; Nurses 2/10 × 60 = <b>12</b>; Doctor 3/18 × 60 = <b>10</b>; Checkout 60/5 = <b>12</b> per hour."},
{ask:"Bottleneck, process capacity, flow rate?",ans:"Doctor (10/hr) → process capacity 10/hr → flow rate = min(12, 10) = <b>10/hr</b> (capacity-constrained)."},
{ask:"Utilization of the nurses?",ans:"10 / 12 = <b>83.3%</b>."},
{ask:"Management adds a 4th doctor. New bottleneck?",ans:"Doctor capacity = 4/18 × 60 = 13.3/hr. Now the lowest is Nurses and Checkout at <b>12/hr</b> → flow rate = min(12, 12) = 12/hr. All demand is served.",why:"Fixing a bottleneck moves it somewhere else. Always re-check."}]}
],
checks:[
{id:"pr1",q:"In a process flow diagram, a triangle represents…",opts:["A resource doing work","Inventory (units waiting)","The bottleneck","A decision point"],a:1,why:"Boxes = resources working; triangles = buffers/inventory where flow units wait."},
{id:"pr2",q:"The bottleneck is the resource with…",opts:["The longest processing time","The most workers","The lowest capacity","The highest utilization when demand is low"],a:2,why:"Lowest capacity (m/p). Longest p only matches this if all resources have one worker."},
{id:"pr3",q:"Demand is 30/hr; process capacity is 45/hr. The process is…",opts:["Capacity-constrained, flow rate 45","Demand-constrained, flow rate 30","Capacity-constrained, flow rate 30","Demand-constrained, flow rate 45"],a:1,why:"Flow rate = min(30, 45) = 30. Demand is the limit → demand-constrained."},
{id:"pr4",q:"You make a NON-bottleneck step twice as fast. Process capacity…",opts:["Doubles","Increases a bit","Stays the same","Decreases"],a:2,why:"Process capacity = bottleneck capacity, which didn't change."},
{id:"pr5",q:"Which can NEVER exceed 100%?",opts:["Utilization","Implied utilization","Demand/capacity ratio","All of them"],a:0,why:"Utilization = flow rate/capacity, and flow rate ≤ capacity. Implied utilization (demand/capacity) can exceed 100%."},
{id:"pr6",q:"Doing two steps in parallel instead of in sequence (same work, same people) mainly changes…",opts:["Capacity","Flow rate","Flow time","Utilization of the bottleneck"],a:2,why:"Every unit still needs both steps by the same resources → capacity unchanged. But the unit doesn't wait for one to finish before the other starts → shorter flow time."},
{id:"pr7",q:"In OM, which of these counts as inventory in an ER?",opts:["Only medicines on shelves","Only patients in the waiting room","Patients waiting AND patients being treated","Only patients who are admitted"],a:2,why:"Inventory = all flow units inside the process boundaries, waiting or being worked on."},
{id:"pr8",q:"The professor organizes 4 loan workers as “work cells” (each does all steps, 6.5 min total). Capacity becomes…",opts:["60/6.5 = 9.2/hr","4/6.5 × 60 ≈ 36.9/hr","20/hr, unchanged","4 × 20 = 80/hr"],a:1,why:"One big resource with m = 4 and p = 6.5 min → capacity = 4/6.5 per min = 36.9/hr. 9.2 is just ONE worker."},
{id:"pr9",q:"When does the bottleneck have utilization below 100%?",opts:["Never","When the process is demand-constrained","When it has more than one worker","When it has the longest processing time"],a:1,why:"If demand < capacity, flow rate = demand < bottleneck capacity, so even the bottleneck has idle time."},
{id:"pr10",q:"Which is NOT one of the three key process measures?",opts:["Flow rate","Inventory","Flow time","Revenue"],a:3,why:"The big three are flow rate (R), inventory (I), flow time (T), linked by Little's Law."}
],
calcs:[
{id:"prc1",q:"A machine takes 4 minutes per part. What is its capacity in parts per hour?",ans:15,unit:"parts/hr",hint:"Capacity = 1/p, then convert per minute to per hour.",steps:["Capacity = 1/p = 1/4 part per minute.","Per hour: 1/4 × 60 = <b>15 parts/hr</b>."]},
{id:"prc2",q:"A step is staffed by 3 workers, each taking 12 minutes per customer. Capacity per hour?",ans:15,unit:"customers/hr",hint:"m/p.",steps:["Capacity = m/p = 3/12 = 0.25 per minute.","× 60 = <b>15 per hour</b>."],why:"3 workers each finish 5/hr → 15/hr together."},
{id:"prc3",q:"A coffee kiosk can serve 40 customers/hr but only 28/hr show up. Utilization?",ans:70,unit:"%",hint:"Flow rate first, then divide by capacity.",steps:["Flow rate = min(28, 40) = 28/hr.","Utilization = 28/40 = <b>70%</b>."]},
{id:"prc4",q:"Steps: A 5 min (m=1), B 16 min (m=4), C 6 min (m=1). Unlimited demand. Process capacity (units/hr)?",ans:10,unit:"units/hr",hint:"Compute m/p × 60 for each.",steps:["A: 60/5 = 12/hr. B: 4/16 × 60 = 15/hr. C: 60/6 = 10/hr.","Lowest = C → process capacity = <b>10/hr</b>."],why:"B has the longest time but 4 workers, so it isn't the bottleneck."},
{id:"prc5",q:"Same process (A 5, B 16 with m=4, C 6 min). Unlimited demand. Utilization of B?",ans:66.67,unit:"%",steps:["Flow rate = process capacity = 10/hr.","Capacity of B = 15/hr.","Utilization = 10/15 = <b>66.7%</b>."]},
{id:"prc6",q:"Same process, but demand is now 8 units/hr. Utilization of C (the bottleneck)?",ans:80,unit:"%",steps:["Flow rate = min(8, 10) = 8/hr (demand-constrained).","Utilization C = 8/10 = <b>80%</b>."],why:"When demand-constrained, even the bottleneck has idle time."},
{id:"prc7",q:"A 3D scanner takes 90 seconds per scan. Capacity in scans per hour?",ans:40,unit:"scans/hr",steps:["Per second: 1/90.","Per hour: 3600/90 = <b>40/hr</b>."]},
{id:"prc8",q:"Process: X 2 min (m=1), Y 3 min (m=1), Z 1 min (m=1). You may add ONE worker to any step. What's the best process capacity you can reach (per hr)?",ans:30,unit:"units/hr",hint:"Add the worker to the bottleneck, then find the new bottleneck.",steps:["Capacities: X 30, Y 20, Z 60/hr. Bottleneck Y.","Add a worker to Y: 2/3 × 60 = 40/hr.","New capacities 30, 40, 60 → process capacity = <b>30/hr</b> (X is now the bottleneck)."],why:"Fixing a bottleneck helps only until the next-weakest link takes over."}
],
gens:[["proc_cap","Capacity, bottleneck & utilization"],["proc_flow","Flow rate with demand"]],
cases:`<div class="callout case"><b>📂 Capital One</b>Interview (7 people, 23 min), Underwriting (8, ≈40 min), QA (2, ≈25 min), Closing (6, ≈70 min). But some applications drop out along the way, so the simple “lowest capacity” rule isn't enough; you need implied utilization (MULTI). <a href="#case/capone">See the case →</a></div>`,
traps:["Mixing time units (a capacity per minute compared with demand per hour). Convert everything to the same unit first.","Using processing time of an activity instead of the total time of the resource (worker) that does several activities.","Forgetting that flow rate = min(demand, capacity), and reporting capacity when demand is lower."],
prof:["Put the bottleneck at the most expensive/valuable resource (e.g., surgeon, not receptionist). Line balancing fits assembly lines and back offices, not places where resources differ hugely in value.","Process boundaries: don't always analyze “end to end” (consultants do and never get anything done). Pick boundaries that match who owns the process.","Shorter tasks are easier to automate with AI (reading a chest X-ray ≈1 min vs. an oncology report ≈1 hour)."]
});
// generators
OM.gens.proc_cap=function(){const r=OM.rnd;const n=r(3,4);const names=["Greet","Prep","Assemble","Inspect","Pack"];const st=[];for(let i=0;i<n;i++){const m=OM.pick([1,1,1,2,3]);st.push({name:names[i],p:r(2,12)*(m>1?2:1),m});}
  st.forEach(s=>s.cap=s.m/s.p*60);const cap=Math.min(...st.map(s=>s.cap));const k=r(0,n-1);const ask=OM.pick(["cap","util"]);
  const desc=st.map(s=>`<b>${s.name}</b> ${s.p} min${s.m>1?` (${s.m} workers)`:""}`).join(" → ");
  if(ask==="cap")return{q:`Process: ${desc}. Unlimited demand. What is the process capacity per hour?`,ans:cap,unit:"units/hr",hint:"Capacity of each step = m/p × 60; take the minimum.",steps:[...st.map(s=>`${s.name}: ${s.m}/${s.p} × 60 = ${fmt(s.cap)}/hr`),`Lowest = <b>${fmt(cap)}/hr</b> = process capacity.`]};
  const u=cap/st[k].cap*100;return{q:`Process: ${desc}. Unlimited demand. What is the utilization of <b>${st[k].name}</b>?`,ans:u,unit:"%",hint:"Flow rate = process capacity (unlimited demand). Utilization = flow rate / capacity of that step.",steps:[...st.map(s=>`${s.name}: ${fmt(s.cap)}/hr`),`Flow rate = min = ${fmt(cap)}/hr`,`Utilization of ${st[k].name} = ${fmt(cap)}/${fmt(st[k].cap)} = <b>${fmt(u,1)}%</b>`]};};
OM.gens.proc_flow=function(){const r=OM.rnd;const capA=r(20,60),p=Math.round(60/capA*10)/10;const cap=60/p;const dem=r(Math.round(cap*0.5),Math.round(cap*1.5));const fr=Math.min(dem,cap);const ask=OM.pick(["fr","u"]);
  if(ask==="fr")return{q:`A single-step process (1 worker) takes ${p} min per unit. Demand is ${dem} units/hr. Flow rate?`,ans:fr,unit:"units/hr",steps:[`Capacity = 60/${p} = ${fmt(cap)}/hr`,`Flow rate = min(${dem}, ${fmt(cap)}) = <b>${fmt(fr)}/hr</b> (${dem<cap?"demand":"capacity"}-constrained)`]};
  return{q:`A single-step process (1 worker) takes ${p} min per unit. Demand is ${dem} units/hr. Utilization?`,ans:fr/cap*100,unit:"%",steps:[`Capacity = 60/${p} = ${fmt(cap)}/hr`,`Flow rate = min(${dem}, ${fmt(cap)}) = ${fmt(fr)}`,`Utilization = ${fmt(fr)}/${fmt(cap)} = <b>${fmt(fr/cap*100,1)}%</b>`]};};
})();
