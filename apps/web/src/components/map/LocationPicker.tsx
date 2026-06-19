'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';

export interface PickedLocation {
  lat: number;
  lng: number;
  displayName?: string;
}

interface Props {
  initialLat?: number;
  initialLng?: number;
  onChange: (loc: PickedLocation) => void;
}

// Tashkent center fallback
const DEFAULT_LAT = 41.2995;
const DEFAULT_LNG = 69.2401;

export function LocationPicker({ initialLat, initialLng, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [reversing, setReversing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [label, setLabel] = useState('');
  const [geoError, setGeoError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;
    if (leafletRef.current) return;

    let map: any;
    let L: any;

    (async () => {
      L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const lat = initialLat ?? DEFAULT_LAT;
      const lng = initialLng ?? DEFAULT_LNG;

      map = L.map(mapRef.current).setView([lat, lng], 14);
      leafletRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      async function handlePick(lat: number, lng: number) {
        setReversing(true);
        setGeoError('');
        marker.setLatLng([lat, lng]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'uz,ru,en' } },
          );
          const data = await res.json();
          const name = data.display_name ?? '';
          setLabel(name);
          onChange({ lat, lng, displayName: name });
        } catch {
          onChange({ lat, lng });
        } finally {
          setReversing(false);
        }
      }

      // Expose handlePick so the geolocation button can call it
      (map as any)._handlePick = handlePick;

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        handlePick(lat, lng);
      });
      map.on('click', (e: any) => handlePick(e.latlng.lat, e.latlng.lng));

      if (initialLat && initialLng) {
        onChange({ lat: initialLat, lng: initialLng });
      }
    })();

    return () => {
      leafletRef.current?.remove();
      leafletRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = leafletRef.current;
        if (map) {
          map.setView([lat, lng], 16);
          map._handlePick?.(lat, lng);
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access denied. Allow it in your browser settings.');
        } else {
          setGeoError('Could not get your location. Try clicking on the map instead.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  if (!mounted) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span>Tap the map or drag the pin to set your address</span>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-accent/60 hover:text-fg disabled:opacity-50"
        >
          {locating
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <LocateFixed className="h-3 w-3" />}
          Use my location
        </button>
      </div>

      <div ref={mapRef} className="h-56 w-full overflow-hidden rounded-lg border border-line" />

      {reversing && (
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading address…
        </p>
      )}
      {geoError && <p className="text-xs text-danger">{geoError}</p>}
      {label && !reversing && (
        <p className="line-clamp-2 text-xs text-faint">{label}</p>
      )}
    </div>
  );
}
