import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useUserStore } from "./useUserStore";
import { toast } from "sonner";
import { API_END_POINT } from "@/lib/constants";
import { DeliveryAgentState, GeoCoordsType } from "@/types/deliveryAgentType";
import { ILocation } from "@/types/userType";
import { useAppStore } from "./useAppStore";
import { useOrderStore } from "./useOrderStore";

export const useDeliveryAgentStore = create<DeliveryAgentState>()(
  persist(
    (set, get) => ({
      loading:{
        pageLoading: false,
        registerDeliveryAgentBtn: false,
        acceptOrderBtn: false,
        getDeliveryAgentDetails: false,
        getDeliveryAgentStats: false,
      },
      deliveryAgentDetails: null,
      deliveryAgents: [],
      deliveryAgentPagination: null,
      agentStats: null,
      optimalRestaurants: [],
      pickupOrders:[],

      registerDeliveryAgent: async (
        applicationId: string,
        input: ILocation,
      ) => {
        set({ loading: { ...get().loading, registerDeliveryAgentBtn: true } });
        try {
          const res = await fetch(
            `${API_END_POINT}/deliveryAgent/register/${applicationId}`,
            {
              method: "POST",
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
            set({ deliveryAgentDetails: data.deliveryAgent });

            useUserStore.getState().updateUserRole("Delivery_Agent");
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, registerDeliveryAgentBtn: false } });
        }
      },

      getDeliveryAgents: async (page = 1, limit = 10, filters = {}) => {
        set((state)=> ({loading: {...state.loading, pageLoading: true}}))
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters?.search && { search: filters.search }),
            ...(filters?.status && { status: filters.status }),
            ...(filters?.vehicleType && { vehicleType: filters.vehicleType }),
            ...(filters?.sortBy && { sortBy: filters.sortBy }),
            ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
          });

          const res = await fetch(
            `${API_END_POINT}/deliveryAgent/get/all?${params}`,
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
              deliveryAgents: data.deliveryAgents,
              deliveryAgentPagination: {
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
          set({ loading: { ...get().loading, pageLoading: false } });
        }
      },

      getPickupOrdersForAgents: async () => {
        set({ loading: { ...get().loading, pageLoading: true } });
        let { latitude, longitude } = useAppStore.getState().userLocation!;

        if (!latitude || !longitude) {
          toast.info("Location not available. Please enable location access.");
          return;
        }

        try {
          const res = await fetch(
            `${API_END_POINT}/deliveryAgent/get/orders/pickup?lat=${latitude}&lng=${longitude}`,
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

            set({ pickupOrders: data.pickupOrders });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, pageLoading: false } });
        }
      },

      getOptimalRestaurantsForAgent: async (lat, lng) => {
        set({ loading: { ...get().loading, pageLoading: true } });

        try {
          const res = await fetch(
            `${API_END_POINT}/deliveryAgent/get/restaurants/optimal?lat=${lat}&lng=${lng}`,
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
              optimalRestaurants: data.restaurants,
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, pageLoading: false } });
        }
      },

      acceptOrder: async (orderId: string,navigate) => {
        set({ loading: { ...get().loading, acceptOrderBtn: true } });
        try {
          const res = await fetch(
            `${API_END_POINT}/deliveryAgent/order/${orderId}/accept`,
            {
              method: "GET",
              credentials: "include",
            },
          );

          let data;
          try {
            data = await res.json();
          } catch {
            toast.error("Failed to parse server response");
            return;
          }

          if (!res.ok) {
            toast.error(data.message || "Failed to accept order");
            return;
          }

          if (data.success) {
            const { acceptedOrder, message } = data;
            toast.success(message);
            useOrderStore.getState().addActiveOrder(acceptedOrder)
            get().updateAgentStatus("OnDelivery")
            get().clearPickUpOrders()
            navigate("/deliveryAgent/orders/page")
          } 
        } catch (error) {
          console.error(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          set({ loading: { ...get().loading, acceptOrderBtn: false } });
        }
      },

      getDeliveryAgentDetails: async () => {
        set({ loading: { ...get().loading, getDeliveryAgentDetails: true } });
        try {
          const res = await fetch(
            `${API_END_POINT}/deliveryAgent/get/details`,
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
            set({ deliveryAgentDetails: data.agent });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, getDeliveryAgentDetails: false } });
        }
      },

      getDeliveryAgentStats: async () => {
        set({ loading: { ...get().loading, getDeliveryAgentStats: true } });
        try {
          const res = await fetch(`${API_END_POINT}/deliveryAgent/get/stats`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();
          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ agentStats: data.stats });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, getDeliveryAgentStats: false } });
        }
      },

      updateAgentLocation: async (loc:GeoCoordsType) => {
        if (!loc.latitude || !loc.longitude) {
          toast.info("Location not available. Please enable location access.");
          return;
        }
        try {
          const res = await fetch(
            `${API_END_POINT}/deliveryAgent/location/update`,
            {
              method: "PUT",
              credentials: "include",
              body: JSON.stringify(loc),
              headers: {
                "Content-type": "application/json",
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
              deliveryAgentDetails: state.deliveryAgentDetails
                ? {
                    ...state.deliveryAgentDetails,
                    lastLocation: data.agent.lastLocation,
                    lastLocationUpdatedAt: data.agent.lastLocationUpdatedAt,
                  }
                : null,
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        }
      },

      // utilityFunction

      updateAgentStatus(status) {
        set((state) => ({
          deliveryAgentDetails: {
            ...state.deliveryAgentDetails!,
            status,
          },
        }));
      },
      clearPickUpOrders() {
          set((state)=>({...state,pickupOrders:[]}))
      },

      resetStore: () => {
        set({
          loading:{
            pageLoading: false,
            registerDeliveryAgentBtn: false,
            acceptOrderBtn: false,
            getDeliveryAgentDetails: false,
            getDeliveryAgentStats: false,

          },
          deliveryAgentDetails: null,
          deliveryAgents: [],
          deliveryAgentPagination: null,
          agentStats: null,
          pickupOrders:[]
        });
      },
    }),
    {
      name: "delivery-agent-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        deliveryAgentDetails: state.deliveryAgentDetails,
        deliveryAgents: state.deliveryAgents,
        deliveryAgentPagination: state.deliveryAgentPagination,
        agentStats: state.agentStats,
        pickupOrders: state.pickupOrders,
      }),
    },
  ),
);
