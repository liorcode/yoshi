import { route, render } from 'yoshi-server';

export default route(async function () {
  const html = await render('app', {
    csrfProtected: this.req.csrfProtected ? 'csrfProtected' : '',
  });

  return html;
});
