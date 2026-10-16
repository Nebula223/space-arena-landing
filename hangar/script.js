(() => {
 'use strict';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 let lang='ru',slide=0;try{lang=localStorage.getItem('sa-hangar-language')==='en'?'en':'ru';}catch{}
 const t=(ru,en)=>lang==='ru'?ru:en;
 const slides=[{file:'build',ru:'Собери корабль под свою идею.',en:'Build a ship around your idea.'},{file:'battle',ru:'Испытай компоновку в автоматическом бою.',en:'Put your layout to the test in automatic combat.'},{file:'research',ru:'Открывай новые модули и варианты оснащения.',en:'Discover new modules and loadout options.'},{file:'fleet',ru:'Находи новые корпуса для следующих сборок.',en:'Find new hulls for your next builds.'}];
 const nav=$('#navigation'),menu=$('.menu'),social=$('#social-toggle'),socialLinks=$('#social-links');
 function closeSocial(){socialLinks.hidden=true;social.setAttribute('aria-expanded','false');}
 function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');closeSocial();}
 menu.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));if(!open)closeSocial();});
 social.addEventListener('click',()=>{socialLinks.hidden=!socialLinks.hidden;social.setAttribute('aria-expanded',String(!socialLinks.hidden));});
 $('.social').addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(min-width:769px)').matches){socialLinks.hidden=false;social.setAttribute('aria-expanded','true');}});
 $('.social').addEventListener('pointerleave',()=>{if(!$('.social').contains(document.activeElement))closeSocial();});
 $$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('click',e=>{if(!e.target.closest('.social'))closeSocial();if(!e.target.closest('.header'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!socialLinks.hidden){closeSocial();social.focus();}else if(nav.classList.contains('open')){closeMenu();menu.focus();}}});
 matchMedia('(min-width:769px)').addEventListener('change',closeMenu);
 const imageDialog=$('.image-dialog'),videoDialog=$('.video-dialog');
 function showSlide(index){slide=(index+slides.length)%slides.length;const s=slides[slide];$('#gallery-image').src=`assets/screen-${s.file}.webp`;$('#gallery-image').alt=s[lang];$('#gallery-caption').textContent=s[lang];$$('[data-slide]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.slide)===slide)));$('figure img').src=`assets/screen-${s.file}.webp`;$('figure img').alt=s[lang];$('figcaption').textContent=s[lang];}
 $$('[data-slide]').forEach(b=>b.addEventListener('click',()=>showSlide(Number(b.dataset.slide))));
 $('#open-gallery').addEventListener('click',()=>imageDialog.showModal());
 $('.gallery-prev').addEventListener('click',()=>showSlide(slide-1));$('.gallery-next').addEventListener('click',()=>showSlide(slide+1));
 imageDialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')showSlide(slide-1);if(e.key==='ArrowRight')showSlide(slide+1);});
 $$('[data-video]').forEach(b=>b.addEventListener('click',()=>{const v=$('video');if(!v.getAttribute('src'))v.src='assets/gameplay.mp4';videoDialog.showModal();v.play().catch(()=>{});}));
 $$('dialog').forEach(d=>{d.querySelector('.close-dialog').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});});
 videoDialog.addEventListener('close',()=>$('video').pause());
 $$('[data-ship]').forEach(b=>b.addEventListener('click',()=>{const ship=b.dataset.ship;$('#fleet-image').src=`assets/${ship}.webp`;$('#fleet-image').alt=ship[0].toUpperCase()+ship.slice(1);$('#fleet-name').textContent=ship.toUpperCase();$$('[data-ship]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));}));
 function setLanguage(){document.documentElement.lang=lang;$$('[data-ru][data-en]').forEach(e=>e.innerHTML=e.dataset[lang]);$('.language').innerHTML=lang==='ru'?'RU <span>/ EN</span>':'EN <span>/ RU</span>';$('.language').setAttribute('aria-label',t('Switch to English','Переключить на русский'));menu.setAttribute('aria-label',t('Меню','Menu'));$('#open-gallery').setAttribute('aria-label',t('Открыть скриншот в полном размере','Open screenshot at full size'));$('.hero-art').alt=t('Концепт-арт: модульный корабль в космическом сражении','Concept art: a modular spaceship in battle');document.title=t('Space Arena — Твоя сборка. Твоя арена.','Space Arena — Your build. Your arena.');showSlide(slide);window.dispatchEvent(new CustomEvent('sa:language',{detail:lang}));}
 $('.language').addEventListener('click',()=>{lang=lang==='ru'?'en':'ru';try{localStorage.setItem('sa-hangar-language',lang);}catch{}setLanguage();});
 setLanguage();
})();
