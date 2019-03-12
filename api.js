const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.get('/compute', async (req, resp) => {
  const program = JSON.parse(req.query);
  const result = await core.compute(program);
  const value = await result.returnValue;
  resp.json(value);
});

app.post('/compute', bodyParser.json(), async (req, resp) => {
  const program = req.body;
  const result = await core.compute(program);
  const value = await result.returnValue;
  resp.json(value);
});

module.exports = app;