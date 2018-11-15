import get from 'lodash/get';

export default {
  '@': (context, [path], onValue) => {
    const value = get(context.variables, path);

    onValue({
      context,
      value
    });
  },

  '=': (context, [varName, value], onValue) => {
    onValue({
      context: context.setVariable(varName, value),
      value
    });
  },

  ':=': (context, [path, value], onValue) => {
    onValue({
      context: context.setVariable(varName, value),
      value
    });
  }
};
