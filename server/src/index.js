import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { authMiddleware } from './middleware/auth.js';
import { auditMiddleware } from './middleware/audit.js';

import authRoutes from './routes/auth.js';
import purchasesRoutes from './routes/purchases.js';
import transfersRoutes from './routes/transfers.js';
import assignmentsRoutes from './routes/assignments.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Public dev auth helper (for local only)
app.use('/auth', authRoutes);

// Protected routes
app.use('/api', authMiddleware, auditMiddleware, purchasesRoutes);
app.use('/api', authMiddleware, auditMiddleware, transfersRoutes);
app.use('/api', authMiddleware, auditMiddleware, assignmentsRoutes);
app.use('/api', authMiddleware, dashboardRoutes);
app.use('/api/admin', authMiddleware, auditMiddleware, adminRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});


