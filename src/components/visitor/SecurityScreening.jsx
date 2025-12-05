import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, UserX, Search, Eye, Camera, Plus, Trash2,
  Check, X, Bell, Ban, AlertCircle, FileText, Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const mockBlacklist = [
  { id: 1, name: 'محمد أحمد', id_number: '1234567890', reason: 'سرقة', added_date: '2024-01-15', added_by: 'أمن المنشأة', severity: 'critical', photo: true },
  { id: 2, name: 'خالد علي', id_number: '0987654321', reason: 'تهديد موظف', added_date: '2024-03-20', added_by: 'الموارد البشرية', severity: 'high', photo: false },
  { id: 3, name: 'فهد السعيد', id_number: '1122334455', reason: 'انتهاك سياسة الأمان', added_date: '2024-06-10', added_by: 'مدير الأمن', severity: 'medium', photo: true },
];

const mockWatchlist = [
  { id: 1, name: 'سعد محمد', id_number: '5566778899', reason: 'مراقبة عامة', added_date: '2024-08-01', expires: '2025-02-01', alert_level: 'notify' },
  { id: 2, name: 'عبدالله خالد', id_number: '9988776655', reason: 'فحص إضافي مطلوب', added_date: '2024-09-15', expires: '2025-03-15', alert_level: 'verify' },
];

const mockSecurityAlerts = [
  { id: 1, type: 'blacklist_match', visitor: 'محمد أحمد', gate: 'البوابة الرئيسية', timestamp: '2024-12-04 09:15', status: 'active', action_taken: 'منع الدخول' },
  { id: 2, type: 'watchlist_match', visitor: 'سعد محمد', gate: 'بوابة الشحن', timestamp: '2024-12-04 08:45', status: 'resolved', action_taken: 'فحص إضافي' },
  { id: 3, type: 'face_mismatch', visitor: 'زائر غير معروف', gate: 'البوابة الرئيسية', timestamp: '2024-12-04 08:30', status: 'investigating', action_taken: 'تحت المراجعة' },
];

const severityColors = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
};

export default function SecurityScreening() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [blacklist, setBlacklist] = useState(mockBlacklist);
  const [watchlist, setWatchlist] = useState(mockWatchlist);
  const [alerts, setAlerts] = useState(mockSecurityAlerts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState('blacklist');
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState({
    name: '', id_number: '', reason: '', severity: 'medium', expires: '', alert_level: 'notify', notes: ''
  });

  const addToList = () => {
    if (addType === 'blacklist') {
      setBlacklist([...blacklist, { ...newEntry, id: Date.now(), added_date: new Date().toISOString().split('T')[0], added_by: 'مستخدم حالي', photo: false }]);
      toast.success('تمت الإضافة إلى القائمة السوداء');
    } else {
      setWatchlist([...watchlist, { ...newEntry, id: Date.now(), added_date: new Date().toISOString().split('T')[0] }]);
      toast.success('تمت الإضافة إلى قائمة المراقبة');
    }
    setShowAddDialog(false);
    setNewEntry({ name: '', id_number: '', reason: '', severity: 'medium', expires: '', alert_level: 'notify', notes: '' });
  };

  const removeFromList = (id, type) => {
    if (type === 'blacklist') {
      setBlacklist(blacklist.filter(b => b.id !== id));
    } else {
      setWatchlist(watchlist.filter(w => w.id !== id));
    }
    toast.success('تمت الإزالة من القائمة');
  };

  const resolveAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    toast.success('تم حل التنبيه');
  };

  const stats = {
    blacklistCount: blacklist.length,
    watchlistCount: watchlist.length,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    todayBlocks: 3,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'القائمة السوداء', value: stats.blacklistCount, icon: Ban, color: 'red' },
          { label: 'قائمة المراقبة', value: stats.watchlistCount, icon: Eye, color: 'amber' },
          { label: 'تنبيهات نشطة', value: stats.activeAlerts, icon: AlertTriangle, color: 'orange' },
          { label: 'حالات منع اليوم', value: stats.todayBlocks, icon: Shield, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                <p className="text-slate-400 text-xs">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4 ml-1" />
            التنبيهات الأمنية
          </TabsTrigger>
          <TabsTrigger value="blacklist" className="data-[state=active]:bg-slate-600/20">
            <Ban className="w-4 h-4 ml-1" />
            القائمة السوداء
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="data-[state=active]:bg-amber-500/20">
            <Eye className="w-4 h-4 ml-1" />
            قائمة المراقبة
          </TabsTrigger>
        </TabsList>

        {/* Security Alerts */}
        <TabsContent value="alerts" className="mt-4 space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`${
                alert.status === 'active' ? 'bg-red-500/10 border-red-500/30' :
                alert.status === 'investigating' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-slate-800/30 border-slate-700/50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'blacklist_match' ? 'bg-red-500/20' :
                        alert.type === 'watchlist_match' ? 'bg-amber-500/20' :
                        'bg-orange-500/20'
                      }`}>
                        {alert.type === 'blacklist_match' ? <Ban className="w-5 h-5 text-red-400" /> :
                         alert.type === 'watchlist_match' ? <Eye className="w-5 h-5 text-amber-400" /> :
                         <Camera className="w-5 h-5 text-orange-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium">{alert.visitor}</h4>
                          <Badge className={
                            alert.status === 'active' ? 'bg-red-500/20 text-red-400' :
                            alert.status === 'investigating' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {alert.status === 'active' ? 'نشط' : alert.status === 'investigating' ? 'قيد التحقيق' : 'تم الحل'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {alert.type === 'blacklist_match' ? 'تطابق مع القائمة السوداء' :
                           alert.type === 'watchlist_match' ? 'تطابق مع قائمة المراقبة' :
                           'عدم تطابق الوجه'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>{alert.gate}</span>
                          <span>{alert.timestamp}</span>
                          <span>الإجراء: {alert.action_taken}</span>
                        </div>
                      </div>
                    </div>
                    {alert.status === 'active' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => resolveAlert(alert.id)}>
                        <Check className="w-4 h-4 ml-1" />
                        تم الحل
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Blacklist */}
        <TabsContent value="blacklist" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في القائمة السوداء..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => { setAddType('blacklist'); setShowAddDialog(true); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة للقائمة السوداء
            </Button>
          </div>

          <div className="space-y-2">
            {blacklist.map((person, i) => {
              const sev = severityColors[person.severity];
              return (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`${sev.bg} ${sev.border} border`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                          {person.photo ? (
                            <Camera className="w-5 h-5 text-slate-400" />
                          ) : (
                            <UserX className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{person.name}</h4>
                            <Badge className={`${sev.bg} ${sev.text}`}>
                              {person.severity === 'critical' ? 'حرج' : person.severity === 'high' ? 'عالي' : 'متوسط'}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">هوية: {person.id_number}</p>
                          <p className="text-slate-500 text-xs mt-1">السبب: {person.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">أضيف: {person.added_date}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeFromList(person.id, 'blacklist')}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Watchlist */}
        <TabsContent value="watchlist" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في قائمة المراقبة..."
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => { setAddType('watchlist'); setShowAddDialog(true); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة للمراقبة
            </Button>
          </div>

          <div className="space-y-2">
            {watchlist.map((person, i) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-amber-500/20">
                        <Eye className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{person.name}</h4>
                          <Badge className={person.alert_level === 'verify' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}>
                            {person.alert_level === 'verify' ? 'تحقق مطلوب' : 'إشعار فقط'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">هوية: {person.id_number}</p>
                        <p className="text-slate-500 text-xs mt-1">السبب: {person.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">ينتهي: {person.expires}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeFromList(person.id, 'watchlist')}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {addType === 'blacklist' ? <Ban className="w-5 h-5 text-red-400" /> : <Eye className="w-5 h-5 text-amber-400" />}
              إضافة إلى {addType === 'blacklist' ? 'القائمة السوداء' : 'قائمة المراقبة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">الاسم</Label>
              <Input
                value={newEntry.name}
                onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">رقم الهوية</Label>
              <Input
                value={newEntry.id_number}
                onChange={(e) => setNewEntry({ ...newEntry, id_number: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">السبب</Label>
              <Textarea
                value={newEntry.reason}
                onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                rows={2}
              />
            </div>
            {addType === 'blacklist' ? (
              <div>
                <Label className="text-slate-300">درجة الخطورة</Label>
                <Select value={newEntry.severity} onValueChange={(v) => setNewEntry({ ...newEntry, severity: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="critical">حرج</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-slate-300">تاريخ الانتهاء</Label>
                  <Input
                    type="date"
                    value={newEntry.expires}
                    onChange={(e) => setNewEntry({ ...newEntry, expires: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">مستوى التنبيه</Label>
                  <Select value={newEntry.alert_level} onValueChange={(v) => setNewEntry({ ...newEntry, alert_level: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="notify">إشعار فقط</SelectItem>
                      <SelectItem value="verify">تحقق مطلوب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="flex gap-2">
              <Button
                className={`flex-1 ${addType === 'blacklist' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                onClick={addToList}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}