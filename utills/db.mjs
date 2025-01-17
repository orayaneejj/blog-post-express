import * as pg from "pg";
const { Pool } = pg.default;
const pool = new Pool({
  connectionString:
    "postgresql://postgres.byiuhzziieukqvjpruvt:PersonalBlogDB3610@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
});
export default pool;
