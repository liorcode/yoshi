import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { STATICS_DIR } from 'yoshi-config/build/paths';

function getSslCertificate() {
  const customCertPath = process.env.CUSTOM_CERT_PATH;
  const customCertKeyPath = process.env.CUSTOM_CERT_KEY_PATH;

  if (customCertPath && customCertKeyPath) {
    return {
      cert: customCertPath,
      key: customCertKeyPath,
    };
  }

  return {
    cert: fs.readFileSync(
      require.resolve('yoshi-helpers/certificates/server.cert'),
      'utf-8',
    ),
    key: fs.readFileSync(
      require.resolve('yoshi-helpers/certificates/server.key'),
      'utf-8',
    ),
    passphrase: '1234',
  };
}

export async function startCDN({
  port,
  ssl,
  cwd,
}: {
  port: number;
  ssl: boolean;
  cwd: string;
}) {
  const app = express();

  app.use(cors());
  app.use(compression());
  app.use(express.static(path.join(cwd, STATICS_DIR)));

  const server = ssl
    ? https.createServer(getSslCertificate(), app)
    : http.createServer(app);

  await new Promise((resolve) => server.listen(port, resolve));

  return {
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
