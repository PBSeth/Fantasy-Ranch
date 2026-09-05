// Simple career schedule-luck awards for the Wall of Fame.
// Rank eligible managers only by career points allowed per game.
(function () {
  const MIN_GAMES = 22;

  function careerPaRows() {
    return allManagers().map(m => {
      let games=0, pa=0;
      (m.seasons || []).forEach(s => {
        const r=parseSeasonRecord(s.record);
        if (!r || !r.games || s.pa == null) return;
        games += r.games;
        pa += Number(s.pa);
      });
      if (games < MIN_GAMES) return null;
      return { m, games, paGame: pa/games };
    }).filter(Boolean);
  }

  function paCard(label,row) {
    return highCard(
      label,
      `${fmt1.format(row.paGame)} PA/G`,
      compactManagerName(row.m),
      `${row.games} career regular-season games`
    );
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const rows=careerPaRows();
    if (!rows.length) return;
    const luckiest=[...rows].sort((a,b)=>a.paGame-b.paGame)[0];
    const unluckiest=[...rows].sort((a,b)=>b.paGame-a.paGame)[0];
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    grid.insertAdjacentHTML('beforeend', paCard('Luckiest Manager · 22+ games',luckiest));
    grid.insertAdjacentHTML('beforeend', paCard('Unluckiest Manager · 22+ games',unluckiest));
  };
})();
