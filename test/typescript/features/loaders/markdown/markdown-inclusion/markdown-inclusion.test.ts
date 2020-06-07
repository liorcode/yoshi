import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('markdown inclusion [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      const innerHTML = await page.$eval(
        '#markdown-inclusion',
        (elm) => elm.innerHTML,
      );

      expect(innerHTML.replace(/\n/g, '')).toEqual('## Hello World');
    });
  });

  it('component tests', async () => {
    await scripts.test(mode);
  });
});
