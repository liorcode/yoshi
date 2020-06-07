import path from 'path';
import fs from 'fs-extra';
import Scripts from '../../../../scripts';
import { waitForPort, waitForPortToFree } from '../../../../utils';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

const clientFilePath = path.join(scripts.testDirectory, 'src/component.js');

const serverFilePath = path.join(scripts.testDirectory, 'src/server.js');

const originalServerContent = fs.readFileSync(serverFilePath, 'utf-8');

describe.each(['dev'] as const)('hmr [%s]', (mode) => {
  describe('client side', () => {
    it('integration', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);
        await page.$eval('#css-inclusion', (elm) => elm.getAttribute('class'));

        expect(
          await page.$eval('#css-inclusion', (elm) => elm.textContent),
        ).toBe('CSS Modules are working!');

        const originalContent = fs.readFileSync(clientFilePath, 'utf-8');

        const editedContent = originalContent.replace(
          'CSS Modules are working!',
          'Overridden content!',
        );

        fs.writeFileSync(clientFilePath, editedContent);

        await page.waitForNavigation();

        expect(
          await page.$eval('#css-inclusion', (elm) => elm.textContent),
        ).toBe('Overridden content!');

        fs.writeFileSync(clientFilePath, originalContent);

        await page.waitForNavigation();

        expect(
          await page.$eval('#css-inclusion', (elm) => elm.textContent),
        ).toBe('CSS Modules are working!');
      });
    });
  });
  describe('server side', () => {
    it('reloads server on changes and reloads the browser', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);

        expect(await page.title()).toBe('Some title');

        fs.writeFileSync(
          serverFilePath,
          originalServerContent.replace('Some title', 'Overridden title!'),
        );

        await page.waitForNavigation();

        expect(await page.title()).toBe('Overridden title!');

        fs.writeFileSync(serverFilePath, originalServerContent);

        await waitForPort(3000);

        await page.waitForNavigation();

        expect(await page.title()).toBe('Some title');
      });
    });

    it('shows error overlay on the browser', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);

        expect(await page.title()).toBe('Some title');

        fs.writeFileSync(serverFilePath, '<<< error');

        await page.waitForSelector('#webpack-dev-server-client-overlay');

        fs.writeFileSync(serverFilePath, originalServerContent);

        await waitForPort(3000);

        await page.waitForNavigation();

        expect(await page.title()).toBe('Some title');
      });
    });

    it('restarts server if it dies', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);

        expect(await page.title()).toBe('Some title');

        fs.writeFileSync(serverFilePath, 'process.exit(1);');

        await waitForPortToFree(3000);

        fs.writeFileSync(serverFilePath, originalServerContent);

        await waitForPort(3000);

        await page.waitForNavigation();

        expect(await page.title()).toBe('Some title');
      });
    });
  });
});
