(function(){const V=OM.V,fr=OM.fr;
OM.modules.push({
id:"intro",n:1,code:"INTRO",icon:"🧭",color:"#0f7b6c",title:"Cost vs. Quality: the Efficiency Frontier",
status:"slides + lecture",
blurb:"Why every business trades off cost and quality, what the efficiency frontier is, and the 3 system inhibitors (waste, variability, inflexibility).",
intro:"The big picture of the whole course. <b>No math in this module</b> (the summary slide says “Equations: None!!”), but these ideas show up in essay-style and multiple-choice questions, and they frame every later module.",
objectives:["Explain what drives a customer's <b>willingness to pay</b> (quality) and what drives <b>efficiency</b> (cost)","Draw the <b>efficiency frontier</b> of an industry and say which firms are on it (Pareto dominance)","Name and give examples of the <b>three system inhibitors</b>: waste, variability, inflexibility","Explain how <b>innovation (e.g., AI)</b> shifts the frontier"],
lesson:[
{h:"What is “operations” anyway?",html:`
<p>Every organization takes <b>inputs</b> (people, machines, materials, information) and turns them into <b>outputs</b> customers want: a sandwich, a loan decision, a cured patient, a car. <span class="k">Operations management (OM)</span> is the science of <u>how that work is done</u>. The professor likes to say <i>“opus” = work in Latin</i>.</p>
<p>The whole course is about two things at once:</p>
<table class="t"><tr><th>🙂 The DEMAND side</th><th>⚙️ The SUPPLY side</th></tr>
<tr><td>Make customers <b>willing to pay more</b> (higher quality, faster service, more variety)</td><td>Deliver it <b>efficiently</b> (low cost per unit, little waste)</td></tr></table>
<p>The course tagline is <span class="hl">matching supply with demand</span>. Too much supply (idle workers, piles of stock) is costly; too little supply (long lines, stock-outs) irritates customers.</p>
<div class="callout analogy"><b>🍞 Everyday analogy</b>Think of a pizza place on Friday night. Too few cooks → customers wait 1 hour and leave (lost demand). Too many cooks on a slow Tuesday → you pay people to stand around (wasted supply). OM is the toolbox for getting this balance right.</div>`},
{h:"What makes customers willing to pay? (the “quality” side)",html:`
<p>In the Subway discussion the class broke <b>willingness to pay (WTP)</b> into four drivers:</p>
<table class="t"><tr><th>Driver</th><th>Meaning</th><th>Subway example</th></tr>
<tr><td><b>Variety / customization</b></td><td>Getting exactly what you want</td><td>Build-your-own sandwich, so you don't get bored</td></tr>
<tr><td><b>Performance quality</b></td><td>How <u>good</u> the product is</td><td>Taste of the recipe, courtesy of staff</td></tr>
<tr><td><b>Conformance quality</b></td><td>Delivering <u>consistently</u> what was promised</td><td>Same sandwich in Philly and Tokyo; food safety</td></tr>
<tr><td><b>Responsiveness / access</b></td><td>How fast and how conveniently</td><td>Short line, store nearby</td></tr></table>
<p>…and of course <b>price</b>. In a call center, the professor uses <b>responsiveness (short wait)</b> as the stand-in for willingness to pay.</p>`},
{h:"The trade-off: you usually can't have everything",html:`
<p>Example from the slides: Deutsche Bahn's call center. Goal: 80% of calls answered in &lt;20 sec. Reality: only 30%.</p>
<ul><li>To answer calls <span class="grn">very fast</span>, you need <b>many</b> agents → agents are often <span class="red">idle</span> → low labor productivity (high $ per call).</li>
<li>To keep agents <span class="grn">always busy</span> (cheap per call) → customers <span class="red">wait long</span>.</li></ul>
<div class="callout why"><b>💡 Why does the trade-off exist?</b>Because demand is uneven and random (more on this in WAIT). Spare capacity is the only way to be fast when a burst of calls comes in, and spare capacity costs money. So <u>fast service = paying for idle time</u>.</div>
<p>A firm picks a <b>strategic position</b>: Ryanair (super cheap, no frills) vs. Lufthansa (pricier, better service). Toyota vs. Ferrari. Vanguard vs. UBS private banking. <b>Neither is “wrong”</b>; they made different trade-offs.</p>`},
{h:"The efficiency frontier (the most important picture of this module)",html:`
<p>Put every firm in an industry on a chart: <b>x-axis = efficiency</b> (low cost per unit; to the right is better) and <b>y-axis = quality / responsiveness</b> (up is better). <span class="k">Up and to the right is good.</span></p>
${V("frontier",{pts:[{x:.3,y:.86,l:"Competitor A",c:"#2a63c7"},{x:.8,y:.43,l:"Competitor B",c:"#2a63c7"},{x:.58,y:.66,l:"Competitor C",c:"#2a63c7"},{x:.36,y:.38,l:"Our firm (inefficient)",c:"#c0392b"}],arrows:[[.37,.4,.55,.62]],cap:"Firms on the teal line are on the frontier. Our firm (red) is <b>below</b> it: Competitor C beats it on BOTH axes."})}
<div class="callout key"><b>📌 Definitions (straight from the summary slide)</b>
<b>Pareto dominated</b> = another firm is <u>better on all dimensions</u> (at least as good on each, better on one).<br>
<b>Efficiency frontier</b> = the set of firms that are <u>not Pareto dominated</u> by any other firm.</div>
<p>How to use it:</p>
<ol><li><b>Below the frontier?</b> You have <span class="red">inefficiencies</span>. Some competitor is better at everything. Fix the inefficiency: “Don't just manage the current system, <u>change it</u>!”</li>
<li><b>On the frontier?</b> You can only move <u>along</u> it (trade cost for quality) unless you <b>innovate</b>, which shifts the whole frontier outward.</li></ol>
<div class="callout case"><b>📂 Class example: benchmarking the DB call center</b>
Competitor <b>A</b>: better service but more expensive → that's a <u>different strategy</u>, not proof you're bad.<br>
Competitor <b>B</b>: cheaper but worse service → also a different strategy.<br>
Competitor <b>C</b>: better on <u>both</u> → <b>this</b> is the right benchmark; it shows you are inefficient.</div>
<div class="callout case"><b>✈️ Airline data (yield vs. cost per revenue passenger mile, RPM)</b>
Yield = total revenue / RPM; operating expense = total cost / RPM. Three airlines: 0.077 / 0.059, 0.165 / 0.141, 0.231 / 0.228 ($ per mile). The low-cost, low-yield one is the no-frills carrier (Ryanair-type); the high-cost, high-yield one is the full-service carrier (Lufthansa-type); Southwest sits in between. All three can be profitable because each sits on the frontier at a different spot.</div>`},
{h:"Why isn't everyone on the frontier? The 3 system inhibitors",html:`
<p>The professor's answer: three things hold operations back.</p>
<table class="t"><tr><th>Inhibitor</th><th>Plain-English meaning</th><th>Examples from class</th></tr>
<tr><td>🗑️ <b>Waste</b></td><td>Using inputs/resources that <u>add no value for the customer</u></td><td>German NH90 helicopters: <b>75</b> owned, 44 with the army, only <b>9</b> flyable, <b>1</b> in the air (~$50M each!). Food lost along the farm-to-table chain.</td></tr>
<tr><td>🎲 <b>Variability</b></td><td><u>Changes in demand or supply</u> over time</td><td><b>Demand:</b> random customer arrivals, COVID collapse of air travel, different requests. <b>Supply:</b> some ER doctors take 3h per patient, others 6h (severity-adjusted); fatigue, absenteeism, breakdowns, defects.</td></tr>
<tr><td>🧱 <b>Inflexibility</b></td><td>The <u>inability to react quickly and cheaply</u> to new information (flexibility = ability to react to variability)</td><td><b>Volume flexibility</b>: Uber's surge pricing brings out more drivers at peak (taxis with $1M medallions can't flex). <b>Mix flexibility</b>: can an engine plant also build EVs? (Industry learned: focused plants beat mixed plants.)</td></tr></table>
<div class="callout analogy"><b>🍞 Memory hook: “W-V-I”</b><b>W</b>aste = throwing stuff away. <b>V</b>ariability = surprises. <b>I</b>nflexibility = can't adjust to the surprises. Variability only hurts you <i>because</i> you are inflexible.</div>`},
{h:"Innovation & AI shift the frontier",html:`
<p>New technology (e.g., GenAI in a call center) can move the <b>whole frontier</b> up and to the right. Questions to ask: <u>Who</u> benefits? <u>How</u> (cheaper, or better quality)? Does it give a lasting advantage or will everyone copy it?</p>
${V("frontier",{curve2:[[.2,1],[.5,.93],[.75,.75],[.92,.5],[1,.25]],pts:[{x:.58,y:.66,l:"Today",c:"#0f7b6c"},{x:.72,y:.8,l:"With AI",c:"#6b46c1"}],arrows:[[.59,.67,.7,.78]],cap:"Innovation shifts the frontier. A firm can use the shift for lower cost, higher quality, or both."})}
<table class="t"><tr><th>Case (4 AI studies in class)</th><th>How much did the frontier move?</th></tr>
<tr><td>Taking the OIDD6110 exam (Terwiesch)</td><td><b>Huge</b>: GPT-3.5 got a B/B- (≈80–85%); newer models get A+ in under 10 minutes vs. 2 hours for students</td></tr>
<tr><td>BCG consultants (Dell'Acqua / Mollick)</td><td><b>+40% quality, +20% productivity</b></td></tr>
<tr><td>Alibaba customer support (Ni et al.)</td><td><b>Small</b>: 540 → 500 sec per request; % unhappy customers barely changed (0.43 vs 0.40)</td></tr>
<tr><td>Therapists' notes drafted by ChatGPT (Liu, Song, Terwiesch)</td><td><b>≈ none</b>: editing the draft took as long as writing it</td></tr></table>
<div class="callout why"><b>💡 The lesson</b>AI's impact depends on <u>how it's built into the workflow</u> (process design), not just on how smart the model is. Hybrid “human + AI” processes can end up neither cheap nor high-quality (radiology today). The professor: AI "might help us, but will not fix all problems."</div>`}
],
formulas:[],
worked:[
{title:"Who is on the efficiency frontier?",setup:`Five call centers. Cost per call (lower = better) and average wait (lower = better):<br>
<table class="t" style="max-width:420px"><tr><th>Firm</th><th>$ / call</th><th>Wait (sec)</th></tr><tr><td>P</td><td>4.00</td><td>20</td></tr><tr><td>Q</td><td>3.00</td><td>60</td></tr><tr><td>R</td><td>4.50</td><td>45</td></tr><tr><td>S</td><td>2.50</td><td>120</td></tr><tr><td>T</td><td>3.20</td><td>90</td></tr></table>`,
steps:[
{ask:"What does “better” mean on each axis here?",ans:"Lower cost per call is better; lower waiting time is better. (Careful: on these, <b>smaller</b> numbers are better.)",why:"Always check the direction first. A frontier question is just a comparison, but flipping a direction ruins it."},
{ask:"Check R: is anyone at least as good on BOTH?",ans:"P costs $4.00 < $4.50 <b>and</b> waits 20 < 45 sec. So <span class='red'>R is Pareto dominated by P</span> → R is <u>not</u> on the frontier.",why:"Dominated = someone beats you on every dimension."},
{ask:"Check T.",ans:"Q costs $3.00 < $3.20 and waits 60 < 90. <span class='red'>T is dominated by Q.</span>"},
{ask:"Check P, Q, S.",ans:"P has the shortest wait (nobody beats it on wait). S is the cheapest (nobody beats it on cost). Q: is anyone cheaper AND faster? Only S is cheaper, but S is slower; only P is faster, but P is pricier. So <span class='grn'>P, Q, S are on the frontier</span>."},
{ask:"What should R's managers do?",ans:"R should study P (or Q). It is inefficient, so it can improve both cost and wait. P, Q and S simply chose different strategic trade-offs.",why:"Below-frontier firms have waste/variability/inflexibility to fix; frontier firms can only trade off or innovate."}]},
{title:"Classify the inhibitor",setup:"For each situation, decide: waste, variability, or inflexibility?",steps:[
{ask:"A hospital's MRI machine sits empty 3 hours a day while patients wait weeks.",ans:"<b>Waste</b> (idle resource time that adds no value). Could also involve poor scheduling (inflexibility).",why:"Paid-for capacity not producing value is the textbook definition of waste."},
{ask:"Customers arrive at a bank at random: sometimes 1 per minute, sometimes 10.",ans:"<b>Variability</b> (demand variability: random arrivals)."},
{ask:"Taxi fleet can't add cars on New Year's Eve because each car needs a $1M medallion.",ans:"<b>Inflexibility</b> (no volume flexibility).",why:"The demand spike is variability; the <u>inability to respond</u> is inflexibility."},
{ask:"A plant can build only one car model; when demand shifts to EVs it can't adapt.",ans:"<b>Inflexibility</b> (no mix flexibility)."},
{ask:"Some ER doctors take twice as long per (similar) patient as others.",ans:"<b>Variability</b> (supply variability: processing times differ)."}]}
],
checks:[
{id:"in1",q:"Firm X is worse than Firm Y on cost AND on quality. Which statement is correct?",opts:["X is on the efficiency frontier","X is Pareto dominated by Y, so X is not on the frontier","Y is Pareto dominated by X","Both could be on the frontier"],a:1,why:"Pareto dominated = worse on all dimensions. The frontier consists only of firms nobody dominates."},
{id:"in2",q:"A firm ON the efficiency frontier wants better quality without higher cost. What does it need?",opts:["Eliminate waste","Innovation that shifts the frontier","Lower its prices","Nothing: frontier firms can always improve both"],a:1,why:"On the frontier there is no waste left to remove for free, so moving along it trades cost for quality. Only innovation (new technology/process) moves the frontier itself."},
{id:"in3",q:"Which is NOT one of the three system inhibitors?",opts:["Waste","Variability","Inflexibility","Labor cost"],a:3,why:"The three are Waste, Variability, Inflexibility (W-V-I). Labor cost is an outcome, not an inhibitor."},
{id:"in4",q:"“Flexibility” is defined in the course as…",opts:["Having many product types","The operation's ability to react to variability","Having low utilization","Being on the frontier"],a:1,why:"Flexibility = ability to react to variability. Inflexibility = inability to change quickly and cheaply in response to new information."},
{id:"in5",q:"Uber's surge pricing that brings more drivers on the road at peak times is an example of…",opts:["Mix flexibility","Volume flexibility","Waste reduction","Conformance quality"],a:1,why:"Adjusting capacity (how much) to demand = volume flexibility. Mix flexibility = using the same resources for different kinds of requests."},
{id:"in6",q:"A car plant that can produce both gasoline cars and EVs on the same line has…",opts:["Volume flexibility","Mix flexibility","Low variability","High waste"],a:1,why:"Same resources serving different customer requests = mix flexibility."},
{id:"in7",q:"In a call center, why does very short waiting time usually mean low labor productivity?",opts:["Fast agents make more mistakes","You need spare (often idle) agents to absorb random bursts of calls","Short calls cost more per minute","Customers who don't wait buy less"],a:1,why:"Demand is random. To answer quickly during bursts you must staff above average demand, so agents are idle at other times, and you pay for that idle time."},
{id:"in8",q:"Which AI case showed almost NO frontier shift?",opts:["ChatGPT taking the OIDD 6110 exam","BCG consultants using GPT-4","Therapists editing ChatGPT-drafted patient notes","None, all showed big shifts"],a:2,why:"Editing the AI draft took about as long as writing from scratch. Lesson: impact depends on process design."},
{id:"in9",q:"Conformance quality means…",opts:["How luxurious the product is","Consistently delivering what was promised/designed","How fast the service is","How many options the customer has"],a:1,why:"Performance quality = how good the design is; conformance quality = delivering to that design consistently (every time, everywhere)."},
{id:"in10",q:"Benchmarking shows Competitor A has better service but higher cost than you. What's the right conclusion?",opts:["You are inefficient","A made a different strategic trade-off; it's not proof you're inefficient","A is inefficient","You should copy A immediately"],a:1,why:"Only a competitor better on BOTH dimensions (like Competitor C) proves you're below the frontier."}
],
calcs:[],
cases:`<div class="callout case"><b>📂 Mortgage exercise (Session 1)</b>Teams processed 49 paper loan files in 10 minutes with three “technologies”: paper only, spreadsheets + electronic transfer, AI models. Each team was then plotted on <b>quality (% decisions correct)</b> vs <b>efficiency (# loans completed)</b>: that's an efficiency frontier built live in class. Loan rule: approve if LTV &lt; 85%, OR LTV in [85%,100%] AND front ratio &lt; 25% AND back ratio &lt; 35%. LTV = loan amount / min(purchase price, appraisal).</div>
<div class="callout case"><b>📂 Call center (Picadilly Bank)</b>The SVP wants human phone service for loyalty (WTP side); the CDO wants AI (efficiency side). That's the frontier trade-off: <a href="#case/callcenter">see the case →</a></div>`,
traps:["Don't call a firm “inefficient” just because one competitor beats it on ONE axis. You need a firm that's better on ALL axes (Pareto dominance).","Watch axis directions. Cost/time axes are often drawn so that “right/up = good” means LOWER cost, as on the slides where $/call decreases to the right."],
prof:["“Firms must either innovate or navigate trade-offs between cost and quality.” OM's job: get a firm onto the frontier, then push the frontier out.","Many firms think of AI only as headcount reduction. The professor's view: start from the customer experience (connected strategy)."]
});
})();
