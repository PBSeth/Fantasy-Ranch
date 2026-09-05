// Keep the three-season eligibility rule in the calculations, but simplify the public labels.
(function () {
  function cleanWinningSeasonRateLabels() {
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    grid.querySelectorAll('.wall-high-label').forEach(label=>{
      const text=label.textContent.trim();
      if (text.startsWith('Highest Winning Season Rate')) label.textContent='Highest Winning Season Rate';
      if (text.startsWith('Lowest Winning Season Rate')) label.textContent='Lowest Winning Season Rate';
    });
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    cleanWinningSeasonRateLabels();
  };
})();
