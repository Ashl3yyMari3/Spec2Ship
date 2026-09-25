/**
 * index.ts — Backend entry point.
 * Starts the Express server on port 3001.
 * App creation is in server.ts so tests can import without opening a port.
 */
import { createApp } from './server.js';

const PORT = 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[spec2ship] Backend running on http://localhost:${PORT}`);
});
