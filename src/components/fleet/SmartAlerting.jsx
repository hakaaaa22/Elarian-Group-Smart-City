import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, Shield, Car, Wrench, Video, Settings, Plus,
  Trash2, Edit, Check, X, Volume2, VolumeX, Mail, MessageSquare,
  Smartphone, Clock, Target, TrendingUp, Activity, Eye, Filter,
  Loader2, Brain, Sparkles, ChevronDown, MoreVertical, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const alertCategories = [
  { id: 'driving', name: 'سلوك القيادة', icon: Car, color: 'cyan' },
  { id: 'vehicle', name: 'أعطال المركبات', icon: Wrench, color: 'amber' },
  { id: 'security', name: 'الأمن والحماية', icon: Shield, color: 'red' },
  { id: 'video', name: 'تحليل الفيديو', icon: Video, color: 'purple' },
  { id: 'geofence', name: 'النطاق الجغرافي', icon: Target, color: 'green' },
];

const severityLevels = [
  { id: 'critical', name: 'حرج', color: 'red' },
  { id: 'high', name: 'عالي', color: 'orange' },
  { id: 'medium', name: 'متوسط', color: 'amber' },
  { id: 'low', name: 'منخفض', color: 'blue' },
];

const notificationChannels = [
  { id: 'app', name: 'إشعار التطبيق', icon: Bell },
  { id: 'email', name: 'البريد الإلكتروني', icon: Mail },
  { id: 'sms', name: 'رسالة SMS', icon: Smartphone },
  { id: 'whatsapp', name: 'واتساب', icon: MessageSquare },
];

const mockAlerts = [
  {
    id: 1,
    title: 'قيادة عدوانية مكتشفة',
    description: 'المركبة ABC-123 تجاوزت حدود السرعة 3 مرات خلال الساعة الماضية',
    category: 'driving',
    severity: 'high',
    timestamp: new Date(),
    vehicle: 'ABC-123',
    driver: 'أحمد محمد',
    status: 'active',
    ai_recommendation: 'يُنصح بإرسال تنبيه للسائق ومراجعة سجل القيادة',
    confidence: 92
  },
  {
    id: 2,
    title: 'خلل في نظام الفرامل',
    description: 'استشعار تآكل غير طبيعي في فرامل المركبة XYZ-789',
    category: 'vehicle',
    severity: 'critical',
    timestamp: new Date(Date.now() - 3600000),
    vehicle: 'XYZ-789',
    status: 'active',
    ai_recommendation: 'يجب سحب المركبة للصيانة فوراً',
    confidence: 88
  },
  {
    id: 3,
    title: 'نشاط مريب مكتشف',
    description: 'تم اكتشاف حركة غير طبيعية قرب المركبة في موقف السيارات',
    category: 'security',
    severity: 'medium',
    timestamp: new Date(Date.now() - 7200000),
    vehicle: 'DEF-456',
    status: 'acknowledged',
    ai_recommendation: 'مراجعة تسجيلات الكاميرا والتحقق من الموقع',
    confidence: 75
  },
];

const defaultAlertRules = [
  { id: 1, name: 'تجاوز السرعة', category: 'driving', threshold: 120, enabled: true },
  { id: 2, name: 'الفرملة الحادة', category: 'driving', threshold: 8, enabled: true },
  { id: 3, name: 'انخفاض الوقود', category: 'vehicle', threshold: 15, enabled: true },
  { id: 4, name: 'خروج من النطاق', category: 'geofence', threshold: 0, enabled: true },
  { id: 5, name: 'كشف تلاعب', category: 'video', threshold: 70, enabled: false },
];

export default function SmartAlerting({ vehicles = [] }) {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [alertRules, setAlertRules] = useState(defaultAlertRules);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    category: 'driving',
    threshold: 50,
    severity: 'medium',
    channels: ['app'],
    enabled: true
  });

  // AI Alert Analysis
  const analyzeAlertMutation = useMutation({
    mutationFn: async (alert) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل تنبيهات إدارة الأساطيل.

قم بتحليل التنبيه التالي وتقديم:
1. تحليل السبب الجذري
2. تقييم المخاطر
3. الإجراءات الموصى بها
4. خطوات المتابعة

التنبيه: ${alert.title}
الوصف: ${alert.description}
الفئة: ${alert.category}
الخطورة: ${alert.severity}
المركبة: ${alert.vehicle}`,
        response_json_schema: {
          type: "object",
          properties: {
            root_cause_analysis: { type: "string" },
            risk_assessment: {
              type: "object",
              properties: {
                level: { type: "string" },
                score: { type: "number" },
                potential_consequences: { type: "array", items: { type: "string" } }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  assignee: { type: "string" },
                  deadline: { type: "string" }
                }
              }
            },
            follow_up_steps: { type: "array", items: { type: "string" } },
            similar_incidents: { type: "number" },
            prevention_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      return response;
    },
    onSuccess: (data, alert) => {
      toast.success('تم تحليل التنبيه');
    }
  });

  const filteredAlerts = alerts.filter(alert => {
    const categoryMatch = selectedCategory === 'all' || alert.category === selectedCategory;
    const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    return categoryMatch && severityMatch;
  });

  const handleAcknowledge = (alertId) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    toast.success('تم التأكيد على التنبيه');
  };

  const handleDismiss = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    toast.info('تم رفض التنبيه');
  };

  const handleToggleRule = (ruleId) => {
    setAlertRules(alertRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const handleAddRule = () => {
    setAlertRules([...alertRules, { ...newRule, id: Date.now() }]);
    setShowNewRule(false);
    setNewRule({ name: '', category: 'driving', threshold: 50, severity: 'medium', channels: ['app'], enabled: true });
    toast.success('تم إضافة القاعدة');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">التنبيهات الذكية</h2>
            <p className="text-slate-400 text-sm">نظام تنبيهات استباقي بالذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/20 text-red-400">
            {alerts.filter(a => a.status === 'active').length} نشط
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Bell className="w-4 h-4 ml-2" />
            التنبيهات
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Settings className="w-4 h-4 ml-2" />
            قواعد التنبيه
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Smartphone className="w-4 h-4 ml-2" />
            تفضيلات الإشعارات
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الفئات</SelectItem>
                {alertCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع المستويات</SelectItem>
                {severityLevels.map(sev => (
                  <SelectItem key={sev.id} value={sev.id}>{sev.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAlerts.map((alert, i) => {
                const category = alertCategories.find(c => c.id === alert.category);
                const CategoryIcon = category?.icon || Bell;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
                      alert.status === 'active' ? 'border-r-4 border-r-red-500' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl bg-${category?.color}-500/20`}>
                            <CategoryIcon className={`w-5 h-5 text-${category?.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-white font-medium">{alert.title}</h3>
                                <p className="text-slate-400 text-sm mt-1">{alert.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`bg-${
                                  alert.severity === 'critical' ? 'red' :
                                  alert.severity === 'high' ? 'orange' :
                                  alert.severity === 'medium' ? 'amber' : 'blue'
                                }-500/20 text-${
                                  alert.severity === 'critical' ? 'red' :
                                  alert.severity === 'high' ? 'orange' :
                                  alert.severity === 'medium' ? 'amber' : 'blue'
                                }-400`}>
                                  {severityLevels.find(s => s.id === alert.severity)?.name}
                                </Badge>
                                {alert.status === 'acknowledged' && (
                                  <Badge className="bg-green-500/20 text-green-400">مُعالج</Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Car className="w-3 h-3" />
                                {alert.vehicle}
                              </span>
                              {alert.driver && (
                                <span>{alert.driver}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(alert.timestamp).toLocaleTimeString('ar-SA')}
                              </span>
                            </div>

                            {/* AI Recommendation */}
                            {alert.ai_recommendation && (
                              <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Brain className="w-4 h-4 text-purple-400" />
                                  <span className="text-purple-400 text-xs font-medium">توصية الذكاء الاصطناعي</span>
                                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">{alert.confidence}% ثقة</Badge>
                                </div>
                                <p className="text-slate-300 text-sm">{alert.ai_recommendation}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              {alert.status === 'active' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAcknowledge(alert.id)}
                                  >
                                    <Check className="w-3 h-3 ml-1" />
                                    تأكيد
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600"
                                    onClick={() => handleDismiss(alert.id)}
                                  >
                                    <X className="w-3 h-3 ml-1" />
                                    رفض
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-purple-400"
                                onClick={() => analyzeAlertMutation.mutate(alert)}
                                disabled={analyzeAlertMutation.isPending}
                              >
                                {analyzeAlertMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                                ) : (
                                  <Brain className="w-3 h-3 ml-1" />
                                )}
                                تحليل متقدم
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredAlerts.length === 0 && (
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">لا توجد تنبيهات</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 ml-2" />
                  قاعدة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1629] border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">إضافة قاعدة تنبيه</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-slate-300">اسم القاعدة</Label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="مثال: تجاوز السرعة القصوى"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">الفئة</Label>
                    <Select value={newRule.category} onValueChange={(v) => setNewRule({ ...newRule, category: v })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {alertCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">الحد الأدنى للتنبيه: {newRule.threshold}</Label>
                    <Slider
                      value={[newRule.threshold]}
                      onValueChange={([v]) => setNewRule({ ...newRule, threshold: v })}
                      min={0}
                      max={200}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">مستوى الخطورة</Label>
                    <Select value={newRule.severity} onValueChange={(v) => setNewRule({ ...newRule, severity: v })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {severityLevels.map(sev => (
                          <SelectItem key={sev.id} value={sev.id}>{sev.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={handleAddRule}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة القاعدة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {alertRules.map(rule => {
              const category = alertCategories.find(c => c.id === rule.category);
              const CategoryIcon = category?.icon || Bell;
              return (
                <Card key={rule.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${category?.color}-500/20`}>
                          <CategoryIcon className={`w-4 h-4 text-${category?.color}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{rule.name}</p>
                          <p className="text-slate-500 text-xs">
                            {category?.name} • الحد: {rule.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                        <Button variant="ghost" size="icon" className="text-slate-400">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">قنوات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationChannels.map(channel => (
                <div key={channel.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <channel.icon className="w-5 h-5 text-slate-400" />
                    <span className="text-white">{channel.name}</span>
                  </div>
                  <Switch defaultChecked={channel.id === 'app' || channel.id === 'email'} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">إعدادات الصوت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">تشغيل صوت للتنبيهات الحرجة</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">وضع عدم الإزعاج الليلي</Label>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}