/* Cinematic motion layer: splits text, assigns each block its own effect,
   plays it when the block enters the screen (and replays when you scroll back).
   Load after site.js. Needs css/cinematic.css */
(function(){
if(matchMedia("(prefers-reduced-motion:reduce)").matches||!("IntersectionObserver" in window))return;
var $$=function(s){return [].slice.call(document.querySelectorAll(s))},body=document.body;

/* [selector, effect, split mode, base delay (s), step between siblings (s)] */
var T=[
 ["header","drop"],
 [".hero h1","rise","chars",.2],
 [".hero .btn","up",0,1.3,.14],
 [".hero .tl","tl"],
 ["#about h2","mask","words"],
 ["#about .text p","focus","words",.5,.9],
 ["#about .contact li","wipe",0,2,.18],
 ["#about .cvdl","up",0,2.7],
 ["#services h2","track"],
 ["#services .list li","wipe",0,.3,.16],
 ["#feedback h2","mask","words"],
 ["#feedback .fb-intro","focus","words",.4],
 ["#feedback .fb-form","up",0,.3],
 ["#feedback .fb-show","reel"],
 [".marq","reel"],
 [".talk h2","zoom"],
 [".talk p","focus","words",.7],
 [".emailme","up",0,1.1],
 ["footer","up"]
];

function split(el,mode){
 var n=0;
 if(mode==="chars")el.setAttribute("aria-label",el.textContent.replace(/\s+/g," ").trim());
 [].slice.call(el.childNodes).forEach(function(nd){
  if(nd.nodeType!==3)return;
  var f=document.createDocumentFragment();
  nd.nodeValue.split(/(\s+)/).forEach(function(tok){
   if(!tok)return;
   if(/^\s+$/.test(tok)){f.appendChild(document.createTextNode(" "));return}
   var w=document.createElement("span");w.className="w";
   if(mode==="chars")w.setAttribute("aria-hidden","true");
   (mode==="chars"?Array.from(tok):[tok]).forEach(function(ch){
    var c=document.createElement("span");c.className="c";c.textContent=ch;c.style.setProperty("--i",n++);w.appendChild(c);
   });
   f.appendChild(w);
  });
  el.replaceChild(f,nd);
 });
}

var els=[];
T.forEach(function(t){
 $$(t[0]).forEach(function(el,k){
  el.setAttribute("data-fx",t[1]);
  if(t[2])split(el,t[2]);
  el.style.setProperty(t[2]?"--b":"--d",((t[3]||0)+k*(t[4]||0))+"s");
  els.push(el);
 });
});
$$(".list li svg *").forEach(function(s){s.setAttribute("pathLength","1")});
$$(".list li").forEach(function(li){
 [].forEach.call(li.querySelectorAll(".chips span"),function(c,j){c.style.setProperty("--j",j)});
});
$$(".tl .clip").forEach(function(c,k){c.style.setProperty("--k",k)});

/* film look: letterbox + grain */
var gr=document.createElement("div");
gr.className="grain";gr.setAttribute("aria-hidden","true");body.appendChild(gr);

/* play when visible, reset when out of view so it replays */
var io=new IntersectionObserver(function(en){en.forEach(function(e){
 if(e.isIntersecting&&e.intersectionRatio>=.3)e.target.classList.add("in");
 else if(!e.isIntersecting)e.target.classList.remove("in");
})},{threshold:[0,.3],rootMargin:"0px 0px -6% 0px"});

/* wait for the loader to finish before the first scene */
function boot(){
 setTimeout(function(){els.forEach(function(e){io.observe(e)})},1000);
}
if(body.classList.contains("revealed"))boot();
else{var mo=new MutationObserver(function(){if(body.classList.contains("revealed")){mo.disconnect();boot()}});mo.observe(body,{attributes:true,attributeFilter:["class"]})}

/* marquee leans with scroll speed */
var mq=$$(".marq")[0],lastY=scrollY,sk=0,raf=0;
if(mq){
 var step=function(){sk*=.9;if(Math.abs(sk)<.02)sk=0;mq.style.setProperty("--sk",sk.toFixed(2)+"deg");raf=sk?requestAnimationFrame(step):0};
 addEventListener("scroll",function(){var y=scrollY;sk=Math.max(-8,Math.min(8,sk+(y-lastY)*.04));lastY=y;if(!raf)raf=requestAnimationFrame(step)},{passive:true});
}
})();