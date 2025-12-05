import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Calendar, User, Package, Clock, AlertTriangle, Check,
  Play, Zap, Brain, ChevronRight, Plus, Settings, Bell,
  ArrowRight, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// بيانات تجريبية للفنيين
const technicians = [
  { id: 1, name: 'محمد أحمد', specialty: 'تكييف', available: true, tasks: 2, rating: 4.8 },
  { id: 2, name: 'خالد العلي', specialty: 'كاميرات', available: true, tasks: 1, rating: 4.5 },
  { id: 3, name: 'فهد السعيد', specialty: 'أقفال ذكية', available: false, tasks: 3, rating: 4.9 },
  { id: 4, name: 'عبدالله محمد', specialty: 'مركبات', available: true, tasks: 0, rating: 4.6 },
];

// قطع الغيار المتاحة
const availableParts = [
  { id: 1, name: 'فلتر مكيف', sku: 'AC-FLT-001', quantity: 25, reserved: 3 },
  { id: 2, name: 'بطارية كاميرا', sku: 'CAM-BAT-001', quantity: 8, reserved: 2 },
  { id: 3, name: 'حساس حركة', sku: 'SEC-MOT-001', quantity: 5, reserved: 1 },
  { id: 4, name: 'زيت محرك', sku: 'VEH-OIL-001', quantity: 10, reserved: 0 },
];

// إعدادات الأتمتة الافتراضية
const defaultAutomationSettings = {
  autoCreateTasks: true,
  autoAssignTechnicians: true,
  autoReserveParts: true,
  notifyOnCreation: true,
  priorityThreshold: 'high', // critical, high, medium, all
  scheduleBuffer: 2, // أيام
};

export default function AutomatedMaintenanceScheduler({ 
  predictions = [], 
  onTaskCreated,
  onPartsReserved 
}) {
  const [automationSettings, setAutomationSettings] = useState(defaultAutomationSettings);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // معالجة التنبؤات وإنشاء مهام تلقائية
  useEffect(() => {
    if (automationSettings.autoCreateTasks && predictions.length > 0) {
      const eligiblePredictions = predictions.filter(p => {
        if (automationSettings.priorityThreshold === 'critical') return p.urgency === 'critical';
        if (automationSettings.priorityThreshold === 'high') return ['critical', 'high'].includes(p.urgency);
        if (automationSettings.priorityThreshold === 'medium') return ['critical', 'high', 'medium'].includes(p.urgency);
        return true;
      });
      setPendingTasks(eligiblePredictions.filter(p => !createdTasks.find(t => t.predictionId === p.id)));
    }
  }, [predictions, automationSettings, createdTasks]);

  // إيجاد أفضل فني متاح
  const findBestTechnician = (deviceType) => {
    const available = technicians.filter(t => t.available);
    // ترتيب حسب التخصص المطابق، ثم عدد المهام الأقل، ثم التقييم الأعلى
    return available.sort((a, b) => {
      const aMatch = a.specialty.includes(deviceType) ? 1 : 0;
      const bMatch = b.specialty.includes(deviceType) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      if (a.tasks !== b.tasks) return a.tasks - b.tasks;
      return b.rating - a.rating;
    })[0];
  };

  // إيجاد القطع المطلوبة
  const findRequiredParts = (prediction) => {
    if (!prediction.required_parts) return [];
    return prediction.required_parts.map(rp => {
      const available = availableParts.find(p => p.sku === rp.sku || p.name === rp.name);
      return {
        ...rp,
        available: available?.quantity - (available?.reserved || 0) || 0,
        inStock: available ? (available.quantity - available.reserved) >= rp.quantity : false
      };
    });
  };

  // إنشاء مهمة صيانة تلقائية
  const createAutomatedTask = async (prediction) => {
    setIsProcessing(true);
    
    try {
      // 1. إيجاد أفضل فني
      const technician = automationSettings.autoAssignTechnicians 
        ? findBestTechnician(prediction.device_type)
        : null;

      // 2. التحقق من القطع وحجزها
      const parts = findRequiredParts(prediction);
      const allPartsAvailable = parts.every(p => p.inStock);

      // 3. حساب تاريخ الجدولة
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + automationSettings.scheduleBuffer);

      // 4. إنشاء المهمة
      const newTask = {
        id: Date.now(),
        predictionId: prediction.id,
        device_name: prediction.device_name,
        device_type: prediction.device_type,
        maintenance_type: prediction.repair_cost < prediction.replace_cost ? 'corrective' : 'replacement',
        priority: prediction.urgency,
        description: prediction.detailed_recommendation || prediction.recommendation,
        status: allPartsAvailable ? 'scheduled' : 'pending_parts',
        technician: technician,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        estimated_duration: prediction.estimated_time,
        parts_reserved: automationSettings.autoReserveParts ? parts : [],
        parts_available: allPartsAvailable,
        estimated_cost: prediction.repair_cost < prediction.replace_cost ? prediction.repair_cost : prediction.replace_cost,
        created_automatically: true,
        created_at: new Date().toISOString()
      };

      // 5. إضافة للقائمة
      setCreatedTasks(prev => [...prev, newTask]);
      
      // 6. إشعار
      if (automationSettings.notifyOnCreation) {
        toast.success(
          `تم إنشاء مهمة صيانة لـ ${prediction.device_name}`,
          { description: technician ? `تم تعيين ${technician.name}` : 'بانتظار التعيين' }
        );
      }

      if (onTaskCreated) onTaskCreated(newTask);
      if (onPartsReserved && parts.length > 0) onPartsReserved(parts);

    } catch (error) {
      toast.error('فشل في إنشاء المهمة');
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة جميع المهام المعلقة
  const processAllPending = async () => {
    setIsProcessing(true);
    for (const prediction of pendingTasks) {
      await createAutomatedTask(prediction);
      await new Promise(r => setTimeout(r, 500)); // تأخير بسيط
    }
    setPendingTasks([]);
    setIsProcessing(false);
    toast.success(`تم معالجة ${pendingTasks.length} مهمة`);
  };

  const updateSetting = (key, value) => {
    setAutomationSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <Card className="glass-card border-purple-500/30 bg-purple-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">أتمتة الصيانة الذكية</h3>
                <p className="text-slate-400 text-sm">إنشاء وجدولة مهام الصيانة تلقائياً</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${automationSettings.autoCreateTasks ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                {automationSettings.autoCreateTasks ? 'نشط' : 'معطل'}
              </Badge>
              <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => setShowSettingsDialog(true)}>
                <Settings className="w-4 h-4 ml-2" />
                إعدادات
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                مهام معلقة للمعالجة ({pendingTasks.length})
              </CardTitle>
              <Button 
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={processAllPending}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                معالجة الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${
                      task.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                      task.urgency === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {task.urgency === 'critical' ? 'حرج' : task.urgency === 'high' ? 'عالي' : 'متوسط'}
                    </Badge>
                    <div>
                      <p className="text-white text-sm">{task.device_name}</p>
                      <p className="text-slate-500 text-xs">{task.issue || task.recommendation}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-amber-400"
                    onClick={() => createAutomatedTask(task)}
                    disabled={isProcessing}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Created Tasks */}
      {createdTasks.length > 0 && (
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              المهام المُنشأة تلقائياً ({createdTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {createdTasks.map(task => {
                const tech = task.technician;
                return (
                  <div key={task.id} className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{task.device_name}</span>
                          <Badge className={`text-xs ${
                            task.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                            task.status === 'pending_parts' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {task.status === 'scheduled' ? 'مجدولة' : task.status === 'pending_parts' ? 'بانتظار قطع' : 'جاهزة'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{task.description}</p>
                      </div>
                      <span className="text-amber-400 font-bold">{task.estimated_cost} ر.س</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {/* Technician */}
                      <div className="p-2 bg-slate-700/50 rounded">
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <User className="w-3 h-3" />
                          <span>الفني</span>
                        </div>
                        <p className="text-white">{tech?.name || 'غير معين'}</p>
                      </div>
                      
                      {/* Date */}
                      <div className="p-2 bg-slate-700/50 rounded">
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>التاريخ</span>
                        </div>
                        <p className="text-white">{task.scheduled_date}</p>
                      </div>
                      
                      {/* Parts */}
                      <div className="p-2 bg-slate-700/50 rounded">
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <Package className="w-3 h-3" />
                          <span>القطع</span>
                        </div>
                        <p className={task.parts_available ? 'text-green-400' : 'text-amber-400'}>
                          {task.parts_available ? 'متوفرة' : 'غير متوفرة'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              إعدادات الأتمتة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm">إنشاء المهام تلقائياً</p>
                <p className="text-slate-500 text-xs">إنشاء مهام صيانة من التنبؤات</p>
              </div>
              <Switch
                checked={automationSettings.autoCreateTasks}
                onCheckedChange={(v) => updateSetting('autoCreateTasks', v)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm">تعيين الفنيين تلقائياً</p>
                <p className="text-slate-500 text-xs">اختيار أفضل فني متاح</p>
              </div>
              <Switch
                checked={automationSettings.autoAssignTechnicians}
                onCheckedChange={(v) => updateSetting('autoAssignTechnicians', v)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm">حجز القطع تلقائياً</p>
                <p className="text-slate-500 text-xs">حجز قطع الغيار المطلوبة</p>
              </div>
              <Switch
                checked={automationSettings.autoReserveParts}
                onCheckedChange={(v) => updateSetting('autoReserveParts', v)}
              />
            </div>
            
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-white text-sm mb-2 block">مستوى الأولوية للمعالجة</Label>
              <Select value={automationSettings.priorityThreshold} onValueChange={(v) => updateSetting('priorityThreshold', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="critical">الحرجة فقط</SelectItem>
                  <SelectItem value="high">عالية وحرجة</SelectItem>
                  <SelectItem value="medium">متوسطة وأعلى</SelectItem>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-white text-sm mb-2 block">فترة الجدولة (أيام)</Label>
              <Select value={String(automationSettings.scheduleBuffer)} onValueChange={(v) => updateSetting('scheduleBuffer', Number(v))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1">يوم واحد</SelectItem>
                  <SelectItem value="2">يومان</SelectItem>
                  <SelectItem value="3">3 أيام</SelectItem>
                  <SelectItem value="7">أسبوع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowSettingsDialog(false)}>
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}