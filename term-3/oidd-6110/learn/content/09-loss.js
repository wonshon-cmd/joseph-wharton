(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
function erl(r,m){let b=1;for(let k=1;k<=m;k++)b=r*b/(k+r*b);return b;}OM.erlang=erl;
OM.modules.push({
id:"loss",n:9,code:"LOSS",icon:"📵",color:"#8e44ad",title:"Lost Demand, Service Levels & Pooling",
status:"📗 textbook-based · slides not uploaded yet",
blurb:"When customers don't wait (busy = lost), use the Erlang loss formula. Service levels, how much capacity you need, and why pooling capacity is so powerful.",
intro:"Taught in Session 4 (Nov 20). Until the LOSS slides arrive this module follows the Cachon &amp; Terwiesch textbook chapter on <i>Service Levels and Lead Times / Erlang loss</i>. <b>It will be updated when you upload the slides.</b>",
objectives:["Distinguish <b>waiting</b> systems from <b>loss</b> systems","Compute the probability that all servers are busy with the <b>Erlang loss</b> formula/table","Compute flow rate, lost customers and utilization in a loss system","Explain the benefit of <b>pooling</b> capacity (and its limits)"],
lesson:[
{h:"Waiting vs. losing customers",html:`
<p>In WAIT, customers patiently queue (no one is lost). In many services, <b>if all servers are busy, the customer is gone</b>: an ambulance is diverted to another hospital, a caller hangs up, a rider takes a competitor's car, a hotel is full.</p>
<table class="t"><tr><th></th><th>Waiting system (WAIT)</th><th>Loss system (LOSS)</th></tr>
<tr><td>Buffer</td><td>Unlimited waiting room</td><td><b>No</b> buffer</td></tr>
<tr><td>Flow rate</td><td>= demand (if u &lt; 1)</td><td>&lt; demand: some customers lost</td></tr>
<tr><td>Key measure</td><td>Time in queue T<sub>q</sub></td><td>Probability of loss P<sub>m</sub></td></tr></table>
<div class="callout why"><b>💡 Why lose customers if average capacity is enough?</b>Same reason as in WAIT: <b>variability</b>. Sometimes 5 patients show up within an hour at a 3-bed trauma bay, even if the average is 2. Without a waiting room, the extras are turned away.</div>`},
{h:"The Erlang loss formula",html:`
<p>Notation: a = average inter-arrival time, p = average processing time, m = number of servers. Define the <b>offered load</b>:</p>
<div class="formula"><span class="eq">r = ${fr("p","a")}</span><div class="why">💡 How many servers would be busy, on average, if nobody were lost.</div></div>
<div class="formula"><span class="eq">P<sub>m</sub>(r) = ${fr("r<sup>m</sup> / m!","1 + r + r²/2! + … + r<sup>m</sup>/m!")}</span><div class="why">💡 Probability that all m servers are busy = probability an arriving customer is lost. In practice you read it from the <b>Erlang loss table</b> (rows r, columns m) or use the calculator below. Assumes random (Poisson) arrivals.</div></div>
<div class="formula"><span class="eq">Flow rate = ${fr("1","a")} × (1 − P<sub>m</sub>)</span> &nbsp; <span class="eq">Lost per time = ${fr("1","a")} × P<sub>m</sub></span> &nbsp; <span class="eq">Utilization = ${fr("Flow rate × p","m")}</span></div>
${OM.T("loss")}`},
{h:"Service level: how much capacity do I need?",html:`
<p>Managers set a target like “no more than 5% of ambulances diverted” (service level = 95%). Then find the smallest m with P<sub>m</sub>(r) ≤ 5%.</p>
${V("bars",{bars:[1,2,3,4,5,6,7].map(m=>({l:"m="+m,v:Math.round(erl(2,m)*1000)/10,t:fmt(erl(2,m)*100,1)+"%"})),line:5,linel:"5% target",yl:"P(loss) %",cap:"Offered load r = 2 (e.g., p = 60 min, a = 30 min). You need m = 5 to get below 5% loss, more than twice the average load of 2."})}
<div class="callout why"><b>💡 Why so much spare capacity?</b>To turn away few customers you must cover the random peaks, not the average. That's the cost-quality trade-off from INTRO: high service level = low utilization.</div>`},
{h:"Pooling: share capacity across demand streams",html:`
<p><b>Pooling</b> = combining separate resources (and their demand) into one shared system: one queue for all tellers, regional instead of local trauma centers, cross-trained call-center agents who take all call types.</p>
<table class="t"><tr><th>Example</th><th>Separate</th><th>Pooled</th></tr>
<tr><td>Loss: two trauma centers, each r = 2, m = 3</td><td>P(loss) = 21.1% each</td><td>One center r = 4, m = 6 → <b>11.7%</b></td></tr>
<tr><td>Waiting: two single servers, a = 5, p = 4 (u = 80%, CV = 1)</td><td>T<sub>q</sub> = 16 min</td><td>One 2-server queue (a = 2.5) → <b>T<sub>q</sub> ≈ 7.2 min</b></td></tr></table>
<div class="callout why"><b>💡 Why does pooling work?</b>When one server is swamped, another one is often idle. Separate systems can't share that idle capacity; pooled ones can. Peaks in one stream are offset by lulls in another, so total variability is relatively smaller.</div>
<div class="callout trap"><b>⚠️ Limits of pooling</b>Pooled resources must be <b>flexible</b> (cross-trained agents are more expensive and may be slower on each type); bigger pooled systems can mean longer travel (regional hospital), loss of specialization or customer relationships. The insurance executive in the Call Center case: cross-training raised productivity.</div>
<p><b>New business models</b> often exploit pooling: Uber/ride-hailing pools drivers across a city; cloud computing pools servers across customers; shared call-center platforms pool agents across clients.</p>`}
],
formulas:[
{name:"Offered load",f:`r = ${fr("p","a")}`,why:"Average # busy servers if no one were lost."},
{name:"Erlang loss (prob. all busy)",f:`P<sub>m</sub>(r) = ${fr("r<sup>m</sup>/m!","Σ<sub>k=0..m</sub> r<sup>k</sup>/k!")}`,why:"Use the table or calculator."},
{name:"Flow rate in a loss system",f:`R = ${fr("1","a")} (1 − P<sub>m</sub>)`,why:"Arrivals that find a free server."},
{name:"Lost customers",f:`${fr("1","a")} × P<sub>m</sub>`,why:"Arrivals that find all busy."}
],
worked:[
{title:"A 3-bed trauma bay",setup:"Trauma patients arrive every 30 min on average (random). Each occupies a bay for 60 min. There are 3 bays; if all are full, the ambulance is diverted.",steps:[
{ask:"Offered load r?",ans:"r = p/a = 60/30 = <b>2</b>.",why:"On average 2 bays would be busy."},
{ask:"Probability of diversion with m = 3?",ans:"P<sub>3</sub>(2) = (2³/3!) / (1 + 2 + 2²/2 + 2³/6) = 1.333/6.333 = <b>21.1%</b>."},
{ask:"Patients treated per hour?",ans:"Arrivals 2/hr × (1 − 0.211) = <b>1.58/hr</b>; lost ≈ 0.42/hr."},
{ask:"Utilization of the bays?",ans:"1.58 × 1 hr / 3 = <b>52.6%</b>.",why:"Only half busy, yet 1 in 5 patients is diverted. That's variability."},
{ask:"How many bays for ≤ 5% diversion?",ans:"P<sub>4</sub>(2) = 9.5%, P<sub>5</sub>(2) = 3.7% → <b>5 bays</b>."}]}
],
checks:[
{id:"lo1",q:"In a loss system, the flow rate is…",opts:["Equal to demand","Lower than demand because some customers find all servers busy","Equal to capacity","Higher than demand"],a:1,why:"R = (1/a)(1 − P_m)."},
{id:"lo2",q:"The offered load r = p/a represents…",opts:["The probability of loss","The average number of busy servers if nobody were lost","The utilization","The number of servers needed"],a:1,why:"Little's Law: arrival rate × time in service."},
{id:"lo3",q:"Pooling two identical call centers into one generally…",opts:["Increases waiting time","Reduces waiting time / loss for the same total staff","Has no effect","Only helps if demand is deterministic"],a:1,why:"Idle capacity in one part can serve peaks in the other."},
{id:"lo4",q:"A downside of pooling is…",opts:["Higher variability","Resources must be flexible (cross-trained), possibly less specialized/efficient","More idle time","It only works in manufacturing"],a:1,why:"Pooling requires flexibility, which has costs."},
{id:"lo5",q:"To achieve a high service level (few lost customers), utilization will typically be…",opts:["Close to 100%","Well below 100%","Exactly 100%","Irrelevant"],a:1,why:"Spare capacity covers random peaks."}
],
calcs:[
{id:"loc1",q:"a = 20 min, p = 30 min. Offered load r?",ans:1.5,unit:"",steps:["r = p/a = 30/20 = <b>1.5</b>."]},
{id:"loc2",q:"r = 1.5 and m = 2 servers. Probability that all servers are busy (loss)?",ans:31.03,unit:"%",tol:0.4,steps:["P₂ = (r²/2) / (1 + r + r²/2) = 1.125 / (1 + 1.5 + 1.125) = 1.125/3.625 = <b>31.0%</b>."]},
{id:"loc3",q:"Same system (a = 20 min, r = 1.5, m = 2, P = 31.0%). Customers served per hour?",ans:2.07,unit:"per hr",tol:0.03,steps:["Arrival rate = 60/20 = 3/hr.","Served = 3 × (1 − 0.310) = <b>2.07/hr</b>."]},
{id:"loc4",q:"r = 3, m = 4. Probability of loss? (use the formula or the calculator)",ans:20.61,unit:"%",tol:0.4,steps:["Denominator = 1 + 3 + 4.5 + 4.5 + 3.375 = 16.375.","Numerator = 3⁴/4! = 81/24 = 3.375.","P₄(3) = 3.375/16.375 = <b>20.6%</b>."]}
],
gens:[["loss_p","Erlang loss probability"]],
cases:`<div class="callout case"><b>📂 Call Center at Picadilly</b>The insurance executive's comment about cross-training agents for multiple call types = pooling. Shantanu's idea to let a bot handle 20% of calls changes the demand the human pool sees. <a href="#case/callcenter">See the case →</a></div>`,
traps:["Using the waiting time formula in a loss system (or vice versa). Ask: do customers wait or leave?","Forgetting that flow rate < demand in a loss system."],
prof:["(Slides pending.) The course outline lists: lost demand, service levels, pooling capacity, new business models."]
});
OM.gens.loss_p=function(){const r=OM.pick([0.5,1,1.5,2,2.5,3,4]),m=OM.rnd(1,6);const P=erl(r,m);let den=0,f=1;const terms=[];for(let k=0;k<=m;k++){if(k)f*=k;terms.push(Math.pow(r,k)/f);den+=Math.pow(r,k)/f;}
  return{q:`Offered load r = ${r}, m = ${m} servers, no waiting room. Probability an arriving customer is lost?`,ans:P*100,unit:"%",tol:Math.max(0.3,P*100*0.02),steps:[`Terms r^k/k! for k = 0..${m}: ${terms.map(t=>fmt(t,3)).join(", ")}`,`Sum = ${fmt(den,3)}`,`P = last term / sum = ${fmt(terms[m],3)}/${fmt(den,3)} = <b>${fmt(P*100,2)}%</b>`]};};
})();
