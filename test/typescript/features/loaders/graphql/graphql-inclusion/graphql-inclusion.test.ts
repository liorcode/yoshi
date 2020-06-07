import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('graphql inclusion [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      const innerHTML = await page.$eval(
        '#graphql-inclusion',
        (elm) => elm.innerHTML,
      );

      expect(JSON.parse(innerHTML)).toMatchObject({ kind: 'Document' });
    });
  });

  it('component tests', async () => {
    await scripts.test(mode);
  });
});
