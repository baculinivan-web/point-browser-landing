const hero = document.querySelector('.hero');
const stickyDownload = document.querySelector('.download-button--sticky');
const features = [...document.querySelectorAll('.feature')];

if (hero) {
  window.setTimeout(() => {
    hero.classList.add('is-expanded');
  }, 1000);
}

if (hero && stickyDownload) {
  let animationFrame = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const updateScrollEffects = () => {
    stickyDownload.classList.toggle('is-visible', window.scrollY >= hero.offsetHeight - 1);

    const viewportHeight = window.innerHeight;

    features.forEach((feature) => {
      const device = feature.querySelector('.feature-device');

      if (!device || reduceMotion.matches) {
        device?.style.setProperty('--device-shift', '0%');
        return;
      }

      const rect = feature.getBoundingClientRect();
      const rawProgress = (viewportHeight - rect.top) / (viewportHeight * 0.72);
      const progress = Math.min(1, Math.max(0, rawProgress));
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const direction = feature.classList.contains('feature--fast') ? -1 : 1;
      const shift = direction * (1 - easedProgress) * 78;

      device.style.setProperty('--device-shift', `${shift.toFixed(3)}%`);
    });

    animationFrame = 0;
  };

  const requestScrollEffects = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(updateScrollEffects);
    }
  };

  updateScrollEffects();
  window.addEventListener('scroll', requestScrollEffects, { passive: true });
  window.addEventListener('resize', requestScrollEffects);
  reduceMotion.addEventListener('change', requestScrollEffects);
}
