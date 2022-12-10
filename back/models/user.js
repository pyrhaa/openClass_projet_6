const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject._id = returnedObject._id.toString();
    delete returnedObject.__v;
    delete returnedObject.password;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
