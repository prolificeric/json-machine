import get from 'lodash/get';
import { curryLambdaN } from '../util';

export default {
  'object': (context, pairs, onValue) => {
    const value = pairs.reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

    onValue({
      context,
      value
    });
  },

  'get': curryLambdaN(2, (context, [path, object], onValue) => {
    const value = get(object, path);

    onValue({
      context,
      value
    });
  })
};
