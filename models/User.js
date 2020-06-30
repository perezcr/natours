const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
    maxlength: [30, 'A user name must have less or equal then 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must have more or equal then 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // If password was not modified then next()
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12: the password will be better encrypted and will take more time
  // Not use the sync version because it will be block the event loop and then prevent other users from using this app
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password confirm field after validation
  this.passwordConfirm = undefined;
  next();
});

// This function is going to run when the user change the password
userSchema.pre('save', function (next) {
  // If password was not modified OR if the document is new then next()
  if (!this.isModified('password') || this.isNeW) {
    return next();
  }
  // It's necessary wait one second because is posibble that the token signs first that executing this operation
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware for hide the inactive users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance method: is a method that is gonna be available on all documents of a certain collection
userSchema.methods.correctPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// JWTTimestamp : millisecond timestamp
// passwordChangedAt: Date
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // parseInt(value, base)
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Encrypt the token
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
