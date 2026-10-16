(() => {
 'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const groups=$$('.handbook-group'),directory=$('.question-directory'),mobile=matchMedia('(max-width:768px)');let active='',frame=0,readingAnchor=null;
 function mark(id){
  if(id===active)return;active=id;
  $$('[data-group-link]').forEach(a=>{if(a.dataset.groupLink===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  $$('[data-outline-group]').forEach(e=>e.hidden=e.dataset.outlineGroup!==id);
  $('.handbook-outline').scrollTop=0;
 }
 function track(){
  frame=0;const offset=mobile.matches?200:140;
  let group=groups[0];for(const g of groups)if(g.getBoundingClientRect().top<=offset)group=g;
  mark(group.id);
  let question=null;for(const q of group.querySelectorAll('.handbook-question'))if(q.getBoundingClientRect().top<=offset+45)question=q;
  const reference=question||group;readingAnchor=scrollY>$('.handbook-intro').offsetTop?{id:reference.id,top:reference.getBoundingClientRect().top}:null;
  $$('[data-question-link]').forEach(a=>{if(a.dataset.questionLink===question?.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(track);}
 function layout(){directory.open=!mobile.matches;schedule();}mobile.addEventListener('change',layout);layout();
 const aliases={'gameplay-payment':'faq-1-1','gameplay-progress':'faq-1-2','gameplay-matchmaking':'faq-1-3','ships-classes':'faq-2-2','ships-blueprints':'faq-2-3','ships-modifications':'faq-2-4','weapons-types':'faq-3-1','weapons-lasers':'faq-3-4','weapons-missiles':'faq-3-5'};
 function locateHash(){const hash=decodeURIComponent(location.hash.slice(1)),id=aliases[hash]||hash,target=document.getElementById(id);if(!target)return;if(aliases[hash])history.replaceState(null,'','#'+id);target.scrollIntoView({behavior:'instant',block:'start'});schedule();}
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.hash.slice(1),target=document.getElementById(id);if(!target)return;
  if(a.closest('.handbook-sidebar')&&mobile.matches)directory.open=false;
  if(target.matches('.handbook-question,.handbook-group'))target.focus({preventScroll:true});
 });
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('hashchange',()=>{requestAnimationFrame(locateHash);});
 function language(){const ru=document.documentElement.lang==='ru';document.title='FAQ — Space Arena';$$('[data-permalink]').forEach(a=>a.setAttribute('aria-label',ru?'Прямая ссылка на вопрос':'Permalink to question'));$('.handbook-categories').setAttribute('aria-label',ru?'Разделы FAQ':'FAQ categories');$('.handbook-outline').setAttribute('aria-label',ru?'Вопросы раздела':'Questions in this section');$$('.chapter-topics').forEach(nav=>nav.setAttribute('aria-label',ru?'Подразделы':'Topics'));$$('.handbook-answer img').forEach(image=>{image.alt=(ru?'Иллюстрация к вопросу: ':'Illustration for: ')+image.closest('.handbook-question').querySelector('h4').textContent;image.width=221;image.height=300;});schedule();}
 document.addEventListener('promo-language-change',()=>{const anchor=readingAnchor;language();if(anchor){const target=document.getElementById(anchor.id);scrollBy({top:target.getBoundingClientRect().top-anchor.top,behavior:'instant'});schedule();}});language();
 document.fonts.ready.then(()=>{locateHash();track();});
})();
