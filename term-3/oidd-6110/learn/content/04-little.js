(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
OM.modules.push({
id:"little",n:4,code:"LITTLE",icon:"💧",color:"#6b46c1",title:"Little's Law, Inventory Turns & Employee Turnover",
status:"slides + lecture",
blurb:"I = R × T. Use it to get the third measure from two, compute inventory turns, days of supply, per-unit inventory costs, employee turnover and tenure.",
intro:"One tiny equation that works for patients, dollar bills, employees, and loan files. Once you see it, you'll see it everywhere.",
objectives:["Given two of the basic process flow measures, find the third using <b>Little's Law</b>","Compute <b>inventory turns</b> and <b>days of supply</b>, and determine <b>inventory costs</b>","Compute <b>employee turnover</b> and <b>average tenure</b>"],
lesson:[
{h:"Little's Law: I = R × T",html:`
${V("little",{})}
<div class="formula"><span class="eq">Inventory (I) = Flow rate (R) × Flow time (T)</span><div class="why">💡 Memory hook from the slide: “<b>I R</b>emember <b>T</b>his” (I = R·T). Proven by John Little (MIT).</div></div>
<div class="callout why"><b>💡 Why is it true? (intuition)</b>Imagine a club where <b>10 people arrive per hour</b> (R) and each stays <b>3 hours</b> (T). At any moment, who's inside? Everyone who arrived in the last 3 hours: 10 × 3 = <b>30 people</b> (I). That's all Little's Law says, and it holds <u>on average</u> for <u>any</u> stable process.</div>
<ul><li>Know two → compute the third: T = I/R, R = I/T.</li>
<li>Management can choose two; the third is “given by nature.”</li>
<li>Hold inventory constant: shorter flow time ⇔ higher flow rate.</li></ul>
<div class="callout trap"><b>⚠️ Units must match</b>If R is per <u>day</u>, T comes out in <u>days</u>. If R is per year, T is in years (× 365 for days).</div>
<div class="callout prof"><b>🎓 TSA story</b>At Philly airport, the TSA handed out time-stamped cards to measure wait time. The professor: waste of money. Just count people in line (I) and the rate they're screened (R): T = I/R. Flow time is the hardest measure to observe; Little's Law lets you skip measuring it.</div>`},
{h:"Money as a flow unit: inventory turns & days of supply",html:`
<p>Treat each <b>dollar</b> of inventory as a flow unit. Dollars come in when you buy goods and leave when you sell them (at cost, i.e. <b>COGS</b>).</p>
<table class="t"><tr><th>Little's Law piece</th><th>For $-bills in a company</th></tr><tr><td>I</td><td>Inventory on the balance sheet ($)</td></tr><tr><td>R</td><td>COGS per year ($/yr), <u>not revenue</u></td></tr><tr><td>T</td><td>How long the average $ sits in inventory</td></tr></table>
<div class="formula"><span class="eq">Days of supply = ${fr("Inventory","COGS")} × 365</span> &nbsp;&nbsp; <span class="eq">Inventory turns = ${fr("COGS","Inventory")}</span><div class="why">💡 Turns = 1/T (in years): how many times per year the inventory is completely replaced.</div></div>
<div class="callout trap"><b>⚠️ Use COGS, not revenue</b>Inventory is valued at cost, so the flow must be at cost too. Using revenue mixes apples (cost) and oranges (price) and overstates turns.</div>
<table class="t"><tr><th></th><th>COGS ($M/yr)</th><th>Inventory ($M)</th><th>Turns</th><th>Days of supply</th></tr>
<tr><td>Compaq (old PC maker)</td><td>25,263</td><td>2,003</td><td>12.6</td><td>28.9 days</td></tr>
<tr><td>Dell (make-to-order)</td><td>20,000</td><td>391</td><td>51.2</td><td>7.1 days</td></tr></table>`},
{h:"From turns to inventory costs",html:`
<p>Holding inventory costs money every year: capital tied up (WACC), storage, obsolescence/depreciation. Express this as a % per year (e.g., 30%). The longer an item sits, the more of that it eats:</p>
<div class="formula"><span class="eq">Per-unit inventory cost (%) = ${fr("Annual inventory cost %","Inventory turns")}</span><div class="why">💡 If an item sits 1/6 of a year (6 turns) and holding costs 30%/year, it costs 30% × 1/6 = <b>5%</b> of its value.</div></div>
<p>Then multiply by the item's cost (COGS): a $60 item → 5% × $60 = <b>$3 per unit</b>.</p>
<div class="callout case"><b>👗 Macy's vs Gap (class)</b>Holding cost 30%/yr. Macy's 4 turns → 7.5% of COGS; Gap 3 turns → 10%. A 2.5-point margin difference just from turns, a cost that never appears as a line item on the P&amp;L.</div>`},
{h:"Inventory turns vs. gross margin",html:`
${V("bars",{bars:[{l:"Tiffany",v:0.66},{l:"Macy's",v:2.9},{l:"Gap",v:3.9},{l:"Best Buy",v:6.35},{l:"Walmart",v:8.9},{l:"Kroger",v:13.4}],yl:"Inventory turns / yr",cap:"Gross margins in the slide: Tiffany 61%, Macy's & Gap ~37%, Best Buy 24%, Walmart 23%. Kroger (groceries) turns fastest."})}
<div class="callout key"><b>📌 Takeaway</b>High-margin sellers (Tiffany: 0.66 turns ≈ 550 days in stock!) carry slow inventory. Low-margin sellers of commodities/perishables (Kroger, Walmart) must turn fast. <u>Only compare turns among direct competitors.</u> Higher turns ≠ “cut your margin to sell faster”.</div>`},
{h:"People as flow units: employee turnover",html:`
<p>Same law, new flow unit: <b>employees</b>. New hires flow in, departures flow out.</p>
<table class="t"><tr><th>Little's Law</th><th>Employees</th></tr><tr><td>I</td><td>Number of employees</td></tr><tr><td>R</td><td>People leaving per year</td></tr><tr><td>T</td><td>Average tenure <u>on the day of departure</u></td></tr></table>
<div class="formula"><span class="eq">Employee turnover = ${fr("Employees lost per year","Average number of employees")}</span><br><span class="eq">Avg tenure at departure = ${fr("1","Employee turnover")}</span> &nbsp; <span class="eq">Average tenure = ½ × tenure at departure</span><div class="why">💡 Why ½? If people stay 18 years in total, a random employee you meet today is on average halfway through: 9 years in. (Assumes steady hiring.)</div></div>
<div class="callout case"><b>📂 Why turnover matters</b>Henry Ford's Highland plant had <b>370%</b> turnover in 1914 → he doubled wages to $5/day, offered English classes, housing and medical support. Today a large device maker sees ~<b>300%</b> turnover; quality drops right after pay day (when people quit) → ~$150M/yr in yield losses (Moon et al. 2020).</div>`}
],
formulas:[
{name:"Little's Law",f:"I = R × T",why:"Inventory = flow rate × flow time. Any two give the third."},
{name:"Days of supply",f:`${fr("Inventory","COGS")} × 365`,why:"Flow time of a $-bill, in days."},
{name:"Inventory turns",f:`${fr("COGS","Inventory")}`,why:"1 / flow time (in years). Use COGS, not revenue."},
{name:"Per-unit inventory cost",f:`${fr("Annual inventory cost %","Inventory turns")} (× item cost for $)`,why:"Yearly holding % × fraction of the year the item sits."},
{name:"Employee turnover",f:`${fr("Employees lost per year","Average # employees")}`,why:"R / I for people."},
{name:"Tenure",f:`Tenure at departure = ${fr("1","Turnover")}; Average tenure = ½ × tenure at departure`,why:"Little's Law (T = I/R) + people are halfway through on average."}
],
worked:[
{title:"Costco employee turnover",src:"Slides LITTLE #73",setup:"The average Costco employee in the US has <b>9 years</b> of service; Costco has <b>160,000</b> US employees. (a) Average tenure when they leave? (b) Employee turnover? (c) Hires per year to keep the workforce constant?",steps:[
{ask:"Is “9 years of service” the tenure at departure or the average tenure?",ans:"It's the <b>average tenure</b> of current employees (how long the people working there now have been there).",why:"This is the key reading step. The employee you meet today is on average halfway through their career at Costco."},
{ask:"(a) Tenure at departure?",ans:"Average tenure = ½ × tenure at departure → 9 = ½ × T → <b>T = 18 years</b>."},
{ask:"(b) Employee turnover?",ans:"Turnover = 1/T = 1/18 = <b>5.6% per year</b>."},
{ask:"(c) How many hires per year?",ans:"Little's Law: R = I/T = 160,000 / 18 = <b>≈ 8,889 departures per year</b>, so ≈ 8,889 hires/yr to stay constant.",why:"Steady state: inflow = outflow."}]},
{title:"Turns, days of supply and per-unit inventory cost",setup:"A retailer: COGS $1,800M/yr, inventory $300M, annual holding cost 24%. An item costs the retailer $50.",steps:[
{ask:"Inventory turns?",ans:"1,800/300 = <b>6 turns/yr</b>."},
{ask:"Days of supply?",ans:"300/1,800 × 365 = <b>60.8 days</b>.",why:"= 365/6."},
{ask:"Per-unit inventory cost (%)?",ans:"24% / 6 = <b>4%</b>."},
{ask:"In $ for the $50 item?",ans:"4% × $50 = <b>$2.00 per unit</b>."}]},
{title:"Little's Law in a hospital",setup:"An ER treats 180 patients per day. On average there are 60 patients in the ER.",steps:[
{ask:"Which two of I, R, T do we know?",ans:"I = 60 patients; R = 180/day. Unknown: T."},
{ask:"Average time a patient spends in the ER?",ans:"T = I/R = 60/180 = 1/3 day = <b>8 hours</b>.",why:"Units: patients ÷ (patients/day) = days."}]}
],
checks:[
{id:"li1",q:"Little's Law says…",opts:["I = R / T","I = R × T","R = I × T","T = R × I"],a:1,why:"Inventory = Flow rate × Flow time (“I R emember T his”)."},
{id:"li2",q:"To compute inventory turns from financial statements, divide…",opts:["Revenue by inventory","COGS by inventory","Inventory by COGS","Gross margin by inventory"],a:1,why:"Inventory is at cost, so the flow must be at cost: COGS/Inventory."},
{id:"li3",q:"Days of supply rise from 30 to 60 days (same COGS). What happened to inventory turns?",opts:["Doubled","Halved","Unchanged","Can't tell without revenue"],a:1,why:"Turns = 365 / days of supply: 12.2 → 6.1. Inventory sits twice as long."},
{id:"li4",q:"Which statements are correct? (select all)",multi:true,opts:["Turns should be computed with COGS, not revenue","If turns double, the per-unit holding cost (as % of cost) halves","Higher turns guarantee higher profit","Comparing turns is most meaningful between direct competitors"],a:[0,1,3],why:"Turns describe how long inventory sits and so its holding cost. They don't guarantee profit (Tiffany turns slowly with a 61% margin). Compare like with like."},
{id:"li5",q:"An employee survey says the average employee has been with the firm 4 years. Average tenure at departure is…",opts:["2 years","4 years","8 years","Can't tell"],a:2,why:"Average tenure = ½ × tenure at departure → 8 years (assuming steady state)."},
{id:"li6",q:"Firm A turns inventory 4×/yr, firm B 8×/yr, both with 30%/yr holding cost. Per-unit inventory cost: ",opts:["A 7.5%, B 3.75%","A 3.75%, B 7.5%","Both 30%","A 120%, B 240%"],a:0,why:"30%/4 = 7.5%; 30%/8 = 3.75%."},
{id:"li7",q:"Tiffany turns inventory 0.66×/yr. Roughly how long does a ring sit in inventory?",opts:["66 days","About 1 month","About 1.5 years (≈550 days)","6.6 years"],a:2,why:"365/0.66 ≈ 553 days."},
{id:"li8",q:"Why is flow time usually computed (not measured)?",opts:["It is always constant","It's the hardest of I, R, T to observe directly; I and R are easy to count","Regulations forbid measuring it","It equals cycle time"],a:1,why:"Counting units inside (I) and output per hour (R) is easy; tracking each unit's time is hard → T = I/R."}
],
calcs:[
{id:"lic1",q:"A bakery sells 600 loaves per day. On average 150 loaves are in the store (baked, waiting to be sold). How many hours does an average loaf wait? (Assume a 24-hour day.)",ans:6,unit:"hours",steps:["T = I/R = 150/600 = 0.25 days.","0.25 × 24 = <b>6 hours</b>."]},
{id:"lic2",q:"A company has COGS of $2,400M per year and average inventory of $400M. Inventory turns?",ans:6,unit:"turns/yr",steps:["Turns = COGS/Inventory = 2,400/400 = <b>6</b>."]},
{id:"lic3",q:"Same company (COGS $2,400M, inventory $400M). Days of supply?",ans:60.83,unit:"days",steps:["400/2,400 × 365 = <b>60.8 days</b>."]},
{id:"lic4",q:"Revenue $3,000M, COGS $1,500M, inventory $500M, annual holding cost 20%. Per-unit inventory cost for a product that costs $80?",ans:5.33,unit:"$/unit",hint:"Turns use COGS (not revenue).",steps:["Turns = 1,500/500 = 3.","Per-unit % = 20%/3 = 6.67%.","6.67% × $80 = <b>$5.33</b>."],why:"Revenue is a distractor."},
{id:"lic5",q:"A consulting firm has 2,000 consultants and 500 leave each year. Employee turnover?",ans:25,unit:"%",steps:["Turnover = 500/2,000 = <b>25%/yr</b>."]},
{id:"lic6",q:"Same firm (2,000 people, 500 leave/yr). Average tenure of current employees (years)?",ans:2,unit:"years",steps:["Tenure at departure = 1/0.25 = 4 years (or 2,000/500).","Average tenure = ½ × 4 = <b>2 years</b>."]},
{id:"lic7",q:"A loan office receives 50 applications per week; on average 150 applications are in process. Average flow time in weeks?",ans:3,unit:"weeks",steps:["T = I/R = 150/50 = <b>3 weeks</b>."]}
],
gens:[["little_irt","Little's Law (find the missing one)"],["little_turns","Turns, days of supply, per-unit cost"],["little_emp","Employee turnover & tenure"]],
cases:`<div class="callout case"><b>📂 Retailer inventory-turns assignment</b>Match 4 retailers to turns 8.9, 0.66, 3.4, 13.4, then relate turns to gross margin (negative relationship).</div>
<div class="callout case"><b>📂 Capital One</b>Exhibit 8 shows up to ~934 applications waiting at underwriting. With Little's Law (T = I/R) you can turn that into days of waiting, and waiting drives withdrawals (95% convert within 2 days vs 83% after 11–12 days). <a href="#case/capone">See the case →</a></div>`,
traps:["Using revenue instead of COGS for turns.","Mixing time units in Little's Law (per day vs. per hour).","Confusing average tenure with tenure at departure (factor of 2)."],
prof:["“Not knowing your flow rate is a serious risk”; inventory you can count physically; flow time is the hard one.","Apple under Tim Cook went from 5–10 turns to almost weekly turns."]
});
OM.gens.little_irt=function(){const r=OM.rnd;const R=r(5,60),T=OM.pick([0.5,1,1.5,2,2.5,3,4,6]);const I=R*T;const ask=OM.pick(["I","R","T"]);const ctx=OM.pick([["patients","hour"],["customers","hour"],["applications","day"],["orders","day"]]);
  if(ask==="T")return{q:`On average ${fmt(I)} ${ctx[0]} are in the system, and ${R} ${ctx[0]} per ${ctx[1]} go through. Average flow time (${ctx[1]}s)?`,ans:T,unit:ctx[1]+"s",steps:[`T = I/R = ${fmt(I)}/${R} = <b>${fmt(T)} ${ctx[1]}s</b>`]};
  if(ask==="I")return{q:`${R} ${ctx[0]} per ${ctx[1]} arrive, and each spends ${T} ${ctx[1]}s in the system. Average inventory?`,ans:I,unit:ctx[0],steps:[`I = R × T = ${R} × ${T} = <b>${fmt(I)}</b>`]};
  return{q:`On average ${fmt(I)} ${ctx[0]} are in the system and each spends ${T} ${ctx[1]}s there. Flow rate per ${ctx[1]}?`,ans:R,unit:ctx[0]+"/"+ctx[1],steps:[`R = I/T = ${fmt(I)}/${T} = <b>${R}</b>`]};};
OM.gens.little_turns=function(){const r=OM.rnd;const cogs=r(5,60)*100,inv=r(2,30)*50,h=OM.pick([15,18,20,24,25,30,35]),c=r(2,40)*10;const t=cogs/inv;const ask=OM.pick(["t","d","c"]);const rev=Math.round(cogs*(1.3+Math.random()));
  const d=`Revenue $${rev}M, COGS $${cogs}M, inventory $${inv}M.`;
  if(ask==="t")return{q:d+" Inventory turns?",ans:t,unit:"turns/yr",steps:[`Turns = COGS/Inventory = ${cogs}/${inv} = <b>${fmt(t)}</b> (ignore revenue)`]};
  if(ask==="d")return{q:d+" Days of supply?",ans:inv/cogs*365,unit:"days",steps:[`${inv}/${cogs} × 365 = <b>${fmt(inv/cogs*365,1)} days</b>`]};
  return{q:d+` Annual holding cost ${h}%. Per-unit inventory cost of an item that costs $${c}?`,ans:h/t/100*c,unit:"$/unit",tol:Math.max(0.011,h/t/100*c*0.02),steps:[`Turns = ${cogs}/${inv} = ${fmt(t,3)}`,`Per-unit % = ${h}%/${fmt(t,3)} = ${fmt(h/t,3)}%`,`× $${c} = <b>$${fmt(h/t/100*c)}</b>`]};};
OM.gens.little_emp=function(){const r=OM.rnd;const N=r(2,80)*500,ten=OM.pick([1,1.5,2,2.5,3,4,5,6,8,10]);const dep=2*ten;const ask=OM.pick(["dep","to","hire"]);
  const d=`A firm has ${N.toLocaleString()} employees whose average tenure (time on the job so far) is ${ten} years.`;
  if(ask==="dep")return{q:d+" Average tenure on the day of departure (years)?",ans:dep,unit:"years",steps:[`Average tenure = ½ × tenure at departure → <b>${dep} years</b>`]};
  if(ask==="to")return{q:d+" Employee turnover (% per year)?",ans:100/dep,unit:"%",steps:[`Tenure at departure = 2 × ${ten} = ${dep} yrs`,`Turnover = 1/${dep} = <b>${fmt(100/dep,2)}%</b>`]};
  return{q:d+" How many hires per year keep headcount constant?",ans:N/dep,unit:"hires/yr",steps:[`Tenure at departure = ${dep} yrs`,`R = I/T = ${N}/${dep} = <b>${fmt(N/dep,0)}</b>`]};};
})();
