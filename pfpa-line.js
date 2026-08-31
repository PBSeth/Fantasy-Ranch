pfpaChartSVG = function(m) {
  const points=(m.seasons || []).filter(s=>s.pf!=null && s.pa!=null).sort((a,b)=>a.year-b.year);
  if (!points.length) return `<div class="notice">No PF/PA data available.</div>`;

  const W=760,H=460,pad={l:58,r:12,t:30,b:36};
  const leagueValues=allManagers().flatMap(manager=>(manager.seasons || []).flatMap(s=>[
    s.pf!=null ? Number(s.pf) : null,
    s.pa!=null ? Number(s.pa) : null
  ])).filter(Number.isFinite);
  const scaleValues=leagueValues.length ? leagueValues : points.flatMap(s=>[Number(s.pf),Number(s.pa)]);
  const step=250;
  let min=Math.floor(Math.min(...scaleValues)/step)*step;
  let max=Math.ceil(Math.max(...scaleValues)/step)*step;
  if (max===min) max=min+step;

  const x=i=>pad.l + (i/(Math.max(1,points.length-1)))*(W-pad.l-pad.r);
  const y=v=>pad.t + ((max-v)/(max-min))*(H-pad.t-pad.b);
  const pfCoords=points.map((s,i)=>[x(i),y(Number(s.pf))]);
  const paCoords=points.map((s,i)=>[x(i),y(Number(s.pa))]);
  const pathFor=coords=>coords.map((c,i)=>`${i?'L':'M'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ');

  let grids='';
  for(let val=min;val<=max;val+=step) {
    const gy=y(val);
    grids+=`<line class="chart-grid" x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}"></line><text class="chart-axis-text" x="${pad.l-8}" y="${gy+4}" text-anchor="end">${fmt.format(val)}</text>`;
  }

  const labels=points.map((s,i)=>{
    const current=s.year===DATA.meta.currentYear;
    const show=!current && (i===0 || s.year===DATA.meta.currentYear-1 || i%2===0);
    return show ? `<text class="chart-axis-text" x="${x(i)}" y="${H-10}" text-anchor="middle">${s.year}</text>` : '';
  }).join('');

  const pfDots=points.map((s,i)=>`<circle class="${s.champion?'chart-milestone':'chart-dot-pf'}" cx="${x(i)}" cy="${y(Number(s.pf))}" r="${s.champion?6.5:3.8}"><title>${s.year} PF: ${fmt1.format(s.pf)}${s.champion?' • Champion':''}</title></circle>`).join('');
  const paDots=points.map((s,i)=>`<circle class="chart-dot-pa" cx="${x(i)}" cy="${y(Number(s.pa))}" r="3.8"><title>${s.year} PA: ${fmt1.format(s.pa)}</title></circle>`).join('');

  const legend=`<g class="pfpa-legend" transform="translate(${pad.l},11)">
    <line class="chart-line-pf" x1="0" y1="0" x2="18" y2="0"></line><circle class="chart-dot-pf" cx="9" cy="0" r="3"></circle><text class="chart-axis-text" x="25" y="4">PF</text>
    <line class="chart-line-pa" x1="58" y1="0" x2="76" y2="0"></line><circle class="chart-dot-pa" cx="67" cy="0" r="3"></circle><text class="chart-axis-text" x="83" y="4">PA</text>
  </g>`;

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${managerDisplay(m)} points for and points against by season">${grids}<path class="chart-line-pf" d="${pathFor(pfCoords)}"></path><path class="chart-line-pa" d="${pathFor(paCoords)}"></path>${pfDots}${paDots}${labels}${legend}</svg>`;
};
