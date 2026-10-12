const managerMetricTabs = [
  { key:'legacy', label:'Legacy Score' },
  { key:'wins', label:'Season Wins' },
  { key:'pfpa', label:'PF/PA' },
  { key:'winpct', label:'<span>Career</span><span>Win%</span>', twoLine:true },
  { key:'finish', label:'Final Finish' }
];

function managerMetricTabMarkup(tab) {
  return `<button class="metric-tab ${tab.twoLine ? 'metric-tab-two-line ' : ''}${tab.key==='legacy'?'active':''}" data-metric="${tab.key}" aria-label="${tab.key==='winpct' ? 'Career Win%' : tab.label}">${tab.label}</button>`;
}

function h2hManagerKey(m) {
  return Object.entries(DATA.managers || {}).find(([,manager])=>manager===m)?.[0] || null;
}

function h2hOpponents(m) {
  const currentKey=h2hManagerKey(m);
  return Object.entries(DATA.managers || {})
    .filter(([key])=>key!==currentKey)
    .map(([key,manager])=>({
      key,
      manager,
      games:DATA.h2h?.records?.[currentKey]?.[key]?.games || 0
    }))
    .sort((a,b)=>managerDisplay(a.manager).localeCompare(managerDisplay(b.manager)));
}

function h2hRecordText(r) {
  if (!r) return '—';
  return r.t ? `${r.w}-${r.l}-${r.t}` : `${r.w}-${r.l}`;
}

function h2hOrderedSeries(currentKey, opponentKey) {
  return DATA.h2hSeries?.series?.[currentKey]?.[opponentKey] || [];
}

function h2hCurrentStreak(series) {
  if (!series.length) return '—';
  const last=series[series.length-1]?.result;
  let count=0;
  for(let i=series.length-1;i>=0;i--) {
    if(series[i]?.result!==last) break;
    count+=1;
  }
  return `${last}${count}`;
}

function h2hLastFiveMarkup(series) {
  const last=series.slice(-5);
  if (!last.length) return '<span class="h2h-last-empty">—</span>';
  return last.map(x=>`<span class="h2h-result-pill h2h-result-${String(x.result).toLowerCase()}" title="${x.year} Week ${x.week}">${x.result}</span>`).join('');
}

function h2hSeriesStatus(m, opponent, r) {
  if (r.w===r.l) return 'Series tied';
  const leader=r.w>r.l ? managerDisplay(m) : managerDisplay(opponent);
  return `${leader} leads by ${Math.abs(r.w-r.l)}`;
}

function h2hResultMarkup(m, opponentKey) {
  const currentKey=h2hManagerKey(m);
  const opponent=managerFromLabel(opponentKey);
  const r=DATA.h2h?.records?.[currentKey]?.[opponentKey];
  if (!opponent || !r || !r.games) {
    return `<div class="h2h-empty">No regular-season meetings logged with ${opponent ? managerDisplay(opponent) : 'this manager'}.</div>`;
  }

  const winPct=(r.w + (r.t || 0)*0.5) / r.games;
  const ordered=h2hOrderedSeries(currentKey,opponentKey);
  const streak=h2hCurrentStreak(ordered);
  const seasons=[...(r.seasons || [])].sort((a,b)=>a.year-b.year).map(s=>`
    <span class="h2h-season-chip">
      <b>${s.year}</b>
      <span>${s.t ? `${s.w}-${s.l}-${s.t}` : `${s.w}-${s.l}`}</span>
    </span>`).join('');

  return `
    <div class="h2h-faceoff">
      <div class="h2h-faceoff-manager h2h-faceoff-left"><strong>${managerDisplay(m)}</strong></div>
      <div class="h2h-faceoff-series">
        <small>All-time series</small>
        <strong>${h2hRecordText(r)}</strong>
        <span>${h2hSeriesStatus(m,opponent,r)}</span>
      </div>
      <div class="h2h-faceoff-manager h2h-faceoff-right"><strong>${managerDisplay(opponent)}</strong></div>
    </div>
    <div class="h2h-rivalry-stats">
      <div class="h2h-rivalry-stat"><strong>${r.games}</strong><span>Meetings</span></div>
      <div class="h2h-rivalry-stat"><strong>${(winPct*100).toFixed(1)}%</strong><span>Win%</span></div>
      <div class="h2h-rivalry-stat"><strong>${streak}</strong><span>Current streak</span></div>
      <div class="h2h-rivalry-stat h2h-last-five-stat"><div class="h2h-last-five">${h2hLastFiveMarkup(ordered)}</div><span>Last 5</span></div>
    </div>
    ${seasons ? `<div class="h2h-season-list">${seasons}</div>` : ''}`;
}

function renderManager(id) {
  setActiveNav('managers');
  const m=managerById(id);
  if (!m) return renderNotFound();
  const careerPF=(m.seasons || []).reduce((sum,s)=>sum+(Number.isFinite(Number(s.pf))?Number(s.pf):0),0);
  const careerPA=(m.seasons || []).reduce((sum,s)=>sum+(Number.isFinite(Number(s.pa))?Number(s.pa):0),0);
  const hasCareerPF=(m.seasons || []).some(s=>s.pf!=null && Number.isFinite(Number(s.pf)));
  const hasCareerPA=(m.seasons || []).some(s=>s.pa!=null && Number.isFinite(Number(s.pa)));
  const h2hOpps=h2hOpponents(m);
  const defaultH2HOpponent=[...h2hOpps].sort((a,b)=>b.games-a.games || managerDisplay(a.manager).localeCompare(managerDisplay(b.manager)))[0]?.key || '';
  app.innerHTML = `
    <section class="profile-hero">
      <div>
        <a class="back-link" href="#managers">← Managers</a>
        <div class="profile-name-row"><h1>${managerDisplay(m)}</h1><span class="status ${m.active2025 ? '' : 'alumni'}">${m.active2025 ? 'Active' : 'RIP'}</span></div>
      </div>
      <div class="legacy-badge"><small>Legacy Score</small><strong>${fmt.format(m.legacyScore || 0)}</strong></div>
    </section>
    <section class="profile-grid">
      <div class="panel chart-panel">
        <div class="panel-title career-overview-title"><h3>Career Overview</h3><small class="champ-legend"><span class="legend-gold-dot"></span> = 🏆</small></div>
        <div class="metric-tabs" id="metricTabs">${managerMetricTabs.map(managerMetricTabMarkup).join('')}</div>
        <div class="chart-wrap" id="chartWrap">${chartSVG(m,'legacy')}</div>
      </div>
      <div class="stat-stack">
        <div class="big-stat"><strong>${safe(managerRecord(m))}</strong><span>All-time record</span></div>
        <div class="big-stat championship-stat"><strong>${m.titles}</strong><span>Championships</span></div>
        <div class="big-stat"><strong>${m.playoffWins || 0}</strong><span>Playoff wins</span></div>
        <div class="big-stat"><strong>${m.avgFinish ? fmt1.format(m.avgFinish) : '—'}</strong><span>Average finish</span></div>
        <div class="big-stat"><strong>${m.winPct != null ? winPct3(m.winPct) : '—'}</strong><span>Career Win%</span></div>
        <div class="big-stat"><strong>${m.serviceTime || 0}</strong><span>Seasons</span></div>
        <div class="big-stat"><strong>${hasCareerPF ? fmt1.format(careerPF) : '—'}</strong><span>Career PF</span></div>
        <div class="big-stat"><strong>${hasCareerPA ? fmt1.format(careerPA) : '—'}</strong><span>Career PA</span></div>
      </div>
    </section>
    <section class="section h2h-section">
      <div class="section-head">
        <div>
          <h2>Head to Head</h2>
          <p>Regular season</p>
        </div>
      </div>
      <div class="panel h2h-panel">
        <div class="h2h-picker">
          <label for="h2hOpponent">Opponent</label>
          <select id="h2hOpponent">
            ${h2hOpps.map(o=>`<option value="${o.key}" ${o.key===defaultH2HOpponent?'selected':''}>${managerDisplay(o.manager)}</option>`).join('')}
          </select>
        </div>
        <div id="h2hResult" class="h2h-result">${defaultH2HOpponent ? h2hResultMarkup(m,defaultH2HOpponent) : '<div class="h2h-empty">No opponents available.</div>'}</div>
      </div>
    </section>
    <section class="section profile-year-section">
      <div class="section-head"><h2>Year by year</h2></div>
      <div class="table-wrap"><table><thead><tr><th>Year</th><th>Finish</th><th>Reg. record</th><th>Playoffs</th><th>Top Pick</th><th>PF</th><th>PA</th></tr></thead><tbody>${profileTable(m)}</tbody></table></div>
      ${m.topPick2026 ? `<div class="notice top-pick-current"><strong>2026 Top Pick:</strong> ${m.topPick2026}</div>` : ''}
    </section>`;
  document.getElementById('metricTabs')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-metric]'); if(!b) return;
    document.querySelectorAll('.metric-tab[data-metric]').forEach(x=>x.classList.toggle('active',x===b));
    document.getElementById('chartWrap').innerHTML=chartSVG(m,b.dataset.metric);
  });
  document.getElementById('h2hOpponent')?.addEventListener('change',e=>{
    document.getElementById('h2hResult').innerHTML=h2hResultMarkup(m,e.target.value);
  });
}

function seasonRows(year) {
  return allManagers().map(m=>{
    const s=m.seasons.find(x=>x.year===year);
    return s && (s.record || s.finish) ? {m,s}:null;
  }).filter(Boolean).sort((a,b)=>(a.s.finish??999)-(b.s.finish??999));
}

function renderSeasons(year=2025) {
  setActiveNav('seasons');
  year=Number(year)||2025;
  const rows=seasonRows(year);
  const champ=DATA.champions[String(year)];
  const champManager = champ ? fullManagerName(champ.manager) : '—';
  const points = rows.filter(x=>x.s.pf!=null).sort((a,b)=>b.s.pf-a.s.pf);
  app.innerHTML=`
    <header class="page-head compact-page-head"><h1>${year}</h1></header>
    <div class="season-selector"><label for="seasonSelect"><strong>Season</strong></label><select id="seasonSelect">${Array.from({length:14},(_,i)=>2025-i).map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
    <div class="season-summary">
      <div class="kpi"><div class="kpi-label">Champion</div><div class="kpi-value">${champManager}</div></div>
      <div class="kpi"><div class="kpi-label">League size</div><div class="kpi-value">${rows.length}</div></div>
      <div class="kpi"><div class="kpi-label">Points leader</div><div class="kpi-value">${points[0] ? managerDisplay(points[0].m) : '—'}</div></div>
    </div>
    <section class="section"><div class="table-wrap"><table><thead><tr><th>Finish</th><th>Manager</th><th>Record</th><th>Playoffs</th><th>PF</th><th>PA</th></tr></thead><tbody>${rows.map(({m,s})=>`<tr><td class="cell-rank">${s.finish?`${s.finish}`:'—'}</td><td><a class="text-link" href="#manager/${m.id}">${managerDisplay(m)}</a></td><td>${safe(s.record)}</td><td>${safe(s.playoffRecord)}</td><td>${s.pf!=null?fmt1.format(s.pf):'—'}</td><td>${s.pa!=null?fmt1.format(s.pa):'—'}</td></tr>`).join('')}</tbody></table></div></section>`;
  document.getElementById('seasonSelect')?.addEventListener('change',e=>location.hash=`seasons/${e.target.value}`);
}

function renderNotFound(){ setActiveNav(''); app.innerHTML=`<header class="page-head"><h1>Not found</h1><p><a class="text-link" href="#home">Back to the Ranch →</a></p></header>`; }

function router(){
  const [page='home',arg]=routeParts();
  if(page==='home') renderHome();
  else if(page==='managers') renderManagers();
  else if(page==='manager') renderManager(arg);
  else if(page==='seasons') renderSeasons(arg||2025);
  else renderNotFound();
  window.scrollTo({top:0,behavior:'auto'});
}

async function boot(){
  try {
    const files=[
      '/data-core.json',
      '/data-managers-1.json','/data-managers-2.json','/data-managers-3.json','/data-managers-4.json','/data-managers-5.json',
      '/data-scoring-2012-2015.json','/data-scoring-2016-2018.json','/data-scoring-2019-2021.json','/data-scoring-2022-2024.json',
      '/data-h2h-summary.json','/data-h2h-series.json'
    ];
    const parts=await Promise.all(files.map(f=>fetch(f).then(r=>{if(!r.ok)throw new Error(`Data ${r.status}: ${f}`);return r.json();})));
    DATA={...parts[0],managers:Object.assign({},...parts.slice(1,6)),h2h:parts[10],h2hSeries:parts[11]};
    const scoringHistory=Object.assign({},...parts.slice(6,10));
    applyScoringHistory(scoringHistory);
    normalizeCareerAggregates();
    router();
  } catch(err){ console.error(err); app.innerHTML=`<div class="notice">The Ranch data failed to load. ${err.message}</div>`; }
}

window.addEventListener('hashchange',router);
boot();
