import memoize from 'lodash/memoize';
import i18next from 'i18next';
import { IWixStatic } from '@wix/native-components-infra/dist/es/src/types/wix-sdk';
// bundle in fallback language
import messagesEn from '../assets/locales/messages_en.json';

declare let __webpack_public_path__: string;
const DEFAULT_LANGUAGE = 'en';

export function getSiteTranslations(
  language: string,
): Promise<Record<string, string>> {
  if (language === DEFAULT_LANGUAGE) {
    return Promise.resolve(messagesEn);
  }

  // locales are `fetch`ed and not `import`ed because
  // `bolt` SSR enviroment doesn't support webpack's `JsonpTemplatePlugin`
  // see also:
  //   https://github.com/wix-private/site-search/pull/369
  //   https://github.com/wix-private/site-search/commit/93a16dfbe1fcca9af7cc1abe88f0e0df222970c8
  return fetch(
    `${__webpack_public_path__}assets/locales/messages_${language}.json`,
  ).then((r) => {
    if (!r.ok) {
      console.error(`Can't load locale: ${language}`);
      return Promise.resolve(messagesEn);
    }

    return r.json();
  });
}

export const i18nInstance = i18next.createInstance();

export interface I18nConfig {
  language: string;
  translations?: object;
  waitForReact?: boolean;
}

export default memoize(function i18n(params: I18nConfig) {
  const { language, translations, waitForReact } = params;
  const options: any = {
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    keySeparator: false,
    react: {
      wait: !!waitForReact,
    },
  };

  if (translations) {
    options.resources = {
      [language]: {
        translation: translations,
      },
    };
  } else {
    i18nInstance.use({
      type: 'backend', // backed for worker
      read: async (
        lang: string,
        namespace: string,
        callback: (error: Error | null, t?: any) => void,
      ) => {
        return getSiteTranslations(lang)
          .then((t) => callback(null, t))
          .catch((error) => callback(error));
      },
    });
  }

  return i18nInstance.init(options);
});

export const getLanguageWithInstance = memoize((Wix: IWixStatic) => {
  return Wix.Utils.getLocale() || DEFAULT_LANGUAGE;
});
