import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-javascript',
});

describe.each(['prod', 'dev'] as const)(
  'yoshi-server api client to server, react[%s]',
  (mode) => {
    it('run tests', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/app`);
        await page.waitForSelector('h2');
        const title = await page.$eval('h2', (elm) => elm.innerHTML);
        expect(title).toBe('hello Yaniv');
      });
    });

    it('component tests', async () => {
      await scripts[mode](async () => {
        await scripts.test(mode);
      });
    });
  },
);
