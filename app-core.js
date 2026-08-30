const app = document.getElementById('app');
const nav = document.getElementById('mainNav');
const navToggle = document.getElementById('navToggle');
let DATA;

navToggle?.addEventListener('click', () => nav.classList.toggle('open'));
nav?.addEventListener('click', () => nav.classList.remove('open'));

const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct = v => v == null ? '—' : `${(v * 100).toFixed(1)}%`;
const safe = v => v == null || v === '' ? '—' : v;
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const managerById = id => Object.values(DATA.managers).find(m => m.id === id);
const routeParts = () => location.hash.replace(/^#/, '').split('/').filter(Boolean);

function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name));
}

function managerRecord(m) {
  if (m.combinedRecord || m.record) return m.combinedRecord || m.record;
  const last = [...m.seasons].reverse().find(s => s.record);
  if (!last) return '—';
  if (last.cumulativeLosses == null) return last.record || '—';
  return `${last.cumulativeWins}-${last.cumulativeLosses}${last.cumulativeTies ? `-${last.cumulativeTies}` : ''}`;
}

function cardManager(m) {
  return `<a class="manager-card" href="#manager/${m.id}">
    <div class="manager-top">
      <div><h3>${m.name}</h3><div class="full-name">${m.fullName}</div></div>
      <span class="status ${m.active2025 ? '' : 'alumni'}">${m.active2025 ? 'Active' : 'Alumni'}</span>
    </div>
    <div class="mini-stats">
      <div><strong>${fmt.format(m.legacyScore || 0)}</strong><small>Legacy</small></div>
      <div><strong>${m.titles}</strong><small>Titles</small></div>
      <div><strong>${m.avgFinish ? fmt1.format(m.avgFinish) : '—'}</strong><small>Avg finish</small></div>
    </div>
    <div class="full-name">${safe(managerRecord(m))} • ${m.serviceTime || 0} seasons</div>
  </a>`;
}

function leaderboardRows(items, valueFn, label) {
  return items.map((m,i) => `<a class="leader-row" href="#manager/${m.id}">
    <span class="rank-pill">${i+1}</span>
    <span class="leader-main"><strong>${m.name}</strong><small>${m.fullName}</small></span>
    <span class="leader-value">${valueFn(m)}<small>${label}</small></span>
  </a>`).join('');
}

function currentManagers() { return DATA.currentManagers.map(n => DATA.managers[n]); }
function allManagers() { return [...DATA.currentManagers, ...DATA.alumni].map(n => DATA.managers[n]); }

function renderHome() {
  setActiveNav('home');
  const curr = currentManagers();
  const legacy = [...curr].sort((a,b)=>(b.legacyScore||0)-(a.legacyScore||0));
  const titles = [...curr].sort((a,b)=>b.titles-a.titles || (b.legacyScore||0)-(a.legacyScore||0));
  const champ25 = DATA.champions['2025'];
  const pointsLeader = Object.entries(DATA.scoring2025).sort((a,b)=>b[1].pf-a[1].pf)[0];
  const champs = Object.entries(DATA.champions).sort((a,b)=>Number(b[0])-Number(a[0]));
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">2012–2025 • League history</p>
        <h1>Fourteen years of bad decisions.</h1>
        <p class="hero-lede">The permanent Fantasy Ranch archive: championships, standings, manager histories, scoring, and the one thing the big fantasy platforms never gave us — a Legacy Score that compounds every year.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#managers">Meet the managers</a><a class="btn btn-secondary" href="#records">View records</a></div>
      </div>
      <div class="logo-stage"><img src="/assets/fantasy-ranch-logo.svg" alt="Fantasy Ranch marquee logo"></div>
    </section>

    <section class="section">
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Legacy leader</div><div class="kpi-value">${legacy[0].name}</div><div class="kpi-sub">${fmt.format(legacy[0].legacyScore)} legacy points</div></div>
        <div class="kpi"><div class="kpi-label">Most titles</div><div class="kpi-value">${titles[0].name}</div><div class="kpi-sub">${titles[0].titles} championships</div></div>
        <div class="kpi"><div class="kpi-label">2025 champion</div><div class="kpi-value">${champ25.manager}</div><div class="kpi-sub">First Ranch title in Year 1</div></div>
        <div class="kpi"><div class="kpi-label">2025 points leader</div><div class="kpi-value">${pointsLeader[0]}</div><div class="kpi-sub">${pointsLeader[1].pf.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} PF</div></div>
      </div>
    </section>

    <section class="section two-col">
      <div class="panel">
        <div class="panel-pad panel-title"><h3>Legacy board</h3><a class="text-link" href="#records">Full records →</a></div>
        <div class="leaderboard">${leaderboardRows(legacy.slice(0,7), m => fmt.format(m.legacyScore), 'Legacy')}</div>
      </div>
      <div class="panel">
        <div class="panel-pad panel-title"><h3>2025 scoring</h3><small>PF / PA</small></div>
        <div class="leaderboard">${Object.entries(DATA.scoring2025).sort((a,b)=>b[1].pf-a[1].pf).slice(0,7).map(([name,s],i)=>`<a class="leader-row" href="#manager/${DATA.managers[name]?.id || slug(name)}"><span class="rank-pill">${i+1}</span><span class="leader-main"><strong>${name}</strong><small>${s.wins}-${s.losses} • ${s.finish === 1 ? 'Champion' : `Finish ${s.finish}`}</small></span><span class="leader-value">${fmt.format(s.pf)}<small>PF</small></span></a>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><p class="eyebrow">The wall</p><h2>Champions</h2></div><p>Every Ranch champion, back to 2012.</p></div>
      <div class="champion-strip">${champs.map(([year,c])=>`<div class="champ-card"><div class="champ-year">${year}</div><div class="champ-manager">${c.manager}</div><div class="champ-pick">Draft anchor: ${safe(c.playerPicked)}${c.draftPosition != null ? ` • ${c.draftPosition}` : ''}</div></div>`).join('')}</div>
    </section>`;
}

function renderManagers() {
  setActiveNav('managers');
  const current = currentManagers();
  const alumni = DATA.alumni.map(n => DATA.managers[n]);
  app.innerHTML = `
    <header class="page-head"><p class="eyebrow">Manager archive</p><h1>Everybody leaves a trail.</h1><p>Career records, finishes, titles and a season-by-season Legacy Curve. Current managers first; the old guard stays in the archive.</p></header>
    <section class="section"><div class="section-head"><h2>Current Ranch</h2><p>${current.length} managers • 2025</p></div><div class="manager-grid">${current.map(cardManager).join('')}</div></section>
    <section class="section"><div class="section-head"><h2>Alumni</h2><p>Former managers preserved in the same history.</p></div><div class="manager-grid">${alumni.map(cardManager).join('')}</div></section>`;
}

const metricDefs = {
  legacy: { label:'Legacy Score', value:s=>s.legacyScore, format:v=>fmt.format(v), invert:false },
  wins: { label:'Career Wins', value:s=>s.cumulativeWins, format:v=>fmt.format(v), invert:false },
  winpct: { label:'Win %', value:s=>s.cumulativeWinPctOfficial != null ? s.cumulativeWinPctOfficial*100 : null, format:v=>`${v.toFixed(1)}%`, invert:false },
  finish: { label:'Final Finish', value:s=>s.finish, format:v=>`#${v}`, invert:true }
};

function chartSVG(m, metricKey='legacy') {
  const def = metricDefs[metricKey];
  let points = m.seasons.map(s=>({s, v:def.value(s)})).filter(x=>x.v != null);
  if (!points.length) return `<div class="notice">No data available for this metric.</div>`;
  const W=780,H=310,pad={l:46,r:18,t:20,b:36};
  let vals=points.map(p=>p.v);
  let min=Math.min(...vals), max=Math.max(...vals);
  if (metricKey !== 'finish') { min=Math.min(0,min); }
  if (max===min) max=min+1;
  const x=i=>pad.l + (i/(Math.max(1,points.length-1)))*(W-pad.l-pad.r);
  const y=v=> def.invert ? pad.t + ((v-min)/(max-min))*(H-pad.t-pad.b) : pad.t + ((max-v)/(max-min))*(H-pad.t-pad.b);
  const coords=points.map((p,i)=>[x(i),y(p.v)]);
  const line=coords.map((c,i)=>`${i?'L':'M'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ');
  const area = metricKey==='finish' ? '' : `${line} L ${coords[coords.length-1][0].toFixed(1)} ${H-pad.b} L ${coords[0][0].toFixed(1)} ${H-pad.b} Z`;
  let grids='';
  for(let i=0;i<5;i++){
    const gy=pad.t + i*(H-pad.t-pad.b)/4;
    const val=def.invert ? min+(max-min)*i/4 : max-(max-min)*i/4;
    grids += `<line class="chart-grid" x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}"></line><text class="chart-axis-text" x="${pad.l-7}" y="${gy+3}" text-anchor="end">${def.format(val)}</text>`;
  }
  const labels=points.map((p,i)=> (i===0||i===points.length-1||i%2===0) ? `<text class="chart-axis-text" x="${x(i)}" y="${H-10}" text-anchor="middle">${p.s.year}</text>`:'').join('');
  const dots=points.map((p,i)=>`<g><circle class="${p.s.champion ? 'chart-milestone':'chart-dot'}" cx="${x(i)}" cy="${y(p.v)}" r="${p.s.champion?6:4}"><title>${p.s.year}: ${def.format(p.v)}${p.s.champion?' • Champion':''}</title></circle></g>`).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${m.name} ${def.label} by season">${grids}${area?`<path class="chart-area" d="${area}"></path>`:''}<path class="chart-line" d="${line}"></path>${dots}${labels}</svg>`;
}

function profileTable(m) {
  return m.seasons.filter(s=>s.record || s.finish).slice().reverse().map(s=>`<tr>
    <td><strong>${s.year}</strong></td><td class="cell-rank ${s.champion?'champ':''}">${s.finish ? `#${s.finish}` : '—'}${s.champion?' 🏆':''}</td><td>${safe(s.record)}</td><td>${safe(s.playoffRecord)}</td><td>${s.legacyScore ? fmt.format(s.legacyScore) : '—'}</td><td>${s.pf != null ? fmt1.format(s.pf) : '—'}</td><td>${s.pa != null ? fmt1.format(s.pa) : '—'}</td>
  </tr>`).join('');
}
