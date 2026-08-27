/* ======================================================================
   Ellen Presents — shared behaviour
   Loaded by every page. No dependencies, no build step.
   ====================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------ Mobile nav */
  var menu = document.getElementById('nav-menu');
  var toggle = document.querySelector('.nav-toggle');

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) closeMenu();
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

  var REQ = {
    name: 'your name',
    email: 'your email',
    eventType: 'an event type',
    message: 'a little about the event'
  };

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
    var body = [
      'Name: ' + value('name'),
      'Company: ' + (value('company') || '—'),
      'Email: ' + value('email'),
      'Event type: ' + value('eventType'),
      'Location: ' + (value('location') || '—'),
      'Date: ' + (value('date') || '—'),
      'Estimated guests: ' + (value('guests') || '—'),
      'Help needed with: ' + (scope.length ? scope.join(', ') : '—'),
      '',
      'About the event:',
      value('message')
    ].join('\n');

    return 'mailto:' + ENQUIRY_ADDRESS +
      '?subject=' + encodeURIComponent('Event enquiry — ' + value('name')) +
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
      if (slot) slot.textContent = bad ? 'Please add ' + REQ[id] + '.' : '';
      if (bad && !first) first = el;
    });

    if (first) {
      status.textContent = 'Please complete the highlighted fields.';
      status.classList.add('is-error');
      status.hidden = false;
      first.focus();
      return;
    }

    status.classList.remove('is-error');
    status.textContent = 'Opening your email app with these details ready to send. ' +
      'If nothing opens, email ' + ENQUIRY_ADDRESS + ' directly and we will reply ' +
      'within one business day.';
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
