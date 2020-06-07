import { method } from 'yoshi-server';

export const greet = method(function (name) {
  return {
    greeting: `hello ${name} ${this.req.csrfProtected ? 'csrfProtected' : ''}`,
    name,
  };
});
