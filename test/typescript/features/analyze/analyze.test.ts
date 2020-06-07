import Scripts from '../../../scripts';
import { request, waitForPort } from '../../../utils';

jest.setTimeout(60 * 1000);

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['analyze'] as const)('analyze [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await waitForPort(8888, { timeout: 20000 });
      expect(await request('http://localhost:8888')).toMatch(
        '"label":"app.bundle.min.js"',
      );
    });
  });
});
