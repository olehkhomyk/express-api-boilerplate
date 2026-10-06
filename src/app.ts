import express from 'express';
import apiRouter from './routes/index.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import timeout from 'connect-timeout';
import { appErrorHandler } from './common/errors/utills/error-handler.js';
import { loggerMiddleware } from './common/logger/logger.js';
import { requestContext } from './common/logger/request-context.js';
import { API_PREFIX } from './common/http/api-prefix.js';
import { notFoundHandler } from './common/errors/utills/not-found-hendler.js';
import { env } from './config/env.js';

export const app = express();

// Behind a proxy, trust its X-Forwarded-* headers so req.ip is the real client IP
// (needed for rate limiting) and req.protocol reflects https. 0 disables it.
app.set('trust proxy', env.TRUST_PROXY);

app.use(loggerMiddleware);
app.use(requestContext);
app.use(timeout(env.REQUEST_TIMEOUT_MS));


app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));

app.use(cookieParser());
app.use(express.json());

app.use(API_PREFIX, apiRouter);
app.use(notFoundHandler);
app.use(appErrorHandler);
