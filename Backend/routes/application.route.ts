import  express  from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { isAdmin } from "../middlewares/isAdmin";
import { deleteApplication, getDeliveryAgentsApplication, getRestaurantsApplication, getUserApplicationDetails, makeApplicationDeletable, submitDeliveryAgentApplication, submitRestaurantApplication, updateApplicationStatus } from "../controllers/application.controller";
import upload from "../middlewares/multer";
import { isApplicant } from "../middlewares/isApplicant";

const router = express.Router()

router.route('/:id/get').get(isAuthenticated,getUserApplicationDetails)

router.route('/restaurant/submit').post(isAuthenticated,isApplicant,upload.single('image'),submitRestaurantApplication)

router.route('/delivery-agent/submit').post(isAuthenticated,isApplicant,submitDeliveryAgentApplication)

router.route('/:id/status/update').put(isAuthenticated,isAdmin,updateApplicationStatus)
router.route('/restaurant/get/all').get(isAuthenticated,isAdmin,getRestaurantsApplication)
router.route('/delivery-agent/get/all').get(isAuthenticated,isAdmin,getDeliveryAgentsApplication)
router.route('/:id/deletable').get(isAuthenticated,isAdmin,makeApplicationDeletable)
router.route('/:id/delete').get(isAuthenticated,isAdmin,deleteApplication)

export default router