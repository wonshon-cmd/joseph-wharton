/* Chapter summaries (for the Practice by Chapter tabs), difficulty levels,
   and extra HARD multi-step questions. Loaded before engine.js. */
(function(){const fr=OM.fr;const M=id=>OM.modules.find(m=>m.id===id);
const S={};
S.intro=`<p><b>Big idea:</b> every business must deliver what customers value (<u>quality</u>) at a low cost per unit (<u>efficiency</u>). You usually can't max out both, so firms pick a position. That's the <span class="k">cost–quality trade-off</span>.</p>
<ul>
<li><b>What customers pay for (willingness to pay):</b> variety/customization, performance quality (how good), conformance quality (consistently as promised), responsiveness (fast, convenient), and price.</li>
<li><b>Why the trade-off exists:</b> demand is random, so fast service needs spare capacity, and spare capacity = paying for idle time. <i>Call center: answering in 20 sec needs many agents who are often idle.</i></li>
<li><b>Efficiency frontier:</b> plot all firms on efficiency (x) vs quality (y). A firm is <b>Pareto dominated</b> if another firm is at least as good on every dimension and better on one. The <b>frontier = all firms nobody dominates</b>. <i>Example: P ($4, 20 s) dominates R ($4.50, 45 s), so R is off the frontier.</i></li>
<li><b>Below the frontier?</b> You have inefficiency → fix it (“don't just manage the system, change it”). <b>On the frontier?</b> You can only trade cost for quality, or <b>innovate</b> to shift the frontier (e.g., AI).</li>
<li><b>Three system inhibitors (why firms sit below the frontier):</b> <b>Waste</b> (resources that add no customer value: 75 helicopters, only 1 flying), <b>Variability</b> (demand: random arrivals; supply: different processing times, breakdowns), <b>Inflexibility</b> (can't adjust quickly: <i>volume</i> flexibility = change how much; <i>mix</i> flexibility = change what).</li>
<li><b>AI cases:</b> exam answering (huge shift), BCG consultants (+40% quality, +20% productivity), Alibaba support (small: 540→500 s), therapist notes (≈ none). Impact depends on process design.</li></ul>
<p class="sub">No formulas in this module. Exam questions: “who is on the frontier?”, “which inhibitor is this?”, “what does innovation do?”</p>`;
S.process=`<p><b>Big idea:</b> see any operation as <u>boxes</u> (resources doing work) and <u>triangles</u> (units waiting). Its output is limited by its weakest link, the <span class="k">bottleneck</span>.</p>
<ul>
<li><b>Flow unit:</b> what you follow (patient, loan, sandwich). <b>Resource:</b> who/what works on it (a worker or machine, not an activity).</li>
<li><b>Processing time p:</b> minutes one resource needs per unit. <b>Capacity = m / p</b> (m = number of parallel workers/machines). <i>3 min/unit, 1 worker → 1/3 per min = 20/hr; 2 workers → 40/hr.</i></li>
<li><b>Bottleneck</b> = lowest capacity (not necessarily the longest time when m &gt; 1). <b>Process capacity</b> = bottleneck capacity.</li>
<li><b>Flow rate = min(demand, process capacity).</b> Demand lower → demand-constrained; capacity lower → capacity-constrained.</li>
<li><b>Utilization = flow rate / capacity</b> (≤ 100%). Only the bottleneck can hit 100%, and only if capacity-constrained.</li>
<li><b>Inventory</b> = units inside (waiting + being worked on); <b>flow time</b> = time from entry to exit. Services: customers wait; manufacturing: goods wait.</li>
<li><b>Improvements:</b> only bottleneck improvements raise capacity; parallel work cuts flow time only; work cells remove idle time (4 workers × whole 6.5-min job = 36.9/hr vs 20/hr).</li></ul>
<p><b>Worked mini-example:</b> loan steps 1, 2, 3, 0.5 min → capacities 60, 30, <b>20</b>, 120/hr → bottleneck = 3-min step; demand 50/hr → flow rate 20/hr; underwriting utilization 20/120 = 16.7%.</p>`;
S.flow=`<p><b>Big idea:</b> how well you use your <u>people</u>, and what labor costs per unit (the Subway line).</p>
<ul>
<li><b>Cycle time CT = 1 / flow rate</b>: time between finished units. Subway 37/46/37 s → CT = 46 s. (If demand is the limit, CT = 1/demand.)</li>
<li><b>Idle time</b> per worker per cycle = CT × m − p. Subway: 9 + 0 + 9 = 18 s.</li>
<li><b>Labor content</b> = sum of processing times = 120 s (work only, no idle).</li>
<li><b>Average labor utilization = labor content / (CT × # workers)</b> = 120/(46 × 3) = 87%. Measures balance (can be gamed by slowing down).</li>
<li><b>Cost of direct labor = wages per hour / flow rate</b> = $45 / 78.3 = $0.575. Includes idle time. Use flow rate = min(demand, capacity)!</li>
<li><b>Empty system:</b> time for X units = sum of p + (X − 1) × CT. 20 students: 120 + 19 × 46 = 994 s.</li>
<li><b>Takt time = available time / demand</b> (the beat demand requires): 3600/160 = 22.5 s. <b>Target manpower = labor content / takt</b> = 5.33 → at least 6 (in practice 7 due to indivisible tasks).</li>
<li><b>Line balancing:</b> share work equally. Two kinds of idle time: poor balance, and over-staffing vs demand.</li></ul>`;
S.little=`<p><b>Big idea:</b> one law ties together the three key measures: <span class="k">I = R × T</span> (inventory = flow rate × flow time). Know two, get the third.</p>
<ul>
<li><b>Intuition:</b> 10 guests/hr arrive and stay 3 hr → 30 inside. Units must match (per day ↔ days).</li>
<li><b>Money as the flow unit:</b> inventory ($) = COGS/yr × time a $ sits. <b>Turns = COGS / inventory</b>; <b>days of supply = inventory/COGS × 365</b>. Use COGS, never revenue.</li>
<li><b>Per-unit inventory cost = annual holding % / turns</b> × item cost. 30%/yr and 6 turns → 5% → $3 on a $60 item.</li>
<li><b>What turns tell you:</b> how long stuff sits and its holding cost. <i>Not</i> revenue, margin or profit (Tiffany 0.66 turns, 61% margin; Kroger 13.4 turns, 23% margin). Compare only competitors.</li>
<li><b>People as the flow unit:</b> turnover = leavers/yr ÷ employees; tenure at departure = 1/turnover; average tenure = ½ × tenure at departure. Costco: 9 yrs avg → 18 at departure → 160,000/18 = 8,889 hires/yr.</li></ul>`;
S.multi=`<p><b>Big idea:</b> when units take different routes, drop out, or need set-ups, use <span class="k">implied utilization</span> to find the bottleneck.</p>
<ul>
<li><b>Implied utilization = demand at resource / capacity</b> (can exceed 100%). Bottleneck = <b>highest</b> implied utilization. Lowest capacity can be “innocent” if little work reaches it.</li>
<li><b>Demand at a resource</b> = total demand × the mix % of every type that visits it. Prof's example: Dept 1 gets 3 + 11 = 14/hr vs capacity 12 → 117% → bottleneck.</li>
<li><b>Minutes-of-work method:</b> Σ(demand × minutes) ÷ (m × 60). Same answer, handles different times per type and rework.</li>
<li><b>Max flow rate (same mix) = total demand / highest implied utilization.</b> 18/1.167 = 15.4/hr.</li>
<li><b>Attrition:</b> yield = good out / in; process yield = y₁ × y₂ × …; units to start = Q / yield. Upstream steps see all units. Capital One: 26.4% booked → 2,650 apps for 700 loans.</li>
<li><b>Set-ups &amp; variety:</b> capacity with batch B = B/(S + B·p); batch needed for rate R: B = R·S/(1 − R·p). Bigger batches = more capacity but more inventory; more variants = more set-ups.</li></ul>`;
S.kpi=`<p><b>Big idea:</b> link operations to money with a <span class="k">KPI tree</span>: ROIC = return / invested capital, broken down until you reach levers an ops manager controls.</p>
<ul>
<li><b>Revenue = flow rate × price.</b> If capacity-constrained, more bottleneck capacity = more revenue; if demand-constrained, it adds nothing.</li>
<li><b>Inventory = working capital</b> → higher turns lower invested capital and holding cost.</li>
<li><b>Labor cost per unit = wages / flow rate</b> → idle time costs money.</li>
<li><b>Airline tree:</b> revenue = ASM × load factor × yield; cost = ASM × cost per ASM; ASM grows with aircraft hours flown (OEE).</li>
<li><b>Value driver:</b> the lever with the biggest effect on profit; find it with a sensitivity check (+1% each driver). Operating leverage: when fixed costs dominate, +10% volume can mean +30–60% profit.</li>
<li><b>Good metrics</b> connect to the customer and the bottleneck and are hard to game (Capital One counted only approved apps; per-approval pay → moral hazard).</li></ul>
<p class="sub">📗 Built from the textbook; will be aligned with the KPI slides when uploaded.</p>`;
S.lean=`<p><b>Big idea:</b> eliminate waste, so that every minute of resources and of customers adds value; run flow to the rhythm of demand (Toyota Production System).</p>
<ul>
<li><b>History:</b> Benz (craft) → Taylor (scientific management, time studies, piece rates; saw workers as “gorillas”) → Ford (assembly line, Model T $950 → $290) → Toyota/Ohno (TPS; MIT: 18 vs 40 hours/car, 45 vs 130 defects/100 cars).</li>
<li><b>Time of a resource:</b> value-add / incidental (necessary, no value) / waste. <b>OEE = value-add time / paid time.</b> AA planes fly ~8.8 of 24 h; CHOP ICU beds 82% critical care.</li>
<li><b>Time of a flow unit:</b> <b>%VAT = value-add time / flow time.</b> Radiology visit: 20 of 135 min ≈ 15%.</li>
<li><b>Waste (TIM WOOD + intellect):</b> transport, inventory, motion, waiting, over-production, over-processing, defects (+ not using workers' ideas). Prof: list not needed for the exam.</li>
<li><b>TPS house:</b> roof = zero waste/defects/inventory/set-ups; pillar 1 = JIT (takt, pull, kanban, one-piece flow, heijunka); pillar 2 = built-in quality (jidoka, Andon, poka-yoke); base = flexibility, standard work, kaizen.</li>
<li><b>Push vs pull:</b> push (20 → 10 → 15/hr) piles inventory before the bottleneck; pull/kanban caps WIP by the number of cards; JIT is efficient but fragile.</li></ul>`;
S.wait=`<p><b>Big idea:</b> lines form for two reasons: (1) demand &gt; capacity for a while (<u>transient queue</u>), (2) random arrivals/service even when capacity &gt; demand on average (<u>variability</u>).</p>
<ul>
<li><b>Build-up diagram:</b> slope = supply − demand; positive = inventory, negative = backlog. Convert customers × units each into units/hr. Last customer served = start + total units / production rate.</li>
<li><b>Transient queue (triangle):</b> longest queue = (in − out) × duration; total wait = ½ × total time × longest queue; average = total / customers. Brewery: 60 longest, 30 min average.</li>
<li><b>Variability:</b> CV = st.dev / mean. Random (Poisson) arrivals → CVa = 1. Seasonality (predictable) ≠ variability (random): analyze each time slot separately.</li>
<li><b>Waiting time formula:</b> u = p/(a·m); <b>Tq = (p/m) × u^(√(2(m+1))−1)/(1−u) × (CVa² + CVp²)/2</b>; T = Tq + p; Iq = Tq/a.</li>
<li><b>Utilization explodes waits:</b> u/(1−u) = 4 at 80%, 9 at 90%, 19 at 95%. No universal right utilization; decide by the cost of delay.</li>
<li><b>Priority rules:</b> FCFS (fair) vs SPT (shortest first, minimizes average wait) vs triage. <b>Customer experience:</b> unoccupied, uncertain, unexplained, unfair waits feel longer.</li></ul>`;
S.loss=`<p><b>Big idea:</b> when there's no waiting room, customers who find all servers busy are <span class="k">lost</span>. Variability causes losses even at moderate utilization.</p>
<ul>
<li><b>Offered load r = p / a</b> (average busy servers if nobody were lost).</li>
<li><b>Erlang loss: P<sub>m</sub>(r) = (r^m/m!) / Σ r^k/k!</b> = probability all m servers are busy = share of customers lost.</li>
<li><b>Flow rate = (1 − P<sub>m</sub>)/a</b>; lost = P<sub>m</sub>/a; utilization = flow rate × p / m.</li>
<li><b>Service level</b> = share served (1 − P<sub>m</sub>). High service levels need capacity far above the average load (r = 2 needs 5 servers for ≤ 5% loss).</li>
<li><b>Pooling</b> combines resources: two 3-bay centers (21% loss each) → one 6-bay center (11.7%). Needs flexible, cross-trained resources.</li>
<li><b>New business models</b> exploit pooling + flexible capacity: ride-hailing, cloud, telemedicine.</li></ul>
<p class="sub">📗 Built from the textbook; will be aligned with the LOSS slides when uploaded.</p>`;
S.quality=`<p><b>Big idea:</b> defects come from <u>variation</u>; shrink it, catch problems at the source, make mistakes impossible.</p>
<ul>
<li><b>Spec limits</b> (LSL, USL) = what the customer accepts. <b>Cp = (USL − LSL) / 6σ.</b> Cp = 1 → limits at ±3σ (0.27% defects); <b>six sigma</b> = Cp 2 (±6σ).</li>
<li><b>Defect probability</b> = both tails: z = (limit − mean)/σ. Off-center means raise defects fast (mean 10.1 in 9.7–10.3, σ 0.1 → 2.3%).</li>
<li><b>Control charts:</b> limits at mean ± 3σ/√n; outside = assignable cause (investigate); inside = common cause (leave it alone). Control limits ≠ spec limits.</li>
<li><b>Jidoka:</b> detect–stop–alert (machines stop; Andon cord). <b>Poka-yoke:</b> fool-proofing (plug fits one way).</li>
<li><b>Where to inspect:</b> early and before the bottleneck, so you don't waste bottleneck time on bad units. Rework adds load.</li>
<li><b>Improvement tools:</b> Pareto chart, fishbone (Ishikawa), 5 whys, kaizen, quartile analysis (Capital One 20 vs 61 min).</li></ul>
<p class="sub">📗 Built from the textbook; will be aligned with the QUALITY slides when uploaded.</p>`;
Object.keys(S).forEach(k=>{M(k).summary=S[k];});

/* difficulty: checks default 🟢 easy, calcs default 🟡 medium */
const lv={medium:"pr6 pr8 pr9 pr11 fl6 fl7 fl8 fl10 li3 li4 li6 mu2 mu6 mu7 mu9 mu11 kp3 kp4 kp6 kp7 le2 le7 le11 wa3 wa5 wa6 wa7 wa9 wa12 lo3 lo4 lo8 qu5 qu9 in7 in10 in12",
easy:"prc1 prc2 prc3 prc7 prc9 prc10 flc6 flc7 lic1 lic2 lic5 lic7 muc5 loc1 quc1 wac5 kpc5 lec3",
hard:"prc8 flc8 lic4 muc6 wac2 wac4 wac7 kpc4 loc4"};
OM.levels={};Object.keys(lv).forEach(k=>lv[k].split(" ").forEach(id=>OM.levels[id]=k));

/* extra HARD questions */
const H=(id,o)=>{const m=M(id);if(o.checks)m.checks=m.checks.concat(o.checks.map(q=>Object.assign({lvl:"hard"},q)));if(o.calcs)m.calcs=(m.calcs||[]).concat(o.calcs.map(q=>Object.assign({lvl:"hard"},q)));};
H("intro",{checks:[
{id:"inh1",q:"Your call center: $3.00/call, 40 s wait. Competitor C: $3.20, 45 s. C adopts an AI tool and moves to $2.80, 35 s. What is now true?",opts:["Nothing changes for you","You are now Pareto dominated by C → below the (new) frontier","C is now dominated by you","You moved along the frontier"],a:1,why:"C is now better on both cost and wait. Innovation shifted the frontier; standing still made you inefficient relative to it."},
{id:"inh2",q:"A frontier firm cuts staff 20%; cost per call falls but average wait rises from 20 to 60 s. This is best described as…",opts:["Eliminating waste","Moving along the frontier (a trade-off)","Shifting the frontier","Becoming Pareto dominated"],a:1,why:"Cheaper but slower = trading one dimension for the other. Waste elimination would improve one without hurting the other."},
{id:"inh3",q:"Which statements are correct? (select all)",multi:true,opts:["A firm below the frontier can improve both cost and quality","Two firms with different strategies can both be on the frontier","Being on the frontier means you are the cheapest firm","Variability only hurts if the operation is inflexible"],a:[0,1,3],why:"Frontier firms are undominated, not necessarily cheapest. Flexibility is the ability to react to variability."}]});
H("process",{calcs:[
{id:"prh1",q:"A: 6 min (2 workers) → B: 4 min (1) → C: 15 min (3) → D: 3 min (1). Demand 14/hr. Utilization of B?",ans:80,unit:"%",hint:"Find process capacity first; compare with demand.",steps:["Capacities: A 2/6×60 = 20, B 60/4 = 15, C 3/15×60 = 12, D 60/3 = 20 per hr.","Process capacity = 12 (C) < demand 14 → flow rate = 12.","Utilization B = 12/15 = <b>80%</b>."]},
{id:"prh2",q:"Same process. You can EITHER add a 4th worker at C OR cut B's time to 3 min. Best resulting process capacity (per hr)?",ans:15,unit:"units/hr",steps:["Add at C: 4/15×60 = 16 → capacities 20, 15, 16, 20 → 15/hr.","Cut B: B = 20 → capacities 20, 20, 12, 20 → still 12/hr.","Best = <b>15/hr</b> (adding at C; B becomes the new bottleneck)."],why:"Improving a non-bottleneck (B) does nothing while C limits; fixing C helps until B limits."},
{id:"prh3",q:"Steps 2, 5, 3, 4 min with one worker each (line). If the same 4 workers each do the whole job (work cells), capacity (per hr)?",ans:17.14,unit:"units/hr",steps:["Line: bottleneck 5 min → 12/hr.","Work cell: one resource, p = 14 min, m = 4 → 4/14×60 = <b>17.14/hr</b>."],why:"No idle time from imbalance: every worker is busy 100%."}]});
H("flow",{calcs:[
{id:"flh1",q:"Line 40, 55, 35, 50 sec (1 worker each), demand 50/hr, wage $18/hr. Cost of direct labor per unit?",ans:1.44,unit:"$/unit",tol:0.011,steps:["Capacity = 3600/55 = 65.5/hr > 50 → flow rate = 50.","Wages = 4 × $18 = $72/hr.","$72/50 = <b>$1.44</b>."]},
{id:"flh2",q:"Same line (40, 55, 35, 50 s), demand 50/hr. Average labor utilization?",ans:62.5,unit:"%",steps:["CT = 3600/50 = 72 s (demand-constrained).","Labor content = 180 s.","180/(72 × 4) = <b>62.5%</b>."]},
{id:"flh3",q:"Same line, unlimited demand. Starting empty, time to finish 30 units (sec)?",ans:1775,unit:"sec",steps:["Time through = 180 s; CT = 55 s.","180 + 29 × 55 = <b>1,775 s</b>."]},
{id:"flh4",q:"Same work (labor content 180 s); demand rises to 100/hr. Target manpower?",ans:5,unit:"workers",steps:["Takt = 3600/100 = 36 s.","180/36 = <b>5 workers</b> (minimum)."]}]});
H("little",{calcs:[
{id:"lih1",q:"Retailer A: COGS $800M, inventory $200M. Retailer B: COGS $1,200M, inventory $150M. Holding cost 25%/yr. How much lower is B's per-unit inventory cost than A's on a $40 item ($)?",ans:1.25,unit:"$",steps:["A: 4 turns → 6.25% → $2.50.","B: 8 turns → 3.125% → $1.25.","Difference = <b>$1.25</b>."]},
{id:"lih2",q:"A 30-bed ward is always full; average stay is 4 days. How many patients are admitted per year?",ans:2737.5,unit:"patients",tol:5,steps:["R = I/T = 30/4 = 7.5 per day.","× 365 = <b>2,737.5</b>."]},
{id:"lih3",q:"A firm with 4,000 employees cuts turnover from 25% to 20%. How many fewer hires per year?",ans:200,unit:"hires",steps:["Before: 0.25 × 4,000 = 1,000 hires/yr.","After: 0.20 × 4,000 = 800.","<b>200 fewer</b>."]}]});
H("multi",{calcs:[
{id:"muh1",q:"Type A 10/hr and type B 5/hr enter Screening (2 staff, 6 min each, everyone). 50% of A and 100% of B pass to the Expert (3 staff, 20 min each). Implied utilization of the Expert?",ans:111.11,unit:"%",steps:["Demand at Expert = 10 × 0.5 + 5 = 10/hr.","Capacity = 3/20 × 60 = 9/hr.","10/9 = <b>111.1%</b> (Screening: 15/20 = 75%)."]},
{id:"muh2",q:"Same process. Maximum total input rate (A + B, same mix) the process can handle?",ans:13.5,unit:"per hr",steps:["Highest implied utilization = 1.111 (Expert).","15 / 1.111 = <b>13.5/hr</b>."]},
{id:"muh3",q:"Two products share a machine; each needs a 40-min set-up per cycle. Each cycle makes 100 of each; p = 0.5 min/unit. Capacity in units per hour?",ans:66.67,unit:"units/hr",steps:["Cycle = 2 × 40 + 200 × 0.5 = 180 min for 200 units.","200/180 × 60 = <b>66.7/hr</b>."],why:"Variety: each extra product adds a set-up per cycle."}]});
H("kpi",{calcs:[
{id:"kph1",q:"Airline: 50 planes × 180 seats × 2,400 miles/day; load factor 82%; yield $0.14/RPM; cost $0.11/ASM. Profit per day ($)?",ans:103680,unit:"$",tol:100,steps:["ASM = 50 × 180 × 2,400 = 21.6M.","Revenue = 21.6M × 0.82 × 0.14 = $2,479,680.","Cost = 21.6M × 0.11 = $2,376,000.","Profit = <b>$103,680</b>."]}],
checks:[{id:"kph2",q:"Same airline. Which adds more profit per day: load factor +2 points (82% → 84%), or cost per ASM −1%?",opts:["Load factor +2 points (+$60,480)","Cost −1% (+$23,760)","They're equal","Neither changes profit"],a:0,why:"LF: 21.6M × 0.02 × $0.14 = $60,480. Cost: 21.6M × $0.0011 = $23,760. Load factor is the stronger value driver here."}]});
H("lean",{calcs:[
{id:"leh1",q:"A 480-min paid shift: 30 min breaks, 45 min changeovers, 25 min breakdowns. Ideal time 1 min/unit; 320 units made, 16 defective. OEE?",ans:63.33,unit:"%",steps:["Value-add time = good units × ideal time = 304 × 1 = 304 min.","OEE = 304/480 = <b>63.3%</b>.","(Losses: breaks, changeovers, breakdowns, speed, defects.)"]},
{id:"leh2",q:"Push system: stations with capacities 30, 12, 20 units/hr run 8 hours. How much WIP piles up in front of station 2?",ans:144,unit:"units",steps:["Station 1 pushes 30/hr; station 2 takes 12/hr.","(30 − 12) × 8 = <b>144 units</b>."],why:"A pull system would hold station 1 to 12/hr: same output, no pile."},
{id:"leh3",q:"A loan needs 2.5 hours of work; it takes 15 calendar days from application to decision. %VAT?",ans:0.694,unit:"%",tol:0.02,steps:["Flow time = 15 × 24 = 360 h.","2.5/360 = <b>0.69%</b>."]}]});
H("wait",{calcs:[
{id:"wah1",q:"4 servers; a = 1.5 min (Poisson), p = 5 min, CVp = 0.6. Tq (min)? (√10 − 1 ≈ 2.162)",ans:3.44,unit:"min",tol:0.06,steps:["u = 5/(1.5 × 4) = 0.833.","p/m = 1.25.","0.833^2.162 = 0.674 → /0.167 = 4.05.","Variability = (1 + 0.36)/2 = 0.68.","Tq = 1.25 × 4.05 × 0.68 = <b>3.44 min</b>."]},
{id:"wah2",q:"Same system. Average number of customers waiting (Iq)?",ans:2.29,unit:"customers",tol:0.05,steps:["Iq = Tq/a = 3.44/1.5 = <b>2.29</b>."]},
{id:"wah3",q:"100 customers/hr arrive for 2 hours, then 40/hr for 3 more hours; capacity 70/hr. How many hours after the start is the queue gone?",ans:4,unit:"hours",steps:["First 2 h: +30/hr → 60 waiting.","Then 40 in, 70 out: −30/hr → 60/30 = 2 h.","Gone after <b>4 hours</b>."]}]});
H("loss",{calcs:[
{id:"loh1",q:"Offered load r = 3. Minimum number of servers so that at most 5% of customers are lost?",ans:7,unit:"servers",tol:0.01,steps:["P5(3) = 11.0%, P6(3) = 5.2% (still > 5%), P7(3) = 2.2%.","→ <b>7 servers</b>."]},
{id:"loh2",q:"Two separate units, each a = 20 min, p = 30 min, m = 2 (no waiting). Pool them into one unit with m = 4. Lost customers per hour fall by how much?",ans:0.625,unit:"per hr",tol:0.02,steps:["Separate: r = 1.5, P2 = 31.0%; lost = 2 × 3/hr × 0.310 = 1.862/hr.","Pooled: a = 10 min, r = 3, P4 = 20.6%; lost = 6 × 0.206 = 1.237/hr.","Reduction = <b>0.625/hr</b>."]},
{id:"loh3",q:"Pooled unit above (6 arrivals/hr, P4 = 20.6%, p = 30 min, m = 4). Utilization?",ans:59.5,unit:"%",tol:0.5,steps:["Served = 6 × (1 − 0.206) = 4.76/hr.","× 0.5 h / 4 = <b>59.5%</b>."],why:"Even at under 60% utilization, 1 in 5 customers is lost: variability."}]});
H("quality",{calcs:[
{id:"quh1",q:"Spec 9.7–10.3 mm, σ = 0.1 mm, but the mean drifts to 10.1. Percentage defective?",ans:2.28,unit:"%",tol:0.05,steps:["Upper: z = (10.3 − 10.1)/0.1 = 2 → 2.28%.","Lower: z = −4 → 0.003%.","Total ≈ <b>2.28%</b> (vs 0.27% when centered)."]},
{id:"quh2",q:"Spec 50 ± 0.6, centered. What σ gives a defect rate of 0.27%?",ans:0.2,unit:"",tol:0.005,steps:["0.27% two-sided ⇔ limits at ±3σ.","3σ = 0.6 → σ = <b>0.2</b>."]},
{id:"quh3",q:"Three steps with yields 98%, 95%, 99%. Good units out of 1,000 started?",ans:921.69,unit:"units",tol:1,steps:["1,000 × 0.98 × 0.95 × 0.99 = <b>921.7</b>."]}]});
})();
