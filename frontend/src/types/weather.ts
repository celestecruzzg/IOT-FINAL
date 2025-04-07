// src/types/weather.ts
export interface WeatherData {
    temperature: number;
    humidity: number;
    pressure: number;
    timestamp: Date;
  }
  
  export interface WeatherMetrics {
    current: {
      temperature: number;
      humidity: number;
      pressure: number;
    };
    history: WeatherData[];
  }
  
  export interface MetricCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    color: string;
    border_color: string,
    bar_color: string
    unit: string;
    progressValue: number;
  }