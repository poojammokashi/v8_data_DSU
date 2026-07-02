export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  appName: import.meta.env.VITE_APP_NAME || 'Voltura',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  // When true, every API call resolves from src/mocks/seedData.js instead
  // of hitting the network. Defaults to true so the app is usable out of
  // the box before a backend is running; flip to false once the FastAPI
  // server is up.
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',

  accessTokenKey: import.meta.env.VITE_ACCESS_TOKEN_KEY || 'voltura_access_token',
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'voltura_refresh_token',
};
