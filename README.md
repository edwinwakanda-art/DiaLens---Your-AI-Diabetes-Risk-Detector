# DiaLens Frontend

Frontend untuk aplikasi DiaLens — sistem prediksi risiko diabetes berbasis AI. Dibangun dengan Next.js App Router, Tailwind CSS, dan TypeScript.

## Fitur

- **Check Kesehatan** — Form input biometrik (tinggi, berat, tekanan darah, kolesterol, dll) dengan kalkulasi BMI otomatis dan hasil prediksi risiko dari AI.
- **Dashboard** — Ringkasan total skrining, BMI terakhir, status risiko AI, grafik tren BMI & risiko, serta rekomendasi klinis dari AI.
- **Riwayat (History)** — Tabel log semua pemeriksaan dengan detail modal, ekspor PDF, dan fitur hapus.
- **Autentikasi** — Login & register dengan JWT token.
- **Responsive** — Sidebar desktop + drawer mobile.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Icons | Lucide React |
| PDF Export | html2canvas-pro + jsPDF |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_API_URL=https://dialens-backend-production.up.railway.app
```

Ganti URL di atas ke backend lokal/staging jika diperlukan:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Project Structure

```
app/
├── page.tsx              # Landing page
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── login/page.tsx        # Halaman login
├── register/page.tsx     # Halaman register
├── check/page.tsx        # Form skrining kesehatan + hasil prediksi AI
├── dashboard/page.tsx    # Dashboard ringkasan + grafik tren
├── history/page.tsx      # Riwayat pemeriksaan + detail modal + PDF export
├── information/page.tsx  # Halaman informasi
├── about/page.tsx        # Halaman tentang
├── components/
│   └── Sidebar.tsx       # Komponen sidebar navigasi
└── lib/
    ├── api-url.ts                # Shared base URL backend
    └── get-api-error-message.ts  # Helper parsing error response
```

## API Contract

### Predict (`POST /api/health/predict`)

Request body (9 field AI + metadata):

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
  "Smoker": 0,
  "Weight": 68,
  "Height": 170
}
```

Response:

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

### Records (`GET /api/health/records`)

Response (lowercase/camelCase, numeric sebagai string):

```json
[
  {
    "id": "...",
    "date": "...",
    "age": "1",
    "weight": "68",
    "height": "170",
    "bmi": "23.5",
    "highBP": "1",
    "highChol": "0",
    "risk_level": "medium",
    "diabetesRisk": 0.55,
    "ai_recommendation": "...",
    "topRiskFactors": []
  }
]
```

## License

Private — hanya untuk penggunaan klinis dan penelitian.
