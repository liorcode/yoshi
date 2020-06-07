import { get } from 'lodash';

const templateRegex = /{%(\w|\.)+%}/g;
const loopTemplateRegEx = /{each%(\w|\.|:)+%each}/g;
const loopTemplateCodeRegEx = /{forEach%(\w|\.)+%forEach}(\w|.)+{\/forEach}/gms;
const loopHeaderTemplateRegEx = /{forEach%(\w|\.|:)+%forEach}/g;
const loopBodyTemplateRegEx = /forEach}(\w|.)+{\/forEach}/gms;
const loopItemNameSeparatorRegEx = /:/g;

export const replaceTemplates = (
  content: string,
  map: Record<string, string>,
  { graceful }: { graceful?: boolean } = {},
) => {
  let result: string = content.replace(loopTemplateCodeRegEx, (str) => {
    const [keyTemplate] = str.match(loopHeaderTemplateRegEx) || [];
    const key = keyTemplate.slice(9, -9);
    const values = get(map, key, undefined);

    if (!Array.isArray(values)) {
      if (graceful) {
        return str;
      }

      throw new Error(
        `the key ${key} suppose to be an array, but got: ${typeof values}`,
      );
    }

    const [bodyTemplate] = str.match(loopBodyTemplateRegEx) || [];
    const bodyStr = bodyTemplate.slice(8, -11);

    return values
      .map((value) => {
        return replaceTemplates(bodyStr, { ...map, ...value });
      })
      .join(',');
  });

  result = result.replace(templateRegex, (match) => {
    const key = match.slice(2, -2);
    const value = get(map, key, undefined);

    if (typeof value === 'undefined') {
      if (graceful) {
        return match;
      }

      throw new Error(
        `the key ${key} suppose to be one of the following: ${Object.keys(
          map,
        )}`,
      );
    }

    return value;
  });

  result = result.replace(loopTemplateRegEx, (match) => {
    const [, key = 'name'] = match
      .slice(6, -6)
      .split(loopItemNameSeparatorRegEx);
    return map[key];
  });

  return result;
};

export const getTemplateScopes = (
  content: string,
  map: Record<string, string>,
  { graceful }: { graceful?: boolean } = {},
) => {
  const matches = content.match(loopTemplateRegEx);
  if (!matches) {
    return [map];
  }

  const match = matches[0];
  const [key] = match.slice(6, -6).split(loopItemNameSeparatorRegEx);
  const values = get(map, key, undefined);

  if (!Array.isArray(values)) {
    if (graceful) {
      return [map];
    }
    throw new Error(
      `the key ${key} suppose to be an array, but got: ${typeof values}`,
    );
  }

  return values;
};
