import { InitAppForPageFn } from 'yoshi-flow-editor-runtime';

export const initAppForPage: InitAppForPageFn = async (
  initParams,
  platformApis,
  wixCodeApi,
  platformServices,
  flowAPI,
) => {
  console.log(
    `App inited in ${flowAPI.inEditor ? 'Editor' : 'Viewer'} environment!`,
  );
};
