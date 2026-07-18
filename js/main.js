(() => {
  /* ---------------- Mobile nav ---------------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav-links');
  const DESKTOP_BREAKPOINT = 900;

  function openNav() {
    nav.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeNav() : openNav();
  });

  // Close after choosing a link
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav?.classList.contains('open')) return;
    const clickedInsideNav = nav.contains(e.target);
    const clickedToggle = toggle?.contains(e.target);
    if (!clickedInsideNav && !clickedToggle) closeNav();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) {
      closeNav();
      toggle?.focus();
    }
  });

  // Close automatically if the viewport grows back to desktop size
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > DESKTOP_BREAKPOINT) closeNav();
    }, 150);
  });

  /* ---------------- Footer year ---------------- */
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Menu category filters ---------------- */
  const filterButtons = Array.from(document.querySelectorAll('.menu-filter'));
  const foodCards = Array.from(document.querySelectorAll('#menu-grid .food-card'));
  const menuEmpty = document.getElementById('menu-empty');
  const FADE_MS = 180;

  function setActiveButton(activeBtn) {
    filterButtons.forEach((b) => {
      const isActive = b === activeBtn;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-selected', String(isActive));
      b.tabIndex = isActive ? 0 : -1;
    });
  }

  function applyFilter(filter) {
    let visibleCount = 0;
    foodCards.forEach((card) => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) visibleCount += 1;

      if (match && card.hidden) {
        // Show: unhide immediately, then fade in on the next frame
        card.hidden = false;
        card.style.opacity = '0';
        card.style.transform = 'translateY(6px)';
        requestAnimationFrame(() => {
          card.style.transition = `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`;
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else if (!match && !card.hidden) {
        // Hide: fade out, then remove from layout
        card.style.transition = `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`;
        card.style.opacity = '0';
        card.style.transform = 'translateY(6px)';
        window.setTimeout(() => {
          if (card.style.opacity === '0') card.hidden = true;
        }, FADE_MS);
      }
    });

    if (menuEmpty) menuEmpty.hidden = visibleCount !== 0;
  }

  filterButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      setActiveButton(btn);
      applyFilter(btn.dataset.filter);
    });

    // Roving-tabindex keyboard support for the tablist pattern
    btn.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = (index + 1) % filterButtons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = (index - 1 + filterButtons.length) % filterButtons.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = filterButtons.length - 1;
      }
      if (targetIndex !== null) {
        e.preventDefault();
        const targetBtn = filterButtons[targetIndex];
        targetBtn.focus();
        setActiveButton(targetBtn);
        applyFilter(targetBtn.dataset.filter);
      }
    });
  });
})();