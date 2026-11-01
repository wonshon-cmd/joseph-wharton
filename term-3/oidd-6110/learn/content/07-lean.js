(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
OM.modules.push({
id:"lean",n:7,code:"LEAN",icon:"🚗",color:"#1e8449",title:"Lean Operations, Waste & the Toyota Production System",
status:"slides + lecture",
blurb:"History (Taylor, Ford, Toyota), waste of resource time (OEE) vs. waste of the flow unit's time (%VAT), push vs pull, kanban, JIT, heijunka.",
intro:"Why Toyota beat Detroit, and how the same ideas fix hospitals and banks. Two measures (OEE, %VAT), a lot of vocabulary, and the push vs. pull logic.",
objectives:["Understand the waste of capacity at a resource and measure it using <b>OEE</b>","Understand the waste of a flow unit's time and measure it using <b>%VAT</b>","Know the origins of lean and the architecture of the <b>Toyota Production System</b>","Understand ways to control inventory: <b>pull, kanban, JIT, single-unit flow, heijunka</b>"],
lesson:[
{h:"A 100-year history in 4 people",html:`
<table class="t"><tr><th>Who</th><th>Idea</th><th>Lesson</th></tr>
<tr><td><b>Carl Benz</b> (1886)</td><td>First car, craft-built one at a time</td><td>No notion of cycle time; every car custom</td></tr>
<tr><td><b>Frederick W. Taylor</b> (Philadelphia, worked for Joseph Wharton)</td><td><i>Scientific management</i>: measure work, run experiments (best shovel load = 21 lb), time studies, piece rates to fight “soldiering” (deliberately working slowly)</td><td>👍 Foundation of modern OM. 👎 Saw workers as “gorillas/oxen” → wasted their intellect. Hawthorne studies (Mayo): workers are social beings</td></tr>
<tr><td><b>Henry Ford</b> (1910s)</td><td>Moving assembly line, Model T: build time 12 h → 2.5 h; cost $950 (1904) → $360 (1916) → $290 (1926)</td><td>Economies of scale, unskilled labor, 10 million Model Ts by 1924</td></tr>
<tr><td><b>Kiichiro Toyoda &amp; Taiichi Ohno</b> (Toyota, post-1945)</td><td>Toyota Production System (TPS): small, poor market → can't copy Detroit's mass production → eliminate waste instead</td><td>MIT study (Womack): <b>18 vs 40 assembly hours/car, 45 vs 130 defects/100 cars, 2 hours vs 2 weeks of inventory</b> → coined “lean”</td></tr></table>
<div class="callout prof"><b>🎓 Matsushita's critique (1981)</b>“Your companies are based on Taylor's principles… management is the art of smoothly transferring the executives' ideas to the workers' hands.” → the <b>8th waste: waste of intellect</b>. Modern lean = OM + organizational behavior (kaizen, worker involvement).</div>`},
{h:"The Toyota Production System “house”",html:`
<table class="t"><tr><th colspan="2" style="text-align:center">🏠 ROOF: zero non-value-added activities (muda): zero defects, zero breakdowns, zero inventory, zero set-up</th></tr>
<tr><td style="width:50%"><b>Pillar 1: Just-in-time (flow synchronized with demand)</b><br>• One-unit-at-a-time flow; mixed model production (<i>heijunka</i>); piece-by-piece transfer (<i>ikko-nagashi</i>)<br>• Match production to <b>takt time</b><br>• <b>Pull</b> instead of push: supermarket / <b>kanban</b>, make-to-order</td>
<td><b>Pillar 2: Quality methods (built-in quality)</b><br>• Fool-proofing (<i>poka-yoke</i>) and visual feedback<br>• Detect–stop–alert (<i>jidoka</i>): machines stop on defects; <b>Andon cord</b> in assembly<br>• Build-in quality (<i>tsukurikomi</i>)</td></tr>
<tr><td colspan="2"><b>Foundation:</b> flexibility (adjust capacity to takt, multi-task assignment <i>takotei-mochi</i>, cross-training), standardized work, worker involvement (quality circles/<b>kaizen</b>, fishbone diagrams), reduce variability (SOPs, quartile analysis), <u>reduce inventory to expose defects</u></td></tr></table>
<div class="callout analogy"><b>🍞 “Reduce inventory to expose defects”</b>Inventory is like water in a river hiding rocks (problems). Lower the water level and the rocks become visible, so you have to fix them.</div>`},
{h:"Waste of a RESOURCE's time → OEE",html:`
<p>Classify how a worker or machine spends time:</p>
<table class="t"><tr><th>Category</th><th>Definition</th><th>Examples</th></tr>
<tr><td><span class="grn">Value-add time</span></td><td>Work that directly increases value in the customer's eyes</td><td>Assembling parts, the actual scan</td></tr>
<tr><td><span class="gold" style="color:#b7791f;font-weight:800">Incidental (non-value-add but necessary)</span></td><td>Doesn't add value but needed to keep operating</td><td>Receiving/unpacking parts, pressing a button, cleaning a bed</td></tr>
<tr><td><span class="red">Waste</span></td><td>Adds no value and isn't necessary</td><td>Idle time, meaningless transport, stockpiling, fixing defects</td></tr></table>
<div class="formula"><span class="eq">Overall Equipment Effectiveness (OEE) = ${fr("Value-add time","Total paid (available) time")}</span><div class="why">💡 A measure of the productivity of a <b>resource</b>: how much of the time you pay for creates value.</div></div>
${V("waterfall",{bars:[{l:"Total",v:100},{l:"Empty /|unassigned",v:8,type:"loss"},{l:"Non-value|added",v:8,type:"loss"},{l:"Necessary|logistics",v:2,type:"loss"},{l:"Critical|care",v:82,type:"end"}],unit:"%",cap:"CHOP ICU bed study (Fieldston, Terwiesch et al. 2012): only 82% of bed time delivered critical care. A waterfall chart steps from paid time down to value-add time."})}
<div class="callout case"><b>✈️ American Airlines OEE (Dallas hub)</b>24 h/day → ~18 h airport open → minus boarding, taxi, deplaning, cabin prep → ~13 h potential air time → minus other idle → <b>≈ 8.8 h airborne</b>. OEE ≈ 8.8/24 ≈ 37%.</div>`},
{h:"Waste of a FLOW UNIT's time → %VAT",html:`
<p>The professor's own radiology visit: arrived 9:45, check-in, buzzer, wait, gown, wait, imaging room 11:00, wait for the doctor, procedure 11:20–11:40, wait for image check, home ~12:00.</p>
${V("bars",{bars:[{l:"Waiting|& admin",v:115,c:"#c0392b"},{l:"Procedure|(value add)",v:20,c:"#1e8449"}],yl:"minutes",cap:"≈ 20 minutes of value in ≈ 2h15 of flow time."})}
<div class="formula"><span class="eq">Flow time efficiency (%VAT) = ${fr("Total value-add time of a unit","Flow time")}</span><div class="why">💡 A measure of the productivity of a <b>flow unit</b> (customer's time). Radiology: 20/135 ≈ 15%. Capital One: ~2–3 hours of work vs. 2–3 weeks of flow time → %VAT &lt; 2%.</div></div>
<div class="callout key"><b>📌 Two perspectives, two measures</b><b>OEE</b> → resource's perspective (is the expensive machine/doctor busy with value?).<br><b>%VAT</b> → flow unit's perspective (is the patient's time well used?).<br>A huge waiting room maximizes the doctor's OEE <u>at the expense of</u> the patient's %VAT. Lean balances both.</div>
<p>Ohno: “All we are doing is looking at the time line, from the moment the customer gives us an order to the point when we collect the cash.” Also: “Moving is not working.”</p>`},
{h:"The 7 (+1) sources of waste: TIM WOOD",html:`
<table class="t"><tr><th>Waste</th><th>Factory</th><th>Hospital</th></tr>
<tr><td><b>T</b>ransporting</td><td>Moving parts between departments</td><td>Patient transporters</td></tr>
<tr><td><b>I</b>nventory</td><td>Raw material, WIP, finished goods</td><td>Patients waiting in the ER</td></tr>
<tr><td><b>M</b>otion</td><td>Worker walking between machines</td><td>Searching for syringes</td></tr>
<tr><td><b>W</b>aiting (idle time)</td><td>Idle worker/machine</td><td>Empty OR, doctor waiting for patient</td></tr>
<tr><td><b>O</b>ver-production</td><td>Making more / earlier than demanded</td><td>Unnecessary procedures (fee-for-service)</td></tr>
<tr><td><b>O</b>ver-processing</td><td>More work than the customer values</td><td>Extra tests not needed</td></tr>
<tr><td><b>D</b>efects</td><td>Rework, scrap</td><td>Readmissions</td></tr>
<tr><td>+ Intellect</td><td>Only engineers improve the process</td><td>Nurses not allowed to improve</td></tr></table>
<div class="callout prof"><b>🎓 Exam note</b>The professor said explicitly that memorizing the TIM WOOD list is <b>not</b> required for the final. Understand the idea of waste; don't burn cheat-sheet space on the list.</div>`},
{h:"Push vs pull, kanban, JIT",html:`
${V("flow",{tu:"min",ru:"hr",steps:[{name:"Station 1",p:3,m:1},{name:"Station 2",p:6,m:1},{name:"Station 3",p:4,m:1}],cap:"Capacities 20, 10, 15/hr (the slide's example). In a PUSH system, Station 1 keeps working at 20/hr → inventory piles up in front of Station 2 at 10 units/hr, forever."})}
<p><b>Push</b>: each station works as fast as it can and pushes output downstream. <b>Pull</b>: a station only works when downstream (ultimately demand) <u>authorizes</u> it.</p>
<div class="callout why"><b>💡 Why is idle time better than inventory here?</b>Station 1's extra 10 units/hr can't get through the bottleneck anyway. They only add inventory (holding cost, longer flow time, hidden defects) without adding output. Better: let Station 1 be idle and pull at the bottleneck rate (or takt).</div>
<ul><li><b>Kanban</b> (“sign board”): cards on containers; a card returning upstream authorizes producing one more container. <u>Number of cards caps the WIP.</u> Remove cards over time to expose problems.</li>
<li><b>Synchronized production / JIT</b>: extreme pull; e.g., car seats built to order and delivered to the line within hours, in sequence. Efficient but fragile (strikes, weather, chip shortage).</li>
<li><b>Single-unit flow</b> vs batching: the two TAs grading exams (one question across all exams vs. one whole exam at a time). One-at-a-time has less WIP and the first finished exam comes out much sooner.</li>
<li><b>Heijunka (mixed-model production)</b>: instead of sedans for half a month then wagons, alternate them. Large batches cause inventory, uneven flow, and overburden (<i>muri</i>). Requires quick changeovers (low setup times).</li></ul>`}
],
formulas:[
{name:"Overall Equipment Effectiveness",f:`OEE = ${fr("Value-add time","Total paid time")}`,why:"Resource perspective."},
{name:"Flow time efficiency",f:`%VAT = ${fr("Value-add time of a unit","Flow time")}`,why:"Flow unit perspective."}
],
worked:[
{title:"OEE of a machine (waterfall step by step)",setup:"A packaging machine is available 16 hours per day. Changeovers take 2 h, breakdowns 1.5 h, waiting for material 1 h; when it runs it is at 90% of its ideal speed, and 5% of the output is defective.",steps:[
{ask:"Running time?",ans:"16 − 2 − 1.5 − 1 = <b>11.5 h</b>."},
{ask:"Effective time after speed loss?",ans:"11.5 × 0.9 = <b>10.35 h</b> at ideal speed."},
{ask:"Value-add time after defects?",ans:"10.35 × 0.95 = <b>9.83 h</b>."},
{ask:"OEE?",ans:"9.83 / 16 = <b>61.4%</b>.",why:"OEE multiplies availability × performance × quality (11.5/16 × 0.9 × 0.95), which is the same as value-add time ÷ paid time."}]},
{title:"%VAT of a mortgage",setup:"A mortgage takes 30 days from application to closing. The actual work (interview 30 min, underwriting 60 min, appraisal 90 min, closing 60 min) adds up to 4 hours.",steps:[
{ask:"Put both in the same unit.",ans:"30 days = 720 hours (calendar time; the customer waits around the clock)."},
{ask:"%VAT?",ans:"4/720 = <b>0.56%</b>.",why:"Typical for paperwork processes. The waste is waiting, not working."}]}
],
checks:[
{id:"le1",q:"OEE measures waste from the perspective of…",opts:["The flow unit (customer)","The resource (machine/worker)","The shareholder","The supplier"],a:1,why:"OEE = value-add time / paid time of a resource. %VAT is the flow unit's view."},
{id:"le2",q:"In a push system with stations of capacity 20, 10, 15 units/hr, inventory builds up…",opts:["Before station 1","Between stations 1 and 2","Between stations 2 and 3","After station 3"],a:1,why:"Station 1 pushes 20/hr into the 10/hr bottleneck; 10 units/hr accumulate in front of station 2."},
{id:"le3",q:"A kanban system controls inventory by…",opts:["Forecasting demand","Limiting the number of cards (authorizations) in circulation","Running every station at full speed","Large batches"],a:1,why:"WIP can't exceed what the cards allow; production happens only when demand pulls a card."},
{id:"le4",q:"Jidoka means…",opts:["Mixed model production","Detect–stop–alert when a defect occurs (e.g., Andon cord)","Kanban cards","Continuous improvement circles"],a:1,why:"Jidoka = automation with a human touch: stop the line at a defect so it can't travel downstream."},
{id:"le5",q:"Heijunka (mixed-model production) requires…",opts:["Large batches","Short changeover (setup) times","More inventory","Push scheduling"],a:1,why:"Alternating products often only works if switching between them is quick and cheap."},
{id:"le6",q:"Which is incidental work (not value-add, but necessary)?",opts:["Assembling a part","Unpacking incoming material","Re-doing a defective weld","Walking to look for a tool"],a:1,why:"Unpacking is needed to operate but adds no value. Rework and searching are pure waste."},
{id:"le7",q:"“Reduce inventory to expose defects” works because…",opts:["Inventory is expensive","Buffers hide problems; with less buffer, problems stop the flow and must be fixed","Defects live in the warehouse","Customers prefer less stock"],a:1,why:"Like lowering the water to see the rocks."},
{id:"le8",q:"Taylor's ‘soldiering’ refers to…",opts:["Military-style management","Workers deliberately working slowly","Assembly-line work","Quality circles"],a:1,why:"Natural soldiering (people don't over-exert) and systematic soldiering (collectively restricting output to protect rates)."},
{id:"le9",q:"The MIT benchmarking study found Japanese (lean) plants vs. US plants needed about…",opts:["Same hours per car","18 vs 40 assembly hours per car","40 vs 18 hours","2 vs 2 weeks of inventory"],a:1,why:"18 vs 40 hrs/car, 45 vs 130 defects per 100 cars, 2 hours vs 2 weeks of inventory."}
],
calcs:[
{id:"lec1",q:"An MRI machine is available 20 h/day. It scans 18 patients a day, 40 minutes of scanning each. OEE?",ans:60,unit:"%",steps:["Value-add time = 18 × 40 = 720 min = 12 h.","OEE = 12/20 = <b>60%</b>."]},
{id:"lec2",q:"A patient's visit: 160 min total in the clinic; consultation 12 min, X-ray 8 min, the rest waiting/admin. %VAT?",ans:12.5,unit:"%",steps:["Value-add = 12 + 8 = 20 min.","20/160 = <b>12.5%</b>."]},
{id:"lec3",q:"A plane is ‘available’ 24 h/day and flies 9 h/day. OEE of the plane?",ans:37.5,unit:"%",steps:["9/24 = <b>37.5%</b>."]}
],
gens:[],
cases:`<div class="callout case"><b>📂 Capital One = a lean (mini) transformation</b>Map the customer journey, find waste (rework from incomplete files, underwriters doing clerical work, too many call attempts, pushing apps that will be rejected), find the bottleneck, analyze how the bottleneck spends its time, compute the benefit. <a href="#case/capone">See the case →</a></div>
<div class="callout case"><b>📂 Call center (Picadilly)</b>Build an OEE chart: of the time the bank pays an agent, what % is a customer actually being helped? <a href="#case/callcenter">See the case →</a></div>`,
traps:["Confusing OEE (resource) with %VAT (flow unit).","Thinking a busy upstream worker in a push system is ‘productive’. Output past the bottleneck is what counts.","Using paid working hours for %VAT when the customer waits calendar time (check what the question defines as flow time)."],
prof:["McKinsey's lean framework: operating system (flows, bottlenecks), management infrastructure (KPIs, incentives), mindsets (kaizen, autonomy).","Idle time refers to resources, not inventory. A huge waiting room maximizes the doctor's efficiency at the patient's expense: the lean trade-off."]
});
})();
