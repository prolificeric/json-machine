import { compute } from '../compute';

const lambdas = {
  'bind': (context, [fnName, ...boundArgs], onValue) => {
    const bound = (__, args, _onValue) => {
      compute(
        context,
        [fnName].concat(boundArgs, args),
        _onValue
      );
    };

    onValue({
      value: bound,
      context
    });
  },
  'lambda': (context, [argNames, statements], onValue) => {
    const lambda = (__, args, _onValue) => {
      const next = (_context, _statements) => {
        if (_statements.length === 0) {
          _onValue({
            context,
            value: undefined
          });

          return;
        }

        compute(_context, _statements[0], result => {
          if (_statements.length > 1) {
            next(result.context, _statements.slice(1));
            return;
          }

          _onValue({
            context,
            value: result.value
          });
        });
      };

      const contextWithArgs = argNames.reduce((_context, name, i) => {
        return _context.setVariable(name, args[i]);
      }, context);

      next(contextWithArgs, statements);
    };

    lambda.code = ['lambda', ['.', ...argNames], ['.', ...statements]];
    lambda.context = context;

    onValue({
      value: lambda,
      context
    });
  }
};

export default lambdas;
