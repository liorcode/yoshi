import Scripts from '../../../../scripts';

jest.setTimeout(40 * 1000);

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('e2e [%s]', (mode) => {
  it('server e2e test', async () => {
    await scripts[mode](async () => {
      await scripts.test(mode);
    });
  });
});
