#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "README.md",
  "SKILL.md",
  ".codex-plugin/plugin.json",
  "skills/world-cup-probability-model/SKILL.md",
  "skills/world-cup-probability-model/agents/openai.yaml",
  "skills/world-cup-probability-model/references/model-method.md",
  "skills/world-cup-probability-model/references/reporting-contract.md",
  "skills/world-cup-probability-model/scripts/probability-tool.mjs"
];

for (const file of requiredFiles) {
  const path = resolve(root, file);
  if (!existsSync(path)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

JSON.parse(readFileSync(resolve(root, ".codex-plugin/plugin.json"), "utf8"));

const skill = readFileSync(resolve(root, "skills/world-cup-probability-model/SKILL.md"), "utf8");
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
if (!frontmatter) throw new Error("Skill is missing YAML frontmatter");

const nameMatch = frontmatter[1].match(/^name:\s*(.+)$/m);
const descriptionMatch = frontmatter[1].match(/^description:\s*(.+)$/m);
if (!nameMatch) throw new Error("Skill frontmatter is missing name");
if (!descriptionMatch) throw new Error("Skill frontmatter is missing description");

const name = nameMatch[1].trim();
if (!/^[a-z0-9-]+$/.test(name)) {
  throw new Error(`Skill name must use lowercase letters, digits, and hyphens only: ${name}`);
}
if (!descriptionMatch[1].trim().startsWith("Use when")) {
  throw new Error("Skill description should start with 'Use when'");
}

console.log("Skill package validation passed.");
