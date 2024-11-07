import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4001;
const data = {
  name: "john",
  age: 20,
};
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello TechUp!");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

app.get("/profiles", (req, res) => {
  res.send(data);
});
