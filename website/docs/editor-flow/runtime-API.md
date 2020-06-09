---
id: runtime-API
title: Runtime API
sidebar_label: Runtime API
---

Yoshi Editor Flow provides runtime helpers for developing OOI apps.
It happens on 2 different layers:

- providing runtime helpers via `yoshi-flow-editor-runtime`.
- extending platform API's with additional utils specified for each environment (viewer script, editor script)

# `yoshi-flow-editor-rutime`

It exports various Higher Order Components (HOCs) and methods to reduce boilerplate on client's side and organize the app structure in a better way.

## `WixSDK`

WixSDK is a HOC that loads [IStaticWix](https://github.com/wix-private/fed-infra/blob/master/js-sdk-wrapper/src/types.ts) object.

It renders a `children` function with `sdk` argument:

`sdk`: `{ Wix: IWixStatic | null }`

```tsx
import { WixSDK } from "yoshi-flow-editor-runtime";

export default () => (
  <WixSDK>
    {sdk => <SomeComp Wix={sdk.Wix} /> // IStaticWix | null
    }
  </WixSDK>
);
```

`sdk.Wix` will be `null` if `WixSDK` is being used in Widget part and rendered in Viewer mode, so make sure you are checking if it's not `null` to use it.

#### Props

**isEditor** - should be passed for Settings part. It triggers a `WixSDK`, so it will use strict types for `sdk.Wix` and it won't be _optional_.

_Settings.ts_

```tsx
import { WixSDK } from "yoshi-flow-editor-runtime";

export default () => (
  <WixSDK isEditor>
    {sdk => <SomeComp Wix={sdk.Wix} /> // IStaticWix
    }
  </WixSDK>
);
```

## `BILogger`

Currently it consists of `BILoggerProvider` and `BILogger` components.

`BILoggerProvider` should be rendered in the root of you component and receive a `biLogger` prop.

`BILogger` is a consumer. It will render a `children` function with `biLogger` passed to provider.

You still need to create and configure `biLogger` instance, so it's just an attempt to remove some boilerplate from your side.

To configure biLogger instance, you have to follow [fed-handbook BI section steps](https://github.com/wix-private/fed-handbook/blob/master/BI.md#overview).

By loading schema logger you've initialized and registered, you should use different loggers according to runtime environment:

- Settings panel: `iframeAppBiLoggerFactory` imported from `@wix/iframe-app-bi-logger` package
- Widget: `@wix/web-bi-logger` package

_Settings.ts_

```tsx
import { WixSDK, BILogger, BILoggerProvider } from "yoshi-flow-editor-runtime";
import { iframeAppBiLoggerFactory } from "@wix/iframe-app-bi-logger";
import initSchemaLogger from "your-schema-logger-package";

const biLogger = initSchemaLogger(iframeAppBiLoggerFactory);

// Root component
export default () => (
  <BILoggerProvider logger={biLogger}>
    // Settings content...
    <ColorPicker />
  </BILoggerProvider>
);

// Somewhere deeper in the component
const ColorPicker = () => (
  <BiLogger>
    {biLogger => (
      <ColorPickerColorSpace
        onChange={() => {
          logger.logColorChange();
        }}
      />
    )}
  </BiLogger>
);
```

# Extended platform API's

To reduce boilerplate for platform entities (viewer controller, editor script), we are providing additional utilities.
The main goal is to preserve platform API's and make it more convenient for day-to-day use-cases.

## `flowAPI`

To extend platform API's editor flow passes an additional value to platform methods.
This value is an object called `flowAPI`. It's already configured for:

- app level. `flowAPI` will be passed for `initAppForPage` and editor script methods from `editor.app.ts`. (`editorReady`, `getManifest`, etc)
- **component level:** `flowAPI` will be a field for user's `controller.ts`.

In this section we'll go through instances and helpers `flowAPI` provides. In practice, `flowAPI` is not a single instance. Its shape will vary according to consumer's environment:

- `editor.app.ts`: [`EditorScriptFlowAPI`](https://github.com/wix/yoshi/blob/master/packages/yoshi-flow-editor-runtime/src/FlowAPI.ts#L91)
- `viewer.app.ts`: [`ViewerScriptFlowAPI`](https://github.com/wix/yoshi/blob/master/packages/yoshi-flow-editor-runtime/src/FlowAPI.ts#L137)
- `controller.ts`: [`ControllerFlowAPI`](https://github.com/wix/yoshi/blob/master/packages/yoshi-flow-editor-runtime/src/FlowAPI.ts#L43)

### Sentry

_Available for `viewer.app.ts`, `editor.app.ts` and `controller`._

Open-source error tracking tool that helps developers monitor and fix crashes in real time. You can head to [the official documentation](https://docs.sentry.io/) for better understanding of Sentry's capabilities, API and configuration.

**All unhandled errors in `Widget`, `Settings`, `controller`, `viewer.app.ts`, `editor.app.ts` are being logged automatically**.

Each log event has different `environment` according to the context an error appeared:

| Error Context        | Logger Environment |
| -------------------- | ------------------ |
| **Widget** in viewer | Viewer             |
| **Widget** in editor | Editor             |
| **Settings**         | Editor             |
| **controller**       | Viewer:Worker      |
| **viewer.app**       | Viewer:Worker      |
| **editor.app**       | Editor:Worker      |

For example, if the error will appear in _controller.ts_

```ts
export default ({ flowAPI }) => {
  // This error is being logged by the Editor Flow
  throw new Error('Ooh, oops 🥴');

  try {
    // This error is being logged by user
    throw new Error('Ooh, oops 🥴);
  } catch (e) {
    flowAPI.reportError(e);
  }
};
```

It will be logged under `Viewer:Worker` environment.
![sentry-search](https://user-images.githubusercontent.com/11733036/84033045-f0eac280-a9a0-11ea-80dc-2770e60af399.png)
![sentry-error-row](https://user-images.githubusercontent.com/11733036/84033054-f3e5b300-a9a0-11ea-82f3-5c45f8667aed.png)

#### `sentryMonitor`

_Available for `viewer.app.ts`, `editor.app.ts` and `controller`._

Provides a `Raven` or `Sentry Browser Client` instances according to the environment it's consumed. To prevent increasing a bundle, we're just taking the monitor passed by the platform. We create an instance which is specifically configured for your app and environment and pass it as a `flowAPI` property.

_controller.ts_

```ts
export default ({ flowAPI }) => {
  try {
    doSomethingDangerouseButNotVeryImportant();
  } catch (e) {
    flowAPI.sentryMonitor.captureMessage(
      "Something not important is not working."
    );
  }
};
```

#### `reportError`

_Available for `viewer.app.ts`, `editor.app.ts` and `controller`._

It's a shorthand for `sentryMonitor.captureException`. Since this method is the main part of sentry interaction use-cases, we providing it as a separate method.

_controller.ts_

```ts
export default ({ flowAPI }) => {
  try {
    doSomethingDangerouseAndVeryImportant();
  } catch (e) {
    flowAPI.reportError(e); // the same as `flowAPI.sentryMonitor.captureException(e);`
  }
};
```

_editor.app.ts_

```ts
export const editorReady: EditorReadyFn = async (
  editorSDK, // platform
  appDefinitionId, // platform
  platformOptions, // platform
  flowAPI // editor flow
) => {
  if (platformOptions.firstInstall) {
    try {
      installApp();
    } catch (e) {
      flowAPI.reportError(e);
    }
  }
};
```

### Fedops

_Available for `editor.app.ts` and `controller`._

A javascript library to allow realtime monitoring, following the 'fedops' methodology.

After you initialize the app via `create-yoshi-app`, integrated it with lifecycle and pushed to the github, a [grafana](https://grafana.wixpress.com/login) dashboard will be created automatically for your app.

All boards for each component will be configured also.

#### `fedopsLogger`

Provides a `Fedops BaseLogger` initialized for current environment. Logs from `editor.app.ts` will be available for editor script board, `controller` - for component's board.

For more info relared to fedopsLogger API, please [follow this link](https://github.com/wix-private/fed-infra/tree/master/fedops/fedops-logger)

_controller.ts_

```ts
export default ({ flowAPI }) => {
  flowAPI.appLoadStarted();

  const { appDefinitionId } = appParams;

  return {
    pageReady() {
      if (flowAPI.isSSR()) {
        flowAPI.fedopsLogger.appLoaded();
      }
    }
  };
};
```

### isSSR

_Available for the `controller`._

A helper that returns `true` if current rendering environment is a server-side-rendering. Returns `false` in case of client-side-rendering.
[Read more about SSR and CRS](https://bo.wix.com/wix-docs/client/viewer-platform---ooi/about/get-started/guidelines#viewer-platform---ooi_about_get-started_guidelines_overview) for viewer platform.

### isMobile

_Available for the `controller`._

A helper that returns `true` if window's form factor is a mobile.

### getSiteLanguage

_Available for the `controller`._

If multilingual is enabled, returns current language for it. If not, returns a site language. Will use a fallback language if nothing found.

_controller.ts_

```ts
export default async function({ flowAPI }) => {
  return {
    pageReady() {
      const language = flowAPI.getSiteLanguage();
      const translations = getSiteTranslations(language);

      // ...
    }
  };
}
```

### getExperiments

_Available for `viewer.app.ts`, `editor.app.ts` and `controller`._

Returns a `Promise`, which will be resolved with `Experiments` instance for current app's scope.

To read more about experiments API, [check Experiments page](https://github.com/wix-private/fed-infra/tree/master/experiments/wix-experiments)

`getExperiments` won't trigger a fetch process for your experiments. To optimize performance, it's already triggered under the hood before method execution.
So technically `getExperiments` just returns a pending or resolved `Promise`.

_controller.ts_

```ts
export default async function({ flowAPI }) => {
  return {
    pageReady() {
      const experiments = await flowAPI.getExperiments();
      setProps({
        withNewButton: experiments.enabled('specs.my-scope.EnableNewButton'),
      });
    }
  };
}
```

Parallel loading example to improve your controller performance:

_controller.ts_

```ts
export default async function createController({ flowData }) => {
  return {
    pageReady() {
      const [experiments, someData] = await Promise.all([
        flowData.getExperiments(),
        getSomeData(),
      ]);
      setProps({
        withNewButton: experiments.enabled('specs.my-scope.EnableNewButton'),
        someData,
      });
    }
  };
}
```

> We are currently working on implementing more runtime helpers
