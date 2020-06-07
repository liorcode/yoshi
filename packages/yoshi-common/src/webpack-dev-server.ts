import http from 'http';
import https from 'https';
import path from 'path';
import cors from 'cors';
import OriginalWebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import { STATICS_DIR } from 'yoshi-config/build/paths';
import express from 'express';
import { createDevServerSocket as createDevServerTunnelSocket } from './utils/suricate';

export function redirectMiddleware(
  hostname: string,
  port: number,
): express.Handler {
  return (req, res, next) => {
    if (!/\.min\.(js|css)/.test(req.originalUrl)) {
      return next();
    }

    const httpModule = req.protocol === 'http' ? http : https;

    const options = {
      port,
      hostname,
      path: req.originalUrl.replace('.min', ''),
      rejectUnauthorized: false,
    };

    const request = httpModule.request(options, (proxiedResponse) => {
      for (const header in proxiedResponse.headers) {
        // @ts-ignore
        res.setHeader(header, proxiedResponse.headers[header]);
      }
      proxiedResponse.pipe(res);
    });

    request.on('error', () => next()).end();
  };
}

// The server should be accessible externally
export const host = '0.0.0.0';

export class WebpackDevServer extends OriginalWebpackDevServer {
  public port: number;
  public https: boolean | https.ServerOptions;
  public compiler: webpack.Compiler;
  public suricate: boolean;
  public appName: string;
  private suricateApi: any;

  constructor(
    compiler: webpack.Compiler,
    {
      publicPath,
      https,
      port,
      suricate,
      appName,
      cwd = process.cwd(),
    }: {
      publicPath: string;
      https: boolean | https.ServerOptions;
      port: number;
      suricate: boolean;
      appName: string;
      cwd?: string;
    },
  ) {
    if (suricate) {
      compiler.hooks.done.tapPromise(
        'webpack-dev-server/suricate',
        async () => {
          this.suricateApi.updateCache();
        },
      );
    }

    super(compiler, {
      // Enable gzip compression for everything served
      compress: true,
      clientLogLevel: 'error',
      contentBase: path.join(cwd, STATICS_DIR),
      hot: true,
      publicPath,
      writeToDisk: true,
      // We write our own errors/warnings to the console
      quiet: true,
      noInfo: true,
      https,
      host,
      overlay: true,
      // https://github.com/wix/yoshi/pull/1191
      allowedHosts: [
        '.wix.com',
        '.editorx.com',
        '.editorx.io',
        '.wixsite.com',
        '.ooidev.com',
        '.editor-flow-dev.com',
        '.deviantart.lan',
      ],
      // TODO - check if needed for suricate and how can be better implemented
      disableHostCheck: suricate,
      before(expressApp) {
        // Send cross origin headers
        expressApp.use(
          cors(
            // TODO - check if needed for suricate and how can be better implemented
            suricate
              ? {
                  origin: (requestOrigin, cb) => cb(null, true),
                  credentials: true,
                }
              : {},
          ),
        );
        // Redirect `.min.(js|css)` to `.(js|css)`
        expressApp.use(redirectMiddleware(host, port));
      },
    });

    this.port = port;
    this.https = https;
    this.compiler = compiler;
    this.appName = appName;
    this.suricate = suricate;
  }

  // Update sockets with new stats, we use the sockWrite() method
  // to update the hot client with server data
  send(type: string, data: any) {
    // @ts-ignore
    return this.sockWrite(this.sockets, type, data);
  }

  listenPromise() {
    const listenTarget = this.suricate
      ? createDevServerTunnelSocket(this.appName, this.port, {
          cache: process.env.ENABLE_SURICATE_CACHE === 'true',
        })
      : this.port;

    if (this.suricate) {
      this.suricateApi = listenTarget;
    }

    return new Promise((resolve, reject) => {
      super.listen(listenTarget, host, (err) =>
        err ? reject(err) : resolve(),
      );
    });
  }
}
