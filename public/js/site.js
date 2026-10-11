/* Page extras: scroll reveals, footer social icons */
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var still=matchMedia("(prefers-reduced-motion:reduce)").matches,hasIO="IntersectionObserver" in window;
/* scroll reveals */
var rv=$$(".two,.talk-in,.marq,footer");
rv.forEach(function(e){e.classList.add("rv")});
var rio=hasIO&&new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");rio.unobserve(x.target)}})},{threshold:.12});
rv.forEach(function(e){rio?rio.observe(e):e.classList.add("in")});
/* footer social icons */
var host=$("#socials"),S=window.SOCIALS||[];
var V=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var ICON={
 email:V('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
 instagram:V('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>'),
 youtube:V('<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z"/>')
};
var GLYPH={facebook:"f",linkedin:"in",behance:"B\u0113",tiktok:"T",whatsapp:"W"};
if(host)S.forEach(function(s){
 var a=document.createElement("a"),k=s[0].toLowerCase();
 a.href=s[1];a.setAttribute("aria-label",s[0]);
 if(/^https?:/.test(s[1])){a.target="_blank";a.rel="noopener"}
 if(ICON[k])a.innerHTML=ICON[k];else a.textContent=GLYPH[k]||s[0].charAt(0);
 host.appendChild(a);
});
})();