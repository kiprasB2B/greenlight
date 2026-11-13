/* Greenlight — automato logika. Duomenys – data.js */
"use strict";
/* ---------- STATE ---------- */
const st={niche:NICHES[0],aud:AUD[1],strat:null,fit:0,product:NICHES[0].p[0],brand:"FitUp",locks:[false,false,false],spins:0,jackpot:false,filter:"visos",ai:null};
let sevenKeys="";
const $=s=>document.querySelector(s);
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

function scoreStrat(s,niche,aud){
  const tags=[...(niche.t||[]),...(aud.t||[])];
  let sc=0;s.f.forEach(t=>{tags.forEach(x=>{if(x===t)sc++})});
  return sc;
}
function ranked(niche,aud){
  return STRATS.map(s=>({s,sc:scoreStrat(s,niche,aud)})).sort((a,b)=>b.sc-a.sc||a.s.n.localeCompare(b.s.n));
}
function fitPct(sc,max){return Math.min(99,Math.round(58+ (sc/Math.max(max,1))*34 + (sc>0?Math.random()*6:0)))}

/* ---------- REELS ---------- */
const REELS=[
 {label:"01 · Niša",list:()=>NICHES,txt:x=>x.n,sub:x=>x.p[0]},
 {label:"02 · Auditorija",list:()=>AUD,txt:x=>x.n,sub:x=>x.pain},
 {label:"03 · Strategija",list:()=>STRATS,txt:x=>x.n,sub:x=>x.tag}
];
const reelEls=[];
function itemHTML(i,x){
  if(x==="7")return '<div class="item seven"><div class="t"><span>7</span></div></div>';
  const r=REELS[i];return `<div class="item"><div class="t">${esc(r.txt(x))}</div><div class="s">${esc(r.sub(x))}</div></div>`;
}
function buildReels(){
  const wrap=$("#reels");
  REELS.forEach((r,i)=>{
    const col=document.createElement("div");col.className="reel-col";
    col.innerHTML=`<div class="reel-label"><span class="meta">${r.label}</span></div>
      <div class="reel" id="reel${i}"><div class="payline"></div><div class="strip"></div></div>
      <div class="reel-tools">
        <button class="chip" data-lock="${i}" aria-pressed="false" title="Užrakinti būgną" aria-label="Užrakinti būgną ${i+1}">🔒<span>Užrakinti</span></button>
        ${i<2?`<button class="chip" data-custom="${i}" title="Įrašyti savo" aria-label="Įrašyti savo reikšmę ${i+1} būgnui">✎<span>Savo</span></button>`:""}
      </div>
      ${i<2?`<form class="custom" data-form="${i}" hidden><input id="custom${i}" maxlength="40" placeholder="${i?"pvz. Dizaineriai":"pvz. Dviračiai"}"><button>OK</button></form>`:""}`;
    wrap.appendChild(col);
    reelEls[i]={reel:col.querySelector(".reel"),strip:col.querySelector(".strip")};
  });
  wrap.addEventListener("click",e=>{
    const l=e.target.closest("[data-lock]");
    if(l){const i=+l.dataset.lock;st.locks[i]=!st.locks[i];l.setAttribute("aria-pressed",st.locks[i]);toast(st.locks[i]?"Būgnas užrakintas":"Būgnas atrakintas");return}
    const c=e.target.closest("[data-custom]");
    if(c){const f=wrap.querySelector(`[data-form="${c.dataset.custom}"]`);f.hidden=!f.hidden;if(!f.hidden)f.querySelector("input").focus()}
  });
  wrap.addEventListener("submit",e=>{
    e.preventDefault();const f=e.target,i=+f.dataset.form,v=f.querySelector("input").value.trim();
    if(!v){toast("Įrašyk bent vieną žodį");return}
    if(i===0){st.niche={n:v,p:[`${v} sprendimas`],pr:`${v.toLowerCase()} tampa paprasta`,h:`Ką sužinojau per 30 dienų: ${v.toLowerCase()}`,st:v.replace(/[^A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]/g,"").slice(0,5)||"Idea",t:[],custom:true};st.product=st.niche.p[0]}
    else st.aud={n:v,d:v.toLowerCase(),pain:"turi problemą, kurios niekas dar gerai neišsprendė",t:[],custom:true};
    st.locks[i]=true;wrap.querySelector(`[data-lock="${i}"]`).setAttribute("aria-pressed","true");
    setStatic(i,i?st.aud:st.niche);f.hidden=true;toast("Įrašyta ir užrakinta");
  });
}
function itemH(){return reelEls[0].reel.querySelector(".item")?.offsetHeight||parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--item"))||86}
function centerY(idx){const h=itemH();const win=reelEls[0].reel.clientHeight;return -(idx*h-(win-h)/2)}
function setStatic(i,x){
  const L=REELS[i].list();const strip=reelEls[i].strip;
  const prev=L[(L.indexOf(x)-1+L.length)%L.length]||rnd(L),next=L[(L.indexOf(x)+1)%L.length]||rnd(L);
  strip.style.transition="none";strip.innerHTML=itemHTML(i,prev)+itemHTML(i,x)+itemHTML(i,next);
  strip.style.transform=`translateY(${centerY(1)}px)`;strip.dataset.cur="1";
}
function spinReel(i,target,dur,extra){
  return new Promise(res=>{
    const {strip,reel}=reelEls[i];const L=REELS[i].list();
    const cur=strip.children[+strip.dataset.cur||1]?.outerHTML||"";
    const n=extra;let html=cur;
    for(let k=0;k<n;k++)html+=itemHTML(i,Math.random()<.07?"7":rnd(L));
    html+=itemHTML(i,target)+itemHTML(i,rnd(L));
    strip.style.transition="none";strip.innerHTML=html;strip.style.transform=`translateY(${centerY(0)}px)`;
    void strip.offsetHeight;
    strip.classList.add("blur");reel.classList.remove("win");
    strip.style.transition=`transform ${dur}ms cubic-bezier(.12,.72,.22,1.03)`;
    strip.style.transform=`translateY(${centerY(n+1)}px)`;strip.dataset.cur=String(n+1);
    setTimeout(()=>strip.classList.remove("blur"),dur*.7);
    let done=false;const fin=()=>{if(done)return;done=true;reel.classList.add("win");sfx.stop(i);burstAt(reel,26);res()};
    strip.addEventListener("transitionend",fin,{once:true});setTimeout(fin,dur+120);
  });
}

/* ---------- SPIN ---------- */
let busy=false;
async function spin(forceJackpot){
  if(busy)return;busy=true;sfx.init();
  const btn=$("#spinBtn");btn.disabled=true;btn.classList.add("down");setTimeout(()=>btn.classList.remove("down"),140);
  $("#machine").classList.add("spinning");sfx.whirr();
  const niche=st.locks[0]?st.niche:rnd(NICHES.filter(x=>x!==st.niche));
  const aud=st.locks[1]?st.aud:rnd(AUD.filter(x=>x!==st.aud));
  const rk=ranked(niche,aud);
  const top=rk.filter(r=>r.sc===rk[0].sc);
  const best=st.locks[2]&&st.strat?{s:st.strat,sc:scoreStrat(st.strat,niche,aud)}:rnd(top);
  const jackpot=forceJackpot||Math.random()<1/22;
  const targets=jackpot?["7","7","7"]:[niche,aud,best.s];
  const jobs=[0,1,2].map(i=>{
    if(st.locks[i]&&!jackpot){reelEls[i].reel.animate([{transform:"translateX(0)"},{transform:"translateX(-3px)"},{transform:"translateX(3px)"},{transform:"translateX(0)"}],{duration:260});return Promise.resolve()}
    return spinReel(i,targets[i],1500+i*650,16+i*7);
  });
  await Promise.all(jobs);
  if(jackpot){
    $("#jackpot").classList.remove("on");void $("#jackpot").offsetWidth;$("#jackpot").classList.add("on");
    sfx.jackpot();megaConfetti();
    await new Promise(r=>setTimeout(r,1500));
    await Promise.all([0,1,2].map(i=>spinReel(i,[niche,aud,best.s][i],700+i*250,4)));
  }
  st.niche=niche;st.aud=aud;st.strat=best.s;st.jackpot=jackpot;
  st.fit=jackpot?99:fitPct(best.sc,rk[0].sc||1);
  st.product=rnd(niche.p);st.brand=(niche.st||"Idea")+rnd(SUF);
  st.spins++;$("#counter").textContent="Sukimų: "+st.spins;
  $("#machine").classList.remove("spinning");
  sfx.win();bigConfetti($("#machine"));
  render();saveHistory();
  btn.disabled=false;busy=false;
}

/* ---------- RENDER ---------- */
function wordsReveal(text,marks){
  return text.split(" ").map((w,i)=>{
    const m=marks&&marks.includes(i);
    return `<span class="rv" style="animation-delay:${i*70}ms">${m?`<span class="mark">${esc(w)}</span>`:esc(w)}</span>`;
  }).join(" ");
}
function title(){const p=st.product;return `${p[0].toUpperCase()+p.slice(1)} ${st.aud.d}`}
function render(){
  const s=st.strat,n=st.niche,a=st.aud;
  const t=title();const words=t.split(" ");
  $("#ideaFrame").innerHTML=`
    <div class="meta-line"><span class="meta">Išsukta idėja</span><span class="meta">${st.jackpot?"Jackpot · 7 7 7":"Sukimas #"+(st.spins||1)}</span></div>
    <div class="idea-head">
      <div><span class="label">Prekės ženklas</span><strong class="brand-name">${esc(st.brand)}</strong></div>
      <a class="bignum" href="#strategijos" aria-label="Strategijos tinkamumas ${st.fit} % – žiūrėti visas strategijas"><span class="label">Tinkamumas ↓</span><span class="num">${st.fit}<sup>%</sup></span></a>
    </div>
    <h3 class="idea-title">${wordsReveal(t,[words.length-1-(a.d.split(" ").length-1)])}</h3>
    <dl class="pitch">
      <div><dt>Problema</dt><dd>${esc(a.n)} ${esc(a.pain)}.</dd></div>
      <div><dt>Sprendimas</dt><dd>${esc(st.product[0].toUpperCase()+st.product.slice(1))} – ${esc(n.pr)}.</dd></div>
      <div><dt>Kodėl plis</dt><dd>${esc(s.y)}</dd></div>
    </dl>
    <figure class="hook"><figcaption class="label">Pirmas video hook'as</figcaption><blockquote>„${esc(n.h)}“</blockquote></figure>
    <div class="links">
      <button class="link-cta" id="toAi"><span>Sugeneruok pilną planą</span><i aria-hidden="true">↗</i></button>
      <button class="link" id="copyBtn">Kopijuoti idėją →</button>
      <button class="link" id="againBtn">Sukti dar kartą →</button>
    </div>`;
  const doneKey="done:"+st.brand+":"+s.id;const done=store.get(doneKey,[]);
  $("#planFrame").innerHTML=`
    <div class="meta-line"><span class="meta">Efektyviausia strategija</span><span class="meta">${esc(s.tag)}</span></div>
    <div class="plan-head">
      <div><h3 class="plan-title">${esc(s.n)}</h3><p class="why">${esc(s.w)}</p></div>
      <p class="bignum"><span class="label">Dienų planas</span><span class="num">14</span></p>
    </div>
    <div class="timeline" id="tl"><div class="rail"></div>${s.s.map((x,i)=>`<button class="flag" data-step="${i}" style="left:${(x[0]-1)/13*100}%" aria-label="Diena ${x[0]}: ${esc(x[1])}"></button>`).join("")}<div class="dot" id="tlDot" style="left:0%"></div></div>
    <div class="ticks" aria-hidden="true">${[1,3,5,7,9,11,14].map(d=>`<span>D${String(d).padStart(2,"0")}</span>`).join("")}</div>
    <ol class="steps">${s.s.map((x,i)=>`<li data-li="${i}"><label><input type="checkbox" id="st${i}" data-i="${i}" ${done.includes(i)?"checked":""}><span class="txt">${esc(x[1])}</span><span class="lead" aria-hidden="true"></span><span class="d">D${String(x[0]).padStart(2,"0")}</span></label></li>`).join("")}</ol>
    <div class="kpi"><span class="label">Sėkmės rodiklis</span><strong>${esc(s.k)}</strong></div>`;
  setStep(0);
  $("#tl").onclick=e=>{const f=e.target.closest(".flag");if(f)setStep(+f.dataset.step)};
  $("#planFrame").querySelector(".steps").onchange=e=>{
    const i=+e.target.dataset.i;let d=store.get(doneKey,[]);d=e.target.checked?[...new Set([...d,i])]:d.filter(x=>x!==i);store.set(doneKey,d);
    if(e.target.checked){burstAt(e.target,14);sfx.tick()}setStep(i);
  };
  $("#planFrame").querySelector(".steps").onmouseover=e=>{const li=e.target.closest("[data-li]");if(li)setStep(+li.dataset.li)};
  $("#toAi").onclick=()=>{location.hash="ai";document.getElementById("ai").scrollIntoView();genAI()};
  $("#copyBtn").onclick=copyIdea;
  $("#againBtn").onclick=()=>{document.getElementById("automatas").scrollIntoView();setTimeout(()=>spin(),350)};
  renderCatalog();renderHistory();
  if(st.ai&&st.ai.key!==aiKey()){st.ai=null}
  renderAI();
}
function setStep(i){
  const s=st.strat.s[i];const dot=$("#tlDot");if(dot)dot.style.left=((s[0]-1)/13*100)+"%";
  document.querySelectorAll("#tl .flag").forEach((f,k)=>f.classList.toggle("on",k<=i));
  document.querySelectorAll("[data-li]").forEach((l,k)=>l.classList.toggle("cur",k===i));
}
function renderCatalog(){
  const rk=ranked(st.niche,st.aud);const max=rk[0].sc||1;
  $("#catNote").textContent=`Surikiuota pagal tinkamumą idėjai „${title()}“. Išsukta strategija paryškinta.`;
  $("#filters").innerHTML=["visos","tinkamiausios"].map(t=>`<button data-f="${t}" aria-pressed="${st.filter===t}">${t}</button>`).join("");
  let list=rk;if(st.filter==="tinkamiausios")list=rk.filter(r=>r.sc>=Math.max(1,max-1));
  $("#grid").innerHTML=list.map(({s,sc},k)=>{
    const won=s===st.strat;const pct=won?st.fit:Math.round(40+sc/max*50);
    return `<li class="s-row ${won?"won":""}" style="--n:${k}">
      <div class="s-line"><span class="s-idx">${String(k+1).padStart(2,"0")}</span><h3 class="s-name">${won?`<span class="mark">${esc(s.n)}</span>`:esc(s.n)}</h3><span class="lead" aria-hidden="true"></span><span class="s-pct">${won?"Išsukta · ":""}${pct}%</span></div>
      <div class="s-bar" role="img" aria-label="Tinkamumas ${pct} %"><i style="width:${pct}%"></i></div>
      <p class="s-desc"><b>${esc(s.tag)}</b>${esc(s.w)}</p>
      <div class="s-foot"><details><summary>14 dienų planas</summary><ol>${s.s.map(x=>`<li><b>D${String(x[0]).padStart(2,"0")}</b><span>${esc(x[1])}</span></li>`).join("")}</ol></details>
      ${won?`<a class="link" href="#rezultatas">Žiūrėti planą ↑</a>`:`<button class="link" data-pick="${s.id}" aria-label="Rinktis strategiją ${esc(s.n)}">Rinktis →</button>`}</div>
    </li>`}).join("");
}
document.addEventListener("click",e=>{
  const f=e.target.closest("[data-f]");if(f){st.filter=f.dataset.f;renderCatalog();return}
  const p=e.target.closest("[data-pick]");
  if(p){const s=STRATS.find(x=>x.id===p.dataset.pick);st.strat=s;const rk=ranked(st.niche,st.aud);st.fit=fitPct(scoreStrat(s,st.niche,st.aud),rk[0].sc||1);st.jackpot=false;
    setStatic(2,s);st.locks[2]=true;document.querySelector('[data-lock="2"]').setAttribute("aria-pressed","true");
    render();saveHistory();document.getElementById("rezultatas").scrollIntoView();toast("Strategija pakeista ir užrakinta");}
  const h=e.target.closest("[data-h]");
  if(h){const it=store.get("hist",[])[+h.dataset.h];if(!it)return;
    const n=NICHES.find(x=>x.n===it.n),a=AUD.find(x=>x.n===it.a),s=STRATS.find(x=>x.id===it.s);if(!n||!a||!s)return;
    Object.assign(st,{niche:n,aud:a,strat:s,product:it.p,brand:it.b,fit:it.f,jackpot:false});[n,a,s].forEach((x,i)=>setStatic(i,x));render();}
});

/* ---------- HISTORY ---------- */
function saveHistory(){
  if(st.niche.custom||st.aud.custom)return;
  let h=store.get("hist",[]);const it={n:st.niche.n,a:st.aud.n,s:st.strat.id,p:st.product,b:st.brand,f:st.fit};
  h=[it,...h.filter(x=>!(x.n===it.n&&x.a===it.a&&x.s===it.s))].slice(0,6);store.set("hist",h);renderHistory();
}
function renderHistory(){
  const h=store.get("hist",[]);if(h.length<2){$("#history").innerHTML="";return}
  $("#history").innerHTML=`<span class="label">Ankstesni sukimai</span>`+h.slice(1).map((x,i)=>`<button data-h="${i+1}">${esc(x.b)} · ${esc(x.n)} × ${esc(x.a)}</button>`).join("");
}

/* ---------- COPY ---------- */
function ideaText(){
  const s=st.strat;return `${st.brand} – ${title()}\nProblema: ${st.aud.n} ${st.aud.pain}.\nSprendimas: ${st.product} – ${st.niche.pr}.\nStrategija: ${s.n} (${s.tag})\n${s.s.map(x=>`Diena ${x[0]}: ${x[1]}`).join("\n")}\nRodiklis: ${s.k}`;
}
function copyIdea(){
  const t=ideaText();
  navigator.clipboard?.writeText(t).then(()=>toast("Nukopijuota"),()=>fallbackCopy(t))??fallbackCopy(t);
}
function fallbackCopy(t){const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("Nukopijuota")}catch(e){toast("Pažymėk ir nukopijuok ranka")}ta.remove()}

/* ---------- AI ----------
   Planą generuoja serverio pusė: POST {API}/api/plan (Cloudflare Worker, raktas – tik Workerio slaptažodžiuose).
   Kol window.GREENLIGHT_API tuščias (žr. index.html), AI skiltis rodo pranešimą, o visa kita veikia. */
const API=(window.GREENLIGHT_API||"").replace(/\/$/,"");
const AI_OFF="AI planas dar neprijungtas: serverio dalis (Cloudflare Worker /api/plan) ruošiama. Automatas, 14 dienų planas ir strategijų katalogas veikia ir be jo.";
let aiCtl=null;
function aiKey(){return st.brand+"|"+st.niche.n+"|"+st.aud.n+"|"+st.strat.id}
function renderAI(state){
  const box=$("#aiBox");
  if(state==="loading"){box.innerHTML=`<div class="ai-empty"><div class="meta-line"><span class="meta">Generuojama</span><span class="meta">${esc(st.brand)}</span></div><p class="ai-lede">AI rašo prekės ženklo pagrindą, auditoriją, SWOT, rinkos spragą ir 30 dienų planą.</p><div class="stream" id="stream">Galvoja…</div><button class="link" id="aiStop">Sustabdyti ×</button></div>`;$("#aiStop").onclick=()=>aiCtl?.abort();return}
  if(state&&state.error){box.innerHTML=`<div class="ai-empty"><div class="err" role="status">${esc(state.error)}</div><button class="link-cta" id="aiGo"><span>Bandyti dar kartą</span><i aria-hidden="true">↗</i></button></div>`;$("#aiGo").onclick=genAI;return}
  if(st.ai&&st.ai.key===aiKey()){box.innerHTML=deckHTML(st.ai.d);$("#aiCopy").onclick=()=>{const t=JSON.stringify(st.ai.d,null,2);navigator.clipboard?.writeText(t).then(()=>toast("Planas nukopijuotas"),()=>fallbackCopy(t))};$("#aiRe").onclick=genAI;return}
  box.innerHTML=`<div class="ai-empty"><div class="meta-line"><span class="meta">Idėja: ${esc(st.brand)}</span><span class="meta">${esc(st.strat.n)}</span></div>
    <p class="ai-lede">Paspausk ir AI parašys pilną strategijos dokumentą šiai idėjai: pozicionavimą, auditoriją, SWOT, konkurentų tipus, rinkos spragą, 5 hook'us ir 30 dienų planą.</p>
    ${API?"":`<div class="err" role="status">${esc(AI_OFF)}</div>`}
    <button class="link-cta" id="aiGo" ${API?"":"disabled"}><span>Generuoti strategijos dokumentą</span><i aria-hidden="true">↗</i></button></div>`;
  $("#aiGo").onclick=genAI;
}
async function genAI(){
  if(!API){renderAI();return}
  aiCtl?.abort();aiCtl=new AbortController();renderAI("loading");
  const s=st.strat;
  const body={brand:st.brand,title:title(),niche:st.niche.n,audience:st.aud.n,pain:st.aud.pain,strategy:{id:s.id,name:s.n,tag:s.tag,what:s.w}};
  try{
    const r=await fetch(API+"/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:aiCtl.signal});
    if(r.status===429)throw {code:"rate_limited"};
    if(!r.ok)throw {code:"http"};
    const d=await r.json();
    st.ai={key:aiKey(),d};renderAI();burstAt($("#aiBox"),60);sfx.win();
  }catch(e){
    if(e?.name==="AbortError"){renderAI();return}
    const m=e?.code==="rate_limited"?"Per daug užklausų. Palauk minutę ir bandyk vėl.":e?.code==="http"?"AI serveris grąžino klaidą. Bandyk dar kartą vėliau.":"AI serveris šiuo metu nepasiekiamas. Visa kita veikia – bandyk vėliau.";
    renderAI({error:m});
  }
}
function L(a){return Array.isArray(a)?a:[]}
function deckHTML(d){
  const sw=d.swot||{};
  const slides=[
   ["core","Prekės ženklo pagrindas",`<p><b>${esc(d.pozicionavimas)}</b></p><p>${esc(d.sukis)}</p><span class="label">Vertybės</span><p>${L(d.vertybes).map(esc).join(" · ")}</p><span class="label">Pajamos</span><p>${esc(d.pajamos)}</p>`,true],
   ["aud","Tikslinė auditorija",`<p>${esc(d.auditorija?.kas)}</p><span class="label">Skausmai</span><ul>${L(d.auditorija?.skausmai).map(x=>`<li>${esc(x)}</li>`).join("")}</ul><span class="label">Kur juos rasti</span><ul>${L(d.auditorija?.kur).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`],
   ["swot","SWOT analizė",`<div class="swot">${[["Stiprybės","stiprybes"],["Silpnybės","silpnybes"],["Galimybės","galimybes"],["Grėsmės","gresmes"]].map(([t,k])=>`<div><span class="label">${t}</span><ul>${L(sw[k]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>`],
   ["konk","Konkurentai",`<ul>${L(d.konkurentai).map(c=>`<li><b>${esc(c.tipas)}</b> – ${esc(c.silpnybe)}</li>`).join("")}</ul>`],
   ["gap","Rinkos spraga",`<p>${esc(d.rinkos_spraga)}</p>`,true],
   ["hooks","5 video hook'ai",`<ul>${L(d.hookai).map(x=>`<li>„${esc(x)}“</li>`).join("")}</ul>`],
   ["plan","30 dienų planas",`<ul>${L(d.planas).map(p=>`<li><b>D${esc(p.diena)}</b> ${esc(p.veiksmas)}</li>`).join("")}</ul>`],
   ["kpi","Sėkmės rodikliai",`<ul>${L(d.kpi).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`,true]
  ];
  return `<nav class="toc" id="aiToc" aria-label="Dokumento turinys">${slides.map((s,i)=>`<a href="#sl-${s[0]}">${String(i+1).padStart(2,"0")} ${s[1]}</a>`).join("")}</nav>
  <div class="deck">${slides.map((s,i)=>`<article class="slide ${s[3]?"key":""}" id="sl-${s[0]}"><span class="slide-no" aria-hidden="true">${String(i+1).padStart(2,"0")}</span><div><div class="slide-top"><span class="meta">${esc(st.brand)}</span><a class="meta" href="#aiToc" style="text-decoration:none">↑ turinys</a></div><h3>${s[1]}</h3>${s[2]}</div></article>`).join("")}</div>
  <div class="links"><button class="link" id="aiCopy">Kopijuoti planą →</button><button class="link" id="aiRe">Generuoti iš naujo →</button></div>`;
}

/* ---------- CONFETTI ---------- */
const cv=$("#fx"),cx=cv.getContext("2d");let parts=[],raf=0;
const COLORS=["#0D211B","#174C3A","#3E8E68","#C5F36B","#C5F36B","#F5F3E9"];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function sizeCv(){const r=devicePixelRatio||1;cv.width=innerWidth*r;cv.height=innerHeight*r;cx.setTransform(r,0,0,r,0,0)}
addEventListener("resize",sizeCv);sizeCv();
function burst(x,y,n,power=1,up=false){
  if(reduce)n=Math.min(n,10);
  for(let i=0;i<n;i++){const a=up?(-Math.PI/2+(Math.random()-.5)*1.6):Math.random()*Math.PI*2,v=(3+Math.random()*7)*power;
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(up?2:1),w:5+Math.random()*7,h:3+Math.random()*5,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:rnd(COLORS),life:90+Math.random()*60})}
  if(!raf)raf=requestAnimationFrame(tick);
}
function burstAt(el,n){if(!el)return;const b=el.getBoundingClientRect();burst(b.left+b.width/2,b.top+b.height/2,n,.8)}
function bigConfetti(el){const b=el.getBoundingClientRect();
  [[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom],[b.left+b.width/2,b.top]].forEach(([x,y])=>burst(x,y,34,1.1))}
function megaConfetti(){for(let k=0;k<6;k++)setTimeout(()=>{burst(innerWidth*Math.random(),innerHeight*.9,60,1.6,true)},k*180)}
function tick(){
  cx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.life>0&&p.y<innerHeight+40);
  for(const p of parts){p.vy+=.22;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life--;
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.globalAlpha=Math.min(1,p.life/30);cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.r*1.7)));cx.restore()}
  raf=parts.length?requestAnimationFrame(tick):0;if(!raf)cx.clearRect(0,0,innerWidth,innerHeight);
}

/* ---------- SOUND ---------- */
const sfx={ctx:null,on:store.get("sound",true),w:null,
  init(){if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}this.ctx?.resume?.()},
  tone(f,d=.08,type="square",vol=.05,at=0){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime+at,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+d)},
  whirr(){if(!this.on||!this.ctx)return;let k=0;clearInterval(this.w);this.w=setInterval(()=>{this.tone(300+Math.random()*120,.03,"square",.018);if(++k>60)clearInterval(this.w)},55)},
  stop(i){this.tone(520+i*140,.12,"triangle",.09);if(i===2)clearInterval(this.w)},
  tick(){this.tone(880,.06,"triangle",.06)},
  win(){[523,659,784,1047].forEach((f,i)=>this.tone(f,.18,"triangle",.07,i*.09))},
  jackpot(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>this.tone(f,.22,"square",.05,i*.11))}
};
function syncSound(){const b=$("#soundBtn");b.textContent="Garsas: "+(sfx.on?"įj.":"išj.");b.setAttribute("aria-pressed",sfx.on)}
$("#soundBtn").onclick=()=>{sfx.on=!sfx.on;store.set("sound",sfx.on);syncSound()};syncSound();

/* ---------- MISC ---------- */
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),1800)}
$("#spinBtn").onclick=()=>spin();
const lever=$("#lever");
lever.addEventListener("click",()=>{if(busy)return;lever.classList.add("pulled");sfx.init();sfx.tone(140,.15,"sawtooth",.05);setTimeout(()=>{lever.classList.remove("pulled");spin()},230)});
addEventListener("keydown",e=>{
  if(e.target.matches("input,textarea"))return;
  if(e.code==="Space"){e.preventDefault();spin()}
  if(e.key==="7"){sevenKeys+="7";if(sevenKeys.endsWith("777")){sevenKeys="";spin(true)}}else sevenKeys="";
});

/* ---------- POSTER: menu, fit, reveal, parallax, CTA ---------- */
const menuBtn=$("#menuBtn"),nav=$("#nav");
function setMenu(o){nav.classList.toggle("open",o);menuBtn.setAttribute("aria-expanded",o);menuBtn.firstElementChild.textContent=o?"×":"☰"}
menuBtn.onclick=()=>setMenu(!nav.classList.contains("open"));
nav.addEventListener("click",e=>{if(e.target.closest("a"))setMenu(false)});
addEventListener("keydown",e=>{if(e.key==="Escape"&&nav.classList.contains("open")){setMenu(false);menuBtn.focus()}});

/* Hero žodis užpildo visą plotį: telefone 2 eilutės (GREEN/LIGHT), desktop'e – viena. */
const poster=$("#poster");
function fitPoster(){
  const h1=poster.parentElement,avail=h1.clientWidth;if(!avail)return;
  h1.style.fontSize="100px";
  const lines=getComputedStyle(poster.querySelector(".ln")).display==="block"?[...poster.querySelectorAll(".ln")]:[poster];
  const w=Math.max(...lines.map(l=>{const r=document.createRange();r.selectNodeContents(l);return r.getBoundingClientRect().width}));
  const size=Math.min(300,Math.max(64,100*avail/w*.995));
  h1.style.fontSize="";document.documentElement.style.setProperty("--t-hero",size.toFixed(1)+"px");
}
fitPoster();document.fonts?.ready.then(fitPoster);
let fitT;addEventListener("resize",()=>{clearTimeout(fitT);fitT=setTimeout(fitPoster,80)});

if("IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
  const cta=$("#ctaBar");
  new IntersectionObserver(([e])=>cta.classList.toggle("on",!e.isIntersecting),{threshold:0}).observe($("#machine"));
}else document.querySelectorAll(".reveal").forEach(el=>el.classList.add("in"));

$("#ctaBar").onclick=()=>{document.getElementById("automatas").scrollIntoView();setTimeout(()=>spin(),reduce?0:450)};

if(!reduce){
  const ph=poster.parentElement;let ticking=false;
  addEventListener("scroll",()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const y=Math.min(scrollY,innerHeight);ph.style.transform=`translateY(${(y*.28).toFixed(1)}px)`;ticking=false})},{passive:true});
}

/* ---------- INIT ---------- */
$("#heroH").innerHTML=wordsReveal("Išsuk verslo idėją ir strategiją, kuri ją išaugins.",[6]);
buildReels();
(function init(){
  const rk=ranked(st.niche,st.aud);st.strat=rk[0].s;st.fit=fitPct(rk[0].sc,rk[0].sc);
  [st.niche,st.aud,st.strat].forEach((x,i)=>setStatic(i,x));
  render();
  addEventListener("resize",()=>{[st.niche,st.aud,st.strat].forEach((x,i)=>{if(!busy)setStatic(i,x)})});
})();
