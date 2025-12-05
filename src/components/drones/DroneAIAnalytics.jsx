import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Plane, Brain, Eye, AlertTriangle, Shield, MapPin, Video, Camera,
  Target, Activity, Clock, ChevronRight, RefreshCw, Loader2, Play,
  Pause, ZoomIn, Sparkles, Bell, CheckCircle, XCircle
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
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const detectionTypeConfig = {
  vehicle: { icon: Target, color: 'cyan', label: 'مركبة' },
  person: { icon: Target, color: 'blue', label: 'شخص' },
  crowd: { icon: Target, color: 'purple', label: 'تجمع' },
  suspicious_activity: { icon: AlertTriangle, color: 'amber', label: 'نشاط مشبوه' },
  unauthorized_access: { icon: Shield, color: 'red', label: 'دخول غير مصرح' },
  safety_hazard: { icon: AlertTriangle, color: 'orange', label: 'خطر سلامة' },
  fire_smoke: { icon: AlertTriangle, color: 'red', label: 'حريق/دخان' },
  perimeter_breach: { icon: Shield, color: 'red', label: 'اختراق محيط' },
  abandoned_object: { icon: Target, color: 'amber', label: 'جسم مهمل' }
};

const severityConfig = {
  critical: { color: 'red', label: 'حرج' },
  high: { color: 'orange', label: 'عالي' },
  medium: { color: 'amber', label: 'متوسط' },
  low: { color: 'green', label: 'منخفض' },
  info: { color: 'blue', label: 'معلومات' }
};

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6'];

export default function DroneAIAnalytics() {
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const queryClient = useQueryClient();

  const { data: detections = [], isLoading } = useQuery({
    queryKey: ['drone-detections'],
    queryFn: () => base44.entities.DroneDetection.list('-created_date', 100)
  });

  const { data: drones = [] } = useQuery({
    queryKey: ['drones'],
    queryFn: () => base44.entities.Drone.list()
  });

  const analyzeDetectionMutation = useMutation({
    mutationFn: async (detectionId) => {
      const detection = detections.find(d => d.id === detectionId);
      if (!detection) return;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير أمني متخصص في تحليل لقطات الدرونز. قم بتحليل الكشف التالي:

نوع الكشف: ${detectionTypeConfig[detection.detection_type]?.label || detection.detection_type}
الموقع: ${detection.location?.zone || 'غير محدد'}
نسبة الثقة: ${detection.confidence || 0}%
الكائنات المكتشفة: ${JSON.stringify(detection.detected_objects || [])}

قدم:
1. وصف تفصيلي للحدث
2. تقييم المخاطر
3. الإجراءات الموصى بها
4. هل يتطلب إنشاء حادث؟`,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            risk_assessment: { type: "string" },
            recommended_actions: { type: "array", items: { type: "string" } },
            requires_incident: { type: "boolean" }
          }
        }
      });

      await base44.entities.DroneDetection.update(detectionId, {
        ai_analysis: analysis,
        status: 'investigating'
      });

      return analysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drone-detections'] });
      toast.success('تم تحليل الكشف بنجاح');
    }
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (detectionId) => {
      const detection = detections.find(d => d.id === detectionId);
      if (!detection) return;

      const incident = {
        title: `كشف من الدرون: ${detectionTypeConfig[detection.detection_type]?.label}`,
        description: detection.ai_analysis?.description || `تم رصد ${detection.detection_type} بواسطة ${detection.drone_name}`,
        severity: detection.severity,
        status: 'new',
        location: detection.location?.zone,
        source: 'drone'
      };

      const created = await base44.entities.Incident.create(incident);
      await base44.entities.DroneDetection.update(detectionId, {
        incident_created: true,
        linked_incident_id: created.id,
        status: 'confirmed'
      });

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drone-detections'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('تم إنشاء الحادث بنجاح');
    }
  });

  const confirmDetectionMutation = useMutation({
    mutationFn: async ({ detectionId, status }) => {
      await base44.entities.DroneDetection.update(detectionId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drone-detections'] });
      toast.success('تم تحديث حالة الكشف');
    }
  });

  // Stats
  const criticalCount = detections.filter(d => d.severity === 'critical' && d.status === 'new').length;
  const newCount = detections.filter(d => d.status === 'new').length;
  const confirmedCount = detections.filter(d => d.status === 'confirmed').length;
  const incidentsCreated = detections.filter(d => d.incident_created).length;

  // Chart data
  const detectionsByType = detections.reduce((acc, d) => {
    const label = detectionTypeConfig[d.detection_type]?.label || d.detection_type;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(detectionsByType).map(([name, value]) => ({
    name,
    value
  }));

  const detectionsBySeverity = detections.reduce((acc, d) => {
    acc[d.severity] = (acc[d.severity] || 0) + 1;
    return acc;
  }, {});

  const severityChartData = Object.entries(detectionsBySeverity).map(([key, value]) => ({
    name: severityConfig[key]?.label || key,
    count: value
  }));

  const filteredDetections = detections.filter(d => 
    filterSeverity === 'all' || d.severity === filterSeverity
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(34, 211, 238, 0.4)', '0 0 40px rgba(168, 85, 247, 0.4)', '0 0 20px rgba(34, 211, 238, 0.4)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Plane className="w-7 h-7 text-cyan-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              تحليلات الدرونز بالذكاء الاصطناعي
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-slate-500 text-sm">التعرف على الكائنات • اكتشاف الشذوذ • الإبلاغ التلقائي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400 animate-pulse">
            <Activity className="w-3 h-3 ml-1" />
            {drones.filter(d => d.status === 'active').length} درون نشط
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
                <p className="text-slate-500 text-xs">تنبيهات حرجة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-400">{newCount}</p>
                <p className="text-slate-500 text-xs">جديدة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{confirmedCount}</p>
                <p className="text-slate-500 text-xs">مؤكدة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-purple-400">{incidentsCreated}</p>
                <p className="text-slate-500 text-xs">حوادث مُنشأة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detections" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="detections">الاكتشافات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="live">البث المباشر</TabsTrigger>
        </TabsList>

        <TabsContent value="detections">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">اكتشافات الدرونز</CardTitle>
                <div className="flex gap-2">
                  {Object.entries(severityConfig).map(([key, config]) => (
                    <Badge
                      key={key}
                      className={`cursor-pointer ${filterSeverity === key ? `bg-${config.color}-500/30` : 'bg-slate-700/50'} text-${config.color}-400`}
                      onClick={() => setFilterSeverity(filterSeverity === key ? 'all' : key)}
                    >
                      {config.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredDetections.map((detection, index) => {
                    const typeConfig = detectionTypeConfig[detection.detection_type] || detectionTypeConfig.vehicle;
                    const sevConfig = severityConfig[detection.severity] || severityConfig.medium;
                    const TypeIcon = typeConfig.icon;
                    return (
                      <motion.div
                        key={detection.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-${sevConfig.color}-500/50 bg-${sevConfig.color}-500/5 border-${sevConfig.color}-500/30`}
                        onClick={() => setSelectedDetection(detection)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-${typeConfig.color}-500/20`}>
                              <TypeIcon className={`w-5 h-5 text-${typeConfig.color}-400`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">{typeConfig.label}</span>
                                <Badge className={`bg-${sevConfig.color}-500/20 text-${sevConfig.color}-400`}>
                                  {sevConfig.label}
                                </Badge>
                                <Badge className={`${
                                  detection.status === 'new' ? 'bg-amber-500/20 text-amber-400' :
                                  detection.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                  detection.status === 'false_positive' ? 'bg-slate-500/20 text-slate-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {detection.status}
                                </Badge>
                              </div>
                              <p className="text-slate-400 text-sm mb-2">{detection.drone_name}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {detection.location?.zone || 'غير محدد'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {detection.confidence || 0}% ثقة
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(detection.created_date).toLocaleTimeString('ar-SA')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {detection.status === 'new' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    analyzeDetectionMutation.mutate(detection.id);
                                  }}
                                  disabled={analyzeDetectionMutation.isPending}
                                >
                                  <Brain className="w-3 h-3 ml-1" />
                                  تحليل
                                </Button>
                              </>
                            )}
                            {detection.status === 'investigating' && !detection.incident_created && (
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  createIncidentMutation.mutate(detection.id);
                                }}
                              >
                                <Bell className="w-3 h-3 ml-1" />
                                إنشاء حادث
                              </Button>
                            )}
                          </div>
                        </div>
                        {detection.ai_analysis && (
                          <div className="mt-3 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                            <p className="text-purple-400 text-xs">
                              <Brain className="w-3 h-3 inline ml-1" />
                              {detection.ai_analysis.description}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع الاكتشافات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع الخطورة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="live">
          <div className="grid lg:grid-cols-2 gap-4">
            {drones.slice(0, 4).map((drone, i) => (
              <Card key={drone.id || i} className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Plane className="w-4 h-4 text-cyan-400" />
                      {drone.name || `درون ${i + 1}`}
                    </CardTitle>
                    <Badge className={`${drone.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {drone.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-900/50 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-center text-slate-500">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">البث المباشر</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                      <Play className="w-3 h-3 ml-1" />
                      تشغيل
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                      <ZoomIn className="w-3 h-3 ml-1" />
                      تكبير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detection Detail Dialog */}
      <Dialog open={!!selectedDetection} onOpenChange={() => setSelectedDetection(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              تفاصيل الاكتشاف
            </DialogTitle>
          </DialogHeader>
          {selectedDetection && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">النوع</p>
                  <p className="text-white font-medium">{detectionTypeConfig[selectedDetection.detection_type]?.label}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">الدرون</p>
                  <p className="text-white font-medium">{selectedDetection.drone_name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">الموقع</p>
                  <p className="text-white font-medium">{selectedDetection.location?.zone || 'غير محدد'}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">نسبة الثقة</p>
                  <p className="text-cyan-400 font-medium">{selectedDetection.confidence}%</p>
                </div>
              </div>

              {selectedDetection.ai_analysis && (
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    تحليل الذكاء الاصطناعي
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">{selectedDetection.ai_analysis.description}</p>
                  <div className="p-2 bg-slate-900/50 rounded mb-2">
                    <p className="text-amber-400 text-xs">تقييم المخاطر: {selectedDetection.ai_analysis.risk_assessment}</p>
                  </div>
                  {selectedDetection.ai_analysis.recommended_actions?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1">الإجراءات الموصى بها:</p>
                      <ul className="space-y-1">
                        {selectedDetection.ai_analysis.recommended_actions.map((action, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {selectedDetection.status === 'new' && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        confirmDetectionMutation.mutate({ detectionId: selectedDetection.id, status: 'confirmed' });
                        setSelectedDetection(null);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تأكيد
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-600"
                      onClick={() => {
                        confirmDetectionMutation.mutate({ detectionId: selectedDetection.id, status: 'false_positive' });
                        setSelectedDetection(null);
                      }}
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      خاطئ
                    </Button>
                  </>
                )}
                {!selectedDetection.incident_created && selectedDetection.status !== 'false_positive' && (
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      createIncidentMutation.mutate(selectedDetection.id);
                      setSelectedDetection(null);
                    }}
                  >
                    <Bell className="w-4 h-4 ml-2" />
                    إنشاء حادث
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}