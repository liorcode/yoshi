import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod'] as const)('optimize [%s]', (mode) => {
  describe('tree shaking', () => {
    it('removes unused exports', async () => {
      await scripts[mode](async () => {
        const logs: Array<string> = [];

        page.on('console', (msg) => {
          if (msg.type() === 'info') {
            logs.push(msg.text());
          }
        });

        await page.goto(scripts.serverUrl);

        expect(logs).toEqual(['module-with-multiple-exports']);
      });
    });
  });
});
