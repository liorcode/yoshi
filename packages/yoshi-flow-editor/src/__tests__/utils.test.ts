import {
  OOI_WIDGET_COMPONENT_TYPE,
  PAGE_COMPONENT_TYPE,
} from 'yoshi-flow-editor-runtime/build/constants';
import { overrideQueryParamsWithModel } from '../utils';

describe('addOverrideQueryParamsWithModel', () => {
  const cdnUrl = 'https://localhost:5005/';
  const serverUrl = 'https://localhost:5004';
  it('generates override params for single url', () => {
    const overrideParams = overrideQueryParamsWithModel(
      {
        appName: 'app',
        projectName: '@wix/app',
        artifactId: '7891',
        editorEntryFileName: 'a/b/editor.app.ts',
        viewerEntryFileName: 'a/b',
        appDefId: 'APP_DEF_ID',
        sentry: null,
        urls: {
          viewerUrl: 'https://google.com',
          editorUrl: 'https://google.com',
        },
        experimentsConfig: {
          scope: 'test-scope',
        },
        components: [
          {
            name: 'comp',
            id: 'WIDGET_ID',
            type: OOI_WIDGET_COMPONENT_TYPE,
            widgetFileName: 'proj/comp/Widget.ts',
            viewerControllerFileName: 'proj/comp/controller.ts',
            editorControllerFileName: null,
            settingsFileName: 'proj/comp/settings.ts',
          },
        ],
      },
      { cdnUrl, serverUrl },
    );
    const urlWithParams = overrideParams('https://mysite.com');

    expect(urlWithParams).toBe(
      `https://mysite.com/?tpaWidgetUrlOverride=WIDGET_ID=${serverUrl}/editor/comp&tpaSettingsUrlOverride=WIDGET_ID=${serverUrl}/settings/comp&widgetsUrlOverride=WIDGET_ID=${cdnUrl}compViewerWidget.bundle.js&viewerPlatformOverrides=APP_DEF_ID=${cdnUrl}viewerScript.bundle.js&editorScriptUrlOverride=APP_DEF_ID=${cdnUrl}editorScript.bundle.js&overridePlatformBaseUrls=APP_DEF_ID={"staticsBaseUrl":"${cdnUrl}"}`,
    );
  });

  it('generates override params for multiple url', () => {
    const overrideParams = overrideQueryParamsWithModel(
      {
        appName: 'app',
        projectName: '@wix/app',
        artifactId: '7891',
        urls: {},
        experimentsConfig: {
          scope: 'test-scope',
        },
        editorEntryFileName: 'a/b/editor.app.ts',
        viewerEntryFileName: 'a/b',
        appDefId: 'APP_DEF_ID',
        sentry: null,
        components: [
          {
            name: 'comp',
            id: 'COMP_WIDGET_ID',
            type: OOI_WIDGET_COMPONENT_TYPE,
            widgetFileName: 'proj/comp/Widget.ts',
            viewerControllerFileName: 'proj/comp/controller.ts',
            editorControllerFileName: null,
            settingsFileName: 'proj/comp/settings.ts',
          },
          {
            name: 'page',
            id: 'PAGE_WIDGET_ID',
            type: PAGE_COMPONENT_TYPE,
            widgetFileName: 'proj/page/Widget.ts',
            viewerControllerFileName: 'proj/page/controller.ts',
            editorControllerFileName: null,
            settingsFileName: 'proj/page/settings.ts',
          },
        ],
      },
      { cdnUrl, serverUrl },
    );
    const urlWithParams = overrideParams('https://mysite.com');

    expect(urlWithParams).toBe(
      `https://mysite.com/?tpaWidgetUrlOverride=COMP_WIDGET_ID=${serverUrl}/editor/comp,PAGE_WIDGET_ID=${serverUrl}/editor/page&tpaSettingsUrlOverride=COMP_WIDGET_ID=${serverUrl}/settings/comp,PAGE_WIDGET_ID=${serverUrl}/settings/page&widgetsUrlOverride=COMP_WIDGET_ID=${cdnUrl}compViewerWidget.bundle.js,PAGE_WIDGET_ID=${cdnUrl}pageViewerWidget.bundle.js&viewerPlatformOverrides=APP_DEF_ID=${cdnUrl}viewerScript.bundle.js&editorScriptUrlOverride=APP_DEF_ID=${cdnUrl}editorScript.bundle.js&overridePlatformBaseUrls=APP_DEF_ID={"staticsBaseUrl":"${cdnUrl}"}`,
    );
  });

  it("doesn't generate override params for editor script", () => {
    const overrideParams = overrideQueryParamsWithModel(
      {
        appName: 'app',
        projectName: '@wix/app',
        artifactId: '7891',
        urls: {},
        editorEntryFileName: null,
        viewerEntryFileName: 'a/b',
        appDefId: 'APP_DEF_ID',
        experimentsConfig: {
          scope: 'test-scope',
        },
        sentry: null,
        components: [
          {
            name: 'comp',
            id: 'WIDGET_ID',
            type: OOI_WIDGET_COMPONENT_TYPE,
            widgetFileName: 'proj/comp/Widget.ts',
            viewerControllerFileName: 'proj/comp/controller.ts',
            editorControllerFileName: null,
            settingsFileName: 'proj/comp/settings.ts',
          },
        ],
      },
      { cdnUrl, serverUrl },
    );
    const urlWithParams = overrideParams('https://mysite.com');

    expect(urlWithParams).toBe(
      `https://mysite.com/?tpaWidgetUrlOverride=WIDGET_ID=${serverUrl}/editor/comp&tpaSettingsUrlOverride=WIDGET_ID=${serverUrl}/settings/comp&widgetsUrlOverride=WIDGET_ID=${cdnUrl}compViewerWidget.bundle.js&viewerPlatformOverrides=APP_DEF_ID=${cdnUrl}viewerScript.bundle.js&editorScriptUrlOverride=APP_DEF_ID=https://localhost:5005/editorScript.bundle.js&overridePlatformBaseUrls=APP_DEF_ID={"staticsBaseUrl":"${cdnUrl}"}`,
    );
  });
});
