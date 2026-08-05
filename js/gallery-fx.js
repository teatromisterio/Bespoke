/* галерея: параллакс колонок + зум изображений, управляемые скроллом (стиль референса).
   Параллакс — transform на .gallery__cell (ячейке), ревил живёт на figure,
   зум — на img: три слоя трансформаций не конфликтуют. */
(function () {
  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (reduced) return;

  var cells = Array.prototype.slice.call(document.querySelectorAll('.gallery__cell'));
  if (!cells.length) return;

  /* коэффициенты скорости по колонкам: соседние движутся навстречу */
  var K = [-0.06, 0.05, -0.09, 0.07, -0.045];
  var COLS = 5;

  var items = cells.map(function (cell, i) {
    return { cell: cell, zoom: cell.querySelector('.tile__zoom'), col: i % COLS };
  });

  var gallery = document.querySelector('.gallery');
  var cta     = document.getElementById('galleryCta');

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    var vc = vh / 2;
    items.forEach(function (it) {
      var r = it.cell.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;  /* вне вьюпорта не считаем */

      /* параллакс: смещение пропорционально удалению центра плитки от центра экрана */
      if (!isMobile) {
        var d = (r.top + r.height / 2) - vc;
        it.cell.style.transform = 'translateY(' + (d * K[it.col]).toFixed(1) + 'px)';
      }

      /* зум: плитка входит снизу увеличенной (1.16) и оседает к 1.0 к выходу вверх */
      var p = 1 - Math.min(1, Math.max(0, (r.top + r.height) / (vh + r.height)));
      it.zoom.style.transform = 'scale(' + (1.16 - 0.16 * p).toFixed(3) + ')';
    });

    /* появление/исчезание кнопки (принцип референса):
       въезд секции к центру экрана — fade-in с подъёмом,
       уход низа секции за центр — fade-out с подъёмом дальше вверх */
    if (gallery && cta) {
      var g    = gallery.getBoundingClientRect();
      var c    = vh / 2;
      var ramp = vh * 0.28;                                      /* длина рампы появления */
      var fin  = Math.min(1, Math.max(0, ((c + ramp) - g.top) / ramp));
      var fout = Math.min(1, Math.max(0, (g.bottom - (c - ramp * 0.3)) / ramp));
      cta.style.opacity   = Math.min(fin, fout).toFixed(3);
      cta.style.translate = '0 ' + ((1 - fin) * 26 - (1 - fout) * 26).toFixed(1) + 'px';
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
