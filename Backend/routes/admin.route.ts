import  express  from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { isAdmin } from "../middlewares/isAdmin";
import { getAdminStats} from "../controllers/admin.controller";

const router = express.Router()

router.route('/get/stats').get(isAuthenticated,isAdmin,getAdminStats)

export default router