import path from 'path';
import fs from 'fs-extra';
import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('manifest [%s]', (mode) => {
  it('generates manifest stat file for non optimized', async () => {
    await scripts[mode](async () => {
      const statsFilePath = path.join(
        scripts.testDirectory,
        'dist/statics/manifest.json',
      );

      const json = JSON.parse(fs.readFileSync(statsFilePath, 'utf-8'));

      expect(json).toMatchSnapshot();
    });
  });
});

describe.each(['prod'] as const)('manifest [%s]', (mode) => {
  it('generates manifest stat file for optimized', async () => {
    await scripts[mode](async () => {
      const statsFilePath = path.join(
        scripts.testDirectory,
        'dist/statics/manifest.min.json',
      );

      const json = JSON.parse(fs.readFileSync(statsFilePath, 'utf-8'));

      expect(json).toMatchSnapshot();
    });
  });
});
