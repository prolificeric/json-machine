const http = require('http');
const api = require('./api');
const server = http.createServer(api);

server.listen(process.env.PORT);
console.log(`Server listening on port ${server.address().port}`);