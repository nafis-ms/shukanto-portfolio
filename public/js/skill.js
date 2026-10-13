/* Skills box (Services section): fills in the skills saved in the admin panel (Services tab > Skills).
   No skills saved = the box stays hidden. Load after /api/index?p=content and before cinematic.js. */
(function(){
var box=document.getElementById("skills"),host=document.getElementById("skillChips");
if(!box||!host)return;
var q=(window.SITE&&SITE.qualification)||{},list=Array.isArray(q.skills)?q.skills:[];
list=list.map(function(s){return String(s).trim()}).filter(Boolean);
if(!list.length)return;
list.forEach(function(s,j){
 var c=document.createElement("span");c.textContent=s;c.style.setProperty("--j",j);host.appendChild(c);
});
box.hidden=false;
})();