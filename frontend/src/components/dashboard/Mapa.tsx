// src/components/dashboard/Mapa.tsx
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { sensorService } from '../../services/sensorService';

mapboxgl.accessToken = "pk.eyJ1IjoiY2VsZXN0ZWNydXp6ZyIsImEiOiJjbTI5MDluYW4wMDloMmxweWIwc3oxcDl3In0.UtROlXtGKA46QV57BFnqAQ";

interface Parcela {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  tipo_cultivo: string;
  latitud: number;
  longitud: number;
}

const Mapa: React.FC = () => {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data for Mapa...');
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login...');
          window.location.href = '/login';
          return;
        }

        console.log('Token found, fetching parcelas data...');
        const data = await sensorService.getParcelasAPI();
        console.log('Received parcelas data:', data);
        
        if (data && data.success && data.parcelas) {
          console.log(`Found ${data.parcelas.length} parcelas`);
          setParcelas(data.parcelas);
          setError(null);
        } else {
          console.log('No parcelas data available or invalid response format');
          setParcelas([]);
          setError('No hay parcelas disponibles');
        }
      } catch (error) {
        console.error('Error loading parcelas:', error);
        setParcelas([]);
        setError('Error al cargar las parcelas');
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-86.88, 21.07],
        zoom: 8,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Watermark minimalista
      const watermark = document.createElement('div');
      watermark.className = 'absolute bottom-1 right-1 text-xs text-gray-500';
      watermark.innerHTML = '© Mapboxgl';
      mapContainer.current.appendChild(watermark);
    }

    // Limpiar marcadores existentes
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const getHeaderColorClass = (tipoCultivo: string): string => {
      const colors: Record<string, string> = {
        'maíz': 'bg-yellow-600',
        'trigo': 'bg-amber-600',
        'soja': 'bg-green-600',
        'girasol': 'bg-orange-500',
        'hortalizas': 'bg-emerald-500',
        'frutales': 'bg-purple-500',
        'vid': 'bg-violet-600',
        'default': 'bg-indigo-600'
      };
      
      return colors[tipoCultivo.toLowerCase()] || colors.default;
    };
    
    const getSensorColorClass = (sensorType: string, value: number): string => {
      // Lógica para colores según valores de sensores
      if (sensorType === 'humedad') {
        if (value < 30) return 'bg-red-500';
        if (value < 60) return 'bg-yellow-500';
        return 'bg-green-500';
      }
      
      if (sensorType === 'temperatura') {
        if (value < 10) return 'bg-blue-500';
        if (value > 30) return 'bg-red-500';
        return 'bg-orange-500';
      }
      
      if (sensorType === 'lluvia') {
        if (value > 5) return 'bg-blue-600';
        return 'bg-blue-400';
      }
      
      if (sensorType === 'sol') {
        if (value < 30) return 'bg-gray-400';
        if (value < 70) return 'bg-yellow-400';
        return 'bg-yellow-500';
      }
      
      return 'bg-indigo-500';
    };

      const formatFecha = (fechaString: string | undefined): string => {
      if (!fechaString) return 'No registrado';
      
      try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', ' •');
      } catch (error) {
        console.error('Error formateando fecha:', error);
        return fechaString;
      }
    };

    // Solo crear marcadores si hay parcelas
    if (parcelas && parcelas.length > 0) {
      // Crear nuevos marcadores con popups mejorados
      parcelas.forEach(parcela => {
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-container';
        popupContent.innerHTML = `
          <div class="bg-white rounded-lg w-72">
            <!-- Encabezado con color dinámico según tipo de cultivo -->
            <div class="${getHeaderColorClass(parcela.tipo_cultivo)} p-4">
              <h3 class="text-white font-bold text-lg truncate">${parcela.nombre}</h3>
              <p class="text-white text-opacity-90 text-sm">${parcela.ubicacion}</p>
            </div>
            
            <!-- Cuerpo del popup -->
            <div class="p-4 space-y-3">
              <!-- Información básica -->
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-start">
                  <svg class="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <div>
                    <p class="text-xs text-gray-500">Responsable</p>
                    <p class="text-sm font-medium text-gray-700">${parcela.responsable}</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <svg class="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  <div>
                    <p class="text-xs text-gray-500">Tipo de cultivo</p>
                    <p class="text-sm font-medium text-gray-700">${parcela.tipo_cultivo}</p>
                  </div>
                </div>
              </div>
      
              <!-- Último riego -->
              <div class="bg-blue-50 p-2 rounded-lg">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p class="text-xs text-blue-600">Último riego</p>
                    <p class="text-sm font-medium text-blue-800">${formatFecha(parcela.ultimo_riego)}</p>
                  </div>
                </div>
              </div>
      
              <!-- Sensores -->
              <div class="border-t pt-3">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Datos de sensores</h4>
                
                <div class="grid grid-cols-2 gap-2">
                  <!-- Humedad -->
                  <div class="flex items-center">
                    <div class="relative">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center 
                        ${getSensorColorClass('humedad', parcela.sensor.humedad)}">
                        <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                      </div>
                      <span class="absolute -bottom-1 -right-1 bg-white rounded-full px-1 text-xs border">
                        ${parcela.sensor.humedad}%
                      </span>
                    </div>
                    <span class="ml-2 text-xs text-gray-600">Humedad</span>
                  </div>
                  
                  <!-- Temperatura -->
                  <div class="flex items-center">
                    <div class="relative">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center 
                        ${getSensorColorClass('temperatura', parcela.sensor.temperatura)}">
                        <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"></path>
                        </svg>
                      </div>
                      <span class="absolute -bottom-1 -right-1 bg-white rounded-full px-1 text-xs border">
                        ${parcela.sensor.temperatura}°
                      </span>
                    </div>
                    <span class="ml-2 text-xs text-gray-600">Temp</span>
                  </div>
                  
                  <!-- Lluvia -->
                  <div class="flex items-center">
                    <div class="relative">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center 
                        ${getSensorColorClass('lluvia', parcela.sensor.lluvia)}">
                        <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                        </svg>
                      </div>
                      <span class="absolute -bottom-1 -right-1 bg-white rounded-full px-1 text-xs border">
                        ${parcela.sensor.lluvia}mm
                      </span>
                    </div>
                    <span class="ml-2 text-xs text-gray-600">Lluvia</span>
                  </div>
                  
                  <!-- Sol -->
                  <div class="flex items-center">
                    <div class="relative">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center 
                        ${getSensorColorClass('sol', parcela.sensor.sol)}">
                        <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                      </div>
                      <span class="absolute -bottom-1 -right-1 bg-white rounded-full px-1 text-xs border">
                        ${parcela.sensor.sol}%
                      </span>
                    </div>
                    <span class="ml-2 text-xs text-gray-600">Sol</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        
        const popup = new mapboxgl.Popup({
          offset: 25,
          anchor: 'left',
          className: 'mapbox-popup' // Clase para estilos adicionales
        }).setDOMContent(popupContent);

        const marker = new mapboxgl.Marker({
          color: '#4F46E5',
          scale: 0.9
        })
          .setLngLat([parcela.longitud, parcela.latitud])
          .setPopup(popup)
          .addTo(map.current!);
        
        markers.current.push(marker);
      });

      // Ajustar vista
      if (parcelas.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        parcelas.forEach(parcela => bounds.extend([parcela.longitud, parcela.latitud]));
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      }
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
    };
  }, [parcelas]);


  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg shadow-md bg-gray-50"
      style={{ minHeight: '450px' }}
    />
  );
};

export default Mapa;