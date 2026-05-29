import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DishType } from "@/types/dishType";
import { RestaurantState, RestaurantStatus } from "@/types/restaurantType";
import { useUserStore } from "./useUserStore";
import { API_END_POINT } from "@/lib/constants";
import { useAppStore } from "./useAppStore";

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      loading:{
        pageLoad:false,
        registerBtn:false,
        updateRestaurantBtn:false,
        updateResStatusBtn:false,
        getRestaurantMenu:false,
        addDishBtn:false,
        editDishBtn:false,
        deleteDishBtn:false,
      },
      userRestaurant: null,
      searchedRestaurants: null,
      selectedFilters: [],
      restaurantDetails: null,
      restaurants: [],
      restaurantPagination: null,
      areasTopRestaurants: null,
      stats: null,
      popularRestaurants: [],
      menu: [],

      registerRestaurant: async (applicationId) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,registerBtn:true}
          }
        })
        try {
          const res = await fetch(
            `${API_END_POINT}/restaurant/register/${applicationId}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ userRestaurant: data.restaurant });
            toast.success(data.message);

            useUserStore.getState().updateUserRole("Restaurant_Owner");
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,registerBtn:false}
            }
          })
        }
      },

      getUserRestaurant: async () => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          const res = await fetch(`${API_END_POINT}/restaurant/user/get`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ userRestaurant: data.restaurant });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },

      getRestaurantDetailsById: async (restaurantId: string) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          const res = await fetch(
            `${API_END_POINT}/restaurant/get/details/${restaurantId}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ restaurantDetails: data.restaurant });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        }finally{
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },
      getRestaurantDetailsByOwnerId: async (ownerId: string) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          const res = await fetch(
            `${API_END_POINT}/restaurant/get/owner/details/${ownerId}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ restaurantDetails: data.restaurant });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        }finally{
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },

      updateRestaurant: async (formData: FormData) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,updateRestaurantBtn:true}
          }
        })
        try {
          const res = await fetch(`${API_END_POINT}/restaurant/update`, {
            method: "PUT",
            credentials: "include",
            body: formData,
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            set({ userRestaurant: data.restaurant });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,updateRestaurantBtn:false}
            }
          })
        }
      },

      updateRestaurantStatus: async (
        restaurantId: string,
        status: RestaurantStatus,
      ) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,updateResStatusBtn:true}
          }
        })
        try {
          const res = await fetch(
            `${API_END_POINT}/restaurant/${restaurantId}/update/status`,
            {
              method: "PUT",
              credentials: "include",
              body: JSON.stringify({ status }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            set((state) => ({
              ...state,
              userRestaurant: state.userRestaurant
                ? { ...state.userRestaurant, status }
                : null,
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,updateResStatusBtn:false}
            }
          })
        }
      },

      searchRestaurant: async (searchQuery = "", searchCuisines = []) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          const params = new URLSearchParams();
          params.set("searchQuery", searchQuery);
          params.set("selectedCuisines", searchCuisines.join(","));

          const res = await fetch(
            `${API_END_POINT}/restaurant/search/?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ searchedRestaurants: data.restaurants });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },

      getRestaurants: async (page = 1, limit = 10, filters = {}) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters?.search && { search: filters.search }),
            ...(filters?.status && { status: filters.status }),
            ...(filters?.foodType && { foodType: filters.foodType }),
            ...(filters?.sortBy && { sortBy: filters.sortBy }),
            ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
          });

          const res = await fetch(
            `${API_END_POINT}/restaurant/get/all?${params}`,
            {
              method: "GET",
              credentials: "include",
            },
          );

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }

          if (data.success) {
            set((state) => ({
              ...state,
              restaurants: data.restaurants,
              restaurantPagination: {
                currentPage: page,
                totalPages: data.totalPages,
                totalCount: data.totalCount,
                limit,
              },
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },

      getAreasTopRestaurants: async (area: string) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          const res = await fetch(
            `${API_END_POINT}/restaurant/get/areas/topRestaurants?area=${area}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({
              areasTopRestaurants: {
                area,
                topRestaurants: data.restaurants,
              },
            });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },

      getRestaurantStats: async () => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          const res = await fetch(`${API_END_POINT}/restaurant/get/stats`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ stats: data.stats });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },

      getPopularRestaurants: async (type) => {
        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,pageLoad:true}
          }
        })
        try {
          if (!useAppStore.getState().userLocation) return;

          const { city, latitude, longitude } = useAppStore.getState().userLocation!;

          const res = await fetch(
            `${API_END_POINT}/restaurant/get/popular?type=${type}&city=${city}&lat=${latitude}&lng=${longitude}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set((state) => ({
              ...state,
              popularRestaurants: data.restaurants,
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,pageLoad:false}
            }
          })
        }
      },

      getRestaurantMenu: async (
        restaurantId,
        page = 1,
        limit = 10,
        filters = {},
      ) => {

        set((state)=>{
          return{
            ...state,
            loading:{...state.loading,getRestaurantMenu:true}
          }
        })
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters?.search && { search: filters.search }),
            ...(filters?.category && { category: filters.category }),
            ...(filters?.foodType && { foodType: filters.foodType }),
            ...(filters?.minPrice && { minPrice: filters.minPrice }),
            ...(filters?.maxPrice && { maxPrice: filters.maxPrice }),
            ...(filters?.sortBy && { sortBy: filters.sortBy }),
            ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
          });

          const res = await fetch(
            `${API_END_POINT}/restaurant/get/menu/${restaurantId}?${params}`,
            {
              method: "GET",
              credentials: "include",
            },
          );

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }

        
          if (data.success) {
            set((state) => ({
              ...state,
              menu: data.menu,
              restaurantPagination: data.pagination
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          set((state)=>{
            return{
              ...state,
              loading:{...state.loading,getRestaurantMenu:false}
            }
          })
        }
      },

      // utility function

      addDishToRestaurantMenu: (dish: DishType) => {
        set((state)=>({
          menu:[dish,...state.menu]
        }))
      },

      editDishToRestaurantMenu: (updatedDish: DishType) => {
        set((state) => ({
          menu: state.menu.map((dish: DishType) =>
            dish._id === updatedDish._id ? updatedDish : dish,
          ),
        }));
      },
      
      updateSelectedFilters: (option: string) => {
        set((state) => ({
          selectedFilters: state.selectedFilters.includes(option)
            ? state.selectedFilters.filter((item) => item !== option)
            : [...state.selectedFilters, option],
        }));
      },

      resetSelectedFilters: () => {
        set({ selectedFilters: [] });
      },

      clearAreaTopRestaurants: () => set({ areasTopRestaurants: null }),
      clearRestaurantMenu: () => set({ menu: [] }),

      resetStore: () => {
        set({
          loading:{
            pageLoad:false,
            registerBtn:false,
            updateRestaurantBtn:false,
            updateResStatusBtn:false,
            addDishBtn:false,
            editDishBtn:false,
            deleteDishBtn:false,
            getRestaurantMenu:false
          },
          userRestaurant: null,
          searchedRestaurants: null,
          selectedFilters: [],
          restaurantDetails: null,
          restaurants: [],
          restaurantPagination: null,
          areasTopRestaurants: null,
          stats: null,
          popularRestaurants: [],
          menu: [],
        });
      },
    }),
    {
      name: "restaurant-name",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userRestaurant: state.userRestaurant,
        searchedRestaurants: state.searchedRestaurants,
        selectedFilters: state.selectedFilters,
        restaurantDetails: state.restaurantDetails,
        restaurants: state.restaurants,
        restaurantPagination: state.restaurantPagination,
        areasTopRestaurants: state.areasTopRestaurants,
        stats: state.stats,
        popularRestaurants: state.popularRestaurants,
        menu: state.menu,
      }),
    },
  ),
);
