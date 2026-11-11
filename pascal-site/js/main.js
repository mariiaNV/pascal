(function () {
  'use strict';
  var CFG = window.PASCAL || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- Analytics (GTM / GA4 + dataLayer) ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    var p = params || {};
    window.dataLayer.push(Object.assign({ event: name }, p));
    if (typeof window.gtag === 'function') window.gtag('event', name, p);
  }
  function loadAnalytics() {
    if (CFG.gtmId) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CFG.gtmId);
      document.head.appendChild(s);
    }
    if (CFG.ga4Id) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      var g = document.createElement('script'); g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.ga4Id);
      document.head.appendChild(g);
      window.gtag('js', new Date()); window.gtag('config', CFG.ga4Id);
    }
  }
  loadAnalytics();
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), { location: el.getAttribute('data-loc') || '' });
  });

  /* ---------- Hero text split ---------- */
  $$('[data-split]').forEach(function (el, idx) {
    var text = el.textContent; el.textContent = ''; el.setAttribute('aria-hidden', 'true');
    text.split('').forEach(function (c, i) {
      var s = document.createElement('span');
      s.className = 'ch'; s.textContent = c === ' ' ? ' ' : c;
      s.style.transitionDelay = (0.15 + idx * 0.25 + i * 0.045) + 's';
      el.appendChild(s);
    });
  });

  /* ---------- Preloader / page reveal ---------- */
  var pre = $('#preloader');
  function ready() {
    document.documentElement.classList.add('is-ready');
    if (pre) { pre.classList.add('is-done'); setTimeout(function () { pre.remove(); }, 1200); }
    initCounters();
  }
  if (reduce || !pre) { ready(); } else {
    var minTime = new Promise(function (r) { setTimeout(r, 1100); });
    var loaded = new Promise(function (r) { if (document.readyState === 'complete') r(); else window.addEventListener('load', r); });
    Promise.all([minTime, loaded]).then(ready);
    setTimeout(ready, 4000); // страховка
  }

  /* ---------- Header ---------- */
  var header = $('#header');
  var burger = $('#burger'), menu = $('#mobile-menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  window.matchMedia('(min-width:1025px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ---------- Scroll: header state + parallax (один rAF) ---------- */
  var par = $$('[data-parallax]'), ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (!reduce && y < window.innerHeight * 1.5) {
      par.forEach(function (el) { el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-parallax'))) + 'px,0)'; });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revs = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revs.forEach(function (el, i) {
      // лёгкий stagger для соседних карточек
      if (el.classList.contains('card') || el.classList.contains('g')) el.style.transitionDelay = ((i % 3) * 0.09) + 's';
      io.observe(el);
    });
  } else { revs.forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- Particles ---------- */
  var pc = $('#particles');
  if (pc && !reduce) {
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i');
      p.style.left = (35 + Math.random() * 65) + '%';
      p.style.top = (20 + Math.random() * 70) + '%';
      p.style.animationDuration = (6 + Math.random() * 8) + 's';
      p.style.animationDelay = (-Math.random() * 10) + 's';
      p.style.opacity = '0';
      pc.appendChild(p);
    }
  }

  /* ---------- Magnetic buttons + card tilt (desktop only) ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    $$('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = 'border-color .4s, box-shadow .6s';
        c.style.transform = 'perspective(900px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 5) + 'deg) translateY(-4px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transition = ''; c.style.transform = ''; });
    });
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      if (reduce) return;
      var target = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var started = false;
      function fmt(v) { return v.toFixed(dec).replace('.', ','); }
      var obs = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting || started) return; started = true; obs.disconnect();
        var t0 = performance.now(), dur = 1600;
        (function step(t) {
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
          el.textContent = fmt(target * e);
          if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
        })(t0);
      }, { threshold: 0.6 });
      el.textContent = fmt(0); obs.observe(el);
    });
  }
  if (reduce) { /* значення вже у розмітці */ }

  /* ---------- Vehicle selector ---------- */
  var chosenVehicle = '';
  var opts = $$('.opt');
  function pickVehicle(btn) {
    opts.forEach(function (o) { o.setAttribute('aria-checked', String(o === btn)); });
    chosenVehicle = btn.getAttribute('data-vehicle');
    $('#selector-title').textContent = chosenVehicle;
    $('#selector-copy').textContent = btn.getAttribute('data-copy');
    $('#selector-idle').hidden = true;
    var done = $('#selector-done'); done.hidden = false;
    // перезапуск анімації
    $$('h3,p,.selector__actions', done).forEach(function (n) { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; });
    $$('.steps li').forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') <= 2); });
    $('#f-vehicle').value = chosenVehicle;
    track('vehicle_select', { vehicle: chosenVehicle });
  }
  opts.forEach(function (o) { o.addEventListener('click', function () { pickVehicle(o); }); });
  $('#selector-book').addEventListener('click', function () { $$('.steps li').forEach(function (li) { li.classList.add('is-on'); }); });

  // клик по услуге -> предвыбор в форме
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#f-service'), v = a.getAttribute('data-pick');
      $$('option', sel).forEach(function (o) { if (o.textContent === v) sel.value = v; });
    });
  });

  /* ---------- Carousel ---------- */
  var car = $('#carousel'), track_ = $('.carousel__track', car);
  $$('.round', car).forEach(function (b) {
    b.addEventListener('click', function () {
      var card = track_.firstElementChild;
      track_.scrollBy({ left: +b.getAttribute('data-dir') * (card.offsetWidth + 18), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  track_.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { track_.scrollBy({ left: 300, behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { track_.scrollBy({ left: -300, behavior: 'smooth' }); }
  });

  /* ---------- Lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  var tiles = $$('[data-lb]'), cur = 0;
  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    var img = $('img', tiles[cur]);
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbCap.textContent = $('span', tiles[cur]).textContent + ' · майстерня «Паскаль»';
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  }
  tiles.forEach(function (t, i) { t.addEventListener('click', function () { show(i); lb.showModal(); document.body.style.overflow = 'hidden'; }); });
  $('.lightbox__close', lb).addEventListener('click', function () { lb.close(); });
  $('.lightbox__nav--prev', lb).addEventListener('click', function () { show(cur - 1); });
  $('.lightbox__nav--next', lb).addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('close', function () { document.body.style.overflow = ''; });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });

  /* ---------- Booking form ---------- */
  var form = $('#booking-form'), done = $('#booking-done');
  function normPhone(raw) {
    var d = String(raw).replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('380') === 0) return '+' + d;
    if (d.length === 11 && d.indexOf('80') === 0) return '+3' + d;
    if (d.length === 10 && d[0] === '0') return '+38' + d;
    return null;
  }
  function setErr(name, msg) {
    var f = form.elements[name].closest('.field');
    f.classList.toggle('is-bad', !!msg);
    $('[data-err="' + name + '"]', f).textContent = msg || '';
  }
  ['name', 'phone'].forEach(function (n) { form.elements[n].addEventListener('input', function () { setErr(n, ''); }); });

  function actionLink(href, label, cls, trackName, extra) {
    var a = document.createElement('a');
    a.href = href; a.textContent = label; a.className = 'btn ' + cls;
    if (/^https/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', function () { track(trackName, extra || {}); });
    return a;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim(), phone = normPhone(form.elements.phone.value);
    var bad = false;
    if (name.length < 2) { setErr('name', 'Вкажіть, будь ласка, ім\'я'); bad = true; }
    if (!phone) { setErr('phone', 'Введіть номер у форматі +380 XX XXX XXXX'); bad = true; }
    if (bad) { var first = $('.is-bad input', form); if (first) first.focus(); return; }

    var car = form.elements.car.value.trim(), svc = form.elements.service.value, veh = form.elements.vehicle.value;
    var lines = ['Доброго дня! Хочу записатися на шиномонтаж (Pascal Tire Studio).', 'Ім\'я: ' + name, 'Телефон: ' + phone];
    if (veh) lines.push('Тип авто: ' + veh);
    if (car) lines.push('Авто: ' + car);
    if (svc) lines.push('Послуга: ' + svc);
    lines.push('Прошу уточнити послугу, вартість та зручний час.');
    var msg = lines.join('\n');
    $('#done-msg').textContent = msg;
    track('form_submit', { service: svc || 'n/a' });

    var box = $('#done-actions'); box.textContent = '';
    var title = $('#done-title'), text = $('#done-text');

    function showActions() {
      box.appendChild(actionLink('tel:' + (CFG.phone || '+380949969577'), 'Зателефонувати ' + (CFG.phoneDisplay || ''), 'btn--accent btn--block', 'phone_click', { location: 'booking_done' }));
      if (CFG.telegram) box.appendChild(actionLink('https://t.me/' + CFG.telegram + '?text=' + encodeURIComponent(msg), 'Написати в Telegram', 'btn--ghost btn--block', 'messenger_click', { app: 'telegram' }));
      if (CFG.viber) box.appendChild(actionLink('viber://chat?number=' + encodeURIComponent(CFG.viber) + '&draft=' + encodeURIComponent(msg), 'Написати у Viber', 'btn--ghost btn--block', 'messenger_click', { app: 'viber' }));
      var sms = actionLink('sms:' + (CFG.phone || '+380949969577') + '?&body=' + encodeURIComponent(msg), 'Надіслати SMS із заявкою', 'btn--ghost btn--block', 'messenger_click', { app: 'sms' });
      box.appendChild(sms);
      var copy = document.createElement('button'); copy.type = 'button'; copy.className = 'btn btn--ghost btn--block'; copy.textContent = 'Скопіювати текст заявки';
      copy.addEventListener('click', function () {
        var ok = function () { copy.textContent = 'Скопійовано ✓'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(ok, function () { selectMsg(); });
        else selectMsg();
      });
      box.appendChild(copy);
    }
    function selectMsg() { var r = document.createRange(); r.selectNodeContents($('#done-msg')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    function swap() { form.hidden = true; done.hidden = false; done.focus(); done.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); }

    if (CFG.formEndpoint) {
      var btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Надсилаємо…';
      fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ name: name, phone: phone, car: car, service: svc, vehicle: veh, message: msg }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); title.textContent = 'Заявку надіслано'; text.textContent = 'Дякуємо! Майстер зв\'яжеться з вами найближчим часом. Можна також зателефонувати:'; })
        .catch(function () { title.textContent = 'Не вдалося надіслати'; text.textContent = 'Заявку не надіслано. Зателефонуйте або скористайтеся іншим способом:'; })
        .finally(function () { btn.disabled = false; btn.textContent = 'Записатися зараз'; showActions(); swap(); });
    } else {
      title.textContent = 'Заявку підготовлено';
      text.textContent = 'Вона ще не надіслана майстру. Оберіть зручний спосіб зв\'язку — текст уже готовий:';
      showActions(); swap();
    }
  });
  $('#done-back').addEventListener('click', function () { done.hidden = true; form.hidden = false; form.elements.name.focus(); });

  $('#year').textContent = new Date().getFullYear();
})();
