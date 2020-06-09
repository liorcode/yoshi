import {
  SentryConfig,
  ExperimentsConfig,
} from 'yoshi-flow-editor-runtime/build/constants';
import t from './template';
import { viewerScriptOptionalImport } from './CommonViewerScriptEntry';

type Opts = Record<
  | 'editorAppWrapperPath'
  | 'componentFileName'
  | 'controllerFileName'
  | 'componentName',
  string
> & {
  viewerEntryFileName: string | null;
  sentryConfig: SentryConfig | null;
  experimentsConfig: ExperimentsConfig | null;
};

export default t<Opts>`
    import React from 'react';
    import ReactDOM from 'react-dom';
    import EditorAppWrapper from '${({ editorAppWrapperPath }) =>
      editorAppWrapperPath}';

    import UserComponent from '${({ componentFileName }) => componentFileName}';
    import createController from '${({ controllerFileName }) =>
      controllerFileName}';
    ${({ viewerEntryFileName }) =>
      viewerScriptOptionalImport({ viewerEntryFileName })}

    var componentName = '${({ componentName }) => componentName}';
    var sentryConfig = ${({ sentryConfig }) =>
      sentryConfig
        ? `{
      DSN: '${sentryConfig.DSN}',
      id: '${sentryConfig.id}',
      projectName: '${sentryConfig.projectName}',
      teamName: '${sentryConfig.teamName}',
    }`
        : 'null'};

    var experimentsConfig = ${({ experimentsConfig }) =>
      experimentsConfig
        ? `{
        scope: '${experimentsConfig.scope}'
      }`
        : 'null'};

    var WrappedEditorApp = () => React.createElement(EditorAppWrapper, {
      UserComponent: UserComponent,
      name: componentName,
      sentry: sentryConfig,
      experimentsConfig: experimentsConfig,
      userController: createController,
      customInitAppForPage: importedApp.initAppForPage
    });

    ReactDOM.render(React.createElement(WrappedEditorApp, null), document.getElementById('root'));
`;
