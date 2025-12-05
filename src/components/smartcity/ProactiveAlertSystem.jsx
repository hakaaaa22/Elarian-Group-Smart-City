import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  AlertTriangle, Bell, CloudRain, Zap, Wind, Thermometer, Shield,
  Clock, CheckCircle, Users, Truck, RefreshCw, Play, Settings, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const predictiveData = {
  weather: { temp: 38, humidity: 45, windSpeed: 25, rainProbability: 65 },
  energy: { currentDemand: 2.4, peakForecast: 3.2, gridCapacity: 3.0 },
  environment: { airQuality: 78, co2Level: 420, noiseLevel: 65 },
};

export default function ProactiveAlertSystem() {
  const [proactiveAlerts, setProactiveAlerts] = useState([]);
  const [settings, setSettings] = useState({
    autoGenerate: true,
    notifyTeams: true,
    suggestActions: true,
    preemptiveTime: 60, // minutes
  });

  // Generate Proactive Alerts
  const generateAlerts = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في إدارة المدن الذكية، قم بتحليل البيانات التنبؤية وإنشاء تنبيهات استباقية:

بيانات الطقس الحالية:
- درجة الحرارة: ${predictiveData.weather.temp}°C
- الرطوبة: ${predictiveData.weather.humidity}%
- سرعة الرياح: ${predictiveData.weather.windSpeed} كم/س
- احتمالية الأمطار: ${predictiveData.weather.rainProbability}%

بيانات شبكة الطاقة:
- الطلب الحالي: ${predictiveData.energy.currentDemand} MW
- ذروة متوقعة: ${predictiveData.energy.peakForecast} MW
- سعة الشبكة: ${predictiveData.energy.gridCapacity} MW

بيانات البيئة:
- جودة الهواء: ${predictiveData.environment.airQuality}/100
- مستوى CO2: ${predictiveData.environment.co2Level} ppm
- مستوى الضوضاء: ${predictiveData.environment.noiseLevel} dB

وقت الاستباق المطلوب: ${settings.preemptiveTime} دقيقة

قم بإنشاء:
1. تنبيهات استباقية للأحداث المحتملة
2. استراتيجيات الاستجابة الأولية
3. تخصيص الموارد المقترح
4. الفرق المطلوب إشعارها`,
        response_json_schema: {
          type: "object",
          properties: {
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: ["weather", "energy", "environment", "infrastructure"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  probability: { type: "number" },
                  timeToEvent: { type: "string" },
                  responseStrategy: { type: "string" },
                  resourceAllocation: {
                    type: "object",
                    properties: {
                      teams: { type: "array", items: { type: "string" } },
                      equipment: { type: "array", items: { type: "string" } },
                      vehicles: { type: "number" }
                    }
                  },
                  preventiveActions: { type: "array", items: { type: "string" } }
                }
              }
            },
            overallRiskLevel: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setProactiveAlerts(data.alerts || []);
      toast.success(`تم إنشاء ${data.alerts?.length || 0} تنبيه استباقي`);
    }
  });

  // Auto-generate alerts periodically
  useEffect(() => {
    if (settings.autoGenerate) {
      const interval = setInterval(() => {
        generateAlerts.mutate();
      }, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [settings.autoGenerate]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'weather': return CloudRain;
      case 'energy': return Zap;
      case 'environment': return Wind;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const acknowledgeAlert = (alertId) => {
    setProactiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast.success('تم الإقرار بالتنبيه');
  };

  const activateResponse = (alert) => {
    if (settings.notifyTeams) {
      toast.success(`تم إشعار الفرق: ${alert.resourceAllocation?.teams?.join(', ')}`);
    }
    toast.info('تم تفعيل خطة الاستجابة');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          نظام التنبيهات الاستباقية
          {proactiveAlerts.some(a => a.severity === 'critical' && !a.acknowledged) && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </h3>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => generateAlerts.mutate()} disabled={generateAlerts.isPending}>
          {generateAlerts.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
          تحليل وتوليد التنبيهات
        </Button>
      </div>

      {/* Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">توليد تلقائي</Label>
              <Switch checked={settings.autoGenerate} onCheckedChange={(v) => setSettings({...settings, autoGenerate: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">إشعار الفرق</Label>
              <Switch checked={settings.notifyTeams} onCheckedChange={(v) => setSettings({...settings, notifyTeams: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">اقتراح إجراءات</Label>
              <Switch checked={settings.suggestActions} onCheckedChange={(v) => setSettings({...settings, suggestActions: v})} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-slate-300 text-sm">وقت الاستباق:</Label>
              <Badge className="bg-cyan-500/20 text-cyan-400">{settings.preemptiveTime} دقيقة</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Conditions Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <CloudRain className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{predictiveData.weather.rainProbability}%</p>
            <p className="text-slate-400 text-sm">احتمال أمطار</p>
          </CardContent>
        </Card>
        <Card className={`border ${predictiveData.energy.peakForecast > predictiveData.energy.gridCapacity ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <CardContent className="p-4 text-center">
            <Zap className={`w-8 h-8 mx-auto mb-2 ${predictiveData.energy.peakForecast > predictiveData.energy.gridCapacity ? 'text-red-400' : 'text-amber-400'}`} />
            <p className="text-2xl font-bold text-white">{predictiveData.energy.peakForecast} MW</p>
            <p className="text-slate-400 text-sm">ذروة متوقعة</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <Wind className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{predictiveData.environment.airQuality}</p>
            <p className="text-slate-400 text-sm">جودة الهواء</p>
          </CardContent>
        </Card>
      </div>

      {/* Proactive Alerts */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            التنبيهات الاستباقية ({proactiveAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proactiveAlerts.length > 0 ? (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {proactiveAlerts.map((alert, i) => {
                  const Icon = getTypeIcon(alert.type);
                  return (
                    <Card key={i} className={`border ${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-white font-bold">{alert.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                                </Badge>
                                <span className="text-slate-400 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {alert.timeToEvent}
                                </span>
                                <span className="text-cyan-400 text-xs">{alert.probability}% احتمالية</span>
                              </div>
                            </div>
                          </div>
                          {alert.acknowledged && <CheckCircle className="w-5 h-5 text-green-400" />}
                        </div>

                        <p className="text-slate-300 text-sm mb-3">{alert.description}</p>

                        {/* Response Strategy */}
                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-3">
                          <p className="text-purple-400 text-xs font-medium mb-1">استراتيجية الاستجابة:</p>
                          <p className="text-white text-sm">{alert.responseStrategy}</p>
                        </div>

                        {/* Resource Allocation */}
                        {alert.resourceAllocation && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="p-2 bg-slate-800/50 rounded text-center">
                              <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                              <p className="text-white text-xs">{alert.resourceAllocation.teams?.length || 0} فرق</p>
                            </div>
                            <div className="p-2 bg-slate-800/50 rounded text-center">
                              <Settings className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                              <p className="text-white text-xs">{alert.resourceAllocation.equipment?.length || 0} معدات</p>
                            </div>
                            <div className="p-2 bg-slate-800/50 rounded text-center">
                              <Truck className="w-4 h-4 text-green-400 mx-auto mb-1" />
                              <p className="text-white text-xs">{alert.resourceAllocation.vehicles || 0} مركبات</p>
                            </div>
                          </div>
                        )}

                        {/* Preventive Actions */}
                        {alert.preventiveActions?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-slate-400 text-xs mb-1">الإجراءات الوقائية:</p>
                            <ul className="space-y-1">
                              {alert.preventiveActions.slice(0, 3).map((action, j) => (
                                <li key={j} className="text-white text-xs flex items-start gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        {!alert.acknowledged && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-slate-600" onClick={() => acknowledgeAlert(alert.id)}>
                              <CheckCircle className="w-3 h-3 ml-1" />
                              إقرار
                            </Button>
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => activateResponse(alert)}>
                              <Play className="w-3 h-3 ml-1" />
                              تفعيل الاستجابة
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">اضغط "تحليل وتوليد التنبيهات" لإنشاء تنبيهات استباقية</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}