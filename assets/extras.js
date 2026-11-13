/* ===================== extras (loaded after app.js) ===================== */
(function(){
const body=document.body,lenis=APP.lenis;

/* bfcache: close overlay & hide curtain when coming back with the Back button */
addEventListener("pageshow",e=>{if(e.persisted){const ov=document.getElementById("overlay");if(ov.classList.contains("open"))document.getElementById("menuBtn").click();const c=document.querySelector(".curtain");if(c)c.style.visibility="hidden"}});

/* no native drag-and-drop of pictures anywhere: it froze the cursor with a «ghost» image */
document.addEventListener("dragstart",e=>{if(e.target.closest&&e.target.closest("img,.tile,.bottle,.carousel-wrap,.canvas"))e.preventDefault()});
document.querySelectorAll("img").forEach(i=>i.setAttribute("draggable","false"));
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;(n.tagName==="IMG"?[n]:n.querySelectorAll("img")).forEach(i=>i.setAttribute("draggable","false"))})))
  .observe(document.body,{childList:true,subtree:true});
/* while dragging the gallery or the carousel: clear any accidental text selection */
["#cv","#carWrap"].forEach(sel=>{const el=document.querySelector(sel);if(!el)return;
  el.addEventListener("pointerdown",e=>{if(e.target.closest("button,a,input"))return;e.preventDefault();getSelection&&getSelection().removeAllRanges();document.documentElement.classList.add("dragging")});});
const stopDrag=()=>document.documentElement.classList.remove("dragging");
addEventListener("pointerup",stopDrag);addEventListener("pointercancel",stopDrag);addEventListener("blur",stopDrag);

/* toast */
const toastEl=document.createElement("div");toastEl.className="toast";toastEl.setAttribute("role","status");body.appendChild(toastEl);let toastT;
function toast(msg){toastEl.innerHTML=msg;toastEl.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove("show"),2800)}
APP.toast=toast;

/* Prost! confetti of beer & snacks */
function prost(n=36){if(APP.reduce)return;const em=["🍺","🍻","🥨","🌭","🍖","🍺"];
  for(let i=0;i<n;i++){const s=document.createElement("span");s.className="confetti";s.textContent=em[i%em.length];body.appendChild(s);
    const x=innerWidth/2+(Math.random()-.5)*120,y=innerHeight*.78;gsap.set(s,{x,y,scale:.4+Math.random()*.9});
    gsap.to(s,{x:x+(Math.random()-.5)*innerWidth*.9,y:y-(200+Math.random()*innerHeight*.6),rotation:(Math.random()-.5)*720,duration:.9+Math.random()*.5,ease:"power2.out",
      onComplete:()=>gsap.to(s,{y:innerHeight+80,duration:1.2+Math.random(),ease:"power2.in",opacity:.6,onComplete:()=>s.remove()})})}}
APP.prost=prost;

/* scroll progress as a pint that fills up (click = back to top) */
if(!body.dataset.nolenis&&!body.dataset.nofoot){
  body.insertAdjacentHTML("beforeend",`<button class="pint" id="pint" aria-label="Наверх" title="Наверх"><span class="liq"></span><span class="fm"></span><em>0%</em></button>`);
  const pint=document.getElementById("pint"),liq=pint.querySelector(".liq"),fm=pint.querySelector(".fm"),pc=pint.querySelector("em");let toasted=false;
  const upd=()=>{const max=document.documentElement.scrollHeight-innerHeight;const p=max>0?Math.min(scrollY/max,1):0;
    liq.style.height=(p*80)+"%";fm.style.bottom=(p*80)+"%";fm.style.opacity=p>.02?1:0;pc.textContent=Math.round(p*100)+"%";
    pint.classList.toggle("full",p>.98);if(p>.98&&!toasted){toasted=true;toast("🍺 Кружка полная — вы долистали до конца! Нажмите на неё")}};
  addEventListener("scroll",upd,{passive:true});addEventListener("resize",upd);upd();
  pint.onclick=()=>{if(pint.classList.contains("full"))prost();lenis?lenis.scrollTo(0,{duration:1.6}):scrollTo({top:0,behavior:"smooth"})};
}

/* «Мой стол» — order kept in this browser, shared by menu and booking */
const KEY="wf_cart";
APP.cart={
  get(){try{return JSON.parse(localStorage.getItem(KEY))||{items:{},guests:2}}catch(e){return{items:{},guests:2}}},
  set(c){try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){}},
  total(c){return Object.values(c.items).reduce((s,i)=>s+i.p*i.q,0)},
  count(c){return Object.values(c.items).reduce((s,i)=>s+i.q,0)}};
APP.rub=n=>n.toLocaleString("ru-RU")+" ₽";

/* easter egg: type «prost» anywhere */
let typed="";
addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,textarea"))return;typed=(typed+(e.key||"").toLowerCase()).slice(-5);
  if(typed==="prost"||typed==="прост"){prost(60);toast("Prost! 🍻 Вы нашли пасхалку")}});
})();
