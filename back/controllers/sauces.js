const saucesRouter = require('express').Router();
//Permet de vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');
const Sauce = require('../models/sauce');
//Permet de gérer les fichiers entrants dans les requêtes HTTP
const multer = require('../utils/multer-config');
//Permet de modifier le système de fichiers
const fs = require('fs');

//Utilisation de la méthode find() du modèle Mongoose qui renvoit un tableau de toutes les Sauces de notre base de données
saucesRouter.get('/', async (req, res) => {
  try {
    const sauces = await Sauce.find();
    return res.json(sauces);
  } catch (error) {
    return res.status(404).end(error);
  }
});

//Utilisation de la méthode findOne() du modèle Mongoose qui renvoit la Sauce ayant le même _id que le paramètre de la requête
saucesRouter.get('/:id', async (req, res) => {
  try {
    const idSauce = await Sauce.findById(req.params.id);
    return res.json(idSauce.toJSON());
  } catch (error) {
    return res.status(404).end(error);
  }
});

saucesRouter.post('/', multer, async (req, res) => {
  try {
    //Création d'une variable constante pour obtenir un objet utilisable
    const content = JSON.parse(req.body.sauce);
    const user = req.user;

    //Conversion de l'objet "Sauce" en une chaîne "sauce"
    const sauce = new Sauce({
      userId: user._id,
      name: content.name,
      manufacturer: content.manufacturer,
      description: content.description,
      mainPepper: content.mainPepper,
      //Utilisation de l'URL complète de l'image
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
      heat: content.heat,
      likes: content.likes,
      dislikes: content.dislikes,
      usersLiked: content.usersLiked,
      usersDisliked: content.usersDisliked
    });
    //Enregistre dans la base de données
    await sauce.save();

    return res.status(201).json({ message: 'Sauce added !' });
  } catch (error) {
    return res.status(400).send('malformatted sauce or empty sauce info');
  }
});

saucesRouter.put('/:id', multer, async (req, res) => {
  try {
    //récupération du token
    const token = req.token;
    //Décode le token
    const decodedToken = jwt.verify(token, process.env.SECRET);
    //Extrait l'id utilisateur et compare à celui extrait du token
    const userId = decodedToken.id;
    //trouve la sauce correspondant à l'id
    const sauce = await Sauce.findOne({ _id: req.params.id });

    if (sauce.userId !== userId) {
      return res.status(401).send('Unauthorized user');
    }

    let sauceObject = {};
    //Si "req.file" existe. Si oui, traite la nouvelle image. Si non, traite l'objet entrant.
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
    //Update "Sauce" à partir de "sauceObject"
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
    return res.status(400).send(error);
  }
});

saucesRouter.delete('/:id', multer, async (req, res) => {
  try {
    //Récupère le token
    const token = req.token;
    //Décode le token
    const decodedToken = jwt.verify(token, process.env.SECRET);
    //Extrait l'id utilisateur et compare à celui extrait du token
    const userId = decodedToken.id;
    const id = req.params.id;
    //Utilisation de la méthode findOne() du modèle Mongoose qui renvoit la Sauce ayant le même _id que le paramètre de la requête
    const sauce = await Sauce.findById(id);
    const user = req.user;

    if (sauce.userId !== userId) {
      return res.status(401).send('Unauthorized user');
    }

    if (sauce.userId.toString() !== user.id.toString()) {
      return res
        .status(401)
        .send('Unauthorized to access blog, fail to remove');
    } else {
      //Séparation du nom du fichier grâce au "/images/"" contenu dans l'url
      const filename = sauce.imageUrl.split('/images/')[1];
      //Utilisation de la fonction unlink pour supprimer l'image et suppression de toute la Sauce
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
    return res.status(400).send(error);
  }
});

saucesRouter.post('/:id/like', async (req, res) => {
  try {
    //récupération du token
    const token = req.token;
    //Décode le token
    const decodedToken = jwt.verify(token, process.env.SECRET);
    //Extrait l'id utilisateur et compare à celui extrait du token
    const userId = decodedToken.id;
    //Utilisation de la méthode findOne() du modèle Mongoose qui renvoit la Sauce ayant le même _id que le paramètre de la requête
    const sauce = await Sauce.findOne({ _id: req.params.id });

    //AJOUTER UN LIKE
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
      //AJOUTER UN LIKE OU UN DISLIKE
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
      //RETIRER SON LIKE OU SON DISLIKE
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
