import _ from 'lodash';
import { loader } from 'webpack';
import loaderUtils from 'loader-utils';

const loader: loader.Loader = function (source) {
  // Get templating options
  const options = this.query !== '' ? loaderUtils.getOptions(this) : {};
  const force = options.force || false;

  const allLoadersButThisOne = this.loaders.filter(function (loader) {
    return loader.normal !== module.exports;
  });
  // This loader shouldn't kick in if there is any other loader (unless it's explicitly enforced)
  if (allLoadersButThisOne.length > 0 && !force) {
    return source;
  }
  // Skip .js files (unless it's explicitly enforced)
  if (/\.js$/.test(this.resourcePath) && !force) {
    return source;
  }

  // The following part renders the template with lodash as a minimalistic loader
  //
  const template = _.template(
    source as string,
    _.defaults(options, {
      escape: /{%-([\s\S]+?)%}/g,
      evaluate: /{%([\s\S]+?)%}/g,
      interpolate: /{%=([\s\S]+?)%}/g,
      variable: 'data',
    }),
  );
  // Use __non_webpack_require__ to enforce using the native nodejs require
  // during template execution
  return (
    'var _ = __non_webpack_require__(' +
    JSON.stringify(require.resolve('lodash')) +
    ');' +
    'module.exports = function (templateParams) { with(templateParams) {' +
    // Execute the lodash template
    'return (' +
    template.source +
    ')();' +
    '}}'
  );
};

export = loader;
