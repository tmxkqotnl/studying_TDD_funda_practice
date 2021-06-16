import userModel from "../models/user";
import { isValidObjectId } from "mongoose";

const validateEmail = (email) => {
  const mailFormat =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email.match(mailFormat)) return true;
  else return false;
};

const userCreate = async (req, res, next) => {
  const { email, password, name } = req.body;
  const messageInvalid = { message: "incorrect form" };
  try {
    if (typeof email !== "string" || !email || !validateEmail(email)) {
      return res.status(400).json(messageInvalid);
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json(messageInvalid);
    }
    if (!name || !name.firstName || !name.lastName) {
      return res.status(400).json(messageInvalid);
    } else if (name) {
      if (
        typeof name.firstName !== "string" ||
        typeof name.lastName !== "string"
      ) {
        return res.status(400).json(messageInvalid);
      }
    }

    const newUser = await userModel.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};
const getUsers = async (req, res, next) => {
  const Users = await userModel.find({});
  res.status(200).json(Users);
};
const getUserById = async (req, res, next) => {
  if (!isValidObjectId(req.params.userId))
    return res.status(500).json({
      message: "invalid user id",
    });

  const user = await userModel.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "no user found" });
  res.status(200).json(user);
};

const userUpdate = async (req, res, next) => {
  if (!isValidObjectId(req.params.userId))
    return res.status(500).json({
      message: "invalid user id",
    });
  const { name, email, password } = req.body;
  const user = await userModel.findByIdAndUpdate(
    req.params.userId,
    {
      $set: {
        name: name,
        email: email,
        password: password,
      },
    },
    { new: true } // warning : there is no save function executing
  );
  if (!user) return res.status(404).json({ message: "no user found" });
  res.status(200).json(user);
};
const userDelete = async (req, res, next) => {
  if (!isValidObjectId(req.params.userId))
    return res.status(500).json({
      message: "invalid user id",
    });
  const dUser = await userModel.findByIdAndDelete(req.params.userId);
  if (!dUser) return res.status(404).json({ message: "no user found" });

  res.status(200).json(dUser);
};

export default { userCreate, getUsers, getUserById, userUpdate, userDelete };
