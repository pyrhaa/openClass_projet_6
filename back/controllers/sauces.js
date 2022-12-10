const saucesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Sauce = require('../models/sauce');
const multer = require('../utils/multer-config');
const fs = require('fs');

saucesRouter.get('/', async (req, res) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(401).send('token missing or invalid');
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken) {
      return res.status(401).send('token missing or invalid');
    }

    const sauces = await Sauce.find();
    return res.json(sauces);
  } catch (error) {
    return res.status(404).end(error);
  }
});

saucesRouter.get('/:id', async (req, res) => {
  try {
    const token = req.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).send('token missing or invalid');
    }

    const idSauce = await Sauce.findById(req.params.id);
    return res.json(idSauce.toJSON());
  } catch (error) {
    return res.status(404).end(error);
  }
});

saucesRouter.post('/', multer, async (req, res) => {
  try {
    const token = req.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).send('token missing or invalid');
    }

    const content = JSON.parse(req.body.sauce);
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

    await sauce.save();

    return res.status(201).json({ message: 'Sauce added !' });
  } catch (error) {
    return res.status(400).end(error);
  }
});

saucesRouter.put('/:id', multer, async (req, res) => {
  try {
    const token = req.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userId = decodedToken.id;

    if (!token || !decodedToken) {
      return res.status(401).send('token missing or invalid');
    }
    const sauce = await Sauce.findOne({ _id: req.params.id });

    if (sauce.userId !== userId) {
      return res.status(401).send('Unauthorized user');
    }

    let sauceObject = {};

    if (req.file) {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlinkSync(`images/${filename}`);
      sauceObject = {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`
      };
    } else {
      sauceObject = {
        ...req.body
      };
    }
    await Sauce.updateOne(
      {
        _id: req.params.id
      },
      {
        ...sauceObject,
        _id: req.params.id
      }
    );
    return res.status(200).json({ message: 'Sauce modified' });
  } catch (error) {
    return res.status(400).end(error);
  }
});

saucesRouter.delete('/:id', multer, async (req, res) => {
  try {
    const token = req.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userId = decodedToken.id;
    const id = req.params.id;
    const sauce = await Sauce.findById(id);
    const user = req.user;

    if (!token || !decodedToken) {
      return res.status(401).send('token missing or invalid');
    }

    if (sauce.userId !== userId) {
      return res.status(401).send('Unauthorized user');
    }

    if (sauce.userId.toString() !== user.id.toString()) {
      return res
        .status(401)
        .send('Unauthorized to access blog, fail to remove');
    } else {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, async () => {
        try {
          await Sauce.findByIdAndRemove(id);
          return res.status(204).end();
        } catch (error) {
          return res.status(401).json({ error });
        }
      });
    }
  } catch (error) {
    return res.status(400).end(error);
  }
});

saucesRouter.post('/:id/like', async (req, res) => {
  try {
    const token = req.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userId = decodedToken.id;

    if (!token || !decodedToken) {
      return res.status(401).send('token missing or invalid');
    }
    const sauce = await Sauce.findOne({ _id: req.params.id });

    if (req.body.like === 1) {
      if (
        sauce.usersLiked.includes(userId) ||
        sauce.usersDisliked.includes(userId)
      ) {
        return res.status(401).send('Already vote');
      }

      await Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: req.body.like++ },
          $push: { usersLiked: userId }
        }
      );
      res.status(200).json({ message: 'Like!' });
    } else if (req.body.like === -1) {
      if (
        sauce.usersDisliked.includes(userId) ||
        sauce.usersLiked.includes(userId)
      ) {
        return res.status(401).send('Already vote');
      }
      await Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: req.body.like++ * -1 },
          $push: { usersDisliked: userId }
        }
      );
      return res.status(200).json({ message: 'Dislike !' });
    } else {
      if (
        sauce.usersLiked.includes(userId) &&
        !sauce.usersDisliked.includes(userId)
      ) {
        await Sauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
        );

        return res.status(200).json({ message: 'Vote cancelled !' });
      } else if (
        sauce.usersDisliked.includes(userId) &&
        !sauce.usersLiked.includes(userId)
      ) {
        await Sauce.updateOne(
          { _id: req.params.id },
          {
            $pull: { usersDisliked: userId },
            $inc: { dislikes: -1 }
          }
        );

        return res.status(200).json({ message: 'Vote cancelled !' });
      } else {
        return res.status(401).send('Already cancelled!');
      }
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
});

module.exports = saucesRouter;
