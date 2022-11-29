const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  console.log('log of signup: ', { email, password });

  if (!email || !password) {
    return res.status(400).json({ error: 'email AND password are required' });
  }

  if (email.length < 3 || email === ' ') {
    return res
      .status(400)
      .json({ error: 'email must have at least 3 characters' });
  }

  if (password.length < 3 || password === ' ') {
    return res
      .status(400)
      .json({ error: 'password must have at least 3 characters' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    email,
    passwordHash
  });

  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

module.exports = usersRouter;
