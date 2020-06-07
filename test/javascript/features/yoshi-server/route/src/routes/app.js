import { route, render, runMiddleware } from 'yoshi-server';

const helloMiddleware = (req, res, next) => {
  req.hello = 'hello from yoshi server';
  next();
};

export default route(async function () {
  await runMiddleware(this.req, this.res, helloMiddleware);
  const html = await render('app', {
    title: this.req.hello,
  });

  return html;
});
