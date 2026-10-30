// Runs every *.test.js file one after another (each starts its own in-memory
// MongoDB + server) and prints a summary. Exit code is non-zero on any failure.
//   npm test                 -> all suites
//   npm test -- chat admin   -> only files whose name contains "chat" or "admin"
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const filters = process.argv.slice(2);
const files = fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith(".test.js"))
  .filter((file) => !filters.length || filters.some((f) => file.includes(f)))
  .sort();

let failedSuites = 0;
const summary = [];

for (const file of files) {
  console.log(`\n▶ ${file}`);
  const result = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: "pipe", encoding: "utf8" });
  const output = `${result.stdout}${result.stderr}`;

  // Show the check results; hide request logs and seed output.
  output
    .split("\n")
    .filter((line) => /^(PASS|FAIL)|passed, \d+ failed|Error/.test(line))
    .forEach((line) => console.log(`  ${line}`));

  const counts = output.match(/(\d+) passed, (\d+) failed/);
  if (result.status !== 0) failedSuites++;
  summary.push(`${result.status === 0 ? "✓" : "✗"} ${file.padEnd(28)} ${counts ? `${counts[1]} passed, ${counts[2]} failed` : "crashed"}`);
}

console.log(`\n${summary.join("\n")}\n`);
process.exit(failedSuites ? 1 : 0);
