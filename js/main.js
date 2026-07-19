(() => {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  const CONFIG = {
    DESKTOP_BREAKPOINT: 900,
    FADE_MS: 180,
    RESIZE_DEBOUNCE: 150,
  };

  // ========================================
  // STATE
  // ========================================
  const state = {
    activeFilter: 'all',
    isNavOpen: false,
    isFilterAnimating: false,
  };

  // ========================================
  // DOM CACHE
  // ========================================
  const DOM = {
    toggle: document.querySelector('.menu-toggle'),
    nav: document.querySelector('#nav-links'),
    year: document.querySelector('#year'),
    filterButtons: document.querySelectorAll('.menu-filter'),
    foodCards: document.querySelectorAll('#menu-grid .food-card'),
    menuEmpty: document.getElementById('menu-empty'),
  };

  // ========================================
  // NAVIGATION
  // ========================================
  function openNav() {
    DOM.nav?.classList.add('open');
    DOM.toggle?.setAttribute('aria-expanded', 'true');
    state.isNavOpen = true;
  }

  function closeNav() {
    DOM.nav?.classList.remove('open');
    DOM.toggle?.setAttribute('aria-expanded', 'false');
    state.isNavOpen = false;
  }

  function toggleNav() {
    state.isNavOpen ? closeNav() : openNav();
  }

  function setupNavigation() {
    // Toggle button
    DOM.toggle?.addEventListener('click', toggleNav);

    // Close on link click (event delegation)
    DOM.nav?.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeNav();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!state.isNavOpen) return;
      const isInsideNav = DOM.nav?.contains(e.target);
      const isToggle = DOM.toggle?.contains(e.target);
      if (!isInsideNav && !isToggle) closeNav();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isNavOpen) {
        closeNav();
        DOM.toggle?.focus();
      }
    });

    // Close on resize to desktop (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > CONFIG.DESKTOP_BREAKPOINT) closeNav();
      }, CONFIG.RESIZE_DEBOUNCE);
    });
  }

  // ========================================
  // FOOTER
  // ========================================
  function updateFooterYear() {
    if (DOM.year) {
      DOM.year.textContent = new Date().getFullYear();
    }
  }

  // ========================================
  // MENU FILTERS
  // ========================================
  function setActiveButton(activeBtn) {
    DOM.filterButtons.forEach((btn) => {
      const isActive = btn === activeBtn;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });
  }

  function showCard(card) {
    if (card.hidden) {
      card.hidden = false;
      card.style.opacity = '0';
      card.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        card.style.transition = `opacity ${CONFIG.FADE_MS}ms ease, transform ${CONFIG.FADE_MS}ms ease`;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  }

  function hideCard(card) {
    card.style.transition = `opacity ${CONFIG.FADE_MS}ms ease, transform ${CONFIG.FADE_MS}ms ease`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(6px)';
    return card;
  }

  function applyFilter(filter) {
    if (state.isFilterAnimating) return;
    state.isFilterAnimating = true;

    const cardsToHide = [];
    let visibleCount = 0;

    DOM.foodCards.forEach((card) => {
      const match = filter === 'all' || card.dataset.category === filter;

      if (match) {
        visibleCount++;
        showCard(card);
      } else if (!card.hidden) {
        cardsToHide.push(hideCard(card));
      }
    });

    // Batch hide after animation completes
    if (cardsToHide.length > 0) {
      setTimeout(() => {
        cardsToHide.forEach(card => {
          if (card.style.opacity === '0') card.hidden = true;
        });
        state.isFilterAnimating = false;
      }, CONFIG.FADE_MS);
    } else {
      state.isFilterAnimating = false;
    }

    // Update empty state
    if (DOM.menuEmpty) {
      DOM.menuEmpty.hidden = visibleCount > 0;
    }
  }

  function navigateFilter(currentIndex, direction) {
    const maxIndex = DOM.filterButtons.length - 1;
    let targetIndex;

    if (direction === 'right' || direction === 'down') {
      targetIndex = (currentIndex + 1) % DOM.filterButtons.length;
    } else if (direction === 'left' || direction === 'up') {
      targetIndex = (currentIndex - 1 + DOM.filterButtons.length) % DOM.filterButtons.length;
    } else if (direction === 'home') {
      targetIndex = 0;
    } else if (direction === 'end') {
      targetIndex = maxIndex;
    }

    return targetIndex;
  }

  function setupFilters() {
    DOM.filterButtons.forEach((btn, index) => {
      // Click handler
      btn.addEventListener('click', () => {
        setActiveButton(btn);
        applyFilter(btn.dataset.filter);
        state.activeFilter = btn.dataset.filter;
      });

      // Keyboard navigation (roving tabindex)
      btn.addEventListener('keydown', (e) => {
        const directions = {
          ArrowRight: 'right',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowUp: 'up',
          Home: 'home',
          End: 'end',
        };

        const direction = directions[e.key];
        if (!direction) return;

        e.preventDefault();
        const targetIndex = navigateFilter(index, direction);
        if (targetIndex === undefined) return;

        const targetBtn = DOM.filterButtons[targetIndex];
        targetBtn.focus();
        setActiveButton(targetBtn);
        applyFilter(targetBtn.dataset.filter);
        state.activeFilter = targetBtn.dataset.filter;
      });
    });
  }

  // ========================================
  // SMOOTH SCROLL
  // ========================================
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ========================================
  // INITIALIZE
  // ========================================
  function init() {
    setupNavigation();
    updateFooterYear();
    setupFilters();
    setupSmoothScroll();

    // Initial filter state
    const initialBtn = document.querySelector('.menu-filter.is-active');
    if (initialBtn) {
      applyFilter(initialBtn.dataset.filter);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();