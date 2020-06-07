// eslint-disable-next-line import/no-extraneous-dependencies
import { loader } from 'webpack';
import { transform } from './utils';

const serverFunctionLoader: loader.Loader = function (source) {
  return transform(source as string, this.resourcePath);
};

export default serverFunctionLoader;
