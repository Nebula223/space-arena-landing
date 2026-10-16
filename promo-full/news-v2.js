(() => {
 'use strict';
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const input=$('#news-query'),stories=$$('[data-news]'),params=new URLSearchParams(location.search),pageSize=3;let category=params.get('category')||'all',page=Number(params.get('page'))||1;
 if(!$$('[data-category-filter]').some(b=>b.dataset.categoryFilter===category))category='all';input.value=params.get('q')||'';
 const ru=()=>document.documentElement.lang==='ru';
 function filter({reset=false,scroll=false}={}){
  const query=input.value.trim().toLocaleLowerCase(),matches=stories.filter(story=>(category==='all'||story.dataset.category===category)&&(!query||story.dataset.search.includes(query))),count=matches.length,pages=Math.max(1,Math.ceil(count/pageSize));if(reset)page=1;page=Math.max(1,Math.min(pages,Math.floor(page)||1));
  stories.forEach(story=>story.hidden=!matches.slice((page-1)*pageSize,page*pageSize).includes(story));
  $$('[data-category-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.categoryFilter===category)));
  $('.news-empty').hidden=count!==0;$('.search-clear').hidden=!input.value;
  $('.results-status').textContent=ru()?`Найдено публикаций: ${count}`:`Stories found: ${count}`;
  const numbers=$('.page-numbers');numbers.replaceChildren();for(let number=1;number<=pages;number++){const b=document.createElement('button');b.type='button';b.textContent=number;b.dataset.page=number;b.setAttribute('aria-label',ru()?`Страница ${number}`:`Page ${number}`);if(number===page)b.setAttribute('aria-current','page');b.addEventListener('click',()=>{page=number;filter({scroll:true});});numbers.append(b);}
  $('[data-page-prev]').disabled=page===1;$('[data-page-next]').disabled=page===pages;$('.news-pagination').hidden=count===0;
  const url=new URL(location.href);url.search='';if(category!=='all')url.searchParams.set('category',category);if(input.value.trim())url.searchParams.set('q',input.value.trim());if(page>1)url.searchParams.set('page',String(page));try{history.replaceState(null,'',url);}catch{}
  if(scroll){$('.news-toolbar').scrollIntoView({block:'start',behavior:'instant'});$('.news-pagination button[aria-current=page]')?.focus({preventScroll:true});}
 }
 $$('[data-category-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filter({reset:true});}));
 $('.news-search').addEventListener('submit',e=>e.preventDefault());input.addEventListener('input',()=>filter({reset:true}));
 $('[data-page-prev]').addEventListener('click',()=>{page--;filter({scroll:true});});$('[data-page-next]').addEventListener('click',()=>{page++;filter({scroll:true});});
 $('.search-clear').addEventListener('click',()=>{input.value='';filter();input.focus();});
 $('[data-reset]').addEventListener('click',()=>{input.value='';$('[data-category-filter="all"]').click();input.focus();});
 function language(){
  document.title=ru()?'Новости — Space Arena':'News — Space Arena';
  input.placeholder=ru()?'Поиск новостей':'Search news';
  $('.search-clear').setAttribute('aria-label',ru()?'Очистить поиск':'Clear search');
  $('.news-categories').setAttribute('aria-label',ru()?'Категории':'Categories');
  $('.news-pagination').setAttribute('aria-label',ru()?'Страницы новостей':'News pages');$('[data-page-prev]').setAttribute('aria-label',ru()?'Предыдущая страница':'Previous page');$('[data-page-next]').setAttribute('aria-label',ru()?'Следующая страница':'Next page');
  $$('[data-cover-ru]').forEach(image=>image.src=image.dataset[ru()?'coverRu':'coverEn']);
  $$('time[datetime]').forEach(time=>{time.textContent=new Intl.DateTimeFormat(ru()?'ru-RU':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(time.dateTime+'T12:00:00Z'));});filter();
 }
 document.addEventListener('promo-language-change',language);language();
})();
