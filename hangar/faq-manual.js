(() => {
 const nav=document.querySelector('.manual-jumps');
 function mark(id){nav.querySelectorAll('a').forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+id)));}
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)mark(e.target.id);},{rootMargin:'-10% 0px -65% 0px'});
 document.querySelectorAll('.manual-group').forEach(e=>observer.observe(e));
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mark(a.hash.slice(1))));
 // Preserve links shared from the first draft.
 const aliases={'gameplay-payment':'faq-1-1','gameplay-progress':'faq-1-2','gameplay-matchmaking':'faq-1-3','ships-classes':'faq-2-2','ships-blueprints':'faq-2-3','ships-modifications':'faq-2-4','weapons-types':'faq-3-1','weapons-lasers':'faq-3-4','weapons-missiles':'faq-3-5'};
 function normalizeAlias(){const alias=aliases[location.hash.slice(1)];if(alias){location.replace('#'+alias);document.getElementById(alias).scrollIntoView();}}
 window.addEventListener('hashchange',normalizeAlias);normalizeAlias();
})();
