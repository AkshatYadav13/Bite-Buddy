import NavBar from "./components/shared/NavBar";
import Footer from "./components/shared/Footer";
import { Outlet } from "react-router-dom";
import { SocketProvider } from "./lib/SocketContext";
import { useUserStore } from "./store/useUserStore";
import { useEffect } from "react";
import { useOptimizedLocationSync } from "./hooks/useOptimizedLocationSync";
import { useAppStore } from "./store/useAppStore";
import { Button } from "./components/ui/button";


const AppLayout = () => {
  const { user } = useUserStore();

  const { getCurrentLocation,syncAgentLocationIfNeeded } = useOptimizedLocationSync();
  const userLocation = useAppStore((s) => s.userLocation);

  useEffect(() => {
    const init = async () => {
      if (user?.role !== "Admin" && user?.role !== "Delivery_Agent") {
        await getCurrentLocation();
      }
    };

    init();
  }, []);

  useEffect(() => {
    if(user?.role === "Delivery_Agent"){
      const id = setInterval(syncAgentLocationIfNeeded, 60_000); //1 miin
      return () => clearInterval(id);
    }
  }, []);

  if (!userLocation && user?.role !== "Admin" && user?.role !== "Delivery_Agent") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-semibold">📍 Enable Location Access</h2>

        <p className="text-gray-500 mt-3 max-w-md">
          Location access is required to use the app. This helps us show
          relevant data and services near you.
        </p>

        <Button
          onClick={getCurrentLocation}
          className="mt-6 px-6 py-3 rounded-lg my-gradient-btn "
        >
          Enable Location
        </Button>

        <p className="text-xs text-gray-400 mt-4">
          You can change this anytime from browser settings
        </p>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen flex flex-col relative">
        <NavBar />
        <div className="flex-grow min-h-[90vh] bg-gray-50 dark:bg-input/110">
          <Outlet />
        </div>
        <Footer />
      </div>
    </SocketProvider>
  );
};

export default AppLayout;
