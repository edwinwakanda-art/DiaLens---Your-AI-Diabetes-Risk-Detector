# Frontend Fix Guide

File ini adalah panduan fix untuk project frontend DiaLens. Bahasanya sengaja dibuat sangat eksplisit supaya junior developer atau AI agent kecil bisa mengikuti tanpa perlu banyak menebak.

## Kontrak AI Service

AI service hanya butuh payload ini:

```json
{
  "HighBP": 0,
  "GenHlth": 1,
  "HighChol": 0,
  "Age": 1,
  "CholCheck": 0,
  "HvyAlcoholConsump": 0,
  "BMI": 10,
  "PhysActivity": 0,
  "Smoker": 0
}
```

Aturan penting:

- Semua field harus angka, bukan string.
- Jangan kirim field lama seperti `Stroke`, `Fruits`, `Veggies`, `Income`, `Education`, dan sejenisnya kalau backend/AI service tidak memintanya.
- Frontend boleh menghitung BMI dari berat dan tinggi, lalu kirim hasilnya sebagai `BMI`.
- Backend `/predict` saat ini juga bisa menyimpan `Weight` dan `Height` kalau frontend mengirim field itu. Namun AI service tetap harus menerima 9 field kontrak AI di atas. Jika `Weight` dan `Height` ikut dikirim ke backend, backend harus memastikan field tambahan itu tidak merusak request ke AI service.

## Kontrak Backend Yang Sudah Dikonfirmasi

Backend punya dua bentuk data yang berbeda:

1. Endpoint `POST /api/health/predict`

- Frontend harus kirim payload uppercase numeric sesuai kontrak AI service.
- Response dari backend dibungkus di field `data`.
- Endpoint ini otomatis menyimpan record ke database. Frontend tidak perlu memanggil endpoint save lain.
- Backend membaca biometrics tambahan dari `payload.Weight || payload.weight`, `payload.Height || payload.height`, dan `payload.BMI || payload.bmi`.
- Contoh bentuk response:

```json
{
  "success": true,
  "data": {
    "prediction": 0,
    "risk_level": "medium",
    "probability": 0.55,
    "ai_recommendation": "..."
  }
}
```

Kode frontend harus mengambil:

```ts
const resJson = await res.json();
const rawData = resJson.data || resJson;
```

Jangan hapus pola `resJson.data || resJson`, karena backend predict memang membungkus response di `data`.

2. Endpoint `GET /api/health/records`

- Field history tetap lowercase/camelCase.
- Beberapa field numeric dikirim sebagai string, bukan number.
- Tidak ada field `probability` di `/records`. Field yang setara adalah `diabetesRisk`.
- Contoh field:

```json
{
  "age": "1",
  "weight": "68",
  "height": "170",
  "bmi": "23.5",
  "highBP": "0",
  "highChol": "1",
  "prediction": "Medium",
  "status": "Medium",
  "risk_level": "medium",
  "diabetesRisk": 0.55,
  "ai_recommendation": "...",
  "topRiskFactors": []
}
```

Jadi aturan besarnya:

- Untuk request predict: pakai uppercase seperti `BMI`, `HighBP`, `HighChol`.
- Untuk response records/history: baca lowercase/camelCase seperti `bmi`, `highBP`, `highChol`.
- Untuk risiko di `/predict`: baca `data.probability`.
- Untuk risiko di `/records`: baca `diabetesRisk`.
- `probability` dan `diabetesRisk` intended dalam skala 0-1, misalnya `0.108`. Tapi backend belum memaksa normalisasi, jadi frontend tetap perlu aman terhadap nilai 0-100.

3. Nilai `risk_level`

Nilai fallback resmi backend:

```txt
Low
Medium
High
Unknown
```

Backend belum menormalisasi casing dari AI service. UI harus handle lowercase, uppercase, dan fallback unknown.

4. Error response

Format error backend belum konsisten. Bisa berbentuk:

```json
{ "message": "..." }
```

atau:

```json
{ "message": "...", "detail": "..." }
```

atau:

```json
{ "message": "...", "error": "..." }
```

atau:

```json
{ "error": "..." }
```

Frontend sebaiknya menampilkan error dengan prioritas:

```ts
message || error || detail || 'Terjadi kesalahan'
```

5. Refresh token

Login/register mengembalikan `refreshToken`, tapi route `/api/health/refresh` belum didaftarkan. Saat ini endpoint refresh kemungkinan 404. Jika frontend ingin memakai refresh token, backend perlu menambahkan route:

```js
router.post('/refresh', authController.refresh);
```

## Bug 1: Dashboard Perlu Normalisasi Records Lowercase/CamelCase

Lokasi:

- `app/dashboard/page.tsx`
- Bagian normalisasi data records, sekitar fungsi `fetchHealthRecords`

Masalah:

Backend sudah dikonfirmasi mengirim history dengan lowercase/camelCase dan beberapa nilai numeric sebagai string:

```ts
log.bmi
log.highBP
log.highChol
log.diabetesRisk
```

Dashboard memang sudah mulai membaca `log.bmi`, tapi normalisasi masih kurang rapi:

- `bmi` langsung diparse dari `log.bmi`, tetapi perlu guard untuk angka/string kosong.
- `highBP` dan `highChol` masih bisa masuk sebagai `1`, `0`, `'1'`, `'0'`, `'Ya'`, atau `'Tidak'`.
- Risiko history harus membaca `log.diabetesRisk`, bukan `log.probability` sebagai sumber utama.
- Kalau value tidak dinormalisasi, UI atau log lanjutan bisa menampilkan `1`/`0` atau nilai default yang salah.

Catatan:

Fallback uppercase seperti `log.BMI`, `log.HighBP`, `log.HighChol` boleh tetap ditambahkan sebagai defensive coding, tapi itu bukan format utama `/records`.

Dampak:

- Dashboard bisa menampilkan `- BMI` kalau parsing value gagal.
- Grafik BMI bisa jadi `0`.
- Status tekanan darah/kolesterol bisa tampil tidak konsisten.

Cara fix:

Di normalisasi data dashboard, baca format utama lowercase/camelCase. Tambahkan uppercase hanya sebagai fallback aman:

```ts
const rawBmi = log.bmi ?? log.BMI;
const numericBmi = Number(rawBmi);
const finalBmi = Number.isFinite(numericBmi) && numericBmi > 0
  ? numericBmi.toFixed(1)
  : '-';

const normalizeYesNo = (value: unknown) => {
  return value === 1 || value === '1' || value === true || value === 'Ya'
    ? 'Ya'
    : 'Tidak';
};

const highBP = normalizeYesNo(log.highBP ?? log.HighBP);
const highChol = normalizeYesNo(log.highChol ?? log.HighChol);
const rawRisk = log.diabetesRisk ?? log.probability ?? log.risk_score ?? 0;
```

Lalu masukkan ke object return:

```ts
bmi: finalBmi,
highBP,
highChol,
```

Checklist test:

- Buat record history dengan `bmi: 23.5`, `highBP: 1`, `highChol: 0`.
- Dashboard harus menampilkan `23.5 BMI`.
- Data normalisasi `highBP` harus menjadi `Ya`.
- Data normalisasi `highChol` harus menjadi `Tidak`.
- Dashboard harus memakai `diabetesRisk` untuk angka risiko dari `/records`.
- Kalau backend suatu saat mengirim `BMI`, `HighBP`, `HighChol`, fallback tetap tidak rusak.

## Bug 1B: History Juga Harus Mengutamakan Records Lowercase/CamelCase

Lokasi:

- `app/history/page.tsx`
- Bagian normalisasi data records, sekitar fungsi `fetchUserHistory`

Masalah:

History sudah membaca beberapa variasi field, tetapi setelah backend dikonfirmasi, format utama yang benar untuk `/records` adalah lowercase/camelCase. Beberapa value dikirim sebagai string:

```ts
log.bmi
log.highBP
log.highChol
log.diabetesRisk
```

Cara fix:

Pastikan normalisasi tetap mengutamakan lowercase/camelCase, lalu uppercase hanya fallback:

```ts
const rawBmi = log.bmi ?? log.BMI;
const rawHighBP = log.highBP ?? log.HighBP;
const rawHighChol = log.highChol ?? log.HighChol;
const rawRisk = log.diabetesRisk ?? log.probability ?? log.risk_score ?? 0;
```

Checklist test:

- Buat record history dengan `bmi: 23.5`, `highBP: 1`, `highChol: 0`.
- History harus menampilkan `23.5 BMI`.
- History harus menampilkan tensi `Ya`.
- History harus menampilkan kolesterol `Tidak`.
- History harus memakai `diabetesRisk` untuk persentase risiko dari `/records`.

## Bug 2: Height/Weight Tidak Tersimpan, Lalu History Menampilkan Data Palsu

Lokasi:

- `app/check/page.tsx`
- `app/history/page.tsx`
- Backend `POST /api/health/predict`
- Bagian modal detail riwayat, sekitar perhitungan `calculatedHeight` dan `calculatedWeight`

Masalah:

Backend sebenarnya bisa menyimpan `height` dan `weight`, tapi hanya membaca field:

```js
payload.Weight || payload.weight
payload.Height || payload.height
```

Saat ini form frontend punya state:

```ts
heightCm
weightKg
```

Tetapi payload predict yang dikirim ke backend hanya berisi kontrak AI service. Akibatnya, backend bisa menyimpan `height` dan `weight` sebagai `"-"` di `/records`.

Masalah berikutnya: kalau `height` dan `weight` kosong, frontend history membuat data palsu:

```ts
calculatedHeight = "165";
calculatedWeight = String(Math.round(parsedBMI * (heightInMeters * heightInMeters)));
```

Dampak:

- User bisa melihat tinggi dan berat yang sebenarnya tidak pernah mereka input.
- Data medis terlihat seperti data asli padahal hanya fallback frontend.
- Ini berbahaya untuk trust aplikasi.

Cara fix paling aman:

Pilih salah satu pendekatan. Jangan gabungkan sembarangan.

Pilihan A, disarankan kalau AI service strict hanya menerima 9 field:

- Frontend tetap kirim 9 field AI ke `/predict`.
- Backend diperbaiki supaya bisa menerima `heightCm` dan `weightKg` sebagai metadata, lalu hanya meneruskan 9 field AI ke AI service.
- Backend menyimpan metadata itu ke `biometrics.height` dan `biometrics.weight`.

Contoh payload frontend ke backend:

```ts
const payload = {
  HighBP: Number(highBP),
  GenHlth: Number(genHlth),
  HighChol: Number(highChol),
  Age: Number(ageGroup),
  CholCheck: Number(cholCheck),
  HvyAlcoholConsump: Number(hvyAlcoholConsump),
  BMI: bmiValue,
  PhysActivity: Number(physActivity),
  Smoker: Number(smoker),
  heightCm: Number(heightCm),
  weightKg: Number(weightKg),
};
```

Backend harus memastikan request ke AI service tetap hanya:

```js
{
  HighBP,
  GenHlth,
  HighChol,
  Age,
  CholCheck,
  HvyAlcoholConsump,
  BMI,
  PhysActivity,
  Smoker,
}
```

Pilihan B, cepat di frontend jika backend aman terhadap field tambahan:

- Frontend kirim `Weight` dan `Height` bersama payload predict.
- Backend akan menyimpannya karena sudah membaca `payload.Weight` dan `payload.Height`.
- Pastikan backend tidak meneruskan `Weight` dan `Height` ke AI service jika AI service strict.

Contoh tambahan payload:

```ts
Weight: Number(weightKg),
Height: Number(heightCm),
```

Pilihan C, kalau tidak mau simpan tinggi/berat:

- Jangan tampilkan tinggi/berat di detail history.
- Tampilkan hanya BMI.

Apapun pilihan yang dipakai, hapus logic tebak tinggi/berat di history.

Ganti tampilan:

```tsx
<div className="flex justify-between">
  <span>Berat Badan</span>
  <span className="text-slate-900 font-bold">{calculatedWeight} KG</span>
</div>
<div className="flex justify-between">
  <span>Tinggi Badan</span>
  <span className="text-slate-900 font-bold">{calculatedHeight} CM</span>
</div>
```

Menjadi salah satu pilihan berikut.

Pilihan tampilan 1, hilangkan tinggi dan berat:

```tsx
{/* Tinggi dan berat tidak ditampilkan karena records hanya menyimpan BMI. */}
```

Pilihan tampilan 2, tampilkan hanya kalau data asli ada:

```tsx
{selectedItem.weight !== '-' && (
  <div className="flex justify-between">
    <span>Berat Badan</span>
    <span className="text-slate-900 font-bold">{selectedItem.weight} KG</span>
  </div>
)}

{selectedItem.height !== '-' && (
  <div className="flex justify-between">
    <span>Tinggi Badan</span>
    <span className="text-slate-900 font-bold">{selectedItem.height} CM</span>
  </div>
)}
```

Checklist test:

- Submit check dengan tinggi `170` dan berat `68`.
- Jika memilih menyimpan height/weight, `/records` harus mengembalikan `height: "170"` dan `weight: "68"`.
- Jika tidak menyimpan height/weight, detail history tidak boleh menampilkan tinggi `165 CM`.
- Jika tidak menyimpan height/weight, detail history tidak boleh menampilkan berat hasil hitung balik.
- BMI tetap tampil.

## Bug 3: URL Backend Tidak Konsisten

Lokasi:

- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/check/page.tsx`
- `app/dashboard/page.tsx`
- `app/history/page.tsx`
- `app/lib/api.ts`

Masalah:

Login dan register hardcode ke production:

```ts
https://dialens-backend-production.up.railway.app/api/health/login
https://dialens-backend-production.up.railway.app/api/health/register
```

Tapi check/dashboard/history pakai env:

```ts
process.env.NEXT_PUBLIC_API_URL
```

Dampak:

- Saat testing local/staging, login dan register tetap menembak production.
- Bisa membuat developer bingung karena halaman lain memakai backend berbeda.

Cara fix:

Buat satu helper URL, misalnya di `app/lib/api-url.ts`:

```ts
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app'
).replace(/\/$/, '');
```

Lalu di login:

```ts
import { API_BASE_URL } from '../lib/api-url';

const response = await fetch(`${API_BASE_URL}/api/health/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

Di register:

```ts
import { API_BASE_URL } from '../lib/api-url';

const response = await fetch(`${API_BASE_URL}/api/health/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: form.name,
    email: form.email,
    password: form.password,
  }),
});
```

Checklist test:

- Set `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

- Login harus request ke `http://localhost:5000/api/health/login`.
- Register harus request ke `http://localhost:5000/api/health/register`.
- Check/dashboard/history juga harus request ke URL yang sama.

## Bug 4: Logout Tidak Membersihkan Semua Data Session

Lokasi:

- `app/components/Sidebar.tsx`
- Fungsi `handleLogout`

Masalah:

Logout hanya menghapus:

```ts
localStorage.removeItem('token');
```

Tapi login menyimpan:

```ts
localStorage.setItem('token', data.token);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('userName', data.user?.name || 'User');
```

Dampak:

- `refreshToken` masih tertinggal.
- `userName` masih tertinggal.
- Setelah logout lalu login akun lain, nama/session bisa terlihat tidak konsisten.

Cara fix:

Ubah `handleLogout` menjadi:

```ts
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('user');
  router.push('/login');
};
```

Checklist test:

- Login.
- Cek localStorage ada token dan userName.
- Logout.
- Pastikan `token`, `refreshToken`, `userName`, dan `user` hilang.

## Bug 5: BMI Bisa Mengirim Angka Dummy 22.0

Lokasi:

- `app/check/page.tsx`
- Payload `handlePredict`

Masalah:

Saat ini payload memakai fallback:

```ts
BMI: Number.parseFloat(bmi) || 22.0
```

Dampak:

- Kalau input tinggi/berat invalid, frontend tetap mengirim BMI `22.0`.
- Hasil AI bisa terlihat valid padahal input user salah.

Cara fix:

Sebelum membuat payload, validasi tinggi, berat, dan BMI:

```ts
const height = Number(heightCm);
const weight = Number(weightKg);
const bmiValue = Number.parseFloat(bmi);

if (height <= 0 || weight <= 0 || !Number.isFinite(bmiValue) || bmiValue <= 0) {
  setErrorMessage('Tinggi dan berat badan harus diisi dengan angka yang valid.');
  setLoading(false);
  return;
}
```

Lalu payload:

```ts
BMI: bmiValue,
```

Tambahkan juga batas minimal input:

```tsx
<input type="number" min="1" required ... />
```

Checklist test:

- Tinggi kosong: request tidak boleh dikirim.
- Berat kosong: request tidak boleh dikirim.
- Tinggi `0`: request tidak boleh dikirim.
- Berat `0`: request tidak boleh dikirim.
- Tinggi `170`, berat `68`: request boleh dikirim dengan BMI sekitar `23.5`.

## Bug 6: Label Prediksi Bisa Kontradiktif Untuk Risiko Sedang Atau Unknown

Lokasi:

- `app/check/page.tsx`
- Bagian mapping response AI setelah `const rawData = resJson.data || resJson`

Masalah:

Saat ini `prediction` hanya menjadi "Terdeteksi Risiko Diabetes" kalau:

```ts
rawData.prediction === 1
```

atau `risk_level` mengandung `high`.

Kalau backend mengirim:

```json
{
  "prediction": 0,
  "risk_level": "medium",
  "probability": 0.55
}
```

UI bisa menampilkan:

```txt
Bukan Diabetes
Risiko Sedang
```

Dampak:

- User bingung karena status utama dan risk level bertentangan.

Cara fix:

Tentukan label dari `risk_level` dan `probability`, bukan hanya `prediction`.

Nilai resmi fallback backend adalah:

```txt
Low
Medium
High
Unknown
```

Contoh:

```ts
const rLevel = String(rawData.risk_level || '').toLowerCase();
const probability = rawData.probability !== undefined
  ? Number(rawData.probability)
  : 0;
const probabilityPercent = probability <= 1 ? probability * 100 : probability;

let tingkatRisikoIndo = 'Tidak Diketahui';
if (rLevel.includes('high') || rLevel.includes('tinggi') || probabilityPercent >= 70) {
  tingkatRisikoIndo = 'Tinggi';
} else if (rLevel.includes('medium') || rLevel.includes('sedang') || probabilityPercent >= 35) {
  tingkatRisikoIndo = 'Sedang';
} else if (rLevel.includes('low') || rLevel.includes('rendah') || probabilityPercent > 0) {
  tingkatRisikoIndo = 'Rendah';
}

const prediksiIndo = tingkatRisikoIndo === 'Tidak Diketahui'
  ? 'Risiko Belum Diketahui'
  : tingkatRisikoIndo === 'Rendah'
  ? 'Risiko Diabetes Rendah'
  : `Terdeteksi Risiko Diabetes ${tingkatRisikoIndo}`;
```

Checklist test:

- `risk_level: "low"` harus tampil risiko rendah.
- `risk_level: "medium"` harus tampil risiko diabetes sedang.
- `risk_level: "high"` harus tampil risiko diabetes tinggi.
- `risk_level: "Unknown"` harus tampil fallback yang tidak menyesatkan.
- `probability: 0.55` harus tampil `55%`, bukan `1%` atau `0%`.

## Bug 7: Refresh Token Belum Bisa Dipakai Frontend

Lokasi:

- `app/lib/api.ts`
- Backend route `/api/health/refresh`

Masalah:

Frontend punya axios interceptor yang mencoba request:

```ts
POST /api/health/refresh
```

Tapi backend belum mendaftarkan route refresh. Login/register memang mengembalikan `refreshToken`, tetapi endpoint refresh kemungkinan 404.

Dampak:

- Kalau token expired, refresh otomatis tidak berjalan.
- User bisa dipaksa login ulang.
- `app/lib/api.ts` memberi kesan refresh token sudah aktif padahal belum.

Cara fix:

Pilih salah satu:

1. Aktifkan refresh token di backend dengan menambahkan route:

```js
router.post('/refresh', authController.refresh);
```

2. Kalau belum mau pakai refresh token, jangan pakai interceptor refresh di frontend. Saat token expired, logout dan arahkan ke login.

Checklist test:

- Hit `POST /api/health/refresh` dengan refresh token valid.
- Kalau route aktif, harus dapat token baru.
- Kalau route belum aktif, frontend tidak boleh diam-diam mengandalkan refresh token.

## Bug 8: `app/lib/api.ts` Hampir Tidak Dipakai

Lokasi:

- `app/lib/api.ts`
- Semua page yang masih memakai `fetch` manual

Masalah:

Ada axios instance dengan interceptor token dan refresh token, tapi halaman utama masih memakai `fetch` manual.

Dampak:

- Refresh token tidak otomatis jalan untuk request dashboard/history/check.
- Kode auth tersebar di banyak file.
- Error handling menjadi tidak konsisten.

Cara fix:

Pilih salah satu:

1. Pakai `fetch` manual di semua tempat dan hapus `app/lib/api.ts`.
2. Pakai `api` dari `app/lib/api.ts` di semua request protected.

Rekomendasi:

Pakai satu pola saja. Untuk project ini, paling cepat adalah tetap pakai `fetch`, lalu hapus `app/lib/api.ts` kalau memang tidak dipakai. Kalau ingin refresh token otomatis, pakai `api` secara konsisten.

Checklist test:

- Cari pemakaian helper:

```bash
rg "from '../lib/api'|from '@/app/lib/api'|from './lib/api'"
```

- Kalau tidak ada import, berarti helper belum dipakai.

## Bug 9: Error Response Backend Belum Konsisten

Lokasi:

- Semua tempat frontend memanggil API, terutama:
- `app/check/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/dashboard/page.tsx`
- `app/history/page.tsx`

Masalah:

Backend bisa mengirim error dalam beberapa bentuk:

```json
{ "message": "..." }
```

```json
{ "message": "...", "detail": "..." }
```

```json
{ "message": "...", "error": "..." }
```

```json
{ "error": "..." }
```

Cara fix:

Buat helper kecil untuk mengambil pesan error:

```ts
const getApiErrorMessage = (data: any) => {
  return data?.message || data?.error || data?.detail || 'Terjadi kesalahan';
};
```

Saat response tidak OK, baca body dulu:

```ts
const data = await response.json().catch(() => null);

if (!response.ok) {
  throw new Error(getApiErrorMessage(data));
}
```

Checklist test:

- Error `{ message: 'A' }` harus menampilkan `A`.
- Error `{ error: 'B' }` harus menampilkan `B`.
- Error `{ detail: 'C' }` harus menampilkan `C`.
- Response error non-JSON tidak boleh crash.

## Bug 10: Dependency Lokal Belum Siap Untuk Lint/Build

Gejala:

Saat menjalankan:

```bash
npm run lint
```

Muncul:

```txt
eslint: not found
```

Masalah:

Dependency belum ter-install di workspace lokal.

Cara fix:

Jalankan:

```bash
npm install
```

Lalu validasi:

```bash
npm run lint
npm run build
```

Catatan:

Instruksi repo bilang harus membaca panduan Next.js di `node_modules/next/dist/docs/`, tapi folder `node_modules` belum tersedia. Setelah `npm install`, cek lagi apakah folder docs ada.

## Urutan Fix Yang Disarankan

1. Samakan URL backend dulu supaya semua halaman menembak backend yang sama.
2. Fix payload dan validasi BMI di `app/check/page.tsx`.
3. Tentukan strategi height/weight: simpan sebagai metadata di backend atau jangan tampilkan di history.
4. Fix normalisasi records lowercase/camelCase di dashboard dan history. Uppercase hanya fallback defensif.
5. Pastikan risiko `/records` membaca `diabetesRisk`, bukan `probability`.
6. Fix label risiko untuk `Low`, `Medium`, `High`, dan `Unknown`.
7. Bersihkan logout.
8. Putuskan refresh token: aktifkan route backend atau jangan pakai interceptor refresh.
9. Rapikan apakah mau pakai `fetch` manual atau `app/lib/api.ts`.
10. Jalankan lint dan build.

## Smoke Test Manual Setelah Semua Fix

Lakukan langkah ini dari browser:

1. Register akun baru.
2. Login.
3. Masuk halaman Check Kesehatan.
4. Isi data:

```json
{
  "HighBP": 0,
  "GenHlth": 1,
  "HighChol": 0,
  "Age": 1,
  "CholCheck": 0,
  "HvyAlcoholConsump": 0,
  "BMI": 23.5,
  "PhysActivity": 0,
  "Smoker": 0
}
```

5. Submit.
6. Jika tidak menyimpan height/weight, pastikan request payload di DevTools Network hanya berisi 9 field kontrak AI service.
7. Jika menyimpan height/weight, boleh ada metadata `Weight`/`Height` atau `weightKg`/`heightCm` ke backend, tetapi request backend ke AI service tetap harus hanya 9 field AI.
8. Pastikan response predict dibaca dari `resJson.data`, bukan langsung dari root object saja.
9. Pastikan hasil prediksi muncul.
10. Buka dashboard, pastikan BMI dan risk terakhir benar dari field records lowercase/camelCase.
11. Pastikan dashboard/history membaca risiko dari `diabetesRisk` untuk `/records`.
12. Buka history, pastikan record baru muncul dari field `bmi`, `highBP`, dan `highChol`.
13. Buka detail history, pastikan tidak ada tinggi/berat palsu.
14. Logout, pastikan localStorage bersih.
