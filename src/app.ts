import express from 'express';
import apiRouter from './routes/index.js';
import { appErrorHandler } from './common/errors/error-handler.js';
import { loggerMiddleware } from './common/logger/logger.js';
import { requestContext } from './common/logger/request-context.js';

export const app = express();

app.use(loggerMiddleware);
app.use(requestContext);

app.use(express.json());

app.use('/api/v1', apiRouter);
app.use(appErrorHandler);
