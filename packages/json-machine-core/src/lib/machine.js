import { compute } from './compute';

export const createMachine = environment => {
  const run = (root, inputs = [], onValue) => {
    compute(environment, root, result => {
      if (typeof result.value === 'function') {
        result.value(environment, inputs, onValue);
      } else {
        onValue(result);
      }
    });
  };

  const extend = extensions => {
    return createMachine(environment.assignVariables(extensions));
  };

  return {
    run,
    extend
  };
};
