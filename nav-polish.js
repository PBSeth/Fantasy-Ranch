(() => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  const sync = () => {
    const open = nav.classList.contains('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.textContent = open ? '×' : '☰';
  };

  const syncPageCopy = () => {
    document.querySelectorAll('.simple-page-title').forEach(title => {
      if (title.textContent.trim() === 'Ranch Hands') title.textContent = 'Managers';
    });
  };

  toggle.setAttribute('aria-controls', 'mainNav');
  sync();
  syncPageCopy();

  toggle.addEventListener('click', () => requestAnimationFrame(sync));
  nav.addEventListener('click', () => requestAnimationFrame(sync));

  const pageObserver = new MutationObserver(syncPageCopy);
  const app = document.getElementById('app');
  if (app) pageObserver.observe(app, { childList: true, subtree: true });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    nav.classList.remove('open');
    sync();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
    nav.classList.remove('open');
    sync();
    toggle.focus();
  });
})();
