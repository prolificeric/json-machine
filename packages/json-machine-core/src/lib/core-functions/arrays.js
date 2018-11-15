import { curryLambdaN } from '../util';

export default {
  '_': (context, items, onValue) => {
    onValue({
      context,
      value: items
    });
  },

  'map': curryLambdaN(2, (context, [lambda, arr], onValue) => {
    const value = [];

    const update = (i, subvalue) => {
      value[i] = subvalue;

      if (value.filter(item => item !== undefined).length === arr.length) {
        onValue({
          context,
          value
        });
      }
    };

    arr.forEach((item, i) => {
      lambda(context, [item, i, arr], result => {
        update(i, result.value);
      });
    });
  }),

  'reduce': curryLambdaN(2, (context, [lambda, arr, initialValue], onValue) => {
    const next = (value, items, i = 0) => {
      if (items.length === 0) {
        onValue({
          context,
          value
        });

        return;
      }

      const item = items[0];

      lambda(context, [value, item, i, items], result => {
        next(result.value, items.slice(1), i + 1);
      });
    };

    next(initialValue, arr);
  })
};
