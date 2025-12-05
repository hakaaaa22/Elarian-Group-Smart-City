import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  CloudRain, Wind, Zap, AlertTriangle, Brain, RefreshCw, Thermometer,
  CloudLightning, Sun, Snowflake, Droplets, Activity, Users, Truck, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const currentConditions = {
  temperature: 38,
  humidity: 45,
  windSpeed: 25,
  pressure: 1013,
  visibility: 8,
  uvIndex: 9,
};

const energyGridStatus = {
  currentLoad: 2.4,
  maxCapacity: 3.0,
  renewableShare: 35,
  peakForecast: 3.2,
  reserves: 15,
};

export default function SmartCityEnvironmentPredictions() {
  const [predictions, setPredictions] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const analyzeEnvironment = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في التنبؤ البيئي وإدارة شبكة الطاقة، حلل البيانات التالية:

الظروف الجوية الحالية:
- درجة الحرارة: ${currentConditions.temperature}°C
- الرطوبة: ${currentConditions.humidity}%
- سرعة الرياح: ${currentConditions.windSpeed} كم/س
- الضغط الجوي: ${currentConditions.pressure} hPa
- مؤشر UV: ${currentConditions.uvIndex}

حالة شبكة الطاقة:
- الحمل الحالي: ${energyGridStatus.currentLoad} MW
- السعة القصوى: ${energyGridStatus.maxCapacity} MW
- نسبة الطاقة المتجددة: ${energyGridStatus.renewableShare}%
- ذروة متوقعة: ${energyGridStatus.peakForecast} MW
- الاحتياطي: ${energyGridStatus.reserves}%

قدم:
1. توقعات للأحداث البيئية غير المتوقعة (عواصف، موجات حر، أمطار غزيرة)
2. توقعات تقلبات شبكة الطاقة والانقطاعات المحتملة
3. تنبيهات استباقية مع مستوى الخطورة
4. اقتراحات تخصيص الموارد لكل سيناريو`,
        response_json_schema: {
          type: "object",
          properties: {
            weatherEvents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  affectedAreas: { type: "array", items: { type: "string" } }
                }
              }
            },
            energyRisks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            proactiveAlerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  severity: { type: "string" },
                  message: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            resourceAllocation: {
              type: "object",
              properties: {
                emergencyTeams: { type: "number" },
                vehicles: { type: "number" },
                equipment: { type: "array", items: { type: "string" } },
                shelters: { type: "number" },
                powerBackup: { type: "string" }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(data);
      setAlerts(data.proactiveAlerts || []);
      toast.success('تم تحليل الظروف البيئية');
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': case 'حرج': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': case 'عالي': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': case 'متوسط': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getWeatherIcon = (type) => {
    if (type?.includes('عاصف') || type?.includes('storm')) return CloudLightning;
    if (type?.includes('مطر') || type?.includes('rain')) return CloudRain;
    if (type?.includes('حر') || type?.includes('heat')) return Sun;
    if (type?.includes('برد') || type?.includes('cold')) return Snowflake;
    return Wind;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CloudLightning className="w-5 h-5 text-amber-400" />
          التنبؤات البيئية وشبكة الطاقة
        </h3>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => analyzeEnvironment.mutate()} disabled={analyzeEnvironment.isPending}>
          {analyzeEnvironment.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
          تحليل شامل
        </Button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Thermometer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{currentConditions.temperature}°C</p>
            <p className="text-slate-400 text-xs">الحرارة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Droplets className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{currentConditions.humidity}%</p>
            <p className="text-slate-400 text-xs">الرطوبة</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <Wind className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{currentConditions.windSpeed}</p>
            <p className="text-slate-400 text-xs">كم/س</p>
          </CardContent>
        </Card>
        <Card className={`border ${energyGridStatus.currentLoad > energyGridStatus.maxCapacity * 0.8 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
          <CardContent className="p-3 text-center">
            <Zap className={`w-5 h-5 mx-auto mb-1 ${energyGridStatus.currentLoad > energyGridStatus.maxCapacity * 0.8 ? 'text-red-400' : 'text-green-400'}`} />
            <p className="text-lg font-bold text-white">{energyGridStatus.currentLoad} MW</p>
            <p className="text-slate-400 text-xs">الحمل</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{energyGridStatus.renewableShare}%</p>
            <p className="text-slate-400 text-xs">متجددة</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <Shield className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{energyGridStatus.reserves}%</p>
            <p className="text-slate-400 text-xs">احتياطي</p>
          </CardContent>
        </Card>
      </div>

      {predictions && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weather Events */}
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                الأحداث البيئية المتوقعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {predictions.weatherEvents?.map((event, i) => {
                    const Icon = getWeatherIcon(event.type);
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(event.severity)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className="text-white font-medium">{event.type}</span>
                          <Badge className={getSeverityColor(event.severity)}>{event.probability}%</Badge>
                        </div>
                        <p className="text-slate-300 text-sm">{event.description}</p>
                        <p className="text-slate-400 text-xs mt-1">{event.timeframe}</p>
                        {event.affectedAreas?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {event.affectedAreas.map((area, j) => (
                              <Badge key={j} className="bg-slate-700 text-slate-300 text-xs">{area}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Energy Risks */}
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                مخاطر شبكة الطاقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {predictions.energyRisks?.map((risk, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{risk.risk}</span>
                        <Badge className={getSeverityColor(risk.impact)}>{risk.probability}%</Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{risk.timeframe}</p>
                      <div className="mt-2 p-2 bg-green-500/10 rounded">
                        <p className="text-green-400 text-xs">التخفيف: {risk.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Proactive Alerts */}
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                التنبيهات الاستباقية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <p className="text-white font-medium">{alert.title}</p>
                    <p className="text-slate-300 text-sm">{alert.message}</p>
                    <p className="text-cyan-400 text-xs mt-1">الإجراء: {alert.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resource Allocation */}
          {predictions.resourceAllocation && (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  تخصيص الموارد المقترح
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Users className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{predictions.resourceAllocation.emergencyTeams}</p>
                    <p className="text-slate-400 text-xs">فرق طوارئ</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Truck className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{predictions.resourceAllocation.vehicles}</p>
                    <p className="text-slate-400 text-xs">مركبات</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Shield className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{predictions.resourceAllocation.shelters}</p>
                    <p className="text-slate-400 text-xs">ملاجئ</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Zap className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">{predictions.resourceAllocation.powerBackup}</p>
                    <p className="text-slate-400 text-xs">طاقة احتياطية</p>
                  </div>
                </div>
                {predictions.resourceAllocation.equipment?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {predictions.resourceAllocation.equipment.map((eq, i) => (
                      <Badge key={i} className="bg-slate-700 text-slate-300">{eq}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!predictions && (
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="py-12 text-center">
            <CloudLightning className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">اضغط "تحليل شامل" لتوليد التنبؤات البيئية</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}