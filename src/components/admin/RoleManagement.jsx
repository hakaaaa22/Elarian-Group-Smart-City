import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, Users, Plus, Edit, Trash2, Save, X, CheckCircle,
  Eye, EyeOff, Lock, Unlock, Settings, LayoutDashboard, Camera,
  Car, Package, Wrench, FileText, Brain, UserCog
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const moduleIcons = {
  dashboard: LayoutDashboard,
  devices: Settings,
  cameras: Camera,
  fleet: Car,
  waste: Package,
  visitors: Users,
  maintenance: Wrench,
  inventory: Package,
  reports: FileText,
  settings: Settings,
  users: UserCog,
  ai_models: Brain
};

const moduleLabels = {
  dashboard: 'لوحة التحكم',
  devices: 'الأجهزة',
  cameras: 'الكاميرات',
  fleet: 'الأسطول',
  waste: 'النفايات',
  visitors: 'الزوار',
  maintenance: 'الصيانة',
  inventory: 'المخزون',
  reports: 'التقارير',
  settings: 'الإعدادات',
  users: 'المستخدمين',
  ai_models: 'نماذج AI'
};

const permissionLevels = {
  none: { label: 'بدون وصول', color: 'slate', icon: EyeOff },
  read: { label: 'قراءة فقط', color: 'blue', icon: Eye },
  write: { label: 'قراءة وكتابة', color: 'green', icon: Edit },
  admin: { label: 'تحكم كامل', color: 'purple', icon: Shield }
};

const defaultPermissions = {
  dashboard: 'none',
  devices: 'none',
  cameras: 'none',
  fleet: 'none',
  waste: 'none',
  visitors: 'none',
  maintenance: 'none',
  inventory: 'none',
  reports: 'none',
  settings: 'none',
  users: 'none',
  ai_models: 'none'
};

export default function RoleManagement() {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    name_ar: '',
    description: '',
    permissions: { ...defaultPermissions }
  });
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const createRole = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowRoleDialog(false);
      resetForm();
      toast.success('تم إنشاء الدور بنجاح');
    }
  });

  const updateRole = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowRoleDialog(false);
      resetForm();
      toast.success('تم تحديث الدور بنجاح');
    }
  });

  const deleteRole = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('تم حذف الدور');
    }
  });

  const resetForm = () => {
    setRoleForm({
      name: '',
      name_ar: '',
      description: '',
      permissions: { ...defaultPermissions }
    });
    setEditingRole(null);
  };

  const openEditDialog = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      name_ar: role.name_ar || '',
      description: role.description || '',
      permissions: role.permissions || { ...defaultPermissions }
    });
    setShowRoleDialog(true);
  };

  const handleSubmit = () => {
    if (!roleForm.name) {
      toast.error('يرجى إدخال اسم الدور');
      return;
    }
    if (editingRole) {
      updateRole.mutate({ id: editingRole.id, data: roleForm });
    } else {
      createRole.mutate(roleForm);
    }
  };

  const applyTemplate = (template) => {
    const templates = {
      readonly: {
        dashboard: 'read', devices: 'read', cameras: 'read', fleet: 'read',
        waste: 'read', visitors: 'read', maintenance: 'read', inventory: 'read',
        reports: 'read', settings: 'none', users: 'none', ai_models: 'read'
      },
      technician: {
        dashboard: 'read', devices: 'write', cameras: 'read', fleet: 'read',
        waste: 'read', visitors: 'none', maintenance: 'write', inventory: 'write',
        reports: 'read', settings: 'none', users: 'none', ai_models: 'read'
      },
      supervisor: {
        dashboard: 'write', devices: 'write', cameras: 'write', fleet: 'write',
        waste: 'write', visitors: 'write', maintenance: 'write', inventory: 'write',
        reports: 'write', settings: 'read', users: 'read', ai_models: 'write'
      },
      admin: {
        dashboard: 'admin', devices: 'admin', cameras: 'admin', fleet: 'admin',
        waste: 'admin', visitors: 'admin', maintenance: 'admin', inventory: 'admin',
        reports: 'admin', settings: 'admin', users: 'admin', ai_models: 'admin'
      }
    };
    setRoleForm({ ...roleForm, permissions: templates[template] });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          إدارة الأدوار والصلاحيات
        </h3>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => { resetForm(); setShowRoleDialog(true); }}
        >
          <Plus className="w-4 h-4 ml-2" />
          دور جديد
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <Card key={role.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-sm">{role.name_ar || role.name}</CardTitle>
                    <p className="text-slate-500 text-xs">{role.name}</p>
                  </div>
                </div>
                {role.is_system && (
                  <Badge className="bg-slate-700 text-slate-300">نظام</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {role.description && (
                <p className="text-slate-400 text-sm mb-3">{role.description}</p>
              )}
              <div className="flex flex-wrap gap-1 mb-3">
                {Object.entries(role.permissions || {}).slice(0, 4).map(([module, level]) => {
                  if (level === 'none') return null;
                  const perm = permissionLevels[level];
                  return (
                    <Badge key={module} className={`bg-${perm.color}-500/20 text-${perm.color}-400 text-xs`}>
                      {moduleLabels[module]}
                    </Badge>
                  );
                })}
                {Object.values(role.permissions || {}).filter(l => l !== 'none').length > 4 && (
                  <Badge className="bg-slate-700 text-slate-300 text-xs">
                    +{Object.values(role.permissions || {}).filter(l => l !== 'none').length - 4}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-slate-600"
                  onClick={() => openEditDialog(role)}
                >
                  <Edit className="w-3 h-3 ml-1" />
                  تعديل
                </Button>
                {!role.is_system && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteRole.mutate(role.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingRole ? 'تعديل الدور' : 'إنشاء دور جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-400 text-sm">اسم الدور (إنجليزي)</Label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="e.g., Technician"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-sm">اسم الدور (عربي)</Label>
                <Input
                  value={roleForm.name_ar}
                  onChange={(e) => setRoleForm({ ...roleForm, name_ar: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="مثال: فني"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-400 text-sm">الوصف</Label>
              <Textarea
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1 h-20"
                placeholder="وصف مختصر للدور..."
              />
            </div>

            {/* Templates */}
            <div>
              <Label className="text-slate-400 text-sm mb-2 block">قوالب جاهزة</Label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="border-blue-500 text-blue-400" onClick={() => applyTemplate('readonly')}>
                  <Eye className="w-3 h-3 ml-1" />
                  قراءة فقط
                </Button>
                <Button size="sm" variant="outline" className="border-green-500 text-green-400" onClick={() => applyTemplate('technician')}>
                  <Wrench className="w-3 h-3 ml-1" />
                  فني
                </Button>
                <Button size="sm" variant="outline" className="border-amber-500 text-amber-400" onClick={() => applyTemplate('supervisor')}>
                  <Users className="w-3 h-3 ml-1" />
                  مشرف
                </Button>
                <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => applyTemplate('admin')}>
                  <Shield className="w-3 h-3 ml-1" />
                  مدير
                </Button>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <Label className="text-slate-400 text-sm mb-3 block">الصلاحيات</Label>
              <div className="space-y-2">
                {Object.entries(moduleLabels).map(([module, label]) => {
                  const Icon = moduleIcons[module];
                  return (
                    <div key={module} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-white text-sm">{label}</span>
                      </div>
                      <Select
                        value={roleForm.permissions[module] || 'none'}
                        onValueChange={(v) => setRoleForm({
                          ...roleForm,
                          permissions: { ...roleForm.permissions, [module]: v }
                        })}
                      >
                        <SelectTrigger className="w-36 bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(permissionLevels).map(([level, config]) => (
                            <SelectItem key={level} value={level}>
                              <span className={`text-${config.color}-400`}>{config.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSubmit}>
                <Save className="w-4 h-4 ml-2" />
                {editingRole ? 'حفظ التغييرات' : 'إنشاء الدور'}
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowRoleDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}