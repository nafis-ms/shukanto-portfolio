/* Intro film shown after the loading screen (your showreel .mp4 URL). Leave "" for the dark fallback intro. */
var INTRO_VIDEO="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260922_195107_ed3f055a-3a13-4a71-b743-e10310454246.mp4";

/* Projects come from the admin panel (/admin) via /api/content.js.
   Format used by the sphere: [title, category, note, image, video, embed].
   One project = one card on the sphere (1 project -> 1 card, 5 projects -> 5 cards, and so on). */
var SITE_PROJECTS=(window.SITE&&SITE.projects)||[];
var REAL=SITE_PROJECTS.length;
/* Turn the admin's project URL into something the lightbox can play:
   YouTube / Vimeo -> embed, .mp4/.webm -> video, anything else -> only the "Open project link" button. */
function projectMedia(u){
 u=String(u||"");var m;
 if((m=/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i.exec(u)))return ["","https://www.youtube.com/embed/"+m[1]];
 if((m=/vimeo\.com\/(?:video\/)?(\d+)/i.exec(u)))return ["","https://player.vimeo.com/video/"+m[1]];
 if(/\.(mp4|webm|ogg)(\?|#|$)/i.test(u))return [u,""];
 return ["",""];
}

/* Categories made in the admin panel. CATS = [{id, name, items:[index into P]}], empty ones dropped.
   Projects with no (or a deleted) category fall into "Other" so nothing disappears. */
var SITE_CATS=(window.SITE&&SITE.categories)||[];
var CATS=SITE_CATS.map(function(c){return {id:c.id,name:c.name,items:[]}});
var CAT_OTHER={id:"_other",name:"Other",items:[]};
function catOf(id){for(var i=0;i<CATS.length;i++)if(CATS[i].id===id)return CATS[i];return CAT_OTHER}
var P=SITE_PROJECTS.map(function(p,i){
 var g=catOf(p.category),md=projectMedia(p.url);g.items.push(i);
 return [p.title,g.name,"",p.image,md[0],md[1],p.url||""];
});
if(CAT_OTHER.items.length)CATS.push(CAT_OTHER);
CATS=CATS.filter(function(c){return c.items.length});

/* Footer links. The email comes from the admin panel's Contact section. */
var SOCIALS=[["Email","mailto:"+((window.SITE&&SITE.contactEmail)||"shukanto99@gmail.com")]];