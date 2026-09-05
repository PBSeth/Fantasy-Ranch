// Career schedule-luck awards for the Wall of Fame.
// Rank eligible managers by points allowed per game relative to the league
// scoring environment in the exact seasons they played. Season differences
// are game-weighted across the manager's career.
(function () {
  const MIN_GAMES = 22;

  function careerLuckRows() {
    const managers=allManagers();
    const leagueByYear=new Map();

    managers.forEach(m => (m.seasons || []).forEach(s => {
      const r=parseSeasonRecord(s.record);
      if (!r || !r.games || s.pf == null) return;
      if (!leagueByYear.has(s.year)) leagueByYear.set(s.year,{points:0,games:0});
      const y=leagueByYear.get(s.year);
      y.points += Number(s.pf);
      y.games += r.games;
    }));

    return managers.map(m => {
      let games=0, weightedDiff=0, pa=0;
      (m.seasons || []).forEach(s => {
        const r=parseSeasonRecord(s.record);
        const league=leagueByYear.get(s.year);
        if (!r || !r.games || s.pa == null || !league?.games) return;
        const paGame=Number(s.pa)/r.games;
        const leaguePpg=league.points/league.games;
        games += r.games;
        pa += Number(s.pa);
        weightedDiff += (paGame-leaguePpg)*r.games;
      });
      if (games < MIN_GAMES) return null;
      return {
        m,
        games,
        paGame:pa/games,
        adjustedPaGame:weightedDiff/games
      };
    }).filter(Boolean);
  }

  function luckCard(label,row) {
    const sign=row.adjustedPaGame>0?'+':'';
    return `<div class="wall-high-card">
      <div class="wall-high-label wall-high-label-stacked"><span>${label}</span><small>(22 game min)</small></div>
      <div class="wall-high-value">${sign}${fmt1.format(row.adjustedPaGame)} PA/G</div>
      <div class="wall-high-name">${compactManagerName(row.m)}</div>
      <div class="wall-high-detail">${fmt1.format(row.paGame)} raw PA/G • ${row.games} career regular-season games</div>
    </div>`;
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const rows=careerLuckRows();
    if (!rows.length) return;
    const luckiest=[...rows].sort((a,b)=>a.adjustedPaGame-b.adjustedPaGame)[0];
    const unluckiest=[...rows].sort((a,b)=>b.adjustedPaGame-a.adjustedPaGame)[0];
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    grid.insertAdjacentHTML('beforeend', luckCard('Luckiest Manager',luckiest));
    grid.insertAdjacentHTML('beforeend', luckCard('Unluckiest Manager',unluckiest));
  };
})();
