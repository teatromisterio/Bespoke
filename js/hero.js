(function () {
  var video     = document.getElementById('video');
  var wrap      = document.getElementById('heroScroll');
  var media     = document.getElementById('media');
  var title     = document.getElementById('title');
  var hint      = document.getElementById('hint');
  var preloader = document.getElementById('preloader');
  var pctEl     = document.getElementById('pct');
  var barEl     = document.getElementById('bar');

  var isMobile      = window.matchMedia('(max-width: 767px)').matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var shrinkMode    = !isMobile && !reducedMotion;

  var SRC     = isMobile ? 'hero-mobile.mp4' : 'hero-loop.mp4';
  var started = false;

  function setProgress(p) {
    var pct = Math.min(100, Math.round(p * 100));
    pctEl.textContent = pct + '%';
    barEl.style.transform = 'scaleX(' + p + ')';
  }

  function showError() {
    pctEl.textContent = 'Видео не найдено';
    pctEl.style.textTransform = 'none';
    pctEl.style.letterSpacing = '.04em';
    barEl.parentNode.outerHTML =
      '<div style="max-width:420px;text-align:center;font-size:12px;line-height:1.7;opacity:.6;font-weight:400">' +
      'Файл <b>' + SRC + '</b> должен лежать в одной папке с index.html, ' +
      'с точно таким именем.<br>Открывайте страницу через локальный сервер: ' +
      '<b>npx serve</b> или <b>python3 -m http.server</b> в папке проекта.</div>';
  }

  /* ---------- запуск ---------- */
  function start() {
    if (started) return;
    started = true;
    setProgress(1);
    preloader.classList.add('is-done');
    document.body.classList.add('is-ready');

    video.play().catch(function(){});          /* видео просто играет по кругу */

    if (shrinkMode) {
      requestAnimationFrame(tick);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------- прямая загрузка через <video> (надёжный путь) ---------- */
  function loadDirect() {
    if (started) return;
    video.src = SRC;
    video.load();
    video.addEventListener('canplaythrough', start, { once: true });
    video.addEventListener('error', showError, { once: true });
    video.addEventListener('progress', function () {
      if (started || !video.duration) return;
      try {
        var b = video.buffered;
        if (b.length) setProgress(b.end(b.length - 1) / video.duration);
      } catch (e) {}
    });
  }

  /* ---------- fetch с процентами (http/https) ---------- */
  function loadWithProgress() {
    fetch(SRC).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      var total  = +res.headers.get('Content-Length') || 0;
      var reader = res.body.getReader();
      var chunks = [], received = 0;
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return new Blob(chunks, { type: 'video/mp4' });
          chunks.push(r.value);
          received += r.value.length;
          if (total) setProgress(received / total);
          return pump();
        });
      }
      return pump();
    }).then(function (blob) {
      if (started) return;
      video.src = URL.createObjectURL(blob);
      video.load();
      video.addEventListener('canplaythrough', start, { once: true });
      video.addEventListener('error', showError, { once: true });
    }).catch(loadDirect);
  }

  if (location.protocol === 'file:') { loadDirect(); }
  else { loadWithProgress(); }

  setTimeout(function () { if (!started && !video.src) loadDirect(); }, 8000);
  setTimeout(function () { if (!started && video.readyState === 0) showError(); }, 14000);

  /* ---------- сжатие видеоблока при скролле (как на референсе) ----------
     Прогресс скролла по обёртке 220vh маппится на clip-path: inset().
     Видео при этом продолжает играть, его никто не скрабит. */
  var progress = 0;   /* сырой прогресс из скролла */
  var eased    = 0;   /* сглаженный, применяется к стилям */

  function onScroll() {
    var rect       = wrap.getBoundingClientRect();
    var scrollable = wrap.offsetHeight - window.innerHeight;
    progress = Math.min(1, Math.max(0, -rect.top / scrollable));
  }

  function tick() {
    eased += (progress - eased) * 0.12;
    var p = eased;

    /* блок сжимается к центру: по вертикали до 15%, по горизонтали до 28% —
       в финале остаётся портретное «окно» ~44% × 70% экрана, как у референса */
    var insetY = p * 15;
    var insetX = p * 28;
    media.style.clipPath = 'inset(' + insetY + '% ' + insetX + '%)';

    /* лёгкий встречный масштаб — контент «отъезжает вглубь» */
    video.style.transform = 'scale(' + (1 + p * 0.08) + ')';

    /* текст уходит раньше, чем блок заметно сжался */
    var t = Math.min(1, Math.max(0, (p - 0.05) / 0.30));
    title.style.opacity   = 1 - t;
    title.style.transform = 'translateY(' + (-t * 60) + 'px)';
    hint.style.opacity    = p > 0.02 ? 0 : '';

    requestAnimationFrame(tick);
  }
})();
