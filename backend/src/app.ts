import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

const app: Express = express();

// Trust proxy for secure headers behind ingress/reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome & API info
app.get('/', (req: Request, res: Response) => {
  res.json({
    project: 'Campus Event Ticketing Engine',
    institute: 'Siddaganga Institute of Technology, Tumakuru',
    course: 'Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      bookings: '/api/bookings',
      validation: '/api/validation',
      admin: '/api/admin',
      health: '/api/health',
    },
  });
});

// Mount API routes under /api
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
