import path from 'path';
import globby from 'globby';
import importFresh from 'import-fresh';
import { send, json as parseBodyAsJson } from 'micro';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';
import serializeError from 'serialize-error';
import { BUILD_DIR } from 'yoshi-config/build/paths';
import { requestPayloadCodec, DSL } from '../types';
import { relativeFilePath, connectToYoshiServerHMR } from '../utils';
import { route } from '..';

const buildDir = path.resolve(BUILD_DIR);

let functions = createFunctions();

function createFunctions() {
  const serverChunks = globby.sync('**/*.api.js', {
    cwd: buildDir,
    absolute: true,
  });

  const functions: {
    [filename: string]: { [functionName: string]: DSL<any, any> };
  } = serverChunks.reduce((acc, absolutePath) => {
    const filename = relativeFilePath(buildDir, absolutePath);

    return {
      ...acc,
      [filename]: importFresh(absolutePath),
    };
  }, {});

  return functions;
}

if (process.env.NODE_ENV === 'development') {
  const socket = connectToYoshiServerHMR();

  socket.onmessage = async () => {
    try {
      functions = createFunctions();
    } catch (error) {
      socket.send(JSON.stringify({ success: false }));
    }
    socket.send(JSON.stringify({ success: true }));
  };
}

export default route(async function () {
  const body = this.req.body || (await parseBodyAsJson(this.req));
  const validation = requestPayloadCodec.decode(body);

  if (isLeft(validation)) {
    return send(this.res, 406, {
      errors: PathReporter.report(validation),
    });
  }

  const { fileName, functionName, args } = validation.right;
  const fn = functions?.[fileName]?.[functionName]?.__fn__;

  if (!fn) {
    return send(this.res, 406, {
      errors: `Function ${functionName}() was not found in file ${fileName}`,
    });
  }

  try {
    const fnThis = {
      context: this.context,
      req: this.req,
      res: this.res,
      config: this.config,
      initData: this.initData,
    };

    return { payload: await fn.apply(fnThis, args) };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      return send(this.res, 500, {
        errors: ['internal server error'],
      });
    }

    return send(this.res, 500, {
      errors: [serializeError(error)],
    });
  }
});
