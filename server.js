import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/userRoute.js";
import { Key } from "./config/Key.js";
const app = express();

dotenv.config();
app.set("port", process.env.PORT);

const server = async () => {
  let DBConnection = await mongoose.connect(Key, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  });
  app.use(express.json());
  app.use(morgan("combined"));
  app.use("/user", userRouter);

  app.listen(app.get("port"), () => {
    console.log("listening port 5000");
  });

  app.use((err, req, res, next) => {
    console.error(err);
  });
};
const test = async () => {
  app.use(express.json());
  app.use(morgan("dev"));
  app.use("/user", userRouter);

  app.use((err, req, res, next) => {
    console.error(err);
  });
};

export default app;
export { server, test };
