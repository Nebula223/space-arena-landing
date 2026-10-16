/* Presentation only: localization and document labels. Mechanics stay in copied scripts. */
(() => {
  'use strict';
  let lang='ru';try{lang=localStorage.getItem('sa-interactive-demo-language')==='en'?'en':'ru';}catch{}
  const button=document.querySelector('.language');
  function apply(){
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-ru][data-en]').forEach(el=>{el.innerHTML=el.dataset[lang];});
    button.innerHTML=lang==='ru'?'RU <span>/ EN</span>':'EN <span>/ RU</span>';
    button.setAttribute('aria-label',lang==='ru'?'Switch to English':'Переключить на русский');
    document.title='Space Arena — Interactive Demo';
    window.dispatchEvent(new CustomEvent('sa:language',{detail:lang}));
  }
  button.addEventListener('click',()=>{lang=lang==='ru'?'en':'ru';try{localStorage.setItem('sa-interactive-demo-language',lang);}catch{}apply();});
  apply();
})();
