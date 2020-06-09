import {
  SentryConfig,
  ExperimentsConfig,
} from 'yoshi-flow-editor-runtime/build/constants';
import t from './template';
import { TemplateControllerConfig } from './CommonViewerScriptEntry';

type Opts = {
  controllersMeta: Array<TemplateControllerConfig>;
  editorEntryFileName: string | null;
  shouldUseAppBuilder: boolean;
  editorScriptWrapperPath: string;
  sentry: SentryConfig | null;
  experimentsConfig: ExperimentsConfig | null;
  artifactId: string;
};

// We want allow users to use default even despite fact that platform doesn't support it.
export default t<Opts>`
  ${({ editorEntryFileName }) => {
    return `var editorScriptEntry = ${
      editorEntryFileName
        ? `require('${editorEntryFileName}');`
        : `{ editorReady: function () {} };`
    }`;
  }}

  ${({ shouldUseAppBuilder, controllersMeta }) =>
    shouldUseAppBuilder
      ? `
    if (editorScriptEntry.default) {
      module.exports = editorScriptEntry.default;
    } else {
      var editorScriptBuilder = require('@wix/bob-widget-services').editorScriptBuilder;

      var builder = editorScriptBuilder();
      if (editorScriptEntry.editorReady) {
        builder = builder.withEditorReady(editorScriptEntry.editorReady);
      }
      if (editorScriptEntry.appManifest) {
        builder = builder.withAppManifest(editorScriptEntry.appManifest);
      }
      if (editorScriptEntry.eventHandler) {
        builder = builder.withEventHandler(editorScriptEntry.eventHandler);
      }
      ${controllersMeta
        .map(
          (meta, i) =>
            `
      var userController_${i} = require('${meta.controllerFileName}');
      builder = builder.withWidget(userController_${i}.default || userController_${i});`,
        )
        .join('\n  ')}

      module.exports = builder.build();
  }
  `
      : ''}

  ${({
    shouldUseAppBuilder,
    editorScriptWrapperPath,
    artifactId,
    experimentsConfig,
    sentry,
  }) =>
    !shouldUseAppBuilder
      ? `
  var editorReadyWrapper = require('${editorScriptWrapperPath}').editorReadyWrapper;
  var editorReady = editorScriptEntry.editorReady;

  var sentry = ${
    sentry
      ? `{
    DSN: '${sentry.DSN}',
    id: '${sentry.id}',
    projectName: '${sentry.projectName}',
    teamName: '${sentry.teamName}',
  }`
      : 'null'
  };

  var experimentsConfig = ${
    experimentsConfig
      ? `{
    scope: '${experimentsConfig.scope}'
  }`
      : 'null'
  };

  if (editorReady) {
    editorReady = editorReadyWrapper(editorReady, sentry, experimentsConfig, '${artifactId}');
  }

  module.exports = editorScriptEntry.default || {
    ...editorScriptEntry,
    editorReady,
  };
  `
      : ''}
`;
