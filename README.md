# MEDCORE MOBILE FRAMEWORK (`@med/mobile-core`)
## Framework & UI Kit Y Tế Đa Nền Tảng (iOS, Android, Web & PWA)

> **Mục đích**: Cung cấp bộ khung (Framework), Native Hardware Bridge, UI Components chuẩn y tế và Engine Ký số từ xa (SmartCA / Cloud CA / PAdES) dùng chung cho hệ sinh thái các ứng dụng y tế:
> 1. **Khám Sức Khỏe (KSK)**: Bác sĩ duyệt & ký số từ xa (đơn & hàng loạt); 9 Chuyên khoa lâm sàng & cận lâm sàng theo **Quyết định 2062/QĐ-BYT** & **Thông tư 32/2023/TT-BYT** (Lái xe, Định kỳ, Lao động); Bệnh nhân quét CCCD gắn chip đặt lịch và tra cứu kết quả.
> 2. **Phòng Mạch (Clinic)**: Tiếp đón bằng QR Check-in; Chọn bác sĩ chuyên khoa & đặt lịch; Bác sĩ kê đơn & ký số đơn thuốc điện tử (**Thông tư 27/2021/TT-BYT**); Thanh toán VietQR NAPAS 24/7.
> 3. **Bệnh Án Điện Tử (EMR)**: Bác sĩ duyệt và ký số bệnh án nội/ngoại trú PAdES từ xa; Tương thích con dấu 4 dòng Navy Blue chuẩn EMR (`#001529`); Tra cứu kết quả xét nghiệm, chẩn đoán hình ảnh.

---

## 1. Cấu Trúc Toàn Bộ Framework

```text
CORE_MEDICAL_MB/
├── package.json               # Khai báo thư viện & peerDependencies
├── tsconfig.json              # Cấu hình TypeScript ES2022
├── README.md                  # Hướng dẫn sử dụng & tích hợp
└── src/
    ├── index.ts               # Barrel export toàn bộ components, hooks, bridge & types
    │
    ├── styles/                # Medical Design Tokens & Kích thước chạm
    │   └── theme.ts           # Palette Medical Teal / Navy Blue (#001529), Radii, Touch Targets >=48px, helper MUI theme
    │
    ├── bridge/                # Cầu nối phần cứng Native (Capacitor / PWA)
    │   ├── NativeBridge.ts    # Facade chụp ảnh, quét CCCD, Biometrics (vân tay/FaceID), Clipboard, Share, Mạng, Rung
    │   ├── cccdParser.ts      # Bóc tách QR Căn cước công dân gắn chip & Căn cước 2024 chuẩn Bộ Công An
    │   └── types.ts           # Kiểu dữ liệu nền tảng phần cứng
    │
    ├── signing/               # Engine Ký số từ xa (SmartCA / Cloud CA / PAdES EMR)
    │   ├── RemoteSignEngine.ts   # Bộ điều phối và polling xác thực SmartCA (VNPT, Viettel, MISA, FPT, HSM)
    │   ├── RemoteSignDialog.tsx  # Hộp thoại ký số SmartCA với đếm ngược xác thực & Biometrics
    │   ├── BatchSignDialog.tsx   # Hộp thoại ký số hàng loạt 5-50 hồ sơ cùng lúc
    │   ├── SignatureStamp.tsx    # Con dấu số 4 dòng Navy Blue chuẩn EMR với Auto-fit Dynamic Scaling
    │   ├── SignaturePlacementPicker.tsx # Bộ chọn toạ độ con dấu trên PDF (Quy đổi 96 DPI -> 72 DPI)
    │   ├── CertificateDetailModal.tsx   # Modal xem thông tin chi tiết chứng thư số
    │   └── types.ts
    │
    ├── viewer/                # Hiển thị tài liệu & PDF y tế trên Mobile
    │   ├── MedicalPdfViewer.tsx          # PDF Viewer tối ưu zoom/pinch và xem chứng thư số
    │   ├── VitalSignsCard.tsx            # Card sinh hiệu y tế (Mạch, HA, BMI WHO Châu Á, SpO2, Đường huyết, Mắt)
    │   ├── HealthClassificationBadge.tsx # Badge phân loại sức khỏe Loại I - V chuẩn BYT
    │   ├── DriverLicenseCategoryBadge.tsx# Badge phân loại hạng GPLX & chuẩn sức khỏe lái xe QĐ 2062
    │   ├── ClinicalExamSummary.tsx      # Accordion 9 chuyên khoa lâm sàng & cận lâm sàng QĐ 2062
    │   └── types.ts
    │
    ├── booking/               # Đặt lịch khám & Check-in QR
    │   ├── BookingWizard.tsx          # Wizard đặt lịch chuẩn hóa cho KSK & Phòng Mạch
    │   ├── CccdScanButton.tsx         # Nút quét QR CCCD tự điền thông tin người khám trong 1 giây
    │   ├── QrScannerModal.tsx         # Camera quét QR trực tiếp thời gian thực (HTML5 Canvas + Capacitor)
    │   ├── QrCheckInCard.tsx          # Thẻ Check-in phong cách Boarding-pass kèm mã QR
    │   ├── DoctorSpecialtySelector.tsx# Bộ chọn Chuyên khoa & Bác sĩ cho Phòng Mạch
    │   ├── VietQrPaymentCard.tsx      # Thẻ thanh toán VietQR NAPAS 24/7
    │   └── types.ts
    │
    ├── portal/                # Cổng tra cứu & Bảo vệ dữ liệu sức khỏe (PHI)
    │   ├── SecurityGate.tsx           # Xác thực bảo mật 2 lớp (6 số cuối CCCD + Ngày sinh)
    │   ├── ResultSummaryCard.tsx      # Tóm tắt kết quả khám và nút tải PDF ký số
    │   ├── PrescriptionViewerCard.tsx # Xem Đơn thuốc điện tử chuẩn TT 27/2021/TT-BYT
    │   ├── LabResultViewer.tsx        # Bảng kết quả xét nghiệm cận lâm sàng có cờ cảnh báo
    │   └── types.ts
    │
    ├── common/                # Thành phần giao diện dùng chung
    │   ├── MedicalAppBar.tsx          # Header chuẩn mobile có offline notice, action icons
    │   ├── MedicalBottomNav.tsx       # Bottom Navigation chuẩn y tế 4-5 tab
    │   ├── SpComboDataSelector.tsx    # Dropdown chuẩn hóa tuân thủ stored procedure sp_combodata
    │   ├── OfflineNotice.tsx          # Banner nổi báo mất mạng
    │   ├── EmptyState.tsx             # Giao diện trống đẹp mắt
    │   └── types.ts
    │
    └── hooks/                 # React Hooks chuyên dụng
        ├── useNativeBridge.ts         # Hook thiết bị, mạng, camera, rung
        ├── useRemoteSign.ts           # Hook quản lý tiến trình ký số SmartCA
        ├── useCccdScanner.ts          # Hook quét và bóc tách QR CCCD
        ├── useSpComboData.ts          # Hook nạp dữ liệu sp_combodata
        └── index.ts
```

---

## 2. Hướng Dẫn Tích Hợp Vào Dự Án (KSK, Phòng Mạch, EMR)

### Cách 1: Sử dụng thư mục cục bộ (Local Link)
Trong `package.json` của dự án (`KSK`, `PhongMach`, `EMR`), thêm:
```json
{
  "dependencies": {
    "@med/mobile-core": "file:../../CORE_MEDICAL_MB"
  }
}
```
Hoặc cấu hình alias trong `vite.config.ts`:
```ts
resolve: {
  alias: {
    '@med/mobile-core': path.resolve(__dirname, '../CORE_MEDICAL_MB/src'),
  }
}
```

---

## 3. Ví Dụ Sử Dụng Trong 3 Dự Án

### 🩺 Dự án 1: KSK (Bác sĩ Ký số SmartCA từ xa & Ký hàng loạt)
```tsx
import {
  RemoteSignDialog,
  BatchSignDialog,
  MedicalPdfViewer,
  VitalSignsCard,
  ClinicalExamSummary,
  DriverLicenseCategoryBadge,
  useRemoteSign,
} from '@med/mobile-core';

function DoctorKskApprovalPage() {
  const [openBatchSign, setOpenBatchSign] = useState(false);

  return (
    <div>
      <DriverLicenseCategoryBadge category="B2" isQualified={true} size="large" />
      <VitalSignsCard vitalSigns={record.vitalSigns} />
      <ClinicalExamSummary clinicalExams={record.clinicalExams} paraclinicalTests={record.paraclinicalTests} />
      <MedicalPdfViewer pdfUrl="/api/ksk/records/123/pdf" isSigned={false} />
      
      <Button onClick={() => setOpenBatchSign(true)}>Ký Hàng Loạt (20 Hồ Sơ)</Button>
      
      <BatchSignDialog
        open={openBatchSign}
        onClose={() => setOpenBatchSign(false)}
        items={pendingRecords}
        signerName="BS. CKI Nguyễn Văn A"
        facilityName="Bệnh Viện Đa Khoa HYD"
        onBatchSubmit={async (ids, commonInfo) => {
          return await api.post('/api/ksk/records/batch-sign', { ids, ...commonInfo });
        }}
      />
    </div>
  );
}
```

### 🏥 Dự án 2: Phòng Mạch (Đặt lịch khám, Quét QR CCCD & Kê đơn thuốc)
```tsx
import {
  BookingWizard,
  PrescriptionViewerCard,
  VietQrPaymentCard,
} from '@med/mobile-core';

function ClinicPage() {
  return (
    <BookingWizard
      mode="CLINIC"
      facilityName="Phòng Khám Đa Khoa Quốc Tế"
      facilityAddress="123 Nguyễn Trãi, Quận 5, TP.HCM"
      specialties={clinicSpecialties}
      doctors={clinicDoctors}
      timeSlots={availableSlots}
      vietQrConfig={{
        bankBin: '970436',
        bankName: 'Vietcombank',
        accountNumber: '1012345678',
        accountName: 'PHONG KHAM DA KHOA QUOC TE',
      }}
      onSubmitBooking={async (formData) => {
        return await api.post('/api/clinic/bookings', formData);
      }}
    />
  );
}
```

### 📋 Dự án 3: EMR (Bệnh Nhân Tra Cứu, Bảo Mật 2 Lớp & Xem Xét Nghiệm)
```tsx
import {
  SecurityGate,
  ResultSummaryCard,
  LabResultViewer,
  SignatureStamp,
  SpComboDataSelector,
} from '@med/mobile-core';

function PatientPortalPage() {
  const [isVerified, setIsVerified] = useState(false);

  if (!isVerified) {
    return (
      <SecurityGate
        onVerify={async (last6, dob) => {
          return await api.post('/api/portal/verify', { last6, dob });
        }}
        onVerifiedSuccess={() => setIsVerified(true)}
      />
    );
  }

  return (
    <div>
      <ResultSummaryCard record={patientRecord} onDownloadPdf={downloadPdf} />
      <LabResultViewer tests={patientRecord.paraclinicalTests} />
      <SignatureStamp
        info={{
          signerName: 'BS. CKI Trần Văn B',
          signerTitle: 'TRƯỞNG KHOA XÉT NGHIỆM',
          organization: 'Bệnh Viện Đa Khoa HYD',
          signedAt: '01/09/2026 14:30:00',
          isValid: true,
        }}
      />
    </div>
  );
}
```

