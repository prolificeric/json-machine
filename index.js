const _ = require('lodash/fp');

const SPREAD_OPERATOR = '...';
const LITERAL_MARKER = '.';

const compute = exports.compute = async (program, context = core) => {
  // Primitives and functions get returned as-is
  if (program === null || /^(string|number|boolean|function)$/.test(typeof program)) {
    return context.setReturnValue(program);
  }

  // Arrays act as function calls unless there's a literal marker
  if (Array.isArray(program)) {
    const [path, ...args] = program;

    if (path === LITERAL_MARKER) {
      return context.setReturnValue(args);
    }

    const fn = context.get(path);

    if (!fn) {
      // Todo: stack traces
      throw new Error(`${path} not in scope.`);
    }

    const computedArgs = await computeArgs(args, context);
    const result = await fn.call(context, ...computedArgs);

    return Context.isContext(result)
      ? result
      : context.setReturnValue(result);
  }

  // Objects
  if (program[LITERAL_MARKER]) {
    const copy = { ...program };
    delete copy[LITERAL_MARKER];
    return context.setReturnValue(copy);
  }

  const result = {};
  const promises = [];

  Object.keys(program).forEach(key => {
    const sub = program[key];

    const promise = compute(sub, context).then(_result => {
      result[key] = _result.returnValue;
    });

    promises.push(promise);
  });

  await Promise.all(promises);

  return context.setReturnValue(result);
};

const computeArgs = async (args, context) => {
  if (args.length === 0) {
    return [];
  };

  const [first, ...rest] = args;

  if (first === SPREAD_OPERATOR) {
    const [{ returnValue }, recursedArgs] = await Promise.all([
      compute(rest[0], context),
      computeArgs(rest.slice(1), context)
    ]);

    return returnValue.concat(recursedArgs);
  }

  const [{ returnValue }, recursedArgs] = await Promise.all([
    compute(first, context),
    computeArgs(rest, context)
  ]);

  return [returnValue].concat(recursedArgs);
};

const Context = exports.Context = (variables = {}, returnValue = null) => {
  const context = {
    __isContext: true,
    returnValue,
    variables,

    get: path => {
      return _.get(path, variables);
    },

    set: (path, value) => {
      return Context(_.set(path, value, variables));
    },

    extend: additions => {
      return Context({
        ...variables,
        ...additions
      }, returnValue);
    },

    merge: additions => {
      return Context(_.merge(additions, variables));
    },

    compute: async program => {
      return compute(program, context);
    },

    setReturnValue: value => {
      return Context(variables, value);
    }
  };

  return context;
};

Context.isContext = value => {
  return typeof value === 'object' && value.__isContext;
};

const Curried = exports.Curried = (n, fn) => {
  const cur = function (...args) {
    if (args.length >= n) {
      return fn.call(this, ...args);
    }

    return cur.bind(this, ...args);
  };

  return cur;
};

const Curry2 = exports.Curry2 = fn => {
  return Curried(2, fn);
};

const core = exports.core = Context({
  _,

  // Essential operators
  ':': (...args) => args,

  '@': function (path) {
    return this.get(path);
  },

  '=': function (path, value) {
    return this.set(path, value).setReturnValue(value);
  },

  // Functions and lambdas
  'lambda': function (argKeys, statements) {
    if (!statements) {
      return this.lambda([], argKeys);
    }

    const lambda = (...argValues) => {
      const args = _.zipObject(argKeys, argValues);

      return statements.reduce((prevPromise, statement) => {
        return prevPromise.then(prevContext => {
          return prevContext.compute(statement);
        });
      }, Promise.resolve(this.merge(args)));
    };

    return Object.assign(lambda, {
      argKeys,
      statements
    });
  },

  'call': (method, object, ...args) => {
    return object[method](...args);
  },

  'method': (method, ...args) => obj => {
    return obj[method](...args);
  },

  // Math
  '+': Curry2((a, b) => a + b),

  '-': Curry2((a, b) => a - b),

  '*': Curry2((a, b) => a * b),

  '/': Curry2((a, b) => a / b),

  '^': Curry2((a, b) => a ** b),

  // Equality
  '==': Curry2((a, b) => a === b),

  '!=': Curry2((a, b) => a !== b),

  '>': Curry2((a, b) => a > b),

  '>=': Curry2((a, b) => a >= b),

  '<': Curry2((a, b) => a < b),

  '<=': Curry2((a, b) => a <= b),

  // Logic
  '?': (test, ifTrue, ifFalse) => test ? ifTrue() : ifFalse(),

  'or': (a, b) => !!(a || b),

  'and': (a, b) => !!(a && b),

  'xor': (a, b) => !!(a && !b) || !!(!a && b),

  'not': a => !a
});