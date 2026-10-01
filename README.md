# 🌿 Personal Financial Advisor AI

> AI-powered personal finance platform with budgeting, expense tracking, goal monitoring, and Gemini-powered financial recommendations.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | MongoDB (auto in-memory fallback via `mongodb-memory-server`) |
| **Auth** | JWT + bcryptjs |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **Charts** | Recharts |

---

## 📁 Project Structure

```
nasscom/
├── backend/            # Node.js + Express API
│   ├── config/         # DB connection (with in-memory fallback)
│   ├── controllers/    # Auth, Finance, Expense, Goal, AI
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── services/       # Gemini AI service + fallback engine
│   ├── server.js       # App entry point
│   └── .env.example
└── frontend/           # React + Vite SPA
    ├── src/
    │   ├── api/        # Axios instance + service methods
    │   ├── components/ # Sidebar, Toast, ProtectedRoute
    │   ├── context/    # AuthContext (JWT session)
    │   └── pages/      # Dashboard, AI Advisor, Expenses, Goals, Profile
    └── .env.example
```

---

## 🚀 Quick Start

### 1. Clone / Open project
```bash
cd d:\nasscom
```

### 2. Install backend dependencies
```bash
cd backend && npm install
```

### 3. Configure backend environment
```bash
# Copy and edit:
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/financial_advisor_db  # optional
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_gemini_api_key_here  # optional - uses built-in engine if not set
CLIENT_URL=http://localhost:5173
```

### 4. Install frontend dependencies
```bash
cd frontend && npm install
```

### 5. Start backend
```bash
cd backend && npm run dev
```

> ⚠️ **First launch note**: If no MongoDB is installed locally, the server will auto-download MongoDB Memory Server (~600MB, one-time only). Wait for the download to complete before using the app.

### 6. Start frontend (new terminal)
```bash
cd frontend && npm run dev
```

### 7. Open the app
```
http://localhost:5173
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get JWT |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| PUT | `/api/auth/profile` | ✅ | Update user account |
| GET | `/api/finance` | ✅ | Get dashboard metrics + profile |
| POST | `/api/finance` | ✅ | Initialize financial profile |
| PUT | `/api/finance` | ✅ | Update financial profile |
| POST | `/api/finance/seed-demo` | ✅ | Load realistic demo data |
| GET | `/api/expenses` | ✅ | Get expenses (filter/search) |
| POST | `/api/expenses` | ✅ | Create expense |
| PUT | `/api/expenses/:id` | ✅ | Update expense |
| DELETE | `/api/expenses/:id` | ✅ | Delete expense |
| GET | `/api/goals` | ✅ | Get financial goals |
| POST | `/api/goals` | ✅ | Create goal |
| PUT | `/api/goals/:id` | ✅ | Update/fund goal |
| DELETE | `/api/goals/:id` | ✅ | Delete goal |
| POST | `/api/ai/advice` | ✅ | Get AI financial analysis |
| GET | `/api/health` | ❌ | Server health check |

---

## 🤖 Gemini AI Setup (Optional)

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Add it to `backend/.env`:  `GEMINI_API_KEY=your_key_here`
4. Restart backend

> **Without a key**: The app uses a built-in deterministic financial analysis engine that provides all the same insight categories using math-based calculations.

---

## 🗺️ Features & Pages

| Page | Features |
|---|---|
| **Login / Signup** | JWT auth, password strength meter, demo fill |
| **Dashboard** | Metric cards, pie chart, bar chart, recent expenses, goal progress, AI CTA |
| **AI Advisor** | Financial form, Gemini AI or fallback engine, 7-section accordion response |
| **Budget & Expenses** | Add/delete expenses, category filter, pie chart, budget progress bar |
| **Financial Goals** | CRUD goals, add funds, priority tags, progress bars, stats summary |
| **Profile & Settings** | Account info, financial profile editor, security info panel |

---

## 🔒 Security

- **Passwords**: bcrypt (10 salt rounds) — never stored plaintext
- **JWT**: 30-day tokens, stored in localStorage, validated per-request
- **API keys**: Backend-only, never exposed to frontend
- **Data isolation**: Every DB query is scoped to `req.user.id`
- **CORS**: Configurable `CLIENT_URL`

---

## 📌 Notes

- MongoDB will auto-use an **in-memory instance** if no local MongoDB server is found (data resets on backend restart)
- For **persistent storage**, install [MongoDB Community Edition](https://www.mongodb.com/try/download/community) and set `MONGODB_URI` in `backend/.env`
- The frontend build produces a production bundle in `frontend/dist/`
# NASSCOM
