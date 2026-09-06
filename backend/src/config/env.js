import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env before validation
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5050').transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  SUPABASE_URL: z.string().url().default('https://mock-proj.supabase.co'),
  SUPABASE_ANON_KEY: z.string().min(1).default('mock_anon_key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default('mock_service_role_key'),
  
  JWT_SECRET: z.string().min(16).default('hydrapure_jwt_secret_dev_key_jharkhand_secure_2026'),
  
  IOT_API_KEY: z.string().default('hp_iot_dev_key_jharkhand_2026'),
  IOT_DEVICE_SECRET: z.string().default('hp_secret_mesh_991827410'),
  
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5000').transform(val => 
    val.split(',').map(origin => origin.trim())
  ),
  
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  MOBILE_APP_URL: z.string().default('hydrapure://app'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
