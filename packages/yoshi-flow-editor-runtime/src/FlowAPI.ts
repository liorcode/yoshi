import Experiments from '@wix/wix-experiments';
import { BaseLogger } from '@wix/fedops-logger';
import {
  IWidgetControllerConfig,
  IPlatformServices,
} from '@wix/native-components-infra/dist/src/types/types';
import { EditorReadyOptions } from '@wix/platform-editor-sdk';
import { BrowserClient } from '@sentry/browser';
import { RavenStatic } from 'raven-js';
import {
  initExperimentsGetter,
  initEmptyExperimentsGetter,
} from './fetchExperiments';
import { ExperimentsConfig, SentryConfig } from './constants';
import { getSiteLanguage, isSSR, isMobile } from './helpers';
import { ReportError } from './types';
import { buildSentryOptions, getArtifact } from './utils';

class FlowAPI {
  getExperiments: () => Promise<Experiments>;

  constructor({
    experimentsConfig,
  }: {
    experimentsConfig: ExperimentsConfig | null;
  }) {
    if (experimentsConfig) {
      this.getExperiments = initExperimentsGetter(experimentsConfig);
    } else {
      this.getExperiments = initEmptyExperimentsGetter();
    }
  }

  reportError: ReportError = (error) => {
    console.warn(
      "You are trying to report an error, but didn't configure it in `.application.json`",
      'Error: ',
      error,
    );
  };
}

export class ControllerFlowAPI extends FlowAPI {
  controllerConfig: IWidgetControllerConfig;
  sentryMonitor?: RavenStatic;
  fedopsLogger: BaseLogger<string>;
  inEditor: boolean;
  widgetId: string;

  constructor({
    viewerScriptFlowAPI,
    controllerConfig,
    appDefinitionId,
    widgetId,
  }: {
    viewerScriptFlowAPI: ViewerScriptFlowAPI;
    controllerConfig: IWidgetControllerConfig;
    appDefinitionId: string;
    widgetId: string | null;
  }) {
    super({ experimentsConfig: null });
    this.widgetId = widgetId!;
    this.controllerConfig = controllerConfig;
    this.getExperiments = viewerScriptFlowAPI.getExperiments;
    this.sentryMonitor = viewerScriptFlowAPI.sentryMonitor;
    this.inEditor = viewerScriptFlowAPI.inEditor;
    this.fedopsLogger = controllerConfig.platformAPIs.fedOpsLoggerFactory!.getLoggerForWidget(
      {
        appId: appDefinitionId,
        widgetId,
      },
    );

    if (this.sentryMonitor) {
      this.reportError = this.sentryMonitor.captureException.bind(
        this.sentryMonitor,
      );
    }
  }

  getSiteLanguage = (fallbackLanguage: string = 'en') => {
    return getSiteLanguage(this.controllerConfig.wixCodeApi, fallbackLanguage);
  };

  isSSR = () => {
    return isSSR(this.controllerConfig.wixCodeApi);
  };

  isMobile = () => {
    return isMobile(this.controllerConfig.wixCodeApi);
  };
}

export class EditorScriptFlowAPI extends FlowAPI {
  fedopsLogger: BaseLogger<string>;
  sentryMonitor?: BrowserClient;

  constructor({
    experimentsConfig,
    platformOptions,
    sentry,
    artifactId,
  }: {
    experimentsConfig: ExperimentsConfig | null;
    platformOptions: EditorReadyOptions;
    sentry: SentryConfig | null;
    artifactId: string;
  }) {
    super({ experimentsConfig });
    if (sentry) {
      const sentryOptions = buildSentryOptions(
        sentry.DSN,
        'Editor:Worker',
        getArtifact(),
        true,
      );

      this.sentryMonitor = platformOptions.monitoring.createSentryMonitorForApp(
        sentryOptions.dsn,
        sentryOptions.config,
      );

      this.reportError = this.sentryMonitor!.captureException.bind(
        this.sentryMonitor,
      );
    }
    const fedopsLogger = platformOptions.monitoring.createFedopsLogger();

    // The platform has no way to know the application name there is a map in the Editor SDK that maps each appDefinitionId to an application name.
    // If your application has been added to this map, the createFedopsLogger function returns an instantiated logger that is ready to use and is configured with your application name.
    // If your application has not been added to the map, createFedopsLogger will return a factory function.
    // You should then invoke this function with your application name to instantiate your logger instance.
    this.fedopsLogger =
      typeof fedopsLogger === 'function'
        ? fedopsLogger(artifactId)
        : fedopsLogger;
  }
}

export class ViewerScriptFlowAPI extends FlowAPI {
  sentryMonitor?: RavenStatic;
  inEditor: boolean;

  constructor({
    experimentsConfig,
    platformServices,
    sentry,
    inEditor,
  }: {
    experimentsConfig: ExperimentsConfig | null;
    platformServices: IPlatformServices;
    sentry: SentryConfig | null;
    inEditor: boolean;
  }) {
    super({ experimentsConfig });

    this.inEditor = inEditor;

    if (sentry) {
      const sentryOptions = buildSentryOptions(
        sentry.DSN,
        'Viewer:Worker',
        getArtifact(),
      );

      this.sentryMonitor = platformServices.monitoring.createMonitor(
        sentryOptions.dsn,
        (config) => ({
          ...config,
          ...sentryOptions.config,
        }),
      );

      this.reportError = this.sentryMonitor.captureException.bind(
        this.sentryMonitor,
      );
    }
  }
}
