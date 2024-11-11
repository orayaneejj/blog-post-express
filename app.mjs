import express from "express";
import cors from "cors";
import pool from "./utills/db.mjs";

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

app.post("/posts", async (req, res) => {
  const { title, image, category_id, description, content, status_id } =
    req.body;
  if (
    !title ||
    !image ||
    !category_id ||
    !description ||
    !content ||
    !status_id
  ) {
    return res.status(400).json({
      message:
        "Server could not create post because there are missing data from client",
    });
  }

  const newPost = {
    ...req.body,
  };

  try {
    await pool.query(
      `insert into posts (title, image, category_id, description, content, status_id)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        newPost.title,
        newPost.image,
        newPost.category_id,
        newPost.description,
        newPost.content,
        newPost.status_id,
      ]
    );

    return res.status(201).json({
      message: "Created post successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not create post because of database connection",
      error: error.message,
    });
  }
});

app.get("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId;
    const results = await pool.query(`select * from posts where id = $1`, [
      postIdFromClient,
    ]);
    if (!results.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested post",
      });
    }
    return res.status(201).json({
      data: results.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read post because database connection",
      error: error.message,
    });
  }
});

app.put("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId;
    const updatedPost = { ...req.body };
    const result = await pool.query(
      `
      update posts set
        title = $2,
        image= $3,
        category_id= $4,
        description= $5,
        content= $6,
        status_id= $7
        where id = $1
      `,
      [
        postIdFromClient,
        updatedPost.title,
        updatedPost.image,
        updatedPost.category_id,
        updatedPost.description,
        updatedPost.content,
        updatedPost.status_id,
      ]
    );
    if (!result.rowCount) {
      return res.status(404).json({
        message: "Server could not find a requested post to update",
      });
    }
    return res.status(200).json({ message: "Updated post sucessfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read post because database connection",
      error: error.message,
    });
  }
});

app.delete("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId;
    const result = await pool.query(`delete from posts where id = $1`, [
      postIdFromClient,
    ]);
    if (!result.rowCount) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested post to delete" });
    }
    return res.status(200).json({ message: "Deleted post sucessfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read post because database connection",
      error: error.message,
    });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 6;
    const category = req.query.category;
    const keyword = req.query.keyword;

    const offset = (page - 1) * limit;

    let query = "select * from posts";
    let conditions = [];
    let values = [];

    if (category) {
      conditions.push(`category_id = $${values.length + 1}`);
      values.push(category);
    }

    if (keyword) {
      conditions.push(
        `(title ilike $${values.length + 1} or description ilike $${
          values.length + 1
        } or content ilike $${values.length + 1})`
      );
      values.push(`%${keyword}%`);
    }

    if (conditions.length > 0) {
      query += ` where ` + conditions.join(" and ");
    }

    query += ` limit $${values.length + 1} offset $${values.length + 2}`;
    values.push(limit, offset);

    const results = await pool.query(query, values);

    const totalPostsResult = await pool.query("select count(*) from posts");
    const totalPosts = totalPostsResult.rows[0].count;
    const totalPages = Math.ceil(totalPosts / limit);

    const nextPage = page < totalPages ? page + 1 : null;

    return res.status(200).json({
      totalPosts: totalPosts,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
      posts: results.rows,
      nextPage: nextPage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read posts due to database connection",
      error: error.message,
    });
  }
});
