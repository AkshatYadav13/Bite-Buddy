import { Utensils} from 'lucide-react';
import RESTAURANT_DEFAULT_IMAGE from '@/assets/restaurant_default_image.jpg'
import { convertToIndianTime, toIndianDateFormat } from '@/lib/utils';
import { ActionButtons } from './ApplicationCard';
import { RestaurantApplication } from '@/types/applicationType';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/utilityComponents';

type RestaurantAppType = {
    restaurant: RestaurantApplication;
    onStatusUpdate?: (id: string, status: 'Approved' | 'Rejected', reason?: string) => void;
    showActions?: boolean;
}

const RestaurantAppCard = ({ restaurant, onStatusUpdate, showActions = true }:RestaurantAppType ) => {

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 p-2 sm:px-6 sm:py-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center gap-3 ">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Utensils className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {restaurant.restaurantDetails.restaurantName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restaurant Application</p>
            </div>
            {
              restaurant.isDeletable &&
              <Link className='rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105'  to={`/restaurant/owner/${restaurant.user._id}`}>
                <StatusBadge  status="Active" ></StatusBadge>
              </Link>
            }

          </div>
          <div className="flex items-center gap-x-3 w-full justify-end sm:w-fit">
            <StatusBadge status={restaurant.status} />
            {showActions && (
              <ActionButtons
                applicationId={restaurant._id}
                currentStatus={restaurant.status}
                onStatusUpdate={onStatusUpdate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Restaurant Image */}
          <div className="flex-shrink-0">
            <img
              src={restaurant.restaurantDetails.imageUrl || RESTAURANT_DEFAULT_IMAGE}
              alt={restaurant.restaurantDetails.restaurantName}
              className="w-full lg:w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
            />
          </div>

          {/* Details Grid */}
          <div className="flex-1">
            <div className="grid md:grid-cols-[25vw_auto] gap-5">
              <div className="border border-gray-200 dark:border-gray-600 p-3 rounded-lg ">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">User Information</h4>
                  <div className="text-sm my-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400">{restaurant.user.fullName}</span>
                  </div>
                  <div className="text-sm my-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400">{restaurant.user.email}</span>
                  </div>
                  <div className="text-sm my-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400">{restaurant.user.contact}</span>
                  </div>
                  <div className="text-sm my-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Applied: </span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400">{toIndianDateFormat(restaurant.createdAt!)}</span>
                  </div>
              </div>
              <div className="border  border-gray-200 dark:border-gray-600 p-3 rounded-lg w-full">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Restaurant Information</h4>
                <div className="grid sm:grid-cols-2 gap-y-2 sm:gap-y-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Serving Hours: </span>                
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {convertToIndianTime(restaurant.restaurantDetails.openingTime)} - {convertToIndianTime(restaurant.restaurantDetails.closingTime)}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Food Type:</span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400">{restaurant.restaurantDetails.foodType}</span>
                    </div>

                    <div className="">
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Cuisines:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {restaurant.restaurantDetails.cuisines?.map((cuisine, index) => (
                          <span
                            key={index+cuisine}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Address: </span>                
                      <span className="text-sm text-gray-700 dark:text-gray-300">{restaurant.restaurantDetails.location.address}</span>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Rejection Reason */}
        {restaurant.status === 'Rejected' && restaurant.reason && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"> 
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason:</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{restaurant.reason}</p>
          </div>
        )} 
      </div>
    </div>
  );
};


export default RestaurantAppCard