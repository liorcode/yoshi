import path from 'path';
import fs from 'fs';
import { capitalize } from 'lodash';
import { templates } from '../packages/create-yoshi-app';

const readNvmrc = (dir: string) =>
  fs.readFileSync(path.join(dir, '.nvmrc')).toString().trim();

const rootNvmrc = readNvmrc(path.resolve(__dirname, '..'));

test("create-yoshi-app's .nvmrc should match yoshi's .nvmrc", () => {
  const cyaNvmrc = readNvmrc(
    path.resolve(__dirname, '../packages/create-yoshi-app'),
  );
  expect(cyaNvmrc).toBe(rootNvmrc);
});

templates.forEach(({ name, path: templatePath, language }) => {
  language.forEach((lang) => {
    test(`${capitalize(
      lang,
    )} template ${name}'s .nvmrc should match create-yoshi-app's .nvmrc`, () => {
      const templateNvmrc = readNvmrc(path.join(templatePath, lang));
      expect(templateNvmrc).toBe(rootNvmrc);
    });
  });
});
