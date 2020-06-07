import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)(
  'component svg inclusion [%s]',
  (mode) => {
    it('integration', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);
        const result = await page.$eval(
          '#component-svg-inclusion',
          (elm) => elm.innerHTML,
        );

        expect(result).toMatch(/(<svg)([^<]*|[^>]*)/);
      });
    });

    it('component tests', async () => {
      await scripts.test(mode);
    });
  },
);
