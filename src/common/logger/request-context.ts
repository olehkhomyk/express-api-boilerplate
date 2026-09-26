import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestHandler } from 'express';
import type { Logger } from 'pino';
import { logger } from './logger.js';

const storage = new AsyncLocalStorage<{ log: Logger }>();

export const requestContext: RequestHandler = (req, _res, next) => {
	storage.run({ log: req.log }, next);
};
export const getLogger = (): Logger => storage.getStore()?.log ?? logger;
