import  express  from "express";
import { addAddress, changePassword, deleteAddress, editAddress, getAddresses, getUserFavorites, googleAuth, login, logout,  setDefaultAddress,  signup, toggleDishInFavorites, toggleRestaurantInFavorites,  updateProfile } from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import upload from "../middlewares/multer";
import { User } from "../models/user.model";
import { isCustomer } from "../middlewares/isCustomer";

const router = express.Router()

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/google/auth').post(googleAuth);
router.route('/logout').get(isAuthenticated,logout);
router.route('/profile/update').put(isAuthenticated,upload.single('profilePic'),updateProfile);
router.route('/changePassword').post(isAuthenticated,changePassword);
router.route('/favorite/toggle/restaurant/:id').get(isAuthenticated,isCustomer,toggleRestaurantInFavorites);
router.route('/favorite/toggle/dish/:id').get(isAuthenticated,isCustomer,toggleDishInFavorites);
router.route('/favorites/get').get(isAuthenticated,getUserFavorites);

router.route('/address/add').post(isAuthenticated,isCustomer,addAddress);
router.route('/address/delete/:id').get(isAuthenticated,isCustomer,deleteAddress);
router.route('/address/edit/:id').put(isAuthenticated,isCustomer,editAddress);
router.route('/address/get').get(isAuthenticated,isCustomer,getAddresses);
router.route('/address/set/default/:id').get(isAuthenticated,isCustomer,setDefaultAddress);

router.route('/isAuthentic').get(isAuthenticated, async (req, res) => {
  const user = await User.findById(req.id);
  res.status(200).json({ user,success:true });
});


export default router