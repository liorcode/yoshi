import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe('Yoshi, serve', () => {
  it('should notify is yoshi build was not run', async () => {
    expect.assertions(1);

    await scripts.serve(
      () => Promise.resolve(),
      (e) => {
        expect(e.message).toMatch(
          'dist/statics directory is empty. Run the build before running serve',
        );
      },
    );
  });

  it('should return prod build when running yoshi serve', async () => {
    await scripts.build();

    await scripts.serve(async () => {
      await page.goto(scripts.serverUrl);

      const result = await page.$eval('#node-env', (elm) => elm.textContent);

      expect(result).toEqual('production');
    });
  });
});
