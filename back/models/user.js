const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//Utilisation de la méthode "Schema" de "Mongoose" qui contient tous les champs souhaités et leur type
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
    unique: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 3
  }
});

//Plugin qui empêche deux utilisateurs d'avoir la même adresse email
userSchema.plugin(uniqueValidator);

//change objectID en string et suppression du password et de __v
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject._id = returnedObject._id.toString();
    delete returnedObject.__v;
    delete returnedObject.password;
  }
});

//Exportation du Schema pour le rendre disponible pour l'application "Express"
const User = mongoose.model('User', userSchema);

module.exports = User;
