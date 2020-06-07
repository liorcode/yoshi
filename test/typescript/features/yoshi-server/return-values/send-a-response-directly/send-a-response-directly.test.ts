import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-typescript',
});

describe.each(['prod', 'dev'] as const)(
  'send a value directly [%s]',
  (mode) => {
    it('integration', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/app`);
        const title = await page.$eval('h1', (elm) => elm.innerHTML);
        expect(title).toBe('hello Yaniv');
      });
    });

    it('have only one header', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/app`);
        const titles = await page.$$('h1');
        expect(titles.length).toBe(1);
      });
    });
  },
);
