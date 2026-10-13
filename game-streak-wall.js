// Regular-season winning/losing streak records derived from the canonical H2H ledger.
(function () {
  function spanText(run) {
    const a=run.start, b=run.end;
    if (!a || !b) return '';
    if (a.season===b.season) return `${a.season} W${a.week}–W${b.week}`;
    return `${a.season} W${a.week}–${b.season} W${b.week}`;
  }

  function streakCard(title,record) {
    if (!record?.leaders?.length) return '';
    const names=record.leaders.map(x=>{
      const m=managerFromLabel(x.manager);
      return m ? compactManagerName(m) : x.manager;
    }).join(' / ');
    const details=record.leaders.map(spanText).join(' / ');
    return `<div class="wall-high-card">
      <div class="wall-high-label">${title}</div>
      <div class="wall-high-value">${record.count}</div>
      <div class="wall-high-name">${names}</div>
      <div class="wall-high-detail">${details}</div>
    </div>`;
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const grid=document.querySelector('.highlights-grid');
    const records=DATA.h2hLedger?.records;
    if (!grid || !records) return;
    grid.insertAdjacentHTML('beforeend', streakCard('Longest Winning Streak',records.longestWinningStreak));
    grid.insertAdjacentHTML('beforeend', streakCard('Longest Losing Streak',records.longestLosingStreak));
  };
})();
