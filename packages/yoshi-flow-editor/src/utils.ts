import path from 'path';
import { URL } from 'url';
import urlJoin from 'url-join';
import { BROWSER_LIB_URL } from '@wix/add-sentry/lib/constants';
import { SentryConfig } from 'yoshi-flow-editor-runtime/build/constants';
import { FlowEditorModel, ComponentModel, URLsConfig } from './model';

export const joinDirs = (...dirs: Array<string>) =>
  path.join(process.cwd(), ...dirs);

export const normalizeStartUrlOption = (urls: URLsConfig): Array<string> => {
  const result: Array<string> = [];
  if (urls.viewerUrl) {
    result.push(urls.viewerUrl);
  }
  if (urls.editorUrl) {
    result.push(urls.editorUrl);
  }
  return result;
};

const widgetUrlFormatter = (component: ComponentModel, baseUrl: string) => {
  return `${component.id}=${urlJoin(
    baseUrl,
    `${component.name}ViewerWidget.bundle.js`,
  )}`;
};

const tpaUrlFormatterForType = (type: 'editor' | 'settings' = 'editor') => (
  component: ComponentModel,
  baseUrl: string,
) => {
  return `${component.id}=${urlJoin(baseUrl, type, component.name)}`;
};

const viewerScriptUrlFormatter = (model: FlowEditorModel, baseUrl: string) => {
  return `${model.appDefId}=${urlJoin(baseUrl, 'viewerScript.bundle.js')}`;
};

const editorScriptUrlFormatter = (model: FlowEditorModel, baseUrl: string) => {
  return `${model.appDefId}=${urlJoin(baseUrl, 'editorScript.bundle.js')}`;
};

const staticsBaseUrlFormatter = (model: FlowEditorModel, baseUrl: string) => {
  return `${model.appDefId}={"staticsBaseUrl":"${baseUrl}"}`;
};

const withComponents = (components: Array<ComponentModel>) => {
  return (baseUrl: string) => {
    return (
      formatter: (component: ComponentModel, baseUrl: string) => string,
    ) => {
      return components
        .map((component) => formatter(component, baseUrl))
        .join(',');
    };
  };
};

export const overrideQueryParamsWithModel = (
  model: FlowEditorModel,
  { cdnUrl, serverUrl }: { cdnUrl: string; serverUrl: string },
) => (url: string): string => {
  const urlWithParams = new URL(url);

  const componentsWithUrl = withComponents(model.components);
  const viewerComponentsWithFormatter = componentsWithUrl(cdnUrl);
  const editorComponentsWithFormatter = componentsWithUrl(serverUrl);

  urlWithParams.searchParams.set(
    'tpaWidgetUrlOverride',
    editorComponentsWithFormatter(tpaUrlFormatterForType('editor')),
  );
  urlWithParams.searchParams.set(
    'tpaSettingsUrlOverride',
    editorComponentsWithFormatter(tpaUrlFormatterForType('settings')),
  );
  urlWithParams.searchParams.set(
    'widgetsUrlOverride',
    viewerComponentsWithFormatter(widgetUrlFormatter),
  );
  urlWithParams.searchParams.set(
    'viewerPlatformOverrides',
    viewerScriptUrlFormatter(model, cdnUrl),
  );

  urlWithParams.searchParams.set(
    'editorScriptUrlOverride',
    editorScriptUrlFormatter(model, cdnUrl),
  );

  urlWithParams.searchParams.set(
    'overridePlatformBaseUrls',
    staticsBaseUrlFormatter(model, cdnUrl),
  );

  // We want to have raw url for debug purposes.
  // TODO: Remove before releasing stable version.
  return decodeURIComponent(urlWithParams.toString());
};

export const generateSentryScript = (sentry: SentryConfig) => {
  return `<script id="sentry">
  (function(c,u,v,n,p,e,z,A,w){function k(a){if(!x){x=!0;var l=u.getElementsByTagName(v)[0],d=u.createElement(v);d.src=A;d.crossorigin="anonymous";d.addEventListener("load",function(){try{c[n]=r;c[p]=t;var b=c[e],d=b.init;b.init=function(a){for(var b in a)Object.prototype.hasOwnProperty.call(a,b)&&(w[b]=a[b]);d(w)};B(a,b)}catch(g){console.error(g)}});l.parentNode.insertBefore(d,l)}}function B(a,l){try{for(var d=m.data,b=0;b<a.length;b++)if("function"===typeof a[b])a[b]();var e=!1,g=c.__SENTRY__;"undefined"!==
  typeof g&&g.hub&&g.hub.getClient()&&(e=!0);g=!1;for(b=0;b<d.length;b++)if(d[b].f){g=!0;var f=d[b];!1===e&&"init"!==f.f&&l.init();e=!0;l[f.f].apply(l,f.a)}!1===e&&!1===g&&l.init();var h=c[n],k=c[p];for(b=0;b<d.length;b++)d[b].e&&h?h.apply(c,d[b].e):d[b].p&&k&&k.apply(c,[d[b].p])}catch(C){console.error(C)}}for(var f=!0,y=!1,q=0;q<document.scripts.length;q++)if(-1<document.scripts[q].src.indexOf(z)){f="no"!==document.scripts[q].getAttribute("data-lazy");break}var x=!1,h=[],m=function(a){(a.e||a.p||a.f&&
  -1<a.f.indexOf("capture")||a.f&&-1<a.f.indexOf("showReportDialog"))&&f&&k(h);m.data.push(a)};m.data=[];c[e]=c[e]||{};c[e].onLoad=function(a){h.push(a);f&&!y||k(h)};c[e].forceLoad=function(){y=!0;f&&setTimeout(function(){k(h)})};"init addBreadcrumb captureMessage captureException captureEvent configureScope withScope showReportDialog".split(" ").forEach(function(a){c[e][a]=function(){m({f:a,a:arguments})}});var r=c[n];c[n]=function(a,e,d,b,f){m({e:[].slice.call(arguments)});r&&r.apply(c,arguments)};
  var t=c[p];c[p]=function(a){m({p:a.reason});t&&t.apply(c,arguments)};f||setTimeout(function(){k(h)})})(window,document,"script","onerror","onunhandledrejection","Sentry","${sentry.id}","${BROWSER_LIB_URL}",{"dsn":"${sentry.DSN}"});
  </script>\n`;
};
