import { matchCSS } from '../../../../../utils';
import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('css relative url [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      await matchCSS('app', [
        /background-image:url\(media\/large-bart-simpson\..{8}\.gif\)/,
      ]);
    });
  });

  it('component tests', async () => {
    await scripts.test(mode);
  });
});
