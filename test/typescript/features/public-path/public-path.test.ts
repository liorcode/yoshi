import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('public path [%s]', (mode) => {
  const publicPath = 'http://some-public-path/';

  it('overrides public path by YOSHI_PUBLIC_PATH env var', async () => {
    await scripts[mode](
      async () => {
        await page.goto(scripts.serverUrl);

        const result = await page.$eval('#component', (elm) => elm.textContent);

        expect(result).toBe(publicPath);
      },
      { env: { YOSHI_PUBLIC_PATH: publicPath } },
    );
  });
});
