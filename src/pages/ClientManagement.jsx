import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Users, Plus, Building2, Mail, Phone, MapPin, Calendar, Shield,
  Camera, UserCheck, Trash2, Edit, Check, X, Loader2, Crown, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';

const allFeatures = [
  { id: 'people_analytics', name: 'تحليل الأشخاص', category: 'AI' },
  { id: 'face_recognition', name: 'التعرف على الوجوه', category: 'AI' },
  { id: 'vehicle_analytics', name: 'تحليل المركبات', category: 'AI' },
  { id: 'license_plate', name: 'قراءة اللوحات', category: 'AI' },
  { id: 'behavior_analysis', name: 'تحليل السلوك', category: 'AI' },
  { id: 'object_detection', name: 'كشف الأجسام', category: 'AI' },
  { id: 'intrusion_detection', name: 'كشف التسلل', category: 'Security' },
  { id: 'fire_detection', name: 'كشف الحريق', category: 'Safety' },
  { id: 'crowd_analysis', name: 'تحليل الحشود', category: 'AI' },
  { id: 'traffic_analysis', name: 'تحليل المرور', category: 'Traffic' },
  { id: 'drone_integration', name: 'تكامل الطائرات', category: 'IoT' },
  { id: 'iot_sensors', name: 'حساسات IoT', category: 'IoT' },
  { id: 'cybersecurity', name: 'الأمن السيبراني', category: 'Security' },
  { id: 'reports', name: 'التقارير', category: 'General' },
  { id: 'alerts', name: 'التنبيهات', category: 'General' },
  { id: 'api_access', name: 'الوصول لـ API', category: 'General' },
];

const planConfig = {
  basic: { label: 'أساسي', color: 'slate', features: 5, cameras: 10, users: 5 },
  professional: { label: 'احترافي', color: 'blue', features: 10, cameras: 50, users: 20 },
  enterprise: { label: 'مؤسسي', color: 'purple', features: 'all', cameras: 'unlimited', users: 'unlimited' },
  custom: { label: 'مخصص', color: 'amber', features: 'custom', cameras: 'custom', users: 'custom' },
};

const statusConfig = {
  active: { label: 'نشط', color: 'bg-green-500/20 text-green-400' },
  inactive: { label: 'غير نشط', color: 'bg-slate-500/20 text-slate-400' },
  trial: { label: 'تجريبي', color: 'bg-amber-500/20 text-amber-400' },
  suspended: { label: 'معلق', color: 'bg-red-500/20 text-red-400' },
};

export default function ClientManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: '', contact_email: '', contact_phone: '', address: '',
    status: 'trial', plan: 'basic', enabled_features: [], max_cameras: 10, max_users: 5
  });
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('تم إضافة العميل بنجاح');
      setShowAddDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('تم تحديث العميل');
      setEditingClient(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('تم حذف العميل');
    },
  });

  const resetForm = () => {
    setNewClient({
      name: '', contact_email: '', contact_phone: '', address: '',
      status: 'trial', plan: 'basic', enabled_features: [], max_cameras: 10, max_users: 5
    });
  };

  const toggleFeature = (featureId, client = null) => {
    if (client) {
      const features = client.enabled_features || [];
      const updated = features.includes(featureId)
        ? features.filter(f => f !== featureId)
        : [...features, featureId];
      updateMutation.mutate({ id: client.id, data: { enabled_features: updated } });
    } else {
      const features = newClient.enabled_features || [];
      const updated = features.includes(featureId)
        ? features.filter(f => f !== featureId)
        : [...features, featureId];
      setNewClient({ ...newClient, enabled_features: updated });
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              إدارة العملاء
            </h1>
            <p className="text-slate-400 mt-1">إدارة العملاء وتحديد الميزات والصلاحيات</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">إضافة عميل جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">اسم العميل / الشركة</Label>
                    <Input
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={newClient.contact_email}
                      onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">رقم الهاتف</Label>
                    <Input
                      value={newClient.contact_phone}
                      onChange={(e) => setNewClient({ ...newClient, contact_phone: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">العنوان</Label>
                    <Input
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">الخطة</Label>
                    <Select value={newClient.plan} onValueChange={(v) => setNewClient({ ...newClient, plan: v })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Object.entries(planConfig).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">الحد الأقصى للكاميرات</Label>
                    <Input
                      type="number"
                      value={newClient.max_cameras}
                      onChange={(e) => setNewClient({ ...newClient, max_cameras: parseInt(e.target.value) })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">الحد الأقصى للمستخدمين</Label>
                    <Input
                      type="number"
                      value={newClient.max_users}
                      onChange={(e) => setNewClient({ ...newClient, max_users: parseInt(e.target.value) })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-3 block">الميزات المفعّلة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-slate-800/30 rounded-lg">
                    {allFeatures.map(feature => (
                      <div key={feature.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={newClient.enabled_features?.includes(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="border-slate-600"
                        />
                        <span className="text-sm text-slate-300">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => createMutation.mutate(newClient)} className="w-full bg-cyan-600">
                  حفظ العميل
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي العملاء', value: clients.length, icon: Building2, color: 'cyan' },
          { label: 'العملاء النشطين', value: clients.filter(c => c.status === 'active').length, icon: UserCheck, color: 'green' },
          { label: 'الباقة المؤسسية', value: clients.filter(c => c.plan === 'enterprise').length, icon: Crown, color: 'purple' },
          { label: 'الفترة التجريبية', value: clients.filter(c => c.status === 'trial').length, icon: Star, color: 'amber' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clients Table */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400 text-right">العميل</TableHead>
                <TableHead className="text-slate-400 text-right">الخطة</TableHead>
                <TableHead className="text-slate-400 text-right">الحالة</TableHead>
                <TableHead className="text-slate-400 text-right">الكاميرات</TableHead>
                <TableHead className="text-slate-400 text-right">الميزات</TableHead>
                <TableHead className="text-slate-400 text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="border-slate-700/50 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">{client.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{client.name}</p>
                        <p className="text-slate-400 text-sm">{client.contact_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`bg-${planConfig[client.plan]?.color || 'slate'}-500/20 text-${planConfig[client.plan]?.color || 'slate'}-400`}>
                      {planConfig[client.plan]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[client.status]?.color}>
                      {statusConfig[client.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    {client.max_cameras || 0}
                  </TableCell>
                  <TableCell>
                    <span className="text-cyan-400">{client.enabled_features?.length || 0}</span>
                    <span className="text-slate-400"> / {allFeatures.length}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-white"
                        onClick={() => setEditingClient(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-500/10"
                        onClick={() => deleteMutation.mutate(client.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل العميل: {editingClient?.name}</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white mb-3 block">الميزات المفعّلة</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-slate-800/30 rounded-lg">
                  {allFeatures.map(feature => (
                    <div key={feature.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={editingClient.enabled_features?.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id, editingClient)}
                        className="border-slate-600"
                      />
                      <span className="text-sm text-slate-300">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">الحالة</Label>
                  <Select 
                    value={editingClient.status} 
                    onValueChange={(v) => updateMutation.mutate({ id: editingClient.id, data: { status: v } })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">الخطة</Label>
                  <Select 
                    value={editingClient.plan} 
                    onValueChange={(v) => updateMutation.mutate({ id: editingClient.id, data: { plan: v } })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(planConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}