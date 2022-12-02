const saucesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Sauce = require('../models/sauce');
const multer = require('../utils/multer-config');
const fs = require('fs');

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

saucesRouter.post('/', multer, async (req, res) => {
  const token = req.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  // try {
  // const content = JSON.parse(req.body.sauce);
  const content = JSON.parse(req.body.body);
  const user = req.user;

  const sauce = new Sauce({
    userId: user._id,
    name: content.name,
    manufacturer: content.manufacturer,
    description: content.description,
    mainPepper: content.mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    heat: content.heat,
    likes: content.likes,
    dislikes: content.dislikes,
    usersLiked: content.usersLiked,
    usersDisliked: content.usersDisliked
  });

  const savedSauce = await sauce.save();
  console.log('savesauce: ', savedSauce._id._str);

  //   res.status(201).json(savedSauce);
  // } catch (error) {
  //   res.status(400).end(error);
  // }
});

saucesRouter.put('/:id', multer, async (req, res) => {
  try {
    const body = req.body;

    const sauce = {
      name: body.name,
      manufacturer: body.manufacturer,
      description: body.description,
      mainPepper: body.mainPepper,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
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

saucesRouter.delete('/:id', multer, async (req, res) => {
  const token = req.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!decodedToken.id || !token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  try {
    const id = req.params.id;
    const sauce = await Sauce.findById(id);
    const user = req.user;

    if (sauce.userId.toString() !== user.id.toString()) {
      return res.status(401).json({
        error: 'Unauthorized to access blog, fail to remove'
      });
    } else {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, async () => {
        try {
          await Sauce.findByIdAndRemove(id);
          res.status(204).end();
        } catch (error) {
          res.status(401).json({ error });
        }
      });
    }
  } catch (error) {
    res.status(400).end();
  }
});

module.exports = saucesRouter;
