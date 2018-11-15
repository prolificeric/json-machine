export const curryN = (n, fn, baseArgs = []) => (...args) => {
  const allArgs = baseArgs.concat(args);

  if (allArgs.length >= n) {
    return fn(...allArgs);
  }

  return curryN(n - allArgs.length, fn, allArgs);
};

export const curry = (fn, baseArgs = []) => (...args) => {
  const allArgs = baseArgs.concat(args);

  if (allArgs.length >= fn.length) {
    return fn(...allArgs);
  }

  return curry(fn, allArgs);
};

export const curryLambdaN = (n, lambda, baseArgs = []) => {
  return (context, args, onValue) => {
    const allArgs = baseArgs.concat(args);
    const nmrArgs = allArgs.length;

    if (nmrArgs < n) {
      const curried = curryLambdaN(n - nmrArgs, lambda, allArgs);

      onValue({
        value: curried,
        context
      });

      return;
    }

    lambda(context, allArgs, onValue);
  };
};

export const syncFunction = (fn, curryByN) => {
  const machineFunction = (context, args, onValue) => {
    try {
      const value = fn(...args);
      onValue({
        context,
        value
      });
    } catch(error) {
      onValue({
        context,
        error
      });
    }
  };

  return curryByN
    ? curryLambdaN(curryByN, machineFunction)
    : machineFunction;
};

export const asyncFunction = (fn, curryByN) => {
  const machineFunction = (context, args, onValue) => {
    Promise.resolve()
      .then(() => {
        return fn(...args)
      })
      .then(value => {
        onValue({
          context,
          value
        });
      })
      .catch(error => {
        onValue({
          context,
          error
        });
      });
  };

  return curryByN
    ? curryLambdaN(curryByN, machineFunction)
    : machineFunction;
};

export const hofSync = (fn, curryByN) => (context, args, onValue) => {
  onValue({
    context,
    value: syncFunction(fn(...args), curryByN)
  });
};

export const hofAsync = (fn, curryByN) => (context, args, onValue) => {
  onValue({
    context,
    value: asyncFunction(fn(...args), curryByN)
  });
};
