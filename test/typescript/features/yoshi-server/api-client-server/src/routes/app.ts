import { route, render } from 'yoshi-server';

export default route(async function () {
  const html = await render('app', { foo: this.req.aspects.session.userGuid }); // test this.req type

  return html;
});
