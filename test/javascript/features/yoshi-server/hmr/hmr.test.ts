import path from 'path';
import fs from 'fs-extra';
import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-javascript',
});

describe.each(['dev'] as const)('yoshi-server route hmr [%s]', (mode) => {
  const routeFilePath = path.join(scripts.testDirectory, 'src/routes/app.js');
  const originalContent = fs.readFileSync(routeFilePath, 'utf-8');

  afterEach(() => {
    fs.writeFileSync(routeFilePath, originalContent);
  });
  it('route', async () => {
    await scripts[mode](async () => {
      await page.goto(`${scripts.serverUrl}/app`);
      const title = await page.$eval('h1', (elm) => elm.innerHTML);
      expect(title).toBe('hello from yoshi server Yaniv');

      const editedContent = originalContent.replace(
        'hello from yoshi server',
        'hello from hmr!',
      );

      fs.writeFileSync(routeFilePath, editedContent);

      await page.waitForNavigation();

      const newTitle = await page.$eval('h1', (elm) => elm.innerHTML);
      expect(newTitle).toBe('hello from hmr! Yaniv');
    });
  });
});

describe.each(['dev'] as const)(
  'yoshi-server api function hmr [%s]',
  (mode) => {
    const apiFilePath = path.join(
      scripts.testDirectory,
      'src/api/greeting.api.js',
    );
    const originalContent = fs.readFileSync(apiFilePath, 'utf-8');

    afterEach(() => {
      fs.writeFileSync(apiFilePath, originalContent);
    });
    it('api function', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/app`);
        const title = await page.$eval('h1', (elm) => elm.innerHTML);
        expect(title).toBe('hello from yoshi server Yaniv');

        const editedContent = originalContent.replace(
          'greeting: name',
          "greeting: name + ' with HMR!'",
        );

        fs.writeFileSync(apiFilePath, editedContent);

        await page.waitForNavigation();

        const newTitle = await page.$eval('h1', (elm) => elm.innerHTML);
        expect(newTitle).toBe('hello from yoshi server Yaniv with HMR!');
      });
    });
  },
);
