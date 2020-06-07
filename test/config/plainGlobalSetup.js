const { setup: setupPuppeteer } = require('jest-environment-puppeteer');
const Scripts = require('../scripts');

global.scripts = new Scripts({
  testDirectory: process.env.TEST_DIRECTORY,
});

module.exports = async (globalConfig) => {
  await setupPuppeteer(globalConfig);
};
