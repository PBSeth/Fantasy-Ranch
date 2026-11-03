# Fantasy Ranch historical regular-season ledger audit — 2026-11-02

Source: `data-h2h-ledger.json` compared against the official completed-season `record` values in `data-managers-1.json` through `data-managers-4.json`.

## Audit findings
- 1,169 ledger matchups, including 2026 Weeks 1–7; 2021 Week 12 excluded from regular season in commit 764e8d5.
- No duplicate matchup IDs or self-matchups detected; completed-season week coverage appears contiguous.
- 12 manager-season record discrepancies involving 10 managers.
- Four displayed-score/result disagreements: 2012 W1 Brett–Kevin, W7 Dick–Diddles, W8 Payton–Zach B (explicit official-result overrides); 2014 W10 Diddles–Mason has identical displayed scores but recorded W/L. Do not reverse these automatically.

## Outstanding season-record discrepancies
| Season | Manager | Official | Ledger |
|---|---|---|---|
| 2012 | Kevin | 4-8 | 6-6 |
| 2012 | Brett | 5-7 | 3-9 |
| 2015 | Mason | 6-6 | 7-5 |
| 2015 | Ty/Molly | 8-4 | 9-3 |
| 2015 | Kevin | 5-7 | 4-8 |
| 2015 | Payton | 9-3 | 8-4 |
| 2016 | Seth | 7-6 | 6-7 |
| 2016 | Mason | 4-9 | 5-8 |
| 2022 | Ty/Molly | 6-6 | 5-7 |
| 2022 | Luke | 5-7 | 6-6 |
| 2025 | Mott | 4-10 | 3-11 |
| 2025 | Ryan | 7-7 | 8-6 |

## Consequences
Milestone Races calculates milestone timing from ledger results. Until each discrepant matchup is traced to an authoritative weekly result, the affected managers' fastest-to-wins/losses ranks or dates may be inaccurate. Official completed-season records should not be rewritten to match unverified weekly outcomes. Nor should weekly outcomes be changed solely to force totals.

Diddles: 95 official wins through 2025; four 2026 wins through Week 7 = 99. The submitted Week 8 result, if confirmed, is win 100; Week 8 is not yet in the ledger as of this audit.

## Resolution protocol
1. Compare each affected season's weekly source screenshots / ESPN / Sleeper records against the ledger.
2. Correct only identified bad weekly entries, preserving original source and rationale.
3. Re-run per-manager per-season win/loss/tie totals against official records.
4. Recheck milestone thresholds, ranks, dates and career totals before declaring the audit closed.
