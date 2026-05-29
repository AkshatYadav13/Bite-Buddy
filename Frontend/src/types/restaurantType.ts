import { DeliveryAgentType } from "./deliveryAgentType";
import { DishType } from "./dishType";
import { OrderType } from "./orderTypes";
import { ILocation, UserType } from "./userType";

export type RestaurantStatus = 'Open'|'Closed'|'Busy'
export type FoodType = 'Pure Veg'| 'Non Veg' | 'Both'

export type RestaurantType = {
  _id:string
  user: UserType | string;
  restaurantName: string;
  address: string;
  area: string;
  cuisines: string[];
  imageUrl?: string;
  openingTime:string,
  closingTime:string,
  foodType:FoodType
  contact:string
  location: ILocation;
  totalDishes:number

  orders: OrderType[] | [];
  avgRating:number,
  ratingCount:number,
  ratingTotal:number,
  status:RestaurantStatus
  orderPlaced:number
  orderServed:number
  createdAt:string,
  updatedAt:string,
  fallbackAgents:DeliveryAgentType[]
  isActive:boolean
};

export type PaginationType = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit:number
}

export type AreasTopRestaurantType = {
  area:string,
  topRestaurants:RestaurantType[]
}



// Stats type
type RestaurantStatsType = {
  profile: {
    name: string;
    owner: {
      name: string;
      email: string;
      phone: string;
    };
    location: {
      address: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
    };
    cuisineTypes: string[];
    status: string;
    avgRating: number;
    totalReviews: number;
    totalDishes: number;
    createdAt: string;
    isVerified: boolean;
    banner: string;
  };
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    weeklyEarnings: { day: string; earnings: number }[];
    monthlyTrend:  { month: string; earnings: number }[];
  };
  orderStats: {
    totalOrders: number;
    todayOrders: number;
    deliveredOrders: number;
    canceledOrders: number;
    pendingOrders: number;
    avgOrderValue: number;
    topDishes: { name: string; orders: number; revenue: number }[];
    recentOrders:{
      id: string;
      customer: string;
      items: number;
      amount: number;
      status: string;
      time: string;
    }[];
    ordersByHour: { hour: string; orders: number }[];
  };
  ratings: {
    avgRating: number;
    totalRatings: number;
    distribution: { rating: number; count: number; percentage: number }[];
  };
  dishPerformance: {
    totalDishes: number;
    availableDishes: number;
    topRatedDishes: {
      name: string;
      rating: number;
      orders: number;
      revenue: number;
    }[];
    leastPerforming: {
      name: string;
      rating: number;
      orders: number;
      revenue: number;
    }[];
    categoryWise: {
      category: string;
      dishes: number;
      orders: number;
      revenue: number;
    }[];
  };
}

type RestaurantLoading = {
  pageLoad:boolean;
  registerBtn:boolean;
  updateResStatusBtn:boolean;
  addDishBtn:boolean;
  editDishBtn:boolean;
  deleteDishBtn:boolean;
  getRestaurantMenu:boolean;
  updateRestaurantBtn:boolean;
}

export type RestaurantState = {
  loading: RestaurantLoading;
  userRestaurant: null | RestaurantType;
  searchedRestaurants: null | RestaurantType[];
  selectedFilters:string[],
  restaurantDetails:null |RestaurantType;
  restaurants:RestaurantType[]
  restaurantPagination:PaginationType |null;
  areasTopRestaurants:AreasTopRestaurantType | null
  stats:RestaurantStatsType|null
  popularRestaurants:RestaurantType[]
  menu:DishType[]
  
  
  registerRestaurant: (applicationId:string) => Promise<void>;
  getUserRestaurant: () => Promise<void>;
  getRestaurantDetailsById:(id:string) => Promise<void>
  getRestaurantDetailsByOwnerId:(id:string) => Promise<void>
  updateRestaurant: (formdata: FormData) => Promise<void>;
  updateRestaurantStatus: (restaurantId:string,status:RestaurantStatus) => Promise<void>;
  searchRestaurant: (query?: string, filters?: string[]) => Promise<void>;
  resetSelectedFilters:()=> void
  getRestaurants: (page:number,limit:number,filter?:any) => Promise<void>;
  getAreasTopRestaurants: (area:string) => Promise<void>;
  getRestaurantStats:()=> Promise<void>
  getPopularRestaurants: (type:string) => Promise<void>;
  getRestaurantMenu:(restaurantId:string,page:number,limit:number,filter?:any)=> Promise<void>
  
  // utility function
  addDishToRestaurantMenu: (dish: DishType) => void;
  editDishToRestaurantMenu: (dish: DishType) => void;
  updateSelectedFilters:(option:string)=> void
  clearRestaurantMenu:()=> void

  clearAreaTopRestaurants:()=> void
  resetStore:()=> void
};

