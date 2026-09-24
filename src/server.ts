import 'dotenv/config';

import { app } from './app.js';
import { connectDatabase } from './config/database.js';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
	await connectDatabase();

	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

bootstrap().catch((error) => {
	console.error('Failed to start application:', error);
	process.exit(1);
});