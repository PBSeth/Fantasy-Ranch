function renderManager(id) {
  setActiveNav('managers');
  const m=managerById(id);
  if (!m) return renderNotFound();
  app.innerHTML = `
    <section class="profile-hero">
      <div><a class="back-link" href="#managers">← All managers</a><p class="eyebrow">${m.active2025?'Current manager':'Ranch alumni'}</p><h1>${m.name}</h1><div class="profile-full">${m.fullName}</div></div>
      <div class="legacy-badge"><small>Legacy Score</small><strong>${fmt.format(m.legacyScore || 0)}</strong></div>
    </section>
    ${m.legacyReconciliationNote ? `<div class="notice" style="margin-top:14px">${m.legacyReconciliationNote}</div>` : ''}
    <section class="profile-grid">
      <div class="panel chart-panel">
        <div class="panel-title"><h3>Career timeline</h3><small>Gold dots mark championships</small></div>
        <div class="metric-tabs" id="metricTabs">${Object.entries(metricDefs).map(([k,d])=>`<button class="metric-tab ${k==='legacy'?'active':''}" data-metric="${k}">${d.label}</button>`).join('')}<button class="metric-tab" disabled title="Historical scoring backfill is still being loaded">PF/G soon</button></div>
        <div class="chart-wrap" id="chartWrap">${chartSVG(m,'legacy')}</div>
        <div class="chart-note" id="chartNote">Legacy Score is recalculated after each season using the locked Ranch formula.</div>
      </div>
      <div class="stat-stack">
        <div class="big-stat"><strong>${safe(managerRecord(m))}</strong><span>All-time record</span></div>
        <div class="big-stat"><strong>${m.titles}</strong><span>Championships</span></div>
        <div class="big-stat"><strong>${m.playoffWins || 0}</strong><span>Playoff wins incl. byes</span></div>
        <div class="big-stat"><strong>${m.avgFinish ? fmt1.format(m.avgFinish) : '—'}</strong><span>Average finish</span></div>
        <div class="big-stat"><strong>${m.winPct != null ? pct(m.winPct) : '—'}</strong><span>Legacy win % input</span></div>
        <div class="big-stat"><strong>${m.serviceTime || 0}</strong><span>Seasons</span></div>
      </div>
    </section>
    <section class="section"><div class="section-head"><div><p class="eyebrow">Season log</p><h2>Year by year</h2></div><p>Scoring columns populate as verified historical PF/PA is added.</p></div>
      <div class="table-wrap"><table><thead><tr><th>Year</th><th>Finish</th><th>Reg. record</th><th>Playoffs</th><th>Legacy</th><th>PF</th><th>PA</th></tr></thead><tbody>${profileTable(m)}</tbody></table></div>
    </section>`;
  document.getElementById('metricTabs')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-metric]'); if(!b) return;
    document.querySelectorAll('.metric-tab[data-metric]').forEach(x=>x.classList.toggle('active',x===b));
    document.getElementById('chartWrap').innerHTML=chartSVG(m,b.dataset.metric);
    document.getElementById('chartNote').textContent = b.dataset.metric==='finish' ? 'Final finish is annual, not cumulative. Lower is better.' : `${metricDefs[b.dataset.metric].label} through each completed season.`;
  });
}

function seasonRows(year) {
  const rows=allManagers().map(m=>{
    const s=m.seasons.find(x=>x.year===year);
    return s && (s.record || s.finish) ? {m,s}:null;
  }).filter(Boolean).sort((a,b)=>(a.s.finish??999)-(b.s.finish??999));
  return rows;
}

function renderSeasons(year=2025) {
  setActiveNav('seasons');
  year=Number(year)||2025;
  const rows=seasonRows(year);
  const champ=DATA.champions[String(year)];
  const points = rows.filter(x=>x.s.pf!=null).sort((a,b)=>b.s.pf-a.s.pf);
  app.innerHTML=`
    <header class="page-head"><p class="eyebrow">Season archive</p><h1>${year}</h1><p>Final finish and records are driven by the Ranch history sheets. Scoring appears where PF/PA has been verified.</p></header>
    <div class="season-selector"><label for="seasonSelect"><strong>Season</strong></label><select id="seasonSelect">${Array.from({length:14},(_,i)=>2025-i).map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
    <div class="season-summary">
      <div class="kpi"><div class="kpi-label">Champion</div><div class="kpi-value">${champ?.manager || '—'}</div><div class="kpi-sub">${champ?.playerPicked ? `Draft anchor: ${champ.playerPicked}`:'Fantasy Ranch'}</div></div>
      <div class="kpi"><div class="kpi-label">League size</div><div class="kpi-value">${rows.length}</div><div class="kpi-sub">Managers with recorded results</div></div>
      <div class="kpi"><div class="kpi-label">Points leader</div><div class="kpi-value">${points[0]?.m.name || 'Backfill'}</div><div class="kpi-sub">${points[0] ? `${fmt1.format(points[0].s.pf)} PF` : 'Historical PF/PA being loaded'}</div></div>
    </div>
    ${year!==2025 && !points.length ? `<div class="notice">Historical scoring screenshots are being backfilled into this archive. Standings, finishes, titles and Legacy history are already live.</div>`:''}
    <section class="section"><div class="table-wrap"><table><thead><tr><th>Finish</th><th>Manager</th><th>Record</th><th>Playoffs</th><th>PF</th><th>PA</th><th>Legacy after season</th></tr></thead><tbody>${rows.map(({m,s})=>`<tr><td class="cell-rank ${s.champion?'champ':''}">${s.finish?`#${s.finish}`:'—'}${s.champion?' 🏆':''}</td><td><a class="text-link" href="#manager/${m.id}">${m.name}</a><br><small>${m.fullName}</small></td><td>${safe(s.record)}</td><td>${safe(s.playoffRecord)}</td><td>${s.pf!=null?fmt1.format(s.pf):'—'}</td><td>${s.pa!=null?fmt1.format(s.pa):'—'}</td><td>${s.legacyScore?fmt.format(s.legacyScore):'—'}</td></tr>`).join('')}</tbody></table></div></section>`;
  document.getElementById('seasonSelect')?.addEventListener('change',e=>location.hash=`seasons/${e.target.value}`);
}

function recCard(title, managers, valueFn, labelFn) {
  return `<div class="record-card"><h3>${title}</h3><div class="leaderboard">${managers.slice(0,8).map((m,i)=>`<a class="leader-row" href="#manager/${m.id}"><span class="rank-pill">${i+1}</span><span class="leader-main"><strong>${m.name}</strong><small>${m.fullName}</small></span><span class="leader-value">${valueFn(m)}<small>${labelFn}</small></span></a>`).join('')}</div></div>`;
}

function renderRecords() {
  setActiveNav('records');
  const m=allManagers();
  const byLegacy=[...m].filter(x=>x.legacyScore!=null).sort((a,b)=>b.legacyScore-a.legacyScore);
  const byTitles=[...m].sort((a,b)=>b.titles-a.titles || b.legacyScore-a.legacyScore);
  const byWin=[...m].filter(x=>x.winPct!=null).sort((a,b)=>b.winPct-a.winPct);
  const byAvg=[...m].filter(x=>x.avgFinish!=null).sort((a,b)=>a.avgFinish-b.avgFinish);
  app.innerHTML=`<header class="page-head"><p class="eyebrow">Bragging rights</p><h1>The Ranch record book.</h1><p>The obvious stuff and the metric unique to this league: current Legacy Score.</p></header>
    <div class="record-grid">
      ${recCard('Legacy Score',byLegacy,x=>fmt.format(x.legacyScore),'Legacy')}
      ${recCard('Championships',byTitles,x=>x.titles,'Titles')}
      ${recCard('Regular-season win %',byWin,x=>pct(x.winPct),'Win %')}
      ${recCard('Best average finish',byAvg,x=>fmt1.format(x.avgFinish),'Avg finish')}
    </div>
    <section class="section"><div class="section-head"><div><p class="eyebrow">Scoring</p><h2>2025 points for</h2></div><p>Historical scoring records expand as the screenshot backfill is verified.</p></div>
      <div class="panel"><div class="leaderboard">${Object.entries(DATA.scoring2025).sort((a,b)=>b[1].pf-a[1].pf).map(([name,s],i)=>`<a class="leader-row" href="#manager/${DATA.managers[name].id}"><span class="rank-pill">${i+1}</span><span class="leader-main"><strong>${name}</strong><small>${s.wins}-${s.losses} • ${fmt1.format(s.pfGame)} PF/G</small></span><span class="leader-value">${fmt1.format(s.pf)}<small>PF</small></span></a>`).join('')}</div></div>
    </section>`;
}

function renderMethodology() {
  setActiveNav('methodology');
  app.innerHTML=`<header class="page-head"><p class="eyebrow">How the sausage gets made</p><h1>Methodology</h1><p>The archive is intentionally boring about one thing: source hierarchy. If sources disagree, the Ranch sheet wins.</p></header>
  <div class="method-card"><h2>Legacy Score</h2><p>Legacy begins with cumulative regular-season win percentage, then rewards service time, playoff wins and championships.</p><div class="formula">${DATA.meta.legacyFormula}</div><p><strong>${DATA.meta.legacyByeNote}</strong> Cumulative win percentage is rounded to four decimals before applying the multipliers, matching the locked workbook and current official scores.</p>
    <div class="source-list"><div class="source-item"><strong>1. Google Sheets</strong><span>North star for manager identity, years, records, final finishes, titles, playoff results and official Legacy Score inputs.</span></div><div class="source-item"><strong>2. ESPN / Sleeper screenshots</strong><span>Used to enrich season history with PF, PA, PF/G, PA/G, old team names and platform-era details.</span></div><div class="source-item"><strong>3. Reconciliation, never guessing</strong><span>When an old screenshot and a sheet need reconciliation, the discrepancy is flagged instead of silently rewritten.</span></div></div>
  </div>`;
}

function renderNotFound(){ setActiveNav(''); app.innerHTML=`<header class="page-head"><p class="eyebrow">Wrong turn</p><h1>That pasture does not exist.</h1><p><a class="text-link" href="#home">Back to the Ranch →</a></p></header>`; }

function router(){
  const [page='home',arg]=routeParts();
  if(page==='home') renderHome();
  else if(page==='managers') renderManagers();
  else if(page==='manager') renderManager(arg);
  else if(page==='seasons') renderSeasons(arg||2025);
  else if(page==='records') renderRecords();
  else if(page==='methodology') renderMethodology();
  else renderNotFound();
  window.scrollTo({top:0,behavior:'auto'});
}

async function boot(){
  try {
    const files=['/data-core.json','/data-managers-1.json','/data-managers-2.json','/data-managers-3.json','/data-managers-4.json','/data-managers-5.json'];
    const parts=await Promise.all(files.map(f=>fetch(f).then(r=>{if(!r.ok)throw new Error(`Data ${r.status}: ${f}`);return r.json();})));
    DATA={...parts[0],managers:Object.assign({},...parts.slice(1))}; router();
  } catch(err){ console.error(err); app.innerHTML=`<div class="notice">The Ranch data failed to load. ${err.message}</div>`; }
}

window.addEventListener('hashchange',router);
boot();
