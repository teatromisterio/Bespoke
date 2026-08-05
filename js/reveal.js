/* появление текста контентных секций в стиле референса:
   заголовки — слова поднимаются из-под линии строки со стаггером,
   остальные элементы (.fx) — мягкий fade-up в порядке следования в DOM.
   Работает для любой секции с атрибутом data-reveal. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAGGER = 0.035;  /* сек между словами заголовка */
  var STEP    = 0.15;   /* сек между второстепенными элементами */

  function wrapWords(node, gold, startDelay, counter) {
    var frag = document.createDocumentFragment();
    var parts = node.textContent.split(/(\s+)/);
    parts.forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
      var mask = document.createElement('span');
      mask.className = 'wmask';
      var w = document.createElement('span');
      w.className = 'w' + (gold ? ' gold' : '');
      w.textContent = part;
      w.style.setProperty('--d', (startDelay + counter.i * STAGGER).toFixed(3) + 's');
      counter.i++;
      mask.appendChild(w);
      frag.appendChild(mask);
    });
    return frag;
  }

  document.querySelectorAll('[data-reveal]').forEach(function (section) {
    /* хронометраж секции: анимируемые элементы стартуют друг за другом в порядке DOM */
    var t = 0;
    var items = section.querySelectorAll('.fx, [data-split]');

    items.forEach(function (el) {
      if (el.hasAttribute('data-split')) {
        if (reduced) return;
        var counter = { i: 0 };
        var start = t;
        Array.prototype.slice.call(el.childNodes).forEach(function (node) {
          if (node.nodeType === 3) {
            el.replaceChild(wrapWords(node, false, start, counter), node);
          } else if (node.nodeType === 1) {
            var gold = node.classList.contains('gold');
            el.replaceChild(wrapWords(node, gold, start, counter), node);
          }
        });
        t = start + counter.i * STAGGER + 0.35;
      } else {
        el.style.setProperty('--d', t.toFixed(2) + 's');
        t += el.classList.contains('fx--fast') ? 0.06 : STEP;
      }
    });

    if ('IntersectionObserver' in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            section.classList.add('is-in');
            io.disconnect();
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px 12% 0px' });   /* старт чуть раньше входа секции */
      io.observe(section);
    } else {
      section.classList.add('is-in');
    }
  });
})();
