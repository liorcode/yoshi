import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod'] as const)(
  'fails with typescript syntax errors [%s]',
  (mode) => {
    it('integration', async () => {
      try {
        await scripts[mode]();
      } catch (error) {
        expect(error.message).toMatch('Type error: Expression expected');
      }
    });
  },
);
