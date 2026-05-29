import {
  ChefHat,
  ChevronRight,
  Search,
  Send,
  Star,
  Utensils,
} from "lucide-react";
import HeroImage from "@/assets/hero_pizza.png";
import { Button } from "../components/ui/button";
import { KeyboardEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();

  function keyDownHandler(e: KeyboardEvent<HTMLInputElement>) {
    let text = searchText.trim();
    if (e.key === "Enter" && text.length) {
      navigate(`customer/search/${text}`);
    }
  }


  return (
    <div className="relative pt-10 sm:pt-20 flex justify-center gap-x-30 gap-y-10 flex-col xl:flex-row p-3 ">
      {/* Left Content */}
      <div className="flex-1 text-center lg:text-left space-y-8">
        <div className="relative pb-5">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-10 w-[80%] h-[80%] sm:w-72 sm:h-72 bg-gradient-to-r from-orange-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Delicious
              </span>
              <br />
              <span className="text-gray-800 dark:text-white">
                Food Delivered
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Fast & Fresh
              </span>
            </h1>

            <p className="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Experience culinary excellence delivered straight to your door.
              Fresh ingredients, expert chefs, lightning-fast delivery.
            </p>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative max-w-2xl mx-auto lg:mx-0">
          <div className={`relative transition-all duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-1 px-0 shadow-2xl">
              <div className="flex items-center justify-between">
                <Search className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 ml-4" />
                <input
                  type="text"
                  className="overflow-hidden text-sm flex-1 pl-3 pr-16 sm:py-2 border-0 sm:text-lg placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  placeholder="Search restaurants..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={keyDownHandler}
                />
                {searchText && (
                  <Button
                    size="icon"
                    className="absolute right-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-110"
                    onClick={() => navigate(`customer/search/${searchText}`)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
          <Link to="/area/topRestaurants">
            <Button className="group bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <Star className="w-4 h-4 mr-2" />
              Order From Top Restaurants
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link to="/explore/restaurants">
            <Button
              variant="outline"
              className="group border-2 border-orange-200 hover:border-orange-300 text-orange-600 hover:text-orange-700 font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
            >
              <Utensils></Utensils>
              Explore Restaurants
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link to={`/explore/dishes/`}>
            <Button
              variant="outline"
              className="group border-2 border-orange-200 hover:border-orange-300 text-orange-600 hover:text-orange-700 font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
            >
              <ChefHat></ChefHat>
              Explore Dishes
              <ChevronRight></ChevronRight>
            </Button>
          </Link>
        </div>
      </div>
      <RightImgSection></RightImgSection>
    </div>
  );
};

export default HeroSection;

export const RightImgSection = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setRotation(scrollY / 4); 
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex justify-center items-end">
      <img
        src={HeroImage}
        alt="Hero_image"
        className="rounded-full object-cover w-[80%] sm:w-full max-w-120 transition-transform duration-200 ease-linear"
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    </div>
  );
};
