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
  if (ordinal) {
    const n=Number(ordinal[1]);
    const round=Math.floor((n-1)/12)+1;
    const pick=((n-1)%12)+1;
    return `${round}.${String(pick).padStart(2,'0')}`;
  }
  return String(pos);
}

function trophyManagerName(label) {
  if (label === 'Ty/Molly') return 'Tyler Schmidt';
  if (label === 'Diddles') return 'Matt Diddle';
  return fullManagerName(label);
}

function compactManagerName(m) {
  return managerDisplay(m);
}

function formatSeasonRate(rate) {
  return `${Number((rate * 100).toFixed(1))}%`;
}

function seasonStreaksForManager(m) {
  const seasons=(m.seasons || [])
    .map(s=>({s,r:parseSeasonRecord(s.record)}))
    .filter(x=>x.r)
    .sort((a,b)=>a.s.year-b.s.year);
  const out=[];
  let kind=null,start=null,end=null,count=0,prevYear=null;
  const flush=()=>{
    if(kind && count>0) out.push({m,kind,startYear:start,endYear:end,count});
    kind=null; start=null; end=null; count=0;
  };
  seasons.forEach(({s,r})=>{
    const nextKind=r.wins>r.losses ? 'winning' : r.losses>r.wins ? 'losing' : null;
    if(prevYear!=null && s.year!==prevYear+1) flush();
    if(!nextKind) {
      flush();
    } else if(nextKind===kind) {
      end=s.year;
      count+=1;
    } else {
      flush();
      kind=nextKind;
      start=s.year;
      end=s.year;
      count=1;
    }
    prevYear=s.year;
  });
  flush();
  return out;
}

function leagueHighlights() {
  const managers = allManagers();
  const seasonRows = [];
  const legacyMoves=[];
  const seasonStreaks=[];
  managers.forEach(m => {
    const seasons=(m.seasons || []).filter(s=>s.record).slice().sort((a,b)=>a.year-b.year);
    seasons.forEach(s => {
      const r = parseSeasonRecord(s.record);
      if (r) seasonRows.push({ m, s, ...r });
    });
    seasonStreaks.push(...seasonStreaksForManager(m));
    for(let i=1;i<seasons.length;i++) {
      if (seasons[i].legacyScore!=null && seasons[i-1].legacyScore!=null) {
        legacyMoves.push({
          m,
          fromYear:seasons[i-1].year,
          toYear:seasons[i].year,
          delta:seasons[i].legacyScore-seasons[i-1].legacyScore
        });
      }
    }
  });

  const maxSeasonWins = Math.max(...seasonRows.map(x => x.wins));
  const minSeasonWins = Math.min(...seasonRows.map(x => x.wins));
  const seasonWinLeaders = seasonRows.filter(x => x.wins === maxSeasonWins).sort((a,b)=>a.s.year-b.s.year);
  const seasonLowWins = seasonRows.filter(x => x.wins === minSeasonWins).sort((a,b)=>a.s.year-b.s.year);

  const finalsRows=managers.map(m=>({
    m,
    count:(m.seasons || []).filter(s=>Number(s.finish)===1 || Number(s.finish)===2).length
  }));
  const maxFinalsAppearances=Math.max(0,...finalsRows.map(x=>x.count));
  const mostFinalsApps=finalsRows
    .filter(x=>x.count===maxFinalsAppearances)
    .sort((a,b)=>(b.m.titles||0)-(a.m.titles||0) || (b.m.legacyScore||0)-(a.m.legacyScore||0));

  const winningStreaks=seasonStreaks.filter(x=>x.kind==='winning');
  const losingStreaks=seasonStreaks.filter(x=>x.kind==='losing');
  const maxWinningSeasonStreak=Math.max(0,...winningStreaks.map(x=>x.count));
  const maxLosingSeasonStreak=Math.max(0,...losingStreaks.map(x=>x.count));
  const winningSeasonStreakLeaders=winningStreaks.filter(x=>x.count===maxWinningSeasonStreak).sort((a,b)=>a.startYear-b.startYear);
  const losingSeasonStreakLeaders=losingStreaks.filter(x=>x.count===maxLosingSeasonStreak).sort((a,b)=>a.startYear-b.startYear);

  const seasonRateRows=managers.map(m=>{
    const records=(m.seasons || []).map(s=>parseSeasonRecord(s.record)).filter(Boolean);
    const total=records.length;
    const winning=records.filter(r=>r.wins>r.losses).length;
    const losing=records.filter(r=>r.losses>r.wins).length;
    return {m,total,winning,losing,winningRate:total ? winning/total : 0,losingRate:total ? losing/total : 0};
  }).filter(x=>x.total>=3);
  const highestWinningRate=Math.max(...seasonRateRows.map(x=>x.winningRate));
  const lowestWinningRate=Math.min(...seasonRateRows.map(x=>x.winningRate));
  const highestLosingRate=Math.max(...seasonRateRows.map(x=>x.losingRate));
  const lowestLosingRate=Math.min(...seasonRateRows.map(x=>x.losingRate));
  const highestWinningRateLeaders=seasonRateRows.filter(x=>x.winningRate===highestWinningRate).sort((a,b)=>b.total-a.total);
  const lowestWinningRateLeaders=seasonRateRows.filter(x=>x.winningRate===lowestWinningRate).sort((a,b)=>b.total-a.total);
  const highestLosingRateLeaders=seasonRateRows.filter(x=>x.losingRate===highestLosingRate).sort((a,b)=>b.total-a.total);
  const lowestLosingRateLeaders=seasonRateRows.filter(x=>x.losingRate===lowestLosingRate).sort((a,b)=>b.total-a.total);

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

  const scoringRows=seasonRows.filter(x=>x.s.pfGame!=null).map(x=>({
    ...x,
    ppg:x.s.pfGame,
    papg:x.s.paGame,
    diffGame:x.s.diffGame!=null ? x.s.diffGame : (x.s.pfGame-x.s.paGame),
    ppgPlayer:ppgPerPlayerForSeason(x.s)
  }));
  const highestPpg=[...scoringRows].sort((a,b)=>b.ppg-a.ppg)[0];
  const lowestPpg=[...scoringRows].sort((a,b)=>a.ppg-b.ppg)[0];
  const bestMargin=[...scoringRows].sort((a,b)=>b.diffGame-a.diffGame)[0];
  const worstMargin=[...scoringRows].sort((a,b)=>a.diffGame-b.diffGame)[0];
  const playerPpgRows=scoringRows.filter(x=>x.ppgPlayer!=null);
  const highestPpgPlayer=[...playerPpgRows].sort((a,b)=>b.ppgPlayer-a.ppgPlayer)[0];
  const lowestPpgPlayer=[...playerPpgRows].sort((a,b)=>a.ppgPlayer-b.ppgPlayer)[0];

  return {
    mostTitles, mostPlayoffWins, mostCareerWins, careerWins,
    mostPlayoffApps:playoffApps[0], mostFinalsApps, maxFinalsAppearances,
    seasonWinLeaders, maxSeasonWins, seasonLowWins, minSeasonWins,
    winningSeasonStreakLeaders, maxWinningSeasonStreak,
    losingSeasonStreakLeaders, maxLosingSeasonStreak,
    highestWinningRate, lowestWinningRate, highestLosingRate, lowestLosingRate,
    highestWinningRateLeaders, lowestWinningRateLeaders,
    highestLosingRateLeaders, lowestLosingRateLeaders,
    biggestJump, biggestDrop, lowestCareer,
    highestPpg, lowestPpg, bestMargin, worstMargin, highestPpgPlayer, lowestPpgPlayer
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
  const champs = Object.entries(DATA.champions).sort((a,b)=>Number(a[0])-Number(b[0]));
  const h = leagueHighlights();
  const seasonWinsNames = h.seasonWinLeaders.map(x=>compactManagerName(x.m)).join(' / ');
  const seasonWinsYears = h.seasonWinLeaders.map(x=>x.s.year).join(' / ');
  const lowWinNames = h.seasonLowWins.map(x=>compactManagerName(x.m)).join(' / ');
  const lowWinYears = h.seasonLowWins.map(x=>x.s.year).join(' / ');
  const finalsNames = h.mostFinalsApps.map(x=>compactManagerName(x.m)).join(' / ');
  const winningStreakNames=h.winningSeasonStreakLeaders.map(x=>compactManagerName(x.m)).join(' / ');
  const winningStreakYears=h.winningSeasonStreakLeaders.map(x=>`${x.startYear}–${x.endYear}`).join(' / ');
  const losingStreakNames=h.losingSeasonStreakLeaders.map(x=>compactManagerName(x.m)).join(' / ');
  const losingStreakYears=h.losingSeasonStreakLeaders.map(x=>`${x.startYear}–${x.endYear}`).join(' / ');
  const rateNames=rows=>rows.map(x=>compactManagerName(x.m)).join(' / ');
  const rateDetail=(rows,kind)=>rows.map(x=>`${kind==='winning' ? x.winning : x.losing} of ${x.total} seasons`).join(' / ');

  app.innerHTML = `
    <section class="home-lead highlights-lead">
      <div class="home-lead-head"><h1>Wall of Fame</h1></div>
      <div class="wall-high-grid highlights-grid">
        ${highCard('Highest team PPG', fmt1.format(h.highestPpg.ppg), compactManagerName(h.highestPpg.m), h.highestPpg.s.year)}
        ${highCard('Lowest team PPG', fmt1.format(h.lowestPpg.ppg), compactManagerName(h.lowestPpg.m), h.lowestPpg.s.year)}
        ${highCard('Best scoring margin / game', `+${fmt1.format(h.bestMargin.diffGame)}`, compactManagerName(h.bestMargin.m), h.bestMargin.s.year)}
        ${highCard('Worst scoring margin / game', fmt1.format(h.worstMargin.diffGame), compactManagerName(h.worstMargin.m), h.worstMargin.s.year)}
        ${highCard('Highest PPG / starter', fmt1.format(h.highestPpgPlayer.ppgPlayer), compactManagerName(h.highestPpgPlayer.m), h.highestPpgPlayer.s.year)}
        ${highCard('Lowest PPG / starter', fmt1.format(h.lowestPpgPlayer.ppgPlayer), compactManagerName(h.lowestPpgPlayer.m), h.lowestPpgPlayer.s.year)}
        ${highCard('Most championships', h.mostTitles.titles, compactManagerName(h.mostTitles))}
        ${highCard('Most Finals Appearances', h.maxFinalsAppearances, finalsNames)}
        ${highCard('Career regular-season wins', h.careerWins, compactManagerName(h.mostCareerWins))}
        ${highCard('Lowest career Win% · 3+ seasons', winPct3(h.lowestCareer.winPct), compactManagerName(h.lowestCareer), `${h.lowestCareer.serviceTime} seasons`)}
        ${highCard('Playoff wins', h.mostPlayoffWins.playoffWins, compactManagerName(h.mostPlayoffWins))}
        ${highCard('Playoff appearances', h.mostPlayoffApps.count, compactManagerName(h.mostPlayoffApps.m))}
        ${highCard('Most Single Season Wins', h.maxSeasonWins, seasonWinsNames, seasonWinsYears)}
        ${highCard('Fewest Single Season Wins', h.minSeasonWins, lowWinNames, lowWinYears)}
        ${highCard('Consecutive Winning Seasons', h.maxWinningSeasonStreak, winningStreakNames, winningStreakYears)}
        ${highCard('Consecutive Losing Seasons', h.maxLosingSeasonStreak, losingStreakNames, losingStreakYears)}
        ${highCard('Highest Winning Season Rate · 3+ seasons', formatSeasonRate(h.highestWinningRate), rateNames(h.highestWinningRateLeaders), rateDetail(h.highestWinningRateLeaders,'winning'))}
        ${highCard('Lowest Winning Season Rate · 3+ seasons', formatSeasonRate(h.lowestWinningRate), rateNames(h.lowestWinningRateLeaders), rateDetail(h.lowestWinningRateLeaders,'winning'))}
        ${highCard('Highest Losing Season Rate · 3+ seasons', formatSeasonRate(h.highestLosingRate), rateNames(h.highestLosingRateLeaders), rateDetail(h.highestLosingRateLeaders,'losing'))}
        ${highCard('Lowest Losing Season Rate · 3+ seasons', formatSeasonRate(h.lowestLosingRate), rateNames(h.lowestLosingRateLeaders), rateDetail(h.lowestLosingRateLeaders,'losing'))}
        ${highCard('Biggest Legacy jump', `+${fmt.format(h.biggestJump.delta)}`, compactManagerName(h.biggestJump.m), `${h.biggestJump.fromYear} → ${h.biggestJump.toYear}`)}
        ${highCard('Biggest Legacy drop', fmt.format(h.biggestDrop.delta), compactManagerName(h.biggestDrop.m), `${h.biggestDrop.fromYear} → ${h.biggestDrop.toYear}`)}
      </div>
    </section>

    <section class="section wall-section champs-before-legacy">
      <div class="section-head wall-title"><h2>Champions</h2></div>
      <div class="champion-strip wall-champs">${champs.map(([year,c])=>{
        const pick=formatDraftPosition(Number(year),c.draftPosition);
        return `<div class="champ-card">
          <div class="champ-year">${year}</div>
          <div class="champ-manager">${trophyManagerName(c.manager)}</div>
          <div class="champ-pick-group">
            <div class="champ-pick-label">Top Draft Pick</div>
            <div class="champ-player">${safe(c.playerPicked)}</div>
            <div class="champ-cost">${pick || '—'}</div>
          </div>
        </div>`;
      }).join('')}</div>
    </section>

    <section class="section legacy-section">
      <div class="home-lead-head"><h1>Legacy Score</h1></div>
      <div class="panel home-legacy-panel">
        <div class="leaderboard">${leaderboardRows(legacy, m => fmt.format(m.legacyScore))}</div>
      </div>
    </section>`;
};
