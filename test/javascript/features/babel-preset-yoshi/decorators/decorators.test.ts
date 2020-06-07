import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('decorators [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);

      const text = await page.$eval('#decorators', (elm) => elm.innerHTML);

      expect(text).toBe('decorators are working!');
    });
  });
});
