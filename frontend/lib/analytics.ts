'use client';

interface AnalyticsEvent {
  event: string;
  data?: Record<string, any>;
  timestamp: Date;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 500;
  private sessionId: string;
  private sessionStart: Date;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event
   */
  track(event: string, data?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data: {
        ...data,
        sessionId: this.sessionId,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      },
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics:', event, data);
    }

    // In production, you might want to send to an analytics service
    // this.sendToAnalyticsService(analyticsEvent);
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(action: string, element?: string, data?: Record<string, any>) {
    this.track('user_interaction', {
      action,
      element,
      ...data,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, data?: Record<string, any>) {
    this.track('performance', {
      metric,
      value,
      ...data,
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
    });
  }

  /**
   * Track chat-specific events
   */
  trackChatEvent(event: string, data?: Record<string, any>) {
    this.track(`chat_${event}`, data);
  }

  /**
   * Track message events
   */
  trackMessage(type: 'sent' | 'received' | 'retry' | 'error', data?: Record<string, any>) {
    this.track('message', {
      type,
      ...data,
    });
  }

  /**
   * Track session metrics
   */
  trackSessionMetrics() {
    const now = new Date();
    const sessionDuration = now.getTime() - this.sessionStart.getTime();
    const chatEvents = this.events.filter(e => e.event.startsWith('chat_'));
    const messagesSent = this.events.filter(e => e.event === 'message' && e.data?.type === 'sent');
    const errorsCount = this.events.filter(e => e.event === 'error');

    this.track('session_summary', {
      duration: sessionDuration,
      totalEvents: this.events.length,
      chatEvents: chatEvents.length,
      messagesSent: messagesSent.length,
      errors: errorsCount.length,
    });
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const now = new Date();
    const sessionDuration = now.getTime() - this.sessionStart.getTime();
    const chatEvents = this.events.filter(e => e.event.startsWith('chat_'));
    const messagesSent = this.events.filter(e => e.event === 'message' && e.data?.type === 'sent');
    const messagesReceived = this.events.filter(e => e.event === 'message' && e.data?.type === 'received');
    const errors = this.events.filter(e => e.event === 'error');

    return {
      sessionId: this.sessionId,
      sessionStart: this.sessionStart,
      sessionDuration,
      totalEvents: this.events.length,
      chatEvents: chatEvents.length,
      messagesSent: messagesSent.length,
      messagesReceived: messagesReceived.length,
      errors: errors.length,
      averageResponseTime: this.calculateAverageResponseTime(),
    };
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    const performanceEvents = this.events.filter(e => 
      e.event === 'performance' && e.data?.metric === 'response_time'
    );

    if (performanceEvents.length === 0) return 0;

    const totalTime = performanceEvents.reduce((sum, event) => sum + (event.data?.value || 0), 0);
    return totalTime / performanceEvents.length;
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 50): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = [];
  }

  /**
   * Send events to analytics service (placeholder)
   */
  private sendToAnalyticsService(event: AnalyticsEvent) {
    // In production, implement actual analytics service integration
    // Examples: Google Analytics, Mixpanel, Amplitude, custom API
    
    // Example implementation:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
  }

  /**
   * Track page view
   */
  trackPageView(page?: string) {
    this.track('page_view', {
      page: page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    });
  }

  /**
   * Start tracking session automatically
   */
  startSession() {
    this.trackPageView();
    this.track('session_start');

    // Track session end on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.trackSessionMetrics();
        this.track('session_end');
      });
    }
  }
}

export const analytics = new Analytics();

// Auto-start session tracking
if (typeof window !== 'undefined') {
  analytics.startSession();
}

// Helper functions for common tracking scenarios
export const trackUserAction = (action: string, data?: Record<string, any>) => {
  analytics.trackUserInteraction(action, undefined, data);
};

export const trackMessageSent = (messageLength: number, conversationId: string) => {
  analytics.trackMessage('sent', {
    messageLength,
    conversationId,
    timestamp: new Date().toISOString(),
  });
};

export const trackMessageReceived = (responseTime: number, messageLength: number, conversationId: string) => {
  analytics.trackMessage('received', {
    messageLength,
    conversationId,
    timestamp: new Date().toISOString(),
  });
  
  analytics.trackPerformance('response_time', responseTime, {
    conversationId,
  });
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};