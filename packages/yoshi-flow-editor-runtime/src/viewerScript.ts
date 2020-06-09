import {
  IWidgetControllerConfig,
  IInitAppForPage,
  IAppData,
  IPlatformAPI,
  IWixAPI,
  IPlatformServices,
} from '@wix/native-components-infra/dist/src/types/types';
import {
  SentryConfig,
  WidgetType,
  OOI_WIDGET_COMPONENT_TYPE,
  ExperimentsConfig,
} from './constants';
import { InitAppForPageFn, CreateControllerFn } from './types';
import { ViewerScriptFlowAPI, ControllerFlowAPI } from './FlowAPI';

let viewerScriptFlowAPI: ViewerScriptFlowAPI;
let appData: any = {};

type ControllerDescriptor = {
  id: string | null;
  method: Function;
  widgetType: WidgetType;
  controllerFileName: string | null;
  appName: string | null;
  componentName: string | null;
};

const getFirstDescriptor = (descriptors: Array<ControllerDescriptor>) => {
  if (descriptors.length === 1) {
    return descriptors[0];
  }
};

const defaultControllerWrapper = (
  controllerDescriptor: ControllerDescriptor,
  controllerConfig: IWidgetControllerConfig,
) => {
  const flowAPI = new ControllerFlowAPI({
    viewerScriptFlowAPI,
    appDefinitionId: controllerConfig.appParams.appDefinitionId,
    widgetId: controllerDescriptor.id,
    controllerConfig,
  });
  return controllerDescriptor.method({
    controllerConfig,
    flowAPI,
    appData,
  });
};

function ooiControllerWrapper(
  controllerDescriptor: ControllerDescriptor,
  controllerConfig: IWidgetControllerConfig,
) {
  const { setProps, appParams } = controllerConfig;

  const setState = (newState: any) => {
    const updatedState = {
      ...context.state,
      ...newState,
    };

    // Track state
    context.state = updatedState;

    // Run state change callback
    wrappedController.then((userController: any) => {
      if (userController.stateChange) {
        userController.stateChange();
      }
    });

    // Update render cycle
    return setProps({ state: updatedState });
  };

  const context = {
    state: {},
    setState,
  };

  const { appDefinitionId } = appParams;
  const flowAPI = new ControllerFlowAPI({
    viewerScriptFlowAPI,
    appDefinitionId,
    widgetId: controllerDescriptor.id,
    controllerConfig,
  });

  const userControllerPromise = controllerDescriptor.method.call(context, {
    controllerConfig,
    flowAPI,
    appData,
  });

  const wrappedController = Promise.resolve(userControllerPromise)
    .catch(error => {
      if (!flowAPI.inEditor) {
        // Currently platform doesn't log errors happened in worker. We want to fix it here.
        console.error(
          `❗️Error 👉 "${controllerDescriptor.appName}" app 👉 ${controllerDescriptor.componentName} controller ❗\n`,
          error,
        );
        flowAPI.reportError(error);
      }
      throw error;
    })
    .then((userController: any) => {
      return {
        ...userController,
        pageReady: async (...args: Array<any>) => {
          // TODO: export by property (methods, state) so we won't have conflicting props
          setProps({
            __publicData__: controllerConfig.config.publicData,
            // Set initial state
            state: context.state,
            // Set methods
            methods: userController.methods,
          });

          // Optional `pageReady`
          if (userController.pageReady) {
            return userController.pageReady(...args);
          }
        },
        exports: userController.corvid,
      };
    });

  return wrappedController;
}

const wrapControllerByWidgetType = (
  controllerDescriptor: ControllerDescriptor,
  controllerConfig: IWidgetControllerConfig,
) => {
  switch (controllerDescriptor.widgetType) {
    case OOI_WIDGET_COMPONENT_TYPE:
      return ooiControllerWrapper(controllerDescriptor, controllerConfig);
    default:
      return defaultControllerWrapper(controllerDescriptor, controllerConfig);
  }
};

const getDescriptorForConfig = (
  type: string,
  descriptors: Array<ControllerDescriptor>,
) => {
  return (
    descriptors.find((descriptor) => descriptor.id === type) ||
    getFirstDescriptor(descriptors)
  );
};

export const createControllers = (createController: CreateControllerFn) => {
  return createControllersWithDescriptors([
    {
      method: createController,
      id: null,
      widgetType: OOI_WIDGET_COMPONENT_TYPE,
      controllerFileName: null,
      componentName: null,
      appName: null,
    },
  ]);
};

export const createControllersWithDescriptors = (
  controllerDescriptors: Array<ControllerDescriptor>,
) => (controllerConfigs: Array<IWidgetControllerConfig>) => {
  // It should be called inside initAppForPage

  const wrappedControllers = controllerConfigs.map((controllerConfig) => {
    // [Platform surprise] `type` here, is a widgetId. :(
    const { type } = controllerConfig;
    const controllerDescriptor:
      | ControllerDescriptor
      | undefined = getDescriptorForConfig(type, controllerDescriptors);

    if (!controllerDescriptor) {
      throw new Error(
        `Descriptor for widgetId: "${controllerConfig.type}" was not found. Please create a ".component.json" file for current widget`,
      );
    }

    return wrapControllerByWidgetType(controllerDescriptor, controllerConfig);
  });

  return wrappedControllers;
};

export const initAppForPageWrapper = (
  initAppForPage: InitAppForPageFn | undefined,
  sentry: SentryConfig | null,
  experimentsConfig: ExperimentsConfig | null,
  inEditor: boolean = false,
  appName: string | null = null,
): IInitAppForPage => async (
  initParams: IAppData,
  apis: IPlatformAPI,
  namespaces: IWixAPI,
  platformServices: IPlatformServices,
) => {
  viewerScriptFlowAPI = new ViewerScriptFlowAPI({
    experimentsConfig,
    platformServices,
    sentry,
    inEditor,
  });

  if (initAppForPage) {
    try {
      appData = await initAppForPage(
        initParams,
        apis,
        namespaces,
        platformServices,
        viewerScriptFlowAPI,
      );
    } catch (e) {
      if (!inEditor) {
        // Currently platform doesn't log errors happened in worker. We want to fix it here.
        console.error(
          `❗️Error 👉 "${appName}" app 👉 \`viewer.app.ts\` module ❗\n`,
          e,
        );
        viewerScriptFlowAPI.reportError(e);
      }
      throw e;
    }
  }
  // appData will be available in controllers
  return appData;
};
