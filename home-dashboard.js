function parseSeasonRecord(record) {
  const m = String(record || '').match(/^(\d+)-(\d+)(?:-(\d+))?/);
  if (!m) return null;
  const wins = Number(m[1]), losses = Number(m[2]), ties = Number(m[3] || 0);
  const games = wins + losses + ties;
  return { wins, losses, ties, games, pct: games ? (wins + ties * 0.5) / games : 0 };
}

function leagueHighs() {
  const managers = allManagers();
  const seasonRows = [];
  managers.forEach(m => (m.seasons || []).forEach(s => {
    const r = parseSeasonRecord(s.record);
    if (r) seasonRows.push({ m, s, ...r });
  }));

  const maxSeasonWins = Math.max(...seasonRows.map(x => x.wins));
  const seasonWinLeaders = seasonRows.filter(x => x.wins === maxSeasonWins).sort((a,b)=>a.s.year-b.s.year);
  const bestSeason = [...seasonRows].sort((a,b)=>b.pct-a.pct || b.games-a.games || b.wins-a.wins)[0];
  const mostTitles = [...managers].sort((a,b)=>(b.titles||0)-(a.titles||0) || (b.legacyScore||0)-(a.legacyScore||0))[0];
  const mostPlayoffWins = [...managers].sort((a,b)=>(b.playoffWins||0)-(a.playoffWins||0))[0];
  const mostCareerWins = [...managers].sort((a,b)=>{
    const aw = Math.max(...(a.seasons||[]).map(s=>s.cumulativeWins ?? -1));
    const bw = Math.max(...(b.seasons||[]).map(s=>s.cumulativeWins ?? -1));
    return bw-aw;
  })[0];
  const careerWins = Math.max(...(mostCareerWins.seasons||[]).map(s=>s.cumulativeWins ?? -1));

  return {
    mostTitles,
    mostPlayoffWins,
    mostCareerWins,
    careerWins,
    seasonWinLeaders,
    maxSeasonWins,
    bestSeason
  };
}

function highCard(label, value, name, detail='') {
  return `<div class="wall-high-card">
    <div class="wall-high-label">${label}</div>
    <div class="wall-high-value">${value}</div>
    <div class="wall-high-name">${name}</div>
    ${detail ? `<div class="wall-high-detail">${detail}</div>` : ''}
  </div>`;
}

renderHome = function() {
  setActiveNav('home');
  const curr = currentManagers();
  const legacy = [...curr].sort((a,b)=>(b.legacyScore||0)-(a.legacyScore||0));
  const champs = Object.entries(DATA.champions).sort((a,b)=>Number(b[0])-Number(a[0]));
  const highs = leagueHighs();
  const seasonWinsNames = highs.seasonWinLeaders.map(x=>x.m.name).join(' / ');
  const seasonWinsYears = highs.seasonWinLeaders.map(x=>x.s.year).join(' / ');

  app.innerHTML = `
    <section class="home-lead">
      <div class="home-lead-head"><h1>Legacy Board</h1></div>
      <div class="panel home-legacy-panel">
        <div class="leaderboard">${leaderboardRows(legacy, m => fmt.format(m.legacyScore), 'Legacy')}</div>
      </div>
    </section>

    <section class="section wall-section">
      <div class="section-head wall-title"><div><p class="eyebrow">The Wall</p><h2>League Champs</h2></div></div>
      <div class="champion-strip wall-champs">${champs.map(([year,c])=>`<div class="champ-card"><div class="champ-year">${year}</div><div class="champ-manager">${c.manager}</div><div class="champ-pick">${safe(c.playerPicked)}</div></div>`).join('')}</div>

      <div class="wall-subhead"><h2>League Highs</h2></div>
      <div class="wall-high-grid">
        ${highCard('Most championships', highs.mostTitles.titles, highs.mostTitles.name)}
        ${highCard('Career regular-season wins', highs.careerWins, highs.mostCareerWins.name)}
        ${highCard('Playoff wins', highs.mostPlayoffWins.playoffWins, highs.mostPlayoffWins.name, 'Bye weeks included')}
        ${highCard('Regular-season wins in a season', highs.maxSeasonWins, seasonWinsNames, seasonWinsYears)}
        ${highCard('Best regular-season win rate', `${(highs.bestSeason.pct*100).toFixed(1)}%`, highs.bestSeason.m.name, `${highs.bestSeason.s.record} • ${highs.bestSeason.s.year}`)}
      </div>
    </section>`;
};
