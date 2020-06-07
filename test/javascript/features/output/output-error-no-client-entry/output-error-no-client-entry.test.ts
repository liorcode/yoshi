import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod'] as const)(
  'fails when client entry does not exist [%s]',
  (mode) => {
    it('integration', async () => {
      try {
        await scripts[mode]();
      } catch (error) {
        expect(error.message).toMatch(
          "(client) Entry module not found: Error: Can't resolve './nonExists'",
        );
      }
    });
  },
);
