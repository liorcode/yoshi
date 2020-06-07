import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)(
  'large image inclusion [%s]',
  (mode) => {
    it('integration', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);
        const imageSource = await page.$eval(
          '#large-external-image-inclusion',
          (elm) => (elm as HTMLImageElement).src,
        );

        expect(imageSource).toMatch(/^.+media\/large-bart-simpson\..{8}\.gif$/);
      });
    });

    it('component tests', async () => {
      await scripts.test(mode);
    });
  },
);
