import { route, runMiddleware } from 'yoshi-server';

const errorMiddleware = () => {
  throw new Error('There was an error');
};

export default route(async function () {
  await runMiddleware(this.req, this.res, errorMiddleware);
});
