const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
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

const User = mongoose.model('User', userSchema);

module.exports = User;
