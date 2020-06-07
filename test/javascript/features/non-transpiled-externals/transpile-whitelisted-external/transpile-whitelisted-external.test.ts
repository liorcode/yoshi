import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)(
  'transpile whitelisted external [%s]',
  (mode) => {
    it('integration', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);
        const result = await page.$eval(
          '#transpile-default-external',
          (elm) => elm.textContent,
        );

        expect(result).toBe('Wix style react.');
      });
    });
  },
);
