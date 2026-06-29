const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "habitLogic.js",
  "app.js",
  "server.js",
  "README.md",
  "package.json",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const checks = [
  ['<link rel="stylesheet" href="./styles.css">', "index.html links styles.css"],
  ['<script src="./habitLogic.js"></script>', "index.html loads habitLogic.js"],
  ['<script src="./app.js"></script>', "index.html loads app.js"],
  ['id="habitForm"', "habit form exists"],
  ['id="noteForm"', "note form exists"],
  ['id="weeklyDays"', "weekly summary exists"],
  ['id="exportButton"', "export button exists"],
];

const failed = checks
  .filter(([needle]) => !html.includes(needle))
  .map(([, label]) => label);

if (failed.length > 0) {
  console.error(`Validation failed: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("Local Habit Lab validation passed.");
