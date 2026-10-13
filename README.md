# Fantasy Ranch

Standalone league-history website for Fantasy Ranch. This project is intentionally separate from Dynasty Plebs.

## Source hierarchy
1. Google Sheets is authoritative for league history and Legacy Score inputs.
2. `data-h2h-ledger.json` is the canonical one-row-per-matchup regular-season H2H source. H2H records, streaks, recent form and single-game scoring records are derived from it.
3. ESPN/Sleeper screenshots are retained as matchup/score evidence and indexed from the H2H ledger where numeric transcription is still pending.
4. Discrepancies are reconciled rather than guessed. The 2026 ledger remains partial until the full season import.

## Legacy Score
`Win% × 1000 × [1 + (0.05 × playoff wins) + (0.05 × service time) + (0.50 × championships)]`

Playoff byes count as playoff wins. Cumulative win percentage is rounded to four decimals before the formula is applied, matching the locked workbook.

## Deployment
`main` is connected directly to the standalone Fantasy Ranch Vercel project. Production deploys are GitHub-backed so every site change remains versioned in this repository.

## Local development
Serve the directory with any static server, e.g. `python3 -m http.server 4173`.

## H2H completeness
- The 2012–2025 regular-season H2H ledger is 100% score-complete: 1,133 matchups with both scores stored.
- Results are score-verified except explicit historical official-result overrides where the archived official outcome differs from the displayed score.
- H2H summary, ordered series, rivalry extremes, scoring records, and regular-season streak records derive from the canonical ledger.
- 2026 remains intentionally partial until the full season import.
