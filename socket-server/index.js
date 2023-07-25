import express from 'express';
import { createServer } from 'http';

import socketHandler from './socket-handler/index.js';

import { handler } from '../build/handler.js';

const PORT = 5173;
const app = express();
const server = createServer(app);

// Handle WebSocket connections
socketHandler(server);

// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
