import { TransactionStatus, TransactionUserType } from "./transactionType";

type MonthlyTrend = {
  _id: { month: number; year: number };
  count: number;
};
type StatusCount = Record<string, number>;

export type StatusStats = {
  amount: number;
  count: number;
};

export type TstatsSummary = {
  [key in TransactionUserType]: {
    [key in TransactionStatus]: StatusStats;
  };
};

export type AdminTransactionStats = {
  summary: TstatsSummary;
  total: {
    pendingAmt: number;
    paidAmt: number;
    pendingCount:number
    paidCount:number
    activeSettlementsCount: number;
  };
};


type RoleCount = Record<string, number>;

export interface AdminStats {
  users: {
    total: number;
    activeLast30Days: number;
    roles: RoleCount;
    trend: "up" | "down";
    trendValue: number;
  };
  orders: {
    total: number;
    status: StatusCount;
    monthlyTrend: MonthlyTrend[];
    trend: "up" | "down";
    trendValue: number;
  };
  restaurants: {
    total: number;
    avgRating: number;
    trend: "up" | "down";
    trendValue: number;
    topRated: {
      restaurantName: string;
      ratingTotal: number;
    }[];
  };
  deliveryAgents: {
    total: number;
    online: number;
    avgRating: number;
  };
  dishes: {
    total: number;
    available: number;
    unAvailable: number;
  };
  restaurantApplications: {
    total: number;
    status: StatusCount;
  };
  deliveryAgentApplications: {
    total: number;
    status: StatusCount;
  };
  financials: {
    revenue: number;
    platformRevenue: {
      orderMargin: number;
      totalAppFee: number;
      total: number;
    };
    grossMargin: number;
    trend: "up" | "down";
    trendValue: number;
    restaurantRevenue: number;
    deliveryRevenue: number;
    gstCollected: number;
    costOfGoods: number;
  },
  transactionStats:AdminTransactionStats
}


export type AdminState = {
  loading: boolean;
  stats: AdminStats | null;

  getAdminStats: () => Promise<void>;
  resetStore: () => void;
};
