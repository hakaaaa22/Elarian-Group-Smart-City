import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Activity, AlertTriangle, Zap, Thermometer, Wind, Droplets, Gauge,
  Car, Trash2, Radio, Bell, TrendingUp, Eye, MapPin, RefreshCw, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// محاكاة بيانات IoT
const mockIoTStreams = {
  traffic: [
    { sensorId: 'TRF-001', location: 'طريق الملك فهد', congestion: 85, vehicles: 450, avgSpeed: 35, status: 'high' },
    { sensorId: 'TRF-002', location: 'الطريق الدائري', congestion: 45, vehicles: 220, avgSpeed: 75, status: 'normal' },
    { sensorId: 'TRF-003', location: 'شارع العليا', congestion: 92, vehicles: 680, avgSpeed: 25, status: 'critical' },
  ],
  waste: [
    { binId: 'BIN-001', location: 'المنطقة التجارية', fillLevel: 88, temperature: 35, lastCollection: '6 ساعات', status: 'urgent' },
    { binId: 'BIN-002', location: 'حي الورود', fillLevel: 45, temperature: 28, lastCollection: '2 أيام', status: 'normal' },
    { binId: 'BIN-003', location: 'المنتزه', fillLevel: 95, temperature: 40, lastCollection: '8 ساعات', status: 'critical' },
  ],
  environment: [
    { sensorId: 'ENV-001', location: 'وسط المدينة', aqi: 78, temp: 38, humidity: 45, pm25: 35, status: 'normal' },
    { sensorId: 'ENV-002', location: 'المنطقة الصناعية', aqi: 45, temp: 42, humidity: 35, pm25: 65, status: 'warning' },
    { sensorId: 'ENV-003', location: 'الحديقة العامة', aqi: 92, temp: 32, humidity: 55, pm25: 12, status: 'good' },
  ],
  energy: {
    currentLoad: 3200,
    solarGeneration: 1500,
    windGeneration: 450,
    gridUsage: 1250,
    peakPrediction: 4100,
    renewablePercentage: 61,
  },
};

export default function IoTDataHub() {
  const [liveData, setLiveData] = useState(mockIoTStreams);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // AI Predictive Analysis
  const aiPredictionMutation = useMutation({
    mutationFn: async (dataType) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل بيانات IoT التالية وقدم تنبؤات وتوصيات:

نوع البيانات: ${dataType}
البيانات: ${JSON.stringify(liveData[dataType], null, 2)}

قدم:
1. تحليل الوضع الحالي
2. تنبؤات للساعات القادمة
3. تنبيهات وتحذيرات
4. توصيات للتحسين
5. إجراءات مقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            currentAnalysis: { type: "string" },
            predictions: { type: "array", items: { type: "string" } },
            alerts: { type: "array", items: { 
              type: "object",
              properties: {
                severity: { type: "string" },
                message: { type: "string" },
                location: { type: "string" }
              }
            }},
            recommendations: { type: "array", items: { type: "string" } },
            suggestedActions: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      if (data.alerts?.length > 0) {
        setAlerts([...alerts, ...data.alerts]);
        toast.warning(`${data.alerts.length} تنبيهات جديدة`);
      }
    },
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      // Check for anomalies
      const trafficAnomaly = liveData.traffic.find(t => t.congestion > 90);
      if (trafficAnomaly) {
        toast.error(`ازدحام حرج في ${trafficAnomaly.location}!`);
      }

      const wasteCritical = liveData.waste.find(w => w.fillLevel >= 90);
      if (wasteCritical) {
        toast.warning(`حاوية ممتلئة: ${wasteCritical.location}`);
      }

      const envAnomaly = liveData.environment.find(e => e.pm25 > 60);
      if (envAnomaly) {
        toast.error(`تلوث هواء عالي في ${envAnomaly.location}!`);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, liveData]);

  const runPredictiveAnalysis = (type) => {
    aiPredictionMutation.mutate(type);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          مركز بيانات IoT الحي
        </h3>
        <div className="flex items-center gap-2">
          <Badge className={isMonitoring ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-slate-500/20 text-slate-400'}>
            {isMonitoring ? 'مراقبة نشطة' : 'متوقف'}
          </Badge>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setIsMonitoring(!isMonitoring)}>
            {isMonitoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Traffic Monitoring */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-cyan-400" />
              مراقبة حركة المرور الحية
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7" onClick={() => runPredictiveAnalysis('traffic')}>
              <Brain className="w-3 h-3 ml-1" />
              تحليل تنبؤي
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {liveData.traffic.map(sensor => (
              <div key={sensor.sensorId} className={`p-3 rounded-lg border ${
                sensor.status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                sensor.status === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${sensor.status === 'critical' ? 'text-red-400' : sensor.status === 'high' ? 'text-amber-400' : 'text-green-400'}`} />
                    <span className="text-white font-medium">{sensor.location}</span>
                  </div>
                  <Badge className={
                    sensor.status === 'critical' ? 'bg-red-500/20 text-red-400 animate-pulse' :
                    sensor.status === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }>
                    {sensor.status === 'critical' ? 'حرج' : sensor.status === 'high' ? 'مزدحم' : 'طبيعي'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-white font-bold">{sensor.congestion}%</p>
                    <p className="text-slate-500 text-xs">ازدحام</p>
                  </div>
                  <div>
                    <p className="text-cyan-400 font-bold">{sensor.vehicles}</p>
                    <p className="text-slate-500 text-xs">مركبة/س</p>
                  </div>
                  <div>
                    <p className="text-green-400 font-bold">{sensor.avgSpeed}</p>
                    <p className="text-slate-500 text-xs">كم/س</p>
                  </div>
                </div>
                {sensor.status === 'critical' && (
                  <Button size="sm" className="w-full mt-2 bg-red-600 hover:bg-red-700">
                    <Bell className="w-3 h-3 ml-1" />
                    تحويل طوارئ
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waste Collection */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-green-400" />
              تنبيهات جمع النفايات التنبؤية
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7" onClick={() => runPredictiveAnalysis('waste')}>
              <Brain className="w-3 h-3 ml-1" />
              توقع الامتلاء
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {liveData.waste.map(bin => (
              <div key={bin.binId} className="p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">{bin.location}</span>
                  <Badge className={
                    bin.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                    bin.status === 'urgent' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }>
                    {bin.status === 'critical' ? 'حرج' : bin.status === 'urgent' ? 'عاجل' : 'طبيعي'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <Progress value={bin.fillLevel} className="h-3" />
                  </div>
                  <span className={`font-bold ${bin.fillLevel >= 80 ? 'text-red-400' : 'text-green-400'}`}>{bin.fillLevel}%</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>آخر جمع: {bin.lastCollection}</span>
                  <span>الحرارة: {bin.temperature}°C</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Monitoring */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-400" />
              كشف الشذوذ البيئي
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7" onClick={() => runPredictiveAnalysis('environment')}>
              <Brain className="w-3 h-3 ml-1" />
              تحليل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {liveData.environment.map(sensor => (
              <div key={sensor.sensorId} className={`p-4 rounded-lg border ${
                sensor.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                sensor.status === 'good' ? 'bg-green-500/10 border-green-500/30' :
                'bg-slate-800/30 border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium text-sm">{sensor.location}</p>
                  <Badge className={
                    sensor.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    sensor.status === 'good' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {sensor.status === 'warning' ? 'تحذير' : sensor.status === 'good' ? 'جيد' : 'عادي'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <Gauge className="w-5 h-5 text-cyan-400 mx-auto" />
                    <p className="text-white font-bold">{sensor.aqi}</p>
                    <p className="text-slate-500 text-xs">AQI</p>
                  </div>
                  <div>
                    <Thermometer className={`w-5 h-5 mx-auto ${sensor.temp > 40 ? 'text-red-400' : 'text-amber-400'}`} />
                    <p className="text-white font-bold">{sensor.temp}°C</p>
                    <p className="text-slate-500 text-xs">حرارة</p>
                  </div>
                  <div>
                    <Droplets className="w-5 h-5 text-blue-400 mx-auto" />
                    <p className="text-white font-bold">{sensor.humidity}%</p>
                    <p className="text-slate-500 text-xs">رطوبة</p>
                  </div>
                  <div>
                    <Wind className={`w-5 h-5 mx-auto ${sensor.pm25 > 50 ? 'text-red-400' : 'text-green-400'}`} />
                    <p className="text-white font-bold">{sensor.pm25}</p>
                    <p className="text-slate-500 text-xs">PM2.5</p>
                  </div>
                </div>
                {sensor.pm25 > 60 && (
                  <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded">
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      تلوث هواء عالي - تنبيه تلقائي
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy Grid Management */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            إدارة شبكة الطاقة الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-center">
              <p className="text-2xl font-bold text-white">{liveData.energy.currentLoad} MW</p>
              <p className="text-slate-400 text-sm">الحمل الحالي</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
              <p className="text-2xl font-bold text-white">{liveData.energy.solarGeneration} MW</p>
              <p className="text-slate-400 text-sm">طاقة شمسية</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <p className="text-2xl font-bold text-white">{liveData.energy.windGeneration} MW</p>
              <p className="text-slate-400 text-sm">طاقة رياح</p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">
              <p className="text-2xl font-bold text-white">{liveData.energy.renewablePercentage}%</p>
              <p className="text-slate-400 text-sm">طاقة متجددة</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">توصية AI: تحويل 20% من الحمل للطاقة المتجددة</p>
                <p className="text-slate-400 text-sm">توفير متوقع: 450 ر.س/ساعة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}