# Fantasy Ranch historical regular-season audit — updated 2026-11-02

## Completed corrections
- Excluded 2021 Week 12 postseason matchups from the regular-season ledger (six games).
- Reconciled 2015 Week 3 Kevin vs Mason using the archived source's documented stat correction: Kevin 92, Mason 91.5; official winner Kevin. Original displayed scores retained.
- Reconciled 2015 Week 7 Payton vs Ty/Molly: corrected Payton 91.5, Tyler 89; official winner Payton. Original displayed scores retained.
- Reconciled 2016 Week 10 Seth vs Mason: official winner Seth after stat correction, as documented in source reconciliation. Exact corrected score is unknown; original displayed scores retained and conflict flagged.
- Rechecked all completed manager-season W-L records against manager data. Originally 12 mismatches; now 6 remain, concentrated in 3 seasons.

## Still requiring source-level verification
| Season | Manager | Official record | Weekly ledger |
|---|---|---|---|
| 2012 | Kevin | 4-8 | 6-6 |
| 2012 | Brett | 5-7 | 3-9 |
| 2022 | Ty/Molly | 6-6 | 5-7 |
| 2022 | Luke | 5-7 | 6-6 |
| 2025 | Mott | 4-10 | 3-11 |
| 2025 | Ryan | 7-7 | 8-6 |

2012: the source file's existing reconciliation note claims three overrides reconcile final records, but they do **not**. Its Week 1 Brett–Kevin override awards Kevin a win despite Brett's higher displayed score, and the pair's ledger season records are still two wins apart from official totals. This needs original season-result evidence; do not manufacture an additional correction.

2022: the archived ESPN ledger includes a Week 10 Luke–Ty/Molly game (93.3–108.9), scored as Tyler's win. Since that already favors Tyler, it cannot by itself explain Tyler's missing win. Find the actual misrecorded week from the original source.

2025: Ryan beat Mott in both logged head-to-head games (Weeks 1 and 12), 110.36–88.86 and 89.26–62.12. Neither can be reversed without contrary source evidence. Compare 2025 official standings and the full screenshot archive.

## Integrity checks
- 1,169 ledger matchup entries through 2026 Week 7.
- No duplicate matchup keys, self-matchups, or completed-season missing week numbers.
- Some original displayed scores differ from official outcomes due to documented historical stat corrections. Preserve both representations.
- Milestone timing for the six remaining disputed manager-season rows is not fully verified. Do not silently claim the audit is complete.

## Next steps
Retrieve original weekly evidence for the three outstanding seasons; fix only source-verified outcomes; rerun per-season and cumulative totals and milestone rankings. Do not overwrite official records to match unverified weekly results.

## Additional independent scoring reconciliation
The user emphasized that historical ESPN team names may be unreliable. Cross-check manager identity and weekly opponents using PF, PA and official standings rather than accepting screenshot names at face value.

2022: all twelve managers' ledger season PF totals exactly match `data-scoring-2022-2024.json`; PA discrepancies include Ty/Molly -61.9 and Luke +65.0 (official minus ledger), plus several other managers. This strongly points to weekly opponent pairing/mapping errors rather than missing team scores. Do not reverse the existing Week 10 Tyler win over Luke without evidence.

2025: independent `Fantasy Ranch - Rivalry Profiles Combined.xlsx` official standings list Mott 4-10 PF 1219.60 PA 1338.36, Ryan 7-7 PF 1401.84 PA 1442.62. Ledger currently sums Mott PF 1178.94 PA 1322.06, Ryan PF 1423.34 PA 1421.12. Therefore there are score attribution errors beyond the W-L mismatch; use the original season-level source and weekly scoring to identify the week(s).

2012: `data-scoring-2012-2015.json` PF and PA totals disagree substantially with archived weekly sums for multiple managers, indicating a broader archival mapping/scoring issue. 2012 official Brett 5-7 and Kevin 4-8 must be preserved; don't rely on the old reconciliation claim that three overrides alone fix the season.

## 2022 Week 11 resolution (2026-11-03)
Reassigned archived Week 11 opponent pairings without changing any individual team scores: Luke 100.9 vs Metz 115.3; Shea 53.4 vs Ty/Molly 98.2. This resolves Luke and Tyler official W-L discrepancies simultaneously, and reduces the two largest 2022 PA deltas by 61.9 each. Other 2022 PA mismatches still warrant investigation; this reconstruction is inferred, not directly screenshot-verified.

## Exhaustive 2025 season PF/PA comparison (2026-11-03)
Official totals from user-supplied 2025 Sleeper Details (Rivalry Profiles Combined workbook). Values below are **official minus ledger**.

| Manager | PF delta | PA delta |
|---|---:|---:|
| Payton | -5.86 | +5.52 |
| Diddles | +4.48 | +32.72 |
| Ty/Molly | +5.52 | -5.86 |
| Mason | +16.30 | -5.74 |
| Metz | -40.98 | -26.20 |
| Ryan | -21.50 | +21.50 |
| Seth | 0.00 | 0.00 |
| Kevin | -36.42 | -57.40 |
| Luke | +27.58 | +2.74 |
| Brett | 0.00 | 0.00 |
| Mott | +40.66 | +16.30 |
| Nickster | +10.22 | +16.42 |

Ten of twelve managers have discrepancies, so simply reversing one Mott-Ryan matchup is not a complete correction. Individual weekly score assignments and opponent pairings need reconstruction. Season PF and PA are independent conservation constraints, but without authoritative week-level player-to-score mapping there can be multiple mathematically valid solutions. Do not claim uniqueness merely because a proposed swap matches totals.

2012: official Brett 5-7 vs ledger 3-9 and Kevin 4-8 vs ledger 6-6, while all other official W-L records match. A single flip cannot reconcile both; multiple compensating flips are needed, and the original 2012 PF/PA totals also disagree with archived scores across the league.

## 2025 score-identity diagnostic (2026-11-03)
Searched all same-week manager score swaps for an exact match to each manager's **official-minus-ledger PF difference**. A striking concentration occurs in Week 6:

| Manager | PF deficit/surplus | Week 6 candidate score source | Exact numerical match? |
|---|---:|---|---|
| Payton | -5.86 | Kevin's 119.24 replacing Payton's 125.10 | yes |
| Diddles | +4.48 | Payton's 125.10 replacing Diddles' 120.62 | yes |
| Ty/Molly | +5.52 | Metz's 101.60 replacing Tyler's 96.08 | yes |
| Metz | -40.98 | Mott's 60.62 replacing Metz's 101.60 | yes |
| Luke | +27.58 | Diddles' 120.62 replacing Luke's 93.04 | yes |

These form part of a possible score-assignment cycle in Week 6, but **not a complete permutation**: Mason, Kevin, Mott, Ryan and Nickster still require reconciliation; 2025 Week 1 Ryan's -21.50 also exactly equals the difference between Ryan's and Mott's recorded scores, but swapping those two would change the winner and needs corroboration. No scores were changed on the strength of these arithmetic coincidences alone.

Important: PF-matching swaps alone do not verify opponent assignments. Require a one-to-one permutation of all twelve scores for the affected week, check official PA totals and W-L simultaneously, and verify any remaining weekly adjustments against the supplied source.

## DEFINITIVE 2025 RESOLUTION — 2026-11-03 (supersedes earlier unresolved notes)
**All 12 official Sleeper manager PF totals, all 12 PA totals, and all 12 regular-season W-L records now reconcile exactly to the cent.** Weekly score values and all original matchups are preserved; only misassigned scores are permuted among managers within their own week. This is a full 36/36 independent constraint check.

- Week 1: Mott **110.36**, Ryan **88.86** (previously attributed in reverse). Official winner Mott.
- Week 6: Diddles **125.10**, Mason **96.08**, Kevin **93.04**, Metz **60.62**, Luke **120.62**, Mott **63.36**, Payton **119.24**, Ty/Molly **101.60**. Brett, Seth, Nickster, Ryan unchanged. All Week 6 winners remain the same.
- Week 7: Kevin **84.92**, Mason **101.54**, Mott **117.96**, Nickster **95.14**. Other Week 7 scores unchanged. All Week 7 winners remain the same.

This resolves the 2025 Mott/Ryan W-L mismatch and every 2025 PF/PA discrepancy without inventing scores. The earlier Week 6 partial-cycle diagnostic was a clue, not the full correction.

**2012 remains separate**: official season PF total 17,548.0 vs 2012 weekly ledger total 17,382.5 (difference 165.5). Unlike 2025, a pure within-week permutation cannot resolve the 2012 season scoring discrepancy. Official Brett 5-7 and Kevin 4-8 remain at odds with ledger; further source evidence needed before editing individual results.

## DEFINITIVE 2022 FULL RECONCILIATION — 2026-11-03
All 12 official 2022 PF, PA and W-L totals now match the H2H ledger **exactly (36/36 checks)**. Preserved every manager's individual weekly score; corrected opponent assignments only:
- Week 6: Kevin 94.5 vs Shea 71.7; Nickster 103.4 vs Luke 73.6 (previously Kevin-Luke and Nickster-Shea).
- Week 11: Kevin 109.5 vs Luke 100.9; Mason 108.1 vs Metz 115.3 (previously Kevin-Mason and Luke-Metz). The prior Week 11 Luke-Metz correction was an intermediate step; this is the complete reconstruction.
- Week 11: Shea 53.4 vs Ty/Molly 98.2 remains from prior fix.
All regular-season wins, losses and team PF totals reconcile. This supersedes earlier notes that 2022 PA discrepancies remained.

## Remaining 2012 caveat
Original `data-h2h-2012.json` and ledger match **all 72 officialWinner entries**, but the source's claim that these entries reconcile its own officialSeasonRecords is mathematically false: ledger Brett 3-9 vs official 5-7; ledger Kevin 6-6 vs official 4-8. Original 2012 weekly score sum 17,382.5 vs official PF sum 17,548.0; no score permutation can close the 165.5 league-wide deficit. Do not manufacture game results to force a match.

## 2012 safe resolution for cumulative milestone calculations
The 2012 source's Week 1 Kevin override was unsupported by its claimed reconciliation and contradicted the archived scoreboard. Restored **Brett 132.5 over Kevin 122.0** as score-supported/provisional; ledger now Brett 4-8, Kevin 5-7, versus official Brett 5-7, Kevin 4-8. Remaining individual result(s) cannot be uniquely identified from the supplied archived weekly scores and season totals (league-wide +165.5 discrepancy). Do not invent a specific winner.

The Milestone Races now reconcile each manager's cumulative **2012 W-L and PF to the independent official season record at the end of 2012**. Thus 2013 onward career win/loss/points thresholds are not contaminated by the disputed 2012 game identities. Exact 2012 1,000-point milestone week is marked unverified rather than fabricated. This is a functional historical-statistics fix, not a claim that the remaining 2012 H2H matchups are independently established.

## 2012 FULL AUDIT — 2026-11-03
72 matchups / 144 manager-game scores. Twelve unique team names, consistent throughout the transcribed weeks; Brett=Tom Raper, Kevin=Gruden's Gang. This does not independently verify the original screenshots. Original 2012 screenshot filenames are absent from ledger sourceImages; searches of accessible Project/Library files did not identify a 2012 image set.

Official vs ledger W-L: Brett 5-7 vs 4-8; Kevin 4-8 vs 5-7; all ten other managers match. Two additional **unverified** score/winner conflicts: Week 7 Dick credited over Diddles despite 74-102; Week 8 Payton credited over Zach B despite 91.5-122.5. The earlier Week 1 Kevin override was unsupported and Brett's 132.5-122 score-supported win was restored.

Official PF=PA 17,548.0; archived PF=PA 17,382.5. The **165.5-point deficit** proves that merely reassigning managers, opponents, or team names cannot completely reconcile 2012. At least one score-version difference, missing score, or transcription problem remains. Official-minus-archive PF/PA by manager: Diddles -61/+21; Seth +9.5/-7; Mott +26.5/+43.5; Brett +31.5/+9; Payton +25/-64; Dick +53.5/+3; Mason +0.5/+68; Ty/Molly +66/+10.5; Zach B +30/+57.5; Kevin +11.5/+30; Karscig -16.5/-23.5; Brad -11/+17.5.

The ledger's 2012 score-verified claim was removed and the two conflicting overrides explicitly marked unverified. The milestone calculator anchors cumulative 2012 records and PF to official season totals, preventing the disputed 2012 weekly records from corrupting later milestones. No evidence-based unique weekly reconstruction exists from the accessible transcription and official season aggregates alone.
