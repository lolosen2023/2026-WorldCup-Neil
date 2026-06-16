---
name: world-cup-probability-model
description: Use when the user asks for FIFA World Cup match probability analysis, daily World Cup forecast updates, odds comparison, correct-score pools, expected-value screening, Beijing-time or U.S.-time fixture grouping, or post-match model review.
---

# World Cup Probability Model

## Overview

Produce World Cup probability analysis as a disciplined model report: verify current facts, convert odds to fair probabilities, build an explainable score model, compare model versus market, and state risk clearly. Treat outputs as probabilistic analysis, not betting certainty.

## Core Workflow

1. Resolve scope and timezone.
   - Use the timezone the user names.
   - For Chinese daily reports or Neil's automation, default to Asia/Shanghai.
   - Use U.S. Eastern Time only when the user asks for "美国时间", "U.S. time", or an ET matchday.
   - Use exact dates, not vague "today/tomorrow", in final output.

2. Verify time-sensitive inputs.
   - If fixtures, results, odds, injuries, or lineups are not provided, look them up from current sources and cite source plus timestamp.
   - Never fabricate odds. If odds are missing or stale, mark them unavailable and skip EV for that market.
   - Use regular-time scores for model updates unless the user explicitly asks for extra time or penalties.

3. Build the market baseline.
   - Convert American or decimal odds to implied probabilities.
   - Remove overround for 1X2 markets.
   - Prefer closing odds, then latest pre-match odds, then reputable public preview odds.
   - If sources disagree, label the source choice and timestamp.

4. Update tournament priors.
   - Track played matches, goals per match, draw rate, under 2.5 rate, favorite win rate, favorite failure rate, and correct-score frequencies.
   - Smooth early 2026 evidence against the 2022 World Cup baseline.
   - Read `references/model-method.md` when formulas or default priors are needed.

5. Generate match probabilities.
   - Estimate expected total goals from over/under odds when available; otherwise use the updated World Cup average and team context.
   - Split expected goals between teams using de-vigged 1X2 strength, then adjust conservatively for team news, tactical caution, and mismatch size.
   - Use Poisson score probabilities for 0-0 through 5-5, grouping extreme tails as "other".
   - Use `scripts/probability-tool.mjs` for repeatable odds conversion and Poisson score-pool calculations.

6. Compare model versus market.
   - Do not recommend an outcome only because it is likely.
   - Flag EV only when model probability and available odds produce positive expected value.
   - Classify risk as low, medium, or high using market disagreement, data quality, lineup uncertainty, draw signal, and match volatility.

7. Write the report.
   - For one match, use a compact single-match report.
   - For a matchday, start with the model update summary, then a table, then concise match notes and rankings.
   - For Chinese users, write the report in Chinese unless they ask otherwise.
   - Read `references/reporting-contract.md` for required sections and wording.

8. Verify before finalizing.
   - Confirm every fixture date follows the chosen timezone.
   - Confirm every live fact has a source or is explicitly marked unavailable.
   - Confirm EV is not shown when odds are unavailable.
   - Confirm the final reminder says this is probability analysis, not a guarantee.

## Quick Commands

Run a repeatable helper calculation:

```powershell
node .\skills\world-cup-probability-model\scripts\probability-tool.mjs --home Spain --away CapeVerde --odds -550,650,1400 --ou -115,-105
```

Validate the skill package:

```powershell
node .\scripts\validate_skill_package.mjs
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Treating odds as truth | Say odds are market prices and compare them to the model |
| Showing EV without an available price | Omit EV and label odds unavailable |
| Mixing Beijing and U.S. matchdays | State exact timezone and exact date before the table |
| Picking one exact score too strongly | Present a score pool and explain concentration |
| Reporting after kickoff with in-play odds | Label live odds clearly or exclude them from pre-match analysis |
| Claiming certainty | Use probability language and include the responsible-use reminder |

## Responsible Boundary

Never guarantee outcomes, never encourage heavy staking or chasing losses, and never present the model as financial advice. If the user asks for "稳赚", "梭哈", or similar certainty language, refuse that framing and give a risk-aware probability read instead.
