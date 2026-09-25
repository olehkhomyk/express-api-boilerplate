import { z } from 'zod';

export const mongoDbIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB id');
