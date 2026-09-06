import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5001';
  process.env.SUPABASE_URL = 'https://mock-proj.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'mock-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';
});

afterAll(() => {
  // Cleanup test state
});
