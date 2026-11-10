/* Milestone Races — derived from canonical regular-season results. */
(function(){
  const categories=[
    {id:'wins',label:'Wins',step:10,unit:'wins',basis:'games'},
    {id:'losses',label:'Losses',step:10,unit:'losses',basis:'games'},
    {id:'points',label:'Points',step:1000,unit:'points',basis:'games'},
    {id:'winning',label:'Winning Seasons',step:1,unit:'winning seasons',basis:'seasons'}
  ];
  let selected='wins', selectedThreshold=null, showAll=false;
  const comma=n=>Number(n).toLocaleString('en-US');
  function data(){
    const ledger=DATA.h2hLedger||{};
    const complete=Number(ledger.throughCompleteSeason||0);
    const current=Number(ledger.currentSeason?.season||0),through=Number(ledger.currentSeason?.throughWeek||0);
    const byManager={};
    (ledger.games||[]).filter(g=>g.phase==='regular-season' &&
      (Number(g.season)<=complete || (Number(g.season)===current && Number(g.week)<=through)))
      .sort((a,b)=>a.season-b.season||a.week-b.week)
      .forEach(g=>{
        for(const side of ['A','B']){
          const key=g['manager'+side], score=Number(g['score'+side]);
          if(!Number.isFinite(score))continue;
          (byManager[key] ||= []).push({year:Number(g.season),week:Number(g.week),
            score,result:g['result'+side]});
        }
      });
    const races=[];
    for(const [key,games] of Object.entries(byManager)){
      let wins=0,losses=0,points=0;
      const progress=[], winning=[];
      games.forEach((g,i)=>{
        if(g.result==='W')wins++;
        if(g.result==='L')losses++;
        points=Math.round((points+g.score)*100)/100;
        progress.push({key,games:i+1,year:g.year,week:g.week,wins,losses,points});
        // Apply official 2012 totals at the season boundary. Any milestone first
        // reached at this correction gets a year but no specific week.
        if(g.year===2012 && (i===games.length-1 || games[i+1].year!==2012)){
          const official=DATA.managers?.[key]?.seasons?.find(s=>Number(s.year)===2012);
          const record=String(official?.record||'').match(/^(\d+)-(\d+)/);
          if(record){ wins=Number(record[1]); losses=Number(record[2]); }
          if(Number.isFinite(Number(official?.pf)) && official?.pf!=null)
            points=Math.round(Number(official.pf)*100)/100;
          progress.push({key,games:i+1,year:2012,week:null,wins,losses,points});
        }
      });
      const years=[...new Set(games.filter(g=>g.year<=complete).map(g=>g.year))].sort((a,b)=>a-b);
      let count=0;
      years.forEach((year,i)=>{
        const season=games.filter(g=>g.year===year);
        const w=season.filter(g=>g.result==='W').length;
        const l=season.filter(g=>g.result==='L').length;
        if(w>l){
          count++;
          winning.push({key,games:i+1,year,week:null,winning:count});
        }
      });
      races.push({progress,winning});
    }
    return races;
  }
  function paint(races){
    const root=document.getElementById('milestone-races');
    if(!root)return;
    const cat=categories.find(c=>c.id===selected);
    const histories=races.map(race=>selected==='winning'?race.winning:race.progress);
    const max=Math.floor(Math.max(0,...histories.flatMap(history=>history.map(row=>row[selected]))));
    if(selectedThreshold==null || selectedThreshold>max)
      selectedThreshold=Math.floor(max/cat.step)*cat.step || max;
    const ticks=[];
    const tickStep=selected==='points'?250:1;
    for(let value=tickStep;value<=max;value+=tickStep){
      const major=value%cat.step===0;
      const position=(value-1)/Math.max(1,max-1)*100;
      ticks.push(`<span class="milestone-tick${major?' is-major':''}" style="left:${position}%"></span>`);
    }
    root.innerHTML=`
      <div class="milestone-controls">
        <div class="milestone-tabs" role="group" aria-label="Milestone category">
          ${categories.map(c=>`<button type="button" class="milestone-tab ${c.id===selected?'is-active':''}" data-category="${c.id}" aria-pressed="${c.id===selected}">${c.label}</button>`).join('')}
        </div>
        ${max>0?`<div class="milestone-pick">
          <label for="milestone-value">Fastest to</label>
          <input id="milestone-value" type="number" inputmode="numeric" min="1" max="${max}" step="1" value="${selectedThreshold}" aria-label="Exact ${cat.unit} milestone">
          <span class="milestone-unit">${cat.unit}</span>
        </div>
        <div class="milestone-slider">
          <input id="milestone-range" type="range" min="1" max="${max}" step="1" value="${selectedThreshold}" aria-label="Choose ${cat.unit} milestone">
          <div class="milestone-ticks" aria-hidden="true">${ticks.join('')}</div>
          <div class="milestone-range-labels" aria-hidden="true"><span>1</span><span>${comma(max)}</span></div>
        </div>`:''}
      </div>
      <div class="milestone-results" aria-live="polite"></div>
      <p class="milestone-footnote">Ranked by fewest career ${cat.basis==='seasons'?'seasons':'regular-season games'} to reach the milestone. Ties share a rank.${selected==='winning'?' Winning seasons require more wins than losses. The current incomplete season is excluded.':''}${selected==='points'?' 2012 point milestones show the year only. Later totals use official 2012 points for.':''}</p>`;
    root.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{
      selected=b.dataset.category;selectedThreshold=null;showAll=false;paint(races);
      root.querySelector('.milestone-tab.is-active')?.focus();
    }));
    const results=root.querySelector('.milestone-results');
    if(max===0){results.innerHTML='<p class="milestone-empty">No completed milestones yet.</p>';return;}

    function paintResults(){
      const ranked=histories.map(history=>history.find(row=>row[selected]>=selectedThreshold))
        .filter(Boolean)
        .map(row=>selected==='points' && row.year===2012?{...row,week:null}:row)
        .sort((a,b)=>a.games-b.games||a.year-b.year||a.week-b.week||a.key.localeCompare(b.key));
      let rank=0,prior=0;
      const rows=ranked.map((row,i)=>{
        if(row.games!==prior){rank=i+1;prior=row.games;}
        return {...row,rank};
      });
      const shown=showAll?rows:rows.slice(0,5);
      results.innerHTML=`<div class="milestone-list">
        <div class="milestone-list-head"><span>Manager</span><span>${cat.basis==='seasons'?'Seasons':'Games'}</span></div>
        ${shown.map(row=>`<div class="milestone-row">
          <div class="milestone-person"><span class="milestone-rank">${row.rank}.</span><span class="milestone-name">${fullManagerName(row.key)}</span><span class="milestone-when">${row.year}${row.week==null?'':' · W'+row.week}</span></div>
          <strong class="milestone-count">${row.games}</strong>
        </div>`).join('')}
      </div>
      ${rows.length>5?`<button type="button" class="milestone-more" data-expand="1" aria-expanded="${showAll}">${showAll?'Show top 5':'View all '+rows.length+' managers'}</button>`:''}`;
    }

    const range=root.querySelector('#milestone-range');
    const number=root.querySelector('#milestone-value');
    const tickTrack=root.querySelector('.milestone-ticks');
    function setThreshold(value,syncNumber=true){
      const changed=value!==selectedThreshold;
      selectedThreshold=value;
      range.value=value;
      range.setAttribute('aria-valuetext',`${comma(value)} ${cat.unit}`);
      if(syncNumber)number.value=value;
      if(changed){showAll=false;paintResults();}
    }
    range.addEventListener('input',()=>setThreshold(range.valueAsNumber));
    range.addEventListener('pointerup',()=>{
      const nearest=Math.round(selectedThreshold/cat.step)*cat.step;
      const distance=Math.abs(nearest-selectedThreshold);
      const pixels=distance/Math.max(1,max-1)*tickTrack.clientWidth;
      if(nearest>=1 && nearest<=max && distance<=cat.step/10 && pixels<=4)
        setThreshold(nearest);
    });
    number.addEventListener('input',()=>{
      const value=number.valueAsNumber;
      if(Number.isInteger(value) && value>=1 && value<=max)setThreshold(value,false);
    });
    function commitNumber(){
      const value=number.valueAsNumber;
      setThreshold(Number.isFinite(value)?Math.min(max,Math.max(1,Math.round(value))):selectedThreshold);
    }
    number.addEventListener('change',commitNumber);
    number.addEventListener('keydown',event=>{
      if(event.key==='Enter'){event.preventDefault();commitNumber();}
    });
    results.addEventListener('click',event=>{
      if(!event.target.closest('[data-expand]'))return;
      showAll=!showAll;
      paintResults();
      results.querySelector('[data-expand]')?.focus();
    });
    setThreshold(selectedThreshold);
    paintResults();
  }
  const original=renderHome;
  renderHome=function(){
    original();
    const legacy=document.querySelector('.legacy-section');
    if(!legacy)return;
    const section=document.createElement('section');
    section.className='section milestone-section';
    section.innerHTML='<div class="home-lead-head"><h1>Milestone Races</h1></div><div class="panel milestone-panel" id="milestone-races"></div>';
    legacy.before(section);
    paint(data());
  };
})();
