const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

const apkSrc = 'f:/CORE_MEDICAL_MB/android/app/build/outputs/apk/release/app-release.apk';
const apkDest = 'f:/CORE_MEDICAL_MB/public/downloads/MedCore_Hospital.apk';

if (fs.existsSync(apkSrc)) {
  fs.copyFileSync(apkSrc, apkDest);
  const buf = fs.readFileSync(apkDest);
  const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
  const sizeBytes = buf.length;
  const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(1);
  console.log('SHA256:', hash);
  console.log('Size:', sizeMb, 'MB');

  const versionObj = {
    latestVersion: '0.0.0.119',
    minRequiredVersion: '0.0.0.1',
    buildNumber: 119,
    releaseDate: new Date().toISOString().split('T')[0],
    releaseNotes: [
      '[SmartCA] Bản cập nhật v0.0.0.119: Ký số từ xa SmartCA theo đúng chuẩn server',
      'Flow ký: sign-data → remote-sign (server điều phối SmartCA) → sign-conclusion',
      'Fail-closed: không còn giả lập kết quả ký khi có lỗi',
      'Ký hàng loạt đúng contract bulk-signatures của máy chủ',
      'Yêu cầu backend hỗ trợ /signing/remote-sign và bác sĩ đăng ký chứng thư cá nhân',
    ],
    downloadUrl: 'https://github.com/kukenitc2-lang/medcore-mobile-releases/raw/main/public/downloads/MedCore_Hospital.apk',
    apkSha256: hash,
    fileSize: sizeMb + ' MB',
    isMandatory: false,
    forceUpdate: false,
  };

  fs.writeFileSync('f:/CORE_MEDICAL_MB/public/downloads/version.json', JSON.stringify(versionObj, null, 2), 'utf8');
  fs.writeFileSync('f:/CORE_MEDICAL_MB/version.json', JSON.stringify(versionObj, null, 2), 'utf8');
  console.log(`Updated version.json v${versionObj.latestVersion}`);

  console.log('Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  try {
    execSync(`git commit -m "Release v${versionObj.latestVersion}: SmartCA remote signing - server-orchestrated flow, fail-closed" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>"`, { stdio: 'inherit' });
  } catch (e) {
    console.log('Nothing new to commit or already committed.');
  }
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('SUCCESS: Pushed to GitHub!');
} else {
  console.error('APK src not found!');
}
