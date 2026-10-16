(() => {
 const article=document.querySelector('[data-article]');
 function language(){const ru=document.documentElement.lang==='ru',lang=ru?'ru':'en';document.title=article.dataset[ru?'titleRu':'titleEn']+' — Space Arena';document.querySelectorAll('[data-cover-ru]').forEach(image=>{image.src=image.dataset[ru?'coverRu':'coverEn'];});const source=document.querySelector('.article-source');source.href=source.dataset[ru?'sourceRu':'sourceEn'];document.querySelector('.related-stories').setAttribute('aria-label',ru?'Другие публикации':'More stories');document.querySelectorAll('time').forEach(time=>time.textContent=new Intl.DateTimeFormat(ru?'ru-RU':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(time.dateTime+'T12:00:00Z')));}
 document.addEventListener('promo-language-change',language);language();
})();
