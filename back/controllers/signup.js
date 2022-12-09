const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

usersRouter.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).send('email AND password are required');
    }

    if (email.length < 3 || email === ' ') {
      return res.status(400).send('email must have at least 3 characters');
    }

    if (password.length < 3 || password === ' ') {
      return res.status(400).send('password must have at least 3 characters');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      email,
      password: passwordHash
    });
    try {
      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res
        .status(400)
        .send('Registration failed, user with this mail already exist');
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = usersRouter;
