// Wrapper para Vercel que compila TypeScript on-the-fly
require('ts-node/register');
const app = require('./src/server.ts').default;

module.exports = app.callback();