import { KeyboardEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FilterBox from "./FilterBox";
import { Input } from "./ui/input";
import { Building, Search, Send, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { RestaurantType } from "@/types/restaurantType";
import { CardSkeletonPage, EmptyState } from "./shared/utilityComponents";
import { RestaurantCard } from "./shared/RestaurantCard";

const SearchPage = () => {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState<string>(params?.text || "");
  const {
    searchRestaurant,
    searchedRestaurants,
    selectedFilters,
    loading,
    updateSelectedFilters,
  } = useRestaurantStore();

  function keyDownHandler(e: KeyboardEvent<HTMLInputElement>) {
    let text = searchQuery.trim();
    if (e.key === "Enter" && text.length) {
      searchRestaurant(searchQuery, selectedFilters);
    }
  }

  useEffect(() => {
    searchRestaurant(searchQuery, selectedFilters);
  }, [selectedFilters, params, searchQuery.length === 0]);

  return (
    <div className="grid grid-cols-1 gap-15 lg:grid-cols-[1fr_5fr] px-3 md:px-5 py-5 bg-gray-50 dark:bg-input/110">
      <FilterBox />
      <div>
        <div className="relative rounded overflow-hidden">
          <Input
            type="text"
            placeholder="Search restaurants by name,address.."
            className="rounded-full pl-10 shadow-none outline-none ring-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={keyDownHandler}
          />
          <Search className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 absolute top-2 left-2 " />
          {searchQuery && (
            <span
              className="absolute top-2 right-3 bg-transparent dark:text-white w-3 h-3 sm:w-5 sm:h-5 cursor-pointer hover:scale-110 transition-all ease-in"
              onClick={() => searchRestaurant(searchQuery, selectedFilters)}
            >
              <Send className="w-4 h-4" />
            </span>
          )}
        </div>

        <>
          <h2 className="mt-6 text-xs sm:text-sm">
            ({searchedRestaurants?.length}) Search Result found
          </h2>
          <div className="mt-3 flex gap-3 overflow-x-scroll sm:overflow-auto pb-2  my-scrollbar">
            {selectedFilters.map((filter, idx) => (
              <div
                key={idx}
                className="relative inline-flex items-center max-w-full"
              >
                <Badge
                  variant="outline"
                  className="text-[#D19254] pr-8 whitespace-nowrap rounded-md hover:cursor-pointer"
                >
                  {filter}
                </Badge>
                <X
                  onClick={() => updateSelectedFilters(filter)}
                  className="absolute right-1 text-[#D19254] hover:cursor-pointer w-4 h-4"
                />
              </div>
            ))}
          </div>

          {loading.pageLoad ? (
            <CardSkeletonPage />
          ) : searchedRestaurants?.length === 0 ? (
            <div className="flex mb-40 mt-20" >
              <EmptyState
                title="No restaurants found"
                message="Try adjusting your search or filter criteria."
                icon={<Building className="mx-auto h-12 w-12 text-gray-400" />}
                showBtn={false}
              ></EmptyState>
            </div>
          ) : (
            <RestaurantsWrapper />
          )}
        </>
      </div>
    </div>
  );
};

export default SearchPage;

const RestaurantsWrapper = () => {
  const { searchedRestaurants } = useRestaurantStore();
  return (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[70vh] overflow-y-scroll  my-scrollbar">
      {searchedRestaurants?.map((restaurant: RestaurantType) => (
        <>
          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}
          ></RestaurantCard>
        </>
      ))}
    </div>
  );
};
