/* Hero: moving the pointer erases the green glow only where it passes.
   Each spot goes dark quickly, then the green fades back over about 3 seconds. */
(function(){
var hero=document.querySelector(".hero"),cv=document.getElementById("erase");
if(!hero||!cv)return;
var ctx=cv.getContext("2d"),pts=[],raf=0,lx=-999,ly=-999;
var BRUSH=50,    /* size of the cleared spot in px (smaller = subtler) */
    STRENGTH=.50, /* how dark it gets: 1 = fully black, .3 = a light dim */
    LIFE=3000,    /* ms until the green is fully back */
    IN=450,       /* ms for the spot to fade out */
    S=.5;         /* canvas scale (lower = lighter on the GPU) */
function size(){cv.width=Math.max(1,Math.round(hero.clientWidth*S));cv.height=Math.max(1,Math.round(hero.clientHeight*S))}
size();addEventListener("resize",size);cv.style.opacity=STRENGTH;
function add(e){
 var r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 if(Math.hypot(x-lx,y-ly)<BRUSH*.3)return;
 lx=x;ly=y;
 pts.push({x:x,y:y,t:performance.now()});
 if(pts.length>500)pts.shift();
 if(!raf)raf=requestAnimationFrame(draw);
}
function draw(now){
 raf=0;
 ctx.clearRect(0,0,cv.width,cv.height);
 var rad=BRUSH*S;
 pts=pts.filter(function(p){return now-p.t<LIFE});
 pts.forEach(function(p){
  var a=now-p.t,k=a<IN?a/IN:1-(a-IN)/(LIFE-IN);
  k=k*k*(3-2*k);
  var x=p.x*S,y=p.y*S,g=ctx.createRadialGradient(x,y,0,x,y,rad);
  g.addColorStop(0,"rgba(0,0,0,"+k+")");
  g.addColorStop(.5,"rgba(0,0,0,"+(k*.55)+")");
  g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);
 });
 if(pts.length)raf=requestAnimationFrame(draw);
}
["pointermove","pointerdown"].forEach(function(e){hero.addEventListener(e,add,{passive:true})});
hero.addEventListener("pointerleave",function(){lx=ly=-999});
})();