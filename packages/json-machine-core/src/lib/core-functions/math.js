import { curryLambdaN } from '../util';

const MathFunction = fn => {
  return curryLambdaN(2, (context, args, onValue) => {
    onValue({
      context,
      value: fn(...args)
    });
  });
};

const VariadicMathFunction = reduceFn => {
  return curryLambdaN(2, (context, args, onValue) => {
    const value = args.slice(1).reduce(reduceFn, args[0]);

    onValue({
      context,
      value
    });
  });
};

const Wrapped = fn => {
  return curryLambdaN(2, (context, args, onValue) => {
    const value = fn(...args);

    onValue({
      context,
      value
    });
  });
};

export default {
  '+': MathFunction((a, b) => a + b),
  '-': MathFunction((a, b) => a - b),
  '*': MathFunction((a, b) => a * b),
  '/': MathFunction((a, b) => a / b),
  '^': MathFunction((a, b) => a ** b),
  '+...': VariadicMathFunction((a, b) => a + b),
  '-...': VariadicMathFunction((a, b) => a - b),
  '*...': VariadicMathFunction((a, b) => a * b),
  '/...': VariadicMathFunction((a, b) => a / b),
  '^...': VariadicMathFunction((a, b) => a ** b),
  'min': Wrapped(Math.min),
  'max': Wrapped(Math.max)
};
