import {
  ChangePasswordState,
  LoginInputState,
  SignUpInputState,
} from "@/schema/userSchema";
import { RestaurantType } from "./restaurantType";
import { DishType } from "./dishType";

export interface ILocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface IUserAddress extends ILocation {
  _id?: string;
  label: string;
  isDefault: boolean;
}

export type UserRoleType =
  | "Customer"
  | "Restaurant_Owner"
  | "Delivery_Agent"
  | "Admin"
  |"Applicant"

export type UserType = {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  contact: string;
  area: string;
  profilePic?: string;
  role: UserRoleType;
  lastLogin?: Date;
  orders: string[];
  favoriteRestaurants: string[];
  favoriteDishes: string[];
  canApply: boolean;
  applicationId: string | undefined;
  addresses: IUserAddress[];
};

type UserLoadingState = {
  signupBtn:boolean;
  pageLoad:boolean;
  googleSignupBtn:boolean;
  loginBtn:boolean;
  googleLoginBtn:boolean;
  logoutBtn:boolean;
  changePasswordBtn:boolean;
  setDefaultAddressBtn:boolean;
  deleteAddressBtn:boolean;
  addAddressBtn:boolean;
  editAddressBtn:boolean;
  updateProfileBtn:boolean;
  toggleDishInFavoritesBtn:boolean;
  toggleRestaurantInFavoritesBtn:boolean;
}

export type UserState = {
  user: null | UserType;
  loading:UserLoadingState;
  userFavoriteRestaurants: RestaurantType[];
  userFavoriteDishes: DishType[];
  userFavoritesCache: {
    restaurants: RestaurantType[];
    dishes: DishType[];
    isFetched: boolean;
  };
  addressFetched: boolean;

  signup: (
    input: SignUpInputState,
  ) => Promise<void>;
  googleSignup: (
    input: Partial<SignUpInputState>
  ) => Promise<void>;
  login: (input: LoginInputState) => Promise<void>;
  googleLogin: (input: Partial<LoginInputState>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: FormData) => Promise<void>;
  changePassword: (input: ChangePasswordState) => Promise<void>;
  checkAuthentication: () =>Promise<boolean>;
  toggleRestaurantInFavorites: (applicationId: string) => Promise<void>;
  toggleDishInFavorites: (applicationId: string) => Promise<void>;
  getUserFavorites: () => Promise<void>;

  setDefaultAddress: (addressId: string) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  addAddress: (address: IUserAddress) => Promise<void>;
  editAddress: (addressId: string,address: IUserAddress) => Promise<void>;
  getUserAddress:()=> Promise<void>;

  // utility fn
  updateUserRole: (role: UserRoleType) => void;
  setUserAddress: (addAddress:IUserAddress[]) => void;
  updateApplicationStatus: (canApply: boolean, appId: string) => void;

  resetStore: () => void;
};
