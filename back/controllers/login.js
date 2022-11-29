const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid email or password'
    });
  }

  const userForToken = {
    email: user.email,
    id: user._id
  };

  // token expires in 60*60 seconds, that is, in one hour
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60
  });

  res.status(200).send({ token, email: user.email });
});

module.exports = loginRouter;
