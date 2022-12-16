const mongoose = require('mongoose');

//Utilisation de la méthode "Schema" de "Mongoose" qui contient tous les champs souhaités et leur type
const sauceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mainPepper: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  heat: {
    type: Number,
    required: true,
    default: 0
  },
  likes: {
    type: Number,
    required: true,
    default: 0
  },
  dislikes: {
    type: Number,
    required: true,
    default: 0
  },
  usersLiked: {
    type: [String],
    default: []
  },
  usersDisliked: {
    type: [String],
    default: []
  }
});

//change objectID en string et de __v
sauceSchema.set('toJSON', {
  transform: (document, returnedObj) => {
    returnedObj._id = returnedObj._id.toString();
    delete returnedObj.__v;
  }
});

//Exportation du Schema pour le rendre disponible pour l'application "Express"
module.exports = mongoose.model('Sauce', sauceSchema);
