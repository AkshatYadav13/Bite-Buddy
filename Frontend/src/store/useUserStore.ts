import { API_END_POINT } from "@/lib/constants";
import {
  ChangePasswordState,
  LoginInputState,
  SignUpInputState,
} from "@/schema/userSchema";
import { IUserAddress, UserRoleType, UserState } from "@/types/userType";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useRestaurantStore } from "./useRestaurantStore";
import { useOrderStore } from "./useOrderStore";
import { useDishStore } from "./useDishStore";
import { useCartStore } from "./useCartStore";
import { useAdminStore } from "./useAdminStore";
import { useApplicationStore } from "./useApplicationStore";
import { useDeliveryAgentStore } from "./useDeliveryAgentStore";
import { startTransition } from "react";

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      userFavoriteDishes: [],
      userFavoriteRestaurants: [],
      userFavoritesCache: {
        restaurants: [],
        dishes: [],
        isFetched: false,
      },
      addressFetched: false,
      loading:{
        pageLoad:false,
        signupBtn:false,
        googleSignupBtn:false,
        loginBtn:false,
        googleLoginBtn:false,
        logoutBtn:false,
        changePasswordBtn:false,
        setDefaultAddressBtn:false,
        deleteAddressBtn:false,
        addAddressBtn:false,
        editAddressBtn:false,
        updateProfileBtn:false,
        toggleDishInFavoritesBtn:false,
        toggleRestaurantInFavoritesBtn:false,
      },

      signup: async (input: SignUpInputState) => {
        set((state) => ({
          loading: { ...state.loading, signupBtn: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/signup`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(input),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            set({ user: data.userWithOutPassword });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, signupBtn: false },
        }));
        }
      },
      
      googleSignup: async (input: Partial<SignUpInputState>) => {
        set((state) => ({
          loading: { ...state.loading, googleSignupBtn: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/google/auth`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(input),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            set({ user: data.userWithOutPassword });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, googleSignupBtn: false },
        }));
        }
      },

      login: async (input: LoginInputState) => {
        set((state) => ({
          loading: { ...state.loading, loginBtn: true },
        }));

        try {
          const res = await fetch(`${API_END_POINT}/user/login`, {
            method: "Post",
            credentials: "include",
            body: JSON.stringify(input),
            headers: {
              "Content-type": "application/json",
            },
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            set({ user: data.userWithOutPassword });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, loginBtn: false },
        }));
        }
      },

      googleLogin: async (input: Partial<LoginInputState>) => {
        set((state) => ({
          loading: { ...state.loading, googleLoginBtn: true },
        }));

        try {
          const res = await fetch(`${API_END_POINT}/user/google/auth`, {
            method: "Post",
            credentials: "include",
            body: JSON.stringify(input),
            headers: {
              "Content-type": "application/json",
            },
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            set({ user: data.userWithOutPassword });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, googleLoginBtn: false },
        }));
        }
      },

      logout: async () => {
        set((state) => ({
          loading: { ...state.loading, logoutBtn: true },
        }));

        try {
          const agentStatus =
            useDeliveryAgentStore.getState().deliveryAgentDetails?.status;
          if (
            get().user?.role === "Delivery_Agent" &&
            agentStatus === "OnDelivery"
          ) {
            toast.info("Cannot go offline while on delivery");
            return;
          }

          const res = await fetch(`${API_END_POINT}/user/logout`, {
            method: "GET",
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }

          if (data.success) {
            toast.success(data.message);

            startTransition(() => {
              get().resetStore();
              useRestaurantStore.getState().resetStore();
              useOrderStore.getState().resetStore();
              useDishStore.getState().resetStore();
              useCartStore.getState().resetStore();
              useAdminStore.getState().resetStore();
              useApplicationStore.getState().resetStore();
              useDeliveryAgentStore.getState().resetStore();
              useAdminStore.getState().resetStore();
            });
          }
        } catch (error) {
          console.error(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, logoutBtn: false },
        }));
        }
      },

      updateProfile: async (formData: FormData) => {
        set((state) => ({
          loading: { ...state.loading, updateProfileBtn: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/profile/update`, {
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
            set({ user: data.user });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, updateProfileBtn: false },
        }));
        }
      },

      changePassword: async (input: ChangePasswordState) => {
        set((state) => ({
          loading: { ...state.loading, changePasswordBtn: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/changePassword`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(input),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            set({ user: null });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, changePasswordBtn: false },
        }));
        }
      },

      checkAuthentication: async () => {
        set((state) => ({
          loading: { ...state.loading, pageLoad: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/isAuthentic`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok) {
            get().resetStore();
            useRestaurantStore.getState().resetStore();
            useOrderStore.getState().resetStore();
            useDishStore.getState().resetStore();
            useCartStore.getState().resetStore();
            useAdminStore.getState().resetStore();
            return false;
          }
          if (data.success) {
            set({ user: data.user });
            return true;
          }

          return true;
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
          return false;
        }  finally {
          set((state) => ({
          loading: { ...state.loading, pageLoad: false },
        }));
        }
      },

      toggleRestaurantInFavorites: async (restaurantId: string) => {
        set((state) => ({
          loading: { ...state.loading, toggleRestaurantInFavoritesBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/user/favorite/toggle/restaurant/${restaurantId}`,
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
            let updatedList = [];
            let userFavoriteList = get().user?.favoriteRestaurants || [];
            if (userFavoriteList?.includes(restaurantId)) {
              updatedList = userFavoriteList.filter(
                (itemId) => itemId !== restaurantId,
              );
            } else {
              updatedList = [...userFavoriteList, restaurantId];
            }

            const updatedFavoriteRestaurants = get().userFavoriteRestaurants.filter(
                (item) => item._id !== restaurantId,
              );

            set((state) => ({
              user: state.user
                ? { ...state.user, favoriteRestaurants: updatedList }
                : null,
              userFavoriteRestaurants: updatedFavoriteRestaurants,
              userFavoritesCache: {
                ...state.userFavoritesCache,
                restaurants: updatedFavoriteRestaurants,
              },
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, toggleRestaurantInFavoritesBtn: false },
        }));
        }
      },

      toggleDishInFavorites: async (dishId: string) => {
        set((state) => ({
          loading: { ...state.loading, toggleDishInFavoritesBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/user/favorite/toggle/dish/${dishId}`,
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
            let updatedList = [];
            let userFavoriteList = get().user?.favoriteDishes || [];
            if (userFavoriteList?.includes(dishId)) {
              updatedList = userFavoriteList.filter(
                (itemId) => itemId !== dishId,
              );
            } else {
              updatedList = [...userFavoriteList, dishId];
            }

            const updatedFavoriteDishes = get().userFavoriteDishes.filter(
              (item) => item._id !== dishId,
            );

            set((state) => ({
              user: state.user
                ? { ...state.user, favoriteDishes: updatedList }
                : null,
              userFavoriteDishes: updatedFavoriteDishes,
              userFavoritesCache: {
                ...state.userFavoritesCache,
                dishes: updatedFavoriteDishes,
              },
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set( (state) => ({
          loading: { ...state.loading, toggleDishInFavoritesBtn: false },
        }));
        }
      },

      getUserFavorites: async () => {
        if (get().userFavoritesCache.isFetched) {
          set((state) => ({
            userFavoriteRestaurants: state.userFavoritesCache.restaurants,
            userFavoriteDishes: state.userFavoritesCache.dishes,
          }));
          return;
        }

        set((state) => ({
          loading: { ...state.loading, pageLoad: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/favorites/get`, {
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
              userFavoriteRestaurants: data.favoriteRestaurants,
              userFavoriteDishes: data.favoriteDishes,
              userFavoritesCache: {
                restaurants: data.favoriteRestaurants,
                dishes: data.favoriteDishes,
                isFetched: true,
              },
            }));
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

      addAddress: async (input: IUserAddress) => {
        set((state) => ({
          loading: { ...state.loading, addAddressBtn: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/address/add`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(input),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            get().setUserAddress(data.addresses);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, addAddressBtn: false },
        }));
        }
      },

      deleteAddress: async (addressId: string) => {
        set((state) => ({
          loading: { ...state.loading, deleteAddressBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/user/address/delete/${addressId}`,
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
            get().setUserAddress(data.addresses);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, deleteAddressBtn: false },
        }));
        }
      },

      editAddress: async (addressId: string, input: IUserAddress) => {
        set((state) => ({
          loading: { ...state.loading, editAddressBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/user/address/edit/${addressId}`,
            {
              method: "PUT",
              credentials: "include",
              body: JSON.stringify(input),
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
            get().setUserAddress(data.addresses);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, editAddressBtn: false },
        }));
        }
      },

      setDefaultAddress: async (addressId: string) => {
        set((state) => ({
          loading: { ...state.loading, setDefaultAddressBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/user/address/set/default/${addressId}`,
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
            get().setUserAddress(data.addresses);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
          loading: { ...state.loading, setDefaultAddressBtn: false },
        }));
        }
      },

      getUserAddress: async () => {
        const { addressFetched, setUserAddress } = get();

        if (addressFetched) return;

        set((state) => ({
          loading: { ...state.loading, pageLoad: true },
        }));
        try {
          const res = await fetch(`${API_END_POINT}/user/address/get`, {
            method: "GET",
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.message);
            return;
          }

          if (data.success) {
            setUserAddress(data.addresses || []);
            set({ addressFetched: true });
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

      // utility functions
      updateUserRole: (role: UserRoleType) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, role, applicationId: undefined }
            : null,
        }));
      },
      setUserAddress: (addresses: IUserAddress[]) => {
        set((state) => ({
          user: state.user ? { ...state.user, addresses } : null,
        }));
      },

      updateApplicationStatus: (canApply: boolean, applicationId: string) =>
        set((state) => ({
          user: state.user ? { ...state.user, canApply, applicationId } : null,
        })),

      resetStore: () => {
        set({
          user: null,
          userFavoriteDishes: [],
          userFavoriteRestaurants: [],
          userFavoritesCache: {
            restaurants: [],
            dishes: [],
            isFetched: false,
          },
          loading: {
            toggleDishInFavoritesBtn:false,
            toggleRestaurantInFavoritesBtn:false,
            signupBtn:false,
            pageLoad:false,
            googleSignupBtn:false,
            loginBtn:false,
            googleLoginBtn:false,
            logoutBtn:false,
            changePasswordBtn:false,
            setDefaultAddressBtn:false,
            deleteAddressBtn:false,
            addAddressBtn:false,
            editAddressBtn:false,
            updateProfileBtn:false,
          }
        });
      },
    }),
    {
      name: "user-name",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        userFavoriteDishes: state.userFavoriteDishes,
        userFavoriteRestaurants: state.userFavoriteRestaurants,
        userFavoritesCache: state.userFavoritesCache,
      })
    },
  ),
);
