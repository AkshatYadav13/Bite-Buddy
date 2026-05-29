import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import AppLayout from "@/AppLayout";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";

/* ================== AUTH ================== */
import Auth from "@/auth/Auth";
import Login from "@/auth/Login";
import SignUp from "@/auth/SignUp";
import ForgotPassword from "@/auth/ForgotPassword";
import ResetPassword from "@/auth/ResetPassword";
import VerifyEmail from "@/auth/VerifyEmail";

import Profile from "@/components/Profile";
/* ================== CUSTOMER ================== */
import SearchPage from "@/components/SearchPage";
import RestaurantDetails from "@/components/RestaurantDetails";
import Cart from "@/customer/Cart";
import PaymentResult from "@/customer/PaymentResult";
import ShippingSteps from "@/customer/ShippingSteps";
import AreasTopRestaurants from "@/customer/AreasTopRestaurant";
import ExploreRestaurant from "@/customer/ExploreRestaurant";
import ExploreDishes from "@/customer/ExploreDishes";
import DishDetailsPage from "@/components/DishDetailsPage";
import FavoritesPage from "@/customer/FavoritesPage";
import ActiveOrderList from "@/components/ActiveOrderList";
import OrderHistory from "@/components/OrderHistory";

/* ================== ADMIN ================== */
import AdminDashboard from "@/admin/AdminDashboard";
import RestaurantList from "@/admin/RestaurantList";
import RestaurantApplicationList from "@/admin/RestaurantApplicationList";
import DeliveryAgentList from "@/admin/DeliveryAgentList";
import DeliveryAgentApplicationList from "@/admin/DeliveryAgentApplicationList";

/* ================== RESTAURANT OWNER ================== */
import RestaurantOwnerDashboard from "@/restaurantOwner/OwnerDashboard";
import Restaurant from "@/restaurantOwner/Restaurant";
import Menu from "@/restaurantOwner/Menu";

/* ================== DELIVERY AGENT ================== */
import AgentDashboard from "@/deliveryAgent/AgentDashboard";

/* ================== APPLICANT ================== */
import JoinUsPage from "@/applicant/JoinUsPage";
import Home from "@/components/Home";
import PaymentsSettlementsTab from "@/admin/PaymentsSettlementsTab";
import AgentOrderPage from "@/deliveryAgent/AgentOrderPage";

/* ===================================================== */
/* ================== HELPERS ========================== */
/* ===================================================== */

/* ================== AUTH GUARD ================== */
const AuthenticatedUser = () => {
  const { user, loading, checkAuthentication } = useUserStore();

  useEffect(() => {
    checkAuthentication();
  }, []);

  if (loading.pageLoad) return null;
  if (!user) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
};

/* ================== UNAUTH GUARD ================== */
const UnAuthenticatedUser = () => {
  const { user } = useUserStore();

  if (!user) return <Outlet />;

  return <Navigate to={"/"} replace />;
};

/* ================== ROLE GUARD ================== */
const RoleRoute = ({ role }: { role: string }) => {
  const { user } = useUserStore();

  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/* ===================================================== */
/* ================== ROUTER ============================ */
/* ===================================================== */

const router = createBrowserRouter([
  /* ================== AUTH ================== */
  {
    path: "/auth",
    element: <UnAuthenticatedUser />,
    children: [
      {
        element: <Auth />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <SignUp /> },
          { path: "forgotPassword", element: <ForgotPassword /> },
          { path: "resetPassword/:token", element: <ResetPassword /> },
          { path: "verifyEmail", element: <VerifyEmail /> },
        ],
      },
    ],
  },

  /* ================== PROTECTED ROOT ================== */
  {
    path: "/",
    element: <AuthenticatedUser />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "profile", element: <Profile /> },
          { path: "restaurant/id/:restaurantId", element: <RestaurantDetails /> },
          { path: "restaurant/owner/:ownerId", element: <RestaurantDetails /> },
          { path: "area/topRestaurants", element: <AreasTopRestaurants /> },
          { path: "explore/restaurants", element: <ExploreRestaurant /> },
          { path: "explore/dishes", element: <ExploreDishes /> },
          { path: "dish/:id", element: <DishDetailsPage /> },
          { path: "orders/active", element: <ActiveOrderList /> },
          { path: "orders/history", element: <OrderHistory /> },

          /* ================== CUSTOMER ================== */
          {
            path: "customer",
            element: <RoleRoute role="Customer" />,
            children: [
              { path: "search/:text", element: <SearchPage /> },
              { path: "cart", element: <Cart /> },
              { path: "order/payment-result", element: <PaymentResult /> },
              { path: "order/shipping", element: <ShippingSteps /> },
              { path: "favorites", element: <FavoritesPage /> },
              {
                path: "canceled/transaction",
                element: <PaymentsSettlementsTab />,
              },
            ],
          },

          /* ================== APPLICANT ================== */
          {
            path: "applicant",
            element: <RoleRoute role="Applicant" />,
            children: [{ index: true, element: <JoinUsPage /> }],
          },

          /* ================== RESTAURANT OWNER ================== */
          {
            path: "resOwner",
            element: <RoleRoute role="Restaurant_Owner" />,
            children: [
              { path: "dashboard", element: <RestaurantOwnerDashboard /> },
              { path: "restaurant", element: <Restaurant /> },
              { path: "menu", element: <Menu /> },
            ],
          },

          /* ================== DELIVERY AGENT ================== */
          {
            path: "deliveryAgent",
            element: <RoleRoute role="Delivery_Agent" />,
            children: [
              { path: "dashboard", element: <AgentDashboard /> },
              { path: "orders/page", element: <AgentOrderPage /> },
            ],
          },

          /* ================== ADMIN ================== */
          {
            path: "admin",
            element: <RoleRoute role="Admin" />,
            children: [
              { path: "dashboard", element: <AdminDashboard /> },
              { path: "restaurantList", element: <RestaurantList /> },
              {
                path: "application/restaurantList",
                element: <RestaurantApplicationList />,
              },
              { path: "deliveryAgentList", element: <DeliveryAgentList /> },
              {
                path: "application/deliveryAgentList",
                element: <DeliveryAgentApplicationList />,
              },
            ],
          },
        ],
      },
    ],
  },

  /* ================== FALLBACK ================== */
  // {
  //   path: "*",
  //   element: <Navigate to="/" replace />,
  // },
]);

export default router;
