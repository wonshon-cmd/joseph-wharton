/* Extra coverage so every bullet of the course outline has lessons + questions.
   Loaded after the module files, before engine.js. */
(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;const M=id=>OM.modules.find(m=>m.id===id);
const add=(id,o)=>{const m=M(id);["lesson","formulas","worked","checks","calcs","gens","traps","prof"].forEach(k=>{if(o[k])m[k]=(m[k]||[]).concat(o[k]);});};

/* ---------------- PROCESS: inventory & flow time ---------------- */
add("process",{
checks:[
{id:"pr11",q:"Flow time is…",opts:["The time between two units leaving the process","The time a flow unit spends from entering to leaving the process","The processing time of the bottleneck","Available time divided by demand"],a:1,why:"Flow time = time in the system (waiting + processing). Cycle time is the time between exits; takt is the target from demand."},
{id:"pr12",q:"In a service process that is capacity-constrained, the “inventory” mostly consists of…",opts:["Finished goods","Waiting customers (demand waiting for supply)","Idle employees","Raw materials"],a:1,why:"Services can't be stored, so when demand exceeds capacity the inventory is customers waiting."},
{id:"pr13",q:"A manufacturer is demand-constrained. Its inventory mostly consists of…",opts:["Waiting customers","Goods waiting for customers (supply waiting for demand)","Backorders","Nothing"],a:1,why:"Capacity exceeds demand, so supply waits for demand: products on shelves, idle resources."},
{id:"pr14",q:"Which pair of measures is typically NOT reported in financial statements, but matters most in operations?",opts:["Revenue and profit","Flow time and flow rate (and inventory in units)","Assets and liabilities","Cash and debt"],a:1,why:"The slides: inventory, flow rate and flow time are “the three most important measures for any operation… yet they are typically not reported in financial statements.”"}],
calcs:[
{id:"prc9",q:"A process has 45 units of inventory on average and a flow rate of 15 units per hour. Flow time (hours)?",ans:3,unit:"hours",steps:["Little's Law: T = I/R = 45/15 = <b>3 hours</b>."],why:"I, R, T are linked: know two, compute the third."},
{id:"prc10",q:"Penn ER: 180 patients per day. A patient arrives on average every … minutes?",ans:8,unit:"min",steps:["1,440 min/day ÷ 180 = <b>8 minutes</b> (the slide's “a patient every 8 min”)."],why:"The inverse of a rate is the time between units."}]
});

/* ---------------- FLOW: line balance extra ---------------- */
add("flow",{checks:[
{id:"fl9",q:"Line balancing means…",opts:["Making every worker as fast as possible","Spreading the work as equally as possible across workers so labor utilization is high","Adding workers at the bottleneck only","Matching inventory to demand"],a:1,why:"Definition from the summary slide: the attempt to share work equally, leading to high labor utilization."},
{id:"fl10",q:"Stations take 20, 20, 50 sec (1 worker each). Moving 15 sec of work from station 3 to station 1 will…",opts:["Not change capacity","Raise capacity from 72/hr to 102.9/hr (CT 50 → 35 s)","Lower labor utilization","Increase labor content"],a:1,why:"New times 35, 20, 35 → CT = 35 s → 3600/35 = 102.9/hr. Labor content stays 90 s, labor utilization rises from 60% to 86%."}]});

/* ---------------- LITTLE: extra ---------------- */
add("little",{checks:[
{id:"li9",q:"Holding inventory constant, Little's Law says that reducing flow time will…",opts:["Reduce flow rate","Increase flow rate","Not change anything","Increase inventory"],a:1,why:"I = R × T → with I fixed, lower T means higher R."}]});

/* ---------------- MULTI: variety & set-ups ---------------- */
add("multi",{
lesson:[{h:"Variety & set-ups: why batching changes capacity",html:`
<p>Many resources must be <b>set up</b> (changed over) before producing a different product: a stamping press changes dies, a paint line changes color, an OR is cleaned and re-prepped, a cook switches recipes. During the set-up time <b>S</b> nothing is produced. To avoid setting up too often, firms produce in <b>batches</b> of B units.</p>
<div class="formula"><span class="eq">Capacity with batch size B = ${fr("B","S + B × p")}</span><div class="why">💡 One batch takes S (set-up) + B × p (production) and yields B units. Larger batches spread the set-up over more units → higher capacity.</div></div>
<div class="formula"><span class="eq">Batch size needed for a flow rate R: B = ${fr("R × S","1 − R × p")}</span><div class="why">💡 Solve B/(S + B·p) = R for B. Use R = demand (or takt) to find the smallest batch that keeps up.</div></div>
${V("bars",{bars:[10,25,50,100,200,400].map(B=>({l:"B="+B,v:Math.round(B/(60+B*0.5)*600)/10,t:fmt(B/(60+B*0.5)*60,1)+"/hr"})),max:130,line:120,linel:"limit 1/p = 120/hr",yl:"capacity per hour",cap:"Set-up 60 min, p = 0.5 min/unit: capacity rises with batch size but never exceeds 1/p = 2/min = 120/hr."})}
<div class="callout trap"><b>⚠️ The catch</b>Big batches create <b>inventory</b> (you make a lot of one thing before switching) and long flow times, and they hurt responsiveness to variety. This is why TPS wants <b>short set-ups (SMED)</b> and <b>heijunka</b> (small batches, mixed models).</div>
<div class="callout why"><b>💡 Variety</b>Every additional product variant adds a set-up per production cycle. With k products each needing a set-up S per cycle: <b>capacity = units per cycle / (k × S + units per cycle × p)</b>. More variety → more set-ups → less capacity, unless set-ups are cut.</div>
<div class="callout prof"><b>🎓 Slide link</b>Heijunka: “Large batch sizes lead to: inventory, unevenness in flow, unreasonable amount of work over-burdening a machine or operator.”</div>`}],
formulas:[{name:"Capacity with set-ups",f:`${fr("B","S + B·p")}`,why:"Batch output ÷ batch time."},{name:"Batch size for flow rate R",f:`B = ${fr("R·S","1 − R·p")}`,why:"Smallest batch that keeps up with R (needs R·p < 1)."}],
worked:[{title:"Stamping press with set-ups",setup:"A press needs a <b>120-minute</b> die change between batches. Producing a part takes <b>1 minute</b>. Demand is <b>0.5 parts per minute</b>.",steps:[
{ask:"Capacity with a batch of 100?",ans:"100 / (120 + 100 × 1) = 100/220 = <b>0.455 parts/min</b> (27.3/hr) < demand 0.5 → too small."},
{ask:"Smallest batch that meets demand?",ans:"B = R·S/(1 − R·p) = 0.5 × 120 / (1 − 0.5) = <b>120 parts</b>.",why:"Check: 120/(120 + 120) = 0.5 ✔"},
{ask:"Capacity with a batch of 300?",ans:"300/(120 + 300) = <b>0.714/min</b>, enough, but you'd carry much more inventory.",why:"Trade-off: capacity vs inventory/flow time."},
{ask:"Cut the set-up to 30 min (SMED). New minimum batch?",ans:"0.5 × 30 / 0.5 = <b>30 parts</b>: four times smaller batches → far less inventory.",why:"Short set-ups make small batches (heijunka) possible."}]}],
checks:[
{id:"mu8",q:"During a set-up, the resource…",opts:["Produces at half speed","Produces nothing","Produces faster","Has utilization of 100% value-add"],a:1,why:"Set-up time is capacity lost to changeovers."},
{id:"mu9",q:"Increasing the batch size (with set-ups) will…",opts:["Lower capacity and lower inventory","Raise capacity but also raise inventory","Lower capacity and raise inventory","Change nothing"],a:1,why:"Set-ups are spread over more units (capacity ↑), but you produce more of one item at a time (inventory ↑)."},
{id:"mu10",q:"Capacity of a batch process can never exceed…",opts:["B/S","1/p (the rate without any set-ups)","S/p","Demand"],a:1,why:"As B → ∞, B/(S + B·p) → 1/p."},
{id:"mu11",q:"A firm adds many product variants to the same line. Without shorter set-ups, the effect is…",opts:["More capacity","Less capacity or bigger batches/inventory","No effect","Lower labor content"],a:1,why:"Each variant needs its own set-up per cycle."}],
calcs:[
{id:"muc7",q:"Set-up 30 min, processing 0.5 min/unit, batch size 120. Capacity (units per hour)?",ans:80,unit:"units/hr",steps:["Batch time = 30 + 120 × 0.5 = 90 min for 120 units.","Capacity = 120/90 per min = 1.333/min = <b>80/hr</b>."]},
{id:"muc8",q:"Set-up 60 min, p = 2 min/unit, demand 0.3 units/min. Smallest batch that meets demand?",ans:45,unit:"units",steps:["B = R·S/(1 − R·p) = 0.3 × 60/(1 − 0.6) = 18/0.4 = <b>45 units</b>."]}],
gens:[["setup_cap","Capacity with set-ups / batch size"]]
});
OM.gens.setup_cap=function(){const S=OM.pick([20,30,45,60,90,120]),p=OM.pick([0.25,0.5,1,1.5,2]),ask=OM.pick(["cap","B"]);
 if(ask==="cap"){const B=OM.rnd(2,40)*10;const c=B/(S+B*p)*60;return{q:`Set-up time ${S} min, processing time ${p} min/unit, batch size ${B}. Capacity in units per hour?`,ans:c,unit:"units/hr",steps:[`Batch time = ${S} + ${B} × ${p} = ${S+B*p} min`,`Capacity = ${B}/${S+B*p} per min × 60 = <b>${fmt(c,2)}/hr</b>`]};}
 const R=Math.round((1/p)*OM.pick([0.3,0.4,0.5,0.6,0.7,0.8])*100)/100;const B=R*S/(1-R*p);return{q:`Set-up time ${S} min, processing time ${p} min/unit, demand ${R} units/min. Smallest batch size that meets demand?`,ans:B,unit:"units",steps:[`B = R·S/(1 − R·p) = ${R} × ${S} / (1 − ${R} × ${p})`,`= ${fmt(R*S,3)}/${fmt(1-R*p,3)} = <b>${fmt(B,2)}</b>`]};};

/* ---------------- KPI: more questions ---------------- */
add("kpi",{
checks:[
{id:"kp5",q:"A value driver is…",opts:["Any financial ratio","An operational variable that has a large effect on the financial outcome (e.g., ROIC)","The firm's stock price","A cost accounting rule"],a:1,why:"Value drivers are the operational levers at the bottom of the KPI tree that move the top (profit/ROIC) the most."},
{id:"kp6",q:"Reducing inventory (higher turns) improves ROIC mainly because…",opts:["It raises the price","It reduces invested capital (working capital) and holding costs","It increases demand","It increases labor content"],a:1,why:"Inventory is capital tied up; ROIC = return / invested capital."},
{id:"kp7",q:"For a capacity-constrained hospital, which improvement raises revenue?",opts:["Faster check-in at a non-bottleneck","More capacity at the bottleneck (e.g., faster OR turnover)","Lower utilization of the receptionist","Bigger waiting room"],a:1,why:"Revenue = flow rate × price, and flow rate is set by the bottleneck when capacity-constrained."},
{id:"kp8",q:"An airline's revenue per day equals…",opts:["ASM × yield","ASM × load factor × yield","RPM × load factor","Seats × price"],a:1,why:"Available seat miles × share of seats filled = revenue passenger miles; × yield ($/RPM) = revenue."}],
calcs:[
{id:"kpc3",q:"A bakery is capacity-constrained at 400 loaves/day, price $5, variable cost $2/loaf, fixed cost $800/day. Profit per day?",ans:400,unit:"$/day",steps:["Contribution = 400 × ($5 − $2) = $1,200.","Profit = $1,200 − $800 = <b>$400/day</b>."]},
{id:"kpc4",q:"Same bakery: a lean project raises bottleneck capacity by 10% (all sold). New profit per day?",ans:520,unit:"$/day",steps:["Flow rate 440 → contribution 440 × $3 = $1,320.","Profit = $1,320 − $800 = <b>$520</b> (+30% profit from +10% capacity)."],why:"Operating leverage: fixed costs don't grow, so profit grows faster than volume."},
{id:"kpc5",q:"An airline: ASM 2,000,000/day, load factor 80%, yield $0.20/RPM. Revenue per day ($)?",ans:320000,unit:"$",steps:["RPM = 2,000,000 × 0.8 = 1,600,000.","Revenue = 1,600,000 × $0.20 = <b>$320,000</b>."]}],
gens:[["kpi_lev","Operating leverage (capacity → profit)"]]
});
OM.gens.kpi_lev=function(){const q=OM.rnd(10,60)*10,pr=OM.rnd(5,20),vc=OM.rnd(1,pr-2),fc=Math.round(q*(pr-vc)*OM.pick([0.5,0.6,0.7,0.8])),inc=OM.pick([5,10,15,20]);const p0=q*(pr-vc)-fc,q1=q*(1+inc/100),p1=q1*(pr-vc)-fc;
 return{q:`Capacity-constrained shop: ${q} units/day (all sold), price $${pr}, variable cost $${vc}/unit, fixed cost $${fc}/day. Capacity rises ${inc}%. By what % does profit rise?`,ans:(p1/p0-1)*100,unit:"%",steps:[`Profit now = ${q} × ${pr-vc} − ${fc} = $${fmt(p0)}`,`New volume ${fmt(q1)} → profit = $${fmt(p1)}`,`Change = <b>${fmt((p1/p0-1)*100,1)}%</b> (more than ${inc}%: operating leverage)`]};};

/* ---------------- LEAN: more ---------------- */
add("lean",{checks:[
{id:"le10",q:"In a pull system, production at a station is triggered by…",opts:["A forecast","Downstream demand (e.g., a returned kanban card)","The station being idle","Management orders"],a:1,why:"Pull = advancement of a flow unit is driven by demand."},
{id:"le11",q:"Just-in-time (synchronized) delivery of car seats is efficient but…",opts:["Requires lots of inventory","Fragile to disruptions (strikes, weather, supplier problems)","Increases set-up times","Requires push scheduling"],a:1,why:"No buffer = no protection; the chip shortage showed the fragility."},
{id:"le12",q:"Toyota's ‘8th waste’ refers to…",opts:["Transport","Waste of intellect: not using workers' ideas","Over-processing","Defects"],a:1,why:"Matsushita's critique of Taylorism; kaizen and worker involvement address it."}]});

/* ---------------- WAIT: priority rules & customer experience ---------------- */
add("wait",{
lesson:[{h:"Priority rules: who gets served first?",html:`
<table class="t"><tr><th>Rule</th><th>How</th><th>Effect</th></tr>
<tr><td><b>FCFS</b> (first-come, first-served)</td><td>Serve in arrival order</td><td>Feels fair; ignores job length and urgency</td></tr>
<tr><td><b>SPT</b> (shortest processing time first)</td><td>Short jobs first</td><td><b>Minimizes average waiting time</b>; long jobs may wait a long time</td></tr>
<tr><td><b>Priority / triage</b></td><td>By urgency or value (ER triage, VIP lines, express lanes)</td><td>Protects urgent/valuable customers; others wait longer</td></tr></table>
<div class="callout why"><b>💡 Why SPT reduces the average wait</b>Everyone behind a job waits for it. Putting a short job first makes few minutes of everyone else's waiting; putting a long job first makes many. Jobs of 10, 2, 5 min all waiting now: FCFS waits 0, 10, 12 → avg <b>7.3 min</b>; SPT (2, 5, 10) waits 0, 2, 7 → avg <b>3 min</b>.</div>
<div class="callout trap"><b>⚠️</b>Priority rules change <u>who</u> waits, not the total work. Average flow time across all customers only falls with SPT-like rules; capacity and variability still drive the overall level (the waiting-time formula).</div>`},
{h:"Customer experience of waiting",html:`
<p>How long a wait <i>feels</i> matters as much as how long it is (Maister's psychology of queues):</p>
<ul><li><b>Unoccupied</b> time feels longer than occupied time (mirrors by elevators, menus while waiting).</li>
<li><b>Uncertain</b> and <b>unexplained</b> waits feel longer → announce wait times, explain delays.</li>
<li><b>Unfair</b> waits (cutting in line) feel longer → single snake line, visible order.</li>
<li><b>Pre-process</b> waits feel longer than in-process waits → start the service early (take the order in line).</li>
<li>Valuable services are worth waiting for; queues also signal value (12-hour lines for the Queen).</li></ul>
<p>Alternatives to physical queues: <b>reservations/appointments</b>, <b>virtual queues</b> (buzzers, apps; McDonald's ordering kiosks), <b>prices</b> (surge pricing, auctions; ethically limited in healthcare).</p>`}],
checks:[
{id:"wa10",q:"Which priority rule minimizes the average waiting time when several jobs wait?",opts:["FCFS","Shortest processing time first (SPT)","Longest processing time first","Random"],a:1,why:"Short jobs first means fewer people wait behind long jobs."},
{id:"wa11",q:"A clinic announces expected wait times on a screen. This mainly…",opts:["Raises capacity","Reduces the perceived wait (uncertainty feels longer)","Reduces utilization","Lowers CVa"],a:1,why:"Uncertain, unexplained waits feel longer than known ones."},
{id:"wa12",q:"A single serpentine line feeding several tellers (vs one line per teller)…",opts:["Is unfair","Pools capacity and feels fair (no ‘wrong line’)","Raises waiting time","Has no effect"],a:1,why:"Pooling reduces waits, and FCFS across all tellers is visibly fair."},
{id:"wa13",q:"Queues in services exist mainly to…",opts:["Punish customers","Ration capacity when demand exceeds supply","Increase prices","Measure CV"],a:1,why:"They allocate scarce capacity; alternatives are reservations or prices."}],
calcs:[
{id:"wac8",q:"Three jobs wait now: 12, 3 and 6 minutes. Using SPT, what is the average waiting time (before each job starts)?",ans:4,unit:"min",steps:["Order: 3, 6, 12.","Waits: 0, 3, 3 + 6 = 9.","Average = 12/3 = <b>4 min</b>.","(FCFS order 12, 3, 6: waits 0, 12, 15 → avg 9 min.)"]}]
});

/* ---------------- LOSS: new business models ---------------- */
add("loss",{
lesson:[{h:"New business models built on pooling",html:`
<table class="t"><tr><th>Model</th><th>What is pooled</th><th>Why it wins</th></tr>
<tr><td>Ride-hailing (Uber/Lyft)</td><td>Drivers across a whole city; flexible supply via surge pricing</td><td>Volume flexibility + pooling → fewer lost riders, higher utilization</td></tr>
<tr><td>Telemedicine / virtual call centers</td><td>Doctors/agents across regions and time zones</td><td>One big pool waits less than many small ones</td></tr>
<tr><td>Cloud computing</td><td>Servers across many customers</td><td>Peaks of different customers rarely coincide</td></tr>
<tr><td>Centralized trauma / specialty centers</td><td>Specialists and equipment</td><td>Higher service level with fewer total resources (but longer travel)</td></tr></table>
<div class="callout key"><b>📌 Service level</b>Service level = probability a customer is served (1 − P<sub>m</sub>) or served within a target time. Pooling raises the service level for the same resources, or keeps it with fewer.</div>`}],
checks:[
{id:"lo6",q:"Service level in a loss system can be measured as…",opts:["Utilization","1 − probability of loss (share of customers served)","Average flow time","Labor content"],a:1,why:"The fraction of demand you actually serve."},
{id:"lo7",q:"Ride-hailing platforms beat traditional taxis mainly through…",opts:["Lower car prices","Pooling drivers city-wide and flexible capacity (surge pricing)","Longer shifts","More set-ups"],a:1,why:"Volume flexibility + pooling."},
{id:"lo8",q:"Combining two clinics (each 3 doctors) into one 6-doctor clinic with the same total demand will typically…",opts:["Double waiting","Reduce waiting and lost patients","Not change anything","Increase variability"],a:1,why:"Pooling: idle capacity in one part serves peaks in the other."}]});

/* ---------------- QUALITY: more ---------------- */
add("quality",{checks:[
{id:"qu7",q:"The Andon cord lets an assembly worker…",opts:["Order parts","Stop the line when a defect/problem appears","Speed up the line","Skip inspection"],a:1,why:"Jidoka in assembly: detect, stop, alert."},
{id:"qu8",q:"A Pareto chart is used to…",opts:["Set control limits","Rank defect causes by frequency to attack the biggest first","Compute Cp","Schedule production"],a:1,why:"A few causes typically generate most defects."},
{id:"qu9",q:"A process is ‘in control’ but has Cp = 0.7. This means…",opts:["It makes no defects","It is stable but not capable; it still produces many defects","It is out of control","Specs are too wide"],a:1,why:"Control = stable behavior; capability = fits inside spec limits."}]});

/* ---------------- INTRO: more ---------------- */
add("intro",{checks:[
{id:"in11",q:"Willingness to pay increases with all of these EXCEPT…",opts:["Shorter waiting (responsiveness)","Consistent delivery (conformance quality)","Higher labor content","More customization (variety)"],a:2,why:"Labor content is a cost-side measure; WTP comes from variety, quality, responsiveness."},
{id:"in12",q:"Hybrid human + AI radiology processes today are described in class as…",opts:["Cheap and high quality","Neither high quality nor cheap","Fully automated","On the new frontier"],a:1,why:"AI-only would be cheap but patients/payers won't pay for it yet; hybrids add cost without clear quality gains."}]});
})();
