import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['dev'] as const)('dev-server [%s]', (mode) => {
  it('shows the contents of static assets', async () => {
    await scripts[mode](async () => {
      await page.goto('http://localhost:3200');

      const list = await page.$$eval('#files li .name', (spans) => {
        return spans.map((span) => span.textContent);
      });

      expect(list).toEqual(
        expect.arrayContaining(['app.bundle.js', 'manifest.json', 'assets']),
      );
    });
  });

  it('shows the contents of assets dir', async () => {
    await scripts[mode](async () => {
      await page.goto('http://localhost:3200/assets');

      const list = await page.$$eval('#files li .name', (spans) => {
        return spans.map((span) => span.textContent);
      });

      expect(list).toContain('hello.txt');
    });
  });
});
