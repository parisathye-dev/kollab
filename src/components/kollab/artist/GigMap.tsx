"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

type GigMapProps = {
  latitude: number;
  longitude: number;
  label: string;
};

export function GigMap({ latitude, longitude, label }: GigMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-64 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[latitude, longitude]}
        pathOptions={{ color: "#7C3AED", fillColor: "#7C3AED" }}
        radius={9}
      >
        <Popup>{label}</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
