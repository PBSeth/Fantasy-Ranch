// Career regular-season wins and win-percentage awards for the Wall of Fame.
// Uses regular-season records only. Three-season minimum applies to least wins
// and both career Win% awards.
(function () {
  function stackedLabel(title, note) {
    return `<div class="wall-high-label wall-high-label-stacked"><span>${title}</span><small>${note}</small></div>`;
  }

  function careerCard(title, value, manager, detail='', note='') {
    return `<div class="wall-high-card">
      ${note ? stackedLabel(title, note) : `<div class="wall-high-label">${title}</div>`}
      <div class="wall-high-value">${value}</div>
      <div class="wall-high-name">${compactManagerName(manager)}</div>
      ${detail ? `<div class="wall-high-detail">${detail}</div>` : ''}
    </div>`;
  }

  function careerRows() {
    return allManagers().map(m => {
      const totals=careerTotals(m);
      const seasons=totals.seasons;
      return {
        m,
        seasons,
        wins:totals.wins,
        winPct:careerWinPctFromTotals(totals)
      };
    });
  }

  function replaceCareerAwards() {
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;

    const rows=careerRows();
    const threeSeason=rows.filter(x=>x.seasons>=3 && x.winPct!=null);
    if (!rows.length || !threeSeason.length) return;

    const mostWins=[...rows].sort((a,b)=>b.wins-a.wins || b.seasons-a.seasons)[0];
    const leastWins=[...threeSeason].sort((a,b)=>a.wins-b.wins || a.seasons-b.seasons)[0];
    const highestPct=[...threeSeason].sort((a,b)=>b.winPct-a.winPct || b.seasons-a.seasons)[0];
    const lowestPct=[...threeSeason].sort((a,b)=>a.winPct-b.winPct || b.seasons-a.seasons)[0];

    const cards=[...grid.querySelectorAll('.wall-high-card')];
    const oldMost=cards.find(card=>card.querySelector('.wall-high-label')?.textContent.trim()==='Career regular-season wins');
    const oldLowestPct=cards.find(card=>card.querySelector('.wall-high-label')?.textContent.trim().startsWith('Lowest career Win%'));
    if (!oldMost || !oldLowestPct) return;

    const block=document.createElement('div');
    block.innerHTML=[
      careerCard('Most Regular Season Wins', fmt.format(mostWins.wins), mostWins.m, `${mostWins.seasons} seasons`),
      careerCard('Least Regular Season Wins', fmt.format(leastWins.wins), leastWins.m, `${leastWins.seasons} seasons`, '(3 season min.)'),
      careerCard('Highest Career Win%', winPct3(highestPct.winPct), highestPct.m, `${highestPct.seasons} seasons`, '(3 season min.)'),
      careerCard('Lowest Career Win%', winPct3(lowestPct.winPct), lowestPct.m, `${lowestPct.seasons} seasons`, '(3 season min.)')
    ].join('');

    const newCards=[...block.children];
    oldMost.replaceWith(newCards[0]);
    oldLowestPct.replaceWith(newCards[1]);
    newCards[1].insertAdjacentElement('afterend',newCards[2]);
    newCards[2].insertAdjacentElement('afterend',newCards[3]);
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    replaceCareerAwards();
  };
})();
