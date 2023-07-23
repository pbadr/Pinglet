import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import socketHandler from './socket-server/socket-handler';

export default defineConfig({
	plugins: [sveltekit(), {
		name: 'webSocketServer',
		configureServer(server: any) {
			socketHandler(server.httpServer);
		}
	}]
});
