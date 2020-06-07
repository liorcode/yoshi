import { matchCSS } from '../../../../../utils';
import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('svg css inclusion [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      await matchCSS('app', [/background:url\("data:image\/svg.+\)/]);
    });
  });

  it('component tests', async () => {
    await scripts.test(mode);
  });
});
