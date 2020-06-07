import path from 'path';
import fs from 'fs-extra';
import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

const originalServerFilePath = path.join(
  scripts.testDirectory,
  'src/server.js',
);

describe.each(['prod'] as const)(
  'fails when server entry does not exist [%s]',
  (mode) => {
    it('integration', async () => {
      try {
        await fs.remove(originalServerFilePath);

        await scripts[mode]();
      } catch (error) {
        expect(error.message).toMatch("We couldn't find your server entry");
      }
    });
  },
);
