// src/components/MetricCard.tsx
import React from 'react';
import { MetricCardProps } from '../types/weather';

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  color, 
  border_color,
  bar_color,
  unit,
  progressValue 
}) => {
  const borderColor = `border-${border_color.split('#')[1]}`;
  
  return (
    <div 
      className={`rounded-lg p-4 shadow-sm border ${borderColor}`}
      style={{ backgroundColor: `${color}80`, borderColor: color }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-gray-700 mt-1">{description}</p>
        </div>
        <p className="text-2xl font-bold">
          {value}{unit}
        </p>
      </div>
      <div className="mt-4">
        <div className="w-full bg-[#fff] rounded-full h-2">
          <div 
            className="h-2 rounded-full" 
            style={{ 
              width: `${progressValue}%`, 
              backgroundColor: bar_color 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;