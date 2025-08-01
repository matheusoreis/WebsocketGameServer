import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("accounts", (table) => {
        table.increments("id").primary();
        table.string("user").notNullable().unique();
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
        table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("accounts");
}
