import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Loader2, Locate, Search } from "lucide-react";
import { FORWARD_GEOCODE_API, REVERSE_GEOCODE_API } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import "leaflet/dist/leaflet.css";

/* ---------------- RE-CENTER MAP ---------------- */
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      map.setView([lat, lng], 16, { animate: true });
    }
  }, [lat, lng, map]);

  return null;
};

/* ---------------- PROPS ---------------- */
type AcceptAddressProps = {
  address: string;
  latitude: number;
  longitude: number;
  label?: string;
  onChange: (data: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  errorMsg?: string;
};

/* ---------------- COMPONENT ---------------- */
const AcceptAddress = ({
  address,
  latitude,
  longitude,
  onChange,
  label = "Complete Address",
  errorMsg,
}: AcceptAddressProps) => {
  const { userLocation } = useAppStore();
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const hasValidCoords = latitude !== 0 && longitude !== 0;

  /* ---------- Reverse Geocode ---------- */
  async function getLocationByLatLng(lat: number, lng: number) {
    try {
      const res = await fetch(
        `${REVERSE_GEOCODE_API}?lat=${lat}&lon=${lng}&format=json&apiKey=${
          import.meta.env.VITE_GEOAPIFY_KEY
        }`,
      );
      if (!res.ok) return;

      const data = await res.json();
      const result = data?.results?.[0];

      if (result?.formatted) {
        onChange({
          address: result.formatted,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ---------- Forward Geocode ---------- */
  async function getLatLngByAddress(address: string) {
    try {
      const res = await fetch(
        `${FORWARD_GEOCODE_API}?text=${encodeURIComponent(address)}&apiKey=${
          import.meta.env.VITE_GEOAPIFY_KEY
        }`,
      );
      if (!res.ok) return null;

      
      const data = await res.json();
      
      return data?.features?.[0]?.properties ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /* ---------- Marker Drag ---------- */
  function dragEndHandler(e: any) {
    const { lat, lng } = e.target.getLatLng();
    getLocationByLatLng(lat, lng);
  }

  /* ---------- Current Location ---------- */
  async function setCurrLocation() {
    if (!userLocation) return;
    setIsLocating(true);
    try {
      await getLocationByLatLng(userLocation.latitude, userLocation.longitude);
    } finally {
      setIsLocating(false);
    }
  }

  /* ---------- Search Address ---------- */
  async function searchAddressHandler() {
    if (!address) return;
    setIsSearching(true);
    try {
      const props = await getLatLngByAddress(address);
      if (!props) return;
      const { lat, lon } = props;

      console.log( lat, lon)
      if (lat && lon) {
        onChange({
          address,
          latitude: lat,
          longitude: lon,
        });
      }
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Address Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label>{label}</Label>
          <Input
            value={address}
            onChange={(e) =>
              onChange({
                address: e.target.value,
                latitude: 0,
                longitude: 0,
              })
            }
            placeholder="House / Flat, Street, City"
            className="mt-2 capitalize"
          />
          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        </div>

        <div className="flex gap-2 items-end">
          <Button
            type="button"
            title="Search Location"
            disabled={!address}
            variant="outline"
            onClick={searchAddressHandler}
          >
            {isSearching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>

          {userLocation && (
            <Button
              type="button"
              title="Current Location"
              variant="outline"
              onClick={setCurrLocation}
            >
              {isLocating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Locate className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Map */}
      {hasValidCoords && (
        <div className="h-64 rounded-xl overflow-hidden border">
          <MapContainer
            center={[latitude, longitude]}
            zoom={16}
            className="w-full h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <RecenterMap lat={latitude} lng={longitude} />

            <Marker
              position={[latitude, longitude]}
              draggable
              eventHandlers={{ dragend: dragEndHandler }}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default AcceptAddress;
