import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/database.js';
import errorHandler from './middlewares/error.middleware.js';
import routes from './routes/route.js';
import config from './config/config.js';

const app = express();

// Connect to database
await connectDB();

// Body parser
app.use(express.json());

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Logger
if (config.env === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/web', routes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Error handling middleware
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${config.env} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

export default app;
