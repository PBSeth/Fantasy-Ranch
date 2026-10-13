(function () {
  const records = [
    { title:'Highest Scoring Game', score:'198.5', manager:'Payton', opponent:'Diddles', detail:'2016 Week 3' },
    { title:'Lowest Scoring Game', score:'13.24', manager:'Ty/Molly', opponent:'Kevin', detail:'2026 Week 5' }
  ];

  function gameCard(row) {
    const manager=managerFromLabel(row.manager);
    const opponent=managerFromLabel(row.opponent);
    return `<div class="wall-high-card">
      <div class="wall-high-label">${row.title}</div>
      <div class="wall-high-value">${row.score}</div>
      <div class="wall-high-name">${manager ? compactManagerName(manager) : row.manager}</div>
      <div class="wall-high-detail">${row.detail} • vs ${opponent ? compactManagerName(opponent) : row.opponent}</div>
    </div>`;
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    records.forEach(row=>grid.insertAdjacentHTML('beforeend',gameCard(row)));
  };
})();
