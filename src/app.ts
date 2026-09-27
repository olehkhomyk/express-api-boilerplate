import express from 'express';
import apiRouter from './routes/index.js';
import { appErrorHandler } from './common/errors/utills/error-handler.js';
import { loggerMiddleware } from './common/logger/logger.js';
import { requestContext } from './common/logger/request-context.js';
import cookieParser from 'cookie-parser';
import { API_PREFIX } from './common/http/api-prefix.js';
import { notFoundHandler } from './common/errors/not-found-hendler.js';

export const app = express();

app.use(loggerMiddleware);
app.use(requestContext);

app.use(cookieParser());
app.use(express.json());

app.use(API_PREFIX, apiRouter);
app.use(notFoundHandler);
app.use(appErrorHandler);
