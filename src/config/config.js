import dotenv from 'dotenv';

// Load env vars
dotenv.config();

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoose: {
    url: process.env.MONGODB_URI,
    options: {},
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes: process.env.JWT_EXPIRE || '24h',
  },
  bunny: {
    videoLibraryId: process.env.BUNNY_VIDEO_LIBRARY_ID,
    apiKey: process.env.BUNNY_API_KEY,
    webhookSecret: process.env.BUNNY_WEBHOOK_SECRET,
    streamTokenKey: process.env.BUNNY_STREAM_TOKEN_KEY,
  },
  timezone: 'Asia/Kolkata',
};
