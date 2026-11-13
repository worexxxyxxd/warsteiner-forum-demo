/* Shared chrome + motion for every page */
const PAGES=[
  ["index.html","Главная","hero"],["menu.html","Меню","steak"],["bar.html","Бар","aperol"],
  ["gallery.html","Галерея","veranda2"],["events.html","События","friends"],["booking.html","Бронь","evening"],["contacts.html","Контакты","facade"]];
const here=(location.pathname.split("/").pop()||"index.html");
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const body=document.body;

/* ---------- inject chrome ---------- */
body.insertAdjacentHTML("afterbegin",`
<header class="top">
  <a href="index.html" class="brand">Варштайнер Форум<small>Невский 120 · СПб</small></a>
  <button class="menu-btn" id="menuBtn"><i></i><span>Меню</span></button>
  <a href="booking.html" class="book">Забронировать</a>
</header>
<nav class="overlay" id="overlay">
  <div class="ov-list">${PAGES.map(([h,t],i)=>`<a href="${h}" data-img="${PAGES[i][2]}" class="${h===here?"cur":""}"><small>0${i+1}</small><span>${t}</span></a>`).join("")}</div>
  <div class="ov-side">${PAGES.map(p=>`<img src="img/${p[2]}.jpg" data-k="${p[2]}" alt="">`).join("")}
    <div class="ov-info mono"><span>+7 (812) 717-54-06</span><span>Ежедневно с 12:00</span></div></div>
</nav>
<div class="cur-dot" id="dot"><em></em></div>
<div class="demo">Демо-концепт · v6</div>`);
if(!body.dataset.nofoot) body.insertAdjacentHTML("beforeend",`
<footer class="foot">
  <span class="mono" style="color:var(--mute)">Ждём вас на Невском</span>
  <a href="booking.html" class="foot-cta" data-cursor="Бронь">Забронировать<br>столик →</a>
  <div class="foot-grid">
    <div><h6>Адрес</h6>Невский проспект, 120<br>м. «Площадь Восстания»</div>
    <div><h6>Связь</h6><a href="tel:+78127175406">+7 (812) 717-54-06</a><a href="https://wa.me/79213480354" target="_blank" rel="noopener">WhatsApp</a></div>
    <div><h6>Страницы</h6>${PAGES.slice(1).map(p=>`<a href="${p[0]}">${p[1]}</a>`).join("")}</div>
    <div><h6>Соцсети</h6><a href="https://vk.ru/clubwf" target="_blank" rel="noopener">ВКонтакте</a><a href="https://t.me/warsteiner_spb" target="_blank" rel="noopener">Telegram</a></div>
  </div>
  <div class="foot-bot mono"><span>Неофициальный демо-концепт сайта для ресторана «Варштайнер Форум»</span><span>Бронь в демо никуда не отправляется</span></div>
</footer>`);

/* ---------- smooth scroll ---------- */
gsap.registerPlugin(ScrollTrigger);
let lenis=null;
if(window.Lenis && !body.dataset.nolenis && !reduce){
  /* lighter smoothing; inner scrollable panels keep native scroll */
  lenis=new Lenis({lerp:.16,smoothWheel:true,syncTouch:false,
    prevent:n=>!!(n.closest&&n.closest(".tray-list,.mcats,.overlay,.quiz,.lightbox,textarea,.flatpickr-calendar,#map"))});
  lenis.on("scroll",ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
}
/* scroll locks are reference-counted by name, so one feature can never leave the page frozen for another */
const locks=new Set();
function lock(name,on){on?locks.add(name):locks.delete(name);if(lenis){locks.size?lenis.stop():lenis.start()}
  document.documentElement.classList.toggle("locked",locks.size>0)}
window.APP={lenis,reduce,lock};
/* safety net: if nothing is holding a lock, scrolling must work */
setInterval(()=>{if(lenis&&!locks.size&&lenis.isStopped)lenis.start()},1500);

/* ---------- overlay menu ---------- */
const ov=document.getElementById("overlay"),mb=document.getElementById("menuBtn");let ovOpen=false;
const sideImgs=[...ov.querySelectorAll(".ov-side img")];
function showSide(k){sideImgs.forEach(i=>i.classList.toggle("on",i.dataset.k===k))}
showSide((PAGES.find(p=>p[0]===here)||PAGES[0])[2]);
ov.querySelectorAll(".ov-list a").forEach(a=>a.addEventListener("mouseenter",()=>showSide(a.dataset.img)));
function toggleMenu(){
  ovOpen=!ovOpen;ov.classList.toggle("open",ovOpen);mb.querySelector("span").textContent=ovOpen?"Закрыть":"Меню";
  gsap.to(ov,{clipPath:ovOpen?"inset(0 0 0% 0)":"inset(0 0 100% 0)",duration:.9,ease:"expo.inOut"});
  if(ovOpen)gsap.fromTo(ov.querySelectorAll(".ov-list a span"),{yPercent:110},{yPercent:0,stagger:.05,duration:.9,ease:"expo.out",delay:.35});
  lock("menu",ovOpen);
}
mb.onclick=toggleMenu;
addEventListener("keydown",e=>{if(e.key==="Escape"&&ovOpen)toggleMenu()});

/* ---------- page transitions (curtain) ---------- */
const curtain=document.querySelector(".curtain");
function curtainOut(){if(!curtain)return;
  if(reduce){curtain.style.visibility="hidden";return}
  setTimeout(()=>{curtain.style.visibility="hidden"},2200); /* safety net */
  gsap.set(curtain,{yPercent:0});
  gsap.to(curtain.querySelector("span"),{yPercent:-110,duration:.6,ease:"power3.in",delay:.1});
  gsap.to(curtain,{yPercent:-100,duration:1,ease:"expo.inOut",delay:.25,onComplete:()=>curtain.style.visibility="hidden"});}
window.APP.curtainOut=curtainOut;
if(!body.dataset.splash)curtainOut();
addEventListener("pageshow",e=>{if(e.persisted&&curtain){curtain.style.visibility="hidden"}});
document.addEventListener("click",e=>{
  const a=e.target.closest("a");if(!a)return;const href=a.getAttribute("href")||"";
  if(a.target==="_blank"||href.startsWith("#")||href.startsWith("tel:")||href.startsWith("http")||href.startsWith("mailto")||e.metaKey||e.ctrlKey)return;
  if(!/\.html/.test(href))return;
  /* link to a section of this same page: just scroll, no curtain (otherwise the curtain would stay on screen) */
  const [path,hash]=href.split("#");
  if(path.split("?")[0]===here&&hash){const t=document.getElementById(hash);if(t){e.preventDefault();if(ovOpen)toggleMenu();lenis?lenis.scrollTo(t,{offset:-120}):t.scrollIntoView({behavior:"smooth"})}return}
  e.preventDefault();
  if(ovOpen)lock("menu",false);
  if(!curtain||reduce){location.href=href;return}
  const t=(PAGES.find(p=>href.startsWith(p[0]))||[0,"Варштайнер"])[1];
  curtain.querySelector("span").textContent=t;curtain.style.visibility="visible";
  gsap.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.8,ease:"expo.inOut",onComplete:()=>location.href=href});
  gsap.fromTo(curtain.querySelector("span"),{yPercent:110},{yPercent:0,duration:.6,ease:"power3.out",delay:.45});
});

/* ---------- cursor ---------- */
const dot=document.getElementById("dot");
if(matchMedia("(hover:hover)").matches){
  /* the real cursor always stays; the dot is only a small label bubble and sticks to the mouse without lag */
  addEventListener("pointermove",e=>{dot.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`},{passive:true});
  document.addEventListener("pointerleave",()=>dot.classList.remove("big"));
  document.addEventListener("pointerover",e=>{const t=e.target.closest("[data-cursor]");dot.classList.toggle("big",!!t);dot.querySelector("em").textContent=t?t.dataset.cursor:""});
}

/* ---------- fit text to width ---------- */
function fit(){document.querySelectorAll(".fit").forEach(el=>{el.style.fontSize="100px";const w=el.parentElement.clientWidth;el.style.fontSize=(100*w/el.scrollWidth*.995)+"px"})}
fit();addEventListener("resize",fit);document.fonts&&document.fonts.ready.then(()=>{fit();ScrollTrigger.refresh()});

/* ---------- split text reveal ---------- */
function splitWords(el){
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const frag=document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){frag.appendChild(document.createTextNode(" "));return}
        const o=document.createElement("span");o.className="word";const i=document.createElement("span");i.textContent=w;o.appendChild(i);frag.appendChild(o)});
      c.replaceWith(frag)}
    else if(c.nodeType===1&&c.tagName!=="BR")walk(c)})};
  walk(el);return el.querySelectorAll(".word>span");
}
window.APP.splitWords=splitWords;
document.querySelectorAll("[data-split]").forEach(el=>{
  const w=splitWords(el);if(reduce)return;
  gsap.from(w,{yPercent:115,rotate:4,duration:1.1,ease:"expo.out",stagger:.04,delay:el.dataset.delay||0,
    scrollTrigger:{trigger:el,start:"top 88%"}});
});
if(!reduce)document.querySelectorAll(".up").forEach(el=>gsap.to(el,{opacity:1,y:0,duration:1.1,ease:"expo.out",scrollTrigger:{trigger:el,start:"top 90%"}}));
else document.querySelectorAll(".up").forEach(el=>{el.style.opacity=1;el.style.transform="none"});
/* parallax images */
if(!reduce)document.querySelectorAll("[data-parallax]").forEach(img=>{
  gsap.fromTo(img,{yPercent:-(+img.dataset.parallax||10)},{yPercent:+img.dataset.parallax||10,ease:"none",scrollTrigger:{trigger:img.parentElement,scrub:true,start:"top bottom",end:"bottom top"}});
});
