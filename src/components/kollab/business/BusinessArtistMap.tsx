"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { skillLabel } from "@/lib/supabase/artist";
import type { BusinessArtistProfile } from "@/types/business";

type BusinessArtistMapProps = {
  artists: BusinessArtistProfile[];
};

export function BusinessArtistMap({ artists }: BusinessArtistMapProps) {
  const center: [number, number] =
    artists.length > 0
      ? [artists[0].latitude, artists[0].longitude]
      : [19.2183, 72.9781];

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {artists.map((artist) => (
        <CircleMarker
          key={artist.id}
          center={[artist.latitude, artist.longitude]}
          pathOptions={{ color: "#F97316", fillColor: "#F97316" }}
          radius={10}
        >
          <Popup>
            <strong>{artist.displayName}</strong>
            <br />
            {artist.skills.map(skillLabel).join(", ")}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
