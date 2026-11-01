(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
OM.modules.push({
id:"kpi",n:6,code:"KPI",icon:"📊",color:"#011f5b",title:"Performance Measurement, Value Drivers & the Ops–Finance Link",
status:"📗 textbook-based · slides not uploaded yet",
blurb:"KPI trees: how operational levers (utilization, flow rate, labor productivity, inventory turns) drive profit and return on invested capital.",
intro:"KPI is taught in Session 5 (Nov 21). Until those slides arrive, this module follows the Cachon &amp; Terwiesch textbook's approach (KPI/ROIC trees) plus the measurement issues raised in the Capital One case. <b>It will be updated when you upload the KPI slides.</b>",
objectives:["Build a <b>KPI tree</b> that links an operational measure to profit / ROIC","Identify the <b>value drivers</b> (the operational levers that move financial results most)","Spot <b>bad metrics</b> that can be gamed (the Capital One measurement system)"],
lesson:[
{h:"Why operations people need a KPI tree",html:`
<p>Finance talks about <b>profit</b> and <b>return on invested capital (ROIC)</b>. Operations talks about <b>flow rate, utilization, flow time, inventory, labor productivity</b>. A <span class="k">KPI tree</span> connects the two: start from the financial goal at the top and keep breaking it down (“this equals that × that”) until you hit things an operations manager can actually change.</p>
<div class="formula"><span class="eq">ROIC = ${fr("Return","Invested capital")} = ${fr("Revenue − Costs","Invested capital")}</span></div>
<div class="callout why"><b>💡 Why bother?</b>It shows which operational improvement is worth the most money. A 1% gain in a high-impact driver can beat a 10% gain in a low-impact one. The tree also exposes the link to the earlier modules: revenue = flow rate × price, inventory = working capital, labor cost = wages / flow rate.</div>`},
{h:"Example: an airline KPI tree",html:`
<table class="t"><tr><th>Level</th><th>Break-down</th></tr>
<tr><td>Profit</td><td>Revenue − Cost</td></tr>
<tr><td>Revenue</td><td>Revenue passenger miles (RPM) × Yield ($/RPM)</td></tr>
<tr><td>RPM</td><td>Available seat miles (ASM) × Load factor (% seats filled)</td></tr>
<tr><td>ASM</td><td>Number of aircraft × Seats per aircraft × Miles flown per aircraft per day × days</td></tr>
<tr><td>Miles per aircraft per day</td><td>Hours in the air per day × speed ← <b>OEE of the aircraft</b> (American Airlines planes fly only ~8–9 of 24 hours)</td></tr>
<tr><td>Cost</td><td>Cost per ASM × ASM (labor, fuel, maintenance, airport fees…)</td></tr></table>
<p>Ops levers here: <b>turnaround time at the gate</b> (raises hours flown per plane → more ASM from the same capital), <b>load factor</b> (filling seats), labor productivity (cost per ASM).</p>
<div class="callout case"><b>✈️ Link to INTRO</b>The yield vs cost per RPM chart from INTRO (0.077/0.059, 0.165/0.141, 0.231/0.228) uses exactly these KPIs. Profit margin per mile = yield − cost per RPM.</div>`},
{h:"Finding the value driver: a sensitivity check",html:`
<p>Method: increase each operational driver by the same small % (say 1%), recompute profit, see which moves profit the most. That's the <b>value driver</b>.</p>
<p>Example (illustrative): a call center earns revenue per resolved call and pays agents per hour. Raising <u>utilization</u> by 1% lowers cost per call by ~1%; raising the <u>resolution rate</u> by 1% raises revenue by ~1% <i>and</i> cuts repeat calls. Which is bigger depends on margins, which is why you build the tree with real numbers.</p>
<div class="callout why"><b>💡 Rule of thumb</b>In a thin-margin business, small % changes in volume or price drivers have a huge effect on profit (leverage), because fixed costs don't move.</div>`},
{h:"Good and bad performance metrics (Capital One)",html:`
<p>Capital One measured: <b>productive-to-paid ratio (PTP, target 65%)</b>, processed apps per associate per month (target 15), quality score (90%), turnaround (15 days), conversion (25%).</p>
<ul><li>“Processed apps” excluded declines and withdrawals → associates had no credit for quick rejections → incentive to hold files.</li>
<li>Per-step productivity incentives → each step optimizes itself; nobody owns the customer's flow time, which drives withdrawals (95% convert within 2 days vs. 83% at 11–12 days).</li>
<li>Paying underwriters per approval would create <b>moral hazard</b> (approve everything).</li>
<li>Labor utilization alone can be gamed by slowing down (FLOW).</li></ul>
<div class="callout key"><b>📌 Good KPIs</b>Tie to the customer and the bottleneck (flow time, conversion, bottleneck productivity), are hard to game, and connect upward to ROIC.</div>`}
],
formulas:[
{name:"Return on invested capital",f:`ROIC = ${fr("Revenue − Costs","Invested capital")}`,why:"Top of the KPI tree."},
{name:"Revenue (ops view)",f:"Revenue = Flow rate × Price",why:"Flow rate = min(demand, capacity) → capacity problems are revenue problems."},
{name:"Airline revenue",f:"Revenue = ASM × Load factor × Yield",why:"Seats offered × share filled × $ per passenger mile."}
],
worked:[
{title:"Which lever is worth more? (airline)",setup:"An airline flies 100 planes × 150 seats × 3,000 miles/day each. Load factor 80%. Yield $0.15/RPM. Cost $0.11 per ASM. (All per day.)",steps:[
{ask:"ASM per day?",ans:"100 × 150 × 3,000 = <b>45M seat-miles</b>."},
{ask:"Revenue and cost per day?",ans:"RPM = 45M × 0.8 = 36M → revenue = 36M × $0.15 = <b>$5.4M</b>. Cost = 45M × $0.11 = <b>$4.95M</b>. Profit = <b>$0.45M/day</b>."},
{ask:"Option A: cut gate turnaround so each plane flies 3,150 miles/day (+5%) at the same cost per ASM. New profit?",ans:"ASM = 47.25M; revenue = 47.25 × 0.8 × 0.15 = $5.67M; cost = 47.25 × 0.11 = $5.198M; profit = <b>$0.4725M</b> (+5%).",why:"More output from the same planes. (In reality cost per ASM would also fall because aircraft capital is fixed, which makes this lever even better.)"},
{ask:"Option B: raise load factor from 80% to 84% (+5%). New profit?",ans:"Revenue = 45M × 0.84 × 0.15 = $5.67M; cost unchanged $4.95M; profit = <b>$0.72M</b> (+60%!).",why:"Filling empty seats adds revenue with almost no extra cost; that's operating leverage. Load factor is the stronger value driver here."}]}
],
checks:[
{id:"kp1",q:"A KPI tree is used to…",opts:["Replace financial statements","Link operational measures to financial outcomes like profit/ROIC","Rank employees","Draw process flows"],a:1,why:"It decomposes financial goals into operational levers so you can see which improvements matter most."},
{id:"kp2",q:"In the ops view, revenue equals…",opts:["Capacity × price","Flow rate × price","Utilization × price","Inventory × price"],a:1,why:"You sell what flows through: min(demand, capacity) × price."},
{id:"kp3",q:"Why can a small increase in load factor raise airline profit a lot?",opts:["Fuel gets cheaper","Revenue rises while costs are almost fixed (operating leverage)","Planes fly faster","Yield increases automatically"],a:1,why:"The flight costs almost the same with or without the extra passenger."},
{id:"kp4",q:"Capital One counted only “processed” (approved) apps for productivity. What's the problem?",opts:["None","No credit for quick rejections → incentives don't match the process goal","It overstates quality","It's illegal"],a:1,why:"Metrics drive behavior. Bad metrics create gaming or suboptimal effort allocation."}
],
calcs:[
{id:"kpc1",q:"A clinic sees 30 patients/day (capacity-constrained; demand is higher), revenue $200/patient, fixed cost $4,500/day. If a process improvement raises capacity by 10%, by how many $ per day does profit rise?",ans:600,unit:"$/day",steps:["Old flow rate 30 → new 33 (demand is higher, so all extra capacity sells).","Extra revenue = 3 × $200 = $600; fixed cost unchanged.","Profit rises by <b>$600/day</b> (from $1,500 to $2,100: +40%)."],why:"Capacity at the bottleneck is revenue when you're capacity-constrained."},
{id:"kpc2",q:"Same clinic but demand is only 28 patients/day. Profit increase from the 10% capacity boost?",ans:0,unit:"$/day",tol:0.5,steps:["Flow rate = min(28, 30) = 28 before; min(28, 33) = 28 after.","No extra patients → <b>$0</b>."],why:"Demand-constrained processes don't gain revenue from more capacity."}
],
gens:[],
cases:`<div class="callout case"><b>📂 Capital One</b>Measurement system (PTP 65%, 15 apps/associate/month, quality 90%, 15-day turnaround, 25% conversion) and incentive problems. <a href="#case/capone">See the case →</a></div>`,
traps:["Improving a KPI that doesn't connect to the bottleneck or the customer (e.g., utilization of a non-bottleneck).","Adding capacity in a demand-constrained process and expecting more revenue."],
prof:["Inventory, flow rate and flow time are “the three most important measures for any operation… yet they are typically not reported in financial statements.” KPI trees bring them back into the conversation."]
});
})();
