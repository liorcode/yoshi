import { isOutOfIframe, isAppBuilder } from '../utils';
import { ExtendedPromptObject } from '../extended-prompts';
import getDefaultAnswers from './getDefaultAnswers';
import {
  createApp,
  createComponent,
  getApps,
  getApp,
  DevCenterComponent,
} from './appService';

const WILL_REGISTER = 2;
const WAS_REGISTERED = 1;
const WIDGET_OUT_OF_IFRAME = 'WIDGET_OUT_OF_IFRAME';
const PAGE_OUT_OF_IFRAME = 'PAGE_OUT_OF_IFRAME';
const PLATFORM = 'PLATFORM';
const WIDGET_IFRAME = 'WIDGET';
const PAGE_IFRAME = 'PAGE';
const STUDIO_WIDGET = 'STUDIO_WIDGET';

type OOIComponent = typeof WIDGET_OUT_OF_IFRAME | typeof PAGE_OUT_OF_IFRAME;
type StudioComponent = typeof STUDIO_WIDGET;
type PlatformComponent = typeof PLATFORM;

const formatAppOption = (app: {
  name: string;
  appId: string;
}): { title: string; value: string } => {
  return {
    title: app.name,
    value: app.appId,
  };
};

const readableTypesMap = {
  [WIDGET_IFRAME]: 'IFrame Widget',
  [PAGE_IFRAME]: 'IFrame Page',
  [STUDIO_WIDGET]: 'App Studio Widget',
  [WIDGET_OUT_OF_IFRAME]: 'Out of Iframe Widget',
  [PAGE_OUT_OF_IFRAME]: 'Out of Iframe Page',
};

const toReadableType = (type: string): string =>
  readableTypesMap[type as keyof typeof readableTypesMap] || type.toLowerCase();

const formatComponentOption = (
  component: DevCenterComponent,
): { title: string; value: string; selected: boolean; disabled: boolean } => {
  const isSupported = isSupportedComponentType(component.type);
  return {
    title: `${component.name} (${toReadableType(component.type)})`,
    value: component.id,
    selected: isSupported,
    disabled: !isSupported,
  };
};

const wasSelected = (ids: Array<string>) => (component: DevCenterComponent) =>
  ids.includes(component.id);

const getBaseUrl = (projectName: string) =>
  `https://static.parastorage.com/services/${projectName}/1.0.0`;

const generateOOIComponentData = (
  projectName: string,
  componentName: string,
  componentType: OOIComponent,
) => {
  const baseUrl = getBaseUrl(projectName);

  if (componentType === WIDGET_OUT_OF_IFRAME) {
    return {
      componentUrl: `${baseUrl}/${componentName}ViewerWidget.bundle.min.js`,
      widgetData: {
        addOnlyOnce: false,
        default: true,
        essential: false,
        position: {
          region: 'no_region',
        },
        settingsEndpointUrl: `${baseUrl}/settings/${componentName}.html`,
        widgetEndpointUrl: `${baseUrl}/editor/${componentName}.html`,
        widgetMobileEndpointUrl: `${baseUrl}/editor/${componentName}.html`,
        widgetWidthType: 'NONE_TYPE',
      },
    };
  }
  return {
    componentUrl: `${baseUrl}/${componentName}ViewerWidget.bundle.min.js`,
    pageData: {
      addStrechButton: false,
      default: true,
      essential: false,
      isFullWidth: false,
      isHidden: false,
      settingsEndpointUrl: `${baseUrl}/settings/${componentName}.html`,
      pageEndpointUrl: `${baseUrl}/editor/${componentName}.html`,
      pageMobileEndpointUrl: `${baseUrl}/editor/${componentName}.html`,
    },
  };
};

const generateStudioComponentData = () => {
  return {
    essential: false,
  };
};

const generateComponentData = (
  projectName: string,
  componentName: string,
  componentType: OOIComponent | StudioComponent,
) => {
  if (
    componentType === WIDGET_OUT_OF_IFRAME ||
    componentType === PAGE_OUT_OF_IFRAME
  ) {
    return generateOOIComponentData(projectName, componentName, componentType);
  }
  return generateStudioComponentData();
};

const generatePlatformComponentData = (projectName: string) => {
  const baseUrl = getBaseUrl(projectName);
  return {
    viewerScriptUrl: `${baseUrl}/viewerScript.bundle.min.js`,
    editorScriptUrl: `${baseUrl}/editorScript.bundle.min.js`,
    platformOnly: false,
    enableInEditor: false,
    baseUrls: {
      staticsBaseUrl: baseUrl,
      staticsEditorBaseUrl: baseUrl,
    },
  };
};

const getDataForComponent = (
  data: any,
  type: OOIComponent | StudioComponent | PlatformComponent,
) => {
  if (!data) {
    return undefined;
  }

  if (type === WIDGET_OUT_OF_IFRAME) {
    return {
      widgetOutOfIframeData: data,
      compType: type,
    };
  } else if (type === PAGE_OUT_OF_IFRAME) {
    return {
      pageOutOfIframeData: data,
      compType: type,
    };
  } else if (type === STUDIO_WIDGET) {
    return {
      studioWidgetComponentData: data,
      compType: type,
    };
  } else if (type === PLATFORM) {
    return {
      platformComponentData: data,
    };
  }
};

// We want to handle iframe widgets for cases when users want to migrate their components
const SUPPORTED_TYPES = [
  WIDGET_OUT_OF_IFRAME,
  PAGE_OUT_OF_IFRAME,
  STUDIO_WIDGET,
  // WIDGET_IFRAME,
  // PAGE_IFRAME,
];
const isSupportedComponentType = (type: string) =>
  SUPPORTED_TYPES.includes(type);

// const isIframe = (type: string) => {
//   return [WIDGET_IFRAME, PAGE_IFRAME].includes(type);
// };

// const convertIframeToOOIType = (
//   type: typeof WIDGET_IFRAME | typeof PAGE_IFRAME,
// ): typeof WIDGET_OUT_OF_IFRAME | typeof PAGE_OUT_OF_IFRAME => {
//   if (type === WIDGET_IFRAME) {
//     return WIDGET_OUT_OF_IFRAME;
//   } else if (type === PAGE_IFRAME) {
//     return PAGE_OUT_OF_IFRAME;
//   }
//   throw new Error('Trying to convert non-iframe type');
// };

// const convertIframeToOOIComponents = (
//   components: Array<DevCenterComponent>,
//   appId: string,
//   projectName: string,
// ) => {
//   return Promise.all(
//     components.map(async component => {
//       if (isIframe(component.type)) {
//         const type = convertIframeToOOIType(
//           component.type as typeof WIDGET_IFRAME | typeof PAGE_IFRAME,
//         );
//         component = await createComponent({
//           name: component.name,
//           appId,
//           type,
//           data: getDataForComponent(
//             generateComponentData(projectName, component.name),
//             type,
//           ),
//         });
//       }
//       return component;
//     }),
//   );
// };

export default (): Array<ExtendedPromptObject<string>> => {
  return [
    {
      type: 'select',
      name: 'appRegistrationState',
      message: 'Do you want to register your app in Dev Center?',
      choices: [
        {
          title: 'Yes, I want to register my app in Dev Center',
          value: WILL_REGISTER,
        },
        {
          title: 'No, I want to use already registered app',
          value: WAS_REGISTERED,
        },
        {
          title:
            'No, I want to use a simple template w/o additional configuration',
          value: null,
        },
      ],
      next(answers) {
        if (answers.appRegistrationState === WILL_REGISTER) {
          return [
            {
              type: 'text',
              name: 'appName',
              async after(answers, context: any) {
                if (isAppBuilder(context.templateDefinition.name)) {
                  answers.components = getDefaultAnswers(
                    context.templateDefinition.name,
                  ).components;
                } else {
                  answers.components = [];
                }
                return createApp({ name: answers.appName });
              },
              validate(value: string) {
                return !!value;
              },
              message: 'Name of the app:',
              next(answers, context: any) {
                if (isOutOfIframe(context.templateDefinition.name)) {
                  return [
                    {
                      type: 'select',
                      name: 'registerComponentType',
                      message: 'Register a component',
                      choices: [
                        {
                          title: 'Register a Widget',
                          value: WIDGET_OUT_OF_IFRAME,
                        },
                        { title: 'Register a Page', value: PAGE_OUT_OF_IFRAME },
                        {
                          title: 'Finish registration',
                          value: null,
                        },
                      ],
                      // isOutOfIframe(context.templateDefinition.name)
                      repeatUntil(answers) {
                        return !answers.registerComponentType;
                      },
                      next(answers) {
                        if (answers.registerComponentType) {
                          return [
                            {
                              type: 'text',
                              name: 'componentName',
                              format: (val) => val.split(/\s|-/).join(''),
                              async after(answers, context: any) {
                                if (!answers.components) {
                                  answers.components = [];
                                }
                                if (!context.isViewerScriptRegistered) {
                                  await createComponent({
                                    name: 'Platform',
                                    appId: answers.appId,
                                    type: PLATFORM,
                                    data: getDataForComponent(
                                      generatePlatformComponentData(
                                        context.projectName,
                                      ),
                                      PLATFORM,
                                    ),
                                  });
                                  context.isViewerScriptRegistered = true;
                                }
                                answers.components = answers.components.concat(
                                  await createComponent({
                                    name: answers.componentName,
                                    appId: answers.appId,
                                    type: answers.registerComponentType,
                                    data: getDataForComponent(
                                      generateComponentData(
                                        context.projectName,
                                        answers.componentName,
                                        answers.registerComponentType,
                                      ),
                                      answers.registerComponentType,
                                    ),
                                  }),
                                );
                                return answers;
                              },
                              validate(value: string) {
                                return !!value;
                              },
                              message: `${
                                answers.registerComponentType ===
                                PAGE_OUT_OF_IFRAME
                                  ? 'Page'
                                  : 'Widget'
                              } name`,
                            },
                          ];
                        }
                        if (answers.appRegistrationState === WILL_REGISTER) {
                          console.log(
                            [
                              `Congrats! You just registered the ${answers.appName} app! 🚀`,
                              `Dev Center url: https://dev.wix.com/dc3/my-apps/${answers.appId}/build/components`,
                            ].join('\n'),
                          );
                        }
                        return [];
                      },
                    },
                  ];
                }
                return [];
              },
            },
          ];
        } else if (answers.appRegistrationState === WAS_REGISTERED) {
          return [
            {
              type: 'autocomplete',
              name: 'appId',
              message: 'Pick the app you want to use',
              optionsPerPage: 8,
              async before(answers, context: any) {
                context.apps = await getApps();
              },
              async getDynamicChoices(answers, context: any) {
                return context.apps.map(formatAppOption);
              },
            },
            {
              type: 'multiselect',
              name: 'selectedComponents',
              message: 'Select components you want to migrate.',
              async before(answers, context: any) {
                context.app = await getApp(answers.appId);
                answers.appName = context.app.name;
              },
              async after(answers, context: any) {
                const { app } = context;
                if (!answers.components) {
                  answers.components = [];
                }
                answers.components = answers.components.concat(
                  app.components.filter(
                    wasSelected(answers.selectedComponents),
                  ),
                );
                // We will support it in future after knowing that we are converting it correctly.
                // answers.components = await convertIframeToOOIComponents(
                //   answers.components,
                //   answers.appId,
                //   context.projectName,
                // );
                return answers;
              },
              hint: '- Space to select. Return to submit',
              warn: "This type of component can't be imported",
              async getDynamicChoices(answers, context: any) {
                const { app } = context;
                const components = app.components;
                return components.map(formatComponentOption);
              },
            },
          ];
        }
        return [];
      },
    },
  ];
};
