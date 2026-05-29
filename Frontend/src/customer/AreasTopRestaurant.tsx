import { useState, useEffect, KeyboardEvent } from "react";
import { ChefHat, Loader2, Award, Send, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { RestaurantCard } from "../components/shared/RestaurantCard";
import { CardSkeletonPage, EmptyState } from "../components/shared/utilityComponents";
import { Button } from "../components/ui/button";

const getRankIcon = (index: number) => {
  const icons = ["🥇", "🥈", "🥉"];
  return icons[index] || "🏆";
};

const getRankColor = (index: number) => {
  const colors = [
    "bg-gradient-to-r from-yellow-400 to-yellow-600",
    "bg-gradient-to-r from-gray-300 to-gray-500",
    "bg-gradient-to-r from-orange-400 to-orange-600",
  ];
  return colors[index] || "bg-gradient-to-r from-blue-400 to-blue-600";
};

const AreasTopRestaurants = () => {
  const { areasTopRestaurants, getAreasTopRestaurants, loading, clearAreaTopRestaurants } =
    useRestaurantStore();

  const [searchText, setSearchText] = useState<string>("");

  // Initialize search text from store on mount
  useEffect(() => {
    if (areasTopRestaurants?.area) {
      setSearchText(areasTopRestaurants.area);
    }
  }, [areasTopRestaurants?.area]);

  const handleSearch = () => {
    const trimmedText = searchText.trim();
    if (trimmedText) {
      getAreasTopRestaurants(trimmedText);
    }
  };

  const handleClear = () => {
    setSearchText("");
    clearAreaTopRestaurants();
  };

  const keyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      handleClear();
    }
  };

  const calculateAverageRating = () => {
    if (!areasTopRestaurants?.topRestaurants?.length) return 0;
    
    const sum = areasTopRestaurants.topRestaurants.reduce(
      (total, r) => total + (r?.avgRating || 0),
      0
    );
    return (sum / areasTopRestaurants.topRestaurants.length).toFixed(1);
  };

  if (loading.pageLoad && !areasTopRestaurants) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">
                Loading top restaurants...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-input/110 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Top Restaurants by Area
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the highest-rated restaurants in your preferred area.
            Search for an area to view the top 3 restaurants based on customer
            ratings.
          </p>
        </div>

        <div className="mx-auto max-w-2xl relative flex items-center border border-gray-300 dark:border-gray-600 rounded-3xl px-2 py-1 sm:px-3 sm:py-0 bg-white dark:bg-gray-800 shadow-sm">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 sm:ml-3" />

          <input
            type="text"
            className="flex-1 text-sm sm:text-lg pl-2 sm:pl-3 pr-12 sm:pr-14 py-2 sm:py-2 border-0 bg-transparent placeholder:text-gray-400 dark:text-white focus:ring-0 focus:outline-none"
            placeholder="Search restaurants by area..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={keyDownHandler}
          />

          {searchText && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-12 h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="absolute right-2 h-9 w-9 sm:h-8 sm:w-8 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full shadow-md transition-all duration-200 active:scale-95"
                onClick={handleSearch}
                disabled={!searchText.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {loading.pageLoad ? (
          <div className="mt-8">
            <CardSkeletonPage />
          </div>
        ) : !areasTopRestaurants || !areasTopRestaurants.topRestaurants?.length ? (
          <div className="pt-10">
            <EmptyState
              title="No Restaurants Found"
              message={searchText ? `No top restaurants found in "${searchText}". Try searching for a different area.` : "Enter an area name to discover top-rated restaurants."}
              icon={<ChefHat size={48} className="text-gray-500" />}
              showBtn={false}
            />
          </div>
        ) : (
          <div className="space-y-6 mt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Top Restaurants in {areasTopRestaurants.area || searchText}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Ranked by average customer ratings
              </p>
            </div>

            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {areasTopRestaurants.topRestaurants.map((restaurant, index) => (
                <div className="relative pt-8" key={restaurant._id}>
                  <div
                    className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full ${getRankColor(
                      index
                    )} flex items-center justify-center text-white font-bold shadow-lg z-10`}
                  >
                    <span className="text-xl">{getRankIcon(index)}</span>
                  </div>
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>

            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {areasTopRestaurants.topRestaurants.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Top Restaurants
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {calculateAverageRating()}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Average Rating
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {areasTopRestaurants.area || searchText}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Selected Area
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreasTopRestaurants;