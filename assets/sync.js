/* =====================================================================
   Joseph Wharton: cloud sync for all study apps on this site.
   Records live in ONE file in your PRIVATE GitHub repo (default
   wonshon-cmd/joseph-wharton-data → progress.json). Each device connects once
   with a fine-grained GitHub token (Contents: read & write on that repo only).
   Local browser storage stays as the fast/offline copy; changes push
   automatically, and other devices' changes are merged in (never lost).
   ===================================================================== */
(function(){
"use strict";
const CFG={
  // ⬇ Google Apps Script "save spot" (records saved in your Google Drive). Paste the /exec URL here.
  //   When set, EVERY device syncs automatically, no setup needed. (Same approach as the Pivot or Perish board.)
  gasUrl:"https://script.google.com/macros/s/AKfycbx1HaXM_vS0detYh_ylZQN8lxhqQ6maKiP2RekmvI7NhWjRicJtaQImCoUcPXvk2f5O/exec",
  // Alternative backend: private GitHub repo + per-device token (used only if gasUrl is empty).
  owner:"wonshon-cmd",repo:"joseph-wharton-data",path:"progress.json",branch:"main",
  // localStorage keys to sync, with how to merge them:
  //  "history" = practice-app records: union of every attempt from every device
  //  "lww"     = whole value, newest edit wins
  keys:{"mktg6110_site_v1":"history","mktg6110_prep_v1":"lww","oidd6110_learn_v1":"history","fnce6130_bc_v1":"lww"}};
const SK="jw_sync", MK="jw_meta";
const script=document.currentScript;const BASE=(script&&script.src)?script.src.replace(/assets\/sync\.js.*$/,""):"/";
const _get=Storage.prototype.getItem, _set=Storage.prototype.setItem, _rm=Storage.prototype.removeItem;
const LSget=k=>_get.call(localStorage,k);
const LSset=(k,v)=>_set.call(localStorage,k,v);
const jparse=s=>{try{return s==null?null:JSON.parse(s)}catch(e){return null}};
const cfg=()=>jparse(LSget(SK))||{};const saveCfg=c=>LSset(SK,JSON.stringify(c));
const meta=()=>{const m=jparse(LSget(MK))||{};m.updatedAt=m.updatedAt||{};return m};const saveMeta=m=>LSset(MK,JSON.stringify(m));
let applying=false, pushTimer=null, busy=false, again=false, state="off", lastErr="";

// ---------- hook writes so every app syncs without changes to its own code ----------
Storage.prototype.setItem=function(k,v){_set.call(this,k,v);if(this===localStorage&&!applying&&CFG.keys[k]){const m=meta();m.updatedAt[k]=Date.now();saveMeta(m);schedule();}};
Storage.prototype.removeItem=function(k){_rm.call(this,k);if(this===localStorage&&!applying&&CFG.keys[k]){const m=meta();m.updatedAt[k]=Date.now();saveMeta(m);schedule();}};

// ---------- base64 <-> UTF-8 ----------
const b64e=str=>{const b=new TextEncoder().encode(str);let s="";for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)};
const b64d=b64=>{const s=atob(String(b64).replace(/\s/g,""));const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return new TextDecoder().decode(b)};

// ---------- backends ----------
const useGas=()=>!!CFG.gasUrl;
const enabled=()=>useGas()||!!cfg().token;
async function gasGet(){const r=await fetch(CFG.gasUrl+(CFG.gasUrl.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"});if(!r.ok)throw httpErr(r.status,"Google save spot error "+r.status);const txt=await r.text();let j;try{j=JSON.parse(txt)}catch(e){throw httpErr(502,"Google returned a page instead of data. Open the ☁️ Sync page and click “Test save spot”.")}if(j.ok===false)throw httpErr(500,j.error||"Google save spot error");return{sha:j.rev||0,data:j.data||{keys:{}}};}
async function gasPut(data,rev){const r=await fetch(CFG.gasUrl,{method:"POST",body:JSON.stringify({baseRev:rev,data})});if(!r.ok)throw httpErr(r.status,"Google save spot error "+r.status);const txt=await r.text();let j;try{j=JSON.parse(txt)}catch(e){throw httpErr(502,"Google returned a page instead of data when saving. Open the ☁️ Sync page and click “Test save spot”.")}if(j.conflict)throw httpErr(409,"conflict");if(j.ok===false)throw httpErr(500,j.error||"save failed");if(typeof j.rev!=="number"||j.rev<=rev)throw httpErr(502,"Google answered but didn't save. The deployment may be an old version: in Apps Script, Deploy → Manage deployments → ✏️ → Version: New version → Deploy.");return j.rev;}
// ---------- GitHub contents API ----------
function api(path,opt){const c=cfg();return fetch("https://api.github.com"+path,Object.assign({cache:"no-store"},opt||{},{headers:Object.assign({"Accept":"application/vnd.github+json","Authorization":"Bearer "+c.token,"X-GitHub-Api-Version":"2022-11-28"},(opt&&opt.headers)||{})}));}
const fileUrl=()=>`/repos/${CFG.owner}/${CFG.repo}/contents/${CFG.path}`;
async function getRemote(){if(useGas())return gasGet();const r=await api(fileUrl()+"?ref="+CFG.branch+"&t="+Date.now());
  if(r.status===404){const rr=await api(`/repos/${CFG.owner}/${CFG.repo}`);if(rr.status===404)throw httpErr(404,"Can't find the private repo "+CFG.owner+"/"+CFG.repo+" (or the token can't see it).");return{sha:null,data:{keys:{}}};}
  if(!r.ok)throw httpErr(r.status,await r.text());const j=await r.json();return{sha:j.sha,data:jparse(b64d(j.content))||{keys:{}}};}
async function putRemote(data,sha){if(useGas())return gasPut(data,sha);const body={message:"Sync progress "+new Date().toISOString(),content:b64e(JSON.stringify(data)),branch:CFG.branch};if(sha)body.sha=sha;
  const r=await api(fileUrl(),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!r.ok)throw httpErr(r.status,await r.text());return (await r.json()).content.sha;}
function httpErr(st,msg){const e=new Error(msg);e.status=st;return e}

// ---------- merging ----------
function unionByTs(a,b){const map=new Map();(a||[]).forEach(x=>map.set(x.ts,Object.assign({},x)));(b||[]).forEach(x=>{const y=map.get(x.ts);map.set(x.ts,y?Object.assign({},x,y,{ai:y.ai!=null?y.ai:x.ai,aiFb:y.aiFb||x.aiFb}):Object.assign({},x));});return [...map.values()].sort((p,q)=>p.ts-q.ts);}
function mergeHistory(L,R){L=L||{};R=R||{};const reset=Math.max(L.resetAt||0,R.resetAt||0);const out={mc:{},sa:{},drafts:{},settings:Object.assign({},L.settings||{})};if(reset)out.resetAt=reset;
  for(const f of ["mc","sa"]){const ks=new Set([...Object.keys(L[f]||{}),...Object.keys(R[f]||{})]);ks.forEach(k=>{const v=unionByTs((L[f]||{})[k],(R[f]||{})[k]).filter(x=>x.ts>=reset);if(v.length)out[f][k]=v;});}
  const dk=new Set([...Object.keys(L.drafts||{}),...Object.keys(R.drafts||{})]);dk.forEach(k=>{const v=(L.drafts||{})[k]||(R.drafts||{})[k];if(v)out.drafts[k]=v;});
  if(!out.settings.apiKey&&R.settings&&R.settings.apiKey)out.settings.apiKey=R.settings.apiKey;
  return out;}
function stripSecrets(key,val){if(!val||CFG.keys[key]!=="history")return val;const v=JSON.parse(JSON.stringify(val));const c=cfg();
  if(!c.syncKey||useGas()){if(v.settings)delete v.settings.apiKey;}return v;}
const stable=v=>{if(v===undefined)return "null";if(v===null||typeof v!=="object")return JSON.stringify(v);if(Array.isArray(v))return "["+v.map(stable).join(",")+"]";return "{"+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";};
const sizeOf=v=>v==null?0:JSON.stringify(v).length;

// ---------- one sync cycle ----------
async function syncNow(opts){opts=opts||{};const c=cfg();if(!enabled()){setState("off");return{changed:false}}
  if(busy){again=true;return{changed:false}}busy=true;setState("syncing");let changedLocal=false;
  try{for(let attempt=0;attempt<3;attempt++){
      const rem=await getRemote();const m=meta();const out={version:1,updated:Date.now(),keys:Object.assign({},rem.data.keys||{})};
      for(const key of Object.keys(CFG.keys)){const lraw=LSget(key);const lv=jparse(lraw);const lt=m.updatedAt[key]||0;const re=(rem.data.keys||{})[key];const rv=re?re.value:null;const rt=re?re.updatedAt||0:0;
        let merged,mt;
        if(CFG.keys[key]==="history"){merged=(lv||rv)?mergeHistory(lv,rv):null;mt=Math.max(lt,rt);}
        else{ if(!re){merged=lv;mt=lt||(lv?Date.now():0);}
              else if(!c.lastSync&&lv&&rv&&!lt){merged=sizeOf(lv)>=sizeOf(rv)?lv:rv;mt=Date.now();}   // first connect: keep the copy with more progress
              else if(lt>rt){merged=lv;mt=lt;} else {merged=rv;mt=rt;} }
        if(stable(merged)!==stable(lv)&&!(merged==null&&lraw==null)){applying=true;try{if(lraw!=null)LSset("jw_prev:"+key,JSON.stringify({ts:Date.now(),raw:lraw}));if(merged==null)_rm.call(localStorage,key);else LSset(key,JSON.stringify(merged));}finally{applying=false}changedLocal=true;}
        m.updatedAt[key]=mt;if(merged!=null||re)out.keys[key]={updatedAt:mt,value:stripSecrets(key,merged)};}
      saveMeta(m);
      const same=stable(out.keys)===stable(rem.data.keys||{});
      if(!same){try{await putRemote(out,rem.sha);}catch(e){if((e.status===409||e.status===422)&&attempt<2)continue;throw e;}}
      break;}
    const cc=cfg();cc.lastSync=Date.now();saveCfg(cc);lastErr="";setState("ok");
    if(changedLocal){window.dispatchEvent(new CustomEvent("jw-sync-updated"));const rk="jw_reloaded:"+location.pathname;if(opts.initial&&Date.now()-(+sessionStorage.getItem(rk)||0)>15000){sessionStorage.setItem(rk,String(Date.now()));location.reload();}else if(!opts.initial)banner();}
    return{changed:changedLocal};
  }catch(e){lastErr=explain(e);setState(navigator.onLine===false||/^Offline/.test(lastErr)?"offline":"error");return{changed:false,error:lastErr};}
  finally{busy=false;if(again){again=false;schedule(300);}}}
function explain(e){const st=e&&e.status;if(useGas()&&st)return(st===502?e.message:"The Google save spot answered with an error ("+st+"). Open the ☁️ Sync page and click “Test save spot”.");if(st===401)return"GitHub rejected the token (expired or wrong). Reconnect on the Sync page.";if(st===403)return"The token isn't allowed to write to the data repo. Recreate it with Contents: Read and write.";if(st===404)return e.message;if(/Failed to fetch|NetworkError|Load failed/i.test(String(e&&e.message)))return"Offline. Your progress is safe on this device and will sync when you're back online.";return"Sync problem: "+String(e&&e.message||e).slice(0,160);}
function schedule(ms){if(!enabled())return;clearTimeout(pushTimer);setState("pending");pushTimer=setTimeout(()=>syncNow(),ms==null?1500:ms);}

// ---------- status chip ----------
let chip=null;
function setState(s){state=s;if(!chip)return;const c=cfg();const t=c.lastSync?new Date(c.lastSync).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"";
  const L={off:"☁️ Turn on cloud sync",syncing:"☁️ Syncing…",pending:"☁️ Saving…",ok:"☁️ Synced "+t,offline:"📴 Offline · will sync",error:"⚠️ Sync issue"};
  chip.textContent=L[s]||s;chip.title=lastErr||"Cloud sync status (click for details)";chip.style.background=s==="error"?"#b42b2a":s==="off"?"#55534e":"#011f5b";}
function banner(){if(document.getElementById("jw-banner"))return;const d=document.createElement("div");d.id="jw-banner";d.className="jw-noprint";
  d.style.cssText="position:fixed;top:0;left:0;right:0;z-index:10000;background:#011f5b;color:#fff;padding:10px 14px;font:600 14px/1.3 -apple-system,Segoe UI,Arial,sans-serif;text-align:center";
  d.innerHTML='New progress arrived from another device. <button style="margin-left:8px;font:inherit;padding:4px 10px;border-radius:8px;border:0;cursor:pointer">Refresh to see it</button>';d.querySelector("button").onclick=()=>location.reload();document.body.appendChild(d);}
function mountChip(){if(chip||!document.body||document.body.dataset.nochip)return;chip=document.createElement("a");chip.href=BASE+"sync.html";chip.className="jw-noprint";
  chip.style.cssText="position:fixed;right:10px;bottom:10px;z-index:9999;color:#fff;font:700 13px/1 -apple-system,Segoe UI,Arial,sans-serif;padding:8px 12px;border-radius:999px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.25)";
  document.body.appendChild(chip);const st=document.createElement("style");st.textContent="@media print{.jw-noprint{display:none!important}}";document.head.appendChild(st);setState(enabled()?(state==="off"?"syncing":state):"off");}

// ---------- device setup link (#jwsync=TOKEN) ----------
(function(){const m=(location.hash||"").match(/jwsync=([^&]+)/);if(m){const c=cfg();c.token=decodeURIComponent(m[1]);delete c.lastSync;saveCfg(c);history.replaceState(null,"",location.pathname+location.search);}})();

// ---------- public API for the Sync page ----------
const VERSION="2026-10-29d";
async function diagnose(){const out={version:VERSION,backend:useGas()?"google":"github",url:CFG.gasUrl};
  if(!useGas())return out;
  try{const r=await fetch(CFG.gasUrl+(CFG.gasUrl.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"});out.getStatus=r.status;const txt=await r.text();out.getBody=txt.slice(0,400);
    let j=null;try{j=JSON.parse(txt)}catch(e){}
    if(!j){out.verdict=/sign in|signin|accounts\.google/i.test(txt)?"Google asked for a sign-in: set the deployment's “Who has access” to “Anyone” (not “Anyone with Google account”), then Deploy → Manage deployments → ✏️ → New version → Deploy.":/authoriz/i.test(txt)?"The script isn't authorized yet: open the script, pick doGet in the function menu, click ▶ Run and Allow; then Deploy → Manage deployments → ✏️ → New version → Deploy.":"Google returned a page instead of data. Copy the text below and send it to Claude.";return out;}
    out.getOk=j.ok;out.rev=j.rev;
    const r2=await syncNow();out.syncError=r2.error||null;
    if(r2.error){out.verdict="Reading works, saving failed: "+r2.error;}
    else{const v=await gasGet();const want=Object.keys(CFG.keys).filter(k=>LSget(k)!=null);const missing=want.filter(k=>!(v.data.keys||{})[k]);out.rev2=v.sha;
      out.verdict=missing.length?("⚠️ Google didn't keep the data (missing: "+missing.join(", ")+"). In Apps Script: Deploy → Manage deployments → ✏️ → Version: New version → Deploy, then test again."):("✅ Save spot works: saved and read back OK (version "+v.sha+").");}
  }catch(e){out.error=String(e&&e.message||e);out.verdict="The browser couldn't reach Google (blocked or offline). If you use an ad/tracker blocker or a work/school network filter, allow script.google.com and script.googleusercontent.com.";}
  return out;}
function restorePrev(){let n=0;for(const key of Object.keys(CFG.keys)){const b=jparse(LSget("jw_prev:"+key));if(b&&b.raw){applying=true;try{LSset(key,b.raw)}finally{applying=false}const m=meta();m.updatedAt[key]=Date.now();saveMeta(m);n++;}}schedule(200);return n;}
window.JWSync={VERSION,diagnose,restorePrev,CFG,enabled,useGas,cfg,saveCfg,syncNow,state:()=>state,lastErr:()=>lastErr,setupLink:()=>BASE+"sync.html#jwsync="+encodeURIComponent(cfg().token||""),
  connect:async token=>{const c=cfg();c.token=token.trim();delete c.lastSync;saveCfg(c);const r=await syncNow();if(r.error){return r;}return{ok:true};},
  disconnect:()=>{const c=cfg();delete c.token;delete c.lastSync;saveCfg(c);setState("off");}};

// ---------- start ----------
const start=()=>{mountChip();if(enabled())syncNow({initial:true});};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
window.addEventListener("online",()=>schedule(200));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")schedule(200);});
setInterval(()=>{if(document.visibilityState==="visible")syncNow();},90000);
window.addEventListener("pagehide",()=>{if(state==="pending")syncNow();});
})();
