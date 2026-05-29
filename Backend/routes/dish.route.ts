import express from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { addDish, editDish, getAllDishes, getDishDetails, getDishesByCategory, getSimilarDishes, toggleDishAvailabilty, updateDishRating } from '../controllers/dish.controller'
import upload from '../middlewares/multer'

const router = express.Router()

router.route('/add').post(isAuthenticated,upload.single('image'),addDish)
router.route('/edit/:id').post(isAuthenticated,upload.single('image'),editDish)
router.route('/:id/rating/:rating').get(isAuthenticated,updateDishRating)
router.route('/:id/availability/toggle').get(isAuthenticated,toggleDishAvailabilty)
router.route('/get/all').get(isAuthenticated,getAllDishes)
router.route('/:id/get/similar').get(isAuthenticated,getSimilarDishes)
router.route('/:id/get').get(isAuthenticated,getDishDetails)
router.route('/get/category/:categoryName').get(isAuthenticated,getDishesByCategory)


export default router
