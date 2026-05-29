import { useCallback, useEffect, useState } from "react";
import { useDishStore } from "@/store/useDishStore";
import {
  CardSkeletonPage,
  EmptyState,
  MyUnderLine,
} from "./shared/utilityComponents";
import { DishCard } from "./shared/DishCard";
import { DishType } from "@/types/dishType";
import { ChefHat } from "lucide-react";
import Pagination from "./shared/Pagination";

import mainCourseIcon from "@/assets/dishCategories/main_course.jpg";
import curriesIcon from "@/assets/dishCategories/curries.webp";
import thaliIcon from "@/assets/dishCategories/thali.jpg";
import chineseIcon from "@/assets/dishCategories/chinese.jpg";
import breakFastIcon from "@/assets/dishCategories/breakfast.jpg";
import bakeryIcon from "@/assets/dishCategories/bakery.png";
import biryaniIcon from "@/assets/dishCategories/biryani.png";
import beveragesIcon from "@/assets/dishCategories/beverages.webp";
import fastFoodIcon from "@/assets/dishCategories/fastfood.avif";
import iceCreamIcon from "@/assets/dishCategories/ice_cream.jpg";

const CATEGORIES = [
  {
    label: "Curries",
    image: curriesIcon,
  },
  {
    label: "Main Course",
    image: mainCourseIcon,
  },
  {
    label: "Chinese",
    image: chineseIcon,
  },
  {
    label: "Breakfast",
    image: breakFastIcon,
  },
  {
    label: "Bakery",
    image: bakeryIcon,
  },
  {
    label: "Biryani",
    image: biryaniIcon,
  },
  {
    label: "Beverages",
    image: beveragesIcon,
  },
  {
    label: "Fast Food",
    image: fastFoodIcon,
  },
  {
    label: "Combo",
    image: thaliIcon,
  },
  {
    label: "Ice Creams",
    image: iceCreamIcon,
  },
  {
    label: "Satvik",
    image: mainCourseIcon,
  },
];

const DishCategories = () => {
  const [activeCategory, setActiveCategory] = useState<string>(
    CATEGORIES[0].label,
  );

  const {
    categoryDishes,
    categoryDishPagination,
    loading,
    categoryCache,
    setCategoryDishesFromCache,
    getDishesByCategory,
  } = useDishStore();

  const handlePagination = useCallback(
    (page: number, limit: number) => {
      getDishesByCategory(activeCategory, page, limit);
    },
    [activeCategory, getDishesByCategory],
  );

  const handleCategoryClick = (category: string) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
  };

  useEffect(() => {
    const cached = categoryCache[activeCategory];

    if (cached) {
      setCategoryDishesFromCache(activeCategory);
      return;
    }

    getDishesByCategory(activeCategory, 1, 9);
  }, [activeCategory]);

  const { currentPage, totalPages, totalCount, limit } =
    categoryDishPagination || {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b  text-center mx-auto py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <h1 className="text-xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Explore Our Menu
          </h1>
        </div>
        <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover delicious dishes from our carefully curated collection of
          cuisines
        </p>
      </div>

      <div className="mx-auto py-8 pt-4">
        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text- font-semibold text-orange-500 mb-4 text-center">
            Browse by Category
          </h2>

          <div className="flex items-center gap-6 overflow-x-auto pb-4 my-scrollbar">
            {CATEGORIES.map((category) => (
              <div
                key={category.label}
                onClick={() => handleCategoryClick(category.label)}
                className={`flex flex-col pt-2 items-center cursor-pointer transition-all duration-300 hover:scale-105 min-w-[120px] ${
                  activeCategory === category.label
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-90"
                }`}
              >
                <div
                  className={`w-22 h-22 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg transition-all duration-300 ${
                    activeCategory === category.label
                      ? "ring-4 ring-orange-500 ring-opacity-60 shadow-xl"
                      : "hover:shadow-xl"
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className={`mt-3 text-sm font-medium text-center transition-colors duration-300 ${
                    activeCategory === category.label
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {category.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dishes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="">
              <h2 className="text-2xl font-semibold">
                {activeCategory} Dishes
              </h2>
              <MyUnderLine></MyUnderLine>
            </div>
            {!loading.pageLoad && categoryDishes.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} dishes available
              </span>
            )}
          </div>

          {loading.pageLoad ? (
            <CardSkeletonPage />
          ) : categoryDishes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <EmptyState
                title="No Dishes Found"
                message={`Sorry, we couldn't find any ${activeCategory.toLowerCase()} dishes at the moment. Please try another category.`}
              />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Dishes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryDishes?.map((dish: DishType) => (
                  <DishCard key={dish._id} dish={dish} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onClickFn={handlePagination}
                    limit={limit}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCategories;
