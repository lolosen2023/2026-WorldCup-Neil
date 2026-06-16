# Model Method

Use this reference when formulas, priors, or repeatable calculation rules are needed.

## Historical 2022 Baseline

| Score | Count |
|---|---:|
| 0-0 | 7 |
| 1-0 | 7 |
| 0-2 | 6 |
| 1-2 | 6 |
| 2-0 | 6 |
| 1-1 | 5 |
| 2-1 | 5 |
| 0-1 | 3 |
| 4-1 | 3 |
| 2-3 | 2 |
| 3-0 | 2 |
| 3-1 | 2 |
| 3-3 | 2 |
| 0-3 | 1 |
| 1-3 | 1 |
| 2-2 | 1 |
| 2-4 | 1 |
| 3-2 | 1 |
| 6-1 | 1 |
| 6-2 | 1 |
| 7-0 | 1 |

Derived baseline:

- Total matches: 64
- Total goals: 172
- Average goals: 2.6875
- Draws: 15 / 64 = 23.44%
- Under 2.5 goals: 34 / 64 = 53.13%

## Odds Conversion

American odds:

```text
positive: P = 100 / (odds + 100)
negative: P = abs(odds) / (abs(odds) + 100)
```

Decimal odds:

```text
P = 1 / decimal_odds
```

Remove overround for 1X2:

```text
P_fair_i = P_raw_i / sum(P_raw_1x2)
```

## Bayesian Smoothing

Draw rate:

```text
P_draw_updated = (Draw_2022 + Draw_2026) / (N_2022 + N_2026)
```

Under 2.5 rate:

```text
P_under_updated = (Under_2022 + Under_2026) / (N_2022 + N_2026)
```

Average goals:

```text
Goals_avg_updated = (Goals_2022 + Goals_2026) / (N_2022 + N_2026)
```

Correct-score prior:

```text
P_score_updated(s) = (Count_2022(s) + Count_2026(s) + alpha) / (N_2022 + N_2026 + alpha * K)
```

Default `alpha = 0.25`.

## Poisson Score Model

For score `x:y`:

```text
P_score = Pois(x, lambda_a) * Pois(y, lambda_b)
Pois(k, lambda) = exp(-lambda) * lambda^k / k!
```

Calculate at least `0..5` goals for each team. Group the remaining probability as "other".

## Default Blends

Final 1X2:

```text
P_final = 0.35 * P_market + 0.35 * P_poisson + 0.20 * P_worldcup_prior + 0.10 * P_current_trend
```

Correct score with correct-score odds:

```text
P_score_final = 0.55 * P_poisson + 0.25 * P_score_prior + 0.10 * P_current_score_trend + 0.10 * P_correct_score_market
```

Correct score without correct-score odds:

```text
P_score_final = 0.65 * P_poisson + 0.25 * P_score_prior + 0.10 * P_current_score_trend
```

Use these blends as defaults, not as rigid truth. Adjust only when the data source quality or match context justifies it, and state the adjustment.

## EV Labels

```text
EV = P_model * decimal_odds - 1
```

| EV | Label |
|---:|---|
| > 8% | strong mathematical value, still risky |
| 3% to 8% | watchlist value |
| 0% to 3% | thin value |
| < 0% | no model value |

## Signal Rules

- Draw value: `P_model_draw - P_market_draw >= 0.05`
- Favorite underlay: `P_market_favorite - P_model_favorite >= 0.06`
- Small-score priority: model under 2.5 is at least 5 points above market, or live tournament under rate is above 55% and the tactical setup is cautious.
- Strong team can win but not cover: favorite win probability above 58%, handicap cover below market expectation, and score pool concentrated in 1-0, 2-0, 2-1, or 1-1.
