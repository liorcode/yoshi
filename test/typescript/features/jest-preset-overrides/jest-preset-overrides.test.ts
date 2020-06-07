import Scripts from '../../../scripts';

jest.setTimeout(35000);

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('jest overrides [%s]', (mode) => {
  it('run tests', async () => {
    await scripts[mode](async () => {
      await scripts.test(mode);
    });
  });
});
