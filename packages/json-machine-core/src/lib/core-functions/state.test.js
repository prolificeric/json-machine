import { compute } from '../compute';
import { createContext } from '../context';

test('if state subscriptions work', () => {
  const context = createContext();
  const values = [];

  const code = ['$', ['get', 'x'], ['lambda',
    ['.', 'x'],
    ['.', ['@', 'x']]
  ]];

  context.state.set('x', 1);

  compute(context, code, result => {
    values.push(result.value);
  });

  context.state.set('x', 2);

  expect(values.join(', ')).toEqual('1, 2');
});
