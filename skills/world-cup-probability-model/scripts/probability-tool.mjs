#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.odds) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const [homeName = "TeamA", awayName = "TeamB"] = [args.home, args.away];
const odds = args.odds.split(",").map(parseOdd);
if (odds.length !== 3 || odds.some((value) => !Number.isFinite(value))) {
  throw new Error("--odds must contain three American or decimal odds values: home,draw,away");
}

const raw = odds.map(impliedProbability);
const fair = normalize(raw);

let totalGoals = 2.45;
let under25 = null;
if (args.ou) {
  const ou = args.ou.split(",").map(parseOdd);
  if (ou.length !== 2 || ou.some((value) => !Number.isFinite(value))) {
    throw new Error("--ou must contain two odds values: over25,under25");
  }
  const [overRaw, underRaw] = ou.map(impliedProbability);
  const [overFair, underFair] = normalize([overRaw, underRaw]);
  under25 = underFair;
  totalGoals = estimateMuFromUnder25(underFair);
}

const homeShare = clamp(fair[0] / (fair[0] + fair[2]), 0.25, 0.75);
const lambdaHome = totalGoals * homeShare;
const lambdaAway = totalGoals * (1 - homeShare);
const matrix = buildScoreMatrix(lambdaHome, lambdaAway, 5);
const topScores = matrix.scores
  .slice()
  .sort((a, b) => b.probability - a.probability)
  .slice(0, Number(args.top || 8));

const result = {
  match: `${homeName} vs ${awayName}`,
  market: {
    rawImplied: toPercentObject(raw),
    fair1x2: toPercentObject(fair)
  },
  totals: {
    estimatedGoals: round(totalGoals, 3),
    under25: under25 == null ? null : round(under25, 4)
  },
  poisson: {
    lambdaHome: round(lambdaHome, 3),
    lambdaAway: round(lambdaAway, 3),
    homeWin: round(matrix.homeWin, 4),
    draw: round(matrix.draw, 4),
    awayWin: round(matrix.awayWin, 4),
    under25: round(matrix.under25, 4),
    otherTail: round(matrix.otherTail, 4),
    topScores: topScores.map((item) => ({
      score: item.score,
      probability: round(item.probability, 4)
    }))
  }
};

console.log(JSON.stringify(result, null, 2));

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function parseOdd(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return NaN;
  return numeric;
}

function impliedProbability(odd) {
  if (odd > 1 && odd < 100) return 1 / odd;
  if (odd > 0) return 100 / (odd + 100);
  return Math.abs(odd) / (Math.abs(odd) + 100);
}

function normalize(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => value / total);
}

function estimateMuFromUnder25(targetUnder) {
  let bestMu = 2.45;
  let bestError = Infinity;
  for (let mu = 1.2; mu <= 4.2; mu += 0.005) {
    const p = poisson(0, mu) + poisson(1, mu) + poisson(2, mu);
    const error = Math.abs(p - targetUnder);
    if (error < bestError) {
      bestError = error;
      bestMu = mu;
    }
  }
  return bestMu;
}

function buildScoreMatrix(lambdaHome, lambdaAway, maxGoals) {
  const scores = [];
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let under25 = 0;
  let covered = 0;

  for (let home = 0; home <= maxGoals; home += 1) {
    for (let away = 0; away <= maxGoals; away += 1) {
      const probability = poisson(home, lambdaHome) * poisson(away, lambdaAway);
      covered += probability;
      if (home > away) homeWin += probability;
      if (home === away) draw += probability;
      if (home < away) awayWin += probability;
      if (home + away < 2.5) under25 += probability;
      scores.push({ score: `${home}-${away}`, probability });
    }
  }

  return {
    scores,
    homeWin,
    draw,
    awayWin,
    under25,
    otherTail: Math.max(0, 1 - covered)
  };
}

function poisson(k, lambda) {
  return Math.exp(-lambda) * (lambda ** k) / factorial(k);
}

function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toPercentObject(values) {
  return {
    home: round(values[0], 4),
    draw: round(values[1], 4),
    away: round(values[2], 4)
  };
}

function printHelp() {
  console.log(`Usage:
node skills/world-cup-probability-model/scripts/probability-tool.mjs --home Spain --away CapeVerde --odds -550,650,1400 --ou -115,-105

Options:
  --home <name>           First-listed team name
  --away <name>           Second-listed team name
  --odds <h,d,a>          1X2 odds as American odds or decimal odds
  --ou <over,under>       Optional over 2.5 and under 2.5 odds
  --top <n>               Number of correct scores to show, default 8
`);
}
