import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts.mjs";
import authRouter from "./routes/auth.mjs";
import usersRouter from "./routes/users.mjs";

const data = {
  name: "john",
  age: 20,
};

async function init() {
  const app = express();
  const port = process.env.PORT || 4001;

  app.use(cors());
  app.use(express.json());
  app.use("/posts", postsRouter);
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.get("/", (req, res) => {
    res.send("Hello TechUp!");
  });

  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}

init();
