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

        const serializedPpints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.15.4:3000/uploads/${point.image}`
            }
        })
     
        return response.json(serializedPpints)
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

        const serializedPoint = {            
            ...point,
            image_url: `http://192.168.15.4:3000/uploads/${point.image}`            
        }
        return response.json({ serializedPoint, items })

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
            image: request.file.filename ,
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
         const pointsItems = items
         .split(',')
         .map((item: string) => Number(item.trim()))
         .map((item_id: number )=> {
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