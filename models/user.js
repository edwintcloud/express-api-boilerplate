const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true,
    minlength: 6
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    minlength: 6
  },
  role: {
    type: Number,
    enum: [0, 1, 2, 3],
    required: true,
    default: 0   // 0 - User, 1 - Moderator, 2 - Developer, 3 - Administrator
}
}, { timestamps: true });

// custom validators
UserSchema.path('email').validate(function(v) {
  return validator.isEmail(v);
});

// authenticate a user
UserSchema.statics.authenticate = async function(email, password) {
  const user = await this.find({ email: email }).limit(1).lean();
  if(user.length > 0) {
    const match = await bcrypt.compare(password, user[0].password);
    if(match) {
      delete user[0].password;
      delete user[0].__v;
      return user[0];
    }
    return Promise.reject(new Error(`Invalid Password.`));
  }
  return Promise.reject(new Error(`Email not found.`));
}

// hash the password before saving a new user
UserSchema.pre('save', async function() {
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);
