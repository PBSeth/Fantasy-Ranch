// Career scoring-frequency records from completed regular-season matchup scores.
(function(){
  function addScoringFrequencyAwards(){
    const grid=document.querySelector('.highlights-grid');
    const ledger=DATA.h2hLedger;
    if(!grid||!ledger)return;
    const complete=Number(ledger.throughCompleteSeason||0);
    const current=Number(ledger.currentSeason?.season||0);
    const through=Number(ledger.currentSeason?.throughWeek||0);
    const counts=new Map();
    (ledger.games||[]).filter(g=>g.phase==='regular-season' &&
      (Number(g.season)<=complete||(Number(g.season)===current&&Number(g.week)<=through)))
      .forEach(g=>{
        for(const side of ['A','B']){
          const key=g['manager'+side];
          const raw=g['score'+side];
          if(raw==null||raw==='')continue;
          const score=Number(raw);
          if(!key||!Number.isFinite(score))continue;
          const row=counts.get(key)||{century:0,low:0};
          if(score>=100)row.century++;
          if(score<=50)row.low++;
          counts.set(key,row);
        }
      });
    if(!counts.size)return;
    const rows=[...counts].map(([key,counts])=>({key,...counts}));
    function award(label,field){
      const max=Math.max(...rows.map(x=>x[field]));
      const leaders=rows.filter(x=>x[field]===max).sort((a,b)=>a.key.localeCompare(b.key));
      const card=document.createElement('div');
      card.className='wall-high-card';
      const heading=document.createElement('div');heading.className='wall-high-label';heading.textContent=label;
      const value=document.createElement('div');value.className='wall-high-value';value.textContent=max.toLocaleString('en-US');
      const names=document.createElement('div');names.className='wall-high-name';
      names.textContent=leaders.map(x=>fullManagerName(x.key)).join(' / ');
      card.append(heading,value,names);
      return card;
    }
    grid.append(award('Most ≥100 Point Games','century'),award('Most ≤50 Point Games','low'));
  }
  const baseRenderHome=renderHome;
  renderHome=function(){baseRenderHome();addScoringFrequencyAwards();};
})();
