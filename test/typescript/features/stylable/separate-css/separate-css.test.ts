import Scripts from '../../../../scripts';
import { request } from '../../../../utils';

jest.setTimeout(40 * 1000);

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe.each(['prod', 'dev'] as const)(
  'stylable separate css [%s]',
  (mode) => {
    it('outputs stylable into a separate css file', async () => {
      await scripts[mode](async () => {
        expect(
          await request('http://localhost:3200/app.stylable.bundle.css'),
        ).toContain('root{height:100vh}');
      });
    });
  },
);
