import { matchCSS } from '../../../../../utils';
import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)(
  'less inclusion global [%s]',
  (mode) => {
    it('integration', async () => {
      await scripts[mode](async () => {
        await page.goto(scripts.serverUrl);
        await matchCSS('app', [
          /\.global-less-modules-inclusion\{background:#ccc;color:#000;*}/,
        ]);
      });
    });

    it('component tests', async () => {
      await scripts.test(mode);
    });
  },
);
