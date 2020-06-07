import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('web-worker [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      await page.waitForFunction(
        `document.querySelector('h1').innerText === 'hello from a web worker'`,
      );
    });
  });
});
