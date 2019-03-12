const express = require('express');
const bodyParser = require('body-parser');
const { core } = require('./index.js');
const app = express();

app.get('/compute', async (req, resp) => {
  try {
    const program = JSON.parse(req.query.program);
    const result = await core.compute(program);
    const value = await result.returnValue;
    resp.json(value);
  } catch (err) {
    resp.send(err.stack);
  }
});

app.post('/compute', bodyParser.json(), async (req, resp) => {
  try {
    const program = req.body;
    const result = await core.compute(program);
    const value = await result.returnValue;
    resp.json(value);
  } catch (err) {
    resp.send(err.stack);
  }
});

module.exports = app;