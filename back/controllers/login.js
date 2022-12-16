//Permet de vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');
//Permet de chiffrer des données
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  //Recherche si le user et son password existent
  const user = await User.findOne({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    return res.status(401).send('invalid email or password');
  }

  const userForToken = {
    email: user.email,
    id: user._id
  };

  // token expire dans 60*60 secondes, donc dans 1 heure
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60
  });

  res.status(200).send({ token, email: user.email, userId: user._id });
});

module.exports = loginRouter;
