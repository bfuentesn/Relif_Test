const path = require('path');

// Intentar cargar desde dist primero, luego desde src
let app;
try {
  // En producción (después del build)
  app = require('./dist/server.js').default;
} catch (e) {
  try {
    // En desarrollo o si no hay dist
    app = require('./src/server.ts').default;
  } catch (e2) {
    // Fallback con ts-node
    require('ts-node/register');
    app = require('./src/server.ts').default;
  }
}

module.exports = app.callback();