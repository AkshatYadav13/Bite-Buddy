import  express  from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { isAdmin } from "../middlewares/isAdmin";
import { getAllTransactions, markTransactionPaid } from "../controllers/transaction.controller";

const router = express.Router()

router.route('/get/all').get(isAuthenticated,getAllTransactions)
router.route('/admin/markPaid/:transactionId').patch(isAuthenticated,isAdmin,markTransactionPaid)

export default router