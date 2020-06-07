const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const { WS_ENDPOINT_PATH, IS_DEBUG_MODE } = require('./constants');
const { setupRequireHooks } = require('yoshi-common/build/require-hooks');
const loadJestYoshiConfig = require('../load-jest-config');
const { getBrowserDebugFunction } = require('./utils');
const { servers } = require('yoshi-config');

// the user's config is loaded outside of a jest runtime and should be transpiled
// with babel/typescript, this may be run separately for every worker
setupRequireHooks();

const jestYoshiConfig = loadJestYoshiConfig();

const ParentEnvironment = jestYoshiConfig.bootstrap
  ? require('../jest-environment-yoshi-bootstrap')
  : require('jest-environment-node');

module.exports = class PuppeteerEnvironment extends ParentEnvironment {
  async setup() {
    await super.setup();

    const browserWSEndpoint = await fs.readFile(WS_ENDPOINT_PATH, 'utf8');

    let isDebugMode = false;

    try {
      isDebugMode = JSON.parse(await fs.readFile(IS_DEBUG_MODE, 'utf8'));
    } catch (e) {}

    if (!browserWSEndpoint) {
      throw new Error('wsEndpoint not found');
    }

    this.global.browser = await puppeteer.connect({
      browserWSEndpoint,
    });

    this.global.isDebugMode = isDebugMode;

    this.global.page = await this.global.browser.newPage();

    this.global.debugBrowser = getBrowserDebugFunction(this.global.page);

    this.global.page.setDefaultTimeout(10 * 1000);

    this.global.page.setDefaultNavigationTimeout(10 * 1000);

    this.global.page.on('pageerror', (error) => {
      this.global.console.warn(`Puppeteer page error: ${error.message}`);
      this.global.console.warn(error.stack);
    });

    this.global.page.on('requestfailed', (request) => {
      if (request.url().includes(servers.cdn.url)) {
        this.global.console.warn(
          `We found that some of your static assets failed to load:
          url: ${request.url()}, errText: ${
            request.failure().errorText
          }, method: ${request.method()}
          Please try running 'npm start' in another terminal in order to start your CDN server.
          `,
        );
      } else {
        this.global.console.warn(
          `url: ${request.url()}, errText: ${
            request.failure().errorText
          }, method: ${request.method()}`,
        );
      }
    });
  }

  async teardown() {
    // There is an issue that the page is sometimes missing - https://github.com/wix/yoshi/issues/1642
    if (this.global.page) {
      await this.global.page.close();
    }
    await super.teardown();
  }
};
