import { RouterProvider } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import { useEffect } from "react";
import { Toaster } from "sonner";
import router from "./lib/router";

function App() {
  const { theme, initializeTheme, } = useAppStore();

  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme={theme} />
    </>
  );
}

export default App;

