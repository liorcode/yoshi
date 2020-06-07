import { route } from 'yoshi-server';

export default route(async function () {
  this.res.send('<h1>hello Yaniv</h1>');
  return '<h1>should not see this</h1>';
});
