import { useRef } from "react";
import { getDistance } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import { REVERSE_GEOCODE_API } from "@/lib/constants";
import { IFullLocation } from "@/store/useAppStore";
import { getGeoCoords } from "../lib/utils";

const USER_LOCATION_REUSE_KM = 1;
const AGENT_AUTO_UPDATE_KM = 1;

export const useOptimizedLocationSync = () => {
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const savedUserLocation = useAppStore((s) => s.userLocation);

  const updateAgentLocation = useDeliveryAgentStore(
    (s) => s.updateAgentLocation,
  );

  const isUpdatingRef = useRef(false);

  /* ---------------- Reverse Geocode ---------------- */

  const reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<IFullLocation | null> => {
    try {
      const res = await fetch(
        `${REVERSE_GEOCODE_API}?lat=${latitude}&lon=${longitude}&format=json&apiKey=${
          import.meta.env.VITE_GEOAPIFY_KEY
        }`,
      );

      if (!res.ok) return null;

      const data = await res.json();
      const result = data?.results?.[0];

      return {
        address: result?.formatted ?? "",
        area: result?.street ?? "",
        city:
          result?.city ??
          result?.town ??
          result?.village ??
          result?.municipality ??
          "",
        state: result?.state ?? "",
        latitude,
        longitude,
      };
    } catch {
      return null;
    }
  };

  /* ---------------- Get Current User Location ---------------- */

  const getCurrentLocation = async (): Promise<IFullLocation | null> => {
    const coords = await getGeoCoords();
    if (!coords) return savedUserLocation ?? null;

    try {
      if (savedUserLocation) {
        const dist = getDistance(
          {
            latitude: savedUserLocation.latitude,
            longitude: savedUserLocation.longitude,
          },
          coords,
        );

        if (dist !== null && dist <= USER_LOCATION_REUSE_KM) {
          return savedUserLocation;
        }
      }

      const freshLocation = await reverseGeocode(
        coords.latitude,
        coords.longitude,
      );

      if (freshLocation) {
        setUserLocation(freshLocation);
        return freshLocation;
      }

      return savedUserLocation ?? null;
    } catch {
      return savedUserLocation ?? null;
    }
  };

  /* ---------------- Auto Agent Sync ---------------- */

  const syncAgentLocationIfNeeded = async () => {
    // Always read fresh from store — avoids stale closure when called by setInterval
    const agent = useDeliveryAgentStore.getState().deliveryAgentDetails;

    if (!agent?.lastLocation) {
      console.log("[LocationSync] Skipped: no lastLocation on agent");
      return;
    }
    if (isUpdatingRef.current) {
      console.log("[LocationSync] Skipped: update already in progress");
      return;
    }

    const coords = await getGeoCoords();
    if (!coords) {
      console.log("[LocationSync] Skipped: could not get GPS coords");
      return;
    }

    const distance = getDistance(
      {
        latitude: agent.lastLocation.latitude,
        longitude: agent.lastLocation.longitude,
      },
      coords,
    );

    console.log(
      `[LocationSync] Distance from stored location: ${distance} km (threshold: ${AGENT_AUTO_UPDATE_KM} km)`,
      { stored: agent.lastLocation, current: coords },
    );

    if (distance !== null && distance >= AGENT_AUTO_UPDATE_KM) {
      console.log("[LocationSync] Threshold met — syncing location to DB");
      isUpdatingRef.current = true;
      try {
        await updateAgentLocation(coords);
      } finally {
        isUpdatingRef.current = false;
      }
    } else {
      console.log("[LocationSync] Below threshold — no update needed");
    }
  };

  return {
    getCurrentLocation,
    syncAgentLocationIfNeeded,
  };
};
