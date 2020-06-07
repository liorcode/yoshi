import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod'] as const)('verify dependencies [%s]', (mode) => {
  it('Default configuration should not throw warnings', async () => {
    await scripts[mode](async (buildResult) => {
      expect(buildResult.stderr).toMatch(
        "You have stated yoshi in 'dependencies', this may cause issues with consumers. please move yoshi to devDependencies",
      );
    });
  });
});
