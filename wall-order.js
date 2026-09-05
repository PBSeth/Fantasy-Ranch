// Reorder Wall of Fame tiles into thematic clusters while preserving each card's data/content.
// The order is intentionally about readability and related concepts, not prestige.
(function () {
  const groups = [
    // Career efficiency
    ['Highest Career Win%','Lowest Career Win%'],
    // Playoff résumé
    ['Most Playoff Wins','Most Playoff Appearances','Highest Playoff %','Lowest Playoff %'],
    // Season-level wins / consistency
    ['Most Single Season Wins','Fewest Single Season Wins','Consecutive Winning Seasons','Consecutive Losing Seasons'],
    // Season-rate profile
    ['Highest Winning Season Rate','Lowest Winning Season Rate'],
    // Scoring environment / production
    ['Highest team PPG','Lowest team PPG','Highest PPG / starter','Lowest PPG / starter'],
    // Scoring margin
    ['Best scoring margin / game','Worst scoring margin / game'],
    // Schedule luck
    ['Luckiest Manager','Unluckiest Manager'],
    // Championship / finals résumé
    ['Most championships','Most Finals Appearances'],
    // Legacy movement
    ['Biggest Legacy jump','Biggest Legacy drop']
  ];

  const removedTitles = new Set([
    'Most Regular Season Wins',
    'Least Regular Season Wins',
    'Highest Losing Season Rate',
    'Lowest Losing Season Rate'
  ]);

  function normalizedTitle(card) {
    const label=card.querySelector('.wall-high-label');
    const span=label?.querySelector('span');
    return (span ? span.textContent : label?.textContent || '').trim();
  }

  function reorderWall() {
    const grid=document.querySelector('.highlights-grid');
    if (!grid) return;
    const cards=[...grid.querySelectorAll('.wall-high-card')];
    if (!cards.length) return;

    cards.forEach(card=>{
      if (removedTitles.has(normalizedTitle(card))) card.remove();
    });

    const remaining=[...grid.querySelectorAll('.wall-high-card')];
    const used=new Set();

    groups.flat().forEach(wanted=>{
      const card=remaining.find(c=>!used.has(c) && normalizedTitle(c)===wanted);
      if (card) {
        grid.appendChild(card);
        used.add(card);
      }
    });

    // Preserve any future/unrecognized awards rather than dropping them.
    remaining.filter(c=>!used.has(c)).forEach(c=>grid.appendChild(c));
  }

  const baseRenderHome=renderHome;
  renderHome=function () {
    baseRenderHome();
    reorderWall();
  };
})();
