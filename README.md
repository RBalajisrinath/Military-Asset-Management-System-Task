## Military Asset Management System (Quick Start)

### What this is
- Manage assets across bases: purchases, transfers, assignments, expenditures, and a metrics dashboard.
- Roles: Admin, Base Commander, Logistics Officer (RBAC enforced on the API and reflected in the UI).

### 1) Supabase
1. In Supabase SQL Editor run, in order:
   - `supabase/schema.sql`
   - (Optional) `supabase/sample_data.sql` for demo data
2. Get your Project URL and service_role key (Settings → API).

### 2) Backend
```
cd server
copy .env.example .env   (Windows)  # or create .env
# Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm install
npm run dev
```
API health: http://localhost:4000/health

### 3) Frontend
```
cd client
copy .env.example .env   (Windows)  # or create .env
# Ensure VITE_API_BASE=http://localhost:4000
npm install
npm run dev
```
App: http://localhost:5173

### 4) Login
- Use the Login page to Register an Admin (or use sample users if you loaded sample_data.sql).
- After login:
  - Admin: Dashboard, Purchases, Transfers, Assignments, Admin
  - Base Commander: Dashboard, Assignments
  - Logistics Officer: Dashboard, Purchases, Transfers

### 5) Pages
- Dashboard: Enter Base ID (and optional Equipment Type / dates) to see Opening/Closing, Net Movement, Assigned, Expended. Click Net Movement for breakdown.
- Purchases: Create and view purchases (filters by type/date).
- Transfers: Move assets between bases; see history.
- Assignments: Assign to units/personnel; record expenditures.
- Admin: Create/delete Bases and Equipment Types.

### Notes
- All write actions are logged to `audit_logs`.
- Inventory `closing_balance` updates automatically via database functions.
