import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Bell, AlertTriangle, Shield, Zap, TrendingUp, Activity, Brain, Settings,
  X, Check, Clock, Filter, Volume2, VolumeX, ChevronDown, ChevronRight,
  Eye, EyeOff, Trash2, RefreshCw, Sparkles, Target, Radio, Car, Package,
  Building2, Droplets, Flame, Thermometer, Wind, Users, Camera, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Alert Categories with AI Analysis
const ALERT_CATEGORIES = [
  { id: 'security', name: 'الأمن', icon: Shield, color: 'red', aiEnabled: true },
  { id: 'traffic', name: 'المرور', icon: Car, color: 'amber', aiEnabled: true },
  { id: 'utilities', name: 'المرافق', icon: Droplets, color: 'blue', aiEnabled: true },
  { id: 'waste', name: 'النفايات', icon: Package, color: 'green', aiEnabled: true },
  { id: 'equipment', name: 'المعدات', icon: Cpu, color: 'purple', aiEnabled: true },
  { id: 'environment', name: 'البيئة', icon: Wind, color: 'cyan', aiEnabled: true },
  { id: 'health', name: 'الصحة', icon: Activity, color: 'pink', aiEnabled: true },
  { id: 'fire', name: 'الحرائق', icon: Flame, color: 'orange', aiEnabled: true },
];

// Severity Levels
const SEVERITY_LEVELS = [
  { id: 'critical', name: 'حرج', color: 'red', priority: 4 },
  { id: 'high', name: 'عالي', color: 'orange', priority: 3 },
  { id: 'medium', name: 'متوسط', color: 'amber', priority: 2 },
  { id: 'low', name: 'منخفض', color: 'blue', priority: 1 },
  { id: 'info', name: 'معلومات', color: 'slate', priority: 0 },
];

// Sample AI-Generated Alerts
const generateAIAlerts = () => [
  {
    id: 'alert-1',
    category: 'security',
    severity: 'critical',
    title: 'نمط غير طبيعي في الوصول',
    message: 'تم اكتشاف محاولات وصول متعددة فاشلة من IP غير معروف',
    aiConfidence: 94,
    timestamp: new Date(Date.now() - 5 * 60000),
    source: 'AI Security Monitor',
    recommendation: 'حظر IP وتفعيل المصادقة الثنائية',
    pattern: 'anomaly',
    affectedSystems: ['بوابة الدخول', 'نظام المصادقة'],
    read: false,
  },
  {
    id: 'alert-2',
    category: 'traffic',
    severity: 'high',
    title: 'ازدحام مروري متوقع',
    message: 'تحليل AI يتوقع ازدحام في الطريق الدائري خلال 30 دقيقة',
    aiConfidence: 87,
    timestamp: new Date(Date.now() - 15 * 60000),
    source: 'AI Traffic Predictor',
    recommendation: 'تفعيل خطة المسارات البديلة',
    pattern: 'prediction',
    affectedSystems: ['إشارات المرور', 'لوحات الإرشاد'],
    read: false,
  },
  {
    id: 'alert-3',
    category: 'utilities',
    severity: 'medium',
    title: 'استهلاك طاقة غير عادي',
    message: 'ارتفاع استهلاك الكهرباء بنسبة 25% عن المعدل',
    aiConfidence: 91,
    timestamp: new Date(Date.now() - 30 * 60000),
    source: 'AI Energy Monitor',
    recommendation: 'فحص المعدات في المنطقة الصناعية',
    pattern: 'threshold',
    affectedSystems: ['شبكة الكهرباء', 'محطات التحويل'],
    read: true,
  },
  {
    id: 'alert-4',
    category: 'equipment',
    severity: 'high',
    title: 'صيانة وقائية مطلوبة',
    message: 'تحليل AI يتوقع عطل في المضخة #7 خلال 48 ساعة',
    aiConfidence: 82,
    timestamp: new Date(Date.now() - 45 * 60000),
    source: 'AI Predictive Maintenance',
    recommendation: 'جدولة صيانة فورية للمضخة',
    pattern: 'prediction',
    affectedSystems: ['نظام المياه', 'المضخات'],
    read: false,
  },
  {
    id: 'alert-5',
    category: 'waste',
    severity: 'low',
    title: 'تحسين مسار الجمع',
    message: 'AI اقترح تحسين مسار جمع النفايات لتوفير 15% من الوقت',
    aiConfidence: 88,
    timestamp: new Date(Date.now() - 60 * 60000),
    source: 'AI Route Optimizer',
    recommendation: 'تطبيق المسار المحسن غداً',
    pattern: 'optimization',
    affectedSystems: ['أسطول النفايات', 'GPS'],
    read: true,
  },
];

export default function SmartAlertSystem({ onClose }) {
  const [alerts, setAlerts] = useState(generateAIAlerts());
  const [activeTab, setActiveTab] = useState('live');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertPreferences, setAlertPreferences] = useState({
    security: { enabled: true, minSeverity: 'low' },
    traffic: { enabled: true, minSeverity: 'medium' },
    utilities: { enabled: true, minSeverity: 'medium' },
    waste: { enabled: true, minSeverity: 'high' },
    equipment: { enabled: true, minSeverity: 'medium' },
    environment: { enabled: true, minSeverity: 'low' },
    health: { enabled: true, minSeverity: 'low' },
    fire: { enabled: true, minSeverity: 'low' },
  });

  // AI Analysis Mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل البيانات التالية واكتشف أي أنماط غير عادية أو تنبيهات محتملة:
        ${JSON.stringify(data)}
        قدم تحليلاً موجزاً بالعربية.`,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            riskLevel: { type: "string" },
          }
        }
      });
    },
  });

  const filteredAlerts = alerts.filter(alert => {
    if (filterCategory !== 'all' && alert.category !== filterCategory) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.read).length;

  const markAsRead = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    toast.success('تم تحديد جميع التنبيهات كمقروءة');
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success('تم حذف التنبيه');
  };

  const updatePreference = (category, field, value) => {
    setAlertPreferences(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const getSeverityColor = (severity) => {
    return SEVERITY_LEVELS.find(s => s.id === severity)?.color || 'slate';
  };

  const getCategoryInfo = (categoryId) => {
    return ALERT_CATEGORIES.find(c => c.id === categoryId) || ALERT_CATEGORIES[0];
  };

  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: criticalCount > 0 ? [
                '0 0 0 rgba(239, 68, 68, 0.4)',
                '0 0 20px rgba(239, 68, 68, 0.6)',
                '0 0 0 rgba(239, 68, 68, 0.4)'
              ] : 'none'
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20"
          >
            <Bell className="w-6 h-6 text-amber-400" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              نظام التنبيهات الذكي
              <Badge className="bg-cyan-500/20 text-cyan-400">
                <Brain className="w-3 h-3 ml-1" />
                AI
              </Badge>
            </h2>
            <p className="text-slate-400 text-sm">
              {unreadCount} تنبيه جديد • {criticalCount} حرج
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4 ml-1" />
            قراءة الكل
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'إجمالي التنبيهات', value: alerts.length, color: 'cyan' },
          { label: 'حرجة', value: alerts.filter(a => a.severity === 'critical').length, color: 'red' },
          { label: 'عالية', value: alerts.filter(a => a.severity === 'high').length, color: 'orange' },
          { label: 'دقة AI', value: '91%', color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الفئات</SelectItem>
            {ALERT_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="الخطورة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع المستويات</SelectItem>
            {SEVERITY_LEVELS.map(sev => (
              <SelectItem key={sev.id} value={sev.id}>{sev.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredAlerts.map((alert, i) => {
            const category = getCategoryInfo(alert.category);
            const CategoryIcon = category.icon;
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:scale-[1.01] ${
                    !alert.read ? `bg-${getSeverityColor(alert.severity)}-500/10 border-${getSeverityColor(alert.severity)}-500/30` : 'bg-slate-800/30 border-slate-700'
                  }`}
                  onClick={() => { setSelectedAlert(alert); markAsRead(alert.id); }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${category.color}-500/20`}>
                        <CategoryIcon className={`w-5 h-5 text-${category.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`bg-${getSeverityColor(alert.severity)}-500/20 text-${getSeverityColor(alert.severity)}-400 text-xs`}>
                            {SEVERITY_LEVELS.find(s => s.id === alert.severity)?.name}
                          </Badge>
                          {alert.aiConfidence && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              <Sparkles className="w-3 h-3 ml-1" />
                              {alert.aiConfidence}% AI
                            </Badge>
                          )}
                          {!alert.read && <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />}
                        </div>
                        <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                        <p className="text-slate-400 text-xs truncate">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(alert.timestamp)}
                          <span>•</span>
                          <span>{alert.source}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}>
                        <X className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 text-${getSeverityColor(selectedAlert?.severity)}-400`} />
              تفاصيل التنبيه
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">{selectedAlert.title}</h4>
                <p className="text-slate-400 text-sm">{selectedAlert.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs">ثقة AI</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedAlert.aiConfidence} className="h-2 flex-1" />
                    <span className="text-purple-400 font-bold text-sm">{selectedAlert.aiConfidence}%</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs">نوع النمط</p>
                  <p className="text-white font-medium">
                    {selectedAlert.pattern === 'anomaly' && 'شذوذ'}
                    {selectedAlert.pattern === 'prediction' && 'تنبؤ'}
                    {selectedAlert.pattern === 'threshold' && 'تجاوز حد'}
                    {selectedAlert.pattern === 'optimization' && 'تحسين'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 text-sm font-medium mb-1">توصية AI:</p>
                <p className="text-white text-sm">{selectedAlert.recommendation}</p>
              </div>

              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-slate-500 text-xs mb-2">الأنظمة المتأثرة:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.affectedSystems?.map((sys, i) => (
                    <Badge key={i} className="bg-slate-700 text-slate-300">{sys}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <Check className="w-4 h-4 ml-2" />
                  تنفيذ التوصية
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <Eye className="w-4 h-4 ml-2" />
                  عرض التفاصيل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات التنبيهات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
            {ALERT_CATEGORIES.map(cat => {
              const pref = alertPreferences[cat.id];
              const CategoryIcon = cat.icon;
              return (
                <div key={cat.id} className="p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className={`w-5 h-5 text-${cat.color}-400`} />
                      <span className="text-white font-medium">{cat.name}</span>
                    </div>
                    <Switch 
                      checked={pref?.enabled} 
                      onCheckedChange={(v) => updatePreference(cat.id, 'enabled', v)}
                    />
                  </div>
                  {pref?.enabled && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">الحد الأدنى:</span>
                      <Select 
                        value={pref?.minSeverity} 
                        onValueChange={(v) => updatePreference(cat.id, 'minSeverity', v)}
                      >
                        <SelectTrigger className="w-32 h-8 bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {SEVERITY_LEVELS.map(sev => (
                            <SelectItem key={sev.id} value={sev.id}>{sev.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowSettings(false); toast.success('تم حفظ الإعدادات'); }}>
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}