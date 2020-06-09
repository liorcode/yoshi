---
id: component
title: Component Level
sidebar_label: Component Level
---

According to the Yoshi Editor Flow concept, the app is grouped by components, instead of functional purpose. Since communitcation between different components (Widget, Page) in scope of single app is a rare case, people usually working on single Component while working on the new business feature.

So for now, we'll have `Widget`, `Settings` and `controller` in a single place, instead of having `settings` directory with all settings panels of your app. Or `viewerScript` directory, which will include all controllers. With last approach, it could be really hard to navigate between `controller` and `Widget` located in completely different directories or even projects, since Widget consumes properties passed by controller. You'll probably want to maintain `PublicData` in a single place also instead of switching between settings and widget directory.

## `.component.json`
Located under `src/components/:componentName/.component.json` this config file helps us to generate `createControllers` for Viewer Script under the hood. Here you can find `id` of your component and type (`WIDGET_OUT_OF_IFRAME`, `PAGE_OUT)OF_IFRAME` or `APP_STUDIO_WIDGET`).

## `controller`
File which `export default createController` function.

`createController` is called with useful arguments by platform.

Options:
#### `controllerConfig`
Controller config passed by the platform.

Read more: [IControllerInfo in platform docs](https://bo.wix.com/wix-docs/client/client-viewer-platform/articles/lifecycle#client-viewer-platform_articles_lifecycle_controllerinfo)

#### `flowAPI`
Additional utilities to reduce runtime boilerplate.

Follow [Flow API section](../runtime-API.md#flowapi) for more info.


*controller.ts*
```ts
export default async function({ flowAPI, controllerConfig }) => {
  return {
    pageReady() {
      const experiments = await flowAPI.getExperiments();
      controllerConfig.setProps({
        withNewButton: experiments.enabled('specs.my-scope.EnableNewButton'),
      });
    }
  };
}
```

## `Widget`
File which `export default` React Component.

This component will be rendered in 2 different environments: viewer (common frame for the whole side) and editor (isolated iFrame).
The basic idea is that developers shouldn't be aware of this difference.
Just exporting a valid React Component and receiving a props from the controller's `setProps` will perfectly work.

*Widget.ts*
```tsx
export default ({ title }) => (<div>
  <h1>{title}</h1>
</div>)
```

*controller.ts*
```tsx
export default ({ controllerConfig }) => ({
  pageReady() {
    controllerConfig.setProps({
      title: 'Some title from controller',
    });
  }
})
```

## `Settings`
*(optional)*

File which `export default` React Component.

It will be rendered in editor part. Via Settings panel app's user can configure Out-of-iFrame Widget.

It's recommend to use [`wix-base-ui`](https://github.com/wix-private/wix-base-ui) for styling and [TPA Settings](https://github.com/wix-private/tpa-settings) for reducing boilerplate relating to Settings panel development.

*Settings*
```tsx
import { TpaSettingsProvider } from '@wix/tpa-settings/dist/src/contexts';
import { SettingsTabLayout } from '@wix/tpa-settings/dist/src/components';
import { WixSDK } from 'yoshi-flow-editor-runtime';
import 'yoshi-flow-editor-runtime/styles/wix-base-ui.global.scss';

const Settings = () => {
  return (
    <WixSDK>{({ Wix }) => (
      <TpaSettingsProvider Wix={Wix}>
        <SettingsTabLayout>
          <SettingsTabLayout.Tab
            title={t('settings.tab.main')}
            articleId="78c122c7-ef06-47c1-a137-07abfae7ed89"
            Component={() => <MainTab />}
          />
        </SettingsTabLayout>
      </TpaSettingsProvider>
    )}</WixSDK>
  );
};

export default Settings;
```