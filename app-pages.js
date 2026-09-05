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

function renderManager(id) {
  setActiveNav('managers');
  const m=managerById(id);
  if (!m) return renderNotFound();
  const careerPF=(m.seasons || []).reduce((sum,s)=>sum+(Number.isFinite(Number(s.pf))?Number(s.pf):0),0);
  const careerPA=(m.seasons || []).reduce((sum,s)=>sum+(Number.isFinite(Number(s.pa))?Number(s.pa):0),0);
  const hasCareerPF=(m.seasons || []).some(s=>s.pf!=null && Number.isFinite(Number(s.pf)));
  const hasCareerPA=(m.seasons || []).some(s=>s.pa!=null && Number.isFinite(Number(s.pa)));
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
    <section class="section">
      <div class="section-head"><h2>Year by year</h2></div>
      <div class="table-wrap"><table><thead><tr><th>Year</th><th>Finish</th><th>Reg. record</th><th>Playoffs</th><th>PF</th><th>PA</th></tr></thead><tbody>${profileTable(m)}</tbody></table></div>
    </section>`;
  document.getElementById('metricTabs')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-metric]'); if(!b) return;
    document.querySelectorAll('.metric-tab[data-metric]').forEach(x=>x.classList.toggle('active',x===b));
    document.getElementById('chartWrap').innerHTML=chartSVG(m,b.dataset.metric);
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
      '/data-scoring-2012-2015.json','/data-scoring-2016-2018.json','/data-scoring-2019-2021.json','/data-scoring-2022-2024.json'
    ];
    const parts=await Promise.all(files.map(f=>fetch(f).then(r=>{if(!r.ok)throw new Error(`Data ${r.status}: ${f}`);return r.json();})));
    DATA={...parts[0],managers:Object.assign({},...parts.slice(1,6))};
    const scoringHistory=Object.assign({},...parts.slice(6));
    applyScoringHistory(scoringHistory);
    normalizeCareerAggregates();
    router();
  } catch(err){ console.error(err); app.innerHTML=`<div class="notice">The Ranch data failed to load. ${err.message}</div>`; }
}

window.addEventListener('hashchange',router);
boot();
