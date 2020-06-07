import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-typescript',
});

describe.each(['prod', 'dev'] as const)(
  'yoshi-server api server to server [%s]',
  (mode) => {
    it('run tests', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/app`);
        const title = await page.$eval('h1', (elm) => elm.innerHTML);
        expect(title).toBe('hello Yaniv');
      });
    });
  },
);
