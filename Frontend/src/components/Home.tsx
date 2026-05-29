import DishCategories from "@/components/DishCategories";
import HeroSection from "@/customer/HeroSection";
import PopularRestaurants from "@/components/PopularRestaurants";
import { useUserStore } from "@/store/useUserStore";
import RestaurantOwnerDashboard from "@/restaurantOwner/OwnerDashboard";
import AdminDashboard from "@/admin/AdminDashboard";
import { useEffect } from "react";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import AgentDashboard from "@/deliveryAgent/AgentDashboard";
import JoinUsPage from "@/applicant/JoinUsPage";
import { useRestaurantStore } from "@/store/useRestaurantStore";

const Home = () => {
  const { user } = useUserStore();
  const { getDeliveryAgentDetails } = useDeliveryAgentStore();
  const { getUserRestaurant } = useRestaurantStore();

  useEffect(() => {
    if (user?.role === "Delivery_Agent") {
      getDeliveryAgentDetails();
    } else if (user?.role === "Restaurant_Owner") {
      getUserRestaurant();
    }
  }, [user?.role]);

  /* ---------------- Role Based UI ---------------- */
  return (
    <div className="bg-gray-50 dark:bg-input/110 px-5 md:px-15 lg:px-25">
      {user?.role === "Customer" && (
        <>
          <HeroSection />
          <PopularRestaurants />
          <DishCategories />
        </>
      )}

      {user?.role === "Restaurant_Owner" && <RestaurantOwnerDashboard />}

      {user?.role === "Admin" && <AdminDashboard />}

      {user?.role === "Delivery_Agent" && <AgentDashboard />}

      {user?.role === "Applicant" && <JoinUsPage />}
    </div>
  );
};

export default Home;
