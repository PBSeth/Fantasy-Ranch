// Playoff Wall of Fame awards.
// Retitles the existing playoff counting awards and adds highest/lowest
// playoff appearance rate with a two-season minimum.
(function () {
  function stackedLabel(title, note) {
    return `<div class="wall-high-label wall-high-label-stacked"><span>${title}</span><small>${note}</small></div>`;
  }

  function playoffCard(title, value, manager, detail='', note='') {
    return `<div class="wall-high-card">
      ${note ? stackedLabel(title, note) : `<div class="wall-high-label">${title}</div>`}
      <div class="wall-high-value">${value}</div>
      <div class="wall-high-name">${compactManagerName(manager)}</div>
      ${detail ? `<div class="wall-high-detail">${detail}</div>` : ''}
    </div>`;
  }

  function playoffRows() {
    return allManagers().map(m => {
      const seasons=careerTotals(m).seasons;
      const appearances=(m.seasons || []).filter(s=>s.playoffRecord).length;
      return {
        m,
        seasons,
        appearances,
        rate:seasons ? appearances/seasons : null
      };
    });
  }

  function replacePlayoffAwards() {
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;

    const cards=[...grid.querySelectorAll('.wall-high-card')];
    const winsCard=cards.find(card=>card.querySelector('.wall-high-label')?.textContent.trim()==='Playoff wins');
    const appsCard=cards.find(card=>card.querySelector('.wall-high-label')?.textContent.trim()==='Playoff appearances');
    if (!winsCard || !appsCard) return;

    const rows=playoffRows();
    const eligible=rows.filter(x=>x.seasons>=2 && x.rate!=null);
    if (!eligible.length) return;

    const highest=[...eligible].sort((a,b)=>b.rate-a.rate || b.seasons-a.seasons)[0];
    const lowest=[...eligible].sort((a,b)=>a.rate-b.rate || b.seasons-a.seasons)[0];

    winsCard.querySelector('.wall-high-label').textContent='Most Playoff Wins';
    appsCard.querySelector('.wall-high-label').textContent='Most Playoff Appearances';

    const holder=document.createElement('div');
    holder.innerHTML=[
      playoffCard('Highest Playoff Appearance Rate', formatSeasonRate(highest.rate), highest.m, `${highest.appearances} of ${highest.seasons} seasons`, '(2 season min.)'),
      playoffCard('Lowest Playoff Appearance Rate', formatSeasonRate(lowest.rate), lowest.m, `${lowest.appearances} of ${lowest.seasons} seasons`, '(2 season min.)')
    ].join('');
    const rateCards=[...holder.children];
    appsCard.insertAdjacentElement('afterend',rateCards[0]);
    rateCards[0].insertAdjacentElement('afterend',rateCards[1]);
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    replacePlayoffAwards();
  };
})();
