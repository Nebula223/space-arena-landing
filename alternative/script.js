(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  let lang = 'ru';
  try { lang = localStorage.getItem('sa-shipyard-language') === 'en' ? 'en' : 'ru'; } catch {}
  const t = (ru, en) => lang === 'ru' ? ru : en;
  const slides = [
    { file: 'build', ru: 'Конструктор корабля', en: 'Ship construction' },
    { file: 'battle', ru: 'Космические сражения', en: 'Space battles' },
    { file: 'research', ru: 'Исследование модулей', en: 'Module research' },
    { file: 'fleet', ru: 'Корабли и развитие', en: 'Ships and progression' }
  ];
  let slide = 0;

  const nav = $('#navigation'), menu = $('.menu'), social = $('#social-toggle'), socialLinks = $('#social-links');
  function closeSocial() { socialLinks.hidden = true; social.setAttribute('aria-expanded', 'false'); }
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label',t('Открыть меню','Open menu')); closeSocial(); }
  menu.addEventListener('click', () => { const open = !nav.classList.contains('open'); nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? t('Закрыть меню', 'Close menu') : t('Открыть меню', 'Open menu')); if (!open) closeSocial(); });
  social.addEventListener('click', () => { socialLinks.hidden = !socialLinks.hidden; social.setAttribute('aria-expanded', String(!socialLinks.hidden)); });
  $$('.nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', event => { if (!event.target.closest('.social')) closeSocial(); if (!event.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (!socialLinks.hidden) { closeSocial(); social.focus(); } else if (nav.classList.contains('open')) { closeMenu(); menu.focus(); } } });
  matchMedia('(min-width:769px)').addEventListener('change', closeMenu);

  const imageDialog = $('.image-dialog'), videoDialog = $('.video-dialog');
  function showSlide(index) {
    slide = (index + slides.length) % slides.length;
    const data = slides[slide];
    $('#gallery-image').src = `assets/screen-${data.file}.webp`;
    $('#gallery-image').alt = data[lang];
    $('#gallery-count').textContent = `0${slide + 1} / 04`;
    $$('.gallery-choice').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.slide) === slide)));
    $('img', imageDialog).src = `assets/screen-${data.file}.webp`;
    $('img', imageDialog).alt = data[lang];
    $('figcaption', imageDialog).textContent = `0${slide + 1} / 04 — ${data[lang]}`;
  }
  $$('.gallery-choice').forEach(button => button.addEventListener('click', () => showSlide(Number(button.dataset.slide))));
  $$('.gallery-next,.lightbox-next').forEach(button => button.addEventListener('click', () => showSlide(slide + 1)));
  $$('.gallery-prev,.lightbox-prev').forEach(button => button.addEventListener('click', () => showSlide(slide - 1)));
  function openDialog(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
  $('.expand-image').addEventListener('click', () => openDialog(imageDialog));
  imageDialog.addEventListener('keydown', event => { if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); showSlide(slide + (event.key === 'ArrowRight' ? 1 : -1)); } });
  let touchX = null;
  imageDialog.addEventListener('touchstart', event => { touchX = event.touches[0].clientX; }, { passive: true });
  imageDialog.addEventListener('touchend', event => { if (touchX !== null) { const delta = event.changedTouches[0].clientX - touchX; if (Math.abs(delta) > 50) showSlide(slide + (delta < 0 ? 1 : -1)); touchX = null; } }, { passive: true });
  const video = $('video', videoDialog);
  $$('[data-video]').forEach(button => button.addEventListener('click', () => { video.src = 'assets/gameplay.mp4'; openDialog(videoDialog); video.play().catch(() => {}); }));
  $$('dialog').forEach(dialog => {
    $('.close-dialog', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (dialog === videoDialog) { video.pause(); video.removeAttribute('src'); video.load(); } });
  });
  function applyLanguage() {
    document.documentElement.lang = lang;
    $$('[data-ru][data-en]').forEach(element => { element.innerHTML = element.dataset[lang]; });
    $('.language').innerHTML = lang.toUpperCase() + `<span> / ${lang === 'ru' ? 'EN' : 'RU'}</span>`;
    $('.language').setAttribute('aria-label', t('Switch to English', 'Переключить на русский'));
    document.title = t('Space Arena — Победа начинается с чертежа', 'Space Arena — Victory starts with a blueprint');
    $('meta[name=description]').content = t('Space Arena — конструктор космических кораблей. Выбери корпус, собери свой билд и испытай его в автоматических боях.', 'Space Arena — a spaceship building game. Choose a hull, design your build and test it in automatic battles.');
    nav.setAttribute('aria-label', t('Навигация', 'Navigation'));
    menu.setAttribute('aria-label', nav.classList.contains('open') ? t('Закрыть меню','Close menu') : t('Открыть меню','Open menu'));
    $('.hero-ship').alt = t('Трёхмерная модель космического корабля Supreme','3D model of the Supreme spaceship');
    $$('.fleet-image img').forEach((img,i)=>img.alt = t('Корабль ','Spaceship ') + ['Acolyte','Vulture','Prophet'][i]);
    $('.battle-video').setAttribute('aria-label',t('Смотреть игровой бой','Watch a battle'));
    $('.battle-video>img').alt = t('Космический бой в Space Arena','A space battle in Space Arena');
    $('.expand-image').setAttribute('aria-label',t('Увеличить скриншот','Enlarge screenshot'));
    $$('.gallery-prev,.lightbox-prev').forEach(b=>b.setAttribute('aria-label',t('Предыдущий скриншот','Previous screenshot')));
    $$('.gallery-next,.lightbox-next').forEach(b=>b.setAttribute('aria-label',t('Следующий скриншот','Next screenshot')));
    $$('.close-dialog').forEach(b=>b.setAttribute('aria-label',t('Закрыть','Close')));
    imageDialog.setAttribute('aria-label',t('Скриншоты Space Arena','Space Arena screenshots'));
    window.dispatchEvent(new CustomEvent('sa:language',{detail:lang})); showSlide(slide);
  }
  $('.language').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; try { localStorage.setItem('sa-shipyard-language',lang); } catch {} applyLanguage(); });
  applyLanguage();
})();
