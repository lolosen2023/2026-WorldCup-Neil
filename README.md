# 2026-WorldCup-Neil

Codex skill package for FIFA World Cup probability analysis.

The canonical skill is:

```text
skills/world-cup-probability-model/SKILL.md
```

It supports:

- daily World Cup forecast updates
- Beijing-time and U.S.-time fixture grouping
- 1X2 odds de-vigging
- over/under and correct-score probability modelling
- Poisson score pools
- expected-value screening
- risk classification and responsible-use warnings
- post-match model review

## Install

Use the Codex skill installer with the skill folder path:

```powershell
python C:\Users\neil.wang\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py --repo lolosen2023/2026-WorldCup-Neil --path skills/world-cup-probability-model
```

## Validate

```powershell
node .\scripts\validate_skill_package.mjs
node .\skills\world-cup-probability-model\scripts\probability-tool.mjs --home Spain --away CapeVerde --odds -550,650,1400 --ou -115,-105
```
