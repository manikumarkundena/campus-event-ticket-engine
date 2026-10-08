import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error: any) {
    dbStatus = `unhealthy: ${error.message}`;
  }

  const isHealthy = dbStatus === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DOWN',
    service: 'campus-event-ticketing-backend',
    institute: 'Siddaganga Institute of Technology, Tumakuru',
    project: 'Campus Event Ticketing Engine (SPM ABL-1)',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    components: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      process: {
        status: 'healthy',
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    },
    responseTimeMs: Date.now() - startTime,
  });
}
