(() => {
  'use strict';
  const page = document.querySelector('.presentation-page');
  if (!page) return;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const year = page.querySelector('[data-case-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const videos = new Set();
  const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
  }, { threshold: .05 }) : null;
  function prepareVideo(video) {
    if (videos.has(video)) return;
    videos.add(video);
    video.addEventListener('play', () => videos.forEach(other => { if (other !== video) other.pause(); }));
    videoObserver?.observe(video);
  }
  page.querySelectorAll('video[data-case-video]').forEach(prepareVideo);
  document.addEventListener('visibilitychange', () => { if (document.hidden) videos.forEach(video => video.pause()); });

  // Real image links remain usable without JavaScript or native dialog support.
  const dialog = page.querySelector('.presentation-lightbox');
  const dialogImage = dialog?.querySelector('img');
  const dialogCaption = page.querySelector('#presentation-lightbox-caption');
  const closeButton = dialog?.querySelector('[data-case-close]');
  let lastTrigger = null;
  if (dialogImage && dialogCaption && closeButton && typeof dialog.showModal === 'function') {
    page.querySelectorAll('[data-case-zoom]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const source = link.querySelector('img');
        if (!source) return;
        dialogImage.src = link.href;
        dialogImage.alt = source.alt;
        dialogImage.style.backgroundColor = link.dataset.caseBackground || 'transparent';
        dialogCaption.textContent = link.dataset.caption || '';
        try { dialog.showModal(); } catch { return; }
        event.preventDefault();
        lastTrigger = link;
        document.body.classList.add('presentation-dialog-open');
        closeButton.focus();
      });
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('presentation-dialog-open');
      if (lastTrigger?.isConnected) lastTrigger.focus();
    });
  }

  // Presentation copy reveals; customer art and photographs remain still.
  let revealObserver = null;
  function revealEverything() {
    revealObserver?.disconnect();
    page.classList.remove('presentation-observe');
    page.querySelectorAll('[data-case-reveal]').forEach(element => element.removeAttribute('data-case-reveal'));
  }
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    try {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-case-reveal', 'visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .1 });
      page.querySelectorAll('.presentation-section-head > div, .presentation-story-copy, .presentation-credits > div').forEach(element => {
        element.setAttribute('data-case-reveal', 'waiting');
        revealObserver.observe(element);
      });
      page.classList.add('presentation-observe');
    } catch { revealEverything(); }
  }
  motionPreference.addEventListener?.('change', event => {
    if (event.matches) revealEverything();
    videos.forEach(video => video.pause());
  });

  // Chapters work as ordinary anchors; current-location marking is optional.
  if ('IntersectionObserver' in window) {
    const links = [...page.querySelectorAll('.presentation-chapters a')];
    const sections = links.map(link => page.querySelector(link.hash)).filter(Boolean);
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      const current = sections.find(section => visible.has(section));
      if (!current) return;
      links.forEach(link => {
        if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-12% 0px -45% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  // Enable only after the real AE export exists and has been reviewed.
  page.querySelectorAll('[data-case-motion][data-motion-enabled="true"]').forEach(slot => {
    const poster = slot.querySelector('img');
    const sourcePath = slot.dataset.motionSrc;
    if (!poster || !sourcePath) return;
    const video = document.createElement('video');
    video.controls = false;
    video.playsInline = true;
    video.preload = 'metadata';
    video.width = 1600;
    video.height = 1200;
    video.id = 'presentation-logo-motion';
    video.poster = slot.dataset.motionPoster || poster.currentSrc || poster.src;
    video.setAttribute('aria-label', slot.dataset.motionLabel || 'Animación del proyecto');
    video.hidden = true;
    const source = document.createElement('source');
    source.src = sourcePath;
    source.type = 'video/mp4';
    video.append(source);
    const fallback = document.createElement('a');
    fallback.href = sourcePath;
    fallback.textContent = 'Abrir la animación';
    video.append(fallback);
    const controls = document.createElement('div');
    controls.className = 'presentation-motion-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Controles de la animación del logo');
    controls.hidden = true;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'presentation-motion-toggle';
    toggle.setAttribute('aria-controls', video.id);
    toggle.textContent = 'Ver animación';
    const status = document.createElement('span');
    status.className = 'presentation-motion-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    controls.append(toggle, status);
    let started = false;
    toggle.addEventListener('click', () => {
      if (!video.paused && !video.ended) { video.pause(); return; }
      if (video.ended) video.currentTime = 0;
      video.play().catch(() => { status.textContent = 'No se pudo iniciar la animación. Volvé a intentarlo.'; });
    });
    video.addEventListener('play', () => {
      started = true;
      toggle.textContent = 'Pausar';
      status.textContent = 'Reproduciendo animación.';
    });
    video.addEventListener('pause', () => {
      toggle.textContent = video.ended ? 'Volver a ver' : started ? 'Continuar' : 'Ver animación';
      if (!video.ended) status.textContent = started ? 'Animación en pausa.' : '';
    });
    video.addEventListener('ended', () => {
      toggle.textContent = 'Volver a ver';
      status.textContent = 'Animación finalizada.';
    });
    const showPoster = () => { poster.hidden = false; video.hidden = true; controls.hidden = true; delete slot.dataset.motionReady; };
    video.addEventListener('loadedmetadata', () => {
      poster.hidden = true; video.hidden = false; controls.hidden = false;
      slot.dataset.motionReady = 'true';
    }, { once: true });
    video.addEventListener('error', showPoster);
    source.addEventListener('error', showPoster);
    slot.append(video);
    slot.insertAdjacentElement('afterend', controls);
    prepareVideo(video);
  });
})();
