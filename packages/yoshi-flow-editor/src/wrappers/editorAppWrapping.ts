import path from 'path';
import fs from 'fs-extra';
import { FlowEditorModel, ComponentModel } from '../model';
import editorEntryTemplate from './templates/EditorAppEntryContent';

const editorAppWrapperPath =
  'yoshi-flow-editor-runtime/build/EditorAppWrapper.js';

const componentWrapper = (
  generatedWidgetEntriesPath: string,
  model: FlowEditorModel,
) => {
  return model.components.reduce(
    (acc: Record<string, string>, component: ComponentModel) => {
      if (!component.widgetFileName) {
        return acc;
      }

      const generatedWidgetEntryPath = path.join(
        generatedWidgetEntriesPath,
        `${component.name}EditorApp.js`,
      );

      const generateWidgetEntryContent = editorEntryTemplate({
        editorAppWrapperPath,
        componentName: component.name,
        componentFileName: component.widgetFileName,
        controllerFileName: component.viewerControllerFileName,
        viewerEntryFileName: model.viewerEntryFileName,
        sentryConfig: model.sentry,
        experimentsConfig: model.experimentsConfig,
      });

      fs.outputFileSync(generatedWidgetEntryPath, generateWidgetEntryContent);

      acc[`${component.name}EditorMode`] = generatedWidgetEntryPath;

      return acc;
    },
    {},
  );
};

export default componentWrapper;
