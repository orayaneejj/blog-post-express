import pool from "../utills/db.mjs";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const { email, password, username, name } = req.body;

  try {
    // Check if the username already exists in the database
    const usernameCheckQuery = "SELECT * FROM users WHERE username = $1";
    const usernameCheckValues = [username];
    const { rows: existingUser } = await pool.query(
      usernameCheckQuery,
      usernameCheckValues
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "This username is already taken" });
    }

    // Sign up the new user using Supabase
    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
    });

    // Check for Supabase errors
    if (supabaseError) {
      if (supabaseError.code === "user_already_exists") {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      // Handle other Supabase errors
      return res
        .status(400)
        .json({ error: "Failed to create user. Please try again." });
    }
    const supabaseUserId = data.user.id;
    console.log("Supabase user created with ID:", supabaseUserId);
    // Insert user details into your PostgreSQL database
    const query = `
        INSERT INTO users (id, username, name, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
    const values = [supabaseUserId, username, name, "user"];
    const { rows } = await pool.query(query, values);
    res.status(201).json({
      message: "User created successfully",
      user: rows[0],
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (
        error.code === "invalid_credentials" ||
        error.message.includes("Invalid login credentials")
      ) {
        return res.status(400).json({
          error: "Your password is incorrect or this email doesn't exist",
        });
      }
    }
    return res.status(200).json({
      message: "Signed in successfully",
      access_token: data.session.access_token,
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred during login" });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
      return res.status(400).json({ error: "Failed to log out" });
    }

    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default authRouter;
