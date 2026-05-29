import { PaginationType, RestaurantType } from "./restaurantType";

export const categoryOptions = [
  "Main Course",
  "Curries",
  "Combo",
  "Chinese",
  "Bakery",
  "Biryani",
  "Beverages",
  "Fast Food",
  "Breakfast",
  "Ice Creams",
  "Satvik",

  "Sandwiches",
  "Desserts",
  "Rice & Breads",
  "Starters",
  "Rolls",
  "Salad",
  "Soups",
  "Pasta & Noodles",
  "Pizza",
  "Burgers",
  "Snacks",
  "Tandoori",
  "Kebab",
  "Mughlai",
  "Continental",
];

export type DishType = {
  _id: string;
  restaurant: RestaurantType;
  name: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  imageUrl: string;
  category: string;
  isVeg: boolean;
  tags: string[];
  ratingCount: number;
  ratingTotal: number;
  avgRating: number;
  isAvailable: boolean;
  orderCount: number;
  totalUnitsSold: number;
};

export type CategoryCacheType = Record<
  string,
  {
    dishes: DishType[];
    pagination: PaginationType | null;
  }
>;
export type LoadingType = {
  pageLoad: boolean;
  addDishBtn: boolean;
  editDishBtn: boolean;
  toggleDishAvailabilityBtn: boolean;
  getSimilarDishes: boolean;
}

export type DishState = {
  loading: LoadingType;
  dishes: DishType[];
  selectedDish: DishType | null;
  dishesPagination: PaginationType | null;
  similarDishes: DishType[];
  categoryDishes: DishType[];
  categoryDishPagination: PaginationType | null;
  categoryCache:CategoryCacheType

  getDishes: (page: number, limit: number, filter?: any) => Promise<void>;
  addDish: (formData: FormData) => Promise<void>;
  editDish: (dishId: string, formData: FormData) => Promise<void>;
  toggleDishAvailability: (dishId: string) => Promise<void>;
  getDishDetails: (dishId: string) => Promise<void>;
  getSimilarDishes: (dishId: string) => void;
  getDishesByCategory: (
    categoryName: string,
    page: number,
    limit: number,
  ) => Promise<void>;

  setCategoryDishesFromCache: (category:string) => void;
  setSelectedDish: (dish: DishType | null) => void;
  resetStore: () => void;
};
