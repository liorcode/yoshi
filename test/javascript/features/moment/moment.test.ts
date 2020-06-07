import { matchJS, notToMatchJS } from '../../../utils';
import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe.each(['prod', 'dev'] as const)('moment [%s]', (mode) => {
  it('exclude locales imported from moment', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      // should not include the `en` locale
      await notToMatchJS('app', [/hello/]);
    });
  });

  it('include locales imported outside of moment', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      // should not include the `en` locale
      await matchJS('app', [/hallo/]);
    });
  });
});
