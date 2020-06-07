import express from 'express'
import multer from 'multer'
import { celebrate, Joi } from 'celebrate'
import PointsController from './controllers/pointsController'
import ItemsController from './controllers/itemsController'
import multerConfig from '../src/config/multer'

const router = express.Router()
const pointsController = new PointsController()
const itemsController = new ItemsController
const upload = multer(multerConfig)


router.get('/ping', (request, response) => {
   return response.json('pong')
})

router.get('/items', itemsController.index)

router.get('/points', pointsController.index)

router.get('/points/:id', pointsController.show)

router.post(
   '/points', 
   upload.single('image'),
   celebrate({
      body: Joi.object().keys({
         name: Joi.string().required(),
         email: Joi.string().required().email(),
         whatsapp: Joi.number().required(),
         latitude: Joi.number().required(),
         longitude: Joi.number().required(),
         items: Joi.string().required(),
         city: Joi.string().required(),
         uf: Joi.string().required().max(2)

      })
   }, {
      abortEarly: false
   }),
   pointsController.create)

export default router;