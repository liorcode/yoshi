import express from 'express';
import { launch, LaunchedChrome } from 'chrome-launcher';

const LOCAL_AUTH_APP_PORT = 5151;
const LOCAL_AUTH_APP_URL = `https://editor.wix.com/html/editor/web/renderer/render/document/828d4907-cc59-4f83-82fb-b2e5a931e414?isEdited=true&isEditor=true&isSantaEditor=true&dsOrigin=Editor1.4&controllersUrlOverride=&lang=en&metaSiteId=104f095d-3d11-48e0-807a-38786d6cae12`;
const FALLBACK_DELAY = 60000;

function waitForInstance(): Promise<string | null> {
  return new Promise(async (resolve) => {
    const tm = setTimeout(() => {
      resolve(null);
    }, FALLBACK_DELAY);
    const app = express();
    let _chrome: LaunchedChrome | null = null;
    const connections: Array<any> = [];
    app.get(
      '/instance',
      async (req: express.Request, res: express.Response) => {
        const { instance = null } = req.query;
        if (typeof instance === 'string' || instance === null) {
          res.send();
          cleanUp();
          resolve(instance);
        }
        resolve(null);
      },
    );
    const server = app.listen(LOCAL_AUTH_APP_PORT);
    server.on('connection', (connection: any) => {
      connections.push(connection);
    });
    const cleanUp = async () => {
      if (_chrome) {
        _chrome.kill();
      }
      clearTimeout(tm);
      server.close();
      connections.forEach((curr) => {
        curr.end();
        curr.destroy();
      });
    };
    _chrome = await openExistingChrome();
  });
}

async function openExistingChrome(): Promise<LaunchedChrome | null> {
  try {
    const chrome = await launch({
      startingUrl: LOCAL_AUTH_APP_URL,
      userDataDir: false,
      chromeFlags: ['--disable-gpu', '--no-sandbox'],
    });
    return chrome;
  } catch (ex) {}
  return null;
}

export async function getInstance(): Promise<string | null> {
  console.info(
    `⌛️ We need to receive your Wix instance. Please sign in if needed.`,
  );
  const instance = await waitForInstance();
  console.info(`🎉 your machine is authenticated.`);
  return instance;
}
