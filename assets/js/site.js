/* ======================================================================
   Ellen Presents — shared behaviour
   Loaded by both language versions. No dependencies, no build step.
   ====================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ Text
     Both language versions load this file; strings follow <html lang>. */
  var ZH = document.documentElement.lang.slice(0, 2) === 'zh';

  var T = ZH ? {
    menu: '\u83dc\u5355',
    close: '\u5173\u95ed',
    need: {
      name: '\u59d3\u540d',
      email: '\u90ae\u7bb1',
      eventType: '\u6d3b\u52a8\u7c7b\u578b',
      message: '\u6d3b\u52a8\u7b80\u4ecb'
    },
    missing: function (what) { return '\u8bf7\u586b\u5199' + what + '\u3002'; },
    incomplete: '\u8bf7\u8865\u5168\u6807\u7ea2\u7684\u5b57\u6bb5\u3002',
    opening: function (addr) {
      return '\u6b63\u5728\u6253\u5f00\u90ae\u4ef6\u5ba2\u6237\u7aef\uff0c\u5185\u5bb9\u5df2\u7ecf\u586b\u597d\u3002\u5982\u679c\u6ca1\u6709\u53cd\u5e94\uff0c\u8bf7\u76f4\u63a5\u53d1\u90ae\u4ef6\u81f3 ' +
        addr + '\uff0c\u6211\u4eec\u4f1a\u5c3d\u5feb\u56de\u590d\u3002';
    },
    subject: '\u6d3b\u52a8\u54a8\u8be2 \u2014 ',
    field: {
      name: '\u59d3\u540d', company: '\u516c\u53f8', email: '\u90ae\u7bb1',
      eventType: '\u6d3b\u52a8\u7c7b\u578b', location: '\u6d3b\u52a8\u5730\u70b9',
      date: '\u6d3b\u52a8\u65e5\u671f', guests: '\u9884\u8ba1\u4eba\u6570',
      scope: '\u9700\u8981\u534f\u52a9\u7684\u90e8\u5206', message: '\u6d3b\u52a8\u7b80\u4ecb'
    }
  } : {
    menu: 'Menu',
    close: 'Close',
    need: {
      name: 'your name',
      email: 'your email',
      eventType: 'an event type',
      message: 'a little about the event'
    },
    missing: function (what) { return 'Please add ' + what + '.'; },
    incomplete: 'Please complete the highlighted fields.',
    opening: function (addr) {
      return 'Opening your email app with these details ready to send. ' +
        'If nothing opens, email ' + addr + ' directly and we will reply ' +
        'within one business day.';
    },
    subject: 'Event enquiry \u2014 ',
    field: {
      name: 'Name', company: 'Company', email: 'Email', eventType: 'Event type',
      location: 'Location', date: 'Date', guests: 'Estimated guests',
      scope: 'Help needed with', message: 'About the event'
    }
  };

  /* ------------------------------------------------------------ Mobile nav */
  var menu = document.getElementById('nav-menu');
  var toggle = document.querySelector('.nav-toggle');

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = T.menu;
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? T.close : T.menu;
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) closeMenu();
    });
    /* The nav scrolls rather than navigates, so nothing else would close the
       menu after a tap on a phone. */
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }

  /* --------------------------------------------------- Current section mark
     One page, so "which page am I on" becomes "which section is in view".
     Marks the nav link for whichever section covers the top of the viewport. */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.site-header a[href^="#"]')
  ).filter(function (a) {
    return a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'));
  });

  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      /* Sections can overlap the band during a scroll; the lower one is the
         one the reader has arrived at, so let the last match win. */
      var current = null;
      Object.keys(byId).forEach(function (id) {
        if (visible[id]) current = id;
      });
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-80px 0px -70% 0px' });

    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ------------------------------------------------------------ Footer year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------ Enquiry form
     The site is static, so there is no server to post to. Until a form
     backend is wired up (see README.md — "Wiring up the enquiry form"), a
     valid submission opens the visitor's mail client with everything they
     entered already composed, and the on-page status repeats the address so
     the enquiry is never silently lost if no mail client is configured. */
  var ENQUIRY_ADDRESS = 'hello@ellenpresents.com';

  var form = document.getElementById('enquiryForm');
  var status = document.getElementById('formStatus');
  if (!form || !status) return;

  var REQ = T.need;

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function checkedScope() {
    var picked = [];
    form.querySelectorAll('input[name="scope"]:checked').forEach(function (b) {
      picked.push(b.value);
    });
    return picked;
  }

  function compose() {
    var scope = checkedScope();
    var f = T.field;
    var dash = '\u2014';
    var body = [
      f.name + ': ' + value('name'),
      f.company + ': ' + (value('company') || dash),
      f.email + ': ' + value('email'),
      f.eventType + ': ' + value('eventType'),
      f.location + ': ' + (value('location') || dash),
      f.date + ': ' + (value('date') || dash),
      f.guests + ': ' + (value('guests') || dash),
      f.scope + ': ' + (scope.length ? scope.join(', ') : dash),
      '',
      f.message + ':',
      value('message')
    ].join('\n');

    return 'mailto:' + ENQUIRY_ADDRESS +
      '?subject=' + encodeURIComponent(T.subject + value('name')) +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var first = null;
    Object.keys(REQ).forEach(function (id) {
      var el = document.getElementById(id);
      var slot = document.querySelector('.field-error[data-for="' + id + '"]');
      var bad = !el || !el.value.trim();
      if (id === 'email' && el && el.value.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) bad = true;
      if (el) {
        if (bad) el.setAttribute('aria-invalid', 'true');
        else el.removeAttribute('aria-invalid');
      }
      if (slot) slot.textContent = bad ? T.missing(REQ[id]) : '';
      if (bad && !first) first = el;
    });

    if (first) {
      status.textContent = T.incomplete;
      status.classList.add('is-error');
      status.hidden = false;
      first.focus();
      return;
    }

    status.classList.remove('is-error');
    status.textContent = T.opening(ENQUIRY_ADDRESS);
    status.hidden = false;
    window.location.href = compose();
  });

  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      var slot = el.id && document.querySelector('.field-error[data-for="' + el.id + '"]');
      if (slot) slot.textContent = '';
      el.removeAttribute('aria-invalid');
    });
  });
})();
