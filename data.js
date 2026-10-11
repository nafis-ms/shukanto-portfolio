/* Intro film shown after the loading screen (your showreel .mp4 URL). Leave "" for the dark fallback intro. */
var INTRO_VIDEO="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260922_195107_ed3f055a-3a13-4a71-b743-e10310454246.mp4";

/* Projects now come from the admin panel (/admin) via /api/content.js.
   Format used by the sphere: [title, category, note, image, video, embed].
   With fewer than 16 projects, they repeat around the sphere so the ball always looks full. */
var SITE_PROJECTS=(window.SITE&&SITE.projects)||[];
var REAL=SITE_PROJECTS.length;
var P=[];
if(REAL){for(var _i=0,_n=Math.max(REAL,16);_i<_n;_i++){var _p=SITE_PROJECTS[_i%REAL];P.push([_p.title,"","",_p.image,"",""])}}

/* Footer links. The email comes from the admin panel's Contact section. */
var SOCIALS=[["Email","mailto:"+((window.SITE&&SITE.contactEmail)||"shukanto99@gmail.com")]];
