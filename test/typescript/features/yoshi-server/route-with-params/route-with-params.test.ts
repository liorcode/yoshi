import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-typescript',
});

describe.each(['prod', 'dev'] as const)(
  'yoshi-server route with params [%s]',
  (mode) => {
    it('run tests', async () => {
      await scripts[mode](async () => {
        await page.goto(`${scripts.serverUrl}/users/user_123`);
        const title = await page.$eval('h1', (elm) => elm.textContent);
        expect(title).toBe('user_123');
      });
    });
  },
);
