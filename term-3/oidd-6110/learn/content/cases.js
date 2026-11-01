(function(){const V=OM.V,fr=OM.fr;
const slots=["8:30","9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
const calls=[13.75,25,30.5,35,46.18,49.56,46.39,47.12,43.19,40.68,42.13,42.05,42.74,40,37.5,35,30,22.5,17.5];
function tq(n,p,m){const a=30/n,u=p/(a*m);if(u>=1)return{u,t:Infinity};return{u,a,t:p/m*Math.pow(u,Math.sqrt(2*(m+1))-1)/(1-u)};}
const rows=slots.map((s,i)=>{const r=tq(calls[i],5,9);return `<tr class="${r.t>2?'bn':''}"><td>${s}</td><td>${calls[i].toFixed(1)}</td><td>${(30/calls[i]).toFixed(3)}</td><td>${(r.u*100).toFixed(1)}%</td><td>${r.t.toFixed(2)}</td></tr>`;}).join("");
const flexM=[4,6,7,8,10,10,10,10,9,9,9,9,9,9,8,8,7,5,5];

OM.cases.push({id:"capone",ready:true,title:"Loan Processing at Capital One",blurb:"A lean transformation in a bank's back office: map the flow, find waste, find the bottleneck with attrition, and close a capacity gap.",mods:["PROCESS","FLOW","LITTLE","MULTI","LEAN","KPI","QUALITY"],
parts:[
{h:"The story in 60 seconds",html:`<p>July 2004. Rick Weis runs loan processing. Marketing plans a big mail drop and wants <b>700 funded loans/month</b>. Today they fund only <b>14 loans per associate per month × 25 associates = 350</b>. One manager: “hire more and buy IT.” An executive: “It takes ~3 hours of work per loan; 25 people × 150 h/month = 3,750 h → 1,250 applications. Even funding every other one gives 625, close to 700 with some overtime.” <b>Who's right?</b> (Spoiler: the executive's math has three classic OM mistakes.)</p>
<div class="callout key"><b>📌 Preparation steps (from the slides)</b>① Map the customer journey &amp; pain points ② Understand the process flow diagram ③ Find waste ④ Find the bottleneck (demand vs capacity) ⑤ Analyze how the bottleneck spends its time ⑥ Quantify the benefit of improved productivity.</div>`},
{h:"PROCESS: map the flow (boxes & triangles)",html:`${V("flow",{tu:"min",ru:"day",bn:false,steps:[{name:"Interview",p:23,m:7,captxt:"7 people"},{name:"Underwriting",p:40,m:8,captxt:"8 people"},{name:"QA",p:25,m:2,captxt:"2 people"},{name:"Closing",p:70,m:6,captxt:"6 people"}],foot:"Plus a workflow coordinator (assigns apps) and a manager (final approval). Rework loop: QA sends ~10% back to underwriting.",cap:"Processing times from Exhibits 2–5: interview 22–24 min, underwriting ≈ 20 (top quartile) to 61 (bottom) → ≈ 40 avg, QA 23–26, closing 68–73 min."})}
<p>Applications (“apps”) come from mailed response cards; interviewers call the customer (privacy rules: must reach the right person; failed calls take 3.1 min, real interviews 14.4 min). Successful interviews go to underwriting (verify identity, credit bureau, package file) → QA (check every file) → closing (documents, calls, mail) → manager approval → check cut.</p>`},
{h:"LEAN: find the waste (no math yet)",html:`<p>The professor: a 2-hour whiteboard session with Post-its finds most of the waste <u>before</u> expensive data collection.</p>
<table class="t"><tr><th>Waste</th><th>Where in Capital One</th></tr>
<tr><td>Defects / rework</td><td>Incomplete info from the interview → underwriters chase customers (follow-up calls 58.8–133.9 min/day per underwriter); QA sends ~10% back</td></tr>
<tr><td>Wrong work on the bottleneck (poor line balance)</td><td>Highly paid underwriters do clerical work: data entry and file prep (≈ 6–10 min/app)</td></tr>
<tr><td>Over-processing / push</td><td>Interviewers forward the 7.1 apps/day they <u>expect to be declined</u> (vs 12.3 promising) because they lack training: pushing work the bottleneck will reject</td></tr>
<tr><td>Inventory / waiting</td><td>Up to 934 apps waiting at underwriting (Exhibit 8); customers “fly blind” and withdraw</td></tr>
<tr><td>Non-standard work</td><td>Top vs bottom quartile underwriters: <b>20 vs 61 min</b> per app (internet searches 5.5 vs 16.4, follow-up calls 3.0 vs 20.2)</td></tr></table>
<p>%VAT: ≈ 2.6 hours of labor (23 + 40 + 25 + 70 min) vs 2–3 <u>weeks</u> of flow time → well under 2%.</p>`},
{h:"MULTI: attrition & how much demand each step sees",html:`${V("waterfall",{bars:[{l:"Right party|calls",v:100},{l:"Declined",v:52,type:"loss"},{l:"Withdrawn",v:14.6,type:"loss"},{l:"To QA/closing",v:33.4},{l:"Withdrawn",v:7,type:"loss"},{l:"Booked",v:26.4,type:"end"}],cap:"Exhibit 6: process yield 26.4%."})}
<p><b>Leaky bucket, backwards from 700 booked/month</b> (class used rounded loss rates 20%, 30%, 52%):</p>
<table class="t"><tr><th>Step</th><th>Calculation</th><th>Apps / month</th></tr><tr><td>Booked</td><td>target</td><td>700</td></tr><tr><td>Reaching closing</td><td>700 / (1 − 0.20)</td><td>875</td></tr><tr><td>Passing underwriting</td><td>875 / (1 − 0.30)</td><td>1,250</td></tr><tr><td>Entering underwriting (= interviews)</td><td>1,250 / (1 − 0.52)</td><td><b>≈ 2,604</b></td></tr></table>
<p>(Exact exhibit yield: 700/0.264 = 2,652.) Per day (class used 20 working days; the case says 21): 2,604/20 ≈ <b>130 apps/day</b> at interview and underwriting; QA and closing see 130 × 0.48 × 0.70 ≈ <b>43.8/day</b>.</p>`},
{h:"Find the bottleneck: implied utilization",html:`<p>Available time per associate: the class used <b>≈ 400 productive minutes/day</b> (the exact number matters less than the method).</p>
<table class="t"><tr><th>Step</th><th>Demand/day</th><th>Capacity/day = m × 400 / p</th><th>Implied utilization</th></tr>
<tr><td>Interview</td><td>130</td><td>7 × 400/23 = 122</td><td>107%</td></tr>
<tr class="bn"><td>Underwriting</td><td>130</td><td>8 × 400/40 = <b>80</b></td><td><b>163% 🔴</b></td></tr>
<tr><td>QA</td><td>43.8</td><td>2 × 400/25 = 32</td><td>137%</td></tr>
<tr><td>Closing</td><td>43.8</td><td>6 × 400/70 = 34.3</td><td>128%</td></tr></table>
${V("bars",{bars:[{l:"Interview",v:107},{l:"Underwriting",v:163,c:"#c0392b"},{l:"QA",v:137},{l:"Closing",v:128}],line:100,linel:"100%",yl:"Implied utilization %"})}
<div class="callout why"><b>💡 Why not just “lowest capacity”?</b>QA has the lowest capacity (32/day) but sees only survivors (43.8/day). Underwriting has more capacity (80) but must touch every app (130), including the 52% it declines. Highest implied utilization wins. Minutes-of-work check: 130 × 40 = 5,200 min needed vs 8 × 400 = 3,200 available (+ ~800 min of rework).</div>
<div class="callout case"><b>Why the executive was wrong</b>① Ignored attrition (needs ~2,600 applications, not 1,400). ② Pooled all 25 people as if interchangeable (a closer can't underwrite) when the <u>bottleneck</u> sets output. ③ Used an average labor content without checking each resource's load.</div>`},
{h:"Close the gap: a 3-part plan (as in class)",html:`<p>Underwriting needs 130/day but has 80 → gap ≈ 50/day. Each idea: <b>waste targeted → action → effect</b>.</p>
<ol><li><b>Protect the bottleneck by cutting its demand</b>: let interviewers screen out obvious declines (if 10% of apps were rejected at the interview, underwriting demand falls ≈ 130 → 117/day). Caveat (professor): assumes interviewer and underwriter would reject the same files and that each saves a full 40 min; an underwriter might reject such a file in 5 min.</li>
<li><b>Raise underwriter productivity</b>: teach bottom-quartile methods of the top quartile, move clerical tasks (data entry, file prep, follow-up calls) to lower-paid staff, automation. 40 → 35 min/app ⇒ capacity 8 × 400/35 ≈ <b>91/day</b> (+11).</li>
<li><b>Add capacity</b>: hire with target manpower (works but runs against lean thinking; do it last).</li></ol>
<p>Also: shorter waits raise conversion (Exhibit 7), so fixing flow time reduces the number of applications needed:</p>
${V("bars",{bars:[{l:"0–2 d",v:5.2},{l:"3–4 d",v:6.5},{l:"5–6 d",v:9.8},{l:"7–8 d",v:12.6},{l:"9–10 d",v:15.2},{l:"11–12 d",v:17.1}],yl:"% withdrawn",cap:"Exhibit 7: withdrawals rise with wait time after interview. “It is the best customers that withdraw first.”"})}
<p><b>Little's Law link</b>: 934 apps waiting at underwriting ÷ ~80 processed/day ≈ <b>11–12 days</b> of waiting, exactly where withdrawals reach 17%.</p>`},
{h:"KPI & incentives",html:`<ul><li>PTP (productive-to-paid) ≈ 65% target; “processed apps” exclude declines/withdrawals → no credit for fast rejections.</li><li>Department targets: 15 apps/associate/month, quality 90%, turnaround 15 days, conversion 25%.</li><li>Paying underwriters per approval → moral hazard. Fixed salary + top-quartile rewards was the class compromise.</li><li>The workflow coordinator gives the most work to the fastest underwriters (they're rewarded with bonuses), but nobody manages the customer's flow time.</li></ul>`},
{h:"AI angle (2025–26 discussion)",html:`<p>ChatGPT/Claude prompted as consultants found the 26.4% yield, the ~2,600 applications and the underwriting bottleneck, but sometimes assumed different available minutes. What's left for humans: data collection/measurement at the front end and implementation at the back end. Human-in-the-loop designs (AI reduces processing time; AI handles easy cases, escalates hard ones) still need <b>capacity calculations</b>, and the minutes-of-work method handles all of them.</p>`}
],
questions:[
{id:"cap1",q:"Why is underwriting (not QA) the bottleneck even though QA has the lowest capacity?",opts:["QA is faster","Underwriting must handle every app (including the 52% it declines), so its demand/capacity ratio is highest","QA has more people","Underwriters are paid more"],a:1,why:"Highest implied utilization: 130/80 = 163% vs QA 43.8/32 = 137%."},
{id:"cap2",q:"Process yield from right-party call to booked loan?",ans:26.4,unit:"%",tol:0.2,steps:["Exhibit 6: 100 → 26.4 booked.","Yield = <b>26.4%</b>."]},
{id:"cap3",q:"Using the exact yield 26.4%, how many right-party apps per month are needed to book 700 loans?",ans:2651.5,unit:"apps/month",tol:15,steps:["700 / 0.264 = <b>≈ 2,652</b>."]},
{id:"cap4",q:"With 8 underwriters × 400 min/day and 35 min/app (after productivity gains), underwriting capacity per day?",ans:91.43,unit:"apps/day",steps:["8 × 400 / 35 = <b>91.4/day</b>."]},
{id:"cap5",q:"934 apps wait at underwriting, which processes 80/day. Average wait (days)?",ans:11.675,unit:"days",tol:0.15,steps:["Little's Law: T = I/R = 934/80 = <b>11.7 days</b>."]},
{id:"cap6",q:"Which is the executive's biggest error in claiming 25 associates can produce 1,250 apps/month?",opts:["Wrong number of working days","Treating all 25 associates as one interchangeable pool and ignoring attrition; output is set by the bottleneck","Using minutes instead of hours","Forgetting overtime"],a:1,why:"Capacity is set by the bottleneck resource, and attrition means far more apps must be processed than loans funded."}
]});

OM.cases.push({id:"callcenter",ready:true,title:"Call Center Operations at Picadilly Bank",blurb:"A UK credit-card call center: cost per call, waiting times per 30-min slot with the waiting time formula, an OEE chart, and AI options.",mods:["WAIT","LEAN (OEE)","FLOW","LOSS (pooling)","INTRO"],
parts:[
{h:"The facts you need",html:`<table class="t"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Hours</td><td>Weekdays 8:30–18:00 (9.5 h, 19 half-hour slots), 252 days/yr</td></tr>
<tr><td>Agents in seat</td><td><b>m = 9</b> in every slot</td></tr>
<tr><td>Handling time</td><td>p = <b>5 min</b> (4:15 talk + 0:45 wrap), st.dev 5 → <b>CVp = 1</b></td></tr>
<tr><td>Arrivals</td><td>Random within each slot (exponential) → <b>CVa = 1</b>; volume varies by slot (Exhibit 2, 687 calls/day)</td></tr>
<tr><td>Pay</td><td>£30/h + 30% overhead = <b>£39 per paid hour</b></td></tr>
<tr><td>Time off</td><td>6 weeks paid vacation, 6% absenteeism, 15% of office time on other duties</td></tr>
<tr><td>Target</td><td>Average wait ≤ 2 min in every hour (missed at lunch)</td></tr>
<tr><td>Phone cost</td><td>£0.04 per minute of talk AND wait</td></tr></table>`},
{h:"WAIT: slot-by-slot waiting time (m = 9)",html:`<p>For each slot: a = 30 min / calls, u = p/(a × m), T<sub>q</sub> = (p/m) × u<sup>√20 − 1</sup>/(1 − u) × (1² + 1²)/2.</p>
<table class="t"><tr><th>Slot</th><th>Calls</th><th>a (min)</th><th>u</th><th>T<sub>q</sub> (min)</th></tr>${rows}</table>
<p>Red rows miss the 2-minute target: <b>10:30–12:00</b> (peak 11:00 slot: u ≈ 92%, T<sub>q</sub> ≈ 5 min). Call-weighted average wait over the day ≈ <b>1.3 min</b>, while early and late slots have agents idle most of the time (u = 25–45%).</p>
<div class="callout why"><b>💡 Why analyze slot by slot?</b>The daily pattern is <b>seasonality</b> (predictable); averaging the day would hide the lunch problem. Within a slot, randomness is <b>variability</b> (CVa = 1).</div>`},
{h:"FLOW: what does a call cost?",html:`<ol><li>Fraction of paid time an agent is actually in the seat: (1 − 30/252 vacation days) × (1 − 0.06) × (1 − 0.15) = 0.881 × 0.94 × 0.85 ≈ <b>70.4%</b>. (Assumption: 6 weeks = 30 working days out of 252.)</li>
<li>To keep 9 in seats you pay 9 / 0.704 ≈ <b>12.8 agents</b>.</li>
<li>Cost per in-seat hour = £39 / 0.704 ≈ <b>£55.4</b>.</li>
<li>Daily labor = 9 seats × 9.5 h × £55.4 ≈ <b>£4,737</b> → ÷ 687 calls ≈ <b>£6.90 per call</b>.</li>
<li>Phone: £0.04 × (5 + 1.3 min wait) ≈ <b>£0.25 per call</b>. Total ≈ <b>£7.15 per call</b>.</li></ol>
<div class="callout trap"><b>⚠️ Your numbers may differ slightly</b>depending on how you treat vacation (e.g., 52 paid weeks vs 46 working weeks). State your assumption; the method is what's graded in discussion.</div>`},
{h:"LEAN: the OEE waterfall",html:`${V("waterfall",{bars:[{l:"Paid time",v:100},{l:"Vacation",v:11.9,type:"loss"},{l:"Absent",v:5.3,type:"loss"},{l:"Other|duties",v:12.4,type:"loss"},{l:"Idle in|seat",v:23.3,type:"loss"},{l:"Wrap|(incidental)",v:7.1,type:"loss"},{l:"Talking to|customer",v:40,type:"end"}],unit:"%",cap:"Of every paid hour, only ≈ 40% is spent talking to a customer (≈ 47% if you count wrap time as value add). In-seat utilization ≈ 67%."})}`},
{h:"Improvement story: cut cost AND waits",html:`<table class="t"><tr><th>Idea</th><th>Effect (computed with the same formula)</th></tr>
<tr><td><b>Staff to demand by slot</b> (volume flexibility) instead of a flat 9: ${flexM.join(", ")} agents</td><td>Every slot meets ≤ 2 min; seat-hours 85.5 → 76 (−11% labor ≈ £525/day) and average wait 1.3 → 1.0 min</td></tr>
<tr><td><b>Bot handles 20% of calls</b> (Shantanu idea 1)</td><td>With 9 agents average wait falls to ≈ 0.3 min; or keep waits ≤ 2 with ≈ 62 seat-hours (−27%)</td></tr>
<tr><td><b>AI writes the wrap</b> (p 5 → 4.25 min)</td><td>≈ 64.5 seat-hours needed (−25%); attacks incidental work directly</td></tr>
<tr><td><b>Cross-train for call types 1–3 (pooling)</b></td><td>One big pool waits less than three small ones (LOSS module)</td></tr>
<tr><td><b>Reduce CVp</b> (coach slow agents, scripts)</td><td>Variability factor (1 + CVp²)/2 falls below 1 → shorter waits at the same staffing</td></tr></table>
<p>Story for John (who loves human contact): keep humans on the phone, but use AI where it frees agent time (wrap, recommended text) and use flexible staffing, so <b>cost falls and waits fall</b>, which is a frontier shift, not just a cut.</p>`}
],
questions:[
{id:"cc1",q:"11:00–11:30 slot: 49.6 calls, p = 5 min, m = 9. Utilization u?",ans:91.8,unit:"%",tol:0.5,steps:["a = 30/49.6 = 0.605 min.","u = 5/(0.605 × 9) = <b>91.8%</b>."]},
{id:"cc2",q:"8:30 slot: 13.75 calls, p = 5, m = 9. Utilization?",ans:25.5,unit:"%",tol:0.5,steps:["a = 30/13.75 = 2.18 min.","u = 5/(2.18 × 9) = <b>25.5%</b>: agents mostly idle."]},
{id:"cc3",q:"The 2-minute target is missed only at lunch even though agents are idle a lot in the morning. The best explanation:",opts:["Agents are lazy at lunch","Seasonality: a flat staffing of 9 doesn't follow the predictable daily demand pattern","CVa is higher at lunch","Calls are longer at lunch"],a:1,why:"The fix is volume flexibility (staff to each slot's demand), not more agents all day."},
{id:"cc4",q:"If wrap time is automated (p = 4.25 instead of 5), which factor(s) of the waiting time formula fall?",opts:["Only the service time factor","Service time factor AND utilization factor (and CVp may change)","Only the variability factor","None"],a:1,why:"p/m falls and u = p/(a·m) falls, which shrinks the utilization factor too."}
]});

OM.cases.push({id:"subway",ready:true,title:"Subway (in-class)",blurb:"The sandwich line used to teach cycle time, idle time, labor utilization, cost of direct labor, takt time and target manpower.",mods:["INTRO","FLOW"],
parts:[{h:"Everything Subway, in one place",html:`<p>Facts: ~42,000 stores in 112 countries, ~$500k revenue/store (McDonald's $2.5–4M; Chick-fil-A $9M), start-up $100–200k, 8% royalty + 4.5% marketing fee, two-week training, detailed manual. Acquired by Roark Capital in 2024 for $9B; struggles post-COVID; end of the “$5 footlong”.</p>
<p>WTP drivers: variety (customization), performance quality (taste), conformance quality (same everywhere), responsiveness (short line). Efficiency drivers: labor productivity, food waste.</p>
<p>All calculations are in <a href="#m/flow">Module FLOW →</a> (37/46/37 s, CT 46 s, idle 18 s, labor content 120 s, labor utilization 87%, $0.575 per sandwich at $15/h, 20 students in 994 s, takt 22.5 s at 160/h, target manpower 5.33 → 7 in practice).</p>`}]});

OM.cases.push({id:"mortgage",ready:false,title:"Mortgage Exercise / Huntsman Bank (A)",blurb:"Session 1 in-class game: 49 paper loan files, paper vs spreadsheet vs AI teams, plotted on quality vs efficiency. Huntsman Bank (B) comes in Session 4.",mods:["INTRO","PROCESS"],
parts:[{h:"What happened in class",html:`<p>Decision rule: approve if <b>LTV &lt; 85%</b>, or LTV in [85%, 100%] <b>and</b> front ratio &lt; 25% <b>and</b> back ratio &lt; 35%. LTV = loan amount / min(purchase price, appraisal). Example: loan = (100% − 13%) × $207,000 = $180,090; ÷ min($207,000, $178,236) → LTV &gt; 100% → reject.</p>
<p>Teams planned for 15 min, ran 10 min, then reported loans completed and % correct → plotted on an efficiency frontier (INTRO). The professor then turned the steps into a process: LTV 1 min → Front+Back 2 min → Word count 3 min → Underwrite 0.5 min (<a href="#m/process">Module PROCESS →</a>).</p>
<p class="sub">⏳ Upload the Huntsman Bank (A)/(B) documents and I'll add the full breakdown and questions.</p>`}]});
})();
