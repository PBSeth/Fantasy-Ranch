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
    const entries=record.leaders.map(x=>{
      const m=managerFromLabel(x.manager);
      const name=m ? compactManagerName(m) : x.manager;
      return `<div class="wall-streak-entry"><div class="wall-high-name">${name}</div><div class="wall-high-detail">${spanText(x)}</div></div>`;
    }).join('<div class="wall-streak-separator">/</div>');
    return `<div class="wall-high-card">
      <div class="wall-high-label">${title}</div>
      <div class="wall-high-value">${record.count}</div>
      <div class="wall-streak-entries">${entries}</div>
    </div>`;
  }

  const style=document.createElement('style');
  style.textContent=`.wall-streak-entries{display:flex;flex-direction:column;align-items:center;gap:5px;margin-top:18px;text-align:center}.wall-streak-entry{display:flex;flex-direction:column;align-items:center;gap:1px}.wall-streak-entry .wall-high-name,.wall-streak-entry .wall-high-detail{margin:0;line-height:1.15}.wall-streak-separator{font-size:13px;color:#999;line-height:1.1}`;
  document.head.appendChild(style);

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
