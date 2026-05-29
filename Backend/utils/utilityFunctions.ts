import { getUserSocketId, io } from "../socket_io/socket";

export function toCapitalize(word:string){
  return word.charAt(0).toUpperCase() + word.substring(1)
}

export function getAlphaNumericToken(length = 6){
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    let token = ""

    for(let i=0;i<length;i++){
        token += characters.charAt(Math.floor(Math.random()*characters.length))
    }
    return token
}


export function getOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); 
  }
  return otp;
}


export function formatCounts(arr: { _id: string; count: number }[]) {
  return arr.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {} as Record<string, number>);
}


export const buildSortQuery = (sortBy: string, sortOrder: string) => {
  const order = sortOrder === "asc" ? 1 : -1;

  switch (sortBy) {
    case "restaurantName":
      return { restaurantName: order };
    case "userName":
      return { "user.fullName": order };
    case "dishName":
      return { "name": order };
    case "orders":
      return { orderServed: order };
    case "rating":
      return { avgRating: order };
    case "totalDeliveries":
      return { totalDeliveries: order };
    case "unitSold":
      return { totalUnitsSold: order };
    case "createdAt":
    default:
      return { createdAt: order };
  }
};


// ORDERS
export type Area = {
  latitude: number;
  longitude: number;
};


function getDistance(loc1: Area, loc2: Area): number | null {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  if (!loc1 || !loc2) return null;

  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);

  const lat1 = toRad(loc1.latitude);
  const lat2 = toRad(loc2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getShippingDetails(
  from: Area,
  to: Area
): { distance: number; fee: number; time: number } {
  let distance = getDistance(from, to);

  if (distance === null) {
    distance = 10;
  }

  // minimum billable distance
  distance = Math.max(0.1, Number(distance.toFixed(1)));

  const base = 20;
  const perKmRate = 8;
  const fee = Math.ceil(base + distance * perKmRate);

  const speedKmPerHr = 40;
  const time = Math.max(1, Math.ceil((distance / speedKmPerHr) * 60));

  return { distance, fee, time };
}




export function emitToUser(userId: string, event: string, payload: any) {
  const socketId = getUserSocketId(userId);
  if (socketId) {
    io.to(socketId).emit(event, payload);
  } else {
    console.warn(`⚠️ No socket found for userId: ${userId}`);
  }
}

export function daysAgo(n:number){
  return new Date(Date.now() - n*24*60*60*1000)
}

export function calculateTrend(current:number,previous:number):{trend:string,trendValue:string}{
  if(previous === 0) return {trend:"up",trendValue:"+100% from last month"}

  const diff = ((current - previous)/previous)*100
  return{
    trend:diff >= 0 ? "up":"down",
    trendValue:`${diff>=0 ? '+':""}${diff.toFixed(1)}% from last month`
  }
}


