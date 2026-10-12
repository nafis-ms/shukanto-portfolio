/* Social section: fills in the links saved in the admin panel (Social tab).
   An icon with no link stays hidden; if none are set, the whole section stays hidden.
   Load after site.js and before cinematic.js. Needs window.SITE from /api/index?p=content */
(function(){
var sec=document.getElementById("social");if(!sec)return;
var S=(window.SITE&&SITE.social)||{},shown=0;
[].forEach.call(sec.querySelectorAll("li[data-k]"),function(li){
 var k=li.getAttribute("data-k"),href="";
 if(k==="whatsapp"){
  var d=String(S.whatsapp||"").replace(/\D/g,"");
  if(d.length>=8&&d.length<=15)href="https://wa.me/"+d;      /* opens a chat with this number */
 }else if(/^https:\/\//i.test(String(S[k]||"")))href=S[k];
 if(!href)return;
 li.querySelector("a").href=href;li.hidden=false;shown++;
});
if(shown)sec.hidden=false;
})();