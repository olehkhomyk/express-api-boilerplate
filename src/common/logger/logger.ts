import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

const LOG_LEVEL = process.env.LOG_LEVEL;
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
	level: LOG_LEVEL,
	redact: ['*.password', 'req.headers.authorization'],
	transport: {
		target: 'pino-pretty', options: {
			singleLine: true,
			translateTime: 'SYS:HH:MM:ss.l',
			ignore: 'pid,hostname,req,res,responseTime',
		},
	},
});

export const loggerMiddleware = pinoHttp({
	logger,
	quietReqLogger: true,
	customSuccessMessage: (req, res, ms) =>
		`${req.method} ${(req as Request).originalUrl} ${res.statusCode} ${ms}ms`,
	customLogLevel: (req, res, err) =>
		err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
	serializers: {
		req: (req) => ({ method: req.method, url: req.url }),   // без headers
		res: (res) => ({ statusCode: res.statusCode }),
	},
	genReqId: (req, res) => {
		const id = randomUUID();
		res.setHeader('X-Request-Id', id);
		return id;
	},
});
