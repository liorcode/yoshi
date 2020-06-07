import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('json inclusion [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);

      const result = await page.$eval(
        '#json-inclusion',
        (elm) => elm.textContent,
      );

      expect(result).toBe('This is an abstract.');
    });
  });

  it('component tests', async () => {
    await scripts.test(mode);
  });
});
