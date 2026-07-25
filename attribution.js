/* Statbrook — GHL blog+funnel attribution runtime.
 * Source: github.com/frankiemangano-design/joevitale-lead-gen
 *         blog/pipeline/attribution_runtime.py
 */
(function(){
if(window.__sbAttrRan){return}window.__sbAttrRan=true;
var K=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
var P='sb_attr_';
var IF='iframe[src*="leadconnectorhq.com/widget/form/"]';
var CTA='a[href*="/hooponopono-guide"]';
function ss(k){try{return sessionStorage.getItem(P+k)}catch(e){return null}}
function setSs(k,v){try{if(v&&!ss(k))sessionStorage.setItem(P+k,v)}catch(e){}}
function persist(){var p;try{p=new URLSearchParams(location.search)}catch(e){return}
K.forEach(function(k){var v=p.get(k);if(v)setSs(k,v)});
try{if(!ss('landing_page'))sessionStorage.setItem(P+'landing_page',location.origin+location.pathname)}catch(e){}
try{if(!ss('referrer')&&document.referrer)sessionStorage.setItem(P+'referrer',document.referrer)}catch(e){}}
function stored(){var o={};K.forEach(function(k){var v=ss(k);if(v)o[k]=v});
var lp=ss('landing_page');if(lp)o.landing_page=lp;
var rf=ss('referrer');if(rf)o.referrer=rf;
return o}
function rewriteHref(href,vals,extras){try{var u=new URL(href,location.href);
Object.keys(vals).forEach(function(k){if(vals[k])u.searchParams.set(k,vals[k])});
if(extras){Object.keys(extras).forEach(function(k){var v=extras[k];if(v&&!u.searchParams.get(k))u.searchParams.set(k,v)})}
return u.toString()}catch(e){return href}}
function ctaExtras(a){var slug=a.getAttribute('data-cta-slug')||'';
var place=a.getAttribute('data-cta-placement')||'';
if(!slug||!place)return null;
var stub=slug+'-cta-'+place;
return{utm_term:stub,utm_content:stub}}
function rewriteAllCtas(vals){var links=document.querySelectorAll(CTA);
links.forEach(function(a){var extras=ctaExtras(a);a.href=rewriteHref(a.href,vals,extras)})}
function rewriteAllIframes(vals){var f=document.querySelectorAll(IF);
f.forEach(function(x){var nu=rewriteHref(x.src,vals,null);if(nu!==x.src)x.src=nu})}
function run(){persist();var v=stored();rewriteAllCtas(v);rewriteAllIframes(v)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
try{var o=new MutationObserver(function(m){for(var i=0;i<m.length;i++){var a=m[i].addedNodes;
for(var j=0;j<a.length;j++){var n=a[j];if(!n||n.nodeType!==1)continue;
if(n.tagName==='IFRAME'&&n.src&&n.src.indexOf('leadconnectorhq.com/widget/form/')!==-1){run();continue}
if(n.tagName==='A'||(n.querySelectorAll&&n.querySelectorAll(CTA).length)){run()}}}});
o.observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
})();
