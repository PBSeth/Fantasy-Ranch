// Longest regular-season game streaks for the Wall of Fame.
// Streaks may cross season boundaries; ties break both winning and losing streaks.
(function () {
  function managerGames() {
    const through=Number(DATA.h2hLedger?.throughCompleteSeason || 0);
    const out={};
    (DATA.h2hLedger?.games || [])
      .filter(g=>g.phase==='regular-season' && Number(g.season)<=through)
      .forEach(g=>{
        (out[g.managerA] ||= []).push({season:Number(g.season),week:Number(g.week),result:g.resultA});
        (out[g.managerB] ||= []).push({season:Number(g.season),week:Number(g.week),result:g.resultB});
      });
    Object.values(out).forEach(rows=>rows.sort((a,b)=>a.season-b.season || a.week-b.week));
    return out;
  }

  function longest(target) {
    let best=null;
    Object.entries(managerGames()).forEach(([manager,rows])=>{
      let count=0,start=null;
      rows.forEach(row=>{
        if(row.result===target) {
          if(count===0) start=row;
          count+=1;
          if(!best || count>best.count) best={manager,count,start,end:row};
        } else {
          count=0;
          start=null;
        }
      });
    });
    return best;
  }

  function detail(row) {
    if(!row) return '';
    if(row.start.season===row.end.season) return `${row.start.season} W${row.start.week}–W${row.end.week}`;
    return `${row.start.season} W${row.start.week}–${row.end.season} W${row.end.week}`;
  }

  function card(title,row) {
    const manager=managerFromLabel(row?.manager);
    return `<div class="wall-high-card">
      <div class="wall-high-label">${title}</div>
      <div class="wall-high-value">${row?.count ?? '—'}</div>
      <div class="wall-high-name">${manager ? compactManagerName(manager) : (row?.manager || '—')}</div>
      <div class="wall-high-detail">${detail(row)}</div>
    </div>`;
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    const grid=document.querySelector('.highlights-grid');
    if(!grid) return;
    grid.insertAdjacentHTML('beforeend',card('Longest Winning Streak',longest('W')));
    grid.insertAdjacentHTML('beforeend',card('Longest Losing Streak',longest('L')));
  };
})();
