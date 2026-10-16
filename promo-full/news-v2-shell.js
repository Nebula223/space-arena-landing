// Generated from app.js by build-news.cjs; main page is not modified.
(() => {
 'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const storageKey='sa-hangar-language';let lang='ru',module='weapons',mediaIndex=0,returnFocus=null;
 try{lang=localStorage.getItem(storageKey)==='en'?'en':'ru';}catch{}
 const t=(ru,en)=>lang==='ru'?ru:en,header=$('.header'),nav=$('#navigation'),menu=$('.menu'),social=$('#social-toggle'),socialLinks=$('#social-links'),mobile=matchMedia('(max-width:1024px)');
 function setSocial(open){socialLinks.hidden=!open;social.setAttribute('aria-expanded',String(open));}
 function closeMenu(){nav.classList.remove('open');header.classList.remove('menu-open');document.body.classList.remove('menu-open-body');menu.setAttribute('aria-expanded','false');setSocial(false);}
 menu.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);header.classList.toggle('menu-open',open);document.body.classList.toggle('menu-open-body',open);menu.setAttribute('aria-expanded',String(open));if(open)nav.querySelector('a').focus();});
 // Hover and click share one state; clicking an already-hovered menu keeps it open.
 social.addEventListener('click',e=>{setSocial(!mobile.matches&&e.detail>0?true:socialLinks.hidden);});
 $('.social').addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!mobile.matches)setSocial(true);});
 $('.social').addEventListener('pointerleave',()=>{if(!$('.social').contains(document.activeElement))setSocial(false);});
 $('.social').addEventListener('focusout',()=>{queueMicrotask(()=>{if(!$('.social').contains(document.activeElement))setSocial(false);});});
 document.addEventListener('click',e=>{if(!e.target.closest('.social'))setSocial(false);if(!e.target.closest('.header'))closeMenu();});
 $$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));mobile.addEventListener('change',closeMenu);
 const onScroll=()=>header.classList.toggle('scrolled',scrollY>40);addEventListener('scroll',onScroll,{passive:true});onScroll();
 function language(){document.documentElement.lang=lang;$$('[data-ru][data-en]').forEach(e=>e.innerHTML=e.dataset[lang]);$$('[data-alt-ru][data-alt-en]').forEach(e=>e.alt=e.dataset[lang==='ru'?'altRu':'altEn']);$('.language').innerHTML=lang==='ru'?'RU <span>/ EN</span>':'EN <span>/ RU</span>';$('.language').setAttribute('aria-label',t('Switch to English','Переключить на русский'));menu.setAttribute('aria-label',t('Меню','Menu'));document.dispatchEvent(new Event('promo-language-change'));}
 $('.language').addEventListener('click',()=>{lang=lang==='ru'?'en':'ru';try{localStorage.setItem(storageKey,lang);}catch{}language();});language();
 $$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
 function openDialog(dialog,trigger){closeMenu();returnFocus=trigger;dialog.showModal();}
 $$('dialog').forEach(dialog=>{dialog.querySelectorAll('.dialog-close,[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});dialog.addEventListener('close',()=>{returnFocus?.focus();});});
 const game=$('.game-dialog'),mount=$('.game-mount'),placeholder=mount.firstElementChild,status=$('.game-status');let loadTimer;
 $$('[data-launch]').forEach(b=>b.addEventListener('click',()=>{
  const entry=window.SPACE_ARENA_WEBGL?.entryUrl;status.textContent='';
  if(entry&&!mount.querySelector('iframe')){
   try{const url=new URL(entry,location.href);if(!['http:','https:','file:'].includes(url.protocol))throw new Error('Unsupported URL');const frame=document.createElement('iframe');frame.src=url.href;frame.title='Space Arena WebGL';frame.allow='fullscreen; autoplay; gamepad';frame.allowFullscreen=true;frame.addEventListener('load',()=>{clearTimeout(loadTimer);status.textContent=t('Если игра не появилась, проверьте доставку билда и разрешение на встраивание.','If the game does not appear, check build delivery and embedding permissions.');});mount.replaceChildren(frame);$('.fullscreen-button').hidden=false;status.textContent=t('Загрузка игры…','Loading the game…');loadTimer=setTimeout(()=>{status.textContent=t('Загрузка занимает больше времени. Билд и его адрес требуют проверки.','Loading is taking longer. The build and its URL need to be checked.');},20000);
   }catch{status.textContent=t('Адрес билда некорректен. Подключение требует проверки.','The build URL is invalid. Integration needs to be checked.');}
  }
  openDialog(game,b);
 }));
 game.addEventListener('close',()=>{clearTimeout(loadTimer);mount.querySelector('iframe')?.remove();mount.replaceChildren(placeholder);$('.fullscreen-button').hidden=true;status.textContent='';});
 $('.fullscreen-button').addEventListener('click',async()=>{try{await mount.requestFullscreen();}catch{status.textContent=t('Этот браузер не разрешил полноэкранный режим.','This browser did not allow fullscreen mode.');}});
 $('[data-storage]').addEventListener('click',e=>openDialog($('.storage-dialog'),e.currentTarget));
 $('[data-clear-language]').addEventListener('click',()=>{try{localStorage.removeItem(storageKey);$('.storage-status').textContent=t('Сохранённый язык сброшен.','Saved language cleared.');}catch{$('.storage-status').textContent=t('Доступ к хранилищу браузера недоступен.','Browser storage is unavailable.');}});
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('dialog[open]')){if(!socialLinks.hidden){setSocial(false);social.focus();}else if(nav.classList.contains('open')){closeMenu();menu.focus();}}
  if(e.key==='Tab'&&nav.classList.contains('open')&&!$('dialog[open]')){const focusable=[...header.querySelectorAll('a,button')].filter(el=>el.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 });
})();
