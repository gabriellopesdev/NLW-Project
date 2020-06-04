import { Request, Response, request } from 'express'
import knex from '../database/connection'

class PointsController {
    async index(request: Request, response: Response){
        const { city, uf, items } = request.query
        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()))

        const points = await knex('points')
        .join('points_items', 'points_items.point_id', '=', 'points.id')
        .whereIn('points_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .select('points.*')
        .distinct()

        return response.json({points})
    }

    async show(request: Request, response: Response){
        const { id } = request.params;
        const point = await knex('points').where('id', id).first()
        if (!point) {
            return response.status(400).json( { message: 'Point not found. ' } )
        }

        const items = await knex('items')
        .join('points_items', 'items.id', '=', 'points_items.item_id')
        .where('points_items.point_id', id)
        .select('title')

        return response.json({ point, items })

    }
    async create(request: Request, response: Response) {

        const {

            image,
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude,
            items
      
         } = request.body
      
         const trx = await knex.transaction()
         const point = {
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60' ,
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude
         }
         const insertedIds = await trx('points').insert(point)
         const point_id = insertedIds[0]
         const pointsItems = items.map((item_id: number )=> {
            return {
               item_id,
               point_id,
            }
         })
         
         await trx('points_items').insert(pointsItems)
         trx.commit()
         return response.json( {
            id: point_id, 
            ...point,
         })
    }
}

export default PointsController