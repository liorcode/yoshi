import { Page } from 'puppeteer';
import Scripts from '../../../../scripts';

jest.setTimeout(30 * 1000);

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-typescript',
});

describe.each(['dev'] as const)(
  'yoshi-server api client to server - show an error message for development [%s]',
  (mode) => {
    let page: Page;
    afterEach(() => page.close());
    it('run tests', async () => {
      await scripts[mode](async () => {
        page = await browser.newPage();
        await page.goto(`${scripts.serverUrl}/app`);
        await page.waitForSelector('.popover');

        expect(await page.$eval('.popover', (el) => el.innerHTML)).toMatch(
          'A cool error',
        );
      });
    });
  },
);
