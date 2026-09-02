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
    latestVersion: '1.2.1',
    minRequiredVersion: '1.0.0',
    buildNumber: 121,
    releaseDate: new Date().toISOString().split('T')[0],
    releaseNotes: [
      'Bản cập nhật v1.2.1: Chi tiết hóa mã lỗi cảm biến sinh trắc học Android Native',
      'Hướng dẫn rõ ràng quy trình đăng ký Khuôn mặt/Vân tay trong Cài đặt hệ thống',
      'Xử lý mượt mà chuyển đổi qua lại giữa Đăng nhập Mật khẩu và FaceID',
    ],
    downloadUrl: 'https://github.com/kukenitc2-lang/medcore-mobile-releases/raw/main/public/downloads/MedCore_Hospital.apk',
    apkSha256: hash,
    fileSize: sizeMb + ' MB',
    isMandatory: false,
    forceUpdate: false,
  };

  fs.writeFileSync('f:/CORE_MEDICAL_MB/public/downloads/version.json', JSON.stringify(versionObj, null, 2), 'utf8');
  fs.writeFileSync('f:/CORE_MEDICAL_MB/version.json', JSON.stringify(versionObj, null, 2), 'utf8');
  console.log('Updated version.json v1.2.1');

  console.log('Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Release v1.2.1: Detailed Android BiometricManager error handling and clear hardware setup guide"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('SUCCESS: Pushed to GitHub!');
} else {
  console.error('APK src not found!');
}
