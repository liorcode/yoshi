import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-typescript',
});

describe.each(['prod', 'dev'] as const)(
  'yoshi-server init data, api [%s]',
  (mode) => {
    it('title should contain initData', async () => {
      await scripts[mode](
        async () => {
          await page.goto(`${scripts.serverUrl}/app`);
          await page.waitForFunction(
            `document.getElementById('my-text').innerText !== ''`,
          );
          const title = await page.$eval('h2', (elm) => elm.innerHTML);
          expect(title).toBe('hello Yaniv FOO');
        },
        { env: { YOSHI_SERVER_TEST: 'FOO' } },
      );
    });
  },
);

describe.each(['prod', 'dev'] as const)(
  'yoshi-server init data, route [%s]',
  (mode) => {
    it('title should have initData value', async () => {
      await scripts[mode](
        async () => {
          await page.goto(`${scripts.serverUrl}/app`);
          await page.waitForFunction(
            `document.getElementById('my-text').innerText !== ''`,
          );
          const title = await page.$eval('title', (elm) => elm.innerHTML);
          expect(title).toBe('FOO');
        },
        { env: { YOSHI_SERVER_TEST: 'FOO' } },
      );
    });
  },
);
