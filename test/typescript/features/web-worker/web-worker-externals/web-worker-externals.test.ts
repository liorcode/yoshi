import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('web-worker externals [%s]', (mode) => {
  it('supports externals for web-worker', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      await page.waitForFunction(
        `document.querySelector('h1').textContent === 'Some external text'`,
      );
    });
  });
});
