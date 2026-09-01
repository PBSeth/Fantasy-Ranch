// Canonical career aggregates derived only from season-level regular-season records.
// Do not add manager-specific overrides here. If a career total is wrong, fix the season row.
function parseCareerRecord(record) {
  const match = String(record || '').match(/^(\d+)-(\d+)(?:-(\d+))?/);
  if (!match) return null;
  return {
    wins: Number(match[1]),
    losses: Number(match[2]),
    ties: Number(match[3] || 0)
  };
}

function careerTotals(m, throughYear = Infinity) {
  return (m?.seasons || [])
    .filter(s => s.year <= throughYear)
    .map(s => parseCareerRecord(s.record))
    .filter(Boolean)
    .reduce((totals, record) => ({
      wins: totals.wins + record.wins,
      losses: totals.losses + record.losses,
      ties: totals.ties + record.ties,
      seasons: totals.seasons + 1
    }), { wins: 0, losses: 0, ties: 0, seasons: 0 });
}

function formatCareerRecord(totals) {
  if (!totals || totals.seasons === 0) return '—';
  return `${totals.wins}-${totals.losses}${totals.ties ? `-${totals.ties}` : ''}`;
}

function careerWinPctFromTotals(totals) {
  const games = totals.wins + totals.losses + totals.ties;
  if (!games) return null;
  return Number(((totals.wins + totals.ties * 0.5) / games).toFixed(4));
}

function careerRecord(m, throughYear = Infinity) {
  return formatCareerRecord(careerTotals(m, throughYear));
}

function careerWinPct(m, throughYear = Infinity) {
  return careerWinPctFromTotals(careerTotals(m, throughYear));
}

// app-core historically exposed managerRecord(). Keep one canonical implementation,
// but derive it from the season rows instead of maintaining a second set of totals.
managerRecord = function(m) {
  return careerRecord(m);
};

function normalizeCareerAggregates() {
  allManagers().forEach(m => {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let seasons = 0;

    (m.seasons || [])
      .slice()
      .sort((a, b) => a.year - b.year)
      .forEach(s => {
        const record = parseCareerRecord(s.record);
        if (!record) return;

        wins += record.wins;
        losses += record.losses;
        ties += record.ties;
        seasons += 1;

        const games = wins + losses + ties;
        s.cumulativeWins = wins;
        s.cumulativeLosses = losses;
        s.cumulativeTies = ties;
        s.cumulativeWinPctOfficial = games
          ? Number(((wins + ties * 0.5) / games).toFixed(4))
          : null;
      });

    const totals = { wins, losses, ties, seasons };
    m.combinedRecord = formatCareerRecord(totals);
    m.record = m.combinedRecord;
    m.winPct = careerWinPctFromTotals(totals);
    m.serviceTime = seasons;
  });
}
