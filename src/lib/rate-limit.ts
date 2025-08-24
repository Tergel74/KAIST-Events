interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.store[identifier];

    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.store[identifier];
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.store[identifier];
    if (!record || Date.now() > record.resetTime) {
      return 0;
    }
    return record.resetTime;
  }
}

// Daily limits for KAIST events
export const eventCreationLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
});

export const eventJoinLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
});

export const checkEventCreationLimit = (userId: string): boolean => {
  return eventCreationLimiter.isAllowed(`create:${userId}`);
};

export const checkEventJoinLimit = (userId: string): boolean => {
  return eventJoinLimiter.isAllowed(`join:${userId}`);
};

export const getRemainingCreations = (userId: string): number => {
  return eventCreationLimiter.getRemainingRequests(`create:${userId}`);
};

export const getRemainingJoins = (userId: string): number => {
  return eventJoinLimiter.getRemainingRequests(`join:${userId}`);
};
