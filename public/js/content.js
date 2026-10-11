/* Applies the content saved in the admin panel (window.SITE, from /api/content.js) to the page.
   Runs before cinematic.js, so every effect picks up the new content automatically. */
(function(){
var S=window.SITE;if(!S)return;
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
function hide(el){if(el)el.style.display="none"}

/* About */
var a=S.about;
if(a){
 $("#about h2").textContent=a.heading;
 var text=$("#about .text"),ul=text.querySelector(".contact");
 [].slice.call(text.children).forEach(function(el){if(el.tagName==="P")el.remove()});
 a.paragraphs.forEach(function(t){var p=document.createElement("p");p.textContent=t;text.insertBefore(p,ul)});
 var sp=ul.querySelectorAll("li > span"),lis=ul.querySelectorAll("li");
 var ea=sp[0].querySelector("a");ea.href="mailto:"+a.email;ea.textContent=a.email;
 if(a.phone){var pa=sp[1].querySelector("a");pa.href="tel:"+a.phone.replace(/[^\d+]/g,"");pa.textContent=a.phone}else hide(lis[1]);
 if(a.address)sp[2].textContent=a.address;else hide(lis[2]);
}

/* Services */
if(S.services){
 var sl=$("#services .list");sl.textContent="";
 S.services.forEach(function(s){
  var li=document.createElement("li"),b=document.createElement("b"),sp=document.createElement("span");
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+s.icon+'</svg>';
  b.appendChild(document.createTextNode(s.title));sp.textContent=s.desc;
  li.appendChild(b);li.appendChild(sp);sl.appendChild(li);
 });
 if(!S.services.length){hide($("#services"));$$('a[href="#services"]').forEach(hide)}
}

/* Qualification: skills, languages, interests */
var q=S.qualification;
if(q){
 var items=$$("#background .list > li");
 var chips=items[2].querySelector(".chips");chips.textContent="";
 q.skills.forEach(function(t){var c=document.createElement("span");c.textContent=t;chips.appendChild(c)});
 if(!q.skills.length)hide(items[2]);
 if(q.languages)items[3].querySelector("span").textContent=q.languages;else hide(items[3]);
 if(q.interests)items[4].querySelector("span").textContent=q.interests;else hide(items[4]);
}

/* Contact */
/* Email me opens a Gmail compose window with the contact email in "To" */
if(S.contactEmail)$$(".emailme").forEach(function(e){e.href="https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(S.contactEmail);e.target="_blank";e.rel="noopener"});

/* No projects yet: hide the sphere and the links to it */
if(!(S.projects&&S.projects.length)){
 hide($(".work"));
 $$('a[href="#projects"]').forEach(hide);
}
})();
