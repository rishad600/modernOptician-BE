import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(5000),

    MONGODB_URI: Joi.string().required(),

    JWT_SECRET: Joi.string().min(32).required()
        .messages({ 'string.min': 'JWT_SECRET must be at least 32 characters' }),
    JWT_EXPIRE: Joi.string().default('24h'),

    SMTP_HOST: Joi.string().default('smtp.gmail.com'),
    SMTP_PORT: Joi.number().default(587),
    SMTP_USER: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
    FROM_EMAIL: Joi.string().email().required(),
    FROM_NAME: Joi.string().required(),

    BUNNY_VIDEO_LIBRARY_ID: Joi.string().required(),
    BUNNY_API_KEY: Joi.string().required(),
    BUNNY_WEBHOOK_SECRET: Joi.string().required(),
    BUNNY_STREAM_TOKEN_KEY: Joi.string().required(),
    BUNNY_STORAGE_ZONE_NAME: Joi.string().required(),
    BUNNY_STORAGE_ACCESS_KEY: Joi.string().required(),
    BUNNY_STORAGE_PULL_ZONE_URL: Joi.string().uri().required(),

    PAYPAL_CLIENT_ID: Joi.string().required(),
    PAYPAL_CLIENT_SECRET: Joi.string().required(),
    PAYPAL_API_BASE: Joi.string().uri().default('https://api-m.sandbox.paypal.com'),
    PAYPAL_WEBHOOK_ID: Joi.string().required(),

    ALLOWED_ORIGINS: Joi.string().default(''),

    BODY_LIMIT: Joi.string().default('256kb'),
}).unknown(true);

const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join('\n');
    console.error(`Invalid environment configuration:\n${details}`);
    process.exit(1);
}

const allowedOrigins = env.ALLOWED_ORIGINS
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

export default {
    env: env.NODE_ENV,
    port: env.PORT,
    mongoose: {
        url: env.MONGODB_URI,
        options: {},
    },
    jwt: {
        secret: env.JWT_SECRET,
        accessExpirationMinutes: env.JWT_EXPIRE,
    },
    bunny: {
        videoLibraryId: env.BUNNY_VIDEO_LIBRARY_ID,
        apiKey: env.BUNNY_API_KEY,
        webhookSecret: env.BUNNY_WEBHOOK_SECRET,
        streamTokenKey: env.BUNNY_STREAM_TOKEN_KEY,
        storageZoneName: env.BUNNY_STORAGE_ZONE_NAME,
        storageAccessKey: env.BUNNY_STORAGE_ACCESS_KEY,
        storagePullZoneUrl: env.BUNNY_STORAGE_PULL_ZONE_URL,
    },
    paypal: {
        clientId: env.PAYPAL_CLIENT_ID,
        clientSecret: env.PAYPAL_CLIENT_SECRET,
        apiBase: env.PAYPAL_API_BASE,
        webhookId: env.PAYPAL_WEBHOOK_ID,
    },
    cors: {
        allowedOrigins,
    },
    bodyLimit: env.BODY_LIMIT,
    timezone: 'Asia/Kolkata',
};
