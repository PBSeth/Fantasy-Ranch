// Remove redundant winning/losing season rate awards from the Wall of Fame.
// Underlying league history and calculations remain untouched.
(function () {
  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    grid.querySelectorAll('.wall-high-card').forEach(card=>{
      const label=card.querySelector('.wall-high-label')?.textContent.trim() || '';
      if (/^(Highest|Lowest) (Winning|Losing) Season Rate\b/i.test(label)) card.remove();
    });
  };
})();
