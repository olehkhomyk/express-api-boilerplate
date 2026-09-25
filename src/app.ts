import express from 'express';
import apiRouter from './routes/index.js';
import { appErrorHandler } from './common/errors/error-handler.js';

export const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
	res.json({
		status: 'ok',
	});
});

app.use('/api/v1', apiRouter);
app.use(appErrorHandler);
