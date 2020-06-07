import { method } from 'yoshi-server';

export const greet = method(function (name) {
  if (name === 'Yaniv') {
    throw new Error('A cool error!');
  }
  return {
    greeting: `hello ${name}`,
    name,
  };
});
