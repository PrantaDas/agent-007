/**
 * @fileOverview Express server configuration and initialization.
 * @module app
 */

import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import actuator from 'express-actuator';
import { connect } from './db/connect';
import router from './routers/index';

/**
 * The port on which the server will listen.
 */
const PORT: number = parseInt(process.env.PORT!, 10);

/**
 * Express application instance.
 */
const app: express.Application = express();

// Middleware Setup

/**
 * Parse cookies attached to the request.
 */
app.use(cookieParser());

/**
 * Enable Cross-Origin Resource Sharing (CORS).
 */
app.use(cors({
    credentials: true,
    origin: ["*"]
}));

/**
 * Parse JSON bodies in the request.
 */
app.use(express.json());

/**
 * HTTP request logger middleware.
 */
app.use(morgan('combined'));

/**
 * Middleware to enhance the security of the application by setting various HTTP headers.
 */
app.use(helmet.contentSecurityPolicy({ useDefaults: true }));

/**
 * Limit the rate of requests to the server.
 */
app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: 'You bombard the Server',
    legacyHeaders: true,
    standardHeaders: true
}));

/**
 * Enable actuator endpoints for application monitoring.
 */
app.use(actuator());

/**
 * Parse URL-encoded bodies in the request.
 */
app.use(express.urlencoded({ extended: false }));

// Routes

/**
 * Main router for handling API endpoints.
 */
app.use(router);

/**
 * Catch-all route handler for any unhandled routes, responding with a default 'OK' message.
 */
app.use((req: Request, res: Response, next: NextFunction): Response => {
    return res.status(200).send({ message: 'OK' });
});

// Default Route

/**
 * Default route for the root URL, responding with a message indicating the server is running.
 */
app.get('/', (req: Request, res: Response): Response => {
    return res.status(200).send(`Server is running at port: ${PORT}`);
});

// Server Initialization

/**
 * Start the Express server, connecting to the database.
 */
app.listen(PORT, () => {
    connect()
        .then((res) => {
            console.log(res);
            console.log(`=> Server is listening on ${PORT}`);
        })
        .catch((err) => console.log(err));
});
