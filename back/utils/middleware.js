const logger = require('./logger');
//Permet de vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    });
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' });
  }

  logger.error(error.message);
  return next(error);
};

//extraction du token jwt sous format BEARER
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
    return next();
  }
  req.token = null;
  return next();
};

const userExtractor = async (req, res, next) => {
  try {
    //Extraction du token du header authorization
    const token = req.token;
    //Décode le token
    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    //Extrait l'id utilisateur et compare à celui extrait du token
    if (!token || !decodedToken) {
      return res.status(401).send('token missing or invalid');
    } else if (decodedToken.id) {
      req.user = await User.findById(decodedToken.id);
    } else {
      return next();
    }
  } catch (e) {
    return res.status(401).json({ error: e });
  }
  return next();
};

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor
};
