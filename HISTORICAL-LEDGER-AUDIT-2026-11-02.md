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
