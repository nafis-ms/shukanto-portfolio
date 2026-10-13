/* Skill levels section (under Projects): builds one bar per skill saved in the admin panel
   (Content > Skill Levels) and plays the cinematic fill when the section scrolls into view.
   No skills saved = the section and its menu links stay hidden.
   Load after /api/index?p=content, before cinematic.js. Pairs with css/skillbars.css */
(function(){
var sec=document.getElementById("skillset"),card=document.getElementById("skxCard"),host=document.getElementById("skxList");
if(!sec||!card||!host)return;
var raw=window.SITE&&Array.isArray(SITE.skillLevels)?SITE.skillLevels:[];
var list=raw.map(function(s){
 var n=Math.round(Number(s&&s.level));
 return {name:String((s&&s.name)||"").trim(),level:isFinite(n)?Math.max(0,Math.min(100,n)):NaN};
}).filter(function(s){return s.name&&!isNaN(s.level)});
if(!list.length)return;

var still=matchMedia("(prefers-reduced-motion:reduce)").matches;
var ease=function(t){return 1-Math.pow(1-t,4)};          /* easeOutQuart: fast start, long soft landing */
var rows=[],timers=[],raf=[],played=false;

list.forEach(function(s,i){
 var li=document.createElement("div"),top=document.createElement("div"),name=document.createElement("div"),pct=document.createElement("span"),
  track=document.createElement("div"),fill=document.createElement("div"),sheen=document.createElement("i");
 li.className="skx-row";li.setAttribute("role","listitem");li.style.setProperty("--i",i);li.setAttribute("data-lv",s.level);
 top.className="skx-top";name.className="skx-name";name.textContent=s.name;
 pct.className="skx-pct";pct.setAttribute("aria-hidden","true");pct.textContent="0%";
 track.className="skx-track";track.setAttribute("role","progressbar");
 track.setAttribute("aria-label",s.name);track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","100");track.setAttribute("aria-valuenow",s.level);
 fill.className="skx-fill";fill.style.setProperty("--lv",s.level);fill.appendChild(sheen);
 track.appendChild(fill);top.appendChild(name);top.appendChild(pct);li.appendChild(top);li.appendChild(track);host.appendChild(li);
 rows.push({el:li,pct:pct,lv:s.level});
});

/* the section and its two menu links appear only when there is something to show */
sec.hidden=false;
[].forEach.call(document.querySelectorAll(".skx-nav"),function(a){a.hidden=false});

function setP(r,p){r.el.style.setProperty("--p",p);r.pct.textContent=Math.round(r.lv*p)+"%"}
function finish(r){setP(r,1);r.el.classList.remove("skx-run");r.el.classList.add("skx-done")}

function reset(){
 timers.forEach(clearTimeout);raf.forEach(cancelAnimationFrame);timers=[];raf=[];
 rows.forEach(function(r){r.el.classList.remove("skx-run","skx-done");setP(r,0)});
}

function play(){
 reset();
 if(still){rows.forEach(finish);return}
 rows.forEach(function(r,i){
  var dur=1500+r.lv*9;                                     /* higher skill = slightly longer climb */
  timers.push(setTimeout(function(){
   r.el.classList.add("skx-run");
   var t0=0,k=function(now){
    if(!t0)t0=now;
    var t=Math.min(1,(now-t0)/dur);
    setP(r,ease(t));
    if(t<1)raf[i]=requestAnimationFrame(k);else finish(r);
   };
   raf[i]=requestAnimationFrame(k);
  },900+i*130));                                           /* waits for the box + row reveal, then bars fire one after another */
 });
}

if(still){sec.classList.add("in");rows.forEach(finish)}
else if("IntersectionObserver" in window){
 new IntersectionObserver(function(en){
  en.forEach(function(x){
   if(x.isIntersecting&&!played){played=true;sec.classList.add("in");play()}
   else if(!x.isIntersecting&&played){played=false;sec.classList.remove("in");reset()}   /* replays when you scroll back */
  });
 },{threshold:0,rootMargin:"0px 0px -18% 0px"}).observe(sec);
}else{sec.classList.add("in");rows.forEach(finish)}

/* pointer spotlight that follows the cursor across the box */
if(!still&&matchMedia("(hover:hover)").matches){
 var pend=0,mx=0,my=0;
 card.addEventListener("pointermove",function(e){
  var b=card.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top;
  if(!pend)pend=requestAnimationFrame(function(){pend=0;card.style.setProperty("--mx",mx+"px");card.style.setProperty("--my",my+"px")});
 });
}
})();
