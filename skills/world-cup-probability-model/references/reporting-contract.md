# Reporting Contract

Use this reference when writing final user-facing reports.

## Single-Match Report

```markdown
# Match: Team A vs Team B

## Data and Timezone

- Match date:
- Kickoff:
- Timezone:
- Sources:
- Odds timestamp:

## Market Read

- 1X2 odds:
- De-vigged market probability:
- Over/Under 2.5 read:

## Model Probability

| Outcome | Market probability | Model probability | Difference |
|---|---:|---:|---:|
| Team A win |  |  |  |
| Draw |  |  |  |
| Team B win |  |  |  |

## Correct-Score Pool

| Score | Model probability | Reason |
|---|---:|---|

## Mathematical Value

- Main value signal:
- Secondary value signal:
- Avoid:

## Final Read

- Conservative direction:
- Value direction:
- Score pool:
- Risk level:

Responsible reminder: this is probability analysis, not a guarantee. Do not chase losses or stake heavily on a single match.
```

## Matchday Report

Use this order:

1. Exact date and timezone
2. Source and odds timestamp summary
3. Model update summary
4. Match probability table
5. Individual match notes
6. Final rankings
7. Responsible-use reminder

Probability table:

```markdown
| Match | Market favorite | Model W-D-L | Value signal | Score pool | Risk |
|---|---|---:|---|---|---|
```

Final rankings:

- Best mathematical value
- Best lower-risk direction
- Best draw-protection match
- Best small-score match
- Highest upset risk

## Chinese Daily Report Style

For Chinese output, keep it compact and operational:

- Use "北京时间 YYYY-MM-DD" in headings.
- Say "胜平负概率", "比分池", "数学价值", and "风险等级".
- State when odds are missing: "暂无可靠赛前赔率，跳过 EV 判断".
- Do not over-explain formulas unless the user asks.

Required closing sentence:

```text
以上是概率分析，不是命中保证；赔率会波动，阵容会变化，足球单场方差很高，不建议重仓或追损。
```
