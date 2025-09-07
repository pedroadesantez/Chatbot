import express, { Request, Response, NextFunction } from 'express';
import { logger } from '../middleware/logger';

const router = express.Router();

// Get system stats
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = logger.getStats();
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      server: {
        uptime: Math.round(uptime),
        uptimeFormatted: formatUptime(uptime),
        nodeVersion: process.version,
        platform: process.platform,
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
      },
      requests: stats,
    });
  } catch (error) {
    next(error);
  }
});

// Get recent logs
router.get('/logs', (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = logger.getRecentLogs(Math.min(limit, 200)); // Max 200 logs
    
    res.json({
      logs,
      total: logs.length,
    });
  } catch (error) {
    next(error);
  }
});

// Clear logs (development only)
router.delete('/logs', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({ error: 'Not allowed in production' });
      return;
    }
    
    logger.clearLogs();
    res.json({ message: 'Logs cleared successfully' });
  } catch (error) {
    next(error);
  }
});

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default router;