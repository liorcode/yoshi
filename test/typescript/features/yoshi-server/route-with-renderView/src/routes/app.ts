import { route, renderView } from 'yoshi-server';

export default route(async function () {
  renderView(this.res, 'templates/app.ejs', {
    title: 'hello from yoshi server',
  });
});
