import { API_END_POINT } from "@/lib/constants";
import { TransactionState } from "@/types/transactionType";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactionsData: null,
      loading: {
        getAllTransactions: false,
        getTransactionsStats: false,
        markTransactionPaidBtn: false,
      },
      transactionPagination: null,
      transactionStats: null,

      getAllTransactions: async (
        type,
        targetId,
        page = 1,
        limit = 10,
        filters,
      ) => {
        set((state) => ({
          ...state,
          loading: { ...state.loading, getAllTransactions: true },
        }));
        try {
          const params = new URLSearchParams();

          params.set("page", page.toString());
          params.set("limit", limit.toString());
          params.set("type", type.toString());
          params.set("targetId", targetId.toString());

          if (filters?.searchQuery) params.set("search", filters.searchQuery);
          if (filters?.dateRange) params.set("dateRange", filters.dateRange);
          if (filters?.customDateFrom)
            params.set("customDateFrom", filters.customDateFrom);
          if (filters?.customDateTo)
            params.set("customDateTo", filters.customDateTo);
          if (filters?.status) params.set("status", filters.status);
          if (filters?.userType) params.set("userType", filters.userType);
          if (filters?.reason) params.set("reason", filters.reason);
          if (filters?.orderId) params.set("orderId", filters.orderId);
          if (filters?.userId) params.set("userId", filters.userId);
          if (filters?.minAmount) params.set("minAmount", filters.minAmount);
          if (filters?.maxAmount) params.set("maxAmount", filters.maxAmount);

          const res = await fetch(
            `${API_END_POINT}/transaction/get/all?${params}`,
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
              transactionsData: data.transactionsData,
              transactionPagination: data.pagination,
            }));
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            ...state,
            loading: { ...state.loading, getAllTransactions: false },
          }));
        }
      },
      
      markTransactionPaid: async (transactionId: string) => {
        set((state) => ({
          ...state,
          loading: { ...state.loading, markTransactionPaidBtn: true },
        }));
        try {
          let res = await fetch(
            `${API_END_POINT}/transaction/admin/markPaid/${transactionId}`,
            {
              method: "PATCH",
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
            get().updateTransaction(data.updatedData);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unexpected error occured, try again later");
        } finally {
          set((state) => ({
            ...state,
            loading: { ...state.loading, markTransactionPaidBtn: false },
          }));
        }
      },

      updateTransaction: (updateData) => {
        set((state) => {
          if (!state.transactionsData) return state;

          return {
            transactionsData: {
              ...state.transactionsData,
              list: state.transactionsData.list.map((t) =>
                t._id === updateData._id ? updateData : t,
              ),
            },
          };
        });
      },
    }),
    {
      name: "transaction-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactionsData: state.transactionsData,
        transactionPagination: state.transactionPagination,
        transactionStats: state.transactionStats,
      }),
    },
  ),
);
