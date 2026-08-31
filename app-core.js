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
const managerDisplay = m => m?.id === 'diddles' ? 'Matt Diddle' : (m?.id === 'ty-molly' ? 'Tyler Schmidt' : (m?.id === 'nickster' ? 'Nicholas Morris' : (m?.id === 'dick' ? 'Nick Thompson' : (m?.fullName || m?.name || '—'))));
const managerFromLabel = label => DATA.managers[label] || Object.values(DATA.managers).find(m => m.name === label || m.fullName === label || (m.id === 'dick' && label === 'Nick Thompson') || (m.id === 'diddles' && label === 'Matt Diddle') || (m.id === 'ty-molly' && label === 'Tyler Schmidt'));
const fullManagerName = label => managerDisplay(managerFromLabel(label)) || label;
const routeParts = () => location.hash.replace(/^#/, '').split('/').filter(Boolean);

function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name));
}

function managerRecord(m) {
  if (m?.id === 'seth') return '97-82';
  if (m?.id === 'diddles') return '95-83-1';
  if (m?.id === 'nickster') return '57-60-1';
  if (m?.id === 'ty-molly') return '89-90';
  if (m?.id === 'payton') return '100-79';
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

function seasonWins(s) {
  const match = String(s?.record || '').match(/^(\d+)-(\d+)(?:-(\d+))?/);
  return match ? Number(match[1]) : null;
}

function teamPpgForSeason(s) {
  if (s?.pfGame != null) return s.pfGame;
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

function applyScoringHistory(history) {
  Object.entries(history || {}).forEach(([year, rows]) => {
    (rows || []).forEach(row => {
      const manager = DATA.managers[row.manager];
      const season = manager?.seasons?.find(s => s.year === Number(year));
      if (!season) {
        console.warn('Scoring row did not match Ranch history', year, row.manager, row.teamName);
        return;
      }
      season.teamName = row.teamName;
      season.pf = row.pf;
      season.pa = row.pa;
      season.pfGame = row.pfGame;
      season.paGame = row.paGame;
      season.diffGame = row.diffGame;
      season.scoringSourceRecord = row.sourceRecord;
    });
  });
}

function cardManager(m) {
  return `<a class="manager-card" href="#manager/${m.id}">
    <div class="manager-top">
      <h3>${managerDisplay(m)}</h3>
      <span class="status ${m.active2025 ? '' : 'alumni'}">${m.active2025 ? 'Active' : 'RIP'}</span>
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

function leagueSizeForYear(year) {
  return allManagers().reduce((count,m) => {
    const season=(m.seasons || []).find(s=>s.year===Number(year));
    return count + (season && (season.record || season.finish) ? 1 : 0);
  },0);
}

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
      <div class="section-head"><h1 class="simple-page-title">Managers</h1></div>
      <div class="manager-grid">${managers.map(cardManager).join('')}</div>
    </section>`;
}

const metricDefs = {
  legacy: { label:'Legacy Score', value:s=>s.legacyScore, format:v=>fmt.format(v), invert:false, min:0, max:2500, ticks:[0,500,1000,1500,2000,2500] },
  wins: { label:'Season Wins', value:s=>seasonWins(s), format:v=>fmt.format(v), invert:false, min:0, max:14, ticks:[0,2,4,6,8,10,12,14] },
  pfpa: { label:'PF/PA' },
  winpct: { label:'Win%', value:s=>s.cumulativeWinPctOfficial, format:v=>winPct3(v), invert:false, min:.25, max:.75, ticks:[.25,.375,.5,.625,.75] },
  finish: { label:'Final Finish', value:s=>s.finish, format:v=>`${Math.round(v)}`, invert:true }
};

function pfpaChartSVG(m) {
  const points=(m.seasons || []).filter(s=>s.pf!=null && s.pa!=null).sort((a,b)=>a.year-b.year);
  if (!points.length) return `<div class="notice">No PF/PA data available.</div>`;
  const W=760,H=410,pad={l:58,r:12,t:28,b:40};
  const maxRaw=Math.max(...points.flatMap(s=>[s.pf,s.pa]));
  const step=maxRaw>2000?500:250;
  const max=Math.ceil(maxRaw/step)*step;
  const y=v=>pad.t+((max-v)/max)*(H-pad.t-pad.b);
  const groupW=(W-pad.l-pad.r)/points.length;
  const barGap=Math.max(2,Math.min(5,groupW*.07));
  const barW=Math.max(4,Math.min(18,(groupW-barGap*3)/2));
  const ticks=[];
  for(let v=0;v<=max;v+=step) ticks.push(v);
  let grids='';
  ticks.forEach(val=>{
    const gy=y(val);
    grids+=`<line class="chart-grid" x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}"></line><text class="chart-axis-text" x="${pad.l-8}" y="${gy+4}" text-anchor="end">${fmt.format(val)}</text>`;
  });
  const bars=points.map((s,i)=>{
    const center=pad.l+groupW*(i+.5);
    const pfX=center-barW-barGap/2;
    const paX=center+barGap/2;
    const pfY=y(s.pf), paY=y(s.pa);
    const base=H-pad.b;
    return `<g>
      <rect class="chart-bar-pf" x="${pfX.toFixed(1)}" y="${pfY.toFixed(1)}" width="${barW.toFixed(1)}" height="${(base-pfY).toFixed(1)}" rx="2"><title>${s.year} PF: ${fmt1.format(s.pf)}</title></rect>
      <rect class="chart-bar-pa" x="${paX.toFixed(1)}" y="${paY.toFixed(1)}" width="${barW.toFixed(1)}" height="${(base-paY).toFixed(1)}" rx="2"><title>${s.year} PA: ${fmt1.format(s.pa)}</title></rect>
      <text class="chart-axis-text" x="${center.toFixed(1)}" y="${H-11}" text-anchor="middle">${s.year}</text>
    </g>`;
  }).join('');
  const legend=`<g class="pfpa-legend" transform="translate(${pad.l},10)"><rect class="chart-bar-pf" x="0" y="0" width="11" height="11" rx="2"></rect><text class="chart-axis-text" x="16" y="10">PF</text><rect class="chart-bar-pa" x="48" y="0" width="11" height="11" rx="2"></rect><text class="chart-axis-text" x="64" y="10">PA</text></g>`;
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${managerDisplay(m)} points for and points against by season">${grids}${bars}${legend}</svg>`;
}

function chartSVG(m, metricKey='legacy') {
  if (metricKey==='pfpa') return pfpaChartSVG(m);
  const def = metricDefs[metricKey];
  const points = m.seasons.map(s=>({s, v:def.value(s)})).filter(x=>x.v != null);
  if (!points.length) return `<div class="notice">No data available for this metric.</div>`;
  const W=760,H=410,pad={l:metricKey==='winpct'?64:52,r:12,t:20,b:36};
  const vals=points.map(p=>p.v);
  let min=def.min ?? Math.min(...vals), max=def.max ?? Math.max(...vals);
  const threshold = metricKey === 'winpct' ? .5 : null;
  if (metricKey === 'finish') {
    min=1;
    const fieldSizes=points.map(p=>leagueSizeForYear(p.s.year)).filter(n=>n>0);
    max=Math.max(...vals, ...(fieldSizes.length ? fieldSizes : [12]));
  }
  if (max===min) max=min+1;
  const x=i=>pad.l + (i/(Math.max(1,points.length-1)))*(W-pad.l-pad.r);
  const y=v=> def.invert ? pad.t + ((v-min)/(max-min))*(H-pad.t-pad.b) : pad.t + ((max-v)/(max-min))*(H-pad.t-pad.b);
  const coords=points.map((p,i)=>[x(i),y(p.v)]);
  const line=coords.map((c,i)=>`${i?'L':'M'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ');
  const area = (metricKey==='finish' || threshold!=null) ? '' : `${line} L ${coords[coords.length-1][0].toFixed(1)} ${H-pad.b} L ${coords[0][0].toFixed(1)} ${H-pad.b} Z`;
  const tickValues = def.ticks || Array.from({length:5},(_,i)=>def.invert ? min+(max-min)*i/4 : max-(max-min)*i/4);
  let grids='';
  tickValues.forEach(val=>{
    const gy=y(val);
    const baselineClass = threshold!=null && Math.abs(val-threshold)<.000001 ? ' chart-grid-500' : '';
    grids += `<line class="chart-grid${baselineClass}" x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}"></line><text class="chart-axis-text${baselineClass}" x="${pad.l-8}" y="${gy+4}" text-anchor="end">${def.format(val)}</text>`;
  });
  const labels=points.map((p,i)=> {
    const current = p.s.year === DATA.meta.currentYear;
    const show = !current && (i===0 || p.s.year===DATA.meta.currentYear-1 || i%2===0);
    return show ? `<text class="chart-axis-text" x="${x(i)}" y="${H-10}" text-anchor="middle">${p.s.year}</text>`:'';
  }).join('');
  const dots=points.map((p,i)=>`<g><circle class="${p.s.champion ? 'chart-milestone':'chart-dot'}" cx="${x(i)}" cy="${y(p.v)}" r="${p.s.champion?6.5:3.8}"><title>${p.s.year}: ${def.format(p.v)}${p.s.champion?' • Champion':''}</title></circle></g>`).join('');

  let plottedLine;
  if (threshold == null) {
    plottedLine = `<path class="chart-line" d="${line}"></path>`;
  } else if (points.length === 1) {
    plottedLine = '';
  } else {
    const segments=[];
    for(let i=0;i<points.length-1;i++) {
      const p1=points[i], p2=points[i+1];
      const x1=x(i), y1=y(p1.v), x2=x(i+1), y2=y(p2.v);
      const side1=p1.v>=threshold?'above':'below', side2=p2.v>=threshold?'above':'below';
      if (side1===side2 || p1.v===p2.v) {
        segments.push(`<line class="chart-line-${side1}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`);
      } else {
        const t=(threshold-p1.v)/(p2.v-p1.v);
        const cx=x1+(x2-x1)*t, cy=y(threshold);
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
    <td><strong>${s.year}</strong></td><td class="cell-rank">${s.finish ? `${s.finish}` : '—'}</td><td>${safe(s.record)}</td><td>${safe(s.playoffRecord)}</td><td>${s.pf != null ? fmt1.format(s.pf) : '—'}</td><td>${s.pa != null ? fmt1.format(s.pa) : '—'}</td>
  </tr>`).join('');
}