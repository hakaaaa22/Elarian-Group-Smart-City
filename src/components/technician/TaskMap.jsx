import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { MapPin, Navigation, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const priorityColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6'
};

const statusColors = {
  pending: '#6b7280',
  in_progress: '#f59e0b',
  completed: '#22c55e'
};

function MapController({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function TaskMap({ tasks, currentLocation, onSelectTask, onNavigate }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const center = currentLocation || { lat: 24.7136, lng: 46.6753 };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    onSelectTask?.(task);
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={[center.lat, center.lng]} />

        {/* Current Location */}
        {currentLocation && (
          <>
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={100}
              pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.2 }}
            />
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={createCustomIcon('#22d3ee')}
            >
              <Popup>
                <div className="text-center p-1">
                  <p className="font-bold text-sm">موقعك الحالي</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Task Markers */}
        {tasks.map((task) => (
          <Marker
            key={task.id}
            position={[task.coordinates.lat, task.coordinates.lng]}
            icon={createCustomIcon(
              task.status === 'completed' ? statusColors.completed :
              task.status === 'in_progress' ? statusColors.in_progress :
              priorityColors[task.priority]
            )}
            eventHandlers={{
              click: () => handleTaskClick(task)
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm">{task.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                    task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{task.location}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{task.scheduledTime}</span>
                  <span>•</span>
                  <span>{task.distance}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-7 text-xs bg-cyan-600 hover:bg-cyan-700"
                    onClick={() => onNavigate?.(task)}
                  >
                    <Navigation className="w-3 h-3 ml-1" />
                    توجيه
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                    onClick={() => onSelectTask?.(task)}
                  >
                    التفاصيل
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg z-[1000]">
        <p className="text-xs font-bold mb-2 text-gray-700">دليل الألوان</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">أولوية عالية</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">جارية / متوسطة</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">مكتملة</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-gray-600">موقعك</span>
          </div>
        </div>
      </div>
    </div>
  );
}