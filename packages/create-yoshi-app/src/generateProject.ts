import path from 'path';
import { outputFileSync } from 'fs-extra';
import getFilesInDir from './getFilesInDir';
import { replaceTemplates, getTemplateScopes } from './template-utils';
import getValuesMap from './getValuesMap';
import TemplateModel from './TemplateModel';

export const processFileWithScope = (
  fileName: string,
  fileContent: string,
  scope: Record<string, any>,
  { graceful }: { graceful?: boolean } = { graceful: false },
): { content: string; path: string } => {
  const transformedContent = replaceTemplates(fileContent, scope, { graceful });
  const transformedPath = replaceTemplates(fileName, scope, { graceful });

  outputFileSync(transformedPath, transformedContent);
  return { content: transformedContent, path: transformedPath };
};

export const processFilesWithScopes = (
  files: Record<string, string>,
  scope: Record<string, any>,
  workingDir: string,
) => {
  return Object.keys(files).forEach((fileName) => {
    const fullPath = path.join(workingDir, fileName);
    const scopes = getTemplateScopes(fileName, scope);

    scopes.forEach((loopScope) => {
      processFileWithScope(fullPath, files[fileName], {
        ...scope,
        ...loopScope,
      });
    });
  });
};

export default (templateModel: TemplateModel, workingDir: string) => {
  const valuesMap = getValuesMap(templateModel);
  const files = getFilesInDir(templateModel.getPath());

  processFilesWithScopes(files, valuesMap, workingDir);
};
