(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
OM.modules.push({
id:"flow",n:3,code:"FLOW",icon:"🥪",color:"#b7791f",title:"Labor Productivity: Cycle Time, Idle Time, Takt & Line Balance",
status:"slides + lecture",
blurb:"Cycle time, idle time, labor content, average labor utilization, cost of direct labor, filling an empty process, takt time and target manpower (Subway).",
intro:"Module PROCESS told you <i>how much</i> a process can make. FLOW tells you <i>how well you use your people</i>, and what it costs per unit. Told through the <b>Subway</b> sandwich line.",
objectives:["Determine the <b>cycle time</b> of a process and the <b>idle time</b> of resources","Find the <b>labor content</b> and the <b>average labor utilization</b>","Determine the <b>cost of direct labor</b>","Compute how long it takes to produce X units <b>starting with an empty process</b>","Compute <b>takt time</b> and <b>target manpower</b>, and assign tasks to workers (line balancing)"],
lesson:[
{h:"The Subway line (our running example)",html:`
<p>20 small activities (greet 4s, take order 5s, bread 4s, cut 3s, meat 12s, cheese 9s, veggies…, wrap 13s, cookie 14s, register 20s…) add up to <b>120 seconds of work per sandwich</b>. With the “3+1” staffing plan, 3 employees split the work:</p>
${V("flow",{tu:"sec",ru:"hr",steps:[{name:"Employee 1",p:37},{name:"Employee 2",p:46},{name:"Employee 3",p:37}],cap:"Employee 1: greet → cheese (37 s). Employee 2: veggies, condiments, wrap (46 s). Employee 3: value meal, cookies, register (37 s)."})}
<p>Capacities: 3600/37 = <b>97.3/hr</b>, 3600/46 = <b>78.3/hr</b>, 97.3/hr → <span class="red">Employee 2 is the bottleneck</span>. With unlimited demand, flow rate = 78.3 sandwiches/hr.</p>
<p class="sub">Assumptions used in class: deterministic times, everyone orders every ingredient, no handling time; the toaster has plenty of capacity (ignore it).</p>`},
{h:"Cycle time: the “beat” of the output",html:`
<div class="formula"><span class="eq">Cycle time (CT) = ${fr("1","Flow rate")}</span><div class="why">💡 The time between two finished units coming out the end of the line.</div></div>
<p>Subway: flow rate = 1 sandwich every 46 seconds → <b>CT = 46 sec/sandwich</b>. (In general, with unlimited demand CT = processing time of the bottleneck, divided by its m.)</p>
<div class="callout trap"><b>⚠️ Cycle time ≠ flow time</b>Flow time = how long ONE sandwich spends in the system (≥ 120 s). Cycle time = how often a sandwich pops out (46 s). A car factory has a cycle time of ~1 minute but a flow time of ~a day or more.</div>
<div class="callout trap"><b>⚠️ If demand is the constraint</b>Flow rate = demand, so CT = 1/demand. E.g., demand 50/hr → CT = 3600/50 = 72 sec, even though the bottleneck could go faster.</div>`},
{h:"Idle time: paid time with nothing to do",html:`
<div class="formula"><span class="eq">Idle time<sub>i</sub> = Cycle time × m<sub>i</sub> − Processing time<sub>i</sub></span><div class="why">💡 Per cycle, each worker is paid for one cycle (46 s) but only works p seconds. The rest is idle. (For a station with m workers, total paid time per cycle is m × CT.)</div></div>
${V("balance",{st:[{name:"Emp 1",p:37},{name:"Emp 2",p:46},{name:"Emp 3",p:37}]})}
<p>Subway: idle = (46−37) + (46−46) + (46−37) = 9 + 0 + 9 = <b>18 seconds per sandwich</b>.</p>`},
{h:"Labor content & average labor utilization",html:`
<div class="formula"><span class="eq">Labor content = p<sub>1</sub> + p<sub>2</sub> + … + p<sub>n</sub></span><div class="why">💡 Total minutes of human WORK in one unit, <u>without</u> idle time. Subway: 37 + 46 + 37 = <b>120 sec</b>.</div></div>
<div class="formula"><span class="eq">Average labor utilization = ${fr("Labor content","Cycle time × Number of employees")}</span><div class="why">💡 Work you get ÷ time you pay for. Subway: 120 / (46 × 3) = 120/138 = <b>87.0%</b>. Of every $1 of wages, 87¢ buys work and 13¢ buys idle time.</div></div>
<div class="callout why"><b>💡 Why this formula?</b>Per cycle, you pay 3 people for 46 s each = 138 worker-seconds, and you get exactly one sandwich (120 s of work). Equivalent form: labor content / (labor content + total idle time) = 120/(120 + 18).</div>
<div class="callout prof"><b>🎓 Use the professor's formula</b>Labor content ÷ (CT × number of employees). It works automatically when stations have different numbers of workers (count every worker).</div>
<div class="callout trap"><b>⚠️ Labor utilization measures BALANCE, not productivity</b>If workers slowed down so every station took 60 s, utilization would rise toward 100% but output would fall. That's why you also need cost of direct labor.</div>`},
{h:"Cost of direct labor",html:`
<div class="formula"><span class="eq">Cost of direct labor = ${fr("Total wages per unit of time","Flow rate")}</span><div class="why">💡 What you pay per hour, spread over the units made in that hour.</div></div>
<p>Subway with wage $15/hr: wages = 3 × $15 = $45/hr; flow rate = 78.26/hr → <b>$0.575 per sandwich</b>.</p>
<div class="callout trap"><b>⚠️ Includes idle time!</b>The professor's definition divides wages by flow rate, so idle time is <u>included</u>. ChatGPT/Claude often compute “labor content × wage” (= 120 s × $15/3600 s = $0.50), which <b>leaves out idle time</b>. On the exam use wages ÷ flow rate.</div>
<div class="callout case"><b>📂 Hidden labor costs</b>At Daimler ~70% of cost is purchased parts, which contain the suppliers' labor (tier 1, tier 2…). Subway's “material cost” also includes upstream labor (farmers, bakers). Financial statements understate labor content.</div>`},
{h:"Starting with an empty process (the school bus)",html:`
<p>A school bus with 20 students arrives at an empty Subway. How long until all 20 have their sandwich?</p>
${V("gantt",{p:[37,46,37],n:5,names:["Emp 1","Emp 2","Emp 3"],cap:"First 5 of the students. The first sandwich takes the full 120 s (labor content); after that, one comes out every cycle time (46 s)."})}
<div class="formula"><span class="eq">Time to make X units (starting empty) = Time through empty system + (X − 1) × Cycle time</span><div class="why">💡 The first unit has to walk through every step (= labor content if there's no waiting, here 120 s). Each later unit is limited by the bottleneck, so they come out one per cycle.</div></div>
<p>20 students: 120 + 19 × 46 = <b>994 sec ≈ 16.6 min</b>.</p>
<div class="callout trap"><b>⚠️ Common wrong answers</b>20 × 120 = 2,400 s (pretends only one sandwich is made at a time; but the workers work in parallel on different sandwiches). 20 × 46 = 920 s (forgets the first sandwich takes 120 s).</div>
<p class="sub">Use the cycle time of the process <u>with unlimited demand</u> here: the bus creates a burst of demand, so the bottleneck runs flat out.</p>`},
{h:"Takt time: the rhythm demand asks for",html:`
<div class="formula"><span class="eq">Takt time = ${fr("Available time","Demand")}</span><div class="why">💡 “Takt” = German for beat/rhythm. The process has to play to the rhythm of demand.</div></div>
<p>Lunch rush: 160 sandwiches/hr → takt = 3600/160 = <b>22.5 sec/sandwich</b>: one must come out every 22.5 s.</p>
<div class="callout key"><b>📌 Takt vs. cycle time</b>Takt time is a <u>target</u> set by demand; it doesn't depend on your process. Cycle time is what your process actually delivers. A process that meets demand has <b>cycle time = takt time</b>.</div>
<div class="callout analogy"><b>🏃 Marathon analogy (from class)</b>To finish 26 miles in 3 hours you need ~7-minute miles. The 7-minute pace is the takt time; your actual pace is the cycle time.</div>`},
{h:"Target manpower & assigning tasks (line balancing)",html:`
<div class="formula"><span class="eq">Target manpower = ${fr("Labor content","Takt time")}</span><div class="why">💡 Each worker can do at most one takt's worth of work per unit. Total work 120 s ÷ 22.5 s per worker = 5.33 → you need <b>at least 6</b> people.</div></div>
<p>It's a <b>lower bound</b> (assumes 100% labor utilization). In reality tasks can't be split perfectly. Assign tasks in order, never letting a worker exceed the takt:</p>
${V("balance",{st:[{name:"W1",p:16},{name:"W2",p:21},{name:"W3",p:20},{name:"W4",p:22},{name:"W5",p:13},{name:"W6",p:8},{name:"W7",p:20}],takt:22.5,cap:"Greedy assignment against takt 22.5 s (illustrative). Because tasks are indivisible (e.g., register = 20 s, wrap = 13 s), Subway ends up needing 7 workers, not 6."})}
<p><b>Line balancing</b> = sharing work as equally as possible across workers → high labor utilization.</p>
<div class="callout why"><b>💡 Two types of idle time (staffing decision)</b>
① Idle time from <b>poor balance</b> (stations have unequal work).<br>
② Idle time from <b>over-staffing relative to demand</b> (7 people at 3pm when demand is 80/hr). Fix by staffing to each period's takt: 160/hr → takt 22.5 → 7 people; 80/hr → takt 45 → 3 people.<br>Average labor utilization captures <u>both</u>.</div>
<div class="callout why"><b>💡 How to scale Subway from 78 to ~160/hr</b>Speeding up a non-bottleneck only creates idle time. Options: duplicate the line (2 per station ≈ 156/hr), add a person at the bottleneck, rebalance tasks, or split into more specialized stations (more people, lower labor utilization). Taking work <u>out</u> of the line (pre-cut veggie kits, subassemblies) reduces labor content itself.</div>`}
],
formulas:[
{name:"Cycle time",f:`CT = ${fr("1","Flow rate")}`,why:"Time between consecutive finished units."},
{name:"Idle time (per cycle)",f:"Idle time<sub>i</sub> = CT × m<sub>i</sub> − p<sub>i</sub>",why:"Paid time per cycle minus working time per unit."},
{name:"Labor content",f:"Labor content = p<sub>1</sub> + p<sub>2</sub> + … + p<sub>n</sub>",why:"All the human work time in one unit (no idle time)."},
{name:"Average labor utilization",f:`${fr("Labor content","CT × Number of employees")}`,why:"Work received ÷ time paid. Measures balance."},
{name:"Cost of direct labor",f:`${fr("Total wages per time","Flow rate")}`,why:"Includes idle time (prof's definition)."},
{name:"Time to make X units from empty",f:"Time through empty system + (X − 1) × CT",why:"First unit walks through everything; then one per cycle."},
{name:"Takt time",f:`${fr("Available time","Demand")}`,why:"Target cycle time demanded by customers."},
{name:"Target manpower",f:`${fr("Labor content","Takt time")}`,why:"Minimum number of workers (round up; real staffing ≥ this)."}
],
worked:[
{title:"Subway: all the labor numbers",src:"Slides FLOW #7–9",setup:"Processing times 37, 46, 37 sec; one worker each; unlimited demand; wage $15/hr.",steps:[
{ask:"Flow rate and cycle time?",ans:"Capacities 97.3, 78.3, 97.3/hr → flow rate 78.3/hr → CT = 3600/78.3 = <b>46 sec</b>.",why:"With unlimited demand, the bottleneck sets the pace."},
{ask:"Idle time of each worker per cycle?",ans:"46−37 = <b>9 s</b>, 46−46 = <b>0 s</b>, 46−37 = <b>9 s</b> → 18 s total."},
{ask:"Labor content?",ans:"37 + 46 + 37 = <b>120 sec</b>."},
{ask:"Average labor utilization?",ans:"120 / (46 × 3) = 120/138 = <b>87.0%</b>."},
{ask:"Cost of direct labor?",ans:"$45/hr ÷ 78.26/hr = <b>$0.575/sandwich</b>.",why:"Includes the 18 s of idle time. Labor content × wage would give $0.50, which is the wrong definition for this course."},
{ask:"20 students arrive at an empty store. Time to serve all?",ans:"120 + 19 × 46 = <b>994 s</b> (≈ 16.6 min)."}]},
{title:"Mr. K's hair salon (the professor's practice problem)",src:"Slides FLOW #19–20; solved in class",setup:"Unlimited demand. Activities: 1 Welcome 10 min, 2 Wash 10, 3 Massage 10, 4 Hair 25, 5 Checkout 5. Worker-paced line: <b>S1 does 1; S2 does 2+3; S3 does 4+5.</b>",
viz:V("flow",{tu:"min",ru:"hr",steps:[{name:"S1 (act. 1)",p:10},{name:"S2 (act. 2+3)",p:20},{name:"S3 (act. 4+5)",p:30}]}),
steps:[
{ask:"MK1: Processing time of each server? Bottleneck?",ans:"S1 = 10, S2 = 10+10 = 20, S3 = 25+5 = 30 min. Capacities 6, 3, <b>2/hr</b> → <span class='red'>S3 is the bottleneck</span>.",why:"Add up activities per server (resource), then compare capacities."},
{ask:"MK2: Utilization of S2 (guests admitted at the bottleneck rate)?",ans:"Flow rate = 2/hr; capacity S2 = 3/hr → 2/3 = <b>66.7%</b>."},
{ask:"MK3: Average labor utilization?",ans:"Labor content = 60 min; CT = 30 min; 3 servers → 60/(30 × 3) = <b>66.7%</b>."},
{ask:"MK4: Cost of direct labor at $20/hr?",ans:"Wages 3 × $20 = $60/hr ÷ 2 guests/hr = <b>$30 per customer</b>."},
{ask:"MK5: Starting empty, time to serve 10 customers?",ans:"60 + 9 × 30 = <b>330 min</b>."},
{ask:"MK6: Open 10 hrs/day, goal 40 customers/day. Takt time?",ans:"600 min / 40 = <b>15 min/customer</b>."},
{ask:"MK7: Target manpower?",ans:"60 / 15 = <b>4 servers</b> (lower bound; with indivisible 25-min hair task, real staffing would need more).",why:"The 25-min activity is longer than the 15-min takt, so one person can't do it within one takt; you'd need parallel stylists. Target manpower ignores such integer issues."}]},
{title:"Takt & target manpower at Subway",src:"Slides FLOW #10–12",setup:"Labor content 120 s. Demand 160 sandwiches/hr.",steps:[
{ask:"Takt time?",ans:"3600/160 = <b>22.5 s</b>."},
{ask:"Target manpower?",ans:"120/22.5 = <b>5.33 → 6 workers minimum</b>."},
{ask:"Why did the actual assignment need 7?",ans:"Tasks are indivisible (register 20 s, cookies 14 s, wrap 13 s, meat 12 s). Packing them into 22.5-second “bins” in order leaves gaps, so a 7th worker is needed.",why:"Target manpower assumes perfect balance (100% labor utilization). Real lines have balance losses."}]}
],
checks:[
{id:"fl1",q:"Cycle time is…",opts:["The time one unit spends in the process","The time between two consecutive units leaving the process","The sum of all processing times","The available time divided by demand"],a:1,why:"CT = 1/flow rate. (Sum of processing times = labor content; available time/demand = takt time.)"},
{id:"fl2",q:"Takt time depends on…",opts:["The bottleneck's capacity","Demand and available time only","Labor content","The number of workers"],a:1,why:"Takt = available time / demand. It's a target, independent of process capacity."},
{id:"fl3",q:"Average labor utilization mostly measures…",opts:["How fast workers are","How well the work is balanced across workers (and staffing vs. demand)","Quality","Flow time"],a:1,why:"It's work ÷ paid time. Slow workers in a perfectly balanced line can still show high labor utilization."},
{id:"fl4",q:"Which definition of cost of direct labor does the professor use?",opts:["Labor content × wage rate","Total wages per hour ÷ flow rate (includes idle time)","Wage ÷ labor content","Wage × cycle time"],a:1,why:"Wages ÷ flow rate. It includes idle time, which AI tools often forget."},
{id:"fl5",q:"Target manpower = labor content / takt time is…",opts:["The exact number of workers you'll need","A lower bound on the number of workers","An upper bound","Unrelated to staffing"],a:1,why:"It assumes 100% labor utilization (perfect balance). Real assignments usually need more people."},
{id:"fl6",q:"Doing the cookie offer and the register in parallel with the sandwich making (same people) will mainly…",opts:["Increase capacity","Reduce flow time","Reduce labor content","Reduce takt time"],a:1,why:"Parallel work shortens how long a customer is in the system, not how many sandwiches per hour (every sandwich still needs every task)."},
{id:"fl7",q:"Demand drops from 160/hr to 80/hr but you keep 7 workers. What happens to average labor utilization?",opts:["Stays the same","Roughly halves (idle time from over-staffing)","Goes up","Goes to 100%"],a:1,why:"CT doubles (flow rate = demand), labor content unchanged, same workers → utilization halves. That's the 2nd type of idle time: over-staffing vs. demand."},
{id:"fl8",q:"Starting empty, a 4-step line (5, 8, 6, 4 min) makes 10 units. The first unit finishes at minute…",opts:["8","23","32","80"],a:1,why:"The first unit walks through all steps without waiting: 5+8+6+4 = 23 min (the labor content). Then one per 8 min."}
],
calcs:[
{id:"flc1",q:"A 3-step line (1 worker each): 50, 60, 40 seconds. Unlimited demand. Cycle time (sec)?",ans:60,unit:"sec",steps:["Capacities 72, 60, 90/hr → bottleneck = step 2 (60 s).","Flow rate = 60/hr → CT = 3600/60 = <b>60 s</b>."]},
{id:"flc2",q:"Same line (50, 60, 40 s). Total idle time per unit (sec)?",ans:30,unit:"sec",steps:["CT = 60 s.","Idle: (60−50) + (60−60) + (60−40) = 10 + 0 + 20 = <b>30 s</b>."]},
{id:"flc3",q:"Same line (50, 60, 40 s). Average labor utilization?",ans:83.33,unit:"%",steps:["Labor content = 150 s.","150 / (60 × 3) = 150/180 = <b>83.3%</b>."],why:"Same as 150/(150 + 30 idle)."},
{id:"flc4",q:"Same line (50, 60, 40 s), wage $18/hr each. Cost of direct labor per unit?",ans:0.9,unit:"$/unit",tol:0.011,steps:["Wages = 3 × $18 = $54/hr.","Flow rate = 60/hr.","$54/60 = <b>$0.90/unit</b>."],why:"Labor content × wage = 150/3600 × 18 = $0.75 would wrongly ignore idle time."},
{id:"flc5",q:"Same line (50, 60, 40 s). Starting empty, time to complete 25 units (sec)?",ans:1590,unit:"sec",steps:["Time through empty system = 50+60+40 = 150 s.","+ (25 − 1) × 60 = 1,440.","Total = <b>1,590 s</b> (26.5 min)."]},
{id:"flc6",q:"Labor content is 9 minutes per unit. Demand is 40 units/hr. Takt time (min)?",ans:1.5,unit:"min",steps:["Takt = available time / demand = 60 min / 40 = <b>1.5 min</b>."]},
{id:"flc7",q:"Labor content 9 min/unit, demand 40/hr. Target manpower (unrounded)?",ans:6,unit:"workers",steps:["Takt = 1.5 min.","Target manpower = 9 / 1.5 = <b>6 workers</b>."]},
{id:"flc8",q:"Demand is lower than capacity: line 30, 45, 35 s (1 worker each), demand 60 units/hr. Average labor utilization?",ans:61.11,unit:"%",hint:"When demand-constrained, cycle time = 1/demand, not the bottleneck time.",steps:["Capacity = 3600/45 = 80/hr > 60 → flow rate = 60/hr.","CT = 3600/60 = 60 s.","Labor content = 110 s.","110/(60 × 3) = <b>61.1%</b>."],why:"Idle time now includes over-staffing relative to demand."}
],
gens:[["flow_labor","Cycle time, labor utilization, cost of labor"],["flow_takt","Takt time & target manpower"],["flow_empty","Starting with an empty process"]],
cases:`<div class="callout case"><b>📂 Subway</b>The whole module is built on the Subway line (37/46/37 s, 120 s labor content, 160/hr lunch demand). Franchise facts: ~42,000 stores, ~$500k revenue/store, 8% royalty + 4.5% marketing fee, $100–200k start-up.</div>
<div class="callout case"><b>📂 Capital One</b>Underwriters (the most expensive resource) spend part of their time on clerical work (data entry, file prep), a line-balancing problem: move low-skill work off the bottleneck. <a href="#case/capone">See the case →</a></div>`,
traps:["Using cycle time = bottleneck time when the process is demand-constrained. Then CT = 1/demand.","Forgetting to count ALL employees (including multiple workers at a station) in average labor utilization and wages.","Computing cost of direct labor as labor content × wage (ignores idle time).","Rounding target manpower down. 5.33 means at least 6."],
prof:["Labor utilization can be gamed by slowing down. That's why it must be paired with cost of direct labor.","For machines, servers, LLMs (tokens as flow units) say “resource utilization” instead of labor utilization.","Make-to-order (Subway, Dell) vs make-to-stock (McDonald's batches of Big Macs, Apple) are managerial choices, not right/wrong."]
});
OM.gens.flow_labor=function(){const r=OM.rnd;const p=[r(20,60),r(20,60),r(20,60)];const w=r(12,25);const ct=Math.max(...p),lc=p[0]+p[1]+p[2];const ask=OM.pick(["ct","alu","cdl","idle"]);const d=`A 3-worker line takes <b>${p.join(", ")} sec</b> per unit at the three stations (1 worker each). Unlimited demand.`;
  if(ask==="ct")return{q:d+" Cycle time (sec)?",ans:ct,unit:"sec",steps:[`Bottleneck = slowest station = ${ct} s → flow rate = 3600/${ct} = ${fmt(3600/ct)}/hr`,`CT = 1/flow rate = <b>${ct} s</b>`]};
  if(ask==="idle")return{q:d+" Total idle time per unit (sec)?",ans:3*ct-lc,unit:"sec",steps:[`CT = ${ct} s`,`Idle = ${p.map(x=>`(${ct}−${x})`).join(" + ")} = <b>${3*ct-lc} s</b>`]};
  if(ask==="alu")return{q:d+" Average labor utilization?",ans:lc/(3*ct)*100,unit:"%",steps:[`Labor content = ${lc} s; CT = ${ct} s`,`${lc}/(${ct} × 3) = <b>${fmt(lc/(3*ct)*100,1)}%</b>`]};
  const fr_=3600/ct;return{q:d+` Wage $${w}/hr per worker. Cost of direct labor ($/unit)?`,ans:3*w/fr_,unit:"$/unit",tol:Math.max(0.011,3*w/fr_*0.02),steps:[`Flow rate = 3600/${ct} = ${fmt(fr_)}/hr`,`Wages = 3 × $${w} = $${3*w}/hr`,`$${3*w}/${fmt(fr_)} = <b>$${fmt(3*w/fr_,3)}</b>/unit`]};};
OM.gens.flow_takt=function(){const r=OM.rnd;const lc=r(4,20),dem=OM.pick([20,24,30,40,45,60,80]);const takt=60/dem;const ask=OM.pick(["t","m"]);
  if(ask==="t")return{q:`Demand is ${dem} units/hr. Takt time in minutes?`,ans:takt,unit:"min",steps:[`Takt = 60 min / ${dem} = <b>${fmt(takt,3)} min</b>`]};
  return{q:`Labor content is ${lc} min/unit and demand is ${dem} units/hr. Target manpower (unrounded)?`,ans:lc/takt,unit:"workers",steps:[`Takt = 60/${dem} = ${fmt(takt,3)} min`,`Target manpower = ${lc}/${fmt(takt,3)} = <b>${fmt(lc/takt,2)}</b> (round up to ${Math.ceil(lc/takt-1e-9)} people in practice)`]};};
OM.gens.flow_empty=function(){const r=OM.rnd;const p=[r(2,9),r(2,9),r(2,9),r(2,9)];const X=r(5,40);const lc=p.reduce((a,b)=>a+b,0),ct=Math.max(...p);
  return{q:`A 4-station worker-paced line takes <b>${p.join(", ")} min</b> (1 worker each). Starting with an empty process, how long to finish <b>${X}</b> units (min)?`,ans:lc+(X-1)*ct,unit:"min",steps:[`Time through empty system = ${p.join("+")} = ${lc} min`,`Cycle time = bottleneck = ${ct} min`,`${lc} + (${X}−1) × ${ct} = <b>${lc+(X-1)*ct} min</b>`]};};
})();
