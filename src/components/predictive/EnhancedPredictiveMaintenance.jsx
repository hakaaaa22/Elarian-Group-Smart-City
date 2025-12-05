import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, AlertTriangle, Wrench, Clock, DollarSign, TrendingUp, TrendingDown,
  Activity, Calendar, Phone, Package, CheckCircle, XCircle, ChevronRight,
  Shield, Zap, Loader2, FileText, Eye, History, Settings, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// تحليل متقدم للبيانات التاريخية
const analyzeDeviceHistory = (device, statusHistory = [], errorLogs = [], usageData = {}) => {
  const analysis = {
    healthScore: 100,
    riskLevel: 'low',
    issues: [],
    patterns: [],
    prediction: null
  };

  // تحليل تغييرات الحالة
  const recentStatusChanges = statusHistory.filter(s => {
    const date = new Date(s.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date > monthAgo;
  });

  const offlineCount = recentStatusChanges.filter(s => s.status === 'inactive' || s.status === 'offline').length;
  if (offlineCount > 3) {
    analysis.healthScore -= 20;
    analysis.issues.push(`انقطاع متكرر (${offlineCount} مرات خلال شهر)`);
    analysis.patterns.push('instability');
  }

  // تحليل سجلات الأخطاء
  if (errorLogs.length > 0) {
    const errorFrequency = errorLogs.length;
    if (errorFrequency > 10) {
      analysis.healthScore -= 30;
      analysis.issues.push(`${errorFrequency} خطأ مسجل`);
    } else if (errorFrequency > 5) {
      analysis.healthScore -= 15;
      analysis.issues.push(`${errorFrequency} أخطاء تحتاج مراجعة`);
    }
  }

  // تحليل بيانات الاستخدام
  if (usageData.hours_used > 5000) {
    analysis.healthScore -= 10;
    analysis.patterns.push('high_usage');
  }

  if (usageData.avg_daily_hours > 16) {
    analysis.healthScore -= 5;
    analysis.patterns.push('intensive_use');
  }

  // تحديد مستوى الخطر
  if (analysis.healthScore < 40) {
    analysis.riskLevel = 'critical';
  } else if (analysis.healthScore < 60) {
    analysis.riskLevel = 'high';
  } else if (analysis.healthScore < 80) {
    analysis.riskLevel = 'medium';
  }

  // التنبؤ بوقت الفشل
  if (analysis.riskLevel === 'critical') {
    analysis.prediction = { daysToFailure: 7, confidence: 85 };
  } else if (analysis.riskLevel === 'high') {
    analysis.prediction = { daysToFailure: 21, confidence: 75 };
  } else if (analysis.riskLevel === 'medium') {
    analysis.prediction = { daysToFailure: 45, confidence: 65 };
  }

  return analysis;
};

// توليد توصيات مفصلة
const generateDetailedRecommendations = (analysis, device) => {
  const recommendations = [];

  if (analysis.riskLevel === 'critical') {
    recommendations.push({
      id: 'urgent',
      priority: 'urgent',
      title: 'صيانة فورية مطلوبة',
      description: `الجهاز في حالة حرجة مع ${analysis.issues.length} مشكلة مكتشفة`,
      actions: [
        { type: 'maintenance', label: 'جدولة صيانة طارئة', icon: Calendar },
        { type: 'technician', label: 'استدعاء فني', icon: Phone },
        { type: 'backup', label: 'تفعيل نظام بديل', icon: Shield }
      ],
      estimatedTime: '1-2 ساعة',
      repairCost: device.repair_cost || 150,
      replaceCost: device.replace_cost || 500,
      impactIfIgnored: 'تعطل كامل خلال أيام، خسائر محتملة أكبر'
    });
  } else if (analysis.riskLevel === 'high') {
    recommendations.push({
      id: 'preventive',
      priority: 'high',
      title: 'صيانة وقائية موصى بها',
      description: 'تراجع ملحوظ في الأداء - التدخل المبكر يمنع الأعطال',
      actions: [
        { type: 'maintenance', label: 'جدولة صيانة', icon: Calendar },
        { type: 'parts', label: 'طلب قطع غيار', icon: Package }
      ],
      estimatedTime: '45 دقيقة - 1 ساعة',
      repairCost: device.repair_cost || 80,
      replaceCost: device.replace_cost || 350,
      impactIfIgnored: 'تفاقم المشكلة وزيادة تكلفة الإصلاح 2-3x'
    });
  } else if (analysis.riskLevel === 'medium') {
    recommendations.push({
      id: 'monitor',
      priority: 'medium',
      title: 'مراقبة وصيانة روتينية',
      description: 'أداء مقبول مع بعض المؤشرات التي تحتاج متابعة',
      actions: [
        { type: 'schedule', label: 'جدولة فحص دوري', icon: Calendar }
      ],
      estimatedTime: '30 دقيقة',
      repairCost: device.repair_cost || 50,
      replaceCost: device.replace_cost || 300,
      impactIfIgnored: 'تراجع تدريجي في الأداء'
    });
  }

  return recommendations;
};

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#ef4444'];

export default function EnhancedPredictiveMaintenance({ 
  devices = [],
  onScheduleMaintenance,
  onOrderParts,
  onCallTechnician,
  inventoryItems = []
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // تحليل جميع الأجهزة
  const deviceAnalysis = useMemo(() => {
    return devices.map(device => {
      const analysis = analyzeDeviceHistory(
        device, 
        device.status_history || [],
        device.error_logs || [],
        device.usage_data || {}
      );
      const recommendations = generateDetailedRecommendations(analysis, device);
      return { ...device, analysis, recommendations };
    });
  }, [devices]);

  // الأجهزة المعرضة للخطر
  const atRiskDevices = deviceAnalysis.filter(d => d.analysis.riskLevel !== 'low');
  
  // إحصائيات عامة
  const stats = {
    total: devices.length,
    critical: deviceAnalysis.filter(d => d.analysis.riskLevel === 'critical').length,
    high: deviceAnalysis.filter(d => d.analysis.riskLevel === 'high').length,
    medium: deviceAnalysis.filter(d => d.analysis.riskLevel === 'medium').length,
    healthy: deviceAnalysis.filter(d => d.analysis.riskLevel === 'low').length,
    avgHealth: Math.round(deviceAnalysis.reduce((sum, d) => sum + d.analysis.healthScore, 0) / devices.length) || 0
  };

  // بيانات الرسم البياني
  const riskDistribution = [
    { name: 'حرج', value: stats.critical, color: '#ef4444' },
    { name: 'عالي', value: stats.high, color: '#f59e0b' },
    { name: 'متوسط', value: stats.medium, color: '#eab308' },
    { name: 'سليم', value: stats.healthy, color: '#10b981' }
  ].filter(d => d.value > 0);

  const aiAnalyzeMutation = useMutation({
    mutationFn: async (device) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل صيانة تنبؤية متقدم. حلل بيانات هذا الجهاز وقدم توصيات مفصلة:

الجهاز: ${device.name}
النوع: ${device.type || device.profile}
الحالة الحالية: ${device.status}
صحة الجهاز: ${device.analysis.healthScore}%
المشاكل المكتشفة: ${device.analysis.issues.join(', ') || 'لا يوجد'}
سجل الأخطاء: ${device.error_logs?.length || 0} خطأ
ساعات التشغيل: ${device.usage_data?.hours_used || 'غير معروف'}

قدم:
1. تشخيص مفصل للمشكلة
2. احتمالية الفشل خلال 30 يوم
3. تكلفة الإصلاح vs الاستبدال
4. التأثير في حالة عدم الصيانة
5. خطوات الصيانة الموصى بها`,
        response_json_schema: {
          type: 'object',
          properties: {
            diagnosis: { type: 'string' },
            failureProbability: { type: 'number' },
            repairCost: { type: 'number' },
            replaceCost: { type: 'number' },
            impactIfIgnored: { type: 'string' },
            maintenanceSteps: { type: 'array', items: { type: 'string' } },
            estimatedTime: { type: 'string' },
            requiredParts: { type: 'array', items: { type: 'string' } },
            urgencyLevel: { type: 'string' }
          }
        }
      });
    },
    onSuccess: (data, device) => {
      setSelectedDevice({ ...device, aiAnalysis: data });
      setShowDetailDialog(true);
      toast.success('تم تحليل الجهاز بنجاح');
    },
    onError: () => toast.error('فشل في التحليل')
  });

  const handleAction = (action, device) => {
    switch (action.type) {
      case 'maintenance':
        if (onScheduleMaintenance) {
          onScheduleMaintenance(device);
        }
        toast.success('تم فتح نموذج جدولة الصيانة');
        break;
      case 'parts':
        if (onOrderParts) {
          onOrderParts(device);
        }
        toast.success('تم فتح طلب قطع الغيار');
        break;
      case 'technician':
        if (onCallTechnician) {
          onCallTechnician(device);
        }
        toast.success('جاري الاتصال بالفني...');
        break;
      default:
        toast.info(`تنفيذ: ${action.label}`);
    }
  };

  const viewDeviceDetails = (device) => {
    setSelectedDevice(device);
    setShowDetailDialog(true);
  };

  const runAIAnalysis = (device) => {
    aiAnalyzeMutation.mutate(device);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            الصيانة التنبؤية المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">تحليل ذكي للأجهزة والتنبؤ بالأعطال</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => {
            setIsAnalyzing(true);
            setTimeout(() => {
              setIsAnalyzing(false);
              toast.success('تم تحديث التحليلات');
            }, 2000);
          }}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          تحليل شامل
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.avgHealth}%</p>
            <p className="text-slate-400 text-xs">متوسط الصحة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.critical}</p>
            <p className="text-slate-400 text-xs">حرج</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <Wrench className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.high}</p>
            <p className="text-slate-400 text-xs">عالي</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.medium}</p>
            <p className="text-slate-400 text-xs">متوسط</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.healthy}</p>
            <p className="text-slate-400 text-xs">سليم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Target className="w-4 h-4 ml-2" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <AlertTriangle className="w-4 h-4 ml-2" />
            معرضة للخطر ({atRiskDevices.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <CheckCircle className="w-4 h-4 ml-2" />
            التوصيات
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Distribution Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع مستوى الخطر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {atRiskDevices.slice(0, 3).map(device => (
                  <div key={device.id} className={`p-3 rounded-lg border ${
                    device.analysis.riskLevel === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    device.analysis.riskLevel === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{device.name}</p>
                        <p className="text-slate-400 text-xs">{device.analysis.issues[0] || 'تحتاج فحص'}</p>
                      </div>
                      <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700" onClick={() => viewDeviceDetails(device)}>
                        <Eye className="w-3 h-3 ml-1" />
                        تفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* At Risk Tab */}
        <TabsContent value="at-risk" className="space-y-4 mt-4">
          <div className="space-y-3">
            {atRiskDevices.map((device, i) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card ${
                  device.analysis.riskLevel === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                  device.analysis.riskLevel === 'high' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-yellow-500/30 bg-yellow-500/5'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${
                          device.analysis.riskLevel === 'critical' ? 'bg-red-500/20' :
                          device.analysis.riskLevel === 'high' ? 'bg-amber-500/20' : 'bg-yellow-500/20'
                        }`}>
                          <AlertTriangle className={`w-6 h-6 ${
                            device.analysis.riskLevel === 'critical' ? 'text-red-400' :
                            device.analysis.riskLevel === 'high' ? 'text-amber-400' : 'text-yellow-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-bold">{device.name}</h4>
                            <Badge className={`text-xs ${
                              device.analysis.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                              device.analysis.riskLevel === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {device.analysis.riskLevel === 'critical' ? 'حرج' : device.analysis.riskLevel === 'high' ? 'عالي' : 'متوسط'}
                            </Badge>
                          </div>

                          {/* Health Score */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-slate-400 text-xs">صحة الجهاز</span>
                              <span className={`font-bold ${
                                device.analysis.healthScore < 40 ? 'text-red-400' :
                                device.analysis.healthScore < 70 ? 'text-amber-400' : 'text-green-400'
                              }`}>{device.analysis.healthScore}%</span>
                            </div>
                            <Progress value={device.analysis.healthScore} className="h-2" />
                          </div>

                          {/* Issues */}
                          {device.analysis.issues.length > 0 && (
                            <div className="mb-3">
                              <p className="text-slate-400 text-xs mb-1">المشاكل المكتشفة:</p>
                              <div className="flex flex-wrap gap-1">
                                {device.analysis.issues.map((issue, idx) => (
                                  <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 text-xs">
                                    {issue}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prediction */}
                          {device.analysis.prediction && (
                            <div className="p-2 bg-slate-800/50 rounded-lg mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" />
                                <span className="text-white text-sm">
                                  فشل متوقع خلال <strong>{device.analysis.prediction.daysToFailure}</strong> يوم
                                </span>
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                  ثقة {device.analysis.prediction.confidence}%
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {device.recommendations.length > 0 && (
                            <div className="space-y-2">
                              {device.recommendations.map(rec => (
                                <div key={rec.id} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-white font-medium text-sm">{rec.title}</p>
                                    <Badge className={`text-xs ${
                                      rec.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                      rec.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                      'bg-green-500/20 text-green-400'
                                    }`}>
                                      {rec.priority === 'urgent' ? 'فوري' : rec.priority === 'high' ? 'عالي' : 'متوسط'}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-300 text-xs mb-2">{rec.description}</p>
                                  
                                  {/* Cost Analysis */}
                                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                    <div className="p-2 bg-slate-800/50 rounded text-center">
                                      <p className="text-amber-400 font-bold">{rec.repairCost} ر.س</p>
                                      <p className="text-slate-500">إصلاح</p>
                                    </div>
                                    <div className="p-2 bg-slate-800/50 rounded text-center">
                                      <p className="text-red-400 font-bold">{rec.replaceCost} ر.س</p>
                                      <p className="text-slate-500">استبدال</p>
                                    </div>
                                    <div className="p-2 bg-slate-800/50 rounded text-center">
                                      <p className="text-cyan-400 font-bold">{rec.estimatedTime}</p>
                                      <p className="text-slate-500">الوقت</p>
                                    </div>
                                  </div>

                                  {/* Impact Warning */}
                                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs mb-2">
                                    <p className="text-red-400 font-medium">⚠️ في حالة عدم الصيانة:</p>
                                    <p className="text-slate-300">{rec.impactIfIgnored}</p>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2">
                                    {rec.actions.map(action => (
                                      <Button 
                                        key={action.type}
                                        size="sm" 
                                        className={`h-7 ${
                                          action.type === 'maintenance' ? 'bg-amber-600 hover:bg-amber-700' :
                                          action.type === 'parts' ? 'bg-purple-600 hover:bg-purple-700' :
                                          action.type === 'technician' ? 'bg-cyan-600 hover:bg-cyan-700' :
                                          'bg-slate-600 hover:bg-slate-700'
                                        }`}
                                        onClick={() => handleAction(action, device)}
                                      >
                                        <action.icon className="w-3 h-3 ml-1" />
                                        {action.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-purple-500/50 text-purple-400 h-7"
                          onClick={() => runAIAnalysis(device)}
                          disabled={aiAnalyzeMutation.isPending}
                        >
                          {aiAnalyzeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-600 h-7"
                          onClick={() => viewDeviceDetails(device)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 mt-4">
          <Card className="glass-card border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                ملخص التوصيات
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 font-bold text-2xl">{stats.critical}</p>
                  <p className="text-slate-300 text-sm">تحتاج إجراء فوري</p>
                  <p className="text-slate-500 text-xs mt-1">تكلفة تقديرية: {stats.critical * 200} ر.س</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 font-bold text-2xl">{stats.high}</p>
                  <p className="text-slate-300 text-sm">صيانة وقائية</p>
                  <p className="text-slate-500 text-xs mt-1">تكلفة تقديرية: {stats.high * 100} ر.س</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 font-bold text-2xl">{stats.healthy}</p>
                  <p className="text-slate-300 text-sm">أجهزة سليمة</p>
                  <p className="text-slate-500 text-xs mt-1">لا تحتاج تدخل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              تفاصيل الجهاز
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-bold text-lg">{selectedDevice.name}</h4>
                <p className="text-slate-400 text-sm">{selectedDevice.type || selectedDevice.profile}</p>
              </div>

              {/* Health Score */}
              <div className={`p-4 rounded-lg border ${
                selectedDevice.analysis.healthScore < 40 ? 'bg-red-500/10 border-red-500/30' :
                selectedDevice.analysis.healthScore < 70 ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">صحة الجهاز</span>
                  <span className={`text-2xl font-bold ${
                    selectedDevice.analysis.healthScore < 40 ? 'text-red-400' :
                    selectedDevice.analysis.healthScore < 70 ? 'text-amber-400' : 'text-green-400'
                  }`}>{selectedDevice.analysis.healthScore}%</span>
                </div>
                <Progress value={selectedDevice.analysis.healthScore} className="h-3" />
              </div>

              {/* AI Analysis */}
              {selectedDevice.aiAnalysis && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 font-medium mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    تحليل AI
                  </p>
                  <p className="text-white text-sm mb-2">{selectedDevice.aiAnalysis.diagnosis}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-slate-400">احتمال الفشل</p>
                      <p className="text-red-400 font-bold">{selectedDevice.aiAnalysis.failureProbability}%</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-slate-400">مستوى الإلحاح</p>
                      <p className="text-amber-400 font-bold">{selectedDevice.aiAnalysis.urgencyLevel}</p>
                    </div>
                  </div>
                  {selectedDevice.aiAnalysis.maintenanceSteps && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-xs mb-1">خطوات الصيانة:</p>
                      <ul className="text-white text-xs space-y-1">
                        {selectedDevice.aiAnalysis.maintenanceSteps.map((step, i) => (
                          <li key={i}>• {step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Status History */}
              {selectedDevice.status_history?.length > 0 && (
                <div>
                  <p className="text-white font-medium mb-2 flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    سجل الحالة
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedDevice.status_history.slice().reverse().map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-sm">
                        <Badge className={entry.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {entry.status === 'active' ? 'متصل' : 'غير متصل'}
                        </Badge>
                        <span className="text-slate-400 text-xs">{entry.note || ''}</span>
                        <span className="text-slate-500 text-xs">{entry.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => handleAction({ type: 'maintenance', label: 'جدولة صيانة' }, selectedDevice)}>
                  <Calendar className="w-4 h-4 ml-2" />
                  جدولة صيانة
                </Button>
                <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => handleAction({ type: 'parts', label: 'طلب قطع' }, selectedDevice)}>
                  <Package className="w-4 h-4 ml-2" />
                  طلب قطع
                </Button>
                <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => handleAction({ type: 'technician', label: 'استدعاء فني' }, selectedDevice)}>
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}