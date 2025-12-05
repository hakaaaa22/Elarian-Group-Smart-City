import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  AlertTriangle, Wrench, Clock, TrendingUp, CheckCircle, XCircle,
  RefreshCw, Brain, Cpu, ThermometerSun, Zap, Activity, Bell,
  ChevronRight, Filter, Download, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const severityConfig = {
  critical: { color: 'red', label: 'حرج', icon: AlertTriangle },
  high: { color: 'amber', label: 'عالي', icon: AlertTriangle },
  medium: { color: 'yellow', label: 'متوسط', icon: Bell },
  low: { color: 'blue', label: 'منخفض', icon: Bell }
};

const alertTypeConfig = {
  predictive_failure: { label: 'عطل متوقع', icon: Brain },
  anomaly: { label: 'شذوذ', icon: Activity },
  threshold: { label: 'تجاوز حد', icon: TrendingUp },
  maintenance_due: { label: 'صيانة مستحقة', icon: Wrench },
  performance_degradation: { label: 'تدهور الأداء', icon: TrendingUp }
};

export default function PredictiveMaintenanceAlerts() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['deviceAlerts'],
    queryFn: () => base44.entities.DeviceAlert.list('-created_date', 100)
  });

  const updateAlert = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DeviceAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceAlerts'] });
      toast.success('تم تحديث التنبيه');
    }
  });

  const runPredictiveAnalysis = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في الصيانة التنبؤية، قم بتحليل البيانات التالية وتوقع الأعطال المحتملة:

أنواع الأجهزة المراقبة:
- كاميرات مراقبة (50 جهاز) - متوسط عمر التشغيل 3 سنوات
- أجهزة استشعار IoT (120 جهاز) - متوسط عمر التشغيل 2 سنة
- شاشات عرض (30 جهاز) - متوسط عمر التشغيل 5 سنوات
- أجهزة تحكم (25 جهاز) - متوسط عمر التشغيل 4 سنوات

المعطيات:
- درجة حرارة البيئة: 35°C
- نسبة استخدام الأجهزة: 85%
- عدد ساعات التشغيل اليومية: 24 ساعة

قدم تنبيهات صيانة تنبؤية مع:
1. الأجهزة المعرضة للخطر
2. نوع العطل المتوقع
3. الوقت المتوقع للعطل
4. الإجراء الموصى به
5. التكلفة التقديرية للإصلاح`,
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
                  alert_type: { type: "string" },
                  severity: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  prediction_confidence: { type: "number" },
                  days_to_failure: { type: "number" },
                  recommended_action: { type: "string" },
                  estimated_cost: { type: "number" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_at_risk: { type: "number" },
                critical_count: { type: "number" },
                estimated_total_cost: { type: "number" },
                recommendation: { type: "string" }
              }
            }
          }
        }
      });
    },
    onSuccess: async (data) => {
      if (data.alerts) {
        for (const alert of data.alerts) {
          await base44.entities.DeviceAlert.create({
            device_name: alert.device_name,
            device_type: alert.device_type,
            alert_type: alert.alert_type || 'predictive_failure',
            severity: alert.severity || 'medium',
            title: alert.title,
            description: alert.description,
            prediction_confidence: alert.prediction_confidence,
            predicted_failure_date: new Date(Date.now() + (alert.days_to_failure || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            recommended_action: alert.recommended_action,
            estimated_cost: alert.estimated_cost,
            status: 'active',
            ai_analysis: data.summary
          });
        }
        queryClient.invalidateQueries({ queryKey: ['deviceAlerts'] });
        toast.success(`تم إنشاء ${data.alerts.length} تنبيهات جديدة`);
      }
    }
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchType = filterType === 'all' || alert.alert_type === filterType;
    return matchSeverity && matchType && alert.status === 'active';
  });

  const stats = {
    total: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          تنبيهات الصيانة التنبؤية
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-cyan-500 text-cyan-400"
            onClick={() => runPredictiveAnalysis.mutate()}
            disabled={runPredictiveAnalysis.isPending}
          >
            {runPredictiveAnalysis.isPending ? (
              <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 ml-2" />
            )}
            تحليل تنبؤي
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي التنبيهات</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.critical}</p>
            <p className="text-red-400 text-xs">حرج</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.high}</p>
            <p className="text-amber-400 text-xs">عالي</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.resolved}</p>
            <p className="text-green-400 text-xs">تم الحل</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الخطورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المستويات</SelectItem>
            <SelectItem value="critical">حرج</SelectItem>
            <SelectItem value="high">عالي</SelectItem>
            <SelectItem value="medium">متوسط</SelectItem>
            <SelectItem value="low">منخفض</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="predictive_failure">عطل متوقع</SelectItem>
            <SelectItem value="anomaly">شذوذ</SelectItem>
            <SelectItem value="maintenance_due">صيانة مستحقة</SelectItem>
            <SelectItem value="performance_degradation">تدهور الأداء</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const severity = severityConfig[alert.severity] || severityConfig.medium;
            const alertType = alertTypeConfig[alert.alert_type] || alertTypeConfig.predictive_failure;
            const SeverityIcon = severity.icon;
            const TypeIcon = alertType.icon;

            return (
              <Card 
                key={alert.id} 
                className={`bg-${severity.color}-500/10 border-${severity.color}-500/30 cursor-pointer hover:bg-${severity.color}-500/20 transition-colors`}
                onClick={() => setSelectedAlert(alert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${severity.color}-500/20`}>
                        <SeverityIcon className={`w-5 h-5 text-${severity.color}-400`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">{alert.title}</p>
                          <Badge className={`bg-${severity.color}-500/20 text-${severity.color}-400`}>
                            {severity.label}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{alert.device_name}</p>
                        <p className="text-slate-500 text-xs mt-1">{alert.description?.slice(0, 100)}...</p>
                      </div>
                    </div>
                    <div className="text-left">
                      {alert.prediction_confidence && (
                        <div className="mb-2">
                          <p className="text-slate-500 text-xs">الثقة</p>
                          <p className="text-cyan-400 font-bold">{alert.prediction_confidence}%</p>
                        </div>
                      )}
                      {alert.predicted_failure_date && (
                        <p className="text-slate-500 text-xs">
                          متوقع: {new Date(alert.predicted_failure_date).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد تنبيهات نشطة</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل التنبيه</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">الجهاز</p>
                <p className="text-white font-medium">{selectedAlert.device_name}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">الوصف</p>
                <p className="text-white text-sm">{selectedAlert.description}</p>
              </div>
              {selectedAlert.recommended_action && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-cyan-400 text-xs mb-1">الإجراء الموصى به</p>
                  <p className="text-white text-sm">{selectedAlert.recommended_action}</p>
                </div>
              )}
              {selectedAlert.estimated_cost && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-xs mb-1">التكلفة التقديرية</p>
                  <p className="text-white font-bold">{selectedAlert.estimated_cost.toLocaleString()} ريال</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    updateAlert.mutate({ id: selectedAlert.id, data: { status: 'resolved', resolved_at: new Date().toISOString() } });
                    setSelectedAlert(null);
                  }}
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تم الحل
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-600"
                  onClick={() => {
                    updateAlert.mutate({ id: selectedAlert.id, data: { status: 'acknowledged', acknowledged_at: new Date().toISOString() } });
                    setSelectedAlert(null);
                  }}
                >
                  <Eye className="w-4 h-4 ml-2" />
                  تم الاطلاع
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}