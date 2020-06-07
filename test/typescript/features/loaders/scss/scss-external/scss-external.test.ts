import { matchCSS } from '../../../../../utils';
import Scripts from '../../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)('scss import external [%s]', (mode) => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto(scripts.serverUrl);
      const className = await page.$eval('#scss-import-external', (elm) =>
        elm.getAttribute('class'),
      );

      await matchCSS('app', [
        new RegExp(`.${className}{background:#ccc;color:#000;*}`),
      ]);
    });
  });

  it('component tests', async () => {
    await scripts.test(mode);
  });
});
