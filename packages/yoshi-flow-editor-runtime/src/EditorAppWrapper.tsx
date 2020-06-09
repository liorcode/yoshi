import React, { Suspense } from 'react';
import { ViewerScriptWrapper } from '@wix/native-components-infra';
import SentryGlobal from '@sentry/browser';
import { ErrorBoundary } from './react/ErrorBoundary';
import { WixSDK } from './react/SDK/SDKRenderProp';
import WidgetWrapper from './WidgetWrapper';
import { createControllers, initAppForPageWrapper } from './viewerScript.js';
import {
  IWixSDKContext,
  IWixSDKEditorEnvironmentContext,
} from './react/SDK/SDKContext';
import { WixSDKProvider } from './react/SDK/WixSDKProvider';
import { SentryConfig, ExperimentsConfig } from './constants';
import { InitAppForPageFn, CreateControllerFn } from './types';

declare global {
  interface Window {
    __CI_APP_VERSION__: string;
    Sentry: typeof SentryGlobal;
  }
}
interface IEditorAppCreatorProps {
  UserComponent: typeof React.Component;
  userController: CreateControllerFn;
  customInitAppForPage: InitAppForPageFn;
  name: string;
  sentry: SentryConfig | null;
  experimentsConfig: ExperimentsConfig | null;
}
interface IEditorAppWithWixSDKCreatorProps extends IEditorAppCreatorProps {
  sdk: IWixSDKContext;
}

interface IEditorAppWrapperProps extends IEditorAppCreatorProps {
  children: React.ReactNode;
}

// TODO: fill overrides and whatnot from santawrapper
const createEditorAppForWixSDK = ({
  UserComponent,
  userController,
  customInitAppForPage,
  name,
  sentry,
  experimentsConfig,
  sdk,
}: IEditorAppWithWixSDKCreatorProps) => {
  const WithComponent = WidgetWrapper(UserComponent, {
    name,
    Wix: sdk.Wix,
    sentry: null,
    isEditor: true,
  });

  return ViewerScriptWrapper(WithComponent, {
    viewerScript: {
      createControllers: createControllers(userController),
      initAppForPage: initAppForPageWrapper(
        customInitAppForPage,
        sentry,
        experimentsConfig,
        true,
      ),
    },
    Wix: sdk.Wix,
    widgetConfig: {
      widgetId: '',
      getAllPublicData: true,
    },
  });
};

interface IEditorAppWithCreatorState {
  EditorAppComponent: typeof React.Component | null;
}
interface IEditorAppWithCreatorProps extends IEditorAppWrapperProps {
  sdk: IWixSDKContext;
}

class EditorAppWithCreator extends React.Component<
  IEditorAppWithCreatorProps,
  IEditorAppWithCreatorState
> {
  constructor(props: IEditorAppWithCreatorProps) {
    super(props);

    let EditorAppComponent = null;
    if (props.sdk.Wix) {
      EditorAppComponent = createEditorAppForWixSDK(props);
      // Just to verify we are not exposing it.
    } else if ((props.sdk as any).editorSDK) {
      throw new Error('Editor App does not support editorSDK');
    }

    this.state = {
      EditorAppComponent,
    };
  }
  render() {
    const { EditorAppComponent } = this.state;

    if (!EditorAppComponent) {
      return null;
    }

    return <EditorAppComponent {...this.props} />;
  }
}

export default (props: IEditorAppWrapperProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WixSDKProvider>
        <WixSDK>
          {sdk => {
            if (!props.sentry) {
              return (
                <ErrorBoundary handleException={error => console.log(error)}>
                  <EditorAppWithCreator sdk={sdk} {...props} />
                </ErrorBoundary>
              );
            }

            const Wix = sdk
              ? (sdk as IWixSDKEditorEnvironmentContext).Wix
              : null;

            if (Wix) {
              window.Sentry.configureScope(scope => {
                scope.setTag('msid', Wix.Utils.getInstanceValue('metaSiteId'));
                scope.setTag('environment', 'Editor');
                scope.setUser({
                  id: Wix.Utils.getInstanceValue('uid'),
                });
              });
            }

            return (
              <ErrorBoundary handleException={window.Sentry.captureException}>
                <EditorAppWithCreator sdk={sdk} {...props} />
              </ErrorBoundary>
            );
          }}
        </WixSDK>
      </WixSDKProvider>
    </Suspense>
  );
};
