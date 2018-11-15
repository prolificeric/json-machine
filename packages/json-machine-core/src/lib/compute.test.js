import { compute } from './compute';
import { createContext } from './context';

const context = createContext();

const testComputation = (code, expectedValue, done) => {
  compute(context, code, ({ value }) => {
    expect(value).toEqual(expectedValue);
    done();
  });
};

describe('scalars as code', () => {
  test('if numbers are returned as-is', done => {
    testComputation(10, 10, done);
  });

  test('if strings are returned as-is', done => {
    testComputation('TEST_STRING', 'TEST_STRING', done);
  });

  test('if null is returned as-is', done => {
    testComputation(null, null, done);
  });

  test('if booleans are returned as-is', done => {
    testComputation(true, true, done);
  });
});

describe('function calls', () => {
  test('if basic functions work', done => {
    testComputation(['+', 1, 2], 3, done);
  });

  test('if nested function calls work', done => {
    testComputation(['+', 1, ['+', 2, 3]], 6, done);
  });
});

describe('objects as code', () => {
  test('if scalar keys are returned as-is', done => {
    const obj = { x: 1 };

    compute(context, obj, ({ value }) => {
      expect(value.x).toEqual(obj.x);
      done();
    });
  });

  test('if dynamic keys are computed', done => {
    const obj = { x: ['*', 10, 5] };

    compute(context, obj, ({ value }) => {
      expect(value.x).toEqual(50);
      done();
    });
  });
});
