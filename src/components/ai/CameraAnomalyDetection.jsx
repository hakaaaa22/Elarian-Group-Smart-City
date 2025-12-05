import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Camera, AlertTriangle, Eye, Shield, Users, Car, Package, Flame,
  Activity, CheckCircle, XCircle, RefreshCw, Brain, Play, Pause,
  Image, Video, Clock, MapPin, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const anomalyTypes = {
  intrusion: { label: 'تسلل', icon: Shield, color: 'red' },
  loitering: { label: 'تسكع', icon: Users, color: 'amber' },
  crowd: { label: 'تجمهر', icon: Users, color: 'purple' },
  abandoned_object: { label: 'جسم مشبوه', icon: Package, color: 'red' },
  vehicle_violation: { label: 'مخالفة مرورية', icon: Car, color: 'amber' },
  fire_smoke: { label: 'دخان/حريق', icon: Flame, color: 'red' },
  unusual_activity: { label: 'نشاط غير عادي', icon: Activity, color: 'cyan' },
  equipment_tampering: { label: 'عبث بالمعدات', icon: AlertTriangle, color: 'red' }
};

const statusConfig = {
  new: { label: 'جديد', color: 'cyan' },
  investigating: { label: 'قيد التحقيق', color: 'amber' },
  confirmed: { label: 'مؤكد', color: 'red' },
  false_positive: { label: 'إنذار خاطئ', color: 'slate' },
  resolved: { label: 'تم الحل', color: 'green' }
};

export default function CameraAnomalyDetection() {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isLiveDetection, setIsLiveDetection] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: anomalies = [], isLoading } = useQuery({
    queryKey: ['cameraAnomalies'],
    queryFn: () => base44.entities.CameraAnomaly.list('-created_date', 100)
  });

  const updateAnomaly = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CameraAnomaly.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameraAnomalies'] });
      toast.success('تم تحديث الحالة');
    }
  });

  const runAnomalyDetection = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل الفيديو والكشف عن الشذوذ بالذكاء الاصطناعي، قم بمحاكاة اكتشاف حالات شاذة في بث الكاميرات:

الكاميرات النشطة:
- CAM-001: المدخل الرئيسي
- CAM-002: موقف السيارات
- CAM-003: المستودع
- CAM-004: الممر الخارجي
- CAM-005: منطقة التحميل

أنواع الشذوذ المدعومة:
- تسلل (intrusion)
- تسكع (loitering)
- تجمهر (crowd)
- جسم مشبوه (abandoned_object)
- مخالفة مرورية (vehicle_violation)
- دخان/حريق (fire_smoke)
- نشاط غير عادي (unusual_activity)
- عبث بالمعدات (equipment_tampering)

قم بإنشاء 3-5 حالات شاذة تم اكتشافها مع تفاصيل دقيقة.`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  camera_name: { type: "string" },
                  location: { type: "string" },
                  anomaly_type: { type: "string" },
                  severity: { type: "string" },
                  confidence_score: { type: "number" },
                  description: { type: "string" },
                  detected_objects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        confidence: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: async (data) => {
      if (data.anomalies) {
        for (const anomaly of data.anomalies) {
          await base44.entities.CameraAnomaly.create({
            camera_name: anomaly.camera_name,
            location: anomaly.location,
            anomaly_type: anomaly.anomaly_type,
            severity: anomaly.severity || 'medium',
            confidence_score: anomaly.confidence_score,
            description: anomaly.description,
            detected_objects: anomaly.detected_objects,
            status: 'new'
          });
        }
        queryClient.invalidateQueries({ queryKey: ['cameraAnomalies'] });
        toast.success(`تم اكتشاف ${data.anomalies.length} حالات شاذة`);
      }
    }
  });

  // Simulate live detection
  useEffect(() => {
    if (isLiveDetection) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          runAnomalyDetection.mutate();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLiveDetection]);

  const filteredAnomalies = anomalies.filter(a => {
    const matchType = filterType === 'all' || a.anomaly_type === filterType;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchType && matchStatus;
  });

  const stats = {
    total: anomalies.length,
    new: anomalies.filter(a => a.status === 'new').length,
    confirmed: anomalies.filter(a => a.status === 'confirmed').length,
    critical: anomalies.filter(a => a.severity === 'critical').length
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          كشف الشذوذ بالذكاء الاصطناعي
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
            <Label className="text-slate-400 text-sm">الكشف المباشر</Label>
            <Switch checked={isLiveDetection} onCheckedChange={setIsLiveDetection} />
            {isLiveDetection && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => runAnomalyDetection.mutate()}
            disabled={runAnomalyDetection.isPending}
          >
            {runAnomalyDetection.isPending ? (
              <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 ml-2" />
            )}
            تحليل البث
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Camera className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي الاكتشافات</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.new}</p>
            <p className="text-cyan-400 text-xs">جديد</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
            <p className="text-red-400 text-xs">مؤكد</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.critical}</p>
            <p className="text-amber-400 text-xs">حرج</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {Object.entries(anomalyTypes).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Anomalies Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid md:grid-cols-2 gap-3">
          {filteredAnomalies.map(anomaly => {
            const typeConfig = anomalyTypes[anomaly.anomaly_type] || anomalyTypes.unusual_activity;
            const status = statusConfig[anomaly.status] || statusConfig.new;
            const TypeIcon = typeConfig.icon;

            return (
              <Card 
                key={anomaly.id}
                className={`bg-${typeConfig.color}-500/10 border-${typeConfig.color}-500/30 cursor-pointer hover:bg-${typeConfig.color}-500/20 transition-colors`}
                onClick={() => setSelectedAnomaly(anomaly)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-${typeConfig.color}-500/20`}>
                        <TypeIcon className={`w-5 h-5 text-${typeConfig.color}-400`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{typeConfig.label}</p>
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {anomaly.camera_name}
                        </p>
                      </div>
                    </div>
                    <Badge className={`bg-${status.color}-500/20 text-${status.color}-400`}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{anomaly.description?.slice(0, 80)}...</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500 text-xs">{anomaly.location}</span>
                    </div>
                    {anomaly.confidence_score && (
                      <Badge className="bg-purple-500/20 text-purple-400">
                        ثقة {anomaly.confidence_score}%
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Anomaly Details Dialog */}
      <Dialog open={!!selectedAnomaly} onOpenChange={() => setSelectedAnomaly(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل الشذوذ</DialogTitle>
          </DialogHeader>
          {selectedAnomaly && (
            <div className="space-y-4 mt-4">
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                <Camera className="w-12 h-12 text-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الكاميرا</p>
                  <p className="text-white">{selectedAnomaly.camera_name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الموقع</p>
                  <p className="text-white">{selectedAnomaly.location}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">الوصف</p>
                <p className="text-white text-sm">{selectedAnomaly.description}</p>
              </div>
              {selectedAnomaly.detected_objects?.length > 0 && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-400 text-xs mb-2">الكائنات المكتشفة</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnomaly.detected_objects.map((obj, i) => (
                      <Badge key={i} className="bg-slate-700">
                        {obj.type} ({obj.confidence}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    updateAnomaly.mutate({ id: selectedAnomaly.id, data: { status: 'confirmed' } });
                    setSelectedAnomaly(null);
                  }}
                >
                  <AlertTriangle className="w-4 h-4 ml-2" />
                  تأكيد التهديد
                </Button>
                <Button 
                  variant="outline"
                  className="border-slate-600"
                  onClick={() => {
                    updateAnomaly.mutate({ id: selectedAnomaly.id, data: { status: 'false_positive' } });
                    setSelectedAnomaly(null);
                  }}
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  إنذار خاطئ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}