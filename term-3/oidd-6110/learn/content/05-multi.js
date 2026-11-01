(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
OM.modules.push({
id:"multi",n:5,code:"MULTI",icon:"🔀",color:"#c0392b",title:"Multiple Flow Units, Attrition & Implied Utilization",
status:"slides + lecture",
blurb:"When different customers take different paths (product mix) or drop out (attrition), find the bottleneck with implied utilization = demand / capacity.",
intro:"Real processes aren't a single straight line. Tax returns of different types go to different departments; loan applications get rejected along the way. Here the simple “lowest capacity” rule <b>breaks</b>, and you need a better detective tool.",
objectives:["Compute the <b>demand for a resource</b> in a process with multiple flow units","Understand process flows with <b>attrition losses</b> (yield)","Find the bottleneck using <b>implied utilization</b>"],
lesson:[
{h:"Why the old rule breaks",html:`
<p>In PROCESS, every unit visited every resource, so the slowest resource was the bottleneck. Now look at the professor's example: three types of applications follow <b>different routes</b>.</p>
${V("flow",{tu:"min",ru:"hr",bn:false,foot:"Foreign: File → Foreign Dep. → Dept 1 → Print · Regular: File → Dept 1 → Print · EZ: File → Dept 2 → Print",steps:[{name:"File",p:3,m:1},{name:"Foreign Dep.",p:20,m:2},{name:"Department 1",p:15,m:3},{name:"Department 2",p:8,m:2},{name:"Print invoice",p:2,m:1}],cap:"Demand: Foreign 3/hr, Regular 11/hr, EZ 4/hr (drawn in a row for simplicity; the real diagram branches)."})}
<p>The lowest capacity is Foreign Dep. (2/20 × 60 = <b>6/hr</b>). Is it the bottleneck? <span class="red">No!</span> Only 3 foreign cases/hr go there. It's half idle.</p>
<div class="callout analogy"><b>🕵️ The professor's detective analogy</b>Five suspects (resources), one culprit (bottleneck). The resource with the lowest capacity is the “primary suspect”, but it can be <b>innocent</b> if little work reaches it. You need to compare each resource's <u>workload</u> to its <u>capacity</u>.</div>`},
{h:"Implied utilization: the new rule",html:`
<div class="formula"><span class="eq">Implied utilization = ${fr("Demand at the resource","Capacity of the resource")}</span><div class="why">💡 “If we tried to serve ALL demand, how busy would this resource need to be?”</div></div>
<div class="callout key"><b>📌 The bottleneck is the resource with the HIGHEST implied utilization.</b>Implied utilization <u>can exceed 100%</u>. 150% means the resource works flat out and still leaves 1/3 of its demand unserved. (Regular utilization never exceeds 100%.)</div>
<h4>Recipe (3 steps)</h4>
<ol><li>For each resource, <b>add up the demand of every flow unit type that visits it</b>.</li>
<li>Compute its capacity (m/p).</li>
<li>Divide. Highest = bottleneck.</li></ol>
<table class="t"><tr><th>Resource</th><th>Who visits</th><th>Demand/hr</th><th>Capacity/hr</th><th>Implied util.</th></tr>
<tr><td>File</td><td>all</td><td>3+11+4 = 18</td><td>60/3 = 20</td><td>90%</td></tr>
<tr><td>Foreign Dep.</td><td>Foreign</td><td>3</td><td>2/20×60 = 6</td><td>50%</td></tr>
<tr class="bn"><td>Department 1</td><td>Foreign + Regular</td><td>3+11 = 14</td><td>3/15×60 = 12</td><td><b>117% 🔴</b></td></tr>
<tr><td>Department 2</td><td>EZ</td><td>4</td><td>2/8×60 = 15</td><td>27%</td></tr>
<tr><td>Print invoice</td><td>all</td><td>18</td><td>60/2 = 30</td><td>60%</td></tr></table>
<p>Department 1 is the bottleneck. It can't keep up (117% &gt; 100%). If we keep the same mix, the maximum total flow rate = 18 / 1.167 = <b>15.4 applications/hr</b>.</p>
<div class="callout why"><b>💡 Why divide total demand by the max implied utilization?</b>If the bottleneck needs 117% to serve everything, scale <u>all</u> demand down by 1.167 so it needs exactly 100%. Everyone else then drops below 100% too.</div>`},
{h:"The minutes-of-work method (same answer, often easier)",html:`
<p>When different flow units need <b>different processing times</b> at the same resource, count minutes of work instead:</p>
<div class="formula"><span class="eq">Implied utilization = ${fr("Minutes of work demanded per hour","Minutes available per hour (m × 60)")}</span></div>
<p>Department 1: (3 + 11) × 15 min = 210 min of work per hour; available 3 × 60 = 180 min → 210/180 = <b>117%</b>. Same answer.</p>
<div class="callout prof"><b>🎓 From class</b>In a poll, 2/3 preferred demand/capacity and 1/3 minutes-of-work; they're mathematically equivalent. Minutes-of-work is “general and applies to all cases”, including human-in-the-loop AI designs and rework (just add the rework minutes).</div>
${OM.T("multi")}`},
{h:"Attrition: units that drop out (yield)",html:`
<p>Sometimes flow units <b>leave</b> the process before the end: loan applications get rejected or withdrawn, job candidates are screened out, papers are desk-rejected.</p>
<div class="callout key"><b>📌 Definitions</b><b>Attrition loss</b>: flow units that drop out (or are actively rejected).<br><b>Yield of a resource</b> = flow rate of good output ÷ flow rate of input.<br><b>Process yield</b> = y<sub>1</sub> × y<sub>2</sub> × … × y<sub>n</sub>.</div>
${V("waterfall",{bars:[{l:"Right party|calls",v:100},{l:"Declined by|underwriting",v:52,type:"loss"},{l:"Withdrawn",v:14.6,type:"loss"},{l:"Passed to|QA & closing",v:33.4},{l:"Withdrawn /|no response",v:7,type:"loss"},{l:"Booked",v:26.4,type:"end"}],cap:"Capital One, Exhibit 6: of 100 applications, only 26.4 become loans → process yield 26.4%."})}
<div class="formula"><span class="eq">Units to start to get Q good units = ${fr("Q","Process yield")}</span></div>
<div class="callout analogy"><b>🪣 The leaky bucket (from class)</b>Carrying water from a well in a leaky bucket: to deliver 7 liters you must fill more than 7 at the well. Work <u>backwards</u> from the required output: divide by (1 − loss rate) at each leak.</div>
<p><b>Capital One</b>: target 700 booked loans/month ÷ 0.264 = <b>≈ 2,650 applications/month</b> must enter the interview step (≈ 4 interviews per booked loan). Class version with rounded loss rates (52%, 30%, 20%): 700/0.8 = 875 → /0.7 = 1,250 → /0.48 ≈ <b>2,604</b>.</p>
<div class="callout why"><b>💡 How attrition changes the bottleneck</b>Upstream resources see <u>all</u> the units (including the ones that will be rejected later); downstream resources see only survivors. So a low-capacity resource near the end might be fine (“innocent”), while an upstream one is overloaded. Demand at each resource = units <u>arriving</u> there.</div>`}
],
formulas:[
{name:"Implied utilization",f:`${fr("Demand at resource","Capacity of resource")} = ${fr("Minutes of work demanded","Minutes available")}`,why:"Can exceed 100%. Highest one = bottleneck."},
{name:"Yield",f:`Yield of a resource = ${fr("Flow rate of good output","Flow rate of input")}`,why:"Share of units that survive the step."},
{name:"Process yield",f:"y<sub>1</sub> × y<sub>2</sub> × … × y<sub>n</sub>",why:"Survival through every step."},
{name:"Units to start",f:`${fr("Q","Process yield")}`,why:"Work backwards from the target output."},
{name:"Max flow rate (fixed mix)",f:`${fr("Total demand","Highest implied utilization")}`,why:"Scale demand so the bottleneck is exactly 100%."}
],
worked:[
{title:"Where is the bottleneck? (the professor's 3-type example)",src:"Slides MULTI #23–24",setup:"Foreign 3/hr (File → Foreign → Dept 1 → Print), Regular 11/hr (File → Dept 1 → Print), EZ 4/hr (File → Dept 2 → Print). File m=1, 3 min; Foreign m=2, 20 min; Dept 1 m=3, 15 min; Dept 2 m=2, 8 min; Print m=1, 2 min.",steps:[
{ask:"Draw/trace: which types visit Department 1?",ans:"Foreign <b>and</b> Regular → demand 3 + 11 = <b>14/hr</b>.",why:"Step 1 is always: total demand at each resource."},
{ask:"Capacity of Department 1?",ans:"3/15 per min = 0.2/min = <b>12/hr</b>."},
{ask:"Implied utilization of Dept 1 and the others?",ans:"Dept 1: 14/12 = <b>117%</b>; File 18/20 = 90%; Foreign 3/6 = 50%; Dept 2 4/15 = 27%; Print 18/30 = 60%."},
{ask:"Bottleneck?",ans:"<span class='red'>Department 1</span> (highest implied utilization), not Foreign Dep. (lowest capacity)."},
{ask:"Max flow rate if the mix stays the same?",ans:"18 / 1.167 = <b>15.4/hr</b> (Foreign 2.57, Regular 9.43, EZ 3.43)."}]},
{title:"A process with attrition",setup:"A recruiting firm: <b>Screen</b> (2 recruiters, 10 min/CV) → 40% pass → <b>Interview</b> (3 interviewers, 45 min) → 50% pass → <b>Offer</b> (1 partner, 30 min). 20 CVs arrive per hour.",steps:[
{ask:"Demand at each resource?",ans:"Screen 20/hr; Interview 20 × 0.4 = 8/hr; Offer 8 × 0.5 = 4/hr.",why:"Only survivors move downstream."},
{ask:"Capacities?",ans:"Screen 2/10 × 60 = 12/hr; Interview 3/45 × 60 = 4/hr; Offer 1/30 × 60 = 2/hr."},
{ask:"Implied utilizations and bottleneck?",ans:"Screen 20/12 = 167%; Interview 8/4 = <b>200%</b>; Offer 4/2 = 200%. Tie between Interview and Offer at 200% (both are bottlenecks); Screen at 167% is also over.",why:"Note the partner has the lowest capacity (2/hr), but you still have to compare against demand."},
{ask:"Process yield? CVs needed for 3 offers per hour?",ans:"0.4 × 0.5 = <b>20%</b> → 3/0.2 = <b>15 CVs/hr</b>."}]}
],
checks:[
{id:"mu1",q:"With multiple flow unit types, the bottleneck is the resource with…",opts:["The lowest capacity","The highest implied utilization","The longest processing time","The most flow unit types"],a:1,why:"Implied utilization = demand/capacity accounts for how much work actually arrives."},
{id:"mu2",q:"Implied utilization of 125% means…",opts:["An error, since utilization can't exceed 100%","The resource would need to work 125% of the time to serve all demand; 20% of its demand can't be served","The resource is idle 25% of the time","Demand is 25% lower than capacity"],a:1,why:"It can process only 100/125 = 80% of the demand, so 20% goes unserved."},
{id:"mu3",q:"In a process with attrition, demand at an upstream resource is generally…",opts:["Lower than at downstream resources","Higher than at downstream resources","The same everywhere","Zero"],a:1,why:"Upstream sees all units; some drop out before reaching downstream steps."},
{id:"mu4",q:"Process yields are 90%, 80% and 50%. Process yield?",opts:["73%","36%","50%","220%"],a:1,why:"0.9 × 0.8 × 0.5 = 0.36."},
{id:"mu5",q:"Two methods to compute implied utilization: demand/capacity vs minutes of work demanded / minutes available. They…",opts:["Give different answers","Are mathematically equivalent","Only agree with one flow unit","Only the second is correct"],a:1,why:"Both divide workload by capacity, just in different units."},
{id:"mu6",q:"The lowest-capacity resource in a multi-product process is…",opts:["Always the bottleneck","Never the bottleneck","The “primary suspect” but possibly innocent if little demand reaches it","Irrelevant"],a:2,why:"The detective analogy: you must check demand at each resource."},
{id:"mu7",q:"Capital One books 26.4 loans per 100 applications. To book 700 loans/month you need about…",opts:["700 applications","~1,850 applications","~2,650 applications","~7,000 applications"],a:2,why:"700/0.264 ≈ 2,651."}
],
calcs:[
{id:"muc1",q:"A clinic: 6 patients/hr need X-ray only, 4/hr need X-ray + MRI. X-ray: 1 tech, 5 min/patient. MRI: 1 machine, 12 min/patient. Implied utilization of the X-ray?",ans:83.33,unit:"%",steps:["Demand at X-ray = 6 + 4 = 10/hr.","Capacity = 60/5 = 12/hr.","10/12 = <b>83.3%</b>."]},
{id:"muc2",q:"Same clinic. Implied utilization of the MRI?",ans:80,unit:"%",steps:["Demand at MRI = 4/hr (only those who need it).","Capacity = 60/12 = 5/hr.","4/5 = <b>80%</b>. So the X-ray (83%) is the bottleneck, even though MRI has the lower capacity."]},
{id:"muc3",q:"Resource R handles type A (8/hr, 6 min each) and type B (5/hr, 10 min each). R has 2 workers. Implied utilization (minutes-of-work method)?",ans:81.67,unit:"%",steps:["Work demanded = 8 × 6 + 5 × 10 = 48 + 50 = 98 min/hr.","Available = 2 × 60 = 120 min/hr.","98/120 = <b>81.7%</b>."]},
{id:"muc4",q:"A process has three steps with yields 95%, 80%, 70%. How many units must start to get 266 good units?",ans:500,unit:"units",steps:["Process yield = 0.95 × 0.8 × 0.7 = 0.532.","266 / 0.532 = <b>500 units</b>."]},
{id:"muc5",q:"Highest implied utilization is 140%, total demand is 21 units/hr (mix fixed). Max flow rate?",ans:15,unit:"units/hr",steps:["21 / 1.4 = <b>15/hr</b>."]},
{id:"muc6",q:"Fast-casual restaurant: 8 orders/min; 50% bowls, 30% salads, 20% juices. The “Chop” station (2 workers, 0.25 min per order) serves bowls and salads. Implied utilization of Chop?",ans:80,unit:"%",steps:["Orders reaching Chop = 8 × (0.5 + 0.3) = 6.4/min.","Capacity = 2/0.25 = 8/min.","6.4/8 = <b>80%</b>."],why:"Multiply total demand by the share of the mix that visits the resource."}
],
gens:[["multi_iu","Implied utilization with a product mix"],["multi_yield","Process yield & units to start"]],
cases:`<div class="callout case"><b>📂 Capital One (the module's main case)</b>Applications flow Interview → Underwriting → QA → Closing with heavy attrition (52% declined, 14.6% withdrawn, 7% withdraw at closing). Underwriting has the highest implied utilization (~160%). <a href="#case/capone">Full step-by-step →</a></div>
<div class="callout case"><b>📂 Management Science journal</b>2,300 submissions in 2015 → &gt;6,000 in 2026 (AI). Desk reject 30–40%, total reject 90%. Department editors (50), associate editors (400), reviewers (5,000). A process with attrition where AI is changing demand.</div>
<div class="callout case"><b>📂 Cranberry case</b>Classic multi-flow example (dry vs wet harvested berries) mentioned as background; the module title says “calculations beyond the Cranberry case.”</div>`,
traps:["Using the lowest-capacity rule with multiple flow units.","Forgetting that rejected units still consumed capacity at the steps they visited.","Applying the mix percentages to the wrong base (they're shares of total demand)."],
prof:["The location of the bottleneck now depends on the product mix.","Watching where inventory piles up works when reacting to an existing problem, but not for proactive planning (next year's volumes). That's what implied utilization is for."]
});
OM.gens.multi_iu=function(){const r=OM.rnd;const dA=r(2,12),dB=r(2,12);const res=[{n:"Step 1",m:r(1,3),pA:r(2,8),pB:r(2,8)},{n:"Step 2",m:r(1,3),pA:r(4,15),pB:0},{n:"Step 3",m:r(1,3),pA:0,pB:r(4,15)}];
  res.forEach(x=>{x.work=dA*x.pA+dB*x.pB;x.iu=x.work/(x.m*60);});const k=r(0,2);const R=res[k];
  const desc=res.map(x=>`<b>${x.n}</b> (m=${x.m}): ${x.pA?`A ${x.pA} min`:"A skips"}, ${x.pB?`B ${x.pB} min`:"B skips"}`).join("; ");
  return{q:`Type A demand ${dA}/hr, type B ${dB}/hr. ${desc}. Implied utilization of <b>${R.n}</b>?`,ans:R.iu*100,unit:"%",hint:"Minutes of work demanded ÷ (m × 60).",steps:[`Work at ${R.n} = ${dA}×${R.pA} + ${dB}×${R.pB} = ${R.work} min/hr`,`Available = ${R.m}×60 = ${R.m*60} min/hr`,`Implied utilization = <b>${fmt(R.iu*100,1)}%</b>`,`(All: ${res.map(x=>`${x.n} ${fmt(x.iu*100,0)}%`).join(", ")} → bottleneck = highest)`]};};
OM.gens.multi_yield=function(){const r=OM.rnd;const y=[r(60,98),r(50,95),r(40,95)];const Q=r(5,50)*10;const py=y.reduce((a,b)=>a*b/100,1);
  return{q:`Three steps with yields ${y.join("%, ")}%. How many units must start to end with ${Q} good units?`,ans:Q/py,unit:"units",steps:[`Process yield = ${y.map(v=>v/100).join(" × ")} = ${fmt(py,4)}`,`${Q} / ${fmt(py,4)} = <b>${fmt(Q/py,1)}</b>`]};};
})();
