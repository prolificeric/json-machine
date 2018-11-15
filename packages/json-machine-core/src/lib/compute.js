import mapValues from 'lodash/mapValues';
import get from 'lodash/get';

export const compute = async (context, code, onValue) => {
  // Scalars
  if (code === null || typeof code !== 'object') {
    onValue({
      context,
      value: code
    });

    return;
  }

  // Objects
  if (!Array.isArray(code)) {
    computeObjectValues(context, code, onValue);
    return;
  }

  // Turn raw args into a list without computing them
  if (code[0] === '.') {
    onValue({
      context,
      value: code.slice(1)
    });

    return;
  }

  // Function calls
  computeFunctionCall(context, code, onValue);
};

export const computeObjectValues = (context, object, onValue) => {
  const keys = Object.keys(object);
  const value = {};

  const update = (key, subvalue) => {
    value[key] = subvalue;

    if (Object.keys(value).length === keys.length) {
      onValue({
        context,
        value
      });
    }
  };

  keys.forEach(key => {
    compute(context, object[key], result => {
      update(key, result.value);
    });
  });
};

export const computeFunctionCall = (context, parts, onValue) => {
  const computedParts = [];

  const update = (i, subvalue) => {
    computedParts[i] = subvalue;

    if (computedParts.length === parts.length) {
      execute();
    }
  };

  const execute = () => {
    const [fnName, ...args] = computedParts;
    const fn = context.variables[fnName];
    validateFunction(fn, fnName);
    fn(context, args, onValue);
  };

  parts.forEach((part, i) => {
    compute(context, part, result => {
      update(i, result.value);
    });
  });
};

export const validateFunction = (fn, fnName) => {
  if (!fn) {
    throw new Error(`"${fnName}" is undefined`);
  }

  if (typeof fn !== 'function') {
    throw new Error(`"${fnName}" is not a function`);
  }
};
