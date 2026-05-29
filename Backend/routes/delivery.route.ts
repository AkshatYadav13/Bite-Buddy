import  express  from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { acceptOrder, getAgentDashboardStats, getAgentDetails,getDeliveryAgents , getOptimalRestaurantsForAgent, getPickupOrdersforAgents, registerDeliveryAgent, updateAgentLocation, updateDeliveryAgentRating } from "../controllers/delivery.controller";
import { isDeliveryAgent } from "../middlewares/isDeliveryAgent";
import { isAdmin } from "../middlewares/isAdmin";
import { isApplicant } from "../middlewares/isApplicant";

const router = express.Router()

router.route('/register/:applicationId').post(isAuthenticated,isApplicant,registerDeliveryAgent)
router.route('/:id/rating/:rating').get(isAuthenticated,updateDeliveryAgentRating)
router.route('/get/all').get(isAuthenticated,isAdmin,getDeliveryAgents)
router.route('/get/orders/pickup').get(isAuthenticated,isDeliveryAgent,getPickupOrdersforAgents)
router.route('/order/:id/accept').get(isAuthenticated,isDeliveryAgent,acceptOrder)
router.route('/get/details').get(isAuthenticated,isDeliveryAgent,getAgentDetails)
router.route('/get/stats').get(isAuthenticated,isDeliveryAgent,getAgentDashboardStats)
router.route('/location/update').put(isAuthenticated,isDeliveryAgent,updateAgentLocation)
router.route('/get/restaurants/optimal').get(isAuthenticated,getOptimalRestaurantsForAgent)

export default router