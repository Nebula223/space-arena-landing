(() => {
 'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];let lang='ru';try{lang=localStorage.getItem('sa-art-direction-language')==='en'?'en':'ru';}catch{}
 const nav=$('#navigation'),menu=$('.menu'),social=$('#social-toggle'),links=$('#social-links');
 function closeSocial(){links.hidden=true;social.setAttribute('aria-expanded','false');}
 function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');closeSocial();}
 menu.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));});
 social.addEventListener('click',()=>{links.hidden=!links.hidden;social.setAttribute('aria-expanded',String(!links.hidden));});
 document.addEventListener('click',e=>{if(!e.target.closest('.social'))closeSocial();if(!e.target.closest('.site-header'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!links.hidden){closeSocial();social.focus();}else if(nav.classList.contains('open')){closeMenu();menu.focus();}}});
 $$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));matchMedia('(min-width:769px)').addEventListener('change',closeMenu);
 function language(){document.documentElement.lang=lang;$$('[data-ru][data-en]').forEach(e=>e.innerHTML=e.dataset[lang]);$('.language').textContent=lang==='ru'?'RU / EN':'EN / RU';$('.language').setAttribute('aria-label',lang==='ru'?'Switch to English':'Переключить на русский');}
 $('.language').addEventListener('click',()=>{lang=lang==='ru'?'en':'ru';try{localStorage.setItem('sa-art-direction-language',lang);}catch{}language();});language();
 const dialog=$('.game-dialog'),mount=$('.game-mount');
 $$('[data-launch]').forEach(b=>b.addEventListener('click',()=>{closeMenu();const url=window.SPACE_ARENA_WEBGL?.entryUrl;if(url&&!mount.querySelector('iframe')){const iframe=document.createElement('iframe');iframe.src=url;iframe.title='Space Arena WebGL';iframe.allow='fullscreen; autoplay; gamepad';iframe.setAttribute('allowfullscreen','');mount.replaceChildren(iframe);}dialog.showModal();}));
 function close(){dialog.close();const iframe=mount.querySelector('iframe');if(iframe)iframe.src='about:blank';}
 $('.close-game').addEventListener('click',close);$('.return-button').addEventListener('click',close);
 dialog.addEventListener('close',()=>{const iframe=mount.querySelector('iframe');if(iframe)iframe.remove();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
})();
