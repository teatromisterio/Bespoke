/* Мобильная шторка фильтра.
   FAB «Открыть фильтр» фиксирован внизу и следует за скроллом.
   Тап — шторка выезжает снизу (чипы в горизонтальной ленте),
   «Применить» — шторка закрывается, FAB возвращается.
   Фильтры применяются живьём при тапах по чипам (логика в filters.js),
   «Применить» подтверждает и закрывает. */
(function () {
  var fab   = document.getElementById('filterFab');
  var sheet = document.getElementById('filterSheet');
  var apply = document.getElementById('filterApply');
  if (!fab || !sheet || !apply) return;

  function open() {
    sheet.classList.add('is-open');
    fab.classList.add('is-hidden');
    fab.setAttribute('aria-expanded', 'true');
  }
  function close() {
    sheet.classList.remove('is-open');
    fab.classList.remove('is-hidden');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  fab.addEventListener('click', open);
  apply.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) close();
  });
})();
