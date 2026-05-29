import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense, useEffect, lazy } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Loading } from "@/components/shared/utilityComponents";

/* ================== LAYOUT ================== */
const AppLayout = lazy(() => import("@/AppLayout"));

/* ================== AUTH ================== */
const Auth            = lazy(() => import("@/auth/Auth"));
const Login           = lazy(() => import("@/auth/Login"));
const SignUp          = lazy(() => import("@/auth/SignUp"));
const ForgotPassword  = lazy(() => import("@/auth/ForgotPassword"));
const ResetPassword   = lazy(() => import("@/auth/ResetPassword"));
const VerifyEmail     = lazy(() => import("@/auth/VerifyEmail"));

/* ================== SHARED ================== */
const Home            = lazy(() => import("@/components/Home"));
const Profile         = lazy(() => import("@/components/Profile"));
const SearchPage      = lazy(() => import("@/components/SearchPage"));
const RestaurantDetails = lazy(() => import("@/components/RestaurantDetails"));
const DishDetailsPage = lazy(() => import("@/components/DishDetailsPage"));
const ActiveOrderList = lazy(() => import("@/components/ActiveOrderList"));
const OrderHistory    = lazy(() => import("@/components/OrderHistory"));

/* ================== CUSTOMER ================== */
const Cart              = lazy(() => import("@/customer/Cart"));
const PaymentResult     = lazy(() => import("@/customer/PaymentResult"));
const ShippingSteps     = lazy(() => import("@/customer/ShippingSteps"));
const AreasTopRestaurants = lazy(() => import("@/customer/AreasTopRestaurant"));
const ExploreRestaurant = lazy(() => import("@/customer/ExploreRestaurant"));
const ExploreDishes     = lazy(() => import("@/customer/ExploreDishes"));
const FavoritesPage     = lazy(() => import("@/customer/FavoritesPage"));

/* ================== ADMIN ================== */
const AdminDashboard              = lazy(() => import("@/admin/AdminDashboard"));
const RestaurantList              = lazy(() => import("@/admin/RestaurantList"));
const RestaurantApplicationList   = lazy(() => import("@/admin/RestaurantApplicationList"));
const DeliveryAgentList           = lazy(() => import("@/admin/DeliveryAgentList"));
const DeliveryAgentApplicationList = lazy(() => import("@/admin/DeliveryAgentApplicationList"));
const PaymentsSettlementsTab      = lazy(() => import("@/admin/PaymentsSettlementsTab"));

/* ================== RESTAURANT OWNER ================== */
const RestaurantOwnerDashboard = lazy(() => import("@/restaurantOwner/OwnerDashboard"));
const Restaurant               = lazy(() => import("@/restaurantOwner/Restaurant"));
const Menu                     = lazy(() => import("@/restaurantOwner/Menu"));

/* ================== DELIVERY AGENT ================== */
const AgentDashboard  = lazy(() => import("@/deliveryAgent/AgentDashboard"));
const AgentOrderPage  = lazy(() => import("@/deliveryAgent/AgentOrderPage"));

/* ================== APPLICANT ================== */
const JoinUsPage = lazy(() => import("@/applicant/JoinUsPage"));


/* ================== AUTH GUARD ================== */
const AuthenticatedUser = () => {
  const { user, loading, checkAuthentication } = useUserStore();

  useEffect(() => {
    checkAuthentication();
  }, []);

  if (loading.pageLoad) return null;
  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
};

/* ================== UNAUTH GUARD ================== */
const UnAuthenticatedUser = () => {
  const { user } = useUserStore();

  if (!user)
    return (
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    );

  return <Navigate to="/" replace />;
};

/* ================== ROLE GUARD ================== */
const RoleRoute = ({ role }: { role: string }) => {
  const { user } = useUserStore();

  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;

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
          { path: "login",                    element: <Login /> },
          { path: "signup",                   element: <SignUp /> },
          { path: "forgotPassword",           element: <ForgotPassword /> },
          { path: "resetPassword/:token",     element: <ResetPassword /> },
          { path: "verifyEmail",              element: <VerifyEmail /> },
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
          { index: true,                                  element: <Home /> },
          { path: "profile",                              element: <Profile /> },
          { path: "restaurant/id/:restaurantId",          element: <RestaurantDetails /> },
          { path: "restaurant/owner/:ownerId",            element: <RestaurantDetails /> },
          { path: "area/topRestaurants",                  element: <AreasTopRestaurants /> },
          { path: "explore/restaurants",                  element: <ExploreRestaurant /> },
          { path: "explore/dishes",                       element: <ExploreDishes /> },
          { path: "dish/:id",                             element: <DishDetailsPage /> },
          { path: "orders/active",                        element: <ActiveOrderList /> },
          { path: "orders/history",                       element: <OrderHistory /> },

          /* ================== CUSTOMER ================== */
          {
            path: "customer",
            element: <RoleRoute role="Customer" />,
            children: [
              { path: "search/:text",         element: <SearchPage /> },
              { path: "cart",                 element: <Cart /> },
              { path: "order/payment-result", element: <PaymentResult /> },
              { path: "order/shipping",       element: <ShippingSteps /> },
              { path: "favorites",            element: <FavoritesPage /> },
              { path: "canceled/transaction", element: <PaymentsSettlementsTab /> },
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
              { path: "dashboard",  element: <RestaurantOwnerDashboard /> },
              { path: "restaurant", element: <Restaurant /> },
              { path: "menu",       element: <Menu /> },
            ],
          },

          /* ================== DELIVERY AGENT ================== */
          {
            path: "deliveryAgent",
            element: <RoleRoute role="Delivery_Agent" />,
            children: [
              { path: "dashboard",    element: <AgentDashboard /> },
              { path: "orders/page",  element: <AgentOrderPage /> },
            ],
          },

          /* ================== ADMIN ================== */
          {
            path: "admin",
            element: <RoleRoute role="Admin" />,
            children: [
              { path: "dashboard",                      element: <AdminDashboard /> },
              { path: "restaurantList",                 element: <RestaurantList /> },
              { path: "application/restaurantList",     element: <RestaurantApplicationList /> },
              { path: "deliveryAgentList",              element: <DeliveryAgentList /> },
              { path: "application/deliveryAgentList",  element: <DeliveryAgentApplicationList /> },
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