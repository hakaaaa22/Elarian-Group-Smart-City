import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Zap, Shield, Activity, Thermometer, Battery, Wifi, HardDrive,
  ChevronRight, RefreshCw, Settings, Bell, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AISystemHealthWidget({ 
  devices = [], 
  maintenanceRecords = [], 
  inventoryItems = [],
  onViewDetails
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [settings, setSettings] = useState({
    showCriticalOnly: false,
    riskThreshold: 70,
    autoRefresh: true,
    refreshInterval: 30
  });

  // حساب صحة النظام
  const systemHealth = React.useMemo(() => {
    const activeDevices = devices.filter(d => d.status === 'active' || d.status === 'online').length;
    const totalDevices = devices.length || 1;
    const deviceHealth = (activeDevices / totalDevices) * 100;

    const pendingMaintenance = maintenanceRecords.filter(m => 
      m.status === 'scheduled' || m.status === 'pending_parts'
    ).length;
    const criticalMaintenance = maintenanceRecords.filter(m => m.priority === 'critical').length;

    const lowStockItems = inventoryItems.filter(i => 
      i.quantity <= (i.min_quantity || 5)
    ).length;
    const outOfStock = inventoryItems.filter(i => i.quantity === 0).length;

    const overallScore = Math.round(
      (deviceHealth * 0.4) + 
      (Math.max(0, 100 - pendingMaintenance * 10) * 0.3) +
      (Math.max(0, 100 - lowStockItems * 15) * 0.3)
    );

    return {
      score: Math.min(100, Math.max(0, overallScore)),
      deviceHealth: Math.round(deviceHealth),
      activeDevices,
      totalDevices,
      pendingMaintenance,
      criticalMaintenance,
      lowStockItems,
      outOfStock
    };
  }, [devices, maintenanceRecords, inventoryItems]);

  // المخاطر والتوصيات
  const risksAndRecommendations = React.useMemo(() => {
    const risks = [];
    const recommendations = [];

    if (systemHealth.criticalMaintenance > 0) {
      risks.push({
        level: 'critical',
        title: `${systemHealth.criticalMaintenance} مهام صيانة حرجة`,
        description: 'يوجد مهام صيانة بأولوية حرجة تحتاج اهتماماً فورياً'
      });
      recommendations.push({
        priority: 'high',
        action: 'جدولة الفنيين للمهام الحرجة',
        impact: 'تجنب توقف الأجهزة الحرجة'
      });
    }

    if (systemHealth.outOfStock > 0) {
      risks.push({
        level: 'high',
        title: `${systemHealth.outOfStock} قطع نفذت من المخزون`,
        description: 'قطع غيار غير متوفرة قد تؤخر أعمال الصيانة'
      });
      recommendations.push({
        priority: 'high',
        action: 'إنشاء طلبات شراء عاجلة',
        impact: 'تفادي تأخير الصيانة'
      });
    }

    if (systemHealth.lowStockItems > 2) {
      risks.push({
        level: 'medium',
        title: `${systemHealth.lowStockItems} قطع منخفضة المخزون`,
        description: 'قطع غيار على وشك النفاذ'
      });
      recommendations.push({
        priority: 'medium',
        action: 'مراجعة مستويات إعادة الطلب',
        impact: 'تحسين توفر القطع'
      });
    }

    if (systemHealth.deviceHealth < 80) {
      risks.push({
        level: 'medium',
        title: 'انخفاض نسبة الأجهزة النشطة',
        description: `${100 - systemHealth.deviceHealth}% من الأجهزة غير نشطة`
      });
      recommendations.push({
        priority: 'medium',
        action: 'فحص الأجهزة غير النشطة',
        impact: 'استعادة التغطية الكاملة'
      });
    }

    if (systemHealth.pendingMaintenance > 5) {
      risks.push({
        level: 'low',
        title: 'تراكم مهام الصيانة',
        description: `${systemHealth.pendingMaintenance} مهمة بانتظار التنفيذ`
      });
    }

    return { risks, recommendations };
  }, [systemHealth]);

  // تحليل AI
  const analysisMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل ذكاء اصطناعي لنظام إدارة المنشآت. حلل البيانات التالية وقدم ملخصاً تنفيذياً:

بيانات النظام:
- نسبة صحة النظام: ${systemHealth.score}%
- الأجهزة النشطة: ${systemHealth.activeDevices}/${systemHealth.totalDevices}
- مهام الصيانة المعلقة: ${systemHealth.pendingMaintenance}
- المهام الحرجة: ${systemHealth.criticalMaintenance}
- قطع منخفضة المخزون: ${systemHealth.lowStockItems}
- قطع نفذت: ${systemHealth.outOfStock}

قدم تحليلاً مختصراً يتضمن:
1. تقييم عام للوضع
2. أهم 3 توصيات عملية
3. توقعات للأسبوع القادم`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            status: { type: "string", enum: ["excellent", "good", "warning", "critical"] },
            top_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            weekly_forecast: { type: "string" },
            efficiency_score: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('فشل تحليل AI');
      setIsAnalyzing(false);
    }
  });

  const runAnalysis = () => {
    setIsAnalyzing(true);
    analysisMutation.mutate();
  };

  const riskColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  const statusColors = {
    excellent: 'text-green-400',
    good: 'text-cyan-400',
    warning: 'text-amber-400',
    critical: 'text-red-400'
  };

  return (
    <>
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              ملخص AI لصحة النظام
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowSettings(true)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className={`w-4 h-4 ml-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
                تحليل
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* مؤشر الصحة العام */}
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40" cy="40" r="35"
                  fill="none"
                  stroke="rgba(100,100,100,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="40" cy="40" r="35"
                  fill="none"
                  stroke={systemHealth.score >= 80 ? '#22c55e' : systemHealth.score >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${systemHealth.score * 2.2} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{systemHealth.score}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">صحة النظام</h3>
              <p className="text-slate-400 text-sm">
                {systemHealth.score >= 80 ? 'النظام يعمل بشكل ممتاز' :
                 systemHealth.score >= 60 ? 'يحتاج بعض الاهتمام' : 'يتطلب تدخل فوري'}
              </p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-white text-sm">{systemHealth.activeDevices}/{systemHealth.totalDevices}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-white text-sm">{systemHealth.pendingMaintenance} معلقة</span>
                </div>
              </div>
            </div>
          </div>

          {/* تحليل AI */}
          {analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className={`font-medium ${statusColors[analysis.status] || 'text-white'}`}>
                  {analysis.status === 'excellent' ? 'ممتاز' : 
                   analysis.status === 'good' ? 'جيد' :
                   analysis.status === 'warning' ? 'تحذير' : 'حرج'}
                </span>
                {analysis.efficiency_score && (
                  <Badge className="bg-purple-500/20 text-purple-400 mr-auto">
                    كفاءة {analysis.efficiency_score}%
                  </Badge>
                )}
              </div>
              <p className="text-slate-300 text-sm mb-3">{analysis.summary}</p>
              {analysis.weekly_forecast && (
                <p className="text-slate-400 text-xs italic">
                  <TrendingUp className="w-3 h-3 inline ml-1" />
                  {analysis.weekly_forecast}
                </p>
              )}
            </motion.div>
          )}

          {/* المخاطر */}
          {risksAndRecommendations.risks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                المخاطر المكتشفة
              </h4>
              {risksAndRecommendations.risks
                .filter(r => !settings.showCriticalOnly || r.level === 'critical' || r.level === 'high')
                .slice(0, 3)
                .map((risk, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border ${riskColors[risk.level]}`}
                >
                  <p className="font-medium text-sm">{risk.title}</p>
                  <p className="text-xs opacity-80">{risk.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* التوصيات */}
          {risksAndRecommendations.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                التوصيات
              </h4>
              {risksAndRecommendations.recommendations.slice(0, 3).map((rec, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <div>
                    <p className="text-green-300 text-sm font-medium">{rec.action}</p>
                    <p className="text-slate-400 text-xs">{rec.impact}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-green-400" />
                </div>
              ))}
            </div>
          )}

          {/* توصيات AI */}
          {analysis?.top_recommendations?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                توصيات AI
              </h4>
              {analysis.top_recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                >
                  <p className="text-cyan-300 text-sm font-medium">{rec.action}</p>
                  <p className="text-slate-400 text-xs">{rec.expected_impact}</p>
                </div>
              ))}
            </div>
          )}

          {onViewDetails && (
            <Button 
              variant="outline" 
              className="w-full border-slate-600"
              onClick={onViewDetails}
            >
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل الكاملة
            </Button>
          )}
        </CardContent>
      </Card>

      {/* إعدادات Widget */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              إعدادات ملخص AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">إظهار التنبيهات الحرجة فقط</Label>
              <Switch 
                checked={settings.showCriticalOnly}
                onCheckedChange={(v) => setSettings({...settings, showCriticalOnly: v})}
              />
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">
                عتبة المخاطر: {settings.riskThreshold}%
              </Label>
              <Slider
                value={[settings.riskThreshold]}
                onValueChange={(v) => setSettings({...settings, riskThreshold: v[0]})}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-slate-300">تحديث تلقائي</Label>
              <Switch 
                checked={settings.autoRefresh}
                onCheckedChange={(v) => setSettings({...settings, autoRefresh: v})}
              />
            </div>

            {settings.autoRefresh && (
              <div>
                <Label className="text-slate-300 mb-2 block">
                  فترة التحديث: {settings.refreshInterval} دقيقة
                </Label>
                <Slider
                  value={[settings.refreshInterval]}
                  onValueChange={(v) => setSettings({...settings, refreshInterval: v[0]})}
                  min={5}
                  max={60}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setShowSettings(false);
                toast.success('تم حفظ الإعدادات');
              }}
            >
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}