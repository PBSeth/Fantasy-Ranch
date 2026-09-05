// Career schedule-luck awards for the Wall of Fame.
// Luck is centered on points allowed: compare each manager's PA/game to the
// league scoring environment in the seasons they actually played. Career
// values are game-weighted so managers with fewer seasons are not penalized.
// PF/game is shown as context, but does not turn roster strength into "luck".
(function () {
  const MIN_GAMES = 40;

  function careerLuckRows() {
    const managers = allManagers();
    const leagueByYear = new Map();

    managers.forEach(m => (m.seasons || []).forEach(s => {
      const r = parseSeasonRecord(s.record);
      if (!r || !r.games || s.pa == null) return;
      if (!leagueByYear.has(s.year)) leagueByYear.set(s.year, { points:0, games:0 });
      const y = leagueByYear.get(s.year);
      y.points += Number(s.pa);
      y.games += r.games;
    }));

    return managers.map(m => {
      let games=0, pa=0, pf=0, pfGames=0, expectedPA=0;
      (m.seasons || []).forEach(s => {
        const r=parseSeasonRecord(s.record);
        const league=leagueByYear.get(s.year);
        if (!r || !r.games || s.pa == null || !league?.games) return;
        const leaguePapg=league.points/league.games;
        games += r.games;
        pa += Number(s.pa);
        expectedPA += leaguePapg*r.games;
        if (s.pf != null) {
          pf += Number(s.pf);
          pfGames += r.games;
        }
      });
      if (games < MIN_GAMES) return null;
      const paGame=pa/games;
      const expectedPaGame=expectedPA/games;
      return {
        m, games, paGame, expectedPaGame,
        luckPerGame: expectedPaGame-paGame,
        pfGame:pfGames ? pf/pfGames : null
      };
    }).filter(Boolean);
  }

  function luckCard(label,row) {
    const sign=row.luckPerGame>=0?'+':'';
    const direction=row.luckPerGame>=0?'fewer':'more';
    const abs=fmt1.format(Math.abs(row.luckPerGame));
    const pf=row.pfGame==null?'—':fmt1.format(row.pfGame);
    return highCard(
      label,
      `${sign}${fmt1.format(row.luckPerGame)} PPG`,
      compactManagerName(row.m),
      `${abs} ${direction} PA/game vs era avg • ${row.games} games • ${pf} PF/G`
    );
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const rows=careerLuckRows();
    if (!rows.length) return;
    const luckiest=[...rows].sort((a,b)=>b.luckPerGame-a.luckPerGame)[0];
    const unluckiest=[...rows].sort((a,b)=>a.luckPerGame-b.luckPerGame)[0];
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    grid.insertAdjacentHTML('beforeend', luckCard('Luckiest Manager · 40+ games',luckiest));
    grid.insertAdjacentHTML('beforeend', luckCard('Unluckiest Manager · 40+ games',unluckiest));
  };
})();
