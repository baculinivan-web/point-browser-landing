const hero = document.querySelector('.hero');
const stickyDownload = document.querySelector('.download-button--sticky');
const features = [...document.querySelectorAll('.feature')];
const latestReleaseUrl = 'https://github.com/baculinivan-web/Point/releases/latest';
const latestReleaseApiUrl = 'https://api.github.com/repos/baculinivan-web/Point/releases/latest';
const downloadLinks = [...document.querySelectorAll('.download-button')];

if (hero) {
  window.setTimeout(() => {
    hero.classList.add('is-expanded');
  }, 1000);
}

downloadLinks.forEach((link) => {
  let releaseRequestPending = false;

  link.addEventListener('click', async (event) => {
    if (releaseRequestPending) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    releaseRequestPending = true;
    link.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(latestReleaseApiUrl, {
        headers: { Accept: 'application/vnd.github+json' },
      });

      if (!response.ok) throw new Error(`GitHub release request failed: ${response.status}`);

      const release = await response.json();
      const macAsset = release.assets?.find((asset) => {
        const name = asset.name?.toLowerCase() ?? '';
        return name.endsWith('.zip') && /(mac|macos|osx|darwin)/.test(name);
      }) ?? release.assets?.find((asset) => asset.name?.toLowerCase().endsWith('.zip'));

      window.location.assign(macAsset?.browser_download_url ?? release.html_url ?? latestReleaseUrl);
    } catch {
      window.location.assign(latestReleaseUrl);
    }
  });
});

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
