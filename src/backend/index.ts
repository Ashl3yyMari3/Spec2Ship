/**
 * index.ts — Backend entry point.
 * Starts the Express server on port 3001.
 * App creation is in server.ts so tests can import without opening a port.
 */
import { createApp } from './server.js';

const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`[spec2ship] Server running on port ${PORT}`);
});
