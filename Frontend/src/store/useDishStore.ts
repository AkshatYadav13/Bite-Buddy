import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useRestaurantStore } from "./useRestaurantStore";
import { DishState } from "@/types/dishType";
import { API_END_POINT } from "@/lib/constants";

export const useDishStore = create<DishState>()(
  persist(
    (set) => ({
      loading: {
        pageLoad: false,
        addDishBtn: false,
        editDishBtn: false,
        toggleDishAvailabilityBtn: false,
        getSimilarDishes: false,
      },
      dishes: [],
      dishesPagination: null,
      selectedDish: null,
      similarDishes: [],
      categoryDishes: [],
      categoryDishPagination: null,
      categoryCache: {},

      addDish: async (formData: FormData) => {
        set((state) => ({
          loading: { ...state.loading, pageLoad: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/dish/add`, {
            method: "POST",
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
            useRestaurantStore.getState().addDishToRestaurantMenu(data.newDish);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, pageLoad: false },
          }));
        }
      },

      editDish: async (dishId: string, formData: FormData) => {
        set((state) => ({
          loading: { ...state.loading, editDishBtn: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/dish/edit/${dishId}`, {
            method: "POST",
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
            useRestaurantStore.getState().editDishToRestaurantMenu(data.dish);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, editDishBtn: false },
          }));
        }
      },

      getSimilarDishes: async (dishId: string) => {
        set((state) => ({
          loading: { ...state.loading, getSimilarDishes: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/dish/${dishId}/get/similar`,
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
            set({ similarDishes: data.similarDishes });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, getSimilarDishes: false },
          }));
        }
      },

      toggleDishAvailability: async (dishId: string) => {
        set((state) => ({
          loading: { ...state.loading, toggleDishAvailabilityBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/dish/${dishId}/availability/toggle`,
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
            toast.success(data.message);
            useRestaurantStore
              .getState()
              .editDishToRestaurantMenu(data.updatedDish);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, toggleDishAvailabilityBtn: false },
          }));
        }
      },

      getDishes: async (page = 1, limit = 10, filters = {}) => {
        set((state) => ({
          loading: { ...state.loading, pageLoad: true },
        }));
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

          const res = await fetch(`${API_END_POINT}/dish/get/all?${params}`, {
            method: "GET",
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set((state) => ({
              ...state,
              dishes: data.dishes,
              dishesPagination:data.pagination
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, pageLoad: false },
          }));
        }
      },

      getDishDetails: async (dishId: string) => {
        set((state) => ({
          loading: { ...state.loading, pageLoad: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/dish/${dishId}/get`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ selectedDish: data.dish });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, pageLoad: false },
          }));
        }
      },

      getDishesByCategory: async (categoryName, page = 1, limit = 10) => {
        set((state) => ({
          loading: { ...state.loading, pageLoad: true },
        }));
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          const res = await fetch(
            `${API_END_POINT}/dish/get/category/${categoryName}?${params}`,
            {
              method: "GET",
              credentials: "include",
            },
          );

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            set((state) => ({
              ...state,
              categoryDishes: [],
              categoryDishPagination: null,
            }));
            return;
          }

          if (data.success) {
            set((state) => ({
              categoryCache: {
                ...state.categoryCache,
                [categoryName]: {
                  dishes: data.dishes,
                  pagination: data.pagination,
                },
              },
              categoryDishes: data.dishes,
              categoryDishPagination: data.pagination,
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, pageLoad: false },
          }));
        }
      },

      setSelectedDish: (dish) => {
        set({ selectedDish: dish });
      },

      setCategoryDishesFromCache: (category) =>
        set((state) => ({
          categoryDishes: state.categoryCache[category].dishes,
          categoryDishPagination: state.categoryCache[category].pagination,
        })),

      resetStore: () => {
        set({
          loading: { 
            pageLoad: false,
            editDishBtn: false,
            toggleDishAvailabilityBtn: false,
            addDishBtn: false,
            getSimilarDishes: false,
          },
          dishes: [],
          dishesPagination: null,
          selectedDish: null,
          similarDishes: [],
          categoryCache: {},
          categoryDishes: [],
          categoryDishPagination: null,
        });
      },
    }),
    {
      name: "dish-name",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dishes: state.dishes,
        dishesPagination: state.dishesPagination,
        selectedDish: state.selectedDish,
        similarDishes: state.similarDishes,
        categoryCache: state.categoryCache,
        categoryDishes: state.categoryDishes,
        categoryDishPagination: state.categoryDishPagination,
      }),
    },
  ),
);
