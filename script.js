const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let language = 'en';
try { language = localStorage.getItem('space-arena-language') === 'ru' ? 'ru' : 'en'; } catch {}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menuToggle = $('.menu-toggle');
const navigation = $('.navigation');
function closeMenu() { menuToggle.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
menuToggle.addEventListener('click', () => { const open = menuToggle.getAttribute('aria-expanded') !== 'true'; menuToggle.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open); });
$$('.navigation > a').forEach(a => a.addEventListener('click', closeMenu));
matchMedia('(max-width: 768px)').addEventListener('change', closeMenu);
const socialMenu = $('.social-menu');
const socialToggle = $('.social-toggle');
function setSocial(open) { socialToggle.setAttribute('aria-expanded', String(open)); $('.social-links').hidden = !open; }
socialToggle.addEventListener('click', () => setSocial(socialToggle.getAttribute('aria-expanded') !== 'true'));
socialMenu.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover) and (min-width: 769px)').matches) setSocial(true); });
socialMenu.addEventListener('mouseleave', () => { if (!socialMenu.contains(document.activeElement)) setSocial(false); });
socialMenu.addEventListener('focusout', event => { if (!socialMenu.contains(event.relatedTarget)) setSocial(false); });
document.addEventListener('click', event => { if (!socialMenu.contains(event.target)) setSocial(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); setSocial(false); } });

const galleryData = [
  [7,'Research your next advantage','Исследуй новые возможности','MODULES / RESEARCH','МОДУЛИ / ИССЛЕДОВАНИЯ','Space Arena module research tree'],
  [4,'Make every module count','Найди место каждому модулю','DESIGN / ENGINEERING','БИЛД / ИНЖЕНЕРИЯ','Ship layout with weapon, reactor, engine and armour modules'],
  [2,'Put your strategy to the test','Проверь свою стратегию','PVP / TACTICAL BATTLES','PVP / ТАКТИЧЕСКИЕ БОИ','Two modular spaceships fighting with lasers and shields'],
  [1,'From your first fighter to a flagship','От первого истребителя до флагмана','HULLS / PROGRESSION','КОРПУСА / РАЗВИТИЕ','Comparison of small and advanced spaceship hulls'],
  [3,'Discover your next flagship','Выбери новый флагман','FLEET / SHIP CLASSES','ФЛОТ / КЛАССЫ КОРАБЛЕЙ','Fighter, cruiser and galactic carrier spaceship classes'],
  [5,'Find your allies. Face your rivals.','Найди союзников. Брось вызов соперникам.','COMMUNITY / CLAN WARS','СООБЩЕСТВО / ВОЙНЫ КЛАНОВ','Two clans facing each other in a clan war'],
  [6,'Chart your course through the galaxy','Проложи путь через галактику','CAMPAIGN / EXPLORATION','КАМПАНИЯ / ИССЛЕДОВАНИЕ','Campaign map connecting distant star systems']
];
const track = $('.gallery-track');
galleryData.forEach((data,index) => {
  const slide = document.createElement('figure'); slide.className = 'gallery-slide';
  slide.innerHTML = `<button class="gallery-open" type="button" data-index="${index}" aria-label="Enlarge image ${index + 1}"><img src="assets/screenshots/scene-${data[0]}.webp" width="1920" height="1080" alt="${data[5]}" loading="lazy"><span class="enlarge">⤢</span></button><figcaption><span data-en="${data[1]}" data-ru="${data[2]}">${data[1]}</span><small data-en="${data[3]}" data-ru="${data[4]}">${data[3]}</small></figcaption>`;
  track.append(slide);
});
const slides = $$('.gallery-slide');
let activeSlide = 0, lightboxIndex = 0;
slides.forEach((slide,index) => {
  const thumb = document.createElement('button'); thumb.type='button'; thumb.className='gallery-thumb'; thumb.setAttribute('aria-label',`Screenshot ${index+1}`);
  const image = slide.querySelector('img').cloneNode(); image.alt=''; thumb.append(image); thumb.addEventListener('click',()=>goTo(index)); $('.gallery-thumbs').append(thumb);
});
function updateGallery(index) {
  activeSlide=index; $('.gallery-count').textContent=`${String(index+1).padStart(2,'0')} / 07`;
  $$('.gallery-thumb').forEach((b,i)=>b.setAttribute('aria-current',String(index===i)));
  $('.gallery-prev').disabled=index===0; $('.gallery-next').disabled=index===slides.length-1;
}
function goTo(index) {
  const target=Math.max(0,Math.min(index,slides.length-1));
  const distance=slides[target].getBoundingClientRect().left-track.getBoundingClientRect().left-(track.clientWidth-slides[target].clientWidth)/2;
  track.scrollTo({left:track.scrollLeft+distance,behavior:reducedMotion.matches?'instant':'smooth'});
}
$('.gallery-prev').addEventListener('click',()=>goTo(activeSlide-1)); $('.gallery-next').addEventListener('click',()=>goTo(activeSlide+1));
let scrollFrame;
track.addEventListener('scroll',()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{
  const center=track.getBoundingClientRect().left+track.clientWidth/2;
  const distances=slides.map(s=>Math.abs(s.getBoundingClientRect().left+s.clientWidth/2-center)); updateGallery(distances.indexOf(Math.min(...distances)));
});},{passive:true});
track.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();goTo(activeSlide+(event.key==='ArrowRight'?1:-1));}});
let dragging=false,startX=0,startScroll=0,dragged=false;
track.addEventListener('pointerdown',event=>{dragged=false;if(event.pointerType!=='mouse'||event.button!==0)return;dragging=true;startX=event.clientX;startScroll=track.scrollLeft;});
window.addEventListener('pointermove',event=>{if(!dragging)return;const distance=event.clientX-startX;if(Math.abs(distance)>6){dragged=true;track.classList.add('dragging');track.scrollLeft=startScroll-distance;event.preventDefault();}});
function endDrag(){if(!dragging)return;dragging=false;track.classList.remove('dragging');if(dragged)goTo(activeSlide);}
window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);track.addEventListener('dragstart',event=>event.preventDefault());
const lightbox=$('.lightbox');
function showImage(index){
  lightboxIndex=Math.max(0,Math.min(index,slides.length-1));const image=slides[lightboxIndex].querySelector('img');lightbox.querySelector('figure img').src=image.src;lightbox.querySelector('figure img').alt=image.alt;
  lightbox.querySelector('figcaption').textContent=`${lightboxIndex+1} / 7 — ${slides[lightboxIndex].querySelector('figcaption > span').textContent}`;
  $('.lightbox-prev').disabled=lightboxIndex===0;$('.lightbox-next').disabled=lightboxIndex===slides.length-1;
}
$$('.gallery-open').forEach(button=>button.addEventListener('click',()=>{if(dragged){dragged=false;return;}showImage(Number(button.dataset.index));lightbox.showModal();}));
$('.lightbox-prev').addEventListener('click',()=>showImage(lightboxIndex-1));$('.lightbox-next').addEventListener('click',()=>showImage(lightboxIndex+1));
lightbox.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showImage(lightboxIndex+(event.key==='ArrowRight'?1:-1));}});
let swipeStart;
lightbox.querySelector('figure').addEventListener('pointerdown',e=>swipeStart=e.clientX);
lightbox.querySelector('figure').addEventListener('pointerup',e=>{const d=e.clientX-swipeStart;if(Math.abs(d)>50)showImage(lightboxIndex+(d<0?1:-1));});updateGallery(0);

const modules={
  weapons:{image:'_PromoRes/Модули/Weapons/Railgun_2x2_01.png',en:['Firepower with a purpose','Lasers, missiles or ballistics? Build around the way you want to win.'],ru:['Огневая мощь со смыслом','Лазеры, ракеты или баллистика? Выбирай оружие под свою стратегию.']},
  defense:{image:'_PromoRes/Модули/Defense/Shield2x2.png',en:['Protection in the right place','Armour absorbs damage. Shields change the equation. Find the balance your hull needs.'],ru:['Защита на своём месте','Броня принимает урон. Щиты меняют расклад. Найди баланс для своего корпуса.']},
  energy:{image:'_PromoRes/Модули/Utility/Reactor2x2.png',en:['Power your whole strategy','Give weapons, shields and engines the energy they need to keep your build working.'],ru:['Энергия для всей стратегии','Обеспечь оружие, щиты и двигатели энергией, чтобы твой билд работал.']}
};
let activeModule='weapons';
function updateModule(key){activeModule=key;const data=modules[key];$$('.module-tabs button').forEach(b=>{const selected=b.dataset.module===key;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});$('#module-info').setAttribute('aria-labelledby',`tab-${key}`);$('#module-title').textContent=data[language][0];$('#module-description').textContent=data[language][1];$('#module-icon').src=data.image;$('.blueprint').dataset.active=key;}
$$('.module-tabs button').forEach((button,index,buttons)=>{button.addEventListener('click',()=>updateModule(button.dataset.module));button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%buttons.length;if(e.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;if(e.key==='Home')next=0;if(e.key==='End')next=buttons.length-1;if(next!==undefined){e.preventDefault();updateModule(buttons[next].dataset.module);buttons[next].focus();}});});
const videoModal=$('.video-modal');const video=videoModal.querySelector('video');
$('.trailer-card').addEventListener('click',()=>{video.src='_PromoRes/Video/2020-07-28%2011-47-47.mp4';videoModal.showModal();video.play().catch(()=>{});});
videoModal.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();});
$$('.play-button').forEach(b=>b.addEventListener('click',()=>$('.notice-modal').showModal()));
$('.notice-modal a').addEventListener('click',()=>$('.notice-modal').close());
$$('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}));
function setLanguage(next){language=next;document.documentElement.lang=next;$$('[data-en][data-ru]').forEach(el=>el.innerHTML=el.dataset[next]);$('.language-toggle').innerHTML=next==='ru'?'<span>RU</span><i>/ EN</i>':'<span>EN</span><i>/ RU</i>';$('.language-toggle').setAttribute('aria-label',next==='ru'?'Switch to English':'Переключить на русский');updateModule(activeModule);if(lightbox.open)showImage(lightboxIndex);try{localStorage.setItem('space-arena-language',next);}catch{}}
$('.language-toggle').addEventListener('click',()=>setLanguage(language==='en'?'ru':'en'));setLanguage(language);
