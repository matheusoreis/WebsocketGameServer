import knex from "knex";
import { config } from "dotenv";

config();

const sqlite = knex({
    client: "sqlite3",
    connection: {
        filename: `./${process.env.SQLITE_FILENAME ?? "database"}.sqlite3`,
    },
    useNullAsDefault: true,
    pool: { min: 2, max: 10 },
});

export default sqlite;
