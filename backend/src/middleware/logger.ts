import { Request, Response, NextFunction } from 'express';

export interface RequestLog {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  error?: string;
}

class Logger {
  private logs: RequestLog[] = [];
  private readonly MAX_LOGS = 1000;

  log(data: RequestLog) {
    this.logs.push(data);
    
    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const statusColor = data.statusCode >= 400 ? '\x1b[31m' : 
                         data.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
      const reset = '\x1b[0m';
      
      console.log(
        `${statusColor}${data.method} ${data.url} ${data.statusCode}${reset} - ${data.responseTime}ms`
      );
      
      if (data.error) {
        console.error('Error:', data.error);
      }
    }
  }

  getRecentLogs(limit: number = 100): RequestLog[] {
    return this.logs.slice(-limit);
  }

  getStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogs = this.logs.filter(log => log.timestamp > oneHourAgo);
    const dailyLogs = this.logs.filter(log => log.timestamp > oneDayAgo);
    
    const errorLogs = recentLogs.filter(log => log.statusCode >= 400);
    const avgResponseTime = recentLogs.length > 0 
      ? recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length
      : 0;

    return {
      totalRequests: this.logs.length,
      requestsLastHour: recentLogs.length,
      requestsLast24Hours: dailyLogs.length,
      errorsLastHour: errorLogs.length,
      averageResponseTime: Math.round(avgResponseTime),
      errorRate: recentLogs.length > 0 ? (errorLogs.length / recentLogs.length) * 100 : 0,
    };
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any, cb?: any): Response {
    const responseTime = Date.now() - startTime;
    
    const logData: RequestLog = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || (req as any).connection?.remoteAddress,
    };

    // Add error info if it's an error response
    if (res.statusCode >= 400) {
      logData.error = `HTTP ${res.statusCode}`;
    }

    logger.log(logData);
    
    // Call original end method and return the result
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  // Monitor memory usage
  const memUsage = process.memoryUsage();
  
  // Log high memory usage
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
    console.warn('High memory usage detected:', {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      url: req.url,
      method: req.method,
    });
  }

  next();
};