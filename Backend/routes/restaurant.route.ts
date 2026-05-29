import express  from "express";
import {  getAllRestaurants, getAreaTop3Restaurant, getPopularRestaurants, getRestaurantDetailsById,  getRestaurantDetailsByOwnerId,  getRestaurantMenu,  getRestaurantStats,  getUserRestaurant,  registrRestaurant,  searchRestaurant, updateRestaurant, updateRestaurantRating, updateRestaurantStatus } from "../controllers/restaurant.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import upload from "../middlewares/multer";
import { isRestaurantOwner } from "../middlewares/isRestaurantOwner";
import { isApplicant } from "../middlewares/isApplicant";

const router = express.Router()

router.route('/register/:applicationId').get(isAuthenticated,isApplicant,registrRestaurant)
router.route('/user/get').get(isAuthenticated,isRestaurantOwner,getUserRestaurant)
router.route('/update').put(isAuthenticated,isRestaurantOwner,upload.single('image'),updateRestaurant)
router.route('/:id/update/status').put(isAuthenticated,isRestaurantOwner,updateRestaurantStatus)
router.route('/search').get(isAuthenticated,searchRestaurant)
router.route('/get/details/:id').get(isAuthenticated,getRestaurantDetailsById)
router.route('/:id/rating/:action').get(isAuthenticated,updateRestaurantRating)
router.route('/get/all').get(isAuthenticated,getAllRestaurants)
router.route('/get/areas/topRestaurants').get(isAuthenticated,getAreaTop3Restaurant)
router.route('/get/stats').get(isAuthenticated,isRestaurantOwner,getRestaurantStats)
router.route('/get/popular').get(isAuthenticated,getPopularRestaurants)
router.route('/get/menu/:restaurantId').get(isAuthenticated,getRestaurantMenu)
router.route('/get/owner/details/:ownerId').get(isAuthenticated,getRestaurantDetailsByOwnerId)
export default router

