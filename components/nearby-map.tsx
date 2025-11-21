"use client";

import { useEffect, useRef } from "react";
import type { NearbyWinery } from "@/lib/wineries-data";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Coordinates = {
  lat: number;
  lng: number;
};

interface NearbyMapProps {
  origin: Coordinates | null;
  results: NearbyWinery[];
  radiusMiles: number;
}

const DEFAULT_CENTER: Coordinates = { lat: 37.5, lng: -78.8 };

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -42],
  shadowSize: [48, 48],
});

export default function NearbyMap({ origin, results, radiusMiles }: NearbyMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 7,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(mapRef.current);

    layersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layersRef.current) return;

    const group = layersRef.current;
    group.clearLayers();

    const markerBounds: LatLngExpression[] = [];

    if (origin) {
      const originMarker = L.marker(origin, {
        icon: userIcon,
      }).addTo(group);
      originMarker.bindPopup("You");

      L.circle(origin, {
        radius: radiusMiles * 1609.34,
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(group);

      markerBounds.push(origin);
    }

    results.forEach(({ winery, distanceMiles }) => {
      if (typeof winery.lat !== "number" || typeof winery.lng !== "number") return;
      const marker = L.marker({ lat: winery.lat, lng: winery.lng }, { icon: markerIcon }).addTo(group);
      marker.bindPopup(`
        <div>
          <strong>${winery.name}</strong><br />
          ${distanceMiles} mi away
        </div>
      `);
      markerBounds.push({ lat: winery.lat, lng: winery.lng });
    });

    if (markerBounds.length === 0) {
      mapRef.current.setView(DEFAULT_CENTER, 7);
    } else if (markerBounds.length === 1) {
      mapRef.current.setView(markerBounds[0], 10);
    } else {
      const bounds = L.latLngBounds(markerBounds);
      mapRef.current.fitBounds(bounds.pad(0.2));
    }

    // Ensure tiles render correctly when container size changes
    setTimeout(() => mapRef.current?.invalidateSize(), 0);
  }, [origin, results, radiusMiles]);

  return <div ref={containerRef} className="w-full h-[400px] rounded-xl overflow-hidden" />;
}
