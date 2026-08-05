/* Попап концепта (макет 9019:467).
   Открытие: клик по изображению плитки или по кнопке «Увеличить».
   Листание < / > идёт по СПИСКУ ВИДИМЫХ карточек (уважает активный фильтр),
   по кругу. Закрытие: X, клик по фону, Esc. Стрелки клавиатуры листают. */
(function () {
  var box = document.getElementById('lightbox');
  if (!box) return;
  var img   = box.querySelector('.lightbox__img');
  var nameEl = document.getElementById('lbName');
  var catEl  = document.getElementById('lbCat');
  var btnPrev = document.getElementById('lbPrev');
  var btnNext = document.getElementById('lbNext');
  var btnClose = document.getElementById('lbClose');

  var list = [];      /* видимые карточки на момент открытия */
  var index = 0;
  var lastFocus = null;

  function cardData(card) {
    var image = card.querySelector('.tile__media img');
    return {
      /* в попап идёт крупная версия из data-large; плиточная — только запасной вариант */
      src: card.getAttribute('data-large') || (image ? image.src : ''),
      name: 'Название',
      cat: (card.getAttribute('data-tags') || '').replace(/,/g, ', ')
    };
  }

  function render() {
    var d = cardData(list[index]);
    img.style.opacity = '0';
    setTimeout(function () {
      img.src = d.src;
      img.alt = d.name + ' — ' + d.cat;
      nameEl.textContent = d.name;
      catEl.textContent = d.cat;
      img.style.opacity = '1';
    }, 200);
  }

  function open(card) {
    list = Array.prototype.slice.call(document.querySelectorAll('.concept'))
      .filter(function (c) { return !c.hidden; });
    if (!list.length) return;
    index = Math.max(0, list.indexOf(card));
    lastFocus = document.activeElement;

    var d = cardData(list[index]);
    img.src = d.src; img.alt = d.name + ' — ' + d.cat;
    nameEl.textContent = d.name; catEl.textContent = d.cat;

    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function shut() {
    box.classList.remove('is-open');
    setTimeout(function () {
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }, 350);
  }

  function step(dir) {
    if (!list.length) return;
    index = (index + dir + list.length) % list.length;
    render();
  }

  /* открытие: клик по картинке плитки или по «Увеличить» */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.tile__zoom-btn, .concept .tile__media');
    if (!trigger) return;
    var card = trigger.closest('.concept');
    if (card) open(card);
  });

  btnPrev.addEventListener('click', function () { step(-1); });
  btnNext.addEventListener('click', function () { step(1); });
  btnClose.addEventListener('click', shut);
  box.addEventListener('click', function (e) { if (e.target === box) shut(); });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') shut();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
})();
