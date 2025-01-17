import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const protect = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token is missing or has invalid format",
    });
  }

  const tokenWithoutBearer = token.split(" ")[1];

  // ตรวจสอบ token กับ Supabase
  const { data: user, error } = await supabase.auth.getUser(tokenWithoutBearer);

  if (error || !user) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }

  // แนบข้อมูลผู้ใช้ที่ Authenticated ไว้ใน `req.user`
  req.user = user;
  next();
};
