/* Projects section: sphere, grid view, lightbox, cursor */
(function(){
/* ===== EDIT YOUR PROJECTS HERE =====
   [title, category + tools, note, thumbnail image URL, video URL (.mp4), embed URL (YouTube/Vimeo)]
   Leave thumbnail empty "" to use an auto-made placeholder. Use video OR embed, or leave both empty. */
var N=P.length,GA=Math.PI*(3-Math.sqrt(5)),PI=Math.PI;
var $=function(s){return document.querySelector(s)};
var body=document.body,root=document.documentElement,world=$("#world"),orb=$("#orb"),head=$("#headline"),rows=$("#rows"),plate=$("#plate"),stage=$("#stage");
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
function ph(i,t){
 var h=(i*47+200)%360,h2=(h+50)%360;
 var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl('+h+',55%,22%)"/><stop offset="1" stop-color="hsl('+h2+',60%,9%)"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><path d="M0 300 L600 230" stroke="hsla('+h2+',80%,70%,.25)" stroke-width="2"/><circle cx="300" cy="190" r="38" fill="none" stroke="#f4f2ef" stroke-opacity=".7" stroke-width="2"/><path d="M290 172 L318 190 L290 208Z" fill="#f4f2ef" fill-opacity=".85"/><text x="24" y="368" font-family="Georgia,serif" font-size="26" fill="#f4f2ef" fill-opacity=".85">'+t.replace(/&/g,"&amp;")+'</text></svg>';
 return "data:image/svg+xml;utf8,"+encodeURIComponent(s);
}
var U=[],cards=[],cimg=[],thumbs=[],R=300,persp=1150;
for(var i=0;i<N;i++){
 var y=1-(2*i+1)/N,rad=Math.sqrt(Math.max(0,1-y*y)),th=i*GA+PI/2,x=Math.cos(th)*rad,z=Math.sin(th)*rad;
 U.push({x:x,y:y,z:z,lat:Math.asin(y)*180/PI,lon:Math.atan2(x,z)*180/PI});
 thumbs[i]=P[i][3]||ph(i,P[i][0]);
 var c=document.createElement("button");c.className="card";c.dataset.idx=i;c.setAttribute("aria-label","Open "+P[i][0]);
 var f=document.createElement("figure"),im=document.createElement("img");im.alt="";im.decoding="async";
 im.onload=function(){this.classList.add("in");window.loadTick&&loadTick()};im.onerror=function(){window.loadTick&&loadTick()};im.src=thumbs[i];
 f.appendChild(im);c.appendChild(f);orb.appendChild(c);cards.push(c);cimg.push(im);
 if(i>=REAL)continue; /* repeated cards only fill the sphere; the grid lists each project once */
 var g=document.createElement("figure");g.dataset.idx=i;g.tabIndex=0;g.setAttribute("role","button");
 var gi=document.createElement("img");gi.alt=P[i][0];gi.loading="lazy";gi.src=thumbs[i];
 var gc=document.createElement("figcaption");gc.textContent=P[i][0];
 g.appendChild(gi);g.appendChild(gc);rows.appendChild(g);
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
var still=matchMedia("(prefers-reduced-motion:reduce)").matches;
function frame(){
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
  var u=U[i],Y=-u.y,z1=Y*sa+u.z*ca,zf=-u.x*sb+z1*cb;
  var dim=1-(.14+.86*Math.pow((zf+1)/2,.85)),fade=1,absZ=zf*R;
  if(absZ>near)fade=Math.max(0,1-(absZ-near)/190);
  if(shotOpen){dim=Math.min(1,dim+.78);if(i===focused)fade=0}
  dim=Math.round(dim*1000)/1000;fade=Math.round(fade*1000)/1000;
  if(lastO[i]!==fade){lastO[i]=fade;cards[i].style.opacity=fade}
  if(lastD[i]!==dim){lastD[i]=dim;cards[i].style.setProperty("--d",dim)}
 }
 requestAnimationFrame(frame);
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
 if(body.classList.contains("gridview")){var gi=+(srcEl&&srcEl.dataset.idx);el=rows.children[isNaN(gi)?0:gi]}
 if(el)flyTo(el);
 closeT=setTimeout(function(){plate.style.transition="none";plate.style.transform="";plate.style.opacity="";void plate.offsetWidth;plate.style.transition=""},640);
 if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
$("#lit").addEventListener("click",function(e){if(e.target.closest("[data-close]"))closeShot()});
rows.addEventListener("click",function(e){var f=e.target.closest("figure");if(f)openShot(+f.dataset.idx,f)});
rows.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){var f=e.target.closest("figure");if(f){e.preventDefault();openShot(+f.dataset.idx,f)}}});
/* grid */
function setGrid(o){body.classList.toggle("gridview",o);if(o)$("#grid").scrollTop=0}
$("#gridBtn").addEventListener("click",function(){setGrid(!body.classList.contains("gridview"))});
$("#gridClose").addEventListener("click",function(){setGrid(false)});
addEventListener("keydown",function(e){
 if(e.key!=="Escape")return;
 if(shotOpen)closeShot();else if(body.classList.contains("gridview"))setGrid(false);
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
layout();frame();
})();