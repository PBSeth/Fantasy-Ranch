const app = document.getElementById('app');
const nav = document.getElementById('mainNav');
const navToggle = document.getElementById('navToggle');
let DATA;

navToggle?.addEventListener('click', () => nav.classList.toggle('open'));
nav?.addEventListener('click', () => nav.classList.remove('open'));

const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const winPct3 = v => v == null ? '—' : Number(v).toFixed(3).replace(/^0/, '');
const safe = v => v == null || v === '' ? '—' : v;
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const managerById = id => Object.values(DATA.managers).find(m => m.id === id);
const managerDisplay = m => m?.id === 'nickster' ? 'Nicholas Morris' : (m?.fullName || m?.name || '—');
const managerFromLabel = label => DATA.managers[label] || Object.values(DATA.managers).find(m => m.name === label || m.fullName === label);
const fullManagerName = label => managerDisplay(managerFromLabel(label)) || label;
const routeParts = () => location.hash.replace(/^#/, '').split('/').filter(Boolean);

function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name));
}

function managerRecord(m) {
  if (m?.id === 'diddles') return '95-83-1';
  if (m?.id === 'nickster') return '57-60-1';
  if (m.combinedRecord || m.record) return m.combinedRecord || m.record;
  const last = [...m.seasons].reverse().find(s => s.record);
  if (!last) return '—';
  if (last.cumulativeLosses == null) return last.record || '—';
  return `${last.cumulativeWins}-${last.cumulativeLosses}${last.cumulativeTies ? `-${last.cumulativeTies}` : ''}`;
}

function recordGames(record) {
  const match = String(record || '').match(/^(\d+)-(\d+)(?:-(\d+))?/);
  if (!match) return null;
  return Number(match[1]) + Number(match[2]) + Number(match[3] || 0);
}

function teamPpgForSeason(s) {
  if (s?.pf == null) return null;
  const games = recordGames(s.record);
  return games ? s.pf / games : null;
}

function starterCountForYear(year) {
  const raw = DATA?.champions?.[String(year)]?.avgPPGPlayer;
  if (!raw || !String(raw).includes('/')) return null;
  const [avgTeamPpg, avgPpgPerPlayer] = String(raw).split('/').map(Number);
  if (!Number.isFinite(avgTeamPpg) || !Number.isFinite(avgPpgPerPlayer) || avgPpgPerPlayer <= 0) return null;
  const ratio = avgTeamPpg / avgPpgPerPlayer;
  const starters = Math.round(ratio);
  if (starters <= 0 || Math.abs(ratio - starters) > 0.045) return null;
  return starters;
}

function ppgPerPlayerForSeason(s) {
  const teamPpg = teamPpgForSeason(s);
  const starters = starterCountForYear(s?.year);
  if (teamPpg == null || !starters) return null;
  return teamPpg / starters;
}

function cardManager(m) {
  return `<a class="manager-card" href="#manager/${m.id}">
    <div class="manager-top">
      <h3>${managerDisplay(m)}</h3>
      <span class="status ${m.active2025 ? '' : 'alumni'}">${m.active2025 ? 'Active' : 'Alumni'}</span>
    </div>
    <div class="mini-stats">
      <div><strong>${fmt.format(m.legacyScore || 0)}</strong><small>Legacy Score</small></div>
      <div><strong>${m.titles}</strong><small>Titles</small></div>
      <div><strong>${m.avgFinish ? fmt1.format(m.avgFinish) : '—'}</strong><small>Avg finish</small></div>
    </div>
    <div class="full-name">${safe(managerRecord(m))} • ${m.serviceTime || 0} seasons</div>
  </a>`;
}

function leaderboardRows(items, valueFn, label='') {
  return items.map((m,i) => `<a class="leader-row" href="#manager/${m.id}">
    <span class="rank-pill">${i+1}</span>
    <span class="leader-main"><strong>${managerDisplay(m)}</strong></span>
    <span class="leader-value">${valueFn(m)}${label ? `<small>${label}</small>` : ''}</span>
  </a>`).join('');
}

function currentManagers() { return DATA.currentManagers.map(n => DATA.managers[n]); }
function allManagers() { return [...DATA.currentManagers, ...DATA.alumni].map(n => DATA.managers[n]); }

function renderHome() {
  setActiveNav('home');
  const legacy = [...allManagers()].sort((a,b)=>(b.legacyScore||0)-(a.legacyScore||0));
  app.innerHTML = `<section class="home-lead"><div class="home-lead-head"><h1>Legacy Score</h1></div><div class="panel home-legacy-panel"><div class="leaderboard">${leaderboardRows(legacy, m => fmt.format(m.legacyScore))}</div></div></section>`;
}

function renderManagers() {
  setActiveNav('managers');
  const managers = [...allManagers()].sort((a,b)=>Number(b.active2025)-Number(a.active2025) || (b.legacyScore||0)-(a.legacyScore||0));
  app.innerHTML = `
    <section class="section managers-section">
      <div class="section-head"><h1 class="simple-page-title">Ranch Hands</h1></div>
      <div class="manager-grid">${managers.map(cardManager).join('')}</div>
    </section>`;
}

const metricDefs = {
  legacy: { label:'Legacy Score', value:s=>s.legacyScore, format:v=>fmt.format(v), invert:false },
  wins: { label:'Career Wins', value:s=>s.cumulativeWins, format:v=>fmt.format(v), invert:false },
  winpct: { label:'Win%', value:s=>s.cumulativeWinPctOfficial, format:v=>winPct3(v), invert:false },
  finish: { label:'Final Finish', value:s=>s.finish, format:v=>`#${Math.round(v)}`, invert:true }
};

function chartSVG(m, metricKey='legacy') {
  const def = metricDefs[metricKey];
  const points = m.seasons.map(s=>({s, v:def.value(s)})).filter(x=>x.v != null);
  if (!points.length) return `<div class="notice">No data available for this metric.</div>`;
  const W=760,H=410,pad={l:46,r:12,t:20,b:36};
  let vals=points.map(p=>p.v);
  let min=Math.min(...vals), max=Math.max(...vals);
  if (metricKey === 'winpct') {
    const extent = Math.max(Math.abs(max-.5), Math.abs(min-.5), .08);
    min=.5-extent; max=.5+extent;
  } else if (metricKey !== 'finish') {
    min=Math.min(0,min);
  }
  if (max===min) max=min+1;
  const x=i=>pad.l + (i/(Math.max(1,points.length-1)))*(W-pad.l-pad.r);
  const y=v=> def.invert ? pad.t + ((v-min)/(max-min))*(H-pad.t-pad.b) : pad.t + ((max-v)/(max-min))*(H-pad.t-pad.b);
  const coords=points.map((p,i)=>[x(i),y(p.v)]);
  const line=coords.map((c,i)=>`${i?'L':'M'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ');
  const area = (metricKey==='finish' || metricKey==='winpct') ? '' : `${line} L ${coords[coords.length-1][0].toFixed(1)} ${H-pad.b} L ${coords[0][0].toFixed(1)} ${H-pad.b} Z`;
  let grids='';
  for(let i=0;i<5;i++){
    const gy=pad.t + i*(H-pad.t-pad.b)/4;
    const val=def.invert ? min+(max-min)*i/4 : max-(max-min)*i/4;
    const baselineClass = metricKey==='winpct' && i===2 ? ' chart-grid-500' : '';
    grids += `<line class="chart-grid${baselineClass}" x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}"></line><text class="chart-axis-text${baselineClass}" x="${pad.l-7}" y="${gy+3}" text-anchor="end">${def.format(val)}</text>`;
  }
  const labels=points.map((p,i)=> {
    const current = p.s.year === DATA.meta.currentYear;
    const show = !current && (i===0 || p.s.year===DATA.meta.currentYear-1 || i%2===0);
    return show ? `<text class="chart-axis-text" x="${x(i)}" y="${H-10}" text-anchor="middle">${p.s.year}</text>`:'';
  }).join('');
  const dots=points.map((p,i)=>`<g><circle class="${p.s.champion ? 'chart-milestone':'chart-dot'}" cx="${x(i)}" cy="${y(p.v)}" r="${p.s.champion?6.5:3.8}"><title>${p.s.year}: ${def.format(p.v)}${p.s.champion?' • Champion':''}</title></circle></g>`).join('');

  let plottedLine;
  if (metricKey !== 'winpct') {
    plottedLine = `<path class="chart-line" d="${line}"></path>`;
  } else if (points.length === 1) {
    plottedLine = '';
  } else {
    const segments=[];
    for(let i=0;i<points.length-1;i++) {
      const p1=points[i], p2=points[i+1];
      const x1=x(i), y1=y(p1.v), x2=x(i+1), y2=y(p2.v);
      const side1=p1.v>=.5?'above':'below', side2=p2.v>=.5?'above':'below';
      if (side1===side2 || p1.v===p2.v) {
        segments.push(`<line class="chart-line-${side1}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`);
      } else {
        const t=(.5-p1.v)/(p2.v-p1.v);
        const cx=x1+(x2-x1)*t, cy=y(.5);
        segments.push(`<line class="chart-line-${side1}" x1="${x1}" y1="${y1}" x2="${cx}" y2="${cy}"></line>`);
        segments.push(`<line class="chart-line-${side2}" x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"></line>`);
      }
    }
    plottedLine=segments.join('');
  }

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${managerDisplay(m)} ${def.label} by season">${grids}${area?`<path class="chart-area" d="${area}"></path>`:''}${plottedLine}${dots}${labels}</svg>`;
}

function profileTable(m) {
  return m.seasons.filter(s=>s.record || s.finish).slice().reverse().map(s=>`<tr>
    <td><strong>${s.year}</strong></td><td class="cell-rank">${s.finish ? `#${s.finish}` : '—'}</td><td>${safe(s.record)}</td><td>${safe(s.playoffRecord)}</td><td>${s.pf != null ? fmt1.format(s.pf) : '—'}</td><td>${s.pa != null ? fmt1.format(s.pa) : '—'}</td>
  </tr>`).join('');
}
