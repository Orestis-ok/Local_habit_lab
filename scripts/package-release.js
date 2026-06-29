const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const packageJson = require(path.join(root, "package.json"));
const packageDir = path.join(dist, `${packageJson.name}-${packageJson.version}`);
const archive = path.join(dist, `${packageJson.name}-${packageJson.version}.zip`);

const files = [
  "index.html",
  "styles.css",
  "habitLogic.js",
  "app.js",
  "server.js",
  "README.md",
  "RELEASE_NOTES_v0.2.0.md",
  "package.json",
  ".gitignore",
];
const directories = ["scripts", ".github"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(packageDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(packageDir, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(packageDir, directory), { recursive: true });
}

execFileSync("powershell", [
  "-NoProfile",
  "-Command",
  `Compress-Archive -Path '${packageDir}\\*' -DestinationPath '${archive}' -Force`,
], { stdio: "inherit" });

console.log(`Created ${archive}`);
