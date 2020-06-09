import path from 'path';
import fs from 'fs-extra';
import { FlowEditorModel, ComponentModel } from '../model';
import controllerEntry from './templates/WidgetViewerScriptEntry';

const viewerScriptWrapperPath =
  'yoshi-flow-editor-runtime/build/viewerScript.js';

const viewerScriptWrapper = (
  generatedWidgetEntriesPath: string,
  model: FlowEditorModel,
) => {
  return model.components.reduce(
    (acc: Record<string, string>, component: ComponentModel) => {
      const generatedWidgetEntryPath = path.join(
        generatedWidgetEntriesPath,
        `${component.name}ViewerScript.js`,
      );

      const generateControllerEntryContent = controllerEntry({
        viewerScriptWrapperPath,
        controllerFileName: component.viewerControllerFileName,
        viewerEntryFileName: model.viewerEntryFileName,
      });

      fs.outputFileSync(
        generatedWidgetEntryPath,
        generateControllerEntryContent,
      );
      // Generate controllers for each widget.
      acc[`${component.name}Controller`] = component.viewerControllerFileName;

      return acc;
    },
    {},
  );
};

export default viewerScriptWrapper;
