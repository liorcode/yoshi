import { method } from 'yoshi-server';

export const greet = method(function (name: string) {
  if (name === 'Yaniv') {
    throw new Error('An error occured inside greet');
  }
  return { greeting: name };
});
