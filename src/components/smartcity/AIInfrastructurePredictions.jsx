import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Car, Trash2, Droplets, Zap, AlertTriangle, Brain, RefreshCw, Clock,
  MapPin, TrendingUp, Settings, CheckCircle, Users, Truck, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const trafficData = {
  intersections: [
    { id: 'INT-01', name: 'تقاطع الملك فهد/العليا', currentFlow: 4500, capacity: 5000, congestion: 90 },
    { id: 'INT-02', name: 'تقاطع الطريق الدائري', currentFlow: 3800, capacity: 4500, congestion: 84 },
    { id: 'INT-03', name: 'تقاطع الأمير سلطان', currentFlow: 2200, capacity: 3500, congestion: 63 },
  ],
  peakHours: ['07:30-09:00', '16:00-18:30'],
};

const wasteData = {
  bins: [
    { id: 'BIN-A1', location: 'حي الورود', fillLevel: 85, lastCollection: '2024-12-03' },
    { id: 'BIN-A2', location: 'المنطقة التجارية', fillLevel: 92, lastCollection: '2024-12-02' },
    { id: 'BIN-B1', location: 'الحي السكني', fillLevel: 45, lastCollection: '2024-12-04' },
  ],
  upcomingEvents: ['مهرجان التسوق - 5 ديسمبر', 'مباراة رياضية - 7 ديسمبر'],
};

const infrastructureData = {
  waterPipes: { totalKm: 450, avgAge: 15, recentLeaks: 3 },
  electricGrid: { transformers: 120, loadFactor: 78, outages: 2 },
  streetLights: { total: 12500, faulty: 145, avgAge: 8 },
};

export default function AIInfrastructurePredictions() {
  const [activeTab, setActiveTab] = useState('traffic');
  const [predictions, setPredictions] = useState({});

  // Traffic Prediction
  const trafficPrediction = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في إدارة المرور الذكي، حلل البيانات وقدم توقعات:

التقاطعات:
${trafficData.intersections.map(i => `- ${i.name}: تدفق ${i.currentFlow}/${i.capacity}، ازدحام ${i.congestion}%`).join('\n')}

ساعات الذروة: ${trafficData.peakHours.join(', ')}

قدم:
1. توقعات نقاط الازدحام للساعات الـ 4 القادمة
2. توصيات لضبط إشارات المرور الديناميكية
3. مسارات بديلة مقترحة
4. تخصيص الموارد (دوريات مرور، إشارات)`,
        response_json_schema: {
          type: "object",
          properties: {
            congestionHotspots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  location: { type: "string" },
                  predictedTime: { type: "string" },
                  severity: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            },
            trafficLightAdjustments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  intersection: { type: "string" },
                  currentTiming: { type: "string" },
                  suggestedTiming: { type: "string" },
                  expectedImprovement: { type: "string" }
                }
              }
            },
            alternativeRoutes: { type: "array", items: { type: "string" } },
            resourceAllocation: {
              type: "object",
              properties: {
                patrols: { type: "number" },
                locations: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(prev => ({ ...prev, traffic: data }));
      toast.success('تم تحليل حركة المرور');
    }
  });

  // Waste Management Prediction
  const wastePrediction = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في إدارة النفايات الذكية، حلل البيانات:

الحاويات:
${wasteData.bins.map(b => `- ${b.id} (${b.location}): امتلاء ${b.fillLevel}%، آخر جمع: ${b.lastCollection}`).join('\n')}

الفعاليات القادمة: ${wasteData.upcomingEvents.join(', ')}

قدم:
1. توقعات امتلاء الحاويات للأيام الـ 3 القادمة
2. جدول جمع مقترح محسّن
3. تأثير الفعاليات على حجم النفايات
4. تخصيص الشاحنات والموارد`,
        response_json_schema: {
          type: "object",
          properties: {
            fillPredictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  binId: { type: "string" },
                  location: { type: "string" },
                  predictedFillDate: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            optimizedSchedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  route: { type: "array", items: { type: "string" } },
                  estimatedVolume: { type: "string" }
                }
              }
            },
            eventImpact: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  event: { type: "string" },
                  expectedIncrease: { type: "string" },
                  additionalResources: { type: "string" }
                }
              }
            },
            truckAllocation: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(prev => ({ ...prev, waste: data }));
      toast.success('تم تحليل إدارة النفايات');
    }
  });

  // Infrastructure Prediction
  const infrastructurePrediction = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في صيانة البنية التحتية، حلل البيانات:

شبكة المياه:
- إجمالي الأنابيب: ${infrastructureData.waterPipes.totalKm} كم
- متوسط العمر: ${infrastructureData.waterPipes.avgAge} سنة
- تسربات أخيرة: ${infrastructureData.waterPipes.recentLeaks}

الشبكة الكهربائية:
- المحولات: ${infrastructureData.electricGrid.transformers}
- معامل الحمل: ${infrastructureData.electricGrid.loadFactor}%
- انقطاعات أخيرة: ${infrastructureData.electricGrid.outages}

الإنارة:
- إجمالي الأعمدة: ${infrastructureData.streetLights.total}
- الأعطال: ${infrastructureData.streetLights.faulty}

قدم:
1. توقعات أعطال البنية التحتية
2. مناطق عالية المخاطر
3. جدول صيانة وقائية
4. تخصيص فرق الصيانة`,
        response_json_schema: {
          type: "object",
          properties: {
            failurePredictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  system: { type: "string" },
                  component: { type: "string" },
                  location: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            highRiskAreas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  riskLevel: { type: "string" },
                  issues: { type: "array", items: { type: "string" } }
                }
              }
            },
            maintenanceSchedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  priority: { type: "string" },
                  recommendedDate: { type: "string" },
                  estimatedCost: { type: "string" }
                }
              }
            },
            teamAllocation: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(prev => ({ ...prev, infrastructure: data }));
      toast.success('تم تحليل البنية التحتية');
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': case 'حرج': case 'high': case 'عالي': return 'bg-red-500/20 text-red-400';
      case 'medium': case 'متوسط': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          التحليلات التنبؤية للبنية التحتية
        </h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="traffic" className="data-[state=active]:bg-amber-500/20">
            <Car className="w-4 h-4 ml-1" />
            المرور
          </TabsTrigger>
          <TabsTrigger value="waste" className="data-[state=active]:bg-green-500/20">
            <Trash2 className="w-4 h-4 ml-1" />
            النفايات
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="data-[state=active]:bg-blue-500/20">
            <Zap className="w-4 h-4 ml-1" />
            البنية التحتية
          </TabsTrigger>
        </TabsList>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => trafficPrediction.mutate()} disabled={trafficPrediction.isPending}>
              {trafficPrediction.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
              تحليل المرور
            </Button>
          </div>

          {/* Current Status */}
          <div className="grid md:grid-cols-3 gap-4">
            {trafficData.intersections.map(intersection => (
              <Card key={intersection.id} className={`border ${intersection.congestion > 80 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                <CardContent className="p-4">
                  <p className="text-white font-medium mb-2">{intersection.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={intersection.congestion} className="flex-1 h-2" />
                    <span className={intersection.congestion > 80 ? 'text-red-400' : 'text-amber-400'}>{intersection.congestion}%</span>
                  </div>
                  <p className="text-slate-400 text-xs">{intersection.currentFlow.toLocaleString()}/{intersection.capacity.toLocaleString()} مركبة/س</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Predictions */}
          {predictions.traffic && (
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">نقاط الازدحام المتوقعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {predictions.traffic.congestionHotspots?.map((spot, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white">{spot.location}</span>
                          <Badge className={getSeverityColor(spot.severity)}>{spot.severity}</Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{spot.predictedTime} • ثقة {spot.confidence}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-green-400" />
                    ضبط الإشارات المقترح
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {predictions.traffic.trafficLightAdjustments?.map((adj, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-white text-sm">{adj.intersection}</p>
                        <p className="text-slate-400 text-xs">{adj.currentTiming} → {adj.suggestedTiming}</p>
                        <Badge className="bg-green-500/20 text-green-400 mt-1">{adj.expectedImprovement}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Waste Tab */}
        <TabsContent value="waste" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => wastePrediction.mutate()} disabled={wastePrediction.isPending}>
              {wastePrediction.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
              تحليل النفايات
            </Button>
          </div>

          {/* Current Status */}
          <div className="grid md:grid-cols-3 gap-4">
            {wasteData.bins.map(bin => (
              <Card key={bin.id} className={`border ${bin.fillLevel > 80 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{bin.location}</span>
                    <Trash2 className={`w-5 h-5 ${bin.fillLevel > 80 ? 'text-amber-400' : 'text-green-400'}`} />
                  </div>
                  <Progress value={bin.fillLevel} className="h-3 mb-2" />
                  <p className="text-slate-400 text-xs">امتلاء {bin.fillLevel}% • آخر جمع: {bin.lastCollection}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Predictions */}
          {predictions.waste && (
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">توقعات الامتلاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {predictions.waste.fillPredictions?.map((pred, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white">{pred.location}</p>
                          <p className="text-slate-400 text-xs">يمتلئ: {pred.predictedFillDate}</p>
                        </div>
                        <Badge className={getSeverityColor(pred.priority)}>{pred.priority}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">تأثير الفعاليات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {predictions.waste.eventImpact?.map((event, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-white">{event.event}</p>
                        <p className="text-amber-400 text-sm">زيادة متوقعة: {event.expectedIncrease}</p>
                        <p className="text-slate-400 text-xs">موارد إضافية: {event.additionalResources}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => infrastructurePrediction.mutate()} disabled={infrastructurePrediction.isPending}>
              {infrastructurePrediction.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
              تحليل البنية التحتية
            </Button>
          </div>

          {/* Current Status */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4 text-center">
                <Droplets className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{infrastructureData.waterPipes.totalKm} كم</p>
                <p className="text-slate-400 text-sm">شبكة المياه</p>
                <Badge className="mt-2 bg-amber-500/20 text-amber-400">{infrastructureData.waterPipes.recentLeaks} تسربات</Badge>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{infrastructureData.electricGrid.loadFactor}%</p>
                <p className="text-slate-400 text-sm">حمل الشبكة الكهربائية</p>
                <Badge className="mt-2 bg-red-500/20 text-red-400">{infrastructureData.electricGrid.outages} انقطاعات</Badge>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Lightbulb className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{infrastructureData.streetLights.faulty}</p>
                <p className="text-slate-400 text-sm">أعمدة إنارة معطلة</p>
                <Badge className="mt-2 bg-slate-600 text-slate-300">من {infrastructureData.streetLights.total.toLocaleString()}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Predictions */}
          {predictions.infrastructure && (
            <div className="space-y-4">
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    توقعات الأعطال
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {predictions.infrastructure.failurePredictions?.map((pred, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{pred.system}</span>
                          <Badge className={getSeverityColor(pred.impact)}>{pred.probability}%</Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{pred.component} - {pred.location}</p>
                        <p className="text-slate-500 text-xs">{pred.timeframe}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">جدول الصيانة الوقائية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {predictions.infrastructure.maintenanceSchedule?.map((task, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white">{task.task}</p>
                          <p className="text-slate-400 text-xs">{task.recommendedDate} • {task.estimatedCost}</p>
                        </div>
                        <Badge className={getSeverityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}