import path from 'path';
import fs from 'fs-extra';
import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'yoshi-server-typescript',
});

describe.each(['prod'] as const)('docker [%s]', (mode) => {
  it('should create a docker file', async () => {
    await scripts[mode](async () => {
      const dockerContent = fs.readFileSync(
        path.join(scripts.testDirectory, 'Dockerfile'),
        'utf-8',
      );
      expect(dockerContent).toMatch('MAINTAINER yaniv <yanivef@wix.com>');
    });
  });
});
