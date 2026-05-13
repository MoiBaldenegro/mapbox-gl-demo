import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../ui/maps/mapStyles.module.css';
import { useLocationSync } from './useLocationSync';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function RealTimeLocation() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const accuracyCircle = useRef<any>(null);
  const watchId = useRef<number | null>(null);
  const remoteMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Inactivo');

  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  // Sincronización de ubicaciones con el servidor
  const { sendLocation, remoteLocations, isConnected } = useLocationSync({
    username: `user_${Math.random().toString(36).substring(7)}`,
    serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
  });

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.006, 40.7128],
      zoom: 14,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Manejar la ubicación en tiempo real
  useEffect(() => {
    if (!isTracking) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('La Geolocalización no está soportada en tu navegador');
      setIsTracking(false);
      return;
    }

    setStatus('Buscando ubicación...');
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000,
    };

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // 🎯 Alert para ver cuando se dispara el evento
        // alert(`📍 Evento watchPosition disparado!\nLat: ${latitude.toFixed(6)}\nLng: ${longitude.toFixed(6)}`);
        
        const newLocation: LocationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: Date.now(),
        };

        setLocation(newLocation);
        setStatus('Ubicación actualizada');
        setError(null);

        // Enviar ubicación al servidor
        if (isConnected) {
          sendLocation(latitude, longitude, accuracy);
        }

        // Actualizar el mapa
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 1000,
          });

          // Remover marcador anterior si existe
          if (marker.current) {
            marker.current.remove();
          }

          // Crear nuevo marcador
          marker.current = new mapboxgl.Marker({ color: '#FF6B6B' })
            .setLngLat([longitude, latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div style="font-family: Arial; font-size: 13px;">
                  <strong>📍 Tu Ubicación</strong><br/>
                  Lat: ${latitude.toFixed(6)}<br/>
                  Lng: ${longitude.toFixed(6)}<br/>
                  Precisión: ${accuracy.toFixed(0)}m
                </div>`
              )
            )
            .addTo(map.current);

          // Dibujar círculo de precisión
          if (!accuracyCircle.current) {
            accuracyCircle.current = new mapboxgl.Marker({ color: 'transparent' })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }

          // Actualizar fuente GeoJSON para mostrar círculo de precisión
          if (!map.current.getSource('accuracy-circle')) {
            map.current.addSource('accuracy-circle', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [longitude, latitude],
                },
                properties: {},
              },
            });

            map.current.addLayer({
              id: 'accuracy-circle',
              type: 'circle',
              source: 'accuracy-circle',
              paint: {
                'circle-radius': {
                  type: 'exponential',
                  stops: [
                    [0, 0],
                    [20, accuracy / 111000 * Math.pow(2, 20)],
                  ],
                  base: 2,
                },
                'circle-color': '#FF6B6B',
                'circle-opacity': 0.1,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#FF6B6B',
                'circle-stroke-opacity': 0.5,
              },
            });
          } else {
            const source = map.current.getSource('accuracy-circle') as any;
            source.setData({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              properties: {},
            });

            map.current.setPaintProperty('accuracy-circle', 'circle-radius', {
              type: 'exponential',
              stops: [
                [0, 0],
                [20, accuracy / 111000 * Math.pow(2, 20)],
              ],
              base: 2,
            });
          }
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        setError(`Error: ${error.message}`);
        setStatus('Error');
      },
      options
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [isTracking]);

  // Actualizar marcadores de usuarios remotos
  useEffect(() => {
    if (!map.current) return;

    const markersMap = remoteMarkersRef.current;
    if (!markersMap) return;

    remoteLocations.forEach((remoteLocation) => {
      const markerId = remoteLocation.userId;

      if (markersMap.has(markerId)) {
        // Actualizar marcador existente
        const existingMarker = markersMap.get(markerId)!;
        existingMarker.setLngLat([remoteLocation.longitude, remoteLocation.latitude]);
      } else {
        // Crear nuevo marcador para usuario remoto
        const newMarker = new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat([remoteLocation.longitude, remoteLocation.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-family: Arial; font-size: 13px;">
                <strong>👤 ${remoteLocation.username}</strong><br/>
                Lat: ${remoteLocation.latitude.toFixed(6)}<br/>
                Lng: ${remoteLocation.longitude.toFixed(6)}<br/>
                ${remoteLocation.accuracy ? `Precisión: ${remoteLocation.accuracy.toFixed(0)}m` : ''}
              </div>`
            )
          )
          .addTo(map.current);

        markersMap.set(markerId, newMarker);
      }
    });

    // Remover marcadores de usuarios que se desconectaron
    markersMap.forEach((marker, markerId) => {
      if (!remoteLocations.has(markerId)) {
        marker.remove();
        markersMap.delete(markerId);
      }
    });
  }, [remoteLocations]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <>
     <div
      ref={mapContainer}
      className={styles.mapContainer}
    />
    
    </>

      
    )
}
