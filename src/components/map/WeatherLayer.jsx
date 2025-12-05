import React from 'react';
import { motion } from 'framer-motion';
import {
  Cloud, Wind, Thermometer, Droplets, Sun, CloudRain, CloudSnow, Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// بيانات الطقس في الوقت الفعلي
const weatherData = {
  current: {
    temp: 32,
    humidity: 45,
    wind_speed: 18,
    wind_direction: 'شمال شرق',
    visibility: 10,
    condition: 'sunny', // sunny, cloudy, rainy, dusty
    uv_index: 8
  },
  zones: [
    { id: 'zone-center', name: 'المنطقة المركزية', lat: 24.7136, lng: 46.6753, temp: 32, wind: 15, condition: 'sunny' },
    { id: 'zone-east', name: 'المنطقة الشرقية', lat: 24.72, lng: 46.69, temp: 34, wind: 22, condition: 'dusty' },
    { id: 'zone-south', name: 'المنطقة الجنوبية', lat: 24.70, lng: 46.66, temp: 31, wind: 12, condition: 'sunny' },
    { id: 'zone-north', name: 'المنطقة الشمالية', lat: 24.73, lng: 46.68, temp: 30, wind: 20, condition: 'cloudy' },
  ],
  alerts: [
    { type: 'wind', message: 'رياح قوية متوقعة في المنطقة الشرقية', severity: 'warning' },
    { type: 'temp', message: 'ارتفاع درجات الحرارة خلال الظهيرة', severity: 'info' },
  ],
  assetImpacts: [
    { assetId: 'TWR-002', assetName: 'برج المنطقة الشرقية', impact: 'high', reason: 'سرعة رياح تتجاوز الحد الآمن' },
    { assetId: 'CAM-003', assetName: 'كاميرا المنطقة الصناعية', impact: 'medium', reason: 'غبار قد يؤثر على الرؤية' },
  ]
};

const getConditionIcon = (condition) => {
  switch (condition) {
    case 'sunny': return Sun;
    case 'cloudy': return Cloud;
    case 'rainy': return CloudRain;
    case 'dusty': return Wind;
    case 'snowy': return CloudSnow;
    default: return Sun;
  }
};

const getConditionColor = (condition) => {
  switch (condition) {
    case 'sunny': return 'amber';
    case 'cloudy': return 'slate';
    case 'rainy': return 'blue';
    case 'dusty': return 'orange';
    default: return 'amber';
  }
};

export default function WeatherLayer({ onAssetImpactClick }) {
  const ConditionIcon = getConditionIcon(weatherData.current.condition);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Current Weather Summary */}
      <Card className="glass-card border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <ConditionIcon className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{weatherData.current.temp}°C</p>
                <p className="text-slate-400">الطقس الحالي</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-blue-400">
                  <Wind className="w-4 h-4" />
                  <span className="text-lg font-bold">{weatherData.current.wind_speed}</span>
                </div>
                <p className="text-slate-500 text-xs">كم/س</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-cyan-400">
                  <Droplets className="w-4 h-4" />
                  <span className="text-lg font-bold">{weatherData.current.humidity}%</span>
                </div>
                <p className="text-slate-500 text-xs">رطوبة</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-green-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-lg font-bold">{weatherData.current.visibility}</span>
                </div>
                <p className="text-slate-500 text-xs">كم</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Weather */}
      <div>
        <p className="text-white font-medium mb-3">الطقس حسب المنطقة</p>
        <div className="grid grid-cols-2 gap-3">
          {weatherData.zones.map(zone => {
            const ZoneIcon = getConditionIcon(zone.condition);
            const color = getConditionColor(zone.condition);
            return (
              <Card key={zone.id} className={`glass-card border-${color}-500/30 bg-${color}-500/5`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{zone.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white font-bold">{zone.temp}°C</span>
                        <span className="text-slate-400 text-xs">|</span>
                        <Wind className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-400 text-xs">{zone.wind} كم/س</span>
                      </div>
                    </div>
                    <ZoneIcon className={`w-6 h-6 text-${color}-400`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <div>
          <p className="text-white font-medium mb-3">تنبيهات الطقس</p>
          <div className="space-y-2">
            {weatherData.alerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {alert.type === 'wind' ? (
                    <Wind className={`w-4 h-4 ${alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                  ) : (
                    <Thermometer className={`w-4 h-4 ${alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                  )}
                  <p className={`text-sm ${alert.severity === 'warning' ? 'text-amber-300' : 'text-blue-300'}`}>
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Asset Impacts */}
      {weatherData.assetImpacts.length > 0 && (
        <div>
          <p className="text-white font-medium mb-3">تأثير الطقس على الأصول</p>
          <div className="space-y-2">
            {weatherData.assetImpacts.map((impact, i) => (
              <Card
                key={i}
                className={`cursor-pointer hover:scale-[1.02] transition-transform ${
                  impact.impact === 'high' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
                }`}
                onClick={() => onAssetImpactClick?.(impact)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{impact.assetName}</p>
                      <p className="text-slate-400 text-xs">{impact.reason}</p>
                    </div>
                    <Badge className={impact.impact === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                      {impact.impact === 'high' ? 'تأثير عالي' : 'تأثير متوسط'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}