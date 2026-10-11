/* Feedback: the form sends feedback to the admin as "pending";
   the slideshow shows only feedback the admin has approved. */
(function(){
var FB={
 /* Feedback backend (server.js in this folder). Run it with:  node server.js
    POST  -> saves new feedback as "pending". Body: {name, anonymous, message, createdAt}
    GET   -> ?status=approved returns [{message, date, anonymous, name}] (no name for anonymous items)
    Set to "" to skip the backend: submissions are then only kept in the visitor's own browser (testing only). */
 api:"/api/feedback",
 interval:6500,   /* ms per slide */
 demo:true        /* sample slides, shown ONLY on localhost / file:// so you can preview the design */
};
var $=function(s){return document.querySelector(s)};
var form=$("#fbForm");if(!form)return;
var done=$("#fbDone"),err=$("#fbErr"),nameI=$("#fbName"),msgI=$("#fbMsg"),hp=$("#fbHp"),count=$("#fbCount"),hint=$("#fbHint"),send=$("#fbSend");
var show=$("#fbShow"),track=$("#fbTrack"),dotsEl=$("#fbDots"),ctrl=$("#fbCtrl"),empty=$("#fbEmpty"),prog=$("#fbProg"),demoNote=$("#fbDemo"),pauseB=$("#fbPause");
var still=matchMedia("(prefers-reduced-motion:reduce)").matches;
var local=FB.demo&&(location.protocol==="file:"||/^(localhost|127\.|\[::1\])/.test(location.hostname));
var DEMO=[
 {name:"Sample Client",anonymous:false,message:"Fast turnaround, and the pacing of the final cut was spot on. The titles felt like they belonged in the frame.",date:"2026-09-18"},
 {name:"Hidden Name",anonymous:true,message:"The color grade changed the whole mood of our film. Clear communication from start to finish.",date:"2026-09-02"},
 {name:"Sample Editor",anonymous:false,message:"Every cut sits right on the beat. Easy to work with, and notes were taken without any friction.",date:"2026-08-21"}
];

/* ---------- form ---------- */
var HINT={name:"Your name will appear next to your feedback.",anon:"The slideshow will say \u201CAnonymous\u201D. Only the site owner sees your name."};
function who(){return form.querySelector("input[name=fbWho]:checked").value}
form.addEventListener("change",function(e){if(e.target.name==="fbWho")hint.textContent=HINT[who()]});
msgI.addEventListener("input",function(){count.textContent=msgI.value.length+" / 500"});

function fail(msg,field){
 err.textContent=msg;
 [nameI,msgI].forEach(function(f){f.removeAttribute("aria-invalid")});
 if(field){field.setAttribute("aria-invalid","true");field.focus()}
}
function post(p){
 if(FB.api)return fetch(FB.api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}).then(function(r){if(!r.ok)throw new Error("bad")});
 try{var a=JSON.parse(localStorage.getItem("fb_pending")||"[]");a.push(p);localStorage.setItem("fb_pending",JSON.stringify(a))}catch(e){}
 return Promise.resolve();
}
form.addEventListener("submit",function(e){
 e.preventDefault();
 var name=nameI.value.trim(),msg=msgI.value.trim();
 if(!name)return fail("Please enter your name.",nameI);
 if(msg.length<10)return fail("Please write at least a short sentence (10 characters).",msgI);
 fail("");
 var p={name:name,anonymous:who()==="anon",message:msg,createdAt:new Date().toISOString()};
 if(hp.value){finish();return}                       /* bots fill the hidden field */
 send.disabled=true;send.textContent="Sending\u2026";
 post(p).then(finish).catch(function(){
  send.disabled=false;send.textContent="Send feedback";
  fail(local?"The feedback server is not running. Start it with: node server.js":"Could not send right now. Please try again in a moment.");
 });
});
function finish(){
 form.hidden=true;done.hidden=false;done.focus();
 send.disabled=false;send.textContent="Send feedback";
}
$("#fbAgain").addEventListener("click",function(){
 form.reset();count.textContent="0 / 500";hint.textContent=HINT.name;
 done.hidden=true;form.hidden=false;nameI.focus();
});

/* ---------- slideshow ---------- */
var slides=[],dots=[],idx=0,t=0,playing=!still,hold=false;
show.style.setProperty("--fbdur",FB.interval+"ms");
show.classList.toggle("paused",!playing);
function label(f){return f.anonymous?"Anonymous":(String(f.name||"").trim()||"Anonymous")}
function when(d){var x=new Date(d);return isNaN(x)?"":x.toLocaleDateString(undefined,{month:"short",year:"numeric"})}
function build(items){
 var n=items.length;slides=[];dots=[];idx=0;track.textContent="";dotsEl.textContent="";
 empty.hidden=n>0;ctrl.hidden=n<2;prog.parentNode.hidden=n<2;demoNote.hidden=!(n&&items===DEMO);
 items.forEach(function(f,i){
  var s=document.createElement("figure"),q=document.createElement("blockquote"),c=document.createElement("figcaption"),by=document.createElement("div"),av=document.createElement("span"),tx=document.createElement("span"),nm=document.createElement("span"),dt=document.createElement("span");
  s.className="fb-slide";s.setAttribute("role","group");s.setAttribute("aria-roledescription","slide");s.setAttribute("aria-label",(i+1)+" of "+n);
  q.textContent=f.message;
  by.className="by";av.className="av";av.setAttribute("aria-hidden","true");av.textContent=label(f).charAt(0).toUpperCase();
  nm.className="nm";nm.textContent=label(f);dt.className="dt";dt.textContent=when(f.date);
  tx.appendChild(nm);tx.appendChild(dt);by.appendChild(av);by.appendChild(tx);c.appendChild(by);s.appendChild(q);s.appendChild(c);
  track.appendChild(s);slides.push(s);
  var d=document.createElement("button");d.type="button";d.setAttribute("aria-label","Show feedback "+(i+1));
  d.addEventListener("click",function(){go(i)});dotsEl.appendChild(d);dots.push(d);
 });
 if(n)go(0);
}
function go(i){
 var n=slides.length;if(!n)return;idx=(i+n)%n;
 slides.forEach(function(s,k){s.classList.toggle("on",k===idx);s.setAttribute("aria-hidden",k===idx?"false":"true")});
 dots.forEach(function(d,k){if(k===idx)d.setAttribute("aria-current","true");else d.removeAttribute("aria-current")});
 arm();
}
function arm(){
 clearTimeout(t);prog.classList.remove("run");
 if(!playing||hold||slides.length<2)return;
 void prog.offsetWidth;prog.classList.add("run");
 t=setTimeout(function(){go(idx+1)},FB.interval);
}
$("#fbPrev").addEventListener("click",function(){go(idx-1)});
$("#fbNext").addEventListener("click",function(){go(idx+1)});
pauseB.addEventListener("click",function(){
 playing=!playing;show.classList.toggle("paused",!playing);
 pauseB.setAttribute("aria-label",playing?"Pause slideshow":"Play slideshow");arm();
});
pauseB.setAttribute("aria-label",playing?"Pause slideshow":"Play slideshow");
show.addEventListener("pointerenter",function(e){if(e.pointerType==="mouse"){hold=true;arm()}});
show.addEventListener("pointerleave",function(e){if(e.pointerType==="mouse"){hold=false;arm()}});
show.addEventListener("focusin",function(){hold=true;arm()});
show.addEventListener("focusout",function(){hold=false;arm()});
var sx=null;
show.addEventListener("pointerdown",function(e){sx=e.clientX});
show.addEventListener("pointerup",function(e){
 if(sx===null)return;var d=e.clientX-sx;sx=null;
 if(Math.abs(d)>50)go(idx+(d<0?1:-1));
});

/* load only approved feedback */
if(!FB.api)build(local?DEMO:[]);
else fetch(FB.api+(FB.api.indexOf("?")<0?"?":"&")+"status=approved")
 .then(function(r){if(!r.ok)throw new Error("bad");return r.json()})
 .then(function(d){build(Array.isArray(d)?d:(d&&d.items)||[])})
 .catch(function(){build(local?DEMO:[])});
})();