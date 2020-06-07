import path from 'path';
import fs from 'fs-extra';
import eventually from 'wix-eventually';
import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-javascript',
});

describe.each(['dev'] as const)('yoshi-server route hmr [%s]', (mode) => {
  const routeFilePath = path.join(scripts.testDirectory, 'src/routes/app.js');
  const routeFilePathNew = path.join(
    scripts.testDirectory,
    'src/routes/app2.js',
  );

  afterEach(async () => {
    await fs.remove(routeFilePathNew);
  });
  it('route', async () => {
    await scripts[mode](async () => {
      await fs.copyFile(routeFilePath, routeFilePathNew);

      await eventually(async () => {
        await page.goto(`${scripts.serverUrl}/app2`, { timeout: 2000 });
        const title = await page.$eval('h1', (elm) => elm.innerHTML);
        expect(title).toBe('hello from yoshi server Yaniv');
      });
    });
  });
});
