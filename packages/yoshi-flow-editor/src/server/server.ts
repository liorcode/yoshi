import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import httpTestkit from '@wix/wix-http-testkit';
import bodyParser from 'body-parser';
import cors from 'cors';
import importCwd from 'import-cwd';
import { AppConfig } from '../model';
import velocityDataPrivate from './velocity.private.data.json';
import velocityData from './velocity.data.json';
import renderVM from './vm';

const getSentryConfig = (config: AppConfig | null) => {
  return config?.sentry ?? null;
};

const serverDirectory = 'node_modules/yoshi-flow-editor/build/server';
const editorTemplate = path.resolve(__dirname, './templates/editorApp.vm');
const settingsTemplate = path.resolve(__dirname, './templates/settingsApp.vm');
const applicationConfig = importCwd.silent(
  './.application.json',
) as AppConfig | null;
const sentry = getSentryConfig(applicationConfig);

const server = httpTestkit.server({
  port: process.env.PORT ? Number(process.env.PORT) : undefined,
  ssl: {
    cert: fs.readFileSync(
      path.join(serverDirectory, 'certificates/cert.pem'),
      'utf-8',
    ),
    key: fs.readFileSync(
      path.join(serverDirectory, 'certificates/key.pem'),
      'utf-8',
    ),
    // @ts-ignore
    passphrase: '1234',
  },
});

const app = server.getApp();

app.use(bodyParser.json());
app.use(cors());

app.get(
  '/_api/wix-laboratory-server/laboratory/conductAllInScope',
  (req, res) => {
    const experiments = {
      ...velocityData.experiments,
      ...velocityDataPrivate.experiments,
    };
    res.json(experiments);
  },
);

app.use('/editor/:widgetName', (req, res) => {
  const { widgetName } = req.params;
  const { instance } = req.query;
  res.send(
    renderVM(editorTemplate, {
      widgetName,
      sentry,
      usePrivateSDKMock: !instance,
    }),
  );
});

app.use('/settings/:widgetName', (req, res) => {
  const { widgetName } = req.params;
  const { instance } = req.query;
  res.send(
    renderVM(settingsTemplate, {
      widgetName,
      sentry,
      usePrivateSDKMock: !instance,
    }),
  );
});

// Launch the server
server.start().then(
  () => {
    const baseUrl = server.getUrl();
    console.info(`Fake server is running on port ${baseUrl}`);
    console.info(`
Apps are available:
  Editor app: ${baseUrl}/editor/:widgetName
  Settings app: ${baseUrl}/settings/:widgetName
    `);
  },
  (err) => {
    console.error(
      `Fake server failed to start on port ${process.env.PORT}: ${err.message}`,
    );
  },
);
