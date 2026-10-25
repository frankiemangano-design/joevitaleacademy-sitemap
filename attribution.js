/* Statbrook — GHL blog+funnel attribution runtime v2 (2026-10-25).
 * Source: github.com/frankiemangano-design/joevitale-lead-gen  blog/pipeline/attribution_runtime.py
 * v2 change (tracking only): first-touch values persist across tabs/pages in localStorage (30-day window)
 * instead of per-tab sessionStorage, and internal joevitaleacademy.com referrers are never recorded.
 * Behaviour otherwise identical to v1: never overwrites a value once set; stored real UTMs win over CTA
 * defaults; utm_term carries the converting CTA placement; every storage call is guarded, so a storage
 * failure only means "no rewrite" and can never block a page or an opt-in.
 */
(function(){
if(window.__sbAttrRan){return}window.__sbAttrRan=true;
var K=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
var P='sb_attr_';
var TTL=30*24*3600*1000;
var IF='iframe[src*="leadconnectorhq.com/widget/form/"]';
var CTA='a[href*="/hooponopono-guide"]';
var INTERNAL=/(^|\.)joevitaleacademy\.com$|(^|\.)leadconnectorhq\.com$|(^|\.)msgsndr\.com$|(^|\.)gohighlevel\.com$/i;
var LS=null;try{var t='__sb_t';window.localStorage.setItem(t,'1');window.localStorage.removeItem(t);LS=window.localStorage}catch(e){LS=null}
function sget(k){try{return window.sessionStorage.getItem(P+k)}catch(e){return null}}
function get(k){var v=null;if(LS){try{v=LS.getItem(P+k)}catch(e){v=null}}if(!v){v=sget(k)}return v}
function put(k,v){if(!v)return;
if(LS){try{if(LS.getItem(P+k))return;LS.setItem(P+k,v);if(!LS.getItem(P+'ts'))LS.setItem(P+'ts',String(Date.now()));return}catch(e){}}
try{if(!sget(k))window.sessionStorage.setItem(P+k,v)}catch(e){}}
// one-time carry-over: a v1 (per-tab sessionStorage) first touch in this tab seeds the shared store
function migrate(){if(!LS)return;K.concat(['landing_page']).forEach(function(k){var s=sget(k);if(s)put(k,s)});
var r=external(sget('referrer'));if(r)put('referrer',r)}
function expire(){if(!LS)return;try{var ts=parseInt(LS.getItem(P+'ts')||'0',10);
if(ts&&(isNaN(ts)||Date.now()-ts>TTL||ts>Date.now()+864e5)){K.concat(['landing_page','referrer','ts']).forEach(function(k){LS.removeItem(P+k)})}}catch(e){}}
function external(ref){try{if(!ref)return '';var h=new URL(ref).hostname;return INTERNAL.test(h)?'':ref}catch(e){return ''}}
function persist(){var p;try{p=new URLSearchParams(location.search)}catch(e){p=null}
if(p){K.forEach(function(k){var v=p.get(k);if(v)put(k,v)})}
var ref='';try{ref=external(document.referrer)}catch(e){}
var hasUtm=false;if(p){K.forEach(function(k){if(p.get(k))hasUtm=true})}
// landing page = first page reached from OUTSIDE the site (external referrer, tagged link, or direct)
var direct=false;try{direct=!document.referrer}catch(e){}
if(ref||hasUtm||direct){try{put('landing_page',location.origin+location.pathname)}catch(e){}}
if(ref)put('referrer',ref)}
function stored(){var o={};K.forEach(function(k){var v=get(k);if(v)o[k]=v});
var lp=get('landing_page');if(lp)o.landing_page=lp;var rf=external(get('referrer'));if(rf)o.referrer=rf;return o}
function rewriteHref(href,vals,extras){try{var u=new URL(href,location.href);
Object.keys(vals).forEach(function(k){if(vals[k])u.searchParams.set(k,vals[k])});
if(extras){Object.keys(extras).forEach(function(k){var v=extras[k];if(v&&!u.searchParams.get(k))u.searchParams.set(k,v)})}
return u.toString()}catch(e){return href}}
function ctaExtras(a){var slug=a.getAttribute('data-cta-slug')||'';var place=a.getAttribute('data-cta-placement')||'';
if(!slug||!place)return null;var stub=slug+'-cta-'+place;return{utm_term:stub,utm_content:stub}}
function rewriteAllCtas(vals){var links=document.querySelectorAll(CTA);
links.forEach(function(a){try{var extras=ctaExtras(a);a.href=rewriteHref(a.href,vals,extras)}catch(e){}})}
function rewriteAllIframes(vals){var f=document.querySelectorAll(IF);
f.forEach(function(x){try{var nu=rewriteHref(x.src,vals,null);if(nu!==x.src)x.src=nu}catch(e){}})}
function run(){try{expire();migrate();persist();var v=stored();rewriteAllCtas(v);rewriteAllIframes(v)}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
try{var o=new MutationObserver(function(m){for(var i=0;i<m.length;i++){var a=m[i].addedNodes;
for(var j=0;j<a.length;j++){var n=a[j];if(!n||n.nodeType!==1)continue;
if(n.tagName==='IFRAME'&&n.src&&n.src.indexOf('leadconnectorhq.com/widget/form/')!==-1){run();continue}
if(n.tagName==='A'||(n.querySelectorAll&&n.querySelectorAll(CTA).length)){run()}}}});
o.observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
})();
