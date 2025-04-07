// src/components/LocationCard.tsx
import { FiMapPin } from "react-icons/fi";

const LocationCard = () => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('es-MX', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <FiMapPin className="text-xl text-red-500" />
        <span className="font-medium">Cancún, Quintana Roo</span>
      </div>
      <div className="text-right">
        <p className="font-semibold">{timeString}</p>
        <p className="text-sm text-gray-600">{dateString}</p>
      </div>
    </div>
  );
};

export default LocationCard;