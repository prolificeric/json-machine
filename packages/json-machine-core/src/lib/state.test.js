import { createReactiveState } from './state';

test('if subscription method works', () => {
  const state = createReactiveState({ x: 1 });
  const values = [];

  state.subscribe(
    store => store.x,
    x => values.push(x)
  );

  state.set('x', 2);

  expect(values.join(', ')).toEqual('1, 2');
});
