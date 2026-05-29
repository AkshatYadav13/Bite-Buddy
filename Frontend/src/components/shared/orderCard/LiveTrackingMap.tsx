import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

export type MapPoint = {
  lat?: number;
  lng?: number;
  label: string;
  icon: L.Icon;
};

export interface LiveTrackingMapProps {
  agentData: MapPoint;
  destinationData: MapPoint;
}

// Auto fit bounds component
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export const LiveTrackingMap = ({
  agentData,
  destinationData,
}: LiveTrackingMapProps) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);

  // Proper validation
  if (
    agentData.lat == null ||
    agentData.lng == null ||
    destinationData.lat == null ||
    destinationData.lng == null
  ) {
    return null;
  }

  const agentPos: [number, number] = [agentData.lat, agentData.lng];
  const destPos: [number, number] = [
    destinationData.lat,
    destinationData.lng,
  ];

  // Fetch real road route from OSRM
  useEffect(() => {
    async function fetchRoute() {
      try {
        setLoading(true);

        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${agentData.lng},${agentData.lat};${destinationData.lng},${destinationData.lat}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        const coordinates =
          data.routes[0].geometry.coordinates.map(
            (coord: number[]) => [coord[1], coord[0]] // convert lng,lat -> lat,lng
          );

        setRoute(coordinates);
      } catch (err) {
        console.error("Route fetch error:", err);

        // fallback straight line
        setRoute([agentPos, destPos]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoute();
  }, [agentData, destinationData]);

  const allPoints = [agentPos, destPos];

  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={agentPos}
        zoom={15}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Auto fit bounds */}
        <FitBounds points={allPoints} />

        {/* Agent Marker */}
        <Marker position={agentPos} icon={agentData.icon}>
          <Popup>{agentData.label}</Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destPos} icon={destinationData.icon}>
          <Popup>{destinationData.label}</Popup>
        </Marker>

        {/* Route Glow Effect */}
        {!loading && route.length > 0 && (
          <>
            {/* Glow layer */}
            <Polyline
              positions={route}
              pathOptions={{
                color: "#60a5fa",
                weight: 10,
                opacity: 0.4,
              }}
            />

            {/* Main route */}
            <Polyline
              positions={route}
              pathOptions={{
                color: "#2563eb",
                weight: 5,
                opacity: 0.9,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};