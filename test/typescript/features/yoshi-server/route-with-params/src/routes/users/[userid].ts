import { route, render } from 'yoshi-server';

export default route(async function () {
  const html = await render('app', {
    title: this.params.userid,
  });

  return html;
});
