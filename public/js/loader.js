/* Loading page: splash -> intro film -> reveal */
(function(){
var $=function(s){return document.querySelector(s)},body=document.body,N=P.length;
var intro=$("#intro"),film=$("#film"),splash=$("#splash"),bar=$("#bar"),birth=performance.now();
var TOTAL=N+(INTRO_VIDEO?1:0),done=0,splashDone=false,revealed=false,filmIn=false,filmT=0;
function tick(){done++;bar.style.transform="scaleX("+Math.min(1,done/TOTAL)+")";check()}
function check(){if(splashDone)return;if(done>=TOTAL){var w=Math.max(0,1150-(performance.now()-birth));setTimeout(endSplash,w)}}
var splashTimer=setTimeout(endSplash,9000);
function endSplash(){
 if(splashDone)return;splashDone=true;clearTimeout(splashTimer);
 bar.style.transform="scaleX(1)";
 setTimeout(function(){splash.classList.add("out");setTimeout(function(){splash.remove()},950);startFilm()},200);
}
function noFilm(){intro.classList.add("novideo");setTimeout(reveal,splashDone?1800:1800+1200)}
function startFilm(){
 if(!INTRO_VIDEO){setTimeout(reveal,1800);return}
 if(film.currentTime>.05)film.currentTime=0;
 film.playbackRate=2;
 var pr=film.play();
 if(pr&&pr.catch)pr.catch(function(){
  var go=function(){film.play().catch(function(){})};
  ["pointerdown","keydown","touchstart"].forEach(function(t){addEventListener(t,go,{once:true})});
  setTimeout(function(){if(film.paused)reveal()},2600);
 });
}
if(INTRO_VIDEO){
 film.muted=film.defaultMuted=true;film.playsInline=true;
 var filmReady=function(){if(!filmIn){filmIn=true;tick()}};
 film.addEventListener("loadeddata",filmReady);film.addEventListener("canplaythrough",filmReady);
 film.addEventListener("error",function(){filmReady();noFilm()});
 film.addEventListener("play",function(){film.playbackRate=2});
 film.addEventListener("playing",function(){
  film.playbackRate=2;clearTimeout(filmT);
  var d=isFinite(film.duration)?film.duration:6;
  filmT=setTimeout(reveal,Math.max(300,(d-film.currentTime-.45)/2*1000));
 });
 film.addEventListener("ended",reveal);
 film.src=INTRO_VIDEO;
}else{intro.classList.add("novideo");film.remove()}
setTimeout(reveal,14000);
$("#skip").addEventListener("click",reveal);
function reveal(){
 if(revealed)return;
 if(!splashDone){setTimeout(reveal,200);return}
 revealed=true;clearTimeout(filmT);
 intro.classList.add("closing");
 setTimeout(function(){body.classList.add("revealed");intro.classList.add("gone");setTimeout(function(){intro.remove();if(INTRO_VIDEO)film.pause()},700)},1000);
}
window.loadTick=tick;
})();
