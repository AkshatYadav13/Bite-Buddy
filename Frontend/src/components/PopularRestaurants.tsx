import { RestaurantCard } from "./shared/RestaurantCard";
import { RestaurantType } from "@/types/restaurantType";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { CardSkeletonPage, EmptyState, MyUnderLine } from "./shared/utilityComponents";
import { useUserStore } from "@/store/useUserStore.ts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Building, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";


const PopularRestaurants = () => {
  const { popularRestaurants, getPopularRestaurants, loading } =
    useRestaurantStore();

  const { user } = useUserStore();
  const shouldShowtab = user?.area !== "Other";
  const tabOptions = ["Nearest", "Local"];
  const [activeTab, setActiveTab] = useState<string>(
    shouldShowtab ? "Local" : "Global"
  );

  const getHeaderTitle = (tab: string) => {
    switch (tab) {
      case "Global":
        return "Popular Restaurants Across Lucknow";
      case "Nearest":
        return "Popular Restaurants Near You";
      case "Area":
        return `Popular Restaurants in ${user?.area ?? "Your Area"}`;
      default:
        return "Popular Restaurants";
    }
  };

  useEffect(() => {
    getPopularRestaurants(activeTab.toLowerCase());
  }, [activeTab]);

  return (
    <div className="mb-20  lg:mt-25">
      <div className="flex justify-between items-center flex-wrap gap-6 mb-10">
        <div className="">
          <h1 className="text-2xl sm:text-2xl font-semibold">
            {getHeaderTitle(activeTab)}
          </h1>
          <MyUnderLine></MyUnderLine>
        </div>

        {shouldShowtab && (
          <div className="relative w-full sm:h-fit sm:w-fit">
            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

            <Select
              value={activeTab}
              onValueChange={(value: string) => setActiveTab(value)}
            >
              <SelectTrigger className="capitalize sm:min-w-50 w-full pl-10 pr-4">
                <SelectValue placeholder="Select a option" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {tabOptions.map((option, idx) => (
                    <SelectItem key={idx + option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div>
        {loading.pageLoad ? (
          <CardSkeletonPage></CardSkeletonPage>
        ) : popularRestaurants.length === 0 ? (
          <div className="flex h-100">
            <EmptyState
              title="No Restaurants Found"
              message="We couldn't find any restaurants matching your current selection. Try changing the filter or exploring other areas."
              icon={<Building className="mx-auto h-12 w-12 text-gray-400" />}
              showBtn={false}
            />
          </div>
        ) : (
          <div className="">
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {popularRestaurants?.map((restaurant: RestaurantType) => (
                <RestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                ></RestaurantCard>
              ))}

              <div className="flex items-center justify-center">
                <Link to={`/explore/restaurants`}>
                  <Button
                    variant="outline"
                    className="rounded-full px-10 text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View All →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularRestaurants