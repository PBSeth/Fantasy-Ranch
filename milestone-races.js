/* Milestone Races — derived from canonical regular-season results. */
(function(){
  const categories=[
    {id:'wins',label:'Wins',step:10,unit:'wins',basis:'games'},
    {id:'points',label:'Points',step:1000,unit:'points',basis:'games'},
    {id:'winning',label:'Winning Seasons',step:1,unit:'winning seasons',basis:'seasons'},
    {id:'century',label:'100+ Point Games',step:10,unit:'100+ point games',basis:'games'}
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
    const results={wins:[],points:[],winning:[],century:[]};
    for(const [key,games] of Object.entries(byManager)){
      let wins=0,points=0,century=0;
      const milestones={wins:{},points:{},century:{},winning:{}};
      games.forEach((g,i)=>{
        if(g.result==='W')wins++;
        points=Math.round((points+g.score)*100)/100;
        if(g.score>=100)century++;
        for(const [type,value,step] of [['wins',wins,10],['points',points,1000],['century',century,10]]){
          const limit=Math.floor(value/step)*step;
          for(let n=step;n<=limit;n+=step)if(!milestones[type][n])
            milestones[type][n]={key,games:i+1,year:g.year,week:g.week};
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
          milestones.winning[count]={key,games:i+1,year,week:null};
        }
      });
      for(const type of Object.keys(milestones))
        for(const [n,row] of Object.entries(milestones[type]))results[type].push({...row,threshold:Number(n)});
    }
    return results;
  }
  function paint(){
    const root=document.getElementById('milestone-races');
    if(!root)return;
    const all=data(),cat=categories.find(c=>c.id===selected);
    const entries=all[selected]||[];
    const max=Math.max(0,...entries.map(x=>x.threshold));
    const options=Array.from({length:max/cat.step},(_,i)=>max-i*cat.step);
    if(!options.length){root.innerHTML='<p class="milestone-empty">No completed milestones yet.</p>';return;}
    if(!options.includes(selectedThreshold))selectedThreshold=max;
    const ranked=entries.filter(x=>x.threshold===selectedThreshold).sort((a,b)=>a.games-b.games||a.year-b.year||a.week-b.week||a.key.localeCompare(b.key));
    let rank=0,prior=0;
    const rows=ranked.map((x,i)=>{if(x.games!==prior){rank=i+1;prior=x.games;}return {...x,rank};});
    const shown=showAll?rows:rows.slice(0,5);
    root.innerHTML=`
      <div class="milestone-controls">
        <div class="milestone-tabs" role="group" aria-label="Milestone category">
          ${categories.map(c=>`<button type="button" class="milestone-tab ${c.id===selected?'is-active':''}" data-category="${c.id}" aria-pressed="${c.id===selected}">${c.label}</button>`).join('')}
        </div>
        <div class="milestone-pick">
          <label for="milestone-select">Fastest to</label>
          <select id="milestone-select" aria-label="Choose milestone">
            ${options.map(n=>`<option value="${n}" ${n===selectedThreshold?'selected':''}>${comma(n)} ${cat.unit}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="milestone-list" aria-live="polite">
        <div class="milestone-list-head"><span>Manager</span><span>${cat.basis==='seasons'?'Seasons':'Games'}</span></div>
        ${shown.map(x=>`<div class="milestone-row">
          <div class="milestone-person"><span class="milestone-rank">${x.rank}.</span><span class="milestone-name">${fullManagerName(x.key)}</span><span class="milestone-when">${x.year}${x.week==null?'':' · W'+x.week}</span></div>
          <strong class="milestone-count">${x.games}</strong>
        </div>`).join('')}
      </div>
      ${rows.length>5?`<button type="button" class="milestone-more" data-expand="1">${showAll?'Show top 5':'View all '+rows.length+' managers'}</button>`:''}
      <p class="milestone-footnote">Ranked by fewest career ${cat.basis==='seasons'?'seasons':'regular-season games'} to reach the milestone. Ties share a rank.${selected==='winning'?' Winning seasons require more wins than losses; current incomplete seasons excluded.':''}</p>`;
    root.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{
      selected=b.dataset.category;selectedThreshold=null;showAll=false;paint();
    }));
    root.querySelector('#milestone-select')?.addEventListener('change',e=>{
      selectedThreshold=Number(e.target.value);showAll=false;paint();
    });
    root.querySelector('[data-expand]')?.addEventListener('click',()=>{showAll=!showAll;paint();});
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
    paint();
  };
})();
