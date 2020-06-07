import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-typescript',
});

describe.each(['prod', 'dev'] as const)(
  'yoshi-server csrf protection [%s]',
  (mode) => {
    it('should have csrf middleware - route', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/app`);

        const title = await page.title();
        expect(title).toBe('csrfProtected');
      });
    });
  },
);

describe.each(['prod', 'dev'] as const)(
  'yoshi-server csrf protection [%s]',
  (mode) => {
    it('should have csrf middleware - api function', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/app`);
        await page.waitForFunction(
          `document.getElementById('my-text').innerText !== ''`,
        );
        const title = await page.$eval('h2', (elm) => elm.innerHTML);
        expect(title).toBe('hello Yaniv csrfProtected');
      });
    });
  },
);
