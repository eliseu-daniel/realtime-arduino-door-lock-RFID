require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const auditMiddleware = require('./middlewares/auditMiddleware');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Aplicar auditoria a todas as rotas /api
app.use('/api', auditMiddleware);
app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
