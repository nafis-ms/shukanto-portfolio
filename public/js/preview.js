/* Live YouTube previews for project cards (sphere + "Show All" grid).
   - Not hovered: the video plays muted from 0:00 and loops every LOOP seconds.
   - Hovered:     that one video keeps playing past LOOP until the mouse leaves;
                  if it reaches the end it restarts from 0:00.
   - Un-hover:    back to the LOOP-second loop.
   Only a few players exist at once (Preview.max / Preview.maxGrid) so the page stays smooth.
   Load before projects.js. Needs css/preview.css */
(function(){
var LOOP=10;                                   /* seconds each preview plays before it restarts */
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
var coarse=matchMedia("(pointer:coarse)").matches;
var canHover=matchMedia("(hover:hover)").matches;
var handles=[],cbs=[],loading=false,failed=false;

function api(cb){
 if(window.YT&&YT.Player){cb();return}
 cbs.push(cb);if(loading)return;loading=true;
 var prev=window.onYouTubeIframeAPIReady;
 window.onYouTubeIframeAPIReady=function(){if(prev){try{prev()}catch(e){}}cbs.splice(0).forEach(function(f){f()})};
 var s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.async=true;
 s.onerror=function(){failed=true;cbs=[]};
 document.head.appendChild(s);
}
function ytId(embed){var m=/youtube\.com\/embed\/([\w-]{11})/.exec(embed||"");return m?m[1]:null}

/* box = the <figure> that holds the thumbnail <img>; hoverEl = element whose hover means "keep playing" */
function add(box,id,hoverEl){
 if(reduce||!id||!box)return null;
 var h={box:box,id:id,hover:false,vis:true,live:false,ready:false,dead:false,p:null,wrap:null,gen:0,sk:0};
 if(hoverEl&&canHover){
  hoverEl.addEventListener("mouseenter",function(){h.hover=true});
  hoverEl.addEventListener("mouseleave",function(){h.hover=false});
 }
 h.set=function(on){if(on)start(h);else stop(h)};
 handles.push(h);return h;
}
function start(h){
 if(h.live||h.dead||failed)return;
 h.live=true;var g=++h.gen;
 api(function(){
  if(!h.live||g!==h.gen)return;
  var wrap=document.createElement("div"),host=document.createElement("div");
  wrap.className="pv";wrap.setAttribute("aria-hidden","true");wrap.appendChild(host);
  var img=h.box.querySelector("img");
  if(img&&img.parentNode===h.box)h.box.insertBefore(wrap,img.nextSibling);else h.box.appendChild(wrap);
  h.wrap=wrap;
  var v={autoplay:1,mute:1,controls:0,disablekb:1,fs:0,modestbranding:1,rel:0,playsinline:1,iv_load_policy:3,cc_load_policy:0};
  if(/^https?:/.test(location.protocol))v.origin=location.origin;
  h.p=new YT.Player(host,{videoId:h.id,playerVars:v,events:{
   onReady:function(e){if(g!==h.gen)return;h.ready=true;e.target.mute();e.target.playVideo()},
   onStateChange:function(e){
    if(g!==h.gen)return;
    var s=e.data;
    if(s===1)wrap.classList.add("on");                       /* fade the video in once it really plays */
    else if(s===0){e.target.seekTo(0,true);e.target.playVideo()} /* reached the end: start again */
    else if(s===2)e.target.playVideo();                       /* nobody can pause a preview */
   },
   onError:function(){h.dead=true;stop(h)}                   /* embedding disabled etc.: keep the thumbnail */
  }});
 });
}
function stop(h){
 if(!h.live)return;
 h.live=false;h.gen++;h.ready=false;
 try{if(h.p)h.p.destroy()}catch(e){}
 h.p=null;
 if(h.wrap&&h.wrap.parentNode)h.wrap.parentNode.removeChild(h.wrap);
 h.wrap=null;
}
function drop(h){
 if(!h)return;stop(h);
 var i=handles.indexOf(h);if(i>-1)handles.splice(i,1);
}

/* the 10 second loop: only for videos that are NOT hovered */
setInterval(function(){
 var now=Date.now();
 handles.forEach(function(h){
  if(!h.live||!h.ready||!h.p||h.hover||now-h.sk<800)return;
  var t;try{t=h.p.getCurrentTime()}catch(e){return}
  if(t>=LOOP){h.sk=now;try{h.p.seekTo(0,true)}catch(e){}}
 });
},120);

window.Preview={add:add,drop:drop,ytId:ytId,LOOP:LOOP,max:coarse?4:6,maxGrid:coarse?4:9};
})();