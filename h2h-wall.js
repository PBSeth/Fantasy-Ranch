// Head-to-head rivalry awards for the Wall of Fame.
// Uses regular-season H2H only and requires at least 10 meetings.
(function () {
  const MIN_MEETINGS = 10;

  function rivalryRows() {
    const out=[];
    Object.entries(DATA.h2h?.records || {}).forEach(([manager,opponents]) => {
      Object.entries(opponents || {}).forEach(([opponent,r]) => {
        const games=Number(r.games || 0);
        if (games < MIN_MEETINGS) return;
        out.push({
          manager,
          opponent,
          wins:Number(r.w || 0),
          losses:Number(r.l || 0),
          ties:Number(r.t || 0),
          games
        });
      });
    });
    return out;
  }

  function rivalryCard(title,row) {
    const manager=managerFromLabel(row.manager);
    const opponent=managerFromLabel(row.opponent);
    const record=`${row.wins}-${row.losses}${row.ties ? `-${row.ties}` : ''}`;
    return `<div class="wall-high-card">
      <div class="wall-high-label wall-high-label-stacked"><span>${title}</span><small>(10 meeting min.)</small></div>
      <div class="wall-high-value">${row.wins} ${row.wins===1 ? 'win' : 'wins'}</div>
      <div class="wall-high-name">${manager ? compactManagerName(manager) : row.manager}</div>
      <div class="wall-high-detail">${record} vs ${opponent ? compactManagerName(opponent) : row.opponent} • ${row.games} meetings</div>
    </div>`;
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const rows=rivalryRows();
    if (!rows.length) return;

    const most=[...rows].sort((a,b)=>b.wins-a.wins || b.games-a.games || a.manager.localeCompare(b.manager))[0];
    const fewest=[...rows].sort((a,b)=>a.wins-b.wins || b.games-a.games || a.manager.localeCompare(b.manager))[0];

    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    grid.insertAdjacentHTML('beforeend', rivalryCard('Most Rivalry Wins',most));
    grid.insertAdjacentHTML('beforeend', rivalryCard('Fewest Rivalry Wins',fewest));
  };
})();
