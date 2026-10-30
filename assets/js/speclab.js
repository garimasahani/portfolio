/* Spec Lab: tabs that open the original document or post */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const tabs=$$('.tab'),panels=$$('#lab .stage');
function openTab(key,scroll){tabs.forEach(t=>{const on=t.dataset.key===key;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1});
 panels.forEach(p=>p.hidden=p.id!=='p-'+key);
 if(scroll)$('#t-'+key).scrollIntoView({block:'nearest',inline:'center',behavior:reduce?'auto':'smooth'});}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>openTab(t.dataset.key));
 t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const n=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];n.focus();openTab(n.dataset.key,true)}})});
const h=location.hash.slice(1);openTab(tabs.some(t=>t.dataset.key===h)?h:'airbnb');
if(tabs.some(t=>t.dataset.key===h))setTimeout(()=>$('#lab').scrollIntoView(),50);
const jump=k=>{if(!tabs.some(t=>t.dataset.key===k))return false;openTab(k);$('#lab').scrollIntoView({behavior:reduce?'auto':'smooth'});return true};
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&jump(a.getAttribute('href').slice(1))){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}});
addEventListener('hashchange',()=>jump(location.hash.slice(1)));
})();
