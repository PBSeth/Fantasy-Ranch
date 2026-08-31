chartSVG = function(m, metricKey='legacy') {
  if (metricKey==='pfpa') return pfpaChartSVG(m);
  const def = metricDefs[metricKey];
  const points = m.seasons.map(s=>({s, v:def.value(s)})).filter(x=>x.v != null);
  if (!points.length) return `<div class="notice">No data available for this metric.</div>`;
  const W=700,H=420,pad={l:metricKey==='winpct'?62:54,r:8,t:20,b:34};
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
    grids += `<line class="chart-grid${baselineClass}" x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}"></line><text class="chart-axis-text chart-y-label${baselineClass}" x="${pad.l-8}" y="${gy+5}" text-anchor="end">${def.format(val)}</text>`;
  });
  const labels=points.map((p,i)=> {
    const current = p.s.year === DATA.meta.currentYear;
    const show = !current && (i===0 || p.s.year===DATA.meta.currentYear-1 || i%2===0);
    return show ? `<text class="chart-axis-text chart-year-label" x="${x(i)}" y="${H-9}" text-anchor="middle">${p.s.year}</text>`:'';
  }).join('');
  const dots=points.map((p,i)=>`<g><circle class="${p.s.champion ? 'chart-milestone':'chart-dot'}" cx="${x(i)}" cy="${y(p.v)}" r="${p.s.champion?6.8:4.2}"><title>${p.s.year}: ${def.format(p.v)}${p.s.champion?' • Champion':''}</title></circle></g>`).join('');

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

  const border=`<rect class="chart-plot-border" x="${pad.l}" y="${pad.t}" width="${W-pad.l-pad.r}" height="${H-pad.t-pad.b}" rx="2"></rect>`;
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${managerDisplay(m)} ${def.label} by season">${border}${grids}${area?`<path class="chart-area" d="${area}"></path>`:''}${plottedLine}${dots}${labels}</svg>`;
};
