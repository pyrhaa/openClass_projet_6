const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const saucesRouter = require('./controllers/sauces');
const usersRouter = require('./controllers/signup');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');
const multer = require('./utils/multer-config');
const path = require('path');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

logger.info('connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.tokenExtractor);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', loginRouter);
app.use('/api/auth', usersRouter);
app.use('/api/sauces', middleware.userExtractor, multer, saucesRouter);

app.use(middleware.errorHandler);

module.exports = app;
