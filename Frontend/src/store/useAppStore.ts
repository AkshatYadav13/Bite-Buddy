import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "dark" | "light";

export interface IFullLocation {
  address: string;
  area: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

type AppStore = {
  theme: Theme;
  userLocation: IFullLocation | null;

  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;

  setUserLocation: (location: IFullLocation) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: "dark",
      userLocation: null,

      setTheme: (theme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("bite-buddy-theme", theme);
        set({ theme });
      },

      initializeTheme: () => {
        if (typeof window !== "undefined") {
          const storedTheme =
            (localStorage.getItem("bite-buddy-theme") || "dark") as Theme;

          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(storedTheme);

          set({ theme: storedTheme });
        }
      },

      setUserLocation: (location: IFullLocation) => {
        set({ userLocation: location });
      },


      resetStore: () => {
        set({
          userLocation: null,
        });
      },
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
