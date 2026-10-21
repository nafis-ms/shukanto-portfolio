/* Projects section: sphere, grid view, lightbox, cursor */
(function(){
/* ===== EDIT YOUR PROJECTS HERE =====
   [title, category + tools, note, thumbnail image URL, video URL (.mp4), embed URL (YouTube/Vimeo)]
   Leave thumbnail empty "" to use an auto-made placeholder. Use video OR embed, or leave both empty. */
var N=P.length,GA=Math.PI*(3-Math.sqrt(5)),PI=Math.PI;
var $=function(s){return document.querySelector(s)};
var body=document.body,root=document.documentElement,world=$("#world"),orb=$("#orb"),head=$("#headline"),rows=$("#rows"),plate=$("#plate"),stage=$("#stage");
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
/* cinematic headline: one span per letter (staggered reveal + travelling light sweep, see projects.css) */
(function(){var w=head&&head.querySelector(".inner>span");if(!w)return;var t=(w.textContent||"").trim();if(!t)return;
 head.setAttribute("aria-label",t);w.setAttribute("aria-hidden","true");w.textContent="";
 t.split("").forEach(function(ch,k){var l=document.createElement("span");l.className="ch";l.style.setProperty("--i",k);l.textContent=ch;w.appendChild(l)})})();

function ph(i,t){
 var h=(i*47+200)%360,h2=(h+50)%360;
 var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl('+h+',55%,22%)"/><stop offset="1" stop-color="hsl('+h2+',60%,9%)"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><path d="M0 300 L600 230" stroke="hsla('+h2+',80%,70%,.25)" stroke-width="2"/><circle cx="300" cy="190" r="38" fill="none" stroke="#f4f2ef" stroke-opacity=".7" stroke-width="2"/><path d="M290 172 L318 190 L290 208Z" fill="#f4f2ef" fill-opacity=".85"/><text x="24" y="368" font-family="Georgia,serif" font-size="26" fill="#f4f2ef" fill-opacity=".85">'+t.replace(/&/g,"&amp;")+'</text></svg>';
 return "data:image/svg+xml;utf8,"+encodeURIComponent(s);
}
var U=[],cards=[],cimg=[],thumbs=[],R=300,persp=1150,zs=[],pvS=[],pvG=[],gridIO=null;
for(var i=0;i<N;i++){
 var y=1-(2*i+1)/N,rad=Math.sqrt(Math.max(0,1-y*y)),th=i*GA+PI/2,x=Math.cos(th)*rad,z=Math.sin(th)*rad;
 U.push({x:x,y:y,z:z,lat:Math.asin(y)*180/PI,lon:Math.atan2(x,z)*180/PI});
 thumbs[i]=P[i][3]||ph(i,P[i][0]);
 var c=document.createElement("button");c.className="card";c.dataset.idx=i;c.setAttribute("aria-label","Open "+P[i][0]);
 var f=document.createElement("figure"),im=document.createElement("img");im.alt="";im.decoding="async";
 im.onload=function(){this.classList.add("in");window.loadTick&&loadTick()};im.onerror=function(){window.loadTick&&loadTick()};im.src=thumbs[i];
 f.appendChild(im);c.appendChild(f);orb.appendChild(c);cards.push(c);cimg.push(im);
 var yid=window.Preview&&Preview.ytId(P[i][5]);if(yid)pvS[i]=Preview.add(f,yid,c);
}
function layout(){
 var w=innerWidth,h=innerHeight,s=w<=380?0:w<=640?1:2;
 R=Math.max([108,120,155][s],Math.min(480,h*[.38,.42,.46][s],w*[.48,.52,.58][s]));
 var cw=Math.round(Math.max(72,R*[.44,.46,.47][s]));
 persp=w<=380?620:w<=640?760:w<=900?920:1150;
 root.style.setProperty("--cw",cw+"px");root.style.setProperty("--persp",persp+"px");
 for(var i=0;i<N;i++){var u=U[i];cards[i].style.transform="translate3d("+(u.x*R)+"px,"+(-u.y*R)+"px,"+(u.z*R)+"px) rotateY("+u.lon+"deg) rotateX("+u.lat+"deg)"}
}
/* camera: only runs while the section is on screen */
var work=$(".work"),inView=false;
if("IntersectionObserver" in window){new IntersectionObserver(function(en){inView=en[0].isIntersecting;if(inView)work.classList.add("seen")},{threshold:.15}).observe(work)}else{inView=true;work.classList.add("seen")}
var spin=0,tilt=-4,dragX=0,dragY=0,velX=.0,velY=0,LIM=32,focused=-1,dragging=false,shotOpen=false,auto=.035,lastO=[],lastD=[];
var q=matchMedia("(pointer:coarse)").matches?25:1000;
var still=matchMedia("(prefers-reduced-motion:reduce)").matches;
/* ---- sphere health: if 3D is broken or too slow on this device, swap the sphere for the slideshow ----
   ?sphere=0 forces the slideshow, ?sphere=1 forces the sphere (handy for testing). */
var sphereOn=true,force=(/[?&]sphere=([01])/.exec(location.search)||[])[1],hp={n:0,last:0,sum:0,cnt:0,done:force==="1"};
function geoOK(){
 /* in a working 3D scene the card facing us is clearly bigger than the one behind. If the browser flattens the scene they match. */
 if(N<4)return true;
 var f=0,b=0,i;for(i=1;i<N;i++){if(zs[i]>zs[f])f=i;if(zs[i]<zs[b])b=i}
 if(zs[f]-zs[b]<.5)return true;
 var rf=cards[f].getBoundingClientRect(),rb=cards[b].getBoundingClientRect();
 if(!rf.width||!rb.width)return false;
 return rf.width/rb.width>1.12;
}
function health(ts){
 if(hp.done)return;
 if(!inView||shotOpen||document.hidden){hp.last=0;return}
 hp.n++;
 if(hp.n===4&&!geoOK()){hp.done=true;useSlides("3d");return}
 if(hp.last&&hp.n>14){var dt=ts-hp.last;if(dt<400){hp.sum+=dt;hp.cnt++}}
 hp.last=ts;
 if(hp.cnt>=50){hp.done=true;if(hp.sum/hp.cnt>75)useSlides("slow")}
}
function frame(ts){
 if(!sphereOn)return;
 if(!inView&&!shotOpen){requestAnimationFrame(frame);return}
 if(!dragging&&!shotOpen){
  dragX+=velX+(still||body.classList.contains("gridview")?0:auto);
  dragY+=velY;velX*=.94;velY*=.94;
  if(Math.abs(velX)<.002)velX=0;if(Math.abs(velY)<.002)velY=0;
  dragY=clamp(tilt+dragY,-LIM,LIM)-tilt;
 }
 var sx=tilt+dragY,sy=spin+dragX;
 world.style.transform="rotateY("+sy+"deg) rotateX("+sx+"deg)";
 head.style.transform="rotateX("+(-sx)+"deg) rotateY("+(-sy)+"deg) translateZ("+(R*.62)+"px)";
 var a=sx*PI/180,b=sy*PI/180,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),near=persp*.66;
 for(var i=0;i<N;i++){
  var u=U[i],Y=-u.y,z1=Y*sa+u.z*ca,zf=-u.x*sb+z1*cb;zs[i]=zf;
  var dim=1-(.14+.86*Math.pow((zf+1)/2,.85)),fade=1,absZ=zf*R;
  if(absZ>near)fade=Math.max(0,1-(absZ-near)/190);
  if(shotOpen){dim=Math.min(1,dim+.78);if(i===focused)fade=0}
  dim=Math.round(dim*q)/q;fade=Math.round(fade*q)/q;
  if(lastO[i]!==fade){lastO[i]=fade;cards[i].style.opacity=fade}
  if(lastD[i]!==dim){lastD[i]=dim;cards[i].style.setProperty("--d",dim)}
 }
 health(ts);
 if(sphereOn)requestAnimationFrame(frame);
}
/* drag */
var pid=null,sx0=0,sy0=0,lx=0,ly=0,moved=0,downCard=null,captured=false,coarse=matchMedia("(pointer:coarse)").matches;
stage.addEventListener("pointerdown",function(e){
 if(shotOpen||pid!==null)return;
 downCard=e.target.closest(".card");pid=e.pointerId;sx0=lx=e.clientX;sy0=ly=e.clientY;moved=0;velX=velY=0;captured=false;
 if(e.pointerType!=="touch"){stage.setPointerCapture(pid);captured=true;dragging=true}
});
stage.addEventListener("pointermove",function(e){
 if(e.pointerId!==pid)return;
 var dx=e.clientX-sx0,dy=e.clientY-sy0;
 if(!captured){
  if(Math.hypot(dx,dy)<10)return;
  if(Math.abs(dy)>Math.abs(dx)*1.15){pid=null;return}
  stage.setPointerCapture(pid);captured=true;dragging=true;lx=e.clientX;ly=e.clientY;
 }
 var ddx=e.clientX-lx,ddy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
 moved=Math.max(moved,Math.hypot(dx,dy));
 velX=ddx*.13;velY=-ddy*.13;dragX+=velX;dragY=clamp(tilt+dragY-ddy*.13,-LIM,LIM)-tilt;
});
function endDrag(e,cancel){
 if(e.pointerId!==pid)return;
 pid=null;dragging=false;captured=false;
 var slop=e.pointerType==="touch"||coarse?14:6;
 if(!cancel&&moved<slop&&downCard&&!shotOpen){velX=velY=0;openShot(+downCard.dataset.idx,downCard)}
 downCard=null;
}
stage.addEventListener("pointerup",function(e){endDrag(e,false)});
stage.addEventListener("pointercancel",function(e){endDrag(e,true)});
stage.addEventListener("keydown",function(e){
 if(e.key==="Enter"||e.key===" "){var c=e.target.closest(".card");if(c){e.preventDefault();openShot(+c.dataset.idx,c)}}
});
/* lightbox */
var srcEl=null,closeT=0,shot=$("#shot"),vid=$("#litVid"),emb=$("#litEmb"),lastFocus=null;
function flyTo(el){
 var pr=plate.getBoundingClientRect(),r=el.getBoundingClientRect();
 var dx=r.left+r.width/2-(pr.left+pr.width/2),dy=r.top+r.height/2-(pr.top+pr.height/2),sc=Math.max(.04,r.width/pr.width);
 plate.style.transform="translate("+dx+"px,"+dy+"px) scale("+sc+")";plate.style.opacity="0";
}
function openShot(i,el){
 if(shotOpen)return;
 shotOpen=true;focused=i;srcEl=el;lastFocus=document.activeElement;clearTimeout(closeT);
 var d=P[i];
 $("#litImg").src=thumbs[i];$("#litTitle").textContent=d[0];$("#litWhere").textContent=d[1];$("#litNote").textContent=d[2];
 var lk=$("#litLink");if(/^https?:\/\//i.test(d[6]||"")){lk.href=d[6];lk.hidden=false}else{lk.removeAttribute("href");lk.hidden=true}
 shot.className="shot";
 if(d[5]){emb.src=d[5];shot.classList.add("emb")}
 else if(d[4]){vid.src=d[4];vid.poster=P[i][3]||"";shot.classList.add("vid")}
 plate.style.transition="none";plate.style.transform="";plate.style.opacity="";
 flyTo(el);void plate.offsetWidth;
 plate.style.transition="";plate.style.transform="";plate.style.opacity="";
 body.classList.add("lit");
 setTimeout(function(){var c=$(".close");if(c)c.focus({preventScroll:true})},60);
}
function closeShot(){
 if(!shotOpen)return;
 shotOpen=false;focused=-1;body.classList.remove("lit");
 vid.pause();vid.removeAttribute("src");vid.load();emb.removeAttribute("src");
 var el=srcEl;
 if(body.classList.contains("gridview")){var gi=srcEl&&srcEl.dataset.idx,gf=gi!=null&&rows.querySelector('figure[data-idx="'+gi+'"]');if(gf)el=gf}
 if(el)flyTo(el);
 closeT=setTimeout(function(){plate.style.transition="none";plate.style.transform="";plate.style.opacity="";void plate.offsetWidth;plate.style.transition=""},640);
 if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
$("#lit").addEventListener("click",function(e){if(e.target.closest("[data-close]"))closeShot()});
rows.addEventListener("click",function(e){var f=e.target.closest("figure");if(f)openShot(+f.dataset.idx,f)});
rows.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){var f=e.target.closest("figure");if(f){e.preventDefault();openShot(+f.dataset.idx,f)}}});
/* grid */
/* All Projects: one block per category, centered heading, first 3 projects + "View all" when there are more.
   "View all" swaps the grid for that category's page (every project in it); Back / Esc returns. */
var PREVIEW=3,gridCat=null;
function fig(i){
 var g=document.createElement("figure");g.dataset.idx=i;g.tabIndex=0;g.setAttribute("role","button");
 var gi=document.createElement("img");gi.alt=P[i][0];gi.loading="lazy";gi.src=thumbs[i];
 var gc=document.createElement("figcaption");gc.textContent=P[i][0];
 g.appendChild(gi);g.appendChild(gc);
 var yid=window.Preview&&Preview.ytId(P[i][5]);
 if(yid){var h=Preview.add(g,yid,g);if(h){g._pv=h;pvG.push(h);if(gridIO){h.vis=false;gridIO.observe(g)}}}
 return g;
}
function renderGrid(id,focusBack){
 var list=CATS.filter(function(c){return id===null||c.id===id});
 if(id!==null&&!list.length){renderGrid(null);return}
 pvG.forEach(function(h){Preview.drop(h)});pvG=[];
 if(gridIO)gridIO.disconnect();
 gridIO="IntersectionObserver" in window?new IntersectionObserver(function(en){en.forEach(function(e){if(e.target._pv)e.target._pv.vis=e.isIntersecting})},{root:$("#grid"),threshold:.4}):null;
 gridCat=id;rows.textContent="";
 if(!list.length){var em=document.createElement("p");em.className="cat-empty";em.textContent="No projects yet.";rows.appendChild(em)}
 list.forEach(function(c){
  var sec=document.createElement("section"),hd=document.createElement("h3"),g=document.createElement("div"),full=id!==null,n=c.items.length;
  sec.className="cat"+(full?" full":"");sec.setAttribute("aria-labelledby","cat-"+c.id);
  hd.className="cat-h";hd.id="cat-"+c.id;hd.textContent=c.name;hd.tabIndex=-1;
  g.className="rows";
  (full?c.items:c.items.slice(0,PREVIEW)).forEach(function(i){g.appendChild(fig(i))});
  if(full){
   var bk=document.createElement("button");bk.type="button";bk.className="cat-back";bk.dataset.back="1";
   bk.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>All projects';
   sec.appendChild(bk);
  }
  /* header: name centered, a light running along a rule on each side, project count at the right */
  var head=document.createElement("div"),l1=document.createElement("span"),ln=document.createElement("span"),ct=document.createElement("span"),end=document.createElement("div");
  head.className="cat-head";
  l1.className="cat-line";l1.setAttribute("aria-hidden","true");
  ln.className="cat-line";ln.setAttribute("aria-hidden","true");ct.className="cat-count";ct.textContent=n+(n===1?" project":" projects");
  end.className="cat-end";end.appendChild(ln);end.appendChild(ct);
  head.appendChild(l1);head.appendChild(hd);head.appendChild(end);
  sec.appendChild(head);sec.appendChild(g);
  /* "View all" is the last tile of the row, right after the third project */
  if(!full&&n>PREVIEW){
   var b=document.createElement("button"),bg=document.createElement("span"),rest=c.items.slice(PREVIEW,PREVIEW+3);
   b.type="button";b.className="vtile viewall";b.dataset.cat=c.id;b.setAttribute("aria-label","View all "+n+" projects in "+c.name);
   bg.className="vt-bg"+(rest.length>1?" n"+rest.length:"");bg.setAttribute("aria-hidden","true");
   rest.forEach(function(i){var im=document.createElement("img");im.alt="";im.decoding="async";im.src=thumbs[i];bg.appendChild(im)});
   b.appendChild(bg);
   var bt=document.createElement("span"),bb=document.createElement("span"),bd=document.createElement("span");
   bt.className="vt-bar t";bb.className="vt-bar b";bd.className="vt-body";bd.setAttribute("aria-hidden","true");
   bd.innerHTML='<span class="vt-kick"></span><span class="vt-row"><span class="vt-lbl">View all</span><span class="vt-arr"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></span>';
   bd.firstChild.textContent="+"+(n-PREVIEW)+" more";
   b.appendChild(bt);b.appendChild(bb);b.appendChild(bd);g.appendChild(b);
  }
  rows.appendChild(sec);
  if(full)hd.focus({preventScroll:true});
 });
 $("#grid").scrollTop=0;
 if(id===null&&focusBack){var vb=rows.querySelector('.viewall[data-cat="'+focusBack+'"]');if(vb)vb.focus({preventScroll:true})}
}
rows.addEventListener("click",function(e){
 var v=e.target.closest(".viewall");if(v){renderGrid(v.dataset.cat);return}
 if(e.target.closest("[data-back]"))renderGrid(null,gridCat);
});
function setGrid(o){body.classList.toggle("gridview",o);if(o)renderGrid(null)}
$("#gridBtn").addEventListener("click",function(){setGrid(!body.classList.contains("gridview"))});
$("#gridClose").addEventListener("click",function(){setGrid(false)});
addEventListener("keydown",function(e){
 if(e.key!=="Escape")return;
 if(shotOpen)closeShot();
 else if(body.classList.contains("gridview")){if(gridCat!==null)renderGrid(null,gridCat);else setGrid(false)}
});
/* resize */
var lw=innerWidth,lh=innerHeight;
addEventListener("resize",function(){if(Math.abs(innerWidth-lw)<20&&Math.abs(innerHeight-lh)<20)return;lw=innerWidth;lh=innerHeight;layout()});
addEventListener("orientationchange",function(){setTimeout(function(){lw=innerWidth;lh=innerHeight;layout()},220)});
/* cursor */
var dot=$("#dot"),mx=-100,my=-100,cx=-100,cy=-100;
if(matchMedia("(hover:hover) and (pointer:fine)").matches){
 addEventListener("pointermove",function(e){mx=e.clientX;my=e.clientY});
 document.addEventListener("mouseover",function(e){dot.classList.toggle("wide",!!e.target.closest(".card,a,button,#grid figure"))});
 (function f(){cx+=(mx-cx)*.2;cy+=(my-cy)*.2;dot.style.transform="translate3d("+cx+"px,"+cy+"px,0)";requestAnimationFrame(f)})();
}
/* live previews: decide which few videos play right now */
function pvTick(){
 if(!window.Preview)return;
 var live=inView&&!shotOpen&&!document.hidden,g=body.classList.contains("gridview"),want=[],i;
 if(live&&!g&&sphereOn){
  for(i=0;i<N;i++)if(pvS[i]&&zs[i]>.12)want.push(i);          /* only cards facing the viewer */
  want.sort(function(a,b){return zs[b]-zs[a]});want=want.slice(0,Preview.max);
 }
 pvS.forEach(function(h,k){h.set(want.indexOf(k)>-1)});
 var wg=(g&&!shotOpen&&!document.hidden)?pvG.filter(function(h){return h.vis}).slice(0,Preview.maxGrid):[];
 pvG.forEach(function(h){h.set(wg.indexOf(h)>-1)});
}
setInterval(pvTick,350);
/* ===== Showcase slideshow: used instead of the sphere where the sphere cannot run ===== */
var slidesBuilt=false;
function useSlides(why){
 if(!sphereOn&&slidesBuilt)return;
 sphereOn=false;work.classList.add("nosphere");body.classList.add("nosphere");
 try{console.info("[projects] sphere unavailable ("+why+"): showing slideshow")}catch(e){}
 pvS.forEach(function(h){h.set(false)});
 if(!slidesBuilt)buildSlides();
}
function buildSlides(){
 slidesBuilt=true;
 var pad=function(n){return n<10?"0"+n:""+n};
 var box=document.createElement("div");box.className="slides";box.id="slides";
 box.setAttribute("role","region");box.setAttribute("aria-roledescription","carousel");box.setAttribute("aria-label","Project showcase");
 var bg=document.createElement("div");bg.className="sl-bg";bg.setAttribute("aria-hidden","true");
 var bgA=document.createElement("img"),bgB=document.createElement("img");bgA.alt=bgB.alt="";bg.appendChild(bgA);bg.appendChild(bgB);
 var hd=document.createElement("div");hd.className="sl-head";hd.innerHTML='<span>Selected work</span><h2>Visuals</h2>';
 var track=document.createElement("div");track.className="sl-track";track.tabIndex=0;track.setAttribute("aria-label","Projects, swipe or use arrow keys");
 var sl=[];
 for(var i=0;i<N;i++){(function(i){
  var c=document.createElement("button");c.type="button";c.className="sl-card";c.dataset.idx=i;c.setAttribute("aria-label","Open "+P[i][0]+" ("+(i+1)+" of "+N+")");
  var f=document.createElement("figure"),im=document.createElement("img");im.alt="";im.decoding="async";im.loading=i<3?"eager":"lazy";im.src=thumbs[i];
  var pl=document.createElement("span");pl.className="sl-play";pl.setAttribute("aria-hidden","true");pl.innerHTML='<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>';
  var cp=document.createElement("figcaption"),t=document.createElement("b"),k=document.createElement("span"),n=document.createElement("i");
  n.textContent=pad(i+1);t.textContent=P[i][0];k.textContent=P[i][1];cp.appendChild(n);cp.appendChild(t);cp.appendChild(k);
  f.appendChild(im);f.appendChild(pl);f.appendChild(cp);c.appendChild(f);track.appendChild(c);sl.push(c);
  c.addEventListener("click",function(){if(!shotOpen)openShot(i,c)});
 })(i)}
 var ui=document.createElement("div");ui.className="sl-ui";
 var pv=document.createElement("button"),nx=document.createElement("button"),ct=document.createElement("div"),pr=document.createElement("s");
 pv.type=nx.type="button";pv.className="sl-nav";nx.className="sl-nav";pv.setAttribute("aria-label","Previous project");nx.setAttribute("aria-label","Next project");
 pv.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';nx.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
 ct.className="sl-count";ct.setAttribute("aria-live","polite");pr.setAttribute("aria-hidden","true");
 var mid=document.createElement("div"),bar=document.createElement("div");mid.className="sl-mid";bar.className="sl-bar";bar.appendChild(pr);mid.appendChild(ct);mid.appendChild(bar);
 ui.appendChild(pv);ui.appendChild(mid);ui.appendChild(nx);
 box.appendChild(bg);box.appendChild(hd);box.appendChild(track);box.appendChild(ui);
 work.insertBefore(box,$(".vig"));
 var cur=-1,front=bgA,ticking=false,idleUntil=0,reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
 function setActive(i){
  if(i===cur)return;cur=i;
  sl.forEach(function(c,k){c.classList.toggle("on",k===i);c.tabIndex=k===i?0:-1;c.setAttribute("aria-current",k===i?"true":"false")});
  var back=front===bgA?bgB:bgA;back.src=thumbs[i];back.classList.add("on");front.classList.remove("on");front=back;
  ct.textContent=pad(i+1)+" / "+pad(N);pr.style.transform="scaleX("+((i+1)/N)+")";
 }
 function nearest(){
  var mid=track.scrollLeft+track.clientWidth/2,best=0,bd=1e9;
  for(var k=0;k<N;k++){var c=sl[k],d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<bd){bd=d;best=k}}
  return best;
 }
 function go(i,smooth){
  i=(i+N)%N;var c=sl[i];
  track.scrollTo({left:c.offsetLeft+c.offsetWidth/2-track.clientWidth/2,behavior:smooth&&!reduce?"smooth":"auto"});
 }
 track.addEventListener("scroll",function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;setActive(nearest())})},{passive:true});
 pv.addEventListener("click",function(){idleUntil=Date.now()+9000;go(Math.max(0,cur)-1,true)});
 nx.addEventListener("click",function(){idleUntil=Date.now()+9000;go(Math.max(0,cur)+1,true)});
 ["pointerdown","wheel","touchstart","keydown"].forEach(function(ev){track.addEventListener(ev,function(){idleUntil=Date.now()+9000},{passive:true})});
 track.addEventListener("keydown",function(e){
  if(e.key==="ArrowRight"){e.preventDefault();go(cur+1,true)}else if(e.key==="ArrowLeft"){e.preventDefault();go(cur-1,true)}
 });
 addEventListener("resize",function(){go(Math.max(0,cur),false)});
 setActive(0);go(0,false);
 /* auto advance while the section is on screen and nobody is touching it */
 if(!reduce&&N>1)setInterval(function(){
  if(!inView||shotOpen||document.hidden||body.classList.contains("gridview")||Date.now()<idleUntil)return;
  go(cur+1,true);
 },4200);
}
layout();
if(force==="0"||typeof CSS==="undefined"||!CSS.supports||!(CSS.supports("transform-style","preserve-3d")||CSS.supports("-webkit-transform-style","preserve-3d"))||!(CSS.supports("perspective","1px")||CSS.supports("-webkit-perspective","1px")))useSlides(force==="0"?"forced":"no 3d support");
else frame();
})();
