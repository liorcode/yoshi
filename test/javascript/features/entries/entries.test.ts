import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('entries [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(`${scripts.serverUrl}/other`);
      const innerHTML = await page.$eval('#other', (elm) => elm.innerHTML);

      expect(innerHTML).toEqual('Other App');
    });
  });
});
