/* Intro film shown after the loading screen (your showreel .mp4 URL). Leave "" for the dark fallback intro. */
var INTRO_VIDEO="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260922_195107_ed3f055a-3a13-4a71-b743-e10310454246.mp4";

/* Projects come from the admin panel (/admin) via /api/content.js.
   Format used by the sphere: [title, category, note, image, video, embed].
   One project = one card on the sphere (1 project -> 1 card, 5 projects -> 5 cards, and so on). */
var SITE_PROJECTS=(window.SITE&&SITE.projects)||[];
var REAL=SITE_PROJECTS.length;
var P=SITE_PROJECTS.map(function(p){return [p.title,"","",p.image,"",""]});

/* Footer links. The email comes from the admin panel's Contact section. */
var SOCIALS=[["Email","mailto:"+((window.SITE&&SITE.contactEmail)||"shukanto99@gmail.com")]];