import express from "express";
import pool from "../utills/db.mjs";
import { protect } from "../middlewares/protect.mjs";
import { createClient } from "@supabase/supabase-js";
const usersRouter = express.Router();
usersRouter.use(protect);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
usersRouter.get("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token missing or invalid format",
    });
  }

  const tokenWithoutBearer = token.split(" ")[1];

  try {
    // Get user from Supabase
    const { data, error } = await supabase.auth.getUser(tokenWithoutBearer);
    if (error || !data || !data.user) {
      return res
        .status(401)
        .json({ message: "User not found or token expired" });
    }

    const supabaseUserId = data.user.id;

    // Query to get the role from your PostgreSQL database
    const query = "SELECT role FROM users WHERE id = $1";
    const values = [supabaseUserId];
    const { rows, dbError } = await pool.query(query, values);

    if (dbError) {
      return res.status(500).json({ error: "Database query error" });
    }

    // Attach role to user object
    req.user = { ...data.user, role: rows[0]?.role };

    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden: You do not have admin access",
      });
    }

    return res.status(200).json(data); // หรือส่งข้อมูลที่ต้องการ
  } catch (err) {
    console.error("Database error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default usersRouter;
