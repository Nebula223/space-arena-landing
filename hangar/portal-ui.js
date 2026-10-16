(() => {
 'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];let lang='ru',filter='all';
 try{lang=localStorage.getItem('sa-hangar-language')==='en'?'en':'ru';}catch{}
 const t=(ru,en)=>lang==='ru'?ru:en,nav=$('#navigation'),menu=$('.menu'),social=$('#social-toggle'),socialLinks=$('#social-links');
 function closeSocial(){socialLinks.hidden=true;social.setAttribute('aria-expanded','false');}
 function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');closeSocial();}
 menu.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));});
 social.addEventListener('click',()=>{socialLinks.hidden=!socialLinks.hidden;social.setAttribute('aria-expanded',String(!socialLinks.hidden));});
 $('.social').addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&innerWidth>768){socialLinks.hidden=false;social.setAttribute('aria-expanded','true');}});
 $('.social').addEventListener('pointerleave',()=>{if(!$('.social').contains(document.activeElement))closeSocial();});
 document.addEventListener('click',e=>{if(!e.target.closest('.social'))closeSocial();if(!e.target.closest('.header'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!socialLinks.hidden){closeSocial();social.focus();}else{closeMenu();}}});
 $$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));matchMedia('(min-width:769px)').addEventListener('change',closeMenu);
 $$('#navigation>a').forEach(a=>{if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page');});
 const search=$('#content-search'),clear=$('#clear-search');
 const normalize=s=>s.toLocaleLowerCase().replaceAll('ё','е').trim();
 function update(){if(!search)return;const query=normalize(search.value);clear.hidden=!query;let count=0;
  if(document.body.dataset.page==='faq'){
   $$('.faq-section').forEach(section=>{let visible=0;section.querySelectorAll('.faq-item').forEach(item=>{const match=normalize(item.textContent).includes(query);item.hidden=!match;if(match){visible++;count++;}if(query)item.open=match;});section.hidden=!visible;});
  }else{$$('.news-card').forEach(card=>{const match=(filter==='all'||filter===card.dataset.category)&&normalize(card.textContent).includes(query);card.hidden=!match;if(match)count++;});}
  $('.empty-state').hidden=count>0;$('#search-status').textContent=query||filter!=='all'?t(`Найдено: ${count}`,`Found: ${count}`):'';
 }
 if(search){search.addEventListener('input',update);clear.addEventListener('click',()=>{search.value='';update();search.focus();});}
 $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));update();}));
 function followHash(){if(document.body.dataset.page!=='faq')return;let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}if(!target||!target.closest('.faq-content'))return;if(search){search.value='';update();}if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});$$('.faq-nav a').forEach(a=>a.setAttribute('aria-current',String(target.closest('.faq-section')?.id===a.hash.slice(1))));}
 window.addEventListener('hashchange',followHash);
 $$('.faq-nav a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{if(search){search.value='';update();}if(location.hash===a.hash)followHash();}));
 function setLanguage(){document.documentElement.lang=lang;$$('[data-ru][data-en]').forEach(e=>e.innerHTML=e.dataset[lang]);$$('[data-date]').forEach(e=>e.textContent=new Intl.DateTimeFormat(lang==='ru'?'ru-RU':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(e.dataset.date+'T12:00:00Z')));if(search){search.placeholder=search.dataset[lang==='ru'?'placeholderRu':'placeholderEn'];update();}$('.language').innerHTML=lang==='ru'?'RU <span>/ EN</span>':'EN <span>/ RU</span>';$('.language').setAttribute('aria-label',t('Switch to English','Переключить на русский'));menu.setAttribute('aria-label',t('Меню','Menu'));document.title=$('h1').textContent.replace(/\s+/g,' ').trim()+' — Space Arena';}
 $('.language').addEventListener('click',()=>{lang=lang==='ru'?'en':'ru';try{localStorage.setItem('sa-hangar-language',lang);}catch{}setLanguage();});setLanguage();if(location.hash)requestAnimationFrame(followHash);
})();
