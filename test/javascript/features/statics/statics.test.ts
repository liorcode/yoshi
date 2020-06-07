import Scripts from '../../../scripts';
import { request } from '../../../utils';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('static assets [%s]', (mode) => {
  it('serves static assets', async () => {
    await scripts[mode](async () => {
      expect(await request('http://localhost:3200/assets/hello.txt')).toBe(
        'Hello from public folder!',
      );
    });
  });
});
