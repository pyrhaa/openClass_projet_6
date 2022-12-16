const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const saucesRouter = require('./controllers/sauces');
const usersRouter = require('./controllers/signup');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');
const path = require('path');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

//Log l'URI MONGO auquelle on est connecté
logger.info('connecting to', config.MONGODB_URI);

//Log de confirmation de la connection ou erreur de connection
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
app.use(express.urlencoded({ extended: true }));

//extration du token jwt
app.use(middleware.tokenExtractor);
//Gère la ressource "images" de manière statique à chaque fois qu'elle reçoit une requête vers la route "/images"
app.use('/images', express.static(path.join(__dirname, 'images')));
//Routes
app.use('/api/auth', loginRouter);
app.use('/api/auth', usersRouter);
//userExtractor permet l'authentification user pour accéder au CRUD sauce
app.use('/api/sauces', middleware.userExtractor, saucesRouter);
//gestion des erreurs diverses (voir fichier middleware.js dans utils)
app.use(middleware.errorHandler);

module.exports = app;
