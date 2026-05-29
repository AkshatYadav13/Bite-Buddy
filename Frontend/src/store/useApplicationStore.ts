import { API_END_POINT } from "@/lib/constants";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ApplicationState } from "@/types/applicationType";
import { useUserStore } from "./useUserStore";

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      userApplication: null,
      restaurantApplications: [],
      deliveryAgentApplications: [],
      resAppPagination: null,
      delAppPagination: null,
      loading: {
        pageLoad: false,
        submitAppBtn: false,
        updateAppStatusBtn: false,
        makeAppDeletableBtn: false,
        deleteAppBtn: false,
      },

      submitRestaurantApplication: async (formData) => {
        set((state) => ({
          ...state,
          loading: { ...state.loading, submitAppBtn: true },
        }));

        try {
          const res = await fetch(
            `${API_END_POINT}/application/restaurant/submit`,
            {
              method: "POST",
              credentials: "include",
              body: formData,
            }
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
              userApplication: data.newApplication,
            }));
            useUserStore
              .getState()
              .updateApplicationStatus(false, data.newApplication._id);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          // ✅ fixed: wrapped in () not {}
          set((state) => ({
            ...state,
            loading: { ...state.loading, submitAppBtn: false },
          }));
        }
      },

      submitDeliveryAgentApplication: async (input) => {
        set((state) => ({
          ...state,
          loading: { ...state.loading, submitAppBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/application/delivery-agent/submit`,
            {
              method: "POST",
              credentials: "include",
              body: JSON.stringify(input),
              headers: {
                "Content-Type": "application/json",
              },
            }
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
              userApplication: data.newApplication,
            }));
            useUserStore
              .getState()
              .updateApplicationStatus(false, data.applicationId);
          }
          get().getUserApplicationDetails(data.applicationId);
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {

          set((state) => ({
            ...state,
            loading: { ...state.loading, submitAppBtn: false },
          }));
        }
      },

      getUserApplicationDetails: async (applicationId: string) => {

        set((state) => ({
          ...state,
          loading: { ...state.loading, pageLoad: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/application/${applicationId}/get`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set({ userApplication: data.application });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {

          set((state) => ({
            ...state,
            loading: { ...state.loading, pageLoad: false },
          }));
        }
      },

      getRestaurantApplications: async (page = 1, limit = 10, filters = {}) => {

        set((state) => ({
          ...state,
          loading: { ...state.loading, pageLoad: true },
        }));

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters?.foodType && { foodType: filters.foodType }),
          ...(filters?.sortBy && { sortBy: filters.sortBy }),
          ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
        });
        try {
          const res = await fetch(
            `${API_END_POINT}/application/restaurant/get/all?${params}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set((state) => ({
              ...state,
              restaurantApplications: data.applications,
              resAppPagination: {
                currentPage: page,
                totalPages: data.totalPages,
                totalCount: data.totalCount,
                limit,
              },
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            ...state,
            loading: { ...state.loading, pageLoad: false },
          }));
        }
      },

      getDeliveryAgentApplications: async (
        page = 1,
        limit = 10,
        filters = {}
      ) => {

        set((state) => ({
          ...state,
          loading: { ...state.loading, pageLoad: true },
        }));
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters?.vehicleType && { vehicleType: filters.vehicleType }),
          ...(filters?.sortBy && { sortBy: filters.sortBy }),
          ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
        });
        try {
          const res = await fetch(
            `${API_END_POINT}/application/delivery-agent/get/all?${params}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            set((state) => ({
              ...state,
              deliveryAgentApplications: data.applications,
              delAppPagination: {
                currentPage: page,
                totalPages: data.totalPages,
                totalCount: data.totalCount,
                limit,
              },
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {

          set((state) => ({
            ...state,
            loading: { ...state.loading, pageLoad: false },
          }));
        }
      },

      updateApplicationStatus: async (applicationId, status, reason) => {

        set((state) => ({
          ...state,
          loading: { ...state.loading, updateAppStatusBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/application/${applicationId}/status/update`,
            {
              method: "PUT",
              credentials: "include",
              body: JSON.stringify({ status: status, reason: reason }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
            if (data.updatedApplication.applicationType === "Restaurant") {
              set((state) => ({
                ...state,
                restaurantApplications: state.restaurantApplications.map(
                  (app) =>
                    app._id === applicationId ? data.updatedApplication : app
                ),
              }));
            } else {
              set((state) => ({
                ...state,
                deliveryAgentApplications:
                  state.deliveryAgentApplications.map((app) =>
                    app._id === applicationId ? data.updatedApplication : app
                  ),
              }));
            }
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {

          set((state) => ({
            ...state,
            loading: { ...state.loading, updateAppStatusBtn: false },
          }));
        }
      },

      makeApplicationDeletable: async (applicationId: string) => {

        set((state) => ({
          ...state,
          loading: { ...state.loading, makeAppDeletableBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/application/${applicationId}/deletable`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {

          set((state) => ({
            ...state,
            loading: { ...state.loading, makeAppDeletableBtn: false },
          }));
        }
      },

      deleteApplication: async (applicationId: string) => {

        set((state) => ({
          ...state,
          loading: { ...state.loading, deleteAppBtn: true },
        }));
        try {
          const res = await fetch(
            `${API_END_POINT}/application/${applicationId}/delete`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }
          if (data.success) {
            if (data.type === "restaurant") {
              set((state) => ({
                ...state,
                restaurantApplications: state.restaurantApplications.filter(
                  (app) => app._id !== applicationId
                ),
              }));
            } else {
              set((state) => ({
                ...state,
                deliveryAgentApplications:
                  state.deliveryAgentApplications.filter(
                    (app) => app._id !== applicationId
                  ),
              }));
            }
            return;
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {

          set((state) => ({
            ...state,
            loading: { ...state.loading, deleteAppBtn: false },
          }));
        }
      },

      resetStore: () => {
        set(() => ({
          loading: {
            submitAppBtn: false,
            updateAppStatusBtn: false,
            makeAppDeletableBtn: false,
            deleteAppBtn: false,
            pageLoad: false,
          },
          userApplication: null,
          restaurantApplications: [],
          deliveryAgentApplications: [],
          resAppPagination: null,
          delAppPagination: null,
        }));
      },
    }),
    {
      name: "application-name",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userApplication: state.userApplication,
        restaurantApplications: state.restaurantApplications,
        deliveryAgentApplications: state.deliveryAgentApplications,
        resAppPagination: state.resAppPagination,
        delAppPagination: state.delAppPagination,
      }),
    }
  )
);