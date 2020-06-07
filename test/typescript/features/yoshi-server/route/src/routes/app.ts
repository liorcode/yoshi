import { route, render, runMiddleware } from 'yoshi-server';
import { Request, Response, NextFunction } from 'express';

const helloMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.hello = 'hello from yoshi server';
  next();
};

export default route(async function () {
  await runMiddleware(this.req, this.res, helloMiddleware);
  const html = await render('app', {
    // @ts-ignore
    title: this.req.hello,
  });

  return html;
});
