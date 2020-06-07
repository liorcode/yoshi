import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['dev'] as const)('app-server [%s]', (mode) => {
  it('should support ts transpilation without throwing on type errors', async () => {
    await scripts[mode](async () => {
      await page.goto('http://localhost:3000');
      expect(await page.$eval('div', (element) => element.textContent)).toBe(
        'foo',
      );
    });
  });
});
