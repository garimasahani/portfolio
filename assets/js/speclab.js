/* Spec Lab: tabs that open the original document or post */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const camps=$$('.camp');
function setOpen(c,on,scroll){const b=$('.camp-head',c);b.setAttribute('aria-expanded',on);$('.camp-body',c).hidden=!on;c.classList.toggle('open',on);
 if(on&&scroll)setTimeout(()=>c.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'}),30)}
camps.forEach(c=>$('.camp-head',c).addEventListener('click',e=>{setOpen(c,e.currentTarget.getAttribute('aria-expanded')!=='true')}));
const openKey=k=>{const c=$('#p-'+k);if(!c||!c.classList.contains('camp'))return false;setOpen(c,true,true);return true};
openKey(location.hash.slice(1));
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&openKey(a.getAttribute('href').slice(1))){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}});
addEventListener('hashchange',()=>openKey(location.hash.slice(1)));
})();
/* slide viewers: one slide at a time with previous and next */
(()=>{document.querySelectorAll('[data-slides]').forEach(v=>{const im=[...v.querySelectorAll('.slides-track img')],c=v.querySelector('[data-count]');let i=0;
 const go=n=>{i=(n+im.length)%im.length;im.forEach((x,j)=>x.hidden=j!==i);c.textContent=(i+1)+' / '+im.length};
 v.querySelector('[data-prev]').addEventListener('click',()=>go(i-1));v.querySelector('[data-next]').addEventListener('click',()=>go(i+1));
 v.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(i-1);if(e.key==='ArrowRight')go(i+1)});go(0)})})();
