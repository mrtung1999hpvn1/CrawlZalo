/** @format */
//	pgadmin
const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",  
  host: "localhost",
  database: "bypartshopdata",
  password: "temis.vn",
  port: 5431,
});
