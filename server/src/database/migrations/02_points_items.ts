import Knex from 'knex'

export async function up(knex: Knex){
    return knex.schema.createTable('points_items', table => {
        table.increments('id').primary()
        table.integer('point_id')
        .unsigned()
        .notNullable()        
        .references('id')
        .inTable('points')
        table.foreign('point_id').references('points.id')

        table.integer('item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('items')
        table.foreign('item_id').references('items.id')
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('points_items')
}