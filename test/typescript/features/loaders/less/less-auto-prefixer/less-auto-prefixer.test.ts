import { matchCSS } from '../../../../../utils';
import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('less auto prefixer [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);

      await matchCSS('app', [
        /-webkit-user-select:.+;-moz-user-select:.+;-ms-user-select:.+;user-select:.+/,
      ]);
    });
  });

  it('component tests', async () => {
    await scripts.test(mode);
  });
});
