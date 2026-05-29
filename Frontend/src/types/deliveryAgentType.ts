import { OrderType } from "./orderTypes";
import { PaginationType, RestaurantType } from "./restaurantType";
import { ILocation, UserType } from "./userType";

export const agentStatusOptions = [
  "Offline",
  "Available",
  "OnDelivery",
] as const;

export type AgentStatusType = (typeof agentStatusOptions)[number];

export const vehicleTypeOptions = ["Bike", "Scooter", "Bicycle"] as const;

export type VehicleType = (typeof vehicleTypeOptions)[number];


export type GeoCoordsType = {
  latitude: number;
  longitude: number;
};


export interface DeliveryAgentType {
  _id: string;
  user: Partial<UserType>;
  vehicleType: VehicleType;
  licenseNumber: string;
  vehicleNumber: string;
  status: AgentStatusType;
  ratingCount: number;
  ratingTotal: number;
  avgRating: number;
  totalDeliveries: number;
  lastLocation: GeoCoordsType;
  lastLocationUpdatedAt: Date;
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
  preferredRestaurants: RestaurantType[];
}

export type AgentStatsTypes = {
  profile: {
    agentId: string;
    status: AgentStatusType;
    vehicle: {
      type: VehicleType;
      number: string;
      licenseNumber: string;
    };
    joinedAt: string;
    totalWorkingDays: string;
    rating: {
      avg: number;
      count: number;
    };
  };

  earnings: {
    summary: {
      today: number;
      thisWeek: number;
      thisMonth: number;
      total: number;
      avgPerDelivery: number;
    };
    weeklyEarnings: { day: string; earnings: number }[];
  };

  ordersAnalytics: {
    orderCount: {
      assignedManual: number;
      assignedFallback: number;
      total: number;
    };

    totalDelivered: number;
    totalCanceled: number;
    activeOrders: number;

    avgDeliveryTimeMin: number;

    distance: {
      totalKm: number;
      avgKm: number;
    };
  };

  performance: {
    ratingDistribution: { rating: number; count: number }[];
  };

  preferredAreas: {
    topAreas: {
      area: string;
      deliveries: number;
    }[];
  };
};


export type DeliveryAgentLoadingState = {
  pageLoading: boolean;
  registerDeliveryAgentBtn: boolean;
  acceptOrderBtn: boolean;
  getDeliveryAgentDetails: boolean;
  getDeliveryAgentStats: boolean;
}

export type DeliveryAgentState = {
  loading: DeliveryAgentLoadingState;
  deliveryAgentDetails: DeliveryAgentType | null;
  deliveryAgents: DeliveryAgentType[];
  deliveryAgentPagination: PaginationType | null;
  agentStats: AgentStatsTypes | null;
  optimalRestaurants: RestaurantType[];
  pickupOrders:OrderType[]

  registerDeliveryAgent: (
    applicationId: string,
    input: ILocation,
  ) => Promise<void>;
  getDeliveryAgents: (
    page: number,
    limit: number,
    filter: any,
  ) => Promise<void>;
  getPickupOrdersForAgents: () => Promise<void>;
  acceptOrder: (orderId: string,navigate:any) => Promise<void>;
  getDeliveryAgentDetails: () => Promise<void>;
  getDeliveryAgentStats: () => Promise<void>;
  updateAgentLocation: (location:GeoCoordsType) => Promise<void>;
  getOptimalRestaurantsForAgent: (lat: string, lng: string) => Promise<void>; // within 5km acc to agent location
  
  // utility functions
  clearPickUpOrders:()=> void
  updateAgentStatus:(status:AgentStatusType)=> void

  resetStore: () => void;
};
