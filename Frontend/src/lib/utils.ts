import { OrderStatus, OrderType } from "@/types/orderTypes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { statusFlow } from "./constants";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import { GeoCoordsType } from "@/types/deliveryAgentType";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toIndianDateFormat(DBdate: string) {
  const date = new Date(DBdate);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-IN", options);
}

export function convertToIndianTime(time24: string): string {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  const hourFormatted = hour.toString().padStart(2, "0");
  const minuteFormatted = minute.toString().padStart(2, "0");

  return `${hourFormatted}:${minuteFormatted}${ampm.toLowerCase()}`;
}

export const getRatingColor = (rating: number) => {
  if (rating >= 4.0) return "text-green-600 bg-green-50";
  if (rating >= 3.0) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

export function getStatusCountMap(orders: OrderType[]): Record<string, number> {
  return orders.reduce(
    (acc, order) => {
      acc[order.currentStatus] = (acc[order.currentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getMonthName = (monthNum: number) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthNum - 1];
};

export function getOrderNextStatus(currentStatus: OrderStatus) {
  const index = statusFlow.indexOf(currentStatus);
  return index >= 0 && index < statusFlow.length - 1
    ? statusFlow[index + 1]
    : null;
}

export function getCartTotal() {
  const { cart } = useCartStore();

  return cart.reduce(
    (acc, item) => (acc += item.sellingPrice * item.quantity),
    0,
  );
}

export function hasDataChanged(
  currentData: any,
  savedData: any,
  imageKey?: string,
): boolean {
  if (!currentData || !savedData) return false;
  for (const key in currentData) {
    const currentVal = currentData[key];
    let savedVal = savedData[key];

    if (key === imageKey) {
      if (currentVal && currentVal instanceof File) return true;
      continue;
    }
    if (Array.isArray(savedVal)) {
      if (!areSameArrays(savedVal, currentVal.split(","))) return true;
    } else if (savedVal !== currentVal) return true;
  }
  return false;
}

function areSameArrays(a: any[], b: any[]) {
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return (
    sortedA.length === sortedB.length &&
    sortedA.every((val, i) => val === sortedB[i])
  );
}

export function getDistance(
  loc1: GeoCoordsType,
  loc2: GeoCoordsType,
): number {
  const R = 6371; // Radius of Earth in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);

  const lat1 = toRad(loc1.latitude);
  const lat2 = toRad(loc2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Return distance in km
}

export function isFilterSelected(appliedFilter: any, defaultFilters: any) {
  for (let key of Object.keys(defaultFilters) as (keyof any)[]) {
    if (appliedFilter[key] !== defaultFilters[key]) return true;
  }
  return false;
}

export function getTargetId() {
  const { user } = useUserStore();
  const { userRestaurant } = useRestaurantStore();
  const { deliveryAgentDetails } = useDeliveryAgentStore();

  if (!user) return null;

  switch (user.role) {
    case "Restaurant_Owner":
      return userRestaurant?._id ?? null;

    case "Delivery_Agent":
      return deliveryAgentDetails?._id ?? null;

    case "Customer":
    case "Admin":
      return user._id;

    default:
      return null;
  }
}




type GeoError = GeolocationPositionError;

export const getGeoCoords = (): Promise<GeoCoordsType | null> => {
  if (!navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (_: GeoError) => {
        // silent fail – caller decides fallback
        resolve(null);
      },
      {
        enableHighAccuracy: true,  // get a real GPS fix, not a coarse cached one
        timeout: 15000,
        maximumAge: 5000,          // allow at most 5s old cached position (was 60s!)
      }
    );
  });
};
