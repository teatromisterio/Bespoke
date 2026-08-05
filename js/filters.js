/* Фильтр галереи: мультивыбор чипов + фильтрация карточек концептов.
   Логика ИЛИ: карточка видна, если хотя бы один её data-tag выбран.
   Ничего не выбрано — показаны все. */
(function () {
  var chips  = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var status = document.getElementById('filterStatus');
  var cards  = Array.prototype.slice.call(document.querySelectorAll('.concept'));
  var fabCount = document.getElementById('filterFabCount');
  if (!chips.length || !status) return;

  var HIDE_MS = 350;

  function selected() {
    return chips
      .filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })
      .map(function (c) { return c.textContent.trim().toLowerCase(); });
  }

  function applyFilters() {
    var names = selected();

    /* карточки: анимированное скрытие, затем display:none — сетка перестраивается */
    var visible = 0;
    cards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').toLowerCase().split(',');
      var show = !names.length || tags.some(function (t) { return names.indexOf(t.trim()) !== -1; });
      if (show) {
        visible++;
        card.hidden = false;
        requestAnimationFrame(function () { card.classList.remove('is-hiding'); });
      } else if (!card.hidden) {
        card.classList.add('is-hiding');
        setTimeout(function () {
          if (card.classList.contains('is-hiding')) card.hidden = true;
        }, HIDE_MS);
      }
    });

    /* счётчик выбранных фильтров на мобильной кнопке */
    if (fabCount) {
      fabCount.hidden = !names.length;
      fabCount.textContent = names.length;
    }

    /* строка состояния */
    if (!names.length) {
      status.textContent = cards.length
        ? 'Показаны все концепты (' + cards.length + ')'
        : 'Показаны все концепты';
    } else {
      status.innerHTML = 'Выбрано: <b>' + names.join(', ') + '</b> — концептов: ' + visible +
        '<button class="filterchips__reset" type="button">Сбросить</button>';
      status.querySelector('.filterchips__reset').addEventListener('click', reset);
    }
  }

  function reset() {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    applyFilters();
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var on = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', on ? 'false' : 'true');
      applyFilters();
    });
  });

  applyFilters();
})();
