/**
 * PRAVIN KUMAR — ARTIST PORTFOLIO INTERACTIONS (js/main.js)
 * Lightweight Vanilla JavaScript module for gallery filtering,
 * accessible lightbox keyboard controls, contact form validation,
 * and dynamic copyright year.
 */

(function () {
  'use strict';

  // 1. Dynamic Footer Copyright Year
  const yearElements = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  yearElements.forEach((el) => {
    el.textContent = String(currentYear);
  });

  // 2. Smooth Scroll with Reduced Motion Check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    });
  });
})();
