import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('e2e [%s]', (mode) => {
  it('run tests', async () => {
    await scripts[mode](async () => {
      await scripts.test(mode);
    });
  });
});
