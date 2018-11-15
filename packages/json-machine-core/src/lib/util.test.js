import { curryN, curry, syncFunction, asyncFunction } from './util';

test('if currying works for functions with finite arities', () => {
  const fn = (a, b) => a + b;
  const curried = curry(fn);
  const add10 = curried(10);
  expect(add10(5)).toEqual(15);
});

test('if currying works for functions with rest arguments', () => {
  const fn = (...numbers) => numbers.reduce((t, n) => t + n, 0);
  const curried = curryN(2, fn);
  const add10 = curried(10);
  expect(add10(5, 20)).toEqual(35);
});

describe('syncFunction', () => {
  test('if it returns a function that can be used by compute', done => {
    const f = syncFunction((a, b) => a + b);

    f({}, [1, 2], result => {
      expect(result.value).toEqual(3);
      done();
    });
  });

  test('if currying works', done => {
    const f = syncFunction((a, b) => a + b, 2);

    f({}, [1], result => {
      result.value({}, [2], _result => {
        expect(_result.value).toEqual(3);
        done();
      });
    });
  });

  test('if errors are returned', done => {
    const message = 'ERROR MESSAGE';

    const f = syncFunction((a, b) => {
      throw new Error(message);
    });

    f({}, [], result => {
      expect(result.error.message).toEqual(message);
      done();
    });
  });
});

describe('asyncFunction', () => {
  test('if it returns a function that can be used by compute', done => {
    const f = asyncFunction((a, b) => Promise.resolve(a + b));

    f({}, [5, 2], result => {
      expect(result.value).toEqual(7);
      done();
    });
  });

  test('if currying works', done => {
    const f = syncFunction((a, b) => a + b, 2);

    f({}, [1], result => {
      result.value({}, [2], _result => {
        expect(_result.value).toEqual(3);
        done();
      });
    });
  });

  test('if errors are returned', done => {
    const message = 'ERROR MESSAGE';

    const f = asyncFunction((a, b) => {
      throw new Error(message);
    });

    f({}, [], result => {
      expect(result.error.message).toEqual(message);
      done();
    });
  });
});
