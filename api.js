const express = require('express');
const bodyParser = require('body-parser');
const { core } = require('./index.js');
const withRemote = require('./remote');
const app = express();
const remoteContext = withRemote(core);

const handler = context => async (req, resp, next) => {
  try {
    const result = await context.compute(req.program);
    let value = await result.returnValue;

    if (typeof value === 'function' && value.__isLambda) {
      if (value.argKeys.length === 0) {
        value = (await value()).returnValue;
      } else {
        value = ["lambda", [".", ...value.argKeys], [".", ...value.statements]];
      }
    }

    resp.json(value);
  } catch (err) {
    resp.status(500).json({
      error: err.stack.split('\n')
    });
  }
};

const coreHandler = handler(core);
const remoteHandler = handler(remoteContext);

app.get('/square.json', (req, resp) => {
  resp.json(["lambda", [".", "x"], [".",
    ["^", 2, ["@", "x"]]
  ]]);
});

app.use('/compute', [
  bodyParser.json(),
  (req, resp, next) => {
    try {
      req.program = resp.body || JSON.parse(req.query.program);
      next();
    } catch (err) {
      resp.status(500).json({
        error: err.stack.split('\n')
      });
    }
  }
]);

app.all('/compute', coreHandler);

app.all('/compute/remote', remoteHandler);

module.exports = app;