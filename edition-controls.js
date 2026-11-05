const menu = document.querySelector('.edition-menu');
if (menu) {
  const summary = menu.querySelector('summary');
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) menu.open = false;
  });
  document.addEventListener('pointerdown', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    summary.focus();
  });
}

export function animateEdition(host, stage, toggle, renderer, edition, reduced) {
  const opening = host.closest('.edition-opening');
  const works = document.querySelector('#works');
  let running = !reduced.matches;
  let inView = true;
  let frame = 0;
  let last = 0;
  let time = 0;
  let dirty = true;
  let contextLost = false;
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  function draw() {
    const scroll = Math.max(0, -opening.getBoundingClientRect().top);
    const height = host.clientHeight;
    const progress = reduced.matches ? 0 : Math.max(0, Math.min(1, scroll / height - 0.5));
    smooth.x += (pointer.x - smooth.x) * 0.09;
    smooth.y += (pointer.y - smooth.y) * 0.09;
    const gap = edition.draw(progress, time, smooth);
    if (gap === 0 && stage.dataset.figures !== 'touching') stage.dataset.figures = 'touching';
    stage.dataset.frame = String(++frame);
    stage.dataset.progress = String(progress);
    host.dataset.editionPhase = progress > 0.002 ? 'chapter' : 'opening';
    host.style.setProperty('--chapter-opacity', Math.min(1, progress * 2.6));
    host.style.setProperty('--chapter-offset', `${(1 - progress) * height * 0.63}px`);
    dirty = false;
  }

  function resize() {
    if (contextLost) return;
    edition.resize(host.clientWidth, host.clientHeight);
    dirty = true;
  }

  function setRunning(value) {
    running = value;
    toggle.setAttribute('aria-pressed', String(!value));
    toggle.setAttribute('aria-label', value ? '暂停封面动效' : '播放封面动效');
    toggle.textContent = value ? 'Ⅱ' : '▶';
    if (!value) pointer.x = pointer.y = 0;
    dirty = true;
  }

  toggle.addEventListener('click', () => setRunning(!running));
  reduced.addEventListener('change', () => {
    toggle.hidden = reduced.matches;
    setRunning(!reduced.matches);
  });
  host.addEventListener('pointermove', event => {
    if (!running || event.pointerType !== 'mouse') return;
    const rect = host.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
    pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
  }, { passive: true });
  host.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  window.addEventListener('scroll', () => { dirty = true; }, { passive: true });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    dirty = true;
    last = 0;
  }).observe(host);
  new ResizeObserver(resize).observe(host);
  document.addEventListener('visibilitychange', () => { last = 0; dirty = true; });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    opening.classList.remove('motion-ready');
    host.classList.remove('motion-ready');
    host.dataset.editionPhase = 'opening';
    toggle.hidden = true;
    inView = false;
  });

  // Align a direct Works link with the actual section after the sticky scene expands.
  const openedAtWorks = location.hash === '#works';
  resize();
  opening.classList.add('motion-ready');
  if (openedAtWorks && works) works.scrollIntoView({ behavior: 'instant' });
  draw();
  host.classList.add('motion-ready');
  toggle.hidden = reduced.matches;
  setRunning(running);

  function loop(now) {
    if (contextLost) return;
    if (inView && !document.hidden) {
      if (running && last) time += Math.min((now - last) / 1000, 0.1);
      if (dirty || running) draw();
    }
    last = now;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
