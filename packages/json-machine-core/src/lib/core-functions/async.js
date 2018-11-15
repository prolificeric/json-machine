import { curryLambdaN } from '../util';

export default {
  'delayed': curryLambdaN(3, (context, [lambda, durationMs, ...args], onValue) => {
    setTimeout(() => {
      lambda(context, args, onValue);
    }, durationMs);
  })
};
