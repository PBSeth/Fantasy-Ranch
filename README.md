# Fantasy Ranch

Standalone league-history website for Fantasy Ranch. This project is intentionally separate from Dynasty Plebs.

## Source hierarchy
1. Google Sheets is authoritative for league history and Legacy Score inputs.
2. ESPN/Sleeper screenshots enrich scoring and historical team-name data.
3. Discrepancies are reconciled rather than guessed.

## Legacy Score
`Win% × 1000 × [1 + (0.05 × playoff wins) + (0.05 × service time) + (0.50 × championships)]`

Playoff byes count as playoff wins. Cumulative win percentage is rounded to four decimals before the formula is applied, matching the locked workbook.

## Deployment
`main` is connected directly to the standalone Fantasy Ranch Vercel project. Production deploys are GitHub-backed so every site change remains versioned in this repository.

## Local development
Serve the directory with any static server, e.g. `python3 -m http.server 4173`.
