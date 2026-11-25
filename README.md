# QUANTAM EA v5 – Private Trading Community Platform

## Project Structure

```
src/
├── contexts/AuthContext.jsx      ← Auth + profile state
├── components/ProtectedRoute.jsx ← Role-based route guards
├── layouts/AppLayout.jsx         ← Collapsible sidebar + topbar
├── pages/
│   ├── ActivationGate.jsx        ← Numerical key gate (entry)
│   ├── AuthPage.jsx              ← Register / Login / Reset
│   ├── Dashboard.jsx             ← Member home with stat cards
│   ├── TradingSignals.jsx        ← BUY/SELL signals + admin CRUD
│   ├── MarketAnalysis.jsx        ← Articles + image upload
│   ├── EAInfo.jsx                ← EA details + file downloads
│   ├── Performance.jsx           ← Charts from real signal data
│   ├── LearningCentre.jsx        ← PDF / video / guide resources
│   ├── Announcements.jsx         ← Admin-posted announcements
│   ├── Community.jsx             ← Member community posts
│   ├── MyProfile.jsx             ← Profile + password change
│   ├── Support.jsx               ← Support tickets + FAQ
│   └── admin/AdminPanel.jsx      ← Full admin control panel
├── lib/supabase.js               ← Supabase client
├── App.jsx                       ← Router + providers
└── index.css                     ← Design system (CSS vars + utilities)

supabase/schema.sql               ← Full DB schema + RLS + RPC
```

## Setup (5 minutes)

### 1. Create Supabase Project
Go to [supabase.com](https://supabase.com) → New Project.  
Copy the **Project URL** and **anon public key** from Project Settings > API.

### 2. Run the Database Schema
In Supabase → SQL Editor → paste `supabase/schema.sql` → Run.

### 3. Environment Variables
Create `.env` in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Storage Bucket
Supabase → Storage → New Bucket → name: `media` → public: false.  
(The SQL schema creates the bucket and RLS policies automatically.)

### 5. Run Locally
```bash
npm install
npm run dev
```

### 6. Create Your Admin Account
1. Open the app, enter activation key `123456789` (sample key).
2. Register with your email.
3. In Supabase SQL Editor run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
4. Log back in → Admin Panel appears in the sidebar.

### 7. Generate Real Keys
Admin Panel → Activation Keys → generate numerical keys for members.

### 8. Build for Production
```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or Cloudflare Pages
```

---

## Feature Checklist

| Feature | ✓ |
|---|---|
| Numerical activation key gate | ✅ |
| Server-side key validation via Supabase RPC | ✅ |
| Registration / Login / Password reset | ✅ |
| Persistent sessions (no re-entering key) | ✅ |
| Protected member + admin routes | ✅ |
| Member dashboard with stat cards | ✅ |
| Trading signals (BUY/SELL cards + admin CRUD) | ✅ |
| Signal filters by pair and status | ✅ |
| Market analysis with chart image upload | ✅ |
| EA Information + download center | ✅ |
| Performance charts (real signal data only) | ✅ |
| Learning centre (PDF/video/guides) | ✅ |
| Announcements with priority levels | ✅ |
| Community forum posts | ✅ |
| My Profile + password change | ✅ |
| Support ticket submission | ✅ |
| Admin panel: overview statistics | ✅ |
| Admin: generate & bulk export keys | ✅ |
| Admin: revoke, extend, copy keys | ✅ |
| Admin: suspend / reactivate members | ✅ |
| Supabase Row Level Security (RLS) | ✅ |
| Role-based access control (no self-escalation) | ✅ |
| Collapsible sidebar | ✅ |
| Mobile responsive layouts | ✅ |
| Neon green premium dark theme | ✅ |
| Animated candlestick background | ✅ |
| Loading spinners + toast notifications | ✅ |

---

## Security Notes
- Activation keys are **never** in frontend JS — validated server-side via `SECURITY DEFINER` RPC.
- RLS policies block member-to-member data access and prevent role self-escalation.
- Revoked/expired keys are blocked at the database level.
- Storage files require active membership to access (no public URLs).
