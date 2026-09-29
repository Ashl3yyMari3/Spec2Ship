import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll } from 'vitest';

const workspaceDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'spec2ship-vitest-'),
);

process.env.SPEC2SHIP_WORKSPACE_DIR = workspaceDir;

afterAll(() => {
  fs.rmSync(workspaceDir, {
    recursive: true,
    force: true,
  });
});
