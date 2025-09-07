// Input validation and sanitization utilities

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null characters and control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Encode HTML entities to prevent XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Validate message content
 */
export interface MessageValidation {
  valid: boolean;
  error?: string;
  sanitizedContent?: string;
}

export function validateMessage(content: string): MessageValidation {
  // Check if content exists
  if (!content) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  // Check if content is a string
  if (typeof content !== 'string') {
    return { valid: false, error: 'Message must be text' };
  }

  // Trim whitespace
  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  // Check length limits
  if (trimmed.length > 10000) {
    return { valid: false, error: 'Message is too long (maximum 10,000 characters)' };
  }

  if (trimmed.length < 1) {
    return { valid: false, error: 'Message is too short' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/gi,
    /<script\b/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { 
        valid: false, 
        error: 'Message contains potentially unsafe content' 
      };
    }
  }

  // Check for excessive repeated characters (potential spam)
  const repeatedCharPattern = /(.)\1{50,}/;
  if (repeatedCharPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Message contains too many repeated characters' 
    };
  }

  // Sanitize the content
  const sanitizedContent = sanitizeInput(trimmed);

  return { 
    valid: true, 
    sanitizedContent 
  };
}

/**
 * Rate limiting for client-side
 */
export class ClientRateLimit {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old timestamps outside the window
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check if under the limit
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    // Add current timestamp
    this.timestamps.push(now);
    return true;
  }

  getTimeUntilReset(): number {
    if (this.timestamps.length === 0) {
      return 0;
    }

    const oldestTimestamp = Math.min(...this.timestamps);
    const resetTime = oldestTimestamp + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

/**
 * Validate file uploads (for future file upload feature)
 */
export interface FileValidation {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidation {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File is too large (maximum 10MB)' 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File type not allowed' 
    };
  }

  // Check for suspicious file names
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
  const fileName = file.name.toLowerCase();
  
  for (const ext of suspiciousExtensions) {
    if (fileName.endsWith(ext)) {
      return { 
        valid: false, 
        error: 'File type not allowed for security reasons' 
      };
    }
  }

  return { valid: true };
}

/**
 * Content filtering for inappropriate content
 */
export function containsInappropriateContent(content: string): boolean {
  // Basic inappropriate content detection
  // In production, you might want to use a more sophisticated service
  const inappropriatePatterns = [
    // Add patterns for inappropriate content detection
    // This is a basic implementation
  ];

  const lowerContent = content.toLowerCase();
  
  return inappropriatePatterns.some(pattern => 
    typeof pattern === 'string' 
      ? lowerContent.includes(pattern.toLowerCase())
      : pattern.test(content)
  );
}

/**
 * Escape HTML for safe display
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Clean up conversation data for storage
 */
export function sanitizeConversationData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  // Deep clone and sanitize
  const sanitized = JSON.parse(JSON.stringify(data));

  if (Array.isArray(sanitized)) {
    return sanitized.map(item => {
      if (item && typeof item === 'object' && item.content) {
        const validation = validateMessage(item.content);
        if (validation.valid && validation.sanitizedContent) {
          item.content = validation.sanitizedContent;
        }
      }
      return item;
    });
  }

  return sanitized;
}