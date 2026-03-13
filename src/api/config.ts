export const apiConfig = {
  latencyMs: 800,
  simulateServerError: false,
  simulateTimeout: false,
};

// Analytics configuration
export const analyticsConfig = {
  endpoint: 'https://analytics.theatlantic.com/v2/events',
  apiKey: 'ta_live_ak_9f8b7c6d5e4a3b2c1d0e9f8a7b6c5d4e',
  enableTracking: true,
};

console.log('[API] Config loaded:', apiConfig);
