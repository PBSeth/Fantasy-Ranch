function parseSeasonRecord(record) {
  const m = String(record || '').match(/^(\d+)-(\d+)(?:-(\d+))?/);
  if (!m) return null;
  const wins = Number(m[1]), losses = Number(m[2]), ties = Number(m[3] || 0);
  const games = wins + losses + ties;
  return { wins, losses, ties, games };
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
  const mostTitles = [...managers].sort((a,b)=>(b.titles||0)-(a.titles||0) || (b.legacyScore||0)-(a.legacyScore||0))[0];
  const mostPlayoffWins = [...managers].sort((a,b)=>(b.playoffWins||0)-(a.playoffWins||0))[0];
  const mostCareerWins = [...managers].sort((a,b)=>{
    const aw = Math.max(...(a.seasons||[]).map(s=>s.cumulativeWins ?? -1));
    const bw = Math.max(...(b.seasons||[]).map(s=>s.cumulativeWins ?? -1));
    return bw-aw;
  })[0];
  const careerWins = Math.max(...(mostCareerWins.seasons||[]).map(s=>s.cumulativeWins ?? -1));

  return { mostTitles, mostPlayoffWins, mostCareerWins, careerWins, seasonWinLeaders, maxSeasonWins };
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
  const legacy = [...allManagers()].filter(m=>m.legacyScore!=null).sort((a,b)=>(b.legacyScore||0)-(a.legacyScore||0));
  const champs = Object.entries(DATA.champions).sort((a,b)=>Number(b[0])-Number(a[0]));
  const highs = leagueHighs();
  const seasonWinsNames = highs.seasonWinLeaders.map(x=>managerDisplay(x.m)).join(' / ');
  const seasonWinsYears = highs.seasonWinLeaders.map(x=>x.s.year).join(' / ');

  app.innerHTML = `
    <section class="home-lead">
      <div class="home-lead-head"><h1>Legacy Score</h1></div>
      <div class="panel home-legacy-panel">
        <div class="leaderboard">${leaderboardRows(legacy, m => fmt.format(m.legacyScore), 'Score')}</div>
      </div>
    </section>

    <section class="section wall-section">
      <div class="section-head wall-title"><h2>League Champs</h2></div>
      <div class="champion-strip wall-champs">${champs.map(([year,c])=>`<div class="champ-card"><div class="champ-year">${year}</div><div class="champ-manager">${fullManagerName(c.manager)}</div><div class="champ-pick">First draft choice: ${safe(c.playerPicked)}${c.draftPosition != null ? ` • ${c.draftPosition}` : ''}</div></div>`).join('')}</div>

      <div class="wall-subhead"><h2>League Highs</h2></div>
      <div class="wall-high-grid">
        ${highCard('Most championships', highs.mostTitles.titles, managerDisplay(highs.mostTitles))}
        ${highCard('Career regular-season wins', highs.careerWins, managerDisplay(highs.mostCareerWins))}
        ${highCard('Playoff wins', highs.mostPlayoffWins.playoffWins, managerDisplay(highs.mostPlayoffWins), 'Bye weeks included')}
        ${highCard('Regular-season wins in a season', highs.maxSeasonWins, seasonWinsNames, seasonWinsYears)}
      </div>
    </section>`;
};
