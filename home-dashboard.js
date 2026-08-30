renderHome = function() {
  setActiveNav('home');
  const curr = currentManagers();
  const legacy = [...curr].sort((a,b)=>(b.legacyScore||0)-(a.legacyScore||0));
  const titles = [...curr].sort((a,b)=>b.titles-a.titles || (b.legacyScore||0)-(a.legacyScore||0));
  const champ25 = DATA.champions['2025'];
  const pointsLeader = Object.entries(DATA.scoring2025).sort((a,b)=>b[1].pf-a[1].pf)[0];
  const champs = Object.entries(DATA.champions).sort((a,b)=>Number(b[0])-Number(a[0]));

  app.innerHTML = `
    <section class="home-lead">
      <div class="home-lead-head">
        <div>
          <p class="eyebrow">2012–2025 • All-time</p>
          <h1>Legacy Board</h1>
        </div>
        <a class="text-link" href="#methodology">How it works →</a>
      </div>
      <div class="panel home-legacy-panel">
        <div class="leaderboard">${leaderboardRows(legacy, m => fmt.format(m.legacyScore), 'Legacy')}</div>
      </div>
    </section>

    <section class="section home-pulse">
      <div class="section-head"><div><p class="eyebrow">Current pulse</p><h2>Right now</h2></div></div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Most titles</div><div class="kpi-value">${titles[0].name}</div><div class="kpi-sub">${titles[0].titles} championships</div></div>
        <div class="kpi"><div class="kpi-label">2025 champion</div><div class="kpi-value">${champ25.manager}</div><div class="kpi-sub">First Ranch title in Year 1</div></div>
        <div class="kpi"><div class="kpi-label">2025 points leader</div><div class="kpi-value">${pointsLeader[0]}</div><div class="kpi-sub">${pointsLeader[1].pf.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} PF</div></div>
        <div class="kpi"><div class="kpi-label">League span</div><div class="kpi-value">14</div><div class="kpi-sub">Seasons archived</div></div>
      </div>
    </section>

    <section class="section two-col home-secondary">
      <div class="panel">
        <div class="panel-pad panel-title"><h3>2025 scoring</h3><small>PF / PA</small></div>
        <div class="leaderboard">${Object.entries(DATA.scoring2025).sort((a,b)=>b[1].pf-a[1].pf).slice(0,7).map(([name,s],i)=>`<a class="leader-row" href="#manager/${DATA.managers[name]?.id || slug(name)}"><span class="rank-pill">${i+1}</span><span class="leader-main"><strong>${name}</strong><small>${s.wins}-${s.losses} • ${s.finish === 1 ? 'Champion' : `Finish ${s.finish}`}</small></span><span class="leader-value">${fmt.format(s.pf)}<small>PF</small></span></a>`).join('')}</div>
      </div>
      <div class="panel home-quick-links">
        <div class="panel-pad panel-title"><h3>Explore the Ranch</h3></div>
        <div class="quick-links-grid">
          <a href="#managers"><strong>Managers</strong><span>Career pages & Legacy curves</span></a>
          <a href="#seasons"><strong>Seasons</strong><span>Year-by-year standings</span></a>
          <a href="#records"><strong>Records</strong><span>Titles, win %, average finish</span></a>
          <a href="#methodology"><strong>Method</strong><span>Legacy formula & sources</span></a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><p class="eyebrow">The wall</p><h2>Champions</h2></div><p>Every Ranch champion, back to 2012.</p></div>
      <div class="champion-strip">${champs.map(([year,c])=>`<div class="champ-card"><div class="champ-year">${year}</div><div class="champ-manager">${c.manager}</div><div class="champ-pick">Draft anchor: ${safe(c.playerPicked)}${c.draftPosition != null ? ` • ${c.draftPosition}` : ''}</div></div>`).join('')}</div>
    </section>`;
};
