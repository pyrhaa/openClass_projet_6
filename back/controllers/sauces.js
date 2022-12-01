const saucesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Sauce = require('../models/sauce');

saucesRouter.get('/', async (req, res) => {
  try {
    const sauces = await Sauce.find();
    res.json(sauces);
  } catch (error) {
    res.status(404).end();
  }
});

saucesRouter.get('/:id', async (req, res) => {
  try {
    const idSauce = await Sauce.findById(req.params.id);
    res.json(idSauce.toJSON());
  } catch (error) {
    res.status(404).end();
  }
});

saucesRouter.post('/', async (req, res) => {
  const token = req.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }
  try {
    const body = req.body;
    const user = req.user;

    const sauce = new Sauce({
      userId: user._id,
      name: body.name,
      manufacturer: body.manufacturer,
      description: body.description,
      mainPepper: body.mainPepper,
      imageUrl: body.imageUrl,
      heat: body.heat,
      likes: body.likes,
      dislikes: body.dislikes,
      usersLiked: body.usersLiked,
      usersDisliked: body.usersDisliked
    });

    const savedSauce = await sauce.save();
    res.status(201).json(savedSauce);
  } catch (error) {
    res.status(400).end();
  }
});

saucesRouter.put('/:id', async (req, res) => {
  try {
    const body = req.body;

    const sauce = {
      name: body.name,
      manufacturer: body.manufacturer,
      description: body.description,
      mainPepper: body.mainPepper,
      imageUrl: body.imageUrl,
      heat: body.heat,
      likes: body.likes,
      dislikes: body.dislikes,
      usersLiked: body.usersLiked,
      usersDisliked: body.usersDisliked
    };
    const updateIdSauce = await Sauce.findByIdAndUpdate(req.params.id, sauce, {
      new: true
    });
    res.json(updateIdSauce.toJSON());
  } catch (error) {
    response.status(400).end();
  }
});

saucesRouter.delete('/:id', async (req, res) => {
  const token = req.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!decodedToken.id || !token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  try {
    const id = req.params.id;
    const sauce = await Sauce.findById(id);
    const user = req.user;

    if (sauce.userId.toString() === user.id.toString()) {
      await Sauce.findByIdAndRemove(id);
      res.status(204).end();
    } else {
      return res.status(401).json({
        error: 'Unauthorized to access blog, fail to remove'
      });
    }
  } catch (error) {
    res.status(400).end();
  }
});

module.exports = saucesRouter;
