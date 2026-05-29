import { PaginationType } from "./restaurantType";

export type TransactionUserType = "Customer" | "Restaurant" | "Delivery";
export type TransactionStatus = "Pending" | "Paid";

export type TransactionReason = "Order_Delivered" | "Order_Cancel_Refund";

export interface TransactionType {
  _id: string;
  userId: any;
  userType: TransactionUserType;

  orderId: string;

  amount: number;

  reason: TransactionReason;

  status: TransactionStatus;

  recievedAt: string;
  paidAt?: string;
  createdAt: string;
}

export type TransactionFilterType = {
  searchQuery: string;
  dateRange: string;
  customDateFrom: string;
  customDateTo: string;
  status: string;
  userType: string;
  reason: string;
  minAmount: string;
  maxAmount: string;
  orderId: string;
  userId: string;
};

export type TransactionStats = {
  total: {
    pendingAmt: number;
    paidAmt: number;
    pendingCount: number;
    paidCount: number;
  };
};
export type TransactionLoadingType = {
  getAllTransactions: boolean;
  getTransactionsStats: boolean;
  markTransactionPaidBtn: boolean;
};
export type TransactionsDataType = {
  summary: {
    pendingAmt: number;
    paidAmt: number;
    pendingCount: number;
    paidCount: number;
  };
  list: TransactionType[];
};

export type TransactionState = {
  loading: TransactionLoadingType;
  transactionsData: TransactionsDataType | null
  transactionStats: TransactionStats | null;
  transactionPagination: PaginationType | null;

  getAllTransactions: (
    type: string,
    targetId: string,
    page: number,
    limit: number,
    filter?: TransactionFilterType,
  ) => Promise<void>;
  markTransactionPaid: (id: string) => Promise<void>;
  updateTransaction: (data: TransactionType) => void;
};
