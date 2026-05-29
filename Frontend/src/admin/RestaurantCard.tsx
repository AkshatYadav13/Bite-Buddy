import RESTAURANT_DEFAULT_IMAGE from '@/assets/restaurant_default_image.jpg';
import { StatusBadge } from '@/components/shared/utilityComponents';
import { convertToIndianTime, toIndianDateFormat } from "@/lib/utils";
import { RestaurantType } from "@/types/restaurantType";
import { UserType } from '@/types/userType';
import { ChevronDown, ChevronUp, Eye, Star, Clock, MapPin, User, ChefHat, Calendar, TrendingUp } from "lucide-react";
import { Link } from 'react-router-dom';


type RestaurantCardProps = {
  restaurant:RestaurantType,
  expandedRow:string | null,
  toggleRowExpansion:(id:string)=> void
}

const RestaurantCard = ({restaurant,expandedRow,toggleRowExpansion}:RestaurantCardProps)=>{
  const userDetails = restaurant.user as UserType

  return(
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">

        {/* Main Restaurant Info */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Restaurant Image */}
            <div className="flex-shrink-0">
              <img
                src={restaurant.imageUrl || RESTAURANT_DEFAULT_IMAGE}
                alt={restaurant.restaurantName}
                className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
              />
            </div>
            {/* Main Info */}
            <div className="flex-grow space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{restaurant.restaurantName}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex gap-1">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="">{restaurant.location.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="text-nowrap" >{userDetails?.fullName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-4">
                  {
                    restaurant.isActive &&(
                    <Link className='rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105'  to={`/restaurant/id/${restaurant._id}`}>
                      <StatusBadge  status="Active" ></StatusBadge>
                    </Link>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${restaurant.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      restaurant.status === 'Closed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                    {restaurant.status}
                  </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {toIndianDateFormat(restaurant.createdAt).split(',')[0]}
                  </div>
                </div>
              </div>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
                    <Star className="h-4 w-4" />
                  </div>
                  {
                    restaurant.avgRating > 0 &&
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {restaurant.avgRating}
                    </div>
                  }
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {restaurant.ratingCount > 0 ? `${restaurant.ratingCount} reviews` : 'No reviews'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                    <ChefHat className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{restaurant.totalDishes || 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Dishes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{restaurant.orderPlaced || 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Orders Placed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 mb-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{restaurant.orderServed || 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Orders Served</div>
                </div>
              </div>
              {/* View Details Button */}
              <button
                onClick={() => toggleRowExpansion(restaurant._id)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
                {expandedRow === restaurant._id ?
                  <ChevronUp className="h-4 w-4" /> :
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
        </div>
        {/* Expanded Details */}
        {expandedRow === restaurant._id && (
          <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-6">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Name:</span> {userDetails.fullName}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Email:</span> {userDetails.email}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Contact:</span> {userDetails.contact}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Food Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Food Type:</span> {restaurant.foodType}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Cuisines:</span> {restaurant.cuisines?.join(', ') || 'N/A'}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Operating Hours</h4>
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {convertToIndianTime(restaurant.openingTime)} - {convertToIndianTime(restaurant.closingTime)}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Success Rate:</span> {restaurant.orderPlaced > 0 ? ((restaurant.orderServed / restaurant.orderPlaced) * 100).toFixed(1) : 0}%
                  </div>
                  {
                    restaurant.avgRating &&
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Avg Rating: </span>{restaurant.avgRating}
                    </div>
                  }
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
  )
}

export default RestaurantCard