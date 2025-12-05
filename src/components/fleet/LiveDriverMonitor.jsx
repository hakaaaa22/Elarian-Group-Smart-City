import React, { useState, useEffect } from 'react';
import {
  User, Gauge, AlertTriangle, MapPin, Activity, Bell, Car,
  TrendingUp, TrendingDown, Shield, Zap, Eye, Send, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const mockDrivers = [
  { 
    id: 1, 
    name: 'محمد أحمد', 
    vehicle: 'أ ب ج 1234',
    status: 'driving',
    currentSpeed: 85,
    speedLimit: 80,
    score: 85,
    location: 'طريق الملك فهد - اتجاه الشمال',
    behavior: {
      harshBraking: 0,
      harshAcceleration: 1,
      speeding: 2,
      idleTime: 5
    },
    trip: { distance: 45.2, duration: '1:15', eta: '15 دقيقة' }
  },
  { 
    id: 2, 
    name: 'خالد السعيد', 
    vehicle: 'د هـ و 5678',
    status: 'idle',
    currentSpeed: 0,
    speedLimit: 60,
    score: 72,
    location: 'المستودع الرئيسي',
    behavior: {
      harshBraking: 3,
      harshAcceleration: 2,
      speeding: 5,
      idleTime: 25
    },
    trip: null
  },
  { 
    id: 3, 
    name: 'عبدالله فهد', 
    vehicle: 'ز ح ط 9012',
    status: 'alert',
    currentSpeed: 125,
    speedLimit: 100,
    score: 58,
    location: 'الطريق السريع - كم 45',
    behavior: {
      harshBraking: 5,
      harshAcceleration: 4,
      speeding: 12,
      idleTime: 8
    },
    trip: { distance: 78.5, duration: '2:30', eta: '25 دقيقة' }
  },
];

export default function LiveDriverMonitor() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [alerts, setAlerts] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(d => ({
        ...d,
        currentSpeed: d.status === 'driving' ? d.currentSpeed + Math.floor(Math.random() * 10) - 5 : d.currentSpeed,
        score: Math.max(0, Math.min(100, d.score + (Math.random() > 0.7 ? -1 : 0)))
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check for dangerous behavior
  useEffect(() => {
    drivers.forEach(driver => {
      if (driver.currentSpeed > driver.speedLimit + 20 && driver.status !== 'idle') {
        const existing = alerts.find(a => a.driverId === driver.id && a.type === 'speeding');
        if (!existing) {
          const newAlert = {
            id: Date.now(),
            driverId: driver.id,
            driverName: driver.name,
            type: 'speeding',
            message: `تجاوز السرعة: ${driver.currentSpeed} كم/س (الحد: ${driver.speedLimit})`,
            time: new Date().toLocaleTimeString('ar-SA'),
            severity: 'high'
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
          toast.error(`تنبيه! ${driver.name} يتجاوز السرعة`, { duration: 5000 });
        }
      }
    });
  }, [drivers]);

  const sendAlert = (driver, type) => {
    toast.success(`تم إرسال تنبيه ${type} إلى ${driver.name}`);
  };

  const callDriver = (driver) => {
    toast.success(`جاري الاتصال بـ ${driver.name}...`);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status, speed, limit) => {
    if (status === 'idle') return <Badge className="bg-slate-500/20 text-slate-400">متوقف</Badge>;
    if (speed > limit + 20) return <Badge className="bg-red-500/20 text-red-400 animate-pulse">خطر!</Badge>;
    if (speed > limit) return <Badge className="bg-amber-500/20 text-amber-400">تجاوز السرعة</Badge>;
    return <Badge className="bg-green-500/20 text-green-400">قيادة آمنة</Badge>;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Live Alerts */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          مراقبة السائقين الحية
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </h3>
        <Badge className="bg-red-500/20 text-red-400">
          <Bell className="w-3 h-3 ml-1" />
          {alerts.length} تنبيه
        </Badge>
      </div>

      {/* Live Alerts Banner */}
      {alerts.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              {alerts.slice(0, 3).map(alert => (
                <Badge key={alert.id} className="bg-red-500/20 text-red-400 flex-shrink-0">
                  {alert.driverName}: {alert.message}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {drivers.map(driver => (
          <Card 
            key={driver.id} 
            className={`cursor-pointer transition-all ${
              driver.status === 'alert' || driver.currentSpeed > driver.speedLimit + 20
                ? 'bg-red-500/10 border-red-500/50 animate-pulse' 
                : driver.status === 'idle' 
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-green-500/5 border-green-500/30'
            }`}
            onClick={() => setSelectedDriver(driver)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    driver.score >= 80 ? 'bg-green-500/20' : driver.score >= 60 ? 'bg-amber-500/20' : 'bg-red-500/20'
                  }`}>
                    <span className={`text-xl font-bold ${getScoreColor(driver.score)}`}>{driver.score}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold">{driver.name}</p>
                    <p className="text-slate-400 text-sm">{driver.vehicle}</p>
                  </div>
                </div>
                {getStatusBadge(driver.status, driver.currentSpeed, driver.speedLimit)}
              </div>

              {/* Speed Gauge */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-sm">السرعة الحالية</span>
                  <span className={`font-bold ${driver.currentSpeed > driver.speedLimit ? 'text-red-400' : 'text-green-400'}`}>
                    {driver.currentSpeed} كم/س
                  </span>
                </div>
                <Progress 
                  value={(driver.currentSpeed / 150) * 100} 
                  className="h-3"
                />
                <p className="text-slate-500 text-xs mt-1">الحد المسموح: {driver.speedLimit} كم/س</p>
              </div>

              {/* Behavior Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <p className={`font-bold ${driver.behavior.harshBraking > 2 ? 'text-red-400' : 'text-white'}`}>
                    {driver.behavior.harshBraking}
                  </p>
                  <p className="text-slate-500 text-[10px]">فرملة</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <p className={`font-bold ${driver.behavior.harshAcceleration > 2 ? 'text-amber-400' : 'text-white'}`}>
                    {driver.behavior.harshAcceleration}
                  </p>
                  <p className="text-slate-500 text-[10px]">تسارع</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <p className={`font-bold ${driver.behavior.speeding > 5 ? 'text-red-400' : 'text-white'}`}>
                    {driver.behavior.speeding}
                  </p>
                  <p className="text-slate-500 text-[10px]">تجاوز</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <p className="text-white font-bold">{driver.behavior.idleTime}د</p>
                  <p className="text-slate-500 text-[10px]">خمول</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{driver.location}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={(e) => { e.stopPropagation(); sendAlert(driver, 'تحذير'); }}>
                  <Bell className="w-3 h-3 ml-1" />
                  تنبيه
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-cyan-500/50 text-cyan-400" onClick={(e) => { e.stopPropagation(); callDriver(driver); }}>
                  <Phone className="w-3 h-3 ml-1" />
                  اتصال
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts History */}
      {alerts.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              سجل التنبيهات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg flex items-center justify-between ${
                  alert.severity === 'high' ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                }`}>
                  <div>
                    <p className="text-white text-sm">{alert.driverName}</p>
                    <p className="text-slate-400 text-xs">{alert.message}</p>
                  </div>
                  <span className="text-slate-500 text-xs">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}