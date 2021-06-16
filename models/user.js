import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
});

const saltRounds = 10;

userSchema.pre("save", function (next) {
  const user = this;
  if (user.isModified("password") || user.isNew) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, (errHash, hash) => {
        if (errHash) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plain, cb) {
  bcrypt.compare(plain, this.password, (err, match) => {
    if (err) return cb(err);
    cb(null, match);
  });
};

const User = model("user", userSchema);

export default User;
