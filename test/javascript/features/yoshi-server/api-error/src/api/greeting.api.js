import { method } from 'yoshi-server';

export const greet = method(function (name) {
  if (name === 'Yaniv') {
    throw new Error('An error occured inside greet');
  }
  return { greeting: name };
});
