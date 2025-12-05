import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, AlertTriangle, Wrench, Camera, Route, RefreshCw, Bell,
  CheckCircle, Clock, Cpu, Eye, TrendingUp, Zap, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function IntegratedAIPanel() {
  const queryClient = useQueryClient();

  const { data: deviceAlerts = [] } = useQuery({
    queryKey: ['deviceAlerts'],
    queryFn: () => base44.entities.DeviceAlert.filter({ status: 'active' }, '-created_date', 10)
  });

  const { data: cameraAnomalies = [] } = useQuery({
    queryKey: ['cameraAnomalies'],
    queryFn: () => base44.entities.CameraAnomaly.filter({ status: 'new' }, '-created_date', 10)
  });

  // Generate predictive alerts
  const generateAlerts = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت نظام صيانة تنبؤية ذكي. قم بإنشاء 3 تنبيهات صيانة تنبؤية للأجهزة التالية:
- كاميرات مراقبة (متوسط عمر التشغيل 3 سنوات)
- أجهزة استشعار IoT (120 جهاز)
- أجهزة تحكم (25 جهاز)

لكل تنبيه حدد:
- اسم الجهاز ونوعه
- نوع العطل المتوقع
- مستوى الخطورة (critical/high/medium/low)
- الثقة في التنبؤ (نسبة مئوية)
- الأيام حتى العطل المتوقع
- الإجراء الموصى به
- التكلفة التقديرية للإصلاح بالريال`,
        response_json_schema: {
          type: "object",
          properties: {
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  device_name: { type: "string" },
                  device_type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  prediction_confidence: { type: "number" },
                  days_to_failure: { type: "number" },
                  recommended_action: { type: "string" },
                  estimated_cost: { type: "number" }
                }
              }
            }
          }
        }
      });
      
      if (response.alerts) {
        for (const alert of response.alerts) {
          await base44.entities.DeviceAlert.create({
            ...alert,
            alert_type: 'predictive_failure',
            status: 'active',
            predicted_failure_date: new Date(Date.now() + (alert.days_to_failure || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceAlerts'] });
      toast.success('تم إنشاء تنبيهات الصيانة التنبؤية');
    }
  });

  const acknowledgeAlert = useMutation({
    mutationFn: ({ id }) => base44.entities.DeviceAlert.update(id, { 
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceAlerts'] });
      toast.success('تم الاطلاع على التنبيه');
    }
  });

  const severityColors = {
    critical: 'red',
    high: 'amber',
    medium: 'yellow',
    low: 'blue'
  };

  const criticalAlerts = deviceAlerts.filter(a => a.severity === 'critical');
  const highAlerts = deviceAlerts.filter(a => a.severity === 'high');

  return (
    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            مركز الذكاء الاصطناعي
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-cyan-500 text-cyan-400 h-7"
            onClick={() => generateAlerts.mutate()}
            disabled={generateAlerts.isPending}
          >
            {generateAlerts.isPending ? (
              <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
            ) : (
              <Zap className="w-3 h-3 ml-1" />
            )}
            تحليل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{criticalAlerts.length}</p>
            <p className="text-red-400 text-[10px]">حرج</p>
          </div>
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
            <Bell className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{highAlerts.length}</p>
            <p className="text-amber-400 text-[10px]">عالي</p>
          </div>
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
            <Camera className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{cameraAnomalies.length}</p>
            <p className="text-purple-400 text-[10px]">شذوذ</p>
          </div>
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
            <Cpu className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{deviceAlerts.length}</p>
            <p className="text-cyan-400 text-[10px]">إجمالي</p>
          </div>
        </div>

        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="w-full bg-slate-800/50 border border-slate-700 h-8">
            <TabsTrigger value="maintenance" className="text-xs data-[state=active]:bg-cyan-500/20 flex-1">
              <Wrench className="w-3 h-3 ml-1" />
              صيانة تنبؤية
            </TabsTrigger>
            <TabsTrigger value="anomaly" className="text-xs data-[state=active]:bg-purple-500/20 flex-1">
              <Eye className="w-3 h-3 ml-1" />
              شذوذ الكاميرات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maintenance" className="mt-3">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {deviceAlerts.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">لا توجد تنبيهات صيانة</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 border-cyan-500 text-cyan-400"
                      onClick={() => generateAlerts.mutate()}
                    >
                      تشغيل التحليل التنبؤي
                    </Button>
                  </div>
                ) : (
                  deviceAlerts.slice(0, 5).map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-lg bg-${severityColors[alert.severity]}-500/10 border border-${severityColors[alert.severity]}-500/30`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 text-${severityColors[alert.severity]}-400`} />
                          <span className="text-white text-sm font-medium">{alert.title}</span>
                        </div>
                        <Badge className={`bg-${severityColors[alert.severity]}-500/20 text-${severityColors[alert.severity]}-400 text-[10px]`}>
                          {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{alert.device_name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          {alert.prediction_confidence && (
                            <span className="text-cyan-400">ثقة {alert.prediction_confidence}%</span>
                          )}
                          {alert.predicted_failure_date && (
                            <span className="text-slate-500">
                              <Clock className="w-3 h-3 inline ml-1" />
                              {new Date(alert.predicted_failure_date).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 text-xs text-slate-400"
                          onClick={() => acknowledgeAlert.mutate({ id: alert.id })}
                        >
                          <Eye className="w-3 h-3 ml-1" />
                          اطلاع
                        </Button>
                      </div>
                      {alert.estimated_cost && (
                        <p className="text-amber-400 text-xs mt-1">
                          التكلفة التقديرية: {alert.estimated_cost.toLocaleString()} ريال
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="anomaly" className="mt-3">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {cameraAnomalies.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">لا توجد حالات شاذة</p>
                  </div>
                ) : (
                  cameraAnomalies.slice(0, 5).map(anomaly => (
                    <div key={anomaly.id} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm">{anomaly.camera_name}</span>
                        </div>
                        {anomaly.confidence_score && (
                          <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">
                            {anomaly.confidence_score}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs">{anomaly.description?.slice(0, 60)}...</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
          <Link to={createPageUrl('WasteManagement')} className="flex-1">
            <Button size="sm" variant="outline" className="w-full border-green-500/50 text-green-400 h-7 text-xs">
              <Route className="w-3 h-3 ml-1" />
              تحسين المسارات
            </Button>
          </Link>
          <Link to={createPageUrl('ReportsDashboard')} className="flex-1">
            <Button size="sm" variant="outline" className="w-full border-cyan-500/50 text-cyan-400 h-7 text-xs">
              <TrendingUp className="w-3 h-3 ml-1" />
              التقارير
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}