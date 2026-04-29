import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/database.js';
import errorHandler from './middlewares/error.middleware.js';
import routes from './routes/routes.js';
import config from './config/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files for frontend testing
app.use(express.static(path.join(__dirname, 'public')));

// Connect to database
await connectDB();

// Body parser with size limit; rawBody captured only for webhook signature verification.
app.use(express.json({
    limit: config.bodyLimit,
    verify: (req, res, buf) => {
        if (req.originalUrl.startsWith('/web/webhooks/')) {
            req.rawBody = buf;
        }
    }
}));

// Set security HTTP headers
app.use(helmet());

// CORS: in production, restrict to ALLOWED_ORIGINS. In dev with no list, allow all (with a warning).
const { allowedOrigins } = config.cors;
if (allowedOrigins.length === 0) {
    if (config.env === 'production') {
        console.error('ALLOWED_ORIGINS must be set in production. Refusing to start with wildcard CORS.');
        process.exit(1);
    } else {
        console.warn('[cors] ALLOWED_ORIGINS is empty; allowing all origins (development only).');
        app.use(cors());
    }
} else {
    app.use(cors({
        origin: (origin, cb) => {
            // Same-origin / server-to-server / curl requests have no Origin header.
            if (!origin) return cb(null, true);
            if (allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
    }));
}

// Logger
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Routes
app.use('/web', routes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// 404 fallback for unmatched routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found', code: 404 });
});

// Error handling middleware
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${config.env} mode on port ${PORT}`);
});

// Graceful shutdown: stop accepting new connections, drain in-flight requests, close Mongo.
// 10s hard timeout in case something is stuck.
const shutdown = (signal) => async () => {
    console.log(`Received ${signal}, shutting down...`);
    const forceExit = setTimeout(() => {
        console.error('Shutdown took too long, forcing exit');
        process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
        try {
            await mongoose.connection.close();
        } catch (err) {
            console.error('Error closing mongo connection:', err);
        }
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
});

export default app;
