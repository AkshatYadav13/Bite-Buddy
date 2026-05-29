import { useEffect, useState } from 'react';
import { Utensils, ChefHat} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { RestaurantCard } from '../components/shared/RestaurantCard';
import { DishCard } from '../components/shared/DishCard';
import { CardSkeletonPage, TabButton } from '../components/shared/utilityComponents';

const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState('restaurants');
  const {user,userFavoriteDishes,userFavoriteRestaurants,getUserFavorites,loading} = useUserStore()

  useEffect(()=>{
    if(!userFavoriteDishes || !userFavoriteRestaurants){
      getUserFavorites()  
    }
  },[])

  return (
    <div className={`min-h-screen transition-colors duration-300  dark:bg-input/110 bg-gray-50`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">My Favorites</h1>
              <p className="text-gray-600 dark:text-gray-400">Your saved restaurants and dishes</p>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex gap-0">
            <TabButton
              id="restaurants"
              label="Restaurants"
              icon={Utensils}
              isActive={activeTab === 'restaurants'}
              onClick={setActiveTab}
            />
            <TabButton
              id="dishes"
              label="Dishes"
              icon={ChefHat}
              isActive={activeTab === 'dishes'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === 'restaurants' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Favorite Restaurants ({user?.favoriteRestaurants.length})
                </h2>
              </div>
              {
                loading.pageLoad ?
                  <CardSkeletonPage></CardSkeletonPage>
                :
                userFavoriteRestaurants?.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No favorite restaurants yet</h3>
                    <p className="text-gray-400 dark:text-gray-500">Start exploring and save your favorite restaurants!</p>
                  </div>
                )
                :
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userFavoriteRestaurants?.map(restaurant => (
                    <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                  ))}
                </div>
              }
            </div>
          )}

          {activeTab === 'dishes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Favorite Dishes ({userFavoriteDishes.length})
                </h2>
              </div>
              {
                loading.pageLoad ?
                <CardSkeletonPage></CardSkeletonPage>
                :
                userFavoriteDishes.length === 0 ? (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No favorite dishes yet</h3>
                    <p className="text-gray-400 dark:text-gray-500">Start exploring and save your favorite dishes!</p>
                  </div>
                ):
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userFavoriteDishes.map(dish => (
                  <DishCard key={dish._id} dish={dish} />
                ))}
              </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;