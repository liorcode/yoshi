import { method } from 'yoshi-server';

export const greet = method(function (name: string) {
  // @ts-ignore
  const csrfProtected = this.req.csrfProtected ? 'csrfProtected' : '';
  return {
    greeting: `hello ${name} ${csrfProtected}`,
    name,
  };
});
