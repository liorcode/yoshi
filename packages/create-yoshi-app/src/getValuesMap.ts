import constantCase from 'constant-case';
import { isString } from 'lodash';
import pascalCase from 'pascal-case';
import TemplateModel from './TemplateModel';

export default ({
  projectName,
  authorName,
  authorEmail,
  flowData,
  sentryData,
}: TemplateModel) => {
  const valuesMap: Record<string, any> = {
    projectName,
    authorName,
    authorEmail,
    gitignore: 'gitignore',
    packagejson: 'package',
    flowData,
    sentryData,
  };

  Object.keys(valuesMap).forEach((key) => {
    const fieldIsString = isString(valuesMap[key]);
    // create CONSTANT_CASE entries for values map
    valuesMap[constantCase(key)] = fieldIsString
      ? constantCase(valuesMap[key])
      : valuesMap[key];

    // create PascalCase entries for values map
    valuesMap[pascalCase(key)] = fieldIsString
      ? pascalCase(valuesMap[key])
      : valuesMap[key];
  });

  return valuesMap;
};
