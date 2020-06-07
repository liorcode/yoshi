import { route, render } from 'yoshi-server';

export default route(async function () {
  // @ts-ignore
  const csrfProtected = this.req.csrfProtected ? 'csrfProtected' : '';
  const html = await render('app', {
    csrfProtected,
  });

  return html;
});
