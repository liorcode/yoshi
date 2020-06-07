import path from 'path';
import fs from 'fs-extra';
import eventually from 'wix-eventually';
import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-javascript',
});

describe.each(['dev'] as const)(
  'yoshi-server api function hmr [%s]',
  (mode) => {
    // We create a new api file by copying 'src/api/greeting.js' -> 'src/api/greeting.api.js'.
    // We then point to this new api file by changing 'src/app.js' -> 'src/routes/app.js'
    const routeFilePath = path.join(scripts.testDirectory, 'src/app.js');
    const routeFilePathNew = path.join(
      scripts.testDirectory,
      'src/routes/app.js',
    );
    const apiFilePath = path.join(scripts.testDirectory, 'src/api/greeting.js');
    const apiFilePathNew = path.join(
      scripts.testDirectory,
      'src/api/greeting.api.js',
    );

    afterEach(async () => {
      await Promise.all([
        fs.remove(apiFilePathNew),
        fs.remove(routeFilePathNew),
      ]);
    });
    it('api function', async () => {
      await scripts[mode](async () => {
        await fs.copyFile(apiFilePath, apiFilePathNew);
        await fs.copyFile(routeFilePath, routeFilePathNew);
        await eventually(async () => {
          await page.goto(`${scripts.serverUrl}/app`);
          const title = await page.$eval('h1', (elm) => elm.innerHTML);
          expect(title).toBe('hello from yoshi server Yaniv');
        });
      });
    });
  },
);
