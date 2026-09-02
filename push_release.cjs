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
    latestVersion: '1.2.3',
    minRequiredVersion: '1.0.0',
    buildNumber: 123,
    releaseDate: new Date().toISOString().split('T')[0],
    releaseNotes: [
      'Bản cập nhật v1.2.3: Khai báo đầy đủ quyền phần cứng android.hardware.biometrics.face và fingerprint',
      'Hỗ trợ toàn diện nhận diện khuôn mặt 2D/3D và mã khóa bảo mật trên máy tính bảng Android',
      'Kích hoạt camera quét khuôn mặt mượt mà trong mọi tình huống (Đăng nhập và Cài đặt)',
    ],
    downloadUrl: 'https://github.com/kukenitc2-lang/medcore-mobile-releases/raw/main/public/downloads/MedCore_Hospital.apk',
    apkSha256: hash,
    fileSize: sizeMb + ' MB',
    isMandatory: false,
    forceUpdate: false,
  };

  fs.writeFileSync('f:/CORE_MEDICAL_MB/public/downloads/version.json', JSON.stringify(versionObj, null, 2), 'utf8');
  fs.writeFileSync('f:/CORE_MEDICAL_MB/version.json', JSON.stringify(versionObj, null, 2), 'utf8');
  console.log('Updated version.json v1.2.3');

  console.log('Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Release v1.2.3: Complete Android Manifest biometric features and universal tablet hardware support"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('SUCCESS: Pushed to GitHub!');
} else {
  console.error('APK src not found!');
}
