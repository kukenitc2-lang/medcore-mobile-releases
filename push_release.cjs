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
    latestVersion: '0.0.0.117',
    minRequiredVersion: '0.0.0.1',
    buildNumber: 117,
    releaseDate: new Date().toISOString().split('T')[0],
    releaseNotes: [
      '[SECURITY] Bản cập nhật v0.0.0.117: Vá lỗ hổng đăng nhập sinh trắc học',
      'Đăng nhập FaceID/Vân tay giờ BẮT BUỘC máy chủ xác nhận phiên (refresh token hoặc cookie phiên)',
      'Không còn trường hợp quét sinh trắc học bừa vẫn vào được app với người dùng sai',
      'Lỗi xác thực hiển thị rõ ràng và chuyển về đăng nhập mật khẩu khi phiên hết hạn',
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
    execSync(`git commit -m "Release v${versionObj.latestVersion}: Security fix biometric login (fail-closed server verification)" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>"`, { stdio: 'inherit' });
  } catch (e) {
    console.log('Nothing new to commit or already committed.');
  }
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('SUCCESS: Pushed to GitHub!');
} else {
  console.error('APK src not found!');
}
