/**
 * KrishiUrja Biorefinery Platform
 * Central Configuration & Environment Isolation
 * Vanilla JavaScript Architecture
 */
const KrishiConfig = Object.freeze({
  ENV: 'development',

  API_KEYS: {
    // OpenWeatherMap API Key (Replace with live key in production)
    OPENWEATHER: 'YOUR_API_KEY_HERE',

    // Google Maps JavaScript API Key (Replace with live restricted key in production)
    GOOGLE_MAPS: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',

    // Firebase Authentication SDK Configuration (Compat Version)
    FIREBASE: {
      apiKey: "YOUR_FIREBASE_KEY",
      authDomain: "krishiurja-biorefinery.firebaseapp.com",
      projectId: "krishiurja-biorefinery",
      storageBucket: "krishiurja-biorefinery.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890"
    }
  },

  ENDPOINTS: {
    API_BASE_URL: 'http://localhost:5000/api',
    WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    WHATSAPP_API: 'https://api.whatsapp.com/send'
  },

  BENCHMARKS: {
    DEFAULT_LAT: 30.9010, // Ludhiana, Punjab (Indo-Gangetic agricultural hub)
    DEFAULT_LON: 75.8073,
    CAPACITY_TONS_BENCHMARK: 50,
    CAPEX_BASE_CR: 4.80,
    OPEX_BASE_CR: 1.65,
    REVENUE_BASE_CR: 3.42
  }
});

// Expose to window for vanilla browser execution and module.exports for Node testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KrishiConfig;
}
if (typeof window !== 'undefined') {
  window.KrishiConfig = KrishiConfig;
}
