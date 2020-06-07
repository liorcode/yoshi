import { method } from 'yoshi-server';

export const greet = method(function (name) {
  return `hello ${name}`;
});
