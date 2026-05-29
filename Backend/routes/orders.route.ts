import express from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { cancelOrder, createCheckoutSession, deletePendingOrder, generateOrderOtp, getActiveOrders, getOrderById, getOrdersHistory, getRazorPayKey, paymentVerification, placeOrder, setOrderRating, updateOrderStatus } from '../controllers/orders.controller'
import { isDeliveryAgent } from '../middlewares/isDeliveryAgent'

const router = express.Router()

router.route('/razorpay-key/get').get(isAuthenticated,getRazorPayKey)
router.route('/place').post(isAuthenticated,placeOrder)
router.route('/:id/checkout/create-session').get(isAuthenticated,createCheckoutSession)
router.route('/payment-verification').post(isAuthenticated,paymentVerification)
router.route('/cancel/:id').put(isAuthenticated, cancelOrder)
router.route('/:id/update/status').put(isAuthenticated,updateOrderStatus)
router.route('/pending/delete/:id').get(isAuthenticated, deletePendingOrder)
router.route('/:id/rating/set').put(isAuthenticated, setOrderRating)
router.route('/:id/generate/parcelOtp/:type').get(isAuthenticated,isDeliveryAgent,generateOrderOtp)
router.route('/get/:id').get(isAuthenticated, getOrderById)
router.route('/get/orders/history').get(isAuthenticated,getOrdersHistory)
router.route('/get/orders/active/:type/:id').get(isAuthenticated,getActiveOrders)

export default router
