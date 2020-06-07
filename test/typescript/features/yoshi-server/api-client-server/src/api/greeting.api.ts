import { method } from 'yoshi-server';

export const greet = method(function (name: string) {
  return {
    greeting: `hello ${name}`,
    name: this.req.aspects.session.userGuid, // test this.req type
  };
});
