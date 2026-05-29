export const PORT = '8000'
export const API_END_POINT = `http://localhost:8000/api/v1`
export const REVERSE_GEOCODE_API = `https://api.geoapify.com/v1/geocode/reverse` // gives address by lat,lng
export const FORWARD_GEOCODE_API = `https://api.geoapify.com/v1/geocode/search` // gives lat,lng by address
export const OTP_RADIUS_KM = 2; // 1km 

export const statusFlow = [
  "Pending",
  "Placed",
  "Confirmed",
  "Preparing",
  "ReadyForPickup",
  "AcceptedByAgent",
  "OutForDelivery",
  "Delivered",
]
