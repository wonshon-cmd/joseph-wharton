(function(){const V=OM.V,fr=OM.fr,fmt=OM.fmt;
function N(z){const t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2);let p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p;}OM.normcdf=N;
OM.modules.push({
id:"quality",n:10,code:"QUALITY",icon:"✅",color:"#16a085",title:"Quality: Six Sigma, Jidoka, Fool-proofing",
status:"📗 textbook-based · slides not uploaded yet",
blurb:"Process capability (Cp), six sigma, defect probabilities, control charts, Jidoka (detect-stop-alert), poka-yoke, root-cause tools, yield and rework.",
intro:"Taught in Session 4 (Nov 20). Until the QUALITY slides arrive, this follows the Cachon &amp; Terwiesch textbook chapter on quality and the TPS quality pillar shown in the LEAN slides. <b>It will be updated when you upload the slides.</b>",
objectives:["Compute <b>process capability</b> C<sub>p</sub> and the probability of a defect","Explain what “<b>six sigma</b>” means","Read a <b>control chart</b> and tell common-cause from assignable-cause variation","Explain <b>Jidoka</b>, the Andon cord and <b>poka-yoke</b>, and root-cause tools (fishbone, Pareto)","Connect quality to flow: <b>yield, rework, and where to inspect</b>"],
lesson:[
{h:"Two kinds of quality, and why variation is the enemy",html:`
<p>From INTRO: <b>performance quality</b> (how good the design is) vs <b>conformance quality</b> (delivering the design consistently). This module is about <u>conformance</u>: making every unit within specification.</p>
<p>Every process varies a little (fill volumes, delivery times, call lengths). A <b>defect</b> happens when the outcome falls outside the <b>specification limits</b> the customer accepts: <b>LSL</b> (lower) and <b>USL</b> (upper).</p>
${V("normal",{mu:500,sd:2,lsl:495,usl:505,label:"Juice bottles: mean 500 ml, st.dev 2 ml, spec 495–505 ml"})}
<div class="callout why"><b>💡 Why focus on variation (σ)?</b>If the process is centered, defects come only from the tails of the distribution. Shrinking σ pushes the tails inside the limits, so defects drop dramatically.</div>`},
{h:"Process capability and six sigma",html:`
<div class="formula"><span class="eq">C<sub>p</sub> = ${fr("USL − LSL","6σ")}</span><div class="why">💡 How many “process widths” (6σ) fit inside the tolerance. C<sub>p</sub> = 1 → the limits sit at ±3σ; C<sub>p</sub> = 2 → ±6σ = <b>six sigma</b>.</div></div>
<table class="t"><tr><th>Limits at</th><th>C<sub>p</sub></th><th>Defect probability (centered process)</th></tr>
<tr><td>±2.5σ (bottle example: 5 ml / 2 ml)</td><td>0.83</td><td>1.24% (12,400 per million)</td></tr>
<tr><td>±3σ</td><td>1.0</td><td>0.27% (2,700 per million)</td></tr>
<tr><td>±6σ (“six sigma”)</td><td>2.0</td><td>≈ 0.002 per million (≈ 3.4 per million with the convention of a 1.5σ mean shift)</td></tr></table>
<div class="formula"><span class="eq">P(defect) = P(X &lt; LSL) + P(X &gt; USL) = Φ(${fr("LSL − μ","σ")}) + 1 − Φ(${fr("USL − μ","σ")})</span><div class="why">💡 Convert each limit into a z-score (how many σ away from the mean), look up the normal tail.</div></div>
<div class="callout trap"><b>⚠️ Off-center processes</b>C<sub>p</sub> assumes the mean is centered. If the mean drifts toward one limit, defects on that side rise fast even with the same σ.</div>`},
{h:"Control charts: is the process behaving normally?",html:`
<p>Take small samples over time, plot the sample mean. Draw control limits at <b>mean ± 3 × σ<sub>x̄</sub></b> (σ of the sample means = σ/√n).</p>
<ul><li><b>Common-cause variation</b>: normal random noise inside the limits → leave the process alone (tampering makes it worse).</li>
<li><b>Assignable-cause variation</b>: a point outside the limits (or a suspicious pattern like 7 in a row on one side) → something changed (new operator, worn tool) → stop and investigate.</li></ul>
<div class="callout key"><b>📌 Control limits ≠ specification limits</b>Control limits describe what the process <u>does</u>; spec limits describe what the customer <u>wants</u>. A process can be “in control” and still produce defects (if it's not capable).</div>`},
{h:"Jidoka, Andon & poka-yoke (TPS quality pillar)",html:`
<table class="t"><tr><th>Tool</th><th>What it is</th><th>Why it works</th></tr>
<tr><td><b>Jidoka</b> (detect–stop–alert)</td><td>Machines stop automatically on a defect (original jidoka from Toyoda's looms); workers pull the <b>Andon cord</b> to stop the assembly line</td><td>A defect is caught where it's made, before more value is added to a bad unit and before it reaches the customer. Stopping the line forces root-cause fixing.</td></tr>
<tr><td><b>Poka-yoke</b> (fool-proofing)</td><td>Design so the mistake is impossible or obvious: USB plug shape, car won't shift out of park without the brake, sponge counts in surgery</td><td>Prevents defects instead of inspecting for them.</td></tr>
<tr><td>Build-in quality (tsukurikomi), visual feedback</td><td>Quality is everyone's job at every step</td><td>Inspection at the end is expensive and late.</td></tr></table>
<div class="callout why"><b>💡 Where to inspect? (link to flow)</b>A defect found <u>late</u> wastes all the work done since it was created, and if it's found <u>after</u> the bottleneck it wasted bottleneck capacity. So inspect <b>before the bottleneck</b> and as early as possible. Rework loops add load to the resources they revisit (add rework minutes, like the 800 minutes of underwriting rework in Capital One).</div>`},
{h:"Finding root causes and improving",html:`
<ul><li><b>Pareto chart</b>: count defects by type, sort largest first; typically a few causes create most defects (80/20). Attack the top bars.</li>
<li><b>Fishbone (Ishikawa) diagram</b>: brainstorm causes by category (Man, Machine, Method, Material, Measurement, Environment).</li>
<li><b>5 Whys</b>: keep asking “why?” until you reach the real cause.</li>
<li><b>Kaizen / quality circles</b>: front-line workers run small, continuous improvement experiments (Taylor's scientific method + respect for workers' intellect).</li>
<li><b>Quartile analysis</b> (Capital One): compare top- vs bottom-quartile workers; a big gap means the process isn't standardized. Lift the bottom by teaching the best method.</li></ul>`}
],
formulas:[
{name:"Process capability",f:`C<sub>p</sub> = ${fr("USL − LSL","6σ")}`,why:"Six sigma ⇔ Cp = 2."},
{name:"Defect probability",f:"Φ((LSL−μ)/σ) + 1 − Φ((USL−μ)/σ)",why:"Two normal tails outside the specification."},
{name:"Control limits",f:"x̄ ± 3 σ/√n",why:"Points outside → assignable cause."},
{name:"Yield / rework",f:"Process yield = y<sub>1</sub> × … × y<sub>n</sub>; units to start = Q / yield",why:"From MULTI."}
],
worked:[
{title:"Juice bottle filling",setup:"Target 500 ml; specification 495–505 ml. Fill volumes are normal with mean 500 ml and st.dev 2 ml.",steps:[
{ask:"C<sub>p</sub>?",ans:"(505 − 495)/(6 × 2) = 10/12 = <b>0.83</b>.",why:"Less than 1 → not capable even at 3-sigma level."},
{ask:"z-scores of the limits?",ans:"(505 − 500)/2 = <b>+2.5</b>; (495 − 500)/2 = <b>−2.5</b>."},
{ask:"Probability of a defect?",ans:"2 × (1 − Φ(2.5)) = 2 × 0.0062 = <b>1.24%</b>."},
{ask:"What σ would make it a six-sigma process?",ans:"Need USL − LSL = 12σ → σ = 10/12 = <b>0.83 ml</b>.",why:"Cp = 2 ⇔ 12σ fit in the tolerance."}]},
{title:"Off-center mean",setup:"A shaft spec is 9.7–10.3 mm, σ = 0.1 mm. (a) Mean 10.0. (b) Mean drifts to 10.1.",steps:[
{ask:"(a) Cp and defect rate?",ans:"Cp = 0.6/0.6 = 1 → limits at ±3σ → <b>0.27%</b> defects."},
{ask:"(b) z-scores after the drift?",ans:"USL: (10.3 − 10.1)/0.1 = 2; LSL: (9.7 − 10.1)/0.1 = −4."},
{ask:"(b) Defect rate?",ans:"(1 − Φ(2)) + Φ(−4) = 0.0228 + 0.00003 ≈ <b>2.3%</b>: almost 9× worse with the same σ.",why:"Centering matters as much as spread."}]}
],
checks:[
{id:"qu1",q:"Six sigma means the specification limits are…",opts:["±1σ from the mean","±3σ from the mean","±6σ from the mean (Cp = 2)","6% defects"],a:2,why:"Cp = (USL−LSL)/6σ = 12σ/6σ = 2."},
{id:"qu2",q:"Jidoka refers to…",opts:["Fool-proofing","Detect–stop–alert: stopping when a defect occurs","Kanban cards","Continuous improvement"],a:1,why:"Machines stop on defects; workers pull the Andon cord."},
{id:"qu3",q:"Poka-yoke is…",opts:["Statistical process control","Designing processes so mistakes can't happen (fool-proofing)","Mixed model production","A Japanese inventory system"],a:1,why:"E.g., a plug that only fits one way."},
{id:"qu4",q:"A point outside the control limits indicates…",opts:["Common-cause variation","Assignable-cause variation; investigate","The spec limits are wrong","Nothing"],a:1,why:"Control limits capture normal noise; outside means something changed."},
{id:"qu5",q:"Where should a quality inspection preferably go?",opts:["At the very end","Before the bottleneck / as early as possible","After the bottleneck","Nowhere"],a:1,why:"Don't waste bottleneck capacity (or downstream work) on units that are already defective."},
{id:"qu6",q:"Reducing σ while keeping the mean centered will…",opts:["Raise Cp and cut defects","Lower Cp","Not change defects","Move the spec limits"],a:0,why:"Cp = (USL−LSL)/6σ."}
],
calcs:[
{id:"quc1",q:"USL = 54, LSL = 46, σ = 1. Cp?",ans:1.33,unit:"",tol:0.02,steps:["(54 − 46)/(6 × 1) = 8/6 = <b>1.33</b>."]},
{id:"quc2",q:"Spec 20 ± 0.6 g, σ = 0.2 g, centered. Probability of a defect (%)?",ans:0.27,unit:"%",tol:0.02,steps:["Limits at ±0.6/0.2 = ±3σ.","2 × (1 − Φ(3)) = <b>0.27%</b>."]},
{id:"quc3",q:"Spec width USL − LSL = 3 mm. What σ (mm) is needed for six sigma?",ans:0.25,unit:"mm",tol:0.005,steps:["Six sigma: Cp = 2 → 3/(6σ) = 2 → σ = 3/12 = <b>0.25 mm</b>."]}
],
gens:[["qual_cp","Cp and defect probability"]],
cases:`<div class="callout case"><b>📂 Capital One</b>QA reviews every app; ~10% need rework back to the underwriter (rework minutes load the bottleneck). Top vs bottom quartile underwriters: 20 vs 61 minutes per app, a non-standardized process. <a href="#case/capone">See the case →</a></div>
<div class="callout case"><b>📂 Employee turnover → quality</b>(LITTLE) Electronics assembly: quality drops after pay day when experienced workers quit, about $150M/yr in yield losses.</div>`,
traps:["Mixing up control limits (process behavior) and specification limits (customer requirement).","Forgetting to count BOTH tails for a centered process."],
prof:["(Slides pending.) The LEAN slides list the TPS quality methods: poka-yoke, jidoka (machines; Andon cord in assembly), build-in quality, kaizen, Ishikawa, quartile analysis."]
});
OM.gens.qual_cp=function(){const mu=OM.rnd(20,200),sd=OM.pick([0.5,1,1.5,2,2.5]),k=OM.pick([1.5,2,2.5,3]);const lsl=mu-k*sd,usl=mu+k*sd;const ask=OM.pick(["cp","p"]);
  if(ask==="cp")return{q:`Specification ${lsl} to ${usl}; σ = ${sd}; centered at ${mu}. Cp?`,ans:(usl-lsl)/(6*sd),unit:"",tol:0.02,steps:[`Cp = (${usl} − ${lsl}) / (6 × ${sd}) = <b>${fmt((usl-lsl)/(6*sd),3)}</b>`]};
  const p=2*(1-N(k))*100;return{q:`Specification ${lsl} to ${usl}; σ = ${sd}; centered at ${mu}. Probability of a defect (%)?`,ans:p,unit:"%",tol:Math.max(0.02,p*0.03),steps:[`z = (${usl} − ${mu})/${sd} = ${k}`,`P = 2 × (1 − Φ(${k})) = <b>${fmt(p,3)}%</b>`]};};
})();
