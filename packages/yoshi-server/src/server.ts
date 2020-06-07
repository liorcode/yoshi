import path from 'path';
import { parse as parseUrl } from 'url';
import { RequestHandler, Request, Response } from 'express';
// @ts-ignore - missing types
import Youch from 'youch';
import fs from 'fs-extra';
import globby from 'globby';
import { send } from 'micro';
import importFresh from 'import-fresh';
import requireHttps from 'wix-express-require-https';
import cookieParser from 'cookie-parser';
import project from 'yoshi-config';
import wixExpressCsrf from '@wix/wix-express-csrf';
import { ROUTES_BUILD_DIR, BUILD_DIR } from 'yoshi-config/build/paths';
import { BootstrapContext } from '@wix/wix-bootstrap-ng/typed';
import { InternalServerError } from './httpErrors';
import { RouteFunction, InitServerFunction } from './types';
import { pathMatch, connectToYoshiServerHMR, buildRoute } from './utils';
import runMiddleware from './runMiddleware';

export type Route = {
  route: string;
  handler: (
    req: Request,
    res: Response,
    params: { [param: string]: any },
  ) => void;
};

export default class Server {
  private context: BootstrapContext;
  private config: any;
  private routes: Array<Route>;
  private initData: any;

  constructor(context: BootstrapContext) {
    this.context = context;
    try {
      this.config = context.config.load(
        // strip organization name from package name
        project.name.slice(project.name.indexOf('/') + 1),
      );
    } catch (e) {
      // do nothing
    }
    this.routes = this.createRoutes();

    if (process.env.NODE_ENV === 'development') {
      const socket = connectToYoshiServerHMR();

      socket.onmessage = async () => {
        try {
          this.routes = this.createRoutes();
        } catch (error) {
          socket.send(JSON.stringify({ success: false }));
        }

        socket.send(JSON.stringify({ success: true }));
      };
    }
  }

  static async create(context: BootstrapContext) {
    const server = new Server(context);
    await server.initServer();
    return server;
  }

  private initServer: () => Promise<void> = async () => {
    const initServerPath = path.resolve(BUILD_DIR, 'init-server.js');

    if (await fs.pathExists(initServerPath)) {
      const chunk = importFresh(initServerPath) as InitServerFunction;

      this.initData = await chunk(this.context);
    }
  };

  public handle: RequestHandler = async (req, res, next): Promise<void> => {
    try {
      const { pathname } = parseUrl(req.url as string, true);

      for (const { handler, route } of this.routes) {
        const params = pathMatch(
          route,
          // for Businss Manager apps, routes are mapped (in Fryingpan or BM testkit):
          // '/_api/projectName/_api_' -> '/api/_api_'
          pathname?.replace('/api/_api_', '/_api_') as string,
        );

        if (params) {
          await runMiddleware(req, res, requireHttps);
          await runMiddleware(req, res, cookieParser());
          await runMiddleware(req, res, wixExpressCsrf());

          const renderer = (this.context as any).renderer;
          if (renderer) {
            await runMiddleware(req, res, renderer.middleware());
          }
          return await handler(req, res, params);
        }
      }
    } catch (error) {
      if (
        process.env.NODE_ENV === 'production' ||
        process.env.IS_INTEGRATION_TEST_PROD === 'true'
      ) {
        return next(new InternalServerError('internal server error', error));
      }

      const youch = new Youch(error, req);
      const html: string = await youch.toHTML();

      return send(res, 500, html);
    }

    if (process.env.NODE_ENV === 'production') {
      // If Yoshi Server did not find anything, pass the request on
      return next();
    }

    return send(res, 404, 'not found');
  };

  private createRoutes(): Array<Route> {
    const routesBuildDir = path.resolve(ROUTES_BUILD_DIR);

    const serverChunks = globby.sync('**/*.js', {
      cwd: routesBuildDir,
      absolute: true,
    });

    return serverChunks.map((absolutePath) => {
      const chunk = importFresh(absolutePath) as RouteFunction<any>;
      const route = buildRoute(absolutePath);
      return {
        route,
        handler: async (req, res, params) => {
          const fnThis = {
            context: this.context,
            req,
            res,
            params,
            initData: this.initData,
            config: this.config,
          };

          const result = await chunk.call(fnThis);
          if (result) {
            // In case that the user is adding both custom response and return value:
            // ```
            // this.res.send('hello');
            // return 'hello2';
            // ```
            if (res.headersSent) {
              console.log(
                'Cannot return a response since `this.req` has been used to sent back the request',
              );
            } else {
              return send(res, 200, result);
            }
          }
        },
      };
    });
  }
}
