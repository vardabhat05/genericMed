import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  geminiApiKey?: string;
  appUrl?: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  geminiApiKey: process.env.GEMINI_API_KEY,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};
