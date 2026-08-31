function parseSeasonRecord(record) {
  const m = String(record || '').match(/^(\d+)-(\d+)(?:-(\d+))?/);
  if (!m) return null;
  const wins = Number(m[1]), losses = Number(m[2]), ties = Number(m[3] || 0);
  const games = wins + losses + ties;
  return { wins, losses, ties, games };
}

function formatDraftPosition(year, pos) {
  if (pos == null || pos === '') return '';
  if (typeof pos === 'number' || /^\d+$/.test(String(pos))) return `$${Number(pos)}`;
  const ordinal = String(pos).match(/^(\d+)(?:st|nd|rd|th)$/i);
  if (year >= 2020 && ordinal) {
    const n=Number(ordinal[1]);
    const round=Math.floor((n-1)/12)+1;
    const pick=((n-1)%12)+1;
    return `${round}.${String(pick).padStart(2,'0')}`;
  }
  return String(pos);
}

function leagueHighlights() {
  const managers = allManagers();
  const seasonRows = [];
  const legacyMoves=[];
  managers.forEach(m => {
    const seasons=(m.seasons || []).filter(s=>s.record).slice().sort((a,b)=>a.year-b.year);
    seasons.forEach(s => {
      const r = parseSeasonRecord(s.record);
      if (r) seasonRows.push({ m, s, ...r });
    });
    for(let i=1;i<seasons.length;i++) {
      if (seasons[i].legacyScore!=null && seasons[i-1].legacyScore!=null) {
        legacyMoves.push({m,year:seasons[i].year,delta:seasons[i].legacyScore-seasons[i-1].legacyScore});
      }
    }
  });

  const maxSeasonWins = Math.max(...seasonRows.map(x => x.wins));
  const minSeasonWins = Math.min(...seasonRows.map(x => x.wins));
  const maxSeasonLosses = Math.max(...seasonRows.map(x => x.losses));
  const seasonWinLeaders = seasonRows.filter(x => x.wins === maxSeasonWins).sort((a,b)=>a.s.year-b.s.year);
  const seasonLowWins = seasonRows.filter(x => x.wins === minSeasonWins).sort((a,b)=>a.s.year-b.s.year);
  const seasonLossLeaders = seasonRows.filter(x => x.losses === maxSeasonLosses).sort((a,b)=>a.s.year-b.s.year);
  const mostTitles = [...managers].sort((a,b)=>(b.titles||0)-(a.titles||0) || (b.legacyScore||0)-(a.legacyScore||0))[0];
  const mostPlayoffWins = [...managers].sort((a,b)=>(b.playoffWins||0)-(a.playoffWins||0))[0];
  const playoffApps = managers.map(m=>({m,count:(m.seasons||[]).filter(s=>s.playoffRecord).length})).sort((a,b)=>b.count-a.count);
  const mostCareerWins = [...managers].sort((a,b)=>{
    const aw = Math.max(...(a.seasons||[]).map(s=>s.cumulativeWins ?? -1));
    const bw = Math.max(...(b.seasons||[]).map(s=>s.cumulativeWins ?? -1));
    return bw-aw;
  })[0];
  const careerWins = Math.max(...(mostCareerWins.seasons||[]).map(s=>s.cumulativeWins ?? -1));
  const biggestJump=[...legacyMoves].sort((a,b)=>b.delta-a.delta)[0];
  const biggestDrop=[...legacyMoves].sort((a,b)=>a.delta-b.delta)[0];
  const lowestCareer=[...managers].filter(m=>(m.serviceTime||0)>=3 && m.winPct!=null).sort((a,b)=>a.winPct-b.winPct)[0];

  return {
    mostTitles, mostPlayoffWins, mostCareerWins, careerWins,
    mostPlayoffApps:playoffApps[0], seasonWinLeaders, maxSeasonWins,
    seasonLowWins, minSeasonWins, seasonLossLeaders, maxSeasonLosses,
    biggestJump, biggestDrop, lowestCareer
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
  const legacy = [...allManagers()].filter(m=>m.legacyScore!=null).sort((a,b)=>(b.legacyScore||0)-(a.legacyScore||0));
  const champs = Object.entries(DATA.champions).sort((a,b)=>Number(b[0])-Number(a[0]));
  const h = leagueHighlights();
  const seasonWinsNames = h.seasonWinLeaders.map(x=>managerDisplay(x.m)).join(' / ');
  const seasonWinsYears = h.seasonWinLeaders.map(x=>x.s.year).join(' / ');
  const lowWinNames = h.seasonLowWins.map(x=>managerDisplay(x.m)).join(' / ');
  const lowWinYears = h.seasonLowWins.map(x=>x.s.year).join(' / ');
  const lossNames = h.seasonLossLeaders.map(x=>managerDisplay(x.m)).join(' / ');
  const lossYears = h.seasonLossLeaders.map(x=>x.s.year).join(' / ');

  app.innerHTML = `
    <section class="home-lead highlights-lead">
      <div class="home-lead-head"><h1>League Highlights</h1></div>
      <div class="wall-high-grid highlights-grid">
        ${highCard('Most championships', h.mostTitles.titles, managerDisplay(h.mostTitles))}
        ${highCard('Career regular-season wins', h.careerWins, managerDisplay(h.mostCareerWins))}
        ${highCard('Playoff wins', h.mostPlayoffWins.playoffWins, managerDisplay(h.mostPlayoffWins), 'Byes included')}
        ${highCard('Playoff appearances', h.mostPlayoffApps.count, managerDisplay(h.mostPlayoffApps.m))}
        ${highCard('Wins in one season', h.maxSeasonWins, seasonWinsNames, seasonWinsYears)}
        ${highCard('Fewest wins in one season', h.minSeasonWins, lowWinNames, lowWinYears)}
        ${highCard('Most losses in one season', h.maxSeasonLosses, lossNames, lossYears)}
        ${highCard('Lowest career Win% · 3+ seasons', winPct3(h.lowestCareer.winPct), managerDisplay(h.lowestCareer), `${h.lowestCareer.serviceTime} seasons`)}
        ${highCard('Biggest Legacy jump', `+${fmt.format(h.biggestJump.delta)}`, managerDisplay(h.biggestJump.m), h.biggestJump.year)}
        ${highCard('Biggest Legacy drop', fmt.format(h.biggestDrop.delta), managerDisplay(h.biggestDrop.m), h.biggestDrop.year)}
      </div>
    </section>

    <section class="section legacy-section">
      <div class="home-lead-head"><h1>Legacy Score</h1></div>
      <div class="panel home-legacy-panel">
        <div class="leaderboard">${leaderboardRows(legacy, m => fmt.format(m.legacyScore))}</div>
      </div>
    </section>

    <section class="section wall-section">
      <div class="section-head wall-title"><h2>League Champs</h2></div>
      <div class="champion-strip wall-champs">${champs.map(([year,c])=>{
        const pick=formatDraftPosition(Number(year),c.draftPosition);
        return `<div class="champ-card"><div class="champ-year">${year}</div><div class="champ-manager">${fullManagerName(c.manager)}</div><div class="champ-pick">#1 draft choice: ${safe(c.playerPicked)}${pick ? ` • ${pick}` : ''}</div></div>`;
      }).join('')}</div>
    </section>`;
};
