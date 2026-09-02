#!/usr/bin/env node
/**
 * MedCore release script — publish APK + version.json lên GitHub Releases.
 *
 * Nguyên tắc (v2): KHÔNG commit/push git. Toàn bộ artifact là assets của
 * GitHub Release (xem README.md). Git chỉ track README/.gitignore/script.
 *
 * Cách dùng:
 *   node push_release.cjs --apk <duong_dan_apk> --version 0.0.0.116 --notes "Tieu de" [--notes "Muc 2" ...] [--mandatory] [--min-required 0.0.0.110]
 *
 * Ví dụ:
 *   node push_release.cjs --apk android/app/build/outputs/apk/release/app-release.apk --version 0.0.0.116 --notes "Sửa lỗi PDF viewer"
 *
 * Yêu cầu: gh CLI đã đăng nhập (gh auth login) với quyền push vào repo.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const REPO = 'kukenitc2-lang/medcore-mobile-releases';
const APK_ASSET_NAME = 'MedCore_Hospital.apk';
const LATEST_DOWNLOAD_BASE = `https://github.com/${REPO}/releases/latest/download`;
const VERSION_URL = `https://github.com/${REPO}/releases/latest/download/version.json`;

// ---------- helpers ----------
function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function printUsage() {
  const doc = fs.readFileSync(__filename, 'utf8').split('*/')[0]
    .replace(/^#![^\n]*\n/, '')
    .replace(/^\/\*\*?\n?/, '');
  console.log(doc.split('\n').map((l) => l.replace(/^ \* ?/, '')).join('\n').trim());
}

function parseArgs(argv) {
  const args = { notes: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--apk': args.apk = argv[++i]; break;
      case '--version': args.version = argv[++i]; break;
      case '--notes': args.notes.push(argv[++i]); break;
      case '--mandatory': args.mandatory = true; break;
      case '--min-required': args.minRequired = argv[++i]; break;
      case '--help': case '-h': printUsage(); process.exit(0);
      default: fail(`Tham số không hợp lệ: ${a} (xem --help)`);
    }
  }
  return args;
}

function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) return null;
  return m.slice(1).map(Number);
}

function cmpVersion(a, b) {
  const pa = parseVersion(a), pb = parseVersion(b);
  if (!pa || !pb) return NaN;
  for (let i = 0; i < 4; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

function gh(args, opts = {}) {
  return execFileSync('gh', args, { stdio: opts.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', encoding: 'utf8' });
}

// ---------- main ----------
const args = parseArgs(process.argv);

if (!args.apk) fail('Thiếu --apk <duong_dan_apk>. Xem --help.');
if (!args.version) fail('Thiếu --version X.Y.Z.W. Xem --help.');
if (args.notes.length === 0) fail('Thiếu --notes. Xem --help.');

const apkPath = path.resolve(args.apk);
if (!fs.existsSync(apkPath)) fail(`Không tìm thấy APK: ${apkPath}`);
if (!parseVersion(args.version)) fail(`Version không đúng định dạng X.Y.Z.W: ${args.version}`);

// Version phải tăng so với bản phát hành gần nhất (đọc từ release trên GitHub,
// fallback về version.json cục bộ khi chưa có release nào)
let previousVersion = null;
try {
  previousVersion = gh(['release', 'view', '--repo', REPO, '--json', 'tagName', '--jq', '.tagName'], { capture: true })
    .trim().replace(/^v/, '') || null;
} catch { /* chưa có release nào */ }

if (!previousVersion) {
  try { previousVersion = JSON.parse(fs.readFileSync(path.join(__dirname, 'version.json'), 'utf8')).latestVersion; } catch { /* bỏ qua */ }
}

if (previousVersion) {
  const cmp = cmpVersion(args.version, previousVersion);
  if (Number.isNaN(cmp)) fail(`Không so sánh được version mới "${args.version}" với bản cũ "${previousVersion}".`);
  if (cmp <= 0) fail(`Version mới ${args.version} phải LỚN HƠN bản phát hành gần nhất ${previousVersion}.`);
}

const newVersion = args.version;
const tagName = `v${newVersion}`;

// Chặn release trùng tag
try {
  gh(['release', 'view', tagName, '--repo', REPO, '--json', 'id', '--jq', '.id'], { capture: true });
  fail(`Release ${tagName} đã tồn tại. Hãy dùng version khác.`);
} catch (e) {
  if (!e.status) throw e; // lỗi do fail() phía trên chứ không phải release không tồn tại
}

// Hash + kích thước
const buf = fs.readFileSync(apkPath);
const sha256 = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
const sizeMb = (buf.length / (1024 * 1024)).toFixed(1);

const releaseNotes = [
  args.notes[0].includes(newVersion) ? args.notes[0] : `Bản cập nhật v${newVersion}: ${args.notes[0]}`,
  ...args.notes.slice(1),
];

const versionObj = {
  latestVersion: newVersion,
  minRequiredVersion: args.minRequired || '0.0.0.1',
  buildNumber: parseVersion(newVersion)[3],
  releaseDate: new Date().toISOString().split('T')[0],
  releaseNotes,
  downloadUrl: `${LATEST_DOWNLOAD_BASE}/${APK_ASSET_NAME}`,
  apkSha256: sha256,
  fileSize: `${sizeMb} MB`,
  isMandatory: !!args.mandatory,
  forceUpdate: !!args.mandatory,
};

// Ghi version.json ra thư mục tạm để upload như asset (UTF-8 tường minh)
const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'medcore-release-'));
const versionJsonPath = path.join(tmpDir, 'version.json');
fs.writeFileSync(versionJsonPath, JSON.stringify(versionObj, null, 2) + '\n', 'utf8');

console.log('=== MedCore release ===');
console.log(`Version      : ${newVersion} (build ${versionObj.buildNumber})`);
console.log(`APK          : ${apkPath} (${sizeMb} MB)`);
console.log(`SHA256       : ${sha256}`);
console.log(`Mandatory    : ${versionObj.isMandatory}`);
console.log('Notes:');
for (const n of releaseNotes) console.log(`  - ${n}`);

if (process.env.MEDCORE_DRY_RUN) {
  console.log('DRY RUN — không publish. Nội dung version.json:');
  console.log(fs.readFileSync(versionJsonPath, 'utf8'));
  process.exit(0);
}

// Publish: tạo Release kèm 2 assets (APK + version.json)
console.log(`Publishing ${tagName} ...`);
gh(['release', 'create', tagName,
  apkPath, versionJsonPath,
  '--repo', REPO,
  '--title', `Release v${newVersion}`,
  '--notes', releaseNotes.join('\n'),
]);

console.log('SUCCESS.');
console.log(`  Download APK   : ${versionObj.downloadUrl}`);
console.log(`  Check-update   : ${VERSION_URL}`);
console.log('Luu y app-side: URL check-update phai la URL o tren (redirect 302, luon ban moi nhat).');
