import t from './template';
import { viewerScriptOptionalImport } from './CommonViewerScriptEntry';

type Opts = Record<'viewerScriptWrapperPath' | 'controllerFileName', string> & {
  viewerEntryFileName: string | null;
};

export default t<Opts>`
  import {createControllers as createControllersWrapper, initAppForPageWrapper} from '${({
    viewerScriptWrapperPath,
  }) => viewerScriptWrapperPath}';
  import userController from '${({ controllerFileName }) =>
    controllerFileName}';
  ${({ viewerEntryFileName }) =>
    viewerScriptOptionalImport({ viewerEntryFileName })}

  export const initAppForPage = initAppForPageWrapper(importedApp.initAppForPage);
  export const createControllers = createControllersWrapper(userController);
`;
