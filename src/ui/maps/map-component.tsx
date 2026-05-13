import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './mapStyles.module.css';

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  accessToken?: string;
  markerColor?: string;
  markerLabel?: string;
}

export default function MapComponent({
  latitude = 40.7128,
  longitude = -74.006,
  zoom = 16,
  accessToken = import.meta.env.VITE_MAPBOX_TOKEN,
  markerColor = '#3887BE',
  markerLabel = 'Punto',
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Configurar el token de acceso de Mapbox
    mapboxgl.accessToken = accessToken;

    // Crear el mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: zoom,
    });

    // Crear el marcador
    marker.current = new mapboxgl.Marker({ color: markerColor })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="font-family: Arial; font-size: 14px;">
            <strong>${markerLabel}</strong><br/>
            Lat: ${latitude.toFixed(4)}<br/>
            Lng: ${longitude.toFixed(4)}
          </div>`
        )
      )
      .addTo(map.current);

    // Mostrar el popup automáticamente
    marker.current.getPopup()?.addTo(map.current);

    // Limpiar al desmontar el componente
    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, zoom, accessToken, markerColor, markerLabel]);

  return (
    <div
      ref={mapContainer}
      className={styles.mapContainer}
    />
  );
}
