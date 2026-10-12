/* Dark / light mode toggle: ONE self-contained file.
   It adds the button to the header, injects its own styles (button + light theme),
   applies the saved choice and remembers it. Only needs: <script src="js/theme.js"></script> */
(function(){
var root=document.documentElement;
var COLORS={dark:"#000405",light:"#FFF8F1"};
var CSS=`/* ===== Paste at the END of css/theme.css =====
   1) the toggle button   2) smooth switch   3) the light theme            */

/* ---------- 1. toggle button (sits in the header, right of Contact) ---------- */
header nav{align-items:center}
.tmode{
  position:relative;width:38px;height:38px;flex:none;display:grid;place-items:center;
  margin-left:clamp(0px,.8vw,10px);
  border:1px solid rgba(255,255,255,.6);border-radius:50%;color:#fff;
  transition:background .3s,border-color .3s,transform .3s var(--e)
}
.tmode:hover{background:rgba(255,255,255,.2);border-color:#fff}
.tmode:active{transform:scale(.92)}
.tmode svg{
  grid-area:1/1;width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;
  stroke-linecap:round;stroke-linejoin:round;
  transition:transform .55s var(--e),opacity .3s
}
.tmode .i-moon{opacity:0;transform:rotate(-90deg) scale(.5)}
:root[data-theme=light] .tmode .i-sun{opacity:0;transform:rotate(90deg) scale(.5)}
:root[data-theme=light] .tmode .i-moon{opacity:1;transform:none}

/* ---------- 2. smooth colour fade while switching ---------- */
html.tt *,html.tt *::before,html.tt *::after{
  transition:background-color .45s ease,color .45s ease,border-color .45s ease,fill .45s ease,stroke .45s ease
}

/* ---------- 3. LIGHT THEME ---------- */
:root[data-theme=light]{
  --bg:#FFF8F1;
  --deep:#FDEBDB;
  --navy:#C2410C;   /* deep orange: buttons, strong accents */
  --blue:#EA6A12;   /* orange: icons, highlights */
  --ice:#FED7AA;    /* soft peach tint */
  --ink:#2B1B12;
  --dim:rgba(43,27,18,.7);
  --line:rgba(154,52,18,.2);
  color-scheme:light;
}
:root[data-theme=light] ::selection{background:var(--blue);color:#fff}

/* nav links in the footer were hard-coded white */
:root[data-theme=light] footer nav a{color:var(--ink)}

/* hero */
:root[data-theme=light] .glow::before{background:radial-gradient(ellipse 80% 60% at 70% 30%,rgba(254,215,170,.95) 0%,var(--bg) 70%)}
:root[data-theme=light] .grid-bg{
  background-image:
    linear-gradient(rgba(194,65,12,.08) 1px,transparent 1px),
    linear-gradient(90deg,rgba(194,65,12,.08) 1px,transparent 1px)
}
:root[data-theme=light] #erase{filter:invert(1)}   /* the pointer "erase" effect paints near-white instead of near-black */
:root[data-theme=light] .head{background:var(--navy);box-shadow:0 0 12px rgba(194,65,12,.5)}
:root[data-theme=light] .head::before{border-top-color:var(--navy)}
:root[data-theme=light] .clip{background:rgba(194,65,12,.78);border-color:var(--navy)}
:root[data-theme=light] .track:nth-child(2) .clip{background:rgba(234,106,18,.55);border-color:var(--blue)}

/* buttons */
:root[data-theme=light] .btn{border-color:rgba(194,65,12,.55);color:var(--ink)}
:root[data-theme=light] .btn:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
:root[data-theme=light] .btn.solid{background:var(--navy);color:#fff;border-color:var(--navy)}
:root[data-theme=light] .btn.solid:hover{background:transparent;color:var(--navy)}

/* content */
:root[data-theme=light] .chips span{background:rgba(254,215,170,.45);border-color:rgba(234,106,18,.5);color:var(--navy)}
:root[data-theme=light] .chips span:hover{background:var(--navy);color:#fff;border-color:var(--navy);box-shadow:0 8px 22px rgba(194,65,12,.3),0 0 0 4px rgba(234,106,18,.18)}
:root[data-theme=light] .mset span{color:rgba(43,27,18,.38)}

/* projects sphere */
:root[data-theme=light] .vig{background:radial-gradient(ellipse 88% 92% at 50% 50%,transparent 48%,rgba(253,235,219,.55) 80%,rgba(253,235,219,.95) 100%)}
:root[data-theme=light] .card figure::after{background:rgba(253,235,219,var(--d,0));box-shadow:inset 0 0 0 1px rgba(194,65,12,.12)}
:root[data-theme=light] #headline{text-shadow:0 2px 28px rgba(255,248,241,.8)}
:root[data-theme=light] .bio p{color:var(--dim)}
:root[data-theme=light] .mono{background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff}
:root[data-theme=light] .gridbtn b{background:var(--navy)}
:root[data-theme=light] .cue{color:rgba(43,27,18,.55)}
:root[data-theme=light] .cue s{background:rgba(194,65,12,.25)}
:root[data-theme=light] .cue s::after{background:var(--navy)}
/* close buttons (light theme): white border + text on orange (deep orange keeps white text readable) */
:root[data-theme=light] .gridclose,
:root[data-theme=light] .close{border-color:#fff;background:var(--navy);color:#fff}
:root[data-theme=light] .gridclose:hover,
:root[data-theme=light] .close:hover{border-color:#fff;background:#9A3412}
:root[data-theme=light] #dot{background:rgba(194,65,12,.85)}
:root[data-theme=light] #dot.wide{background:rgba(194,65,12,.1);border-color:rgba(194,65,12,.7)}
:root[data-theme=light] .rows figcaption{color:#EAF4FB}   /* caption sits on a dark gradient over the image */
:root[data-theme=light] #lit .scrim{background:rgba(255,248,241,.92)}
:root[data-theme=light] .shot{box-shadow:0 30px 80px rgba(194,65,12,.28)}
:root[data-theme=light] .note{color:var(--ink)}

/* feedback */
:root[data-theme=light] .fld input,
:root[data-theme=light] .fld textarea{background:rgba(255,255,255,.75);color:var(--ink)}
:root[data-theme=light] .fld input:focus,
:root[data-theme=light] .fld textarea:focus{background:#fff;border-color:var(--blue);box-shadow:0 0 0 3px rgba(234,106,18,.2)}
:root[data-theme=light] .fld [aria-invalid=true]{border-color:#b91c1c}
:root[data-theme=light] .err{color:#b91c1c}
:root[data-theme=light] .opt:hover span{border-color:rgba(194,65,12,.55)}
:root[data-theme=light] .opt input:checked+span{background:var(--navy);color:#fff;border-color:var(--navy)}
:root[data-theme=light] .opt input:focus-visible+span{outline-color:var(--navy)}
:root[data-theme=light] .done{background:rgba(254,215,170,.35);border-color:rgba(234,106,18,.45)}
:root[data-theme=light] .tick svg{stroke:var(--navy)}
:root[data-theme=light] .fb-show{background:radial-gradient(ellipse 90% 80% at 80% 0%,rgba(254,215,170,.8),var(--deep) 72%);border-color:rgba(234,106,18,.35)}
:root[data-theme=light] .fb-show .q{color:rgba(234,106,18,.3)}
:root[data-theme=light] .av{background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff}
:root[data-theme=light] .dots button::before{background:rgba(194,65,12,.28)}
:root[data-theme=light] .dots button:hover::before{background:rgba(194,65,12,.6)}
:root[data-theme=light] .dots button[aria-current=true]::before{background:var(--navy)}
:root[data-theme=light] .ib:hover{background:rgba(234,106,18,.15)}
:root[data-theme=light] .fb-prog{background:rgba(194,65,12,.12)}

/* let's talk + footer */
:root[data-theme=light] .talk h2{background:linear-gradient(180deg,var(--navy) 0%,var(--blue) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
:root[data-theme=light] .talk p{color:var(--ink)}
:root[data-theme=light] .emailme{border-color:var(--navy);box-shadow:0 0 18px rgba(234,106,18,.35),inset 0 0 12px rgba(254,215,170,.14)}
:root[data-theme=light] .soc a{color:var(--navy)}
:root[data-theme=light] .soc a:hover{background:var(--navy);color:#fff}

/* loader, intro film, letterbox bars and the grain stay dark in both modes (cinematic) */
:root[data-theme=light] #splash,
:root[data-theme=light] #intro,
:root[data-theme=light] .veil{background:#000}
/* letterbox bars follow the light theme instead of staying black (change the colour here) */
:root[data-theme=light] .lbx{background:var(--deep)}
:root[data-theme=light] #splash,
:root[data-theme=light] #intro{color:#EAF4FB}
:root[data-theme=light] .fallback{background:radial-gradient(circle at 50% 46%,#0F4C75 0%,#000405 45%,#000 75%)}
:root[data-theme=light] .grain{opacity:.045}

/* header + cursor used a difference blend, which would tint orange into blue: switch to plain colours */
:root[data-theme=light] header{mix-blend-mode:normal}
:root[data-theme=light] header .wordmark,
:root[data-theme=light] header nav a{color:var(--ink)}
:root[data-theme=light] .tmode{color:var(--ink);border-color:rgba(43,27,18,.45)}
:root[data-theme=light] .tmode:hover{background:rgba(194,65,12,.12);border-color:var(--navy)}
:root[data-theme=light] header nav a.cvbtn{color:var(--ink);border-color:rgba(43,27,18,.45)}
:root[data-theme=light] header nav a.cvbtn:hover,
:root[data-theme=light] header nav a.cvbtn:focus-visible{background:rgba(194,65,12,.12);border-color:var(--navy)}
:root[data-theme=light] #dot{mix-blend-mode:normal;background:rgba(194,65,12,.85)}
:root[data-theme=light] #dot.wide{background:rgba(194,65,12,.1);border-color:rgba(194,65,12,.7)}

@media (prefers-reduced-motion:reduce){
  .tmode svg{transition:none}
  html.tt *,html.tt *::before,html.tt *::after{transition:none}
}
`;

/* apply the saved theme immediately (the loading splash hides any flash) */
var saved=null;try{saved=localStorage.getItem("theme")}catch(e){}
root.setAttribute("data-theme",saved==="light"?"light":"dark");

/* styles */
if(!document.getElementById("theme-style")){
 var st=document.createElement("style");st.id="theme-style";st.textContent=CSS;document.head.appendChild(st);
}

/* theme-color meta */
var meta=document.querySelector('meta[name="theme-color"]');
if(!meta){meta=document.createElement("meta");meta.name="theme-color";document.head.appendChild(meta)}

function init(){
 var btn=document.getElementById("tmode");
 if(!btn){
  var nav=document.querySelector("header nav");
  if(!nav)return;
  btn=document.createElement("button");
  btn.id="tmode";btn.className="tmode";btn.type="button";
  btn.innerHTML='<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  nav.appendChild(btn);
 }
 var timer=0;
 function cur(){return root.getAttribute("data-theme")==="light"?"light":"dark"}
 function apply(t,save){
  root.setAttribute("data-theme",t);
  var label=t==="light"?"Switch to dark mode":"Switch to light mode";
  btn.setAttribute("aria-label",label);btn.title=label;
  meta.setAttribute("content",COLORS[t]);
  if(save){try{localStorage.setItem("theme",t)}catch(e){}}
 }
 apply(cur(),false);
 btn.addEventListener("click",function(){
  root.classList.add("tt");
  apply(cur()==="light"?"dark":"light",true);
  clearTimeout(timer);timer=setTimeout(function(){root.classList.remove("tt")},650);
 });
 addEventListener("storage",function(e){
  if(e.key==="theme"&&(e.newValue==="light"||e.newValue==="dark"))apply(e.newValue,false);
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();