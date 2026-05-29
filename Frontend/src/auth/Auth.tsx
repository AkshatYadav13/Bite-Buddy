import { useAppStore } from "@/store/useAppStore";
import  { useEffect } from "react";
import { Outlet } from "react-router-dom";

const Auth = () => {
  const { initializeTheme } = useAppStore();

  useEffect(() => {
    initializeTheme();
  }, []);

  return <Outlet></Outlet>
};

export default Auth;
