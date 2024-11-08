import * as pg from "pg";
const { Pool } = pg.default;
const pool = new Pool({
  connectionString: "postgresql://postgres:3610@localhost:5432/blog-post-app",
});
export default pool;
