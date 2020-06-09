import path from 'path';
import globby from 'globby';
import { getProjectArtifactId } from 'yoshi-helpers/build/utils';
import { isTypescriptProject } from 'yoshi-helpers/build/queries';
import resolve from 'resolve';
import fs from 'fs-extra';
import { Config } from 'yoshi-config/build/config';
import {
  WidgetType,
  SentryConfig,
  ExperimentsConfig,
  OOI_WIDGET_COMPONENT_TYPE,
  PLATFORM_WIDGET_COMPONENT_TYPE,
} from 'yoshi-flow-editor-runtime/build/constants';
import {
  WIDGET_FILENAME,
  VIEWER_CONTROLLER_FILENAME,
  EDITOR_CONTROLLER_FILENAME,
  SETTINGS_CONTROLLER_FILENAME,
  APPLICATION_CONFIG_FILENAME,
  COMPONENT_CONFIG_FILENAME,
  VIEWER_APP_FILENAME,
  EDITOR_APP_FILENAME,
  URLS_CONFIG,
} from './constants';

export interface FlowEditorModel {
  appName: string | null;
  projectName: string;
  appDefId: string | null;
  artifactId: string;
  viewerEntryFileName: string | null;
  editorEntryFileName: string | null;
  experimentsConfig: ExperimentsConfig | null;
  components: Array<ComponentModel>;
  sentry: SentryConfig | null;
  urls: URLsConfig;
}

export interface URLsConfig {
  viewerUrl?: string | null;
  editorUrl?: string | null;
}

export interface ComponentModel {
  name: string;
  type: WidgetType;
  widgetFileName: string | null;
  viewerControllerFileName: string;
  editorControllerFileName: string | null;
  settingsFileName: string | null;
  id: string | null;
  controllerId?: string;
}

export interface AppConfig {
  experiments: ExperimentsConfig | null;
  appDefinitionId: string;
  appName?: string;
  sentry?: SentryConfig;
}
export interface ComponentConfig {
  id: string;
  controllerId?: string;
  type?: WidgetType;
}

const extensions = ['.tsx', '.ts', '.js', '.json'];
function resolveFrom(dir: string, fileName: string): string | null {
  try {
    return resolve.sync(path.join(dir, fileName), {
      extensions,
    });
  } catch (error) {
    return null;
  }
}

function shouldUseSentry(): boolean {
  return (
    Boolean(process.env.FORCE_SENTRY) || process.env.NODE_ENV === 'production'
  );
}

function formatPathsForLog(paths: Array<string>, ext: string) {
  return paths.map((path) => (ext ? `${path}.${ext}` : path)).join(' or ');
}

function resolveFileNamesFromDirectory(dir: string, fileNames: Array<string>) {
  return (
    fileNames.map((fileName) => resolveFrom(dir, fileName)).find(Boolean) ||
    null
  );
}

function getLocalConfig<C extends AppConfig | ComponentConfig | URLsConfig>(
  configPath: string,
): C {
  const extension = path.extname(configPath);
  if (extension === '.js') {
    return require(configPath);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export async function generateFlowEditorModel(
  config: Config,
): Promise<FlowEditorModel> {
  const artifactId = getProjectArtifactId();
  if (!artifactId) {
    throw new Error(`artifact id not provided.
    Please insert <artifactId>yourArtifactId</artifactId> in your "pom.xml"`);
  }
  const fileExtension = isTypescriptProject() ? 'ts' : 'js';

  const rootPath = process.cwd();
  const srcPath = path.join(rootPath, 'src');
  const resolveFromRoot = resolveFileNamesFromDirectory.bind(null, rootPath);
  const resolveFromSrc = resolveFileNamesFromDirectory.bind(null, srcPath);

  const viewerEntryFileName = resolveFromSrc(VIEWER_APP_FILENAME);
  const editorEntryFileName = resolveFromSrc(EDITOR_APP_FILENAME);

  const appConfigFileName = resolveFromRoot(APPLICATION_CONFIG_FILENAME);
  const urlsConfigFileName = resolveFromRoot(URLS_CONFIG);
  const urlsConfig =
    urlsConfigFileName && getLocalConfig<URLsConfig>(urlsConfigFileName);
  const appConfig =
    appConfigFileName && getLocalConfig<AppConfig>(appConfigFileName);

  if (!appConfig || !appConfig.appDefinitionId) {
    throw new Error(
      `Seems like your app doesn't contain ${formatPathsForLog(
        APPLICATION_CONFIG_FILENAME,
        'json',
      )} or \`appDefinitionId\` is not specified here.`,
    );
  }

  const componentsDirectories = await globby('./src/components/*', {
    onlyDirectories: true,
    absolute: true,
  });

  const componentModels: Array<ComponentModel> = componentsDirectories.reduce(
    (processedModels, componentDirectory) => {
      const componentName = path.basename(componentDirectory);
      const resolveFromComponents = resolveFileNamesFromDirectory.bind(
        null,
        componentDirectory,
      );

      const configFileName = resolveFromComponents(COMPONENT_CONFIG_FILENAME);
      const componentConfig =
        configFileName && getLocalConfig<ComponentConfig>(configFileName);
      const componentPathRelativeToRoot = path.relative(
        rootPath,
        componentDirectory,
      );

      /* If no config specified, we are going to completely ignore this component and
      warn users to add it. */
      if (!componentConfig) {
        console.warn(`Seems like you didn't add "${formatPathsForLog(
          COMPONENT_CONFIG_FILENAME,
          'json',
        )}" to some of you components: ${componentPathRelativeToRoot}.
For more info, visit http://tiny.cc/dev-center-registration`);
        // Ignore components w/o config file.
        return processedModels;
      }

      if (!componentConfig.id) {
        console.warn(`Seems like you added new component and didn't specify "id" for it.
You should register it in dev-center and paste id to "${formatPathsForLog(
          COMPONENT_CONFIG_FILENAME,
          'json',
        )}" in the widget directory: ${componentPathRelativeToRoot}.
For more info, visit http://tiny.cc/dev-center-registration`);
      }

      const viewerControllerFileName = resolveFromComponents(
        VIEWER_CONTROLLER_FILENAME,
      );
      if (!viewerControllerFileName) {
        throw new Error(`Missing controller file for the component in "${componentPathRelativeToRoot}".
        Please create "controller.${fileExtension}" file in "${componentPathRelativeToRoot}" directory`);
      }

      const editorControllerFileName = resolveFromComponents(
        EDITOR_CONTROLLER_FILENAME,
      );

      const assumedWidgetType: WidgetType = editorControllerFileName
        ? PLATFORM_WIDGET_COMPONENT_TYPE
        : OOI_WIDGET_COMPONENT_TYPE;

      if (!componentConfig.type) {
        componentConfig.type = assumedWidgetType;
      }

      const isOOIWidget = componentConfig.type === OOI_WIDGET_COMPONENT_TYPE;

      const widgetFileName = isOOIWidget
        ? resolveFromComponents(WIDGET_FILENAME)
        : null;

      if (!widgetFileName && isOOIWidget) {
        throw new Error(`Missing widget or page file for the component in "${componentPathRelativeToRoot}".
        Please create either index.${fileExtension} or Widget.${fileExtension} file in "${componentPathRelativeToRoot}" directory`);
      }

      const settingsFileName = resolveFromComponents(
        SETTINGS_CONTROLLER_FILENAME,
      );

      const componentModel: ComponentModel = {
        name: componentName,
        widgetFileName,
        type: componentConfig.type,
        viewerControllerFileName,
        editorControllerFileName,
        settingsFileName,
        id: componentConfig.id,
        controllerId: componentConfig.controllerId,
      };
      return processedModels.concat(componentModel);
    },
    [] as Array<ComponentModel>,
  );

  const model = {
    // dev center app name from .application.json
    appName: appConfig.appName || null,
    // package name from package.json
    projectName: config.name,
    sentry: (shouldUseSentry() && appConfig.sentry) || null,
    experimentsConfig: appConfig ? appConfig.experiments : null,
    appDefId: appConfig.appDefinitionId ?? null,
    editorEntryFileName,
    artifactId,
    viewerEntryFileName,
    components: componentModels,
    urls: {
      viewerUrl: (urlsConfig && urlsConfig.viewerUrl) || null,
      editorUrl: (urlsConfig && urlsConfig.editorUrl) || null,
    },
  };

  return model;
}
