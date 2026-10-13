(function () {
  function scoringRecords() {
    const high=DATA.scoringRecords?.records?.highestScore;
    const low=DATA.scoringRecords?.records?.lowestScore;
    return [
      high && { title:'Highest Score', ...high },
      low && { title:'Lowest Score', ...low }
    ].filter(Boolean);
  }

  function gameCard(row) {
    const manager=managerFromLabel(row.manager);
    const opponent=managerFromLabel(row.opponent);
    const score=Number(row.score);
    const scoreText=Number.isFinite(score) ? String(score) : '—';
    return `<div class="wall-high-card">
      <div class="wall-high-label">${row.title}</div>
      <div class="wall-high-value">${scoreText}</div>
      <div class="wall-high-name">${manager ? compactManagerName(manager) : row.manager}</div>
      <div class="wall-high-detail">${row.season} Week ${row.week} • vs ${opponent ? compactManagerName(opponent) : row.opponent}</div>
    </div>`;
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    scoringRecords().forEach(row=>grid.insertAdjacentHTML('beforeend',gameCard(row)));
  };
})();
