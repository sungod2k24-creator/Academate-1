/* script.js - safer version with guards and DOMContentLoaded
   Replace your existing script.js fully with this file.
*/

document.addEventListener('DOMContentLoaded', () => {
  // small helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel || ''));

  // THEME: restore saved preference and wire toggle
  function applySavedTheme() {
    try {
      const saved = localStorage.getItem('academate_theme'); // 'light' or 'dark'
      if (saved === 'light') document.body.classList.add('light-theme');
      else document.body.classList.remove('light-theme');

      const t = $('#themeToggle');
      if (t) t.textContent = document.body.classList.contains('light-theme') ? '☀' : '🌙';
    } catch (err) {
      console.warn('Theme restore failed', err);
    }
  }
  applySavedTheme();

  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('academate_theme', isLight ? 'light' : 'dark');
      themeToggle.textContent = isLight ? '☀' : '🌙';
    });
  }

  // COLLEGES: clicking a card button will navigate to login.html with query params for prefill
  try {
    const collegeCards = $$('.college-card');
    if (collegeCards.length) {
      collegeCards.forEach(card => {
        const nameEl = card.querySelector('.college-name');
        const collegeName = card.dataset.college || (nameEl && nameEl.innerText) || 'Unknown College';
        const facultyBtn = card.querySelector('.login-role.faculty');
        const studentBtn = card.querySelector('.login-role.student');

        function highlight() {
          collegeCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        }

        const openLoginPage = (role) => {
          highlight();
          const params = new URLSearchParams();
          params.set('role', role);
          params.set('college', collegeName);
          // debug
          console.debug('Navigating to login with', { role, collegeName });
          // must use a string — backticks for template literal
          window.location.href = `login.html?${params.toString()}`;
        };

        if (facultyBtn) facultyBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginPage('faculty'); });
        if (studentBtn) studentBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginPage('student'); });
      });
    } else {
      console.debug('No college cards found on this page.');
    }
  } catch (err) {
    console.error('Error wiring college cards', err);
  }

  // TESTIMONIALS: rotate & dots
  const testimonials = [
    { text: "Academate helped me keep all my certificates and internships in one verified place — recruiters loved my portfolio during placements.", who: "Satyam Singh", role: "Student" },
    { text: "Submitting conference and workshop records is so easy now. Faculty approvals were instant.", who: "Suryanshu Sinha", role: "Student" },
    { text: "The auto-generated portfolio PDF saved me hours while applying for internships — clean and professional.", who: "Nayandeep Prakash", role: "Student" },
    { text: "Mentors can approve submissions quickly — Academate made mentoring and verification painless.", who: "Shafaque Aziz", role: "Faculty" },
    { text: "The analytics dashboard made NAAC reporting effortless for our college.", who: "Rajesh Kumar", role: "Faculty" }
  ];

  const quoteEl = $('#testimonialCard .quote');
  const whoEl = $('#testimonialCard .who');
  const dotsContainer = $('#dots'); // can be null
  const nextBtn = $('#nextTest');
  let idx = 0;
  let testimonialInterval = null;

  function renderTest(i = 0) {
    // If any required elements are missing, bail out gracefully.
    if (!quoteEl || !whoEl) {
      console.debug('Testimonial elements not present on this page.');
      return;
    }

    // If dotsContainer is missing, create one dynamically next to the testimonial area
    let dotsEl = dotsContainer;
    if (!dotsEl) {
      dotsEl = document.createElement('div');
      dotsEl.id = 'dots';
      const leftControls = document.querySelector('.test-controls .left-controls');
      if (leftControls) leftControls.appendChild(dotsEl);
      else document.body.appendChild(dotsEl); // fallback: append to body
      console.debug('Created fallback #dots element because it was missing in DOM.');
    }

    const t = testimonials[i];
    // use normal quotes / template literals
    quoteEl.textContent = `“${t.text}”`;
    whoEl.innerHTML =`<strong>${t.who}</strong> • ${t.role}`;

    // rebuild dots
    dotsEl.innerHTML = '';
    testimonials.forEach((_, j) => {
      const d = document.createElement('div');
      d.className = 'dot' + (j === i ? ' active' : '');
      d.addEventListener('click', () => { idx = j; renderTest(idx); resetTestInterval(); });
      dotsEl.appendChild(d);
    });
  }

  function resetTestInterval() {
    if (testimonialInterval) clearInterval(testimonialInterval);
    testimonialInterval = setInterval(()=> { idx = (idx+1) % testimonials.length; renderTest(idx); }, 7000);
  }

  // initialise testimonials if the container exists
  if (document.getElementById('testimonialCard')) {
    try {
      renderTest(idx);
      if (nextBtn) nextBtn.addEventListener('click', ()=> { idx = (idx+1) % testimonials.length; renderTest(idx); resetTestInterval(); });
      resetTestInterval();
    } catch (err) {
      console.error('Error initializing testimonials', err);
    }
  } else {
    console.debug('testimonialCard element not found — skipping testimonial init.');
  }

  // Explore button scroll
  const exploreBtn = document.getElementById('exploreBtn');
  exploreBtn && exploreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('collegesPanel');
    if (target) target.scrollIntoView({ behavior:'smooth', block:'center' });
  });

  // Demo button (index page)
  const demoBtn = document.getElementById('demoBtn');
  demoBtn && demoBtn.addEventListener('click', ()=> alert('Demo: use "Login" to open sign in page'));

  // ----- LOGIN PAGE: prefill fields from URL and wire submit -----
  try {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      const params = new URLSearchParams(window.location.search);
      const role = params.get('role');
      const college = params.get('college');

      const roleEl = document.getElementById('role');
      const collegeEl = document.getElementById('college');
      const userEl = document.getElementById('user');
      const passEl = document.getElementById('pass');
      const submit = document.getElementById('submitLogin');

      if (role && roleEl) {
        const safe = ['student','faculty','admin'].includes(role.toLowerCase()) ? role.toLowerCase() : role;
        try { roleEl.value = safe; } catch(e){ console.warn('Unable to set role value', e); }
      }
      if (college && collegeEl) {
        try { collegeEl.value = decodeURIComponent(college); } catch(e){ collegeEl.value = college; }
      }

      const modalCard = document.querySelector('.modal-card');
      modalCard && modalCard.classList.add('appear');
      setTimeout(()=> { userEl && userEl.focus(); }, 220);

      submit && submit.addEventListener('click', (e) => {
        e.preventDefault();
        const r = roleEl ? roleEl.value : '(role)';
        const c = collegeEl ? collegeEl.value : '(college)';
        const u = userEl && userEl.value ? userEl.value : '(no id)';
        alert(`Demo sign in\nRole: ${r}\nCollege: ${c}\nUser: ${u}`);
      });
    } else {
      console.debug('LoginForm not present on this page — skipping login prefill.');
    }
  } catch (err) {
    console.error('Login prefill failed', err);
  }

}); // DOMContentLoaded end
