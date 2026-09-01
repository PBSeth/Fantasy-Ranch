// Fantasy Ranch regular-season career truth layer.
// Source of truth: Fantasy Ranch workbook -> Regular Season tab (2012-2025).
// Keep Legacy Score values separate; those remain sourced from the locked Legacy Score Formula tab.
const RANCH_REGULAR_SEASON_TRUTH = Object.freeze({
  mott:      { record: '102-77',   winPct: 0.5698 },
  payton:    { record: '100-79',   winPct: 0.5587 },
  seth:      { record: '97-82',    winPct: 0.5419 },
  diddles:   { record: '95-83-1',  winPct: 0.5335 },
  metz:      { record: '55-50',    winPct: 0.5238 },
  kevin:     { record: '93-86',    winPct: 0.5196 },
  mason:     { record: '93-86',    winPct: 0.5196 },
  brett:     { record: '91-88',    winPct: 0.5084 },
  luke:      { record: '39-39',    winPct: 0.5000 },
  ryan:      { record: '7-7',      winPct: 0.5000 },
  'ty-molly':{ record: '89-90',    winPct: 0.4972 },
  nickster:  { record: '56-60-1',  winPct: 0.4829 },
  'kyle-s':  { record: '7-6',      winPct: 0.5380 },
  karscig:   { record: '25-24',    winPct: 0.5100 },
  shea:      { record: '37-40',    winPct: 0.4805 },
  brad:      { record: '38-51',    winPct: 0.4270 },
  'zach-b':  { record: '31-44',    winPct: 0.4130 },
  dick:      { record: '49-79',    winPct: 0.3828 },
  'mark-s':  { record: '4-9',      winPct: 0.3080 },
  sean:      { record: '15-37',    winPct: 0.2890 },
  molly:     { record: '3-10',     winPct: 0.2310 }
});

const ranchManagerRecordFallback = managerRecord;
managerRecord = function(m) {
  return RANCH_REGULAR_SEASON_TRUTH[m?.id]?.record || ranchManagerRecordFallback(m);
};

const ranchApplyScoringHistory = applyScoringHistory;
applyScoringHistory = function(history) {
  ranchApplyScoringHistory(history);

  allManagers().forEach(m => {
    const truth = RANCH_REGULAR_SEASON_TRUTH[m?.id];
    if (!truth) return;

    // Eliminate stale Rivalry-import totals from runtime data.
    m.combinedRecord = truth.record;
    m.winPct = truth.winPct;

    // Keep the current endpoint of the cumulative Win% timeline consistent
    // with the authoritative career record / Win% shown on the profile.
    const currentSeason = (m.seasons || []).find(s => s.year === DATA?.meta?.currentYear);
    if (currentSeason) currentSeason.cumulativeWinPctOfficial = truth.winPct;
  });
};
