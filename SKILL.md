---
name: world_cup_probability_model
description: Analyze FIFA World Cup matches with a repeatable probability workflow using historical score distributions, current tournament results, betting-odds implied probabilities, Poisson score modelling, Bayesian updating, EV screening, and responsible-risk reporting. Use when the user asks for World Cup match predictions, odds comparison, correct-score probability, daily model updates, or next-day probability analysis.
---

# World Cup Probability Model Skill

## Purpose

This skill produces a repeatable probability analysis for FIFA World Cup matches. It combines:

- Historical World Cup correct-score distribution, especially the 2022 tournament baseline.
- Current 2026 World Cup completed-match results.
- Pre-match or closing betting odds when available.
- De-vigged implied probabilities from the betting market.
- Poisson correct-score modelling.
- Rolling tournament trend adjustments, especially draw rate, under 2.5 goals rate, favorite win rate, and favorite failure-to-win rate.
- Expected value screening.

The output must be framed as probability analysis, not certainty. Never claim a pick is guaranteed. Never encourage heavy staking, chasing losses, or illegal gambling.

## Default assumptions

- Unless the user specifies otherwise, analyze matches by U.S. Eastern Time match date.
- If the user says “美国时间” without a specific timezone, use U.S. Eastern Time for fixture grouping because most public World Cup schedules are listed in Eastern Time.
- If the user says “北京时间”, convert the fixture date/time to Asia/Shanghai.
- Only use regular-time scores for model updating unless the user explicitly asks to include extra time or penalties.
- If odds are unavailable or stale, mark them as unavailable and do not fabricate them.
- If multiple odds sources disagree, prefer closing odds or the latest pre-match odds from reputable sportsbooks/odds aggregators, and state the source and timestamp when available.

## Activation examples

Use this skill when the user asks things like:

- “调用世界杯概率模型，分析明天比赛。”
- “用这个模型看美国时间 6.17 的比赛。”
- “更新昨天赛果后，今天哪些比分最有数学价值？”
- “帮我看法国 vs 塞内加尔的胜平负概率和比分池。”
- “按赔率和泊松模型，明天世界杯怎么选？”

## Required inputs

When possible, collect the following data before analysis:

1. Fixture list
   - Match date and kickoff time.
   - Teams.
   - Group or knockout stage.
   - Neutral/home designation if relevant.

2. Completed results
   - Final score in regular time.
   - Whether the favorite won, drew, or lost.
   - Total goals.
   - Whether the match was over or under 2.5 goals.

3. Odds data
   - 1X2 odds: Team A win, draw, Team B win.
   - Over/Under 2.5 goals odds.
   - Handicap or Asian handicap odds if available.
   - Correct-score odds if available.
   - Odds source and timestamp if available.

4. Context data, if available
   - Team news, injuries, suspensions, rotation risk.
   - Motivation: opening match, must-win, already qualified, goal-difference pressure.
   - Style notes: low block, counterattack, high press, defensive structure.

## Historical baseline: 2022 World Cup correct-score distribution

Use this as the starting prior for correct-score analysis.

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

Derived 2022 baseline:

- Total matches: 64.
- Total goals: 172.
- Average goals per match: 2.6875.
- Draws: 15 / 64 = 23.44%.
- Under 2.5 goals: 34 / 64 = 53.13%.

## Daily update workflow

When the user asks for a daily update, or when this skill is run as an automated daily task, follow this sequence.

### Step 1: Fetch yesterday's completed matches

Find all World Cup matches completed on the previous U.S. Eastern Time date unless the user specifies another timezone.

For each match, record:

- Teams.
- Kickoff time.
- Final regular-time score.
- Group/stage.
- Total goals.
- Draw or non-draw.
- Favorite based on pre-match 1X2 odds.
- Whether the favorite won.

### Step 2: Fetch odds

For each completed match, try to fetch:

- 1X2 odds.
- Over/Under 2.5 odds.
- Handicap odds.
- Correct-score odds.

Preferred odds priority:

1. Closing odds.
2. Latest pre-match odds.
3. Public preview odds from reputable sources.
4. Aggregated sportsbook odds.

If only one source is available, use it but label it clearly. If odds are missing, do not invent them.

### Step 3: Convert odds to implied probabilities

For American odds:

Positive odds:

P = 100 / (odds + 100)

Negative odds:

P = abs(odds) / (abs(odds) + 100)

For decimal odds:

P = 1 / decimal_odds

Then remove overround for 1X2:

P_fair_i = P_raw_i / (P_raw_home + P_raw_draw + P_raw_away)

Use de-vigged probabilities for model comparison.

### Step 4: Update tournament aggregates

Maintain or recompute these statistics from all completed 2026 matches:

- Matches played.
- Total goals.
- Average goals per match.
- Draw count and draw rate.
- Under 2.5 count and rate.
- Favorite win count and rate.
- Favorite draw/loss count and rate.
- Strong favorite failure rate.
- Correct-score frequency table.
- Rolling last-8 and last-16 match trends.

If persistent storage is unavailable, reconstruct the dataset from public match results each time.

### Step 5: Bayesian smoothing against 2022 baseline

Use 2022 as a stabilizing prior and 2026 as live evidence.

Draw rate:

P_draw_updated = (Draw_2022 + Draw_2026) / (N_2022 + N_2026)

Under 2.5 rate:

P_under_updated = (Under_2022 + Under_2026) / (N_2022 + N_2026)

Average goals:

Goals_avg_updated = (Goals_2022 + Goals_2026) / (N_2022 + N_2026)

Correct-score prior:

P_score_updated(s) = (Count_2022(s) + Count_2026(s) + alpha) / (N_2022 + N_2026 + alpha * K)

Where:

- alpha = 0.25 by default.
- K = number of tracked scorelines.
- Track at least: 0-0, 1-0, 0-1, 1-1, 2-0, 0-2, 2-1, 1-2, 2-2, 3-0, 0-3, 3-1, 1-3, 3-2, 2-3, 4-1, 1-4.

## Match prediction workflow

For each upcoming match, follow the steps below.

### Step 1: Build market baseline

Use de-vigged 1X2 probabilities:

- P_market_home
- P_market_draw
- P_market_away

If no 1X2 odds are available, estimate a weak market baseline from team strength context, but label it as estimated and lower confidence.

### Step 2: Estimate total-goals expectation

If Over/Under odds are available, solve for total expected goals mu by matching the Poisson total-goals probability to the market over/under probability.

If calculation is not possible, use fallbacks:

- Default World Cup total-goals expectation: updated tournament average goals.
- If strong favorite and over market is strong: increase mu by 0.15 to 0.35.
- If both teams are defensive or opening-match cautious: reduce mu by 0.10 to 0.30.

### Step 3: Split expected goals between teams

Use the de-vigged win probabilities to allocate mu:

strength_home = P_market_home / (P_market_home + P_market_away)

Apply conservative bounds:

share_home = clamp(strength_home, 0.25, 0.75)

lambda_home = mu * share_home

lambda_away = mu * (1 - share_home)

Adjustments:

- If the favorite is an elite attacking team, allow share up to 0.78.
- If the underdog is defensively strong, reduce favorite lambda by 0.05 to 0.20.
- If the match has high upset/draw trend, move both lambdas slightly toward balance.
- If a key striker or playmaker is absent, reduce that team's lambda.

### Step 4: Calculate Poisson score probabilities

For each score x:y, calculate:

P_score_poisson(x:y) = Pois(x, lambda_home) * Pois(y, lambda_away)

Where:

Pois(k, lambda) = exp(-lambda) * lambda^k / k!

Calculate at least scores from 0 to 5 for both teams. Group extreme scores into “other”.

Derive:

- P_poisson_home_win.
- P_poisson_draw.
- P_poisson_away_win.
- P_poisson_under_2_5.
- Top correct-score probabilities.

### Step 5: Blend final 1X2 probabilities

Use this default blend:

P_final = 0.35 * P_market + 0.35 * P_poisson + 0.20 * P_worldcup_prior + 0.10 * P_current_trend

Definitions:

- P_market: de-vigged 1X2 probability.
- P_poisson: probability derived from score matrix.
- P_worldcup_prior: historical/tournament baseline adjusted for generic World Cup behavior.
- P_current_trend: rolling 2026 trend, especially draw and favorite-failure trend.

For match-specific priors:

- Use the updated draw baseline for draw.
- Allocate remaining non-draw probability toward the stronger side using market win ratio.
- If the market favorite is very strong but current tournament trend shows high favorite failure, reduce favorite probability slightly and increase draw probability.

### Step 6: Blend correct-score probabilities

Default correct-score blend:

P_score_final(s) = 0.55 * P_score_poisson(s) + 0.25 * P_score_updated(s) + 0.10 * P_current_score_trend(s) + 0.10 * P_correct_score_market(s)

If correct-score market odds are unavailable:

P_score_final(s) = 0.65 * P_score_poisson(s) + 0.25 * P_score_updated(s) + 0.10 * P_current_score_trend(s)

Always emphasize score pools rather than a single exact score.

### Step 7: Expected value screening

For any market with odds available:

EV = P_model * decimal_odds - 1

Flag value levels:

| EV | Label |
|---:|---|
| > 8% | Strong mathematical value, still risky |
| 3% to 8% | Watchlist value |
| 0% to 3% | Thin value |
| < 0% | No model value |

Do not recommend a bet purely because it is likely. A low-odds favorite can be likely but still poor value.

### Step 8: Risk classification

Classify each match:

Low risk:

- Model and market agree.
- Favorite probability is high.
- Draw signal is not elevated.
- Team strength gap is large.

Medium risk:

- Favorite is strong but draw/under signal is elevated.
- Model probability and market probability differ by 4-8 percentage points.
- Opening group match or cautious tactical setup.

High risk:

- Model and market strongly disagree.
- Underdog defensive profile is strong.
- Current tournament trend shows repeated favorite failures.
- Team news is uncertain.
- Odds are stale or incomplete.

## Signal rules

Use these rules to add human-readable tags.

### Draw value signal

Flag “平局价值偏高” when:

P_model_draw - P_market_draw >= 0.05

### Favorite underlay signal

Flag “热门方向偏贵” when:

P_market_favorite - P_model_favorite >= 0.06

### Small-score signal

Flag “小比分优先” when:

P_model_under_2_5 >= P_market_under_2_5 + 0.05

or when both conditions hold:

- Updated World Cup under 2.5 rate is above 55%.
- Match is an opening group-stage match or both teams are conservative.

### Favorite can win but may not cover

Flag “强队可胜，但不宜高估大胜” when:

- Favorite final win probability is above 58%.
- Handicap cover probability is below market expectation.
- Top score pool is concentrated in 1-0, 2-0, 2-1, or 1-1.

## Output format

When analyzing multiple upcoming matches, use this structure.

### 1. Model update summary

Include:

- 2026 matches played.
- Updated draw rate.
- Updated under 2.5 rate.
- Updated average goals.
- Favorite win rate.
- Favorite failure rate.
- Main trend conclusion.

### 2. Match probability table

| Match | Market favorite | Model W-D-L | Value signal | Score pool | Risk |
|---|---|---:|---|---|---|

Use W-D-L from the perspective of the first-listed team.

### 3. Individual match notes

For each match, include:

- Market read.
- Model read.
- Best mathematical angle.
- Top score pool.
- Risk warning.

### 4. Final ranking

Rank matches by:

1. Highest mathematical value.
2. Best low-risk direction.
3. Best draw-protection match.
4. Best small-score match.
5. Highest upset risk.

### 5. Responsible-use reminder

Always end with a short reminder:

“This is probability analysis, not a guarantee. Do not chase losses or stake heavily on a single match. Odds move, lineups change, and football has high variance.”

## Single-match output template

Use this when the user asks about one match.

# Match: Team A vs Team B

## Market read

- 1X2 odds: Team A / Draw / Team B.
- De-vigged market probability: A win / Draw / B win.
- Over/Under 2.5 read.

## Model probability

| Outcome | Market probability | Model probability | Difference |
|---|---:|---:|---:|
| Team A win |  |  |  |
| Draw |  |  |  |
| Team B win |  |  |  |

## Correct-score pool

| Score | Model probability | Reason |
|---|---:|---|

## Mathematical value

- Main value signal:
- Secondary value signal:
- Avoid:

## Final read

- Conservative direction:
- Value direction:
- Score pool:
- Risk level:

Responsible reminder: probability analysis only, not a guarantee.

## Daily automation prompt

Use this prompt for daily scheduled execution:

抓取昨日美国东部时间内已结束的 2026 世界杯比赛结果，并尽量抓取对应赛前或收盘赔率数据，包括胜平负、大小球、让球和正确比分赔率。用 2022 世界杯比分分布、2026 已赛结果、赔率隐含概率和泊松比分模型更新预测模型。输出：1）昨日比赛结果与赔率方向命中情况；2）更新后的平局率、小球率、场均进球、热门胜率、冷门/平局信号；3）次日所有世界杯比赛的胜平负概率、大小球概率、推荐比分池、风险等级和数学价值点；4）明确提醒这只是概率分析，不保证命中，不建议重仓。

## Data quality rules

- Always cite sources when using live results, fixtures, team news, or odds.
- Do not mix different timestamps of odds without saying so.
- Do not treat public odds as truth; odds are market prices, not guarantees.
- If the score source and odds source disagree on teams, dates, or kickoff times, resolve the fixture identity before analysis.
- If a match has already started, do not use live or in-play odds as pre-match odds unless explicitly labeled.
- If the user asks “准不准”, compare model output against actual results after the match and show what failed: market read, Poisson score, draw trend, favorite bias, or team-context error.

## Model limitations

This model is intentionally simple and explainable. It does not guarantee profit or prediction accuracy. It can be wrong because of:

- Red cards.
- Injuries.
- Late lineup changes.
- Penalties.
- Weather.
- Referee style.
- Tactical surprises.
- Small sample size.
- Odds movement.
- Market overreaction.

When uncertainty is high, say so clearly.
