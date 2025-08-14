#!/usr/bin/env node
import path from "path";
import fs from "fs";
import os from "os";
import { spawnSync } from "child_process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";


const FIXED_REPO = "https://github.com/aboutcircles/circles-dev-kit";
const FIXED_REF  = "main";

const SUBDIR     = "";

function log(m = "") { console.log(m); }
function warn(m = "") { console.warn(m); }
function err(m = "") { console.error(m); }

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts
  });
  if (!opts.allowFail && r.status !== 0) process.exit(r.status || 1);
  return r;
}
function hasGit() {
  const r = spawnSync("git", ["--version"], { stdio: "ignore" });
  return r.status === 0;
}
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function isDirEmpty(dir) {
  if (!fs.existsSync(dir)) return true;
  const entries = fs.readdirSync(dir).filter(x => x !== "." && x !== "..");
  return entries.length === 0;
}
function sanitizeName(name) {
  return name
    .trim()
    .replace(/[\\/]/g, "-")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-~.]+/g, "")
    .replace(/^-+/, "")
    .replace(/-+$/, "") || "circles-app";
}
function looksDifferentClean(orig, clean) { return orig.trim() !== clean; }

function updatePackageName(dest, newName) {
  const pjPath = path.join(dest, "package.json");
  if (!fs.existsSync(pjPath)) {
    warn("⚠️  package.json not found; skipping name update.");
    return;
  }
  const pj = JSON.parse(fs.readFileSync(pjPath, "utf8"));
  pj.name = newName;
  if (pj.private !== true) pj.private = true; // avoid accidental publish
  fs.writeFileSync(pjPath, JSON.stringify(pj, null, 2));
}
function renameGitignore(dest) {
  const gi = path.join(dest, "gitignore");
  const dot = path.join(dest, ".gitignore");
  if (fs.existsSync(gi) && !fs.existsSync(dot)) fs.renameSync(gi, dot);
}
function detectPmFromLockfiles(dest) {
  if (fs.existsSync(path.join(dest, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(dest, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(dest, "bun.lockb"))) return "bun";
  if (fs.existsSync(path.join(dest, "package-lock.json"))) return "npm";
  return null;
}
function detectPmFromEnv() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.includes("pnpm")) return "pnpm";
  if (ua.includes("yarn")) return "yarn";
  if (ua.includes("bun")) return "bun";
  return "npm";
}
function installDeps(dest) {
  const pm = detectPmFromLockfiles(dest) || detectPmFromEnv();
  log(`\n📦 Installing dependencies with ${pm}...`);
  const args = pm === "npm" ? ["install", "--no-fund", "--no-audit"]
            : pm === "pnpm" ? ["install"]
            : pm === "yarn" ? []
            : pm === "bun" ? ["install"] : ["install"];
  run(pm, args, { cwd: dest, allowFail: true });
}
function initFreshGit(dest) {
  if (!hasGit()) { warn("⚠️  Git not found. Skipping git init."); return; }
  run("git", ["init"], { cwd: dest, allowFail: true });
  run("git", ["config", "core.autocrlf", "input"], { cwd: dest, allowFail: true });
  run("git", ["add", "-A"], { cwd: dest, allowFail: true });
  const r = spawnSync("git", ["commit", "-m", "chore: initial commit"], { cwd: dest, stdio: "ignore" });
  if (r.status === 0) log("🟢 Initialized a fresh git repo and created the first commit.");
  else warn("⚠️  Could not create the initial commit (configure git user.name/email). Repo was initialized.");
}
function copyTree(src, dest) {
  const filter = (p) => path.basename(p) !== ".git";
  if (fs.cp) return fs.cpSync(src, dest, { recursive: true, filter });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === ".git") continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyTree(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
function parseFlagsAndArg() {
  const args = process.argv.slice(2);
  const nonFlags = args.filter(a => !a.startsWith("-"));
  const folderArg = nonFlags[0];
  const flags = new Set(args.filter(a => a.startsWith("--")));
  return {
    folderArg,
    autoYes: flags.has("--yes"),
    noInstall: flags.has("--no-install"),
    noGit: flags.has("--no-git")
  };
}
async function promptFolderName(defaultName = "circles-app") {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(`Project folder name (${defaultName}): `);
    return (answer || defaultName).trim();
  } finally { rl.close(); }
}
async function promptYesNo(message, def = "n") {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question(`${message} ${def === "y" ? "[Y/n]" : "[y/N]"} `)).trim().toLowerCase();
    if (!answer) return def === "y";
    return ["y", "yes"].includes(answer);
  } finally { rl.close(); }
}

(async function main() {
  if (!hasGit()) {
    err("❌ Git is required. Please install Git and try again.");
    process.exit(1);
  }

  const { folderArg, autoYes, noInstall, noGit } = parseFlagsAndArg();

  // Decide folder name (arg or interactive)
  let rawName = folderArg;
  if (!rawName && !autoYes) rawName = await promptFolderName("circles-app");
  if (!rawName) rawName = "circles-app"; // default when --yes is used

  // Support scaffolding into current directory with "."
  let targetDir;
  let projectNameClean;
  if (rawName === ".") {
    targetDir = process.cwd();
    projectNameClean = sanitizeName(path.basename(targetDir));
  } else {
    projectNameClean = sanitizeName(rawName);
    if (looksDifferentClean(rawName, projectNameClean) && !autoYes) {
      const ok = await promptYesNo(`Use sanitized name "${projectNameClean}" instead of "${rawName}"?`, "y");
      if (!ok) {
        const retry = await promptFolderName(projectNameClean);
        projectNameClean = sanitizeName(retry);
      }
    }
    targetDir = path.resolve(process.cwd(), projectNameClean);
  }

  // Ensure safe target directory
  if (fs.existsSync(targetDir) && !isDirEmpty(targetDir)) {
    if (rawName === ".") {
      if (!autoYes) {
        const proceed = await promptYesNo(`Directory "${targetDir}" is not empty. Proceed here?`, "n");
        if (!proceed) { err("Aborted."); process.exit(1); }
      } else {
        err(`❌ Current directory is not empty. Choose a new folder or rerun without --yes.`);
        process.exit(1);
      }
    } else {
      if (!autoYes) {
        log(`\nDirectory "${targetDir}" already exists and is not empty.`);
        const useDifferent = await promptYesNo("Enter a different folder name?", "y");
        if (useDifferent) {
          const retry = await promptFolderName("circles-app");
          const cleaned = sanitizeName(retry);
          const newDir = path.resolve(process.cwd(), cleaned);
          if (fs.existsSync(newDir) && !isDirEmpty(newDir)) {
            err(`❌ "${cleaned}" also exists and is not empty. Aborting.`);
            process.exit(1);
          }
          projectNameClean = cleaned;
          targetDir = newDir;
        } else {
          err("Aborted.");
          process.exit(1);
        }
      } else {
        err(`❌ Directory "${targetDir}" exists and is not empty. Choose a different name.`);
        process.exit(1);
      }
    }
  } else if (!fs.existsSync(targetDir) && rawName !== ".") {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  log(`\n🚀 Creating ${projectNameClean} from ${FIXED_REPO} (branch: ${FIXED_REF})...`);

  // Clone shallow into temp, then copy only SUBDIR (or root) without .git
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "circles-scaffold-"));
  const cloneDir = path.join(tmp, "clone");
  try {
    const cloneArgs = ["clone", "--depth", "1", "--branch", FIXED_REF, FIXED_REPO, cloneDir];
    const cloneRes = spawnSync("git", cloneArgs, { stdio: "inherit", shell: process.platform === "win32" });
    if (cloneRes.status !== 0) {
      err("❌ Failed to clone the repository. Check network or repo URL.");
      process.exit(cloneRes.status || 1);
    }

    const srcRoot = SUBDIR ? path.join(cloneDir, SUBDIR) : cloneDir;
    if (!fs.existsSync(srcRoot)) {
      err(`❌ SUBDIR "${SUBDIR}" not found in the repository.`);
      process.exit(1);
    }

    copyTree(srcRoot, targetDir);
    if (fs.existsSync(path.join(targetDir, ".git"))) rmrf(path.join(targetDir, ".git"));

    renameGitignore(targetDir);
    updatePackageName(targetDir, projectNameClean);

    if (!noInstall) installDeps(targetDir);
    if (!noGit) initFreshGit(targetDir);

    const pm = detectPmFromLockfiles(targetDir) || detectPmFromEnv();
    log(`\n✅ Done! Next steps:\n  cd ${rawName === "." ? "." : projectNameClean}\n  ${noInstall ? `${pm} install\n  ` : ""}${pm} run dev\n`);
    log("Happy hacking! ✨");
  } finally {
    rmrf(tmp);
  }
})().catch(e => { err(e?.stack || e?.message || String(e)); process.exit(1); });