import { compute } from './compute';

export default {
  'meta': (context, [meta, value], onValue) => {
    onValue({
      context,
      value
    });
  },

  'compute': (context, [program], onValue) => {
    compute(context, program, onValue);
  }
};
