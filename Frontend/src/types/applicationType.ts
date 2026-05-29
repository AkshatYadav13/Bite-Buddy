import { FoodType, PaginationType, RestaurantType } from "@/types/restaurantType";
import { ILocation, UserType } from "@/types/userType";



export type ApplicationType = 'Delivery_Agent' | 'Restaurant';
export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

interface BaseApplication {
  _id: string;
  applicationType:ApplicationType
  user: Partial<UserType>;
  status: ApplicationStatus;
  reviewedAt?: Date;
  reason?: string;
  createdAt:string,
  updatedAt:string,
  isDeletable:boolean
}

export interface RestaurantApplication extends BaseApplication {
  restaurantDetails:{
    _id:string
    restaurantName: string;
    address: string;
    area: string;
    cuisines: string[];
    imageUrl: string;
    foodType: FoodType;
    openingTime: string;
    closingTime: string;
    location: ILocation;
  }
}

export interface DeliveryApplication extends BaseApplication {
  deliveryAgentDetails:{
    licenseNumber: string;
    vehicleType: string;
    vehicleNumber: string;
    preferredRestaurants:RestaurantType[]
  }
}
export type ApplicationLoading = {
  pageLoad:boolean
  updateAppStatusBtn:boolean
  deleteAppBtn:boolean
  submitAppBtn:boolean
  makeAppDeletableBtn:boolean
}

export type ApplicationState = {
    loading:ApplicationLoading
    userApplication:RestaurantApplication|DeliveryApplication | null
    restaurantApplications:RestaurantApplication[]
    resAppPagination:PaginationType |null;

    deliveryAgentApplications:DeliveryApplication[]
    delAppPagination:PaginationType | null, 
    
    getRestaurantApplications:(page:number,limit:number,filters?:any)=> Promise<void>
    getDeliveryAgentApplications:(page:number,limit:number,filters?:any)=> Promise<void>    
    getUserApplicationDetails:(id:string)=>Promise<void>
    
    updateApplicationStatus:(applicationId:string,status:string,reason?:string)=> Promise<void>
    deleteApplication:(appId:string)=> Promise<void>
    submitRestaurantApplication:(formData:FormData)=>Promise<void>
    submitDeliveryAgentApplication:(input:any)=>Promise<void>
    makeApplicationDeletable:(appId:string)=>Promise<void>
    resetStore:()=> void
}
