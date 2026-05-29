import { CartItem } from "./cartType"
import { DeliveryAgentType } from "./deliveryAgentType"
import { PaginationType, RestaurantType } from "./restaurantType"
import { ILocation, UserRoleType, UserType } from "./userType"

export const agentAssignmentTypeOptions = [
   "Manual", "Fallback"
] as const

export type AgentAssignmentType = typeof agentAssignmentTypeOptions[number]


export type OrderDetails = {
    cart:CartItem[],
    deliveryDetails:{
       drop: ILocation;
    }
    restaurantId:string
}

export type Bill = {
    cartTotal:number
    shippingFee:number
    gstAmount:number
    grandTotal:number
    appFee:number
}
export type CancellationDetails = {
    userType:'Restaurant_Owner'|'Customer'| 'Delivery_Agent'
    cancelBy:string | UserType
    reason:string,
}

export const orderStatusOptions = [
  "Pending",
  "Placed",
  "Confirmed",
  "Preparing",
  "ReadyForPickup",
  "AcceptedByAgent",
  "OutForDelivery",
  "Delivered",
  "Canceled",
] as const

export type OrderStatus = typeof orderStatusOptions[number]

export type StatusDetails = {
    status:OrderStatus
    time:Date
}

export type ParcelOtp = {
  code: string;
  expiresAt: Date;
};
export type RatingDetails = {
    _id?:string
    restaurant:number
    deliveryAgent:number
    food:number
}


export interface OrderType{
    _id:string,
    user:Partial<UserType>,
    restaurant:Partial<RestaurantType>,
    cartItems:CartItem[]
    deliveryDetails:{
      pickup: ILocation;        // restaurant location snapshot
      drop: ILocation;          // user location snapshot
      distanceKm: number;
      estimatedTimeMin: number;
      parcelAcceptedOtp?: ParcelOtp;
      parcelDeliveredOtp?: ParcelOtp;
    }
    bill:Bill,
    isVerified:boolean
    statusDetails:StatusDetails[]
    currentStatus:OrderStatus
    razorpayOrderId?:string
    paymentId?:string
    cancellationDetails?:CancellationDetails
    deliveryAgent?:Partial<DeliveryAgentType>
    ratingDetails?:RatingDetails
    createdAt: Date;
    updatedAt: Date;
    agentAssignmentType:AgentAssignmentType
}

export type RatingData = {
  restaurantRating?: { [id: string]: number };
  dishRatings?: { [dishId: string]: number };
  deliveryAgentRating?: { [id: string]: number };
}
export type OrderLoadingState = {
  pageLoad:boolean
  cancelOrderBtn:boolean
  updateOrderStatusBtn:boolean
  generateOrderOtpBtn:boolean
  getSingleOrderDetails:boolean
  placeOrderBtn:boolean
  deletePendingOrderBtn:boolean
  setOrderRatingBtn:boolean
}

export type OrderState ={
    loading:OrderLoadingState
    singleOrder:OrderType|null
    ordersHistory:OrderType[]
    activeOrders:OrderType[]
    newOrderIds:string[]
    orderPagination:PaginationType|null
    
    //common
    getOrderHistory:(type:UserRoleType,id:string,page:number,limit:number,filter:any)=> Promise<void>
    getActiveOrders:(type:UserRoleType,id:string)=> Promise<void>
    cancelOrder:(orderId:string,reason:string)=> Promise<void>
    updateOrderStatus: (orderId: string, status: string,otp?:string) => Promise<boolean>;
    generateOrderOtp:(orderId:string,type:string)=> Promise<boolean>
    getSingleOrderDetails:(orderId:string)=> Promise<boolean>
    
    // customer
    placeOrder:(orderDetails:OrderDetails)=> Promise<{order:OrderType|null}>
    createCheckOutSession:(orderId:string)=> Promise<void>
    deletePendingOrder:(orderId:string)=> Promise<void>
    setOrderRating:(orderId:string,ratingData:RatingData)=> Promise<boolean>
    
    //restaurant
    
    
    //agent
    
    //admin

    // utitlity fn
    resetStore:()=> void
    clearNewOrderIds:()=> void
    addNewOrder:(orderId:string)=> void
    updateActiveOrder:(order: OrderType)=> void
    addActiveOrder:(order:OrderType)=> void
    removeActiveOrder:(id:string)=> void
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
