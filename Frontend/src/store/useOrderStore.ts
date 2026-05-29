import {
  OrderDetails,
  OrderState,
  OrderType,
  RatingData,
} from "@/types/orderTypes";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_END_POINT } from "@/lib/constants";
import { useDeliveryAgentStore } from "./useDeliveryAgentStore";

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      loading: {
        pageLoad: false,
        cancelOrderBtn: false,
        updateOrderStatusBtn: false,
        generateOrderOtpBtn: false,
        getSingleOrderDetails: false,
        placeOrderBtn: false,
        deletePendingOrderBtn: false,
        setOrderRatingBtn: false,
      },
      activeOrders: [],
      singleOrder: null,
      ordersHistory: [],
      orderPagination: null,
      newOrderIds: [],

      //common

      getOrderHistory: async (type, id, page = 1, limit = 10, filters) => {
        set({ loading: { ...get().loading, pageLoad: true } });

        const params = new URLSearchParams({
          type: type.toString(),
          id: id.toString(),
          page: page.toString(),
          limit: limit.toString(),

          ...(filters.search && { search: filters.search }),
          ...(filters?.sortBy && { sortBy: filters.sortBy }),
          ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
          ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
          ...(filters?.dateTo && { dateTo: filters.dateTo }),
          ...(filters?.minAmount && { minAmount: filters.minAmount }),
          ...(filters?.maxAmount && { maxAmount: filters.maxAmount }),
        });

        try {
          const res = await fetch(
            `${API_END_POINT}/order/get/orders/history?${params}`,
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
              ordersHistory: data.ordersHistory,
              orderPagination: data.pagination,
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, pageLoad: false } });
        }
      },

      getActiveOrders: async (type, id) => {
        set({ loading: { ...get().loading, pageLoad: true } });
        try {
          const res = await fetch(
            `${API_END_POINT}/order/get/orders/active/${type}/${id}`,
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
            set({ activeOrders: data.activeOrders });
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, pageLoad: false } });
        }
      },

      cancelOrder: async (orderId: string, reason: string) => {
        set({ loading: { ...get().loading, cancelOrderBtn: true } });
        try {
          const res = await fetch(`${API_END_POINT}/order/cancel/${orderId}`, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ reason }),
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
            get().updateActiveOrder(data.updatedOrder);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set({ loading: { ...get().loading, cancelOrderBtn: false } });
        }
      },

      updateOrderStatus: async (
        orderId: string,
        status: string,
        otp?: string,
      ) => {
        set({ loading: { ...get().loading, updateOrderStatusBtn: true } });
        try {
          const res = await fetch(
            `${API_END_POINT}/order/${orderId}/update/status`,
            {
              method: "PUT",
              credentials: "include",
              body: JSON.stringify({ status, inpParcelOtp: otp }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return false;
          }
          if (data.success) {
            toast.success(data.message);
            get().updateActiveOrder(data.updatedOrder);
            if (status === "Delivered") {
              get().removeActiveOrder(data.updatedOrder._id);
            }
            return true;
          }
          return false;
        } catch (error) {
          toast.error("Unexpected error occured, try again later");
          return false;
        } finally {
          set({ loading: { ...get().loading, updateOrderStatusBtn: false } });
        }
      },

      generateOrderOtp: async (orderId: string, type: string) => {
        set({ loading: { ...get().loading, generateOrderOtpBtn: true } });

        try {
          const res = await fetch(
            `${API_END_POINT}/order/${orderId}/generate/parcelOtp/${type}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return false;
          }
          if (data.success) {
            toast.success(data.message);
            get().updateActiveOrder(data.updatedOrder);
            return true;
          }

          return false;
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
          return false;
        } finally {
          set({ loading: { ...get().loading, generateOrderOtpBtn: false } });
        }
      },

      getSingleOrderDetails: async (orderId: string) => {
        set({ loading: { ...get().loading, getSingleOrderDetails: true } });
        try {
          const res = await fetch(`${API_END_POINT}/order/get/${orderId}`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return false;
          }
          if (data.success) {
            set((state) => ({
              ...state,
              singleOrder: data.order,
            }));
          }
          return true;
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
          return false;
        } finally {
          set({ loading: { ...get().loading, getSingleOrderDetails: false } });
        }
      },

      // customer

      placeOrder: async (orderDetails: OrderDetails) => {
        set({ loading: { ...get().loading, placeOrderBtn: true } });
        try {
          const res = await fetch(`${API_END_POINT}/order/place`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ orderDetails }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return { order: null };
          }
          if (data.success) {
            get().addActiveOrder(data.newOrder);
            return { order: data.newOrder };
          } else {
            toast.error(data.message || "Failed to place order");
            return { order: null };
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
          return { order: null };
        } finally {
          set({ loading: { ...get().loading, placeOrderBtn: false } });
        }
      },

      createCheckOutSession: async (orderId: string) => {
        set({ loading: { ...get().loading, pageLoad: true } });
        try {
          const res1 = await fetch(`${API_END_POINT}/order/razorpay-key/get`, {
            method: "GET",
            credentials: "include",
          });
          const data1 = await res1.json();
          const razorpayKey = data1.key;

          const res = await fetch(
            `${API_END_POINT}/order/${orderId}/checkout/create-session`,
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
            const { razorpayOrderId, order } = data;

            // Open Razorpay Checkout
            const options = {
              key: razorpayKey,
              amount: Number(order.bill.grandTotal * 100),
              currency: "INR",
              name: "Bite Buddy",
              description: "Bite Buddy payment session",
              order_id: razorpayOrderId,
              callback_url: `${API_END_POINT}/order/payment-verification`,
              prefill: {
                name: order.user.fullName,
                email: order.user.email,
                contact: order.user.contact,
              },
              theme: {
                color: "#F37254",
              },
              method: {
                upi: true,
                card: true,
                netbanking: true,
                wallet: true,
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
          }
        } catch (error) {
          console.log(error);
        } finally {
          set({ loading: { ...get().loading, pageLoad: false } });
        }
      },

      deletePendingOrder: async (orderId: string) => {
        set({ loading: { ...get().loading, deletePendingOrderBtn: true } });
        if (!orderId) return;
        try {
          const res = await fetch(
            `${API_END_POINT}/order/pending/delete/${orderId}`,
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
            get().removeActiveOrder(orderId);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            loading: { ...state.loading, deletePendingOrderBtn: false },
          }));
        }
      },

      setOrderRating: async (orderId: string, ratingData: RatingData) => {
        set({ loading: { ...get().loading, setOrderRatingBtn: true } });
        try {
          const res = await fetch(
            `${API_END_POINT}/order/${orderId}/rating/set`,
            {
              method: "PUT",
              credentials: "include",
              body: JSON.stringify({ ratingData }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return false;
          }
          if (data.success) {
            toast.success(data.message);
            const updatedOrders = get().activeOrders.map((order) =>
              order._id === orderId
                ? { ...order, ratingDetails: data.ratingDetails }
                : order,
            ) as OrderType[];

            set({ activeOrders: updatedOrders });
            return true;
          }
          return false;
        } catch (error) {
          toast.error("Unexpected error occured, try again later");
          return false;
        } finally {
          set((state) => ({
            loading: { ...state.loading, setOrderRatingBtn: false },
          }));
        }
      },

      // restaurant

      // agent

      //admin

      // utility fn
      clearNewOrderIds: () => set({ newOrderIds: [] }),

      addNewOrder: (id) =>
        set((state) =>
          state.newOrderIds.includes(id)
            ? state
            : { newOrderIds: [...state.newOrderIds, id] },
        ),

      updateActiveOrder: (updatedOrder: OrderType) =>
        set((state) => ({
          activeOrders: state.activeOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order,
          ),
        })),

      removeActiveOrder: (orderId: string) =>
        set((state) => {
          const updatedActiveOrders = state.activeOrders.filter(
            (order) => order._id !== orderId,
          );

          if (updatedActiveOrders.length === 0) {
            useDeliveryAgentStore.getState().updateAgentStatus("Available");
          }

          return {
            activeOrders: updatedActiveOrders,
          };
        }),

      addActiveOrder: (newOrder: OrderType) => {
        set((state) => ({
          activeOrders: [newOrder, ...state.activeOrders],
        }));
      },

      resetStore: () => {
        set({
          loading: {
            pageLoad: false,
            cancelOrderBtn: false,
            updateOrderStatusBtn: false,
            generateOrderOtpBtn: false,
            getSingleOrderDetails: false,
            placeOrderBtn: false,
            deletePendingOrderBtn: false,
            setOrderRatingBtn: false,
          },
          activeOrders: [],
          ordersHistory: [],
          orderPagination: null,
          singleOrder: null,
          newOrderIds: [],
        });
      },
    }),
    {
      name: "order-name",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeOrders: state.activeOrders,
        ordersHistory: state.ordersHistory,
        orderPagination: state.orderPagination,
        singleOrder: state.singleOrder,
        newOrderIds: state.newOrderIds,
      }),
    },
  ),
);
