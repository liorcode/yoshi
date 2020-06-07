import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('class-properties [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      const text = await page.$eval(
        '#class-properties',
        (elm) => elm.innerHTML,
      );

      expect(text).toBe('class-properties are working!');
    });
  });
});
