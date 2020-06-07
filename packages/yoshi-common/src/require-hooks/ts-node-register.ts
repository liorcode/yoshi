import globby from 'globby';
import { register } from 'ts-node';

const originalJsHandler = require.extensions['.js'];

const { extensions } = register({
  fast: true,
  compilerOptions: {
    // force commonjs modules
    module: 'commonjs',
    // allow using Promises, Array.prototype.includes, String.prototype.padStart, etc.
    lib: ['es2017'],
    // use async/await instead of embedding polyfills
    target: 'es2017',
  },
});

// don't transpile with ts-node/register files ignored by git
const shouldIgnore = globby.gitignore.sync({ cwd: process.cwd() });

// `ts-node` only supports regex ignore patterns, use custom extensions so functions can
// be used
if (extensions.includes('.js')) {
  const originalTsNodeHandler = require.extensions['.js'];

  require.extensions['.js'] = function (m, filename) {
    if (shouldIgnore(filename)) {
      return originalJsHandler(m, filename);
    }

    return originalTsNodeHandler(m, filename);
  };
}
