const path = require('path');

// En Vercel, usar los archivos compilados desde dist
const app = require('./dist/server.js').default;

module.exports = app.callback();