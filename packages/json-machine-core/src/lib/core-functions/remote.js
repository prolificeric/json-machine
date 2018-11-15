import request from 'request-promise-native';
import { compute } from '../compute';
import { asyncFunction, hocAsync } from '../util';

export default {
  'request': asyncFunction(request),

  'remote': asyncFunction(
    (uri, args) => request({
      uri,
      method: 'post',
      json: args
    })
  ),

  'import': (context, [uri], onValue) => {
    const lambda = (__, args, _onValue) => {
      request({ uri, json: true })
        .then(response => {
          const { code } = response.body;
          compute(context, code, _onValue);
        })
        .catch(error => {
          _onValue({
            context,
            error
          })
        });
    };

    onValue({
      context,
      value: lambda
    });
  }
};
