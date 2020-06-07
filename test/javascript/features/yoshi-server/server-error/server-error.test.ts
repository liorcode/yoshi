import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-javascript',
});

describe.each(['prod', 'dev'] as const)(
  'yoshi-server with 404 [%s]',
  (mode) => {
    it('run tests with 404', async () => {
      await scripts[mode](async () => {
        const result = await page.goto(`${scripts.serverUrl}/nothing`);

        expect(result?.status()).toBe(404);
      });
    });
  },
);

describe('yoshi-server with error, dev', () => {
  it('run tests with 500 - dev', async () => {
    await scripts.dev(async () => {
      await page.goto(`${scripts.serverUrl}/app`);

      const title = await page.$eval('.error-message', (elm) => elm.innerHTML);
      expect(title).toBe(' There was an error ');
    });
  });
});

describe('yoshi-server with error, prod', () => {
  page.removeAllListeners('pageerror');
  it('run tests with 500', async () => {
    await scripts.prod(async () => {
      await page.goto(`${scripts.serverUrl}/app`);
      const title = await page.$eval('h1', (elm) => elm.innerHTML);
      expect(title).toBe('Error 500 occurred');
    });
  });
});
