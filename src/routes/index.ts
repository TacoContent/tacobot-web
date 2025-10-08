

import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router: Router = Router();

const ROUTES_DIR = __dirname;

function isRouterFile(filePath: string) {
	// Exclude index.ts itself
	const base = path.basename(filePath);
	if (base === 'index.ts' || base === 'index.js') return false;
	// Only .ts or .js files
	return base.endsWith('.ts') || base.endsWith('.js');
}

function importRouter(filePath: string) {
	// Remove extension for require
	const relPath = './' + path.relative(ROUTES_DIR, filePath).replace(/\\/g, '/').replace(/\.(ts|js)$/, '');
	// eslint-disable-next-line @typescript-eslint/no-var-requires @typescript-eslint/no-require-imports
	const mod = require(relPath);
	// Support both default and named export
	return mod.default || mod;
}

function loadRouters(dir: string) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			loadRouters(fullPath);
		} else if (isRouterFile(fullPath)) {
			try {
				const dynamicRouter = importRouter(fullPath);
				if (typeof dynamicRouter === 'function' || typeof dynamicRouter === 'object') {
					router.use('/', dynamicRouter);
				}
			} catch {
				// Optionally log error
			}
		}
	}
}

loadRouters(ROUTES_DIR);

export default router;
