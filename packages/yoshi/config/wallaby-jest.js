module.exports = function(wallaby) {
  const wallabyCommon = require('./wallaby-common')(wallaby);
  // We need to add a wallaby compiler, because apparently wallaby does not
  // use the transform configuration of jest
  wallabyCommon.compilers = {
    '**/*.js{,x}': wallaby.compilers.babel({
      babel: require('@babel/core'),
      babelrc: true,
    }),
  };
  // add transformation to hoist jest.mock calls (for typescript projects)
  // https://wallabyjs.com/docs/integration/jest.html#jest-with-typescript-and-jestmock-calls
  wallabyCommon.preprocessors = {
    '**/*.js?(x)': file =>
      require('@babel/core').transform(file.content, {
        sourceMap: true,
        filename: file.path,
        presets: ['babel-preset-jest']
      })
  };
  wallabyCommon.testFramework = 'jest';
  wallabyCommon.setup = () => {
    let jestConfig = require('yoshi/config/jest.config.js'); // eslint-disable-line import/no-unresolved
    if (jestConfig.preset === 'jest-yoshi-preset') {
      const jestYoshiPreset = require('jest-yoshi-preset/jest-preset'); // eslint-disable-line import/no-unresolved
      jestConfig = jestYoshiPreset.projects.find(
        project => project.displayName === 'spec',
      );
    }
    wallaby.testFramework.configure(jestConfig);
  };
  wallaby.workers = { restart: false };
  return wallabyCommon;
};
