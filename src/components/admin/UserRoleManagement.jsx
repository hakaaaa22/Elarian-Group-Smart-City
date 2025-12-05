import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Users, Shield, Plus, Edit, Trash2, Save, X, Eye, Search, Filter,
  UserPlus, Settings, LayoutDashboard, CheckCircle, XCircle, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// الوحدات المتاحة للصلاحيات
const availableModules = [
  { id: 'dashboard', name: 'لوحة التحكم', icon: '📊' },
  { id: 'devices', name: 'الأجهزة', icon: '📱' },
  { id: 'cameras', name: 'الكاميرات', icon: '📷' },
  { id: 'fleet', name: 'الأسطول', icon: '🚗' },
  { id: 'waste', name: 'النفايات', icon: '🗑️' },
  { id: 'visitors', name: 'الزوار', icon: '👥' },
  { id: 'maintenance', name: 'الصيانة', icon: '🔧' },
  { id: 'inventory', name: 'المخزون', icon: '📦' },
  { id: 'reports', name: 'التقارير', icon: '📈' },
  { id: 'settings', name: 'الإعدادات', icon: '⚙️' },
  { id: 'users', name: 'المستخدمين', icon: '👤' },
  { id: 'ai_models', name: 'نماذج AI', icon: '🤖' },
];

// قوالب الأدوار الافتراضية
const roleTemplates = {
  security_operator: {
    name: 'مشغل أمن',
    name_ar: 'مشغل أمن',
    permissions: {
      dashboard: 'read', devices: 'read', cameras: 'admin', fleet: 'none',
      waste: 'none', visitors: 'write', maintenance: 'read', inventory: 'none',
      reports: 'read', settings: 'none', users: 'none', ai_models: 'read'
    },
    defaultDashboard: 'security'
  },
  municipal_manager: {
    name: 'مدير بلدية',
    name_ar: 'مدير بلدية',
    permissions: {
      dashboard: 'admin', devices: 'write', cameras: 'read', fleet: 'admin',
      waste: 'admin', visitors: 'read', maintenance: 'write', inventory: 'write',
      reports: 'admin', settings: 'read', users: 'none', ai_models: 'read'
    },
    defaultDashboard: 'municipal'
  },
  hospital_admin: {
    name: 'مدير مستشفى',
    name_ar: 'مدير مستشفى',
    permissions: {
      dashboard: 'admin', devices: 'write', cameras: 'read', fleet: 'none',
      waste: 'none', visitors: 'admin', maintenance: 'write', inventory: 'admin',
      reports: 'admin', settings: 'write', users: 'write', ai_models: 'read'
    },
    defaultDashboard: 'hospital'
  },
  tower_operator: {
    name: 'مشغل أبراج',
    name_ar: 'مشغل أبراج',
    permissions: {
      dashboard: 'read', devices: 'admin', cameras: 'read', fleet: 'none',
      waste: 'none', visitors: 'none', maintenance: 'admin', inventory: 'read',
      reports: 'write', settings: 'none', users: 'none', ai_models: 'read'
    },
    defaultDashboard: 'towers'
  }
};

const permissionLevels = [
  { value: 'none', label: 'لا يوجد', color: 'slate' },
  { value: 'read', label: 'قراءة', color: 'blue' },
  { value: 'write', label: 'كتابة', color: 'amber' },
  { value: 'admin', label: 'إدارة كاملة', color: 'green' }
];

// بيانات المستخدمين التجريبية
const mockUsers = [
  { id: '1', full_name: 'أحمد محمد', email: 'ahmed@example.com', role: 'admin', role_template: 'security_operator', status: 'active', last_login: '2024-12-04 09:30' },
  { id: '2', full_name: 'سارة علي', email: 'sara@example.com', role: 'user', role_template: 'municipal_manager', status: 'active', last_login: '2024-12-03 14:20' },
  { id: '3', full_name: 'خالد عبدالله', email: 'khaled@example.com', role: 'user', role_template: 'hospital_admin', status: 'inactive', last_login: '2024-11-28 11:00' },
  { id: '4', full_name: 'فاطمة حسن', email: 'fatima@example.com', role: 'user', role_template: 'tower_operator', status: 'active', last_login: '2024-12-04 08:45' },
];

export default function UserRoleManagement() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [roles, setRoles] = useState(Object.entries(roleTemplates).map(([id, role]) => ({ id, ...role })));

  const queryClient = useQueryClient();

  // نموذج المستخدم الجديد
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    role: 'user',
    role_template: 'security_operator',
    status: 'active'
  });

  // نموذج الدور
  const [roleForm, setRoleForm] = useState({
    name: '',
    name_ar: '',
    permissions: {},
    defaultDashboard: 'main'
  });

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
      toast.success('تم تحديث المستخدم بنجاح');
    } else {
      setUsers([...users, { ...userForm, id: Date.now().toString(), last_login: '-' }]);
      toast.success('تم إنشاء المستخدم بنجاح');
    }
    setShowUserDialog(false);
    setEditingUser(null);
    setUserForm({ full_name: '', email: '', role: 'user', role_template: 'security_operator', status: 'active' });
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success('تم حذف المستخدم');
  };

  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...roleForm } : r));
      toast.success('تم تحديث الدور بنجاح');
    } else {
      setRoles([...roles, { ...roleForm, id: roleForm.name.toLowerCase().replace(/\s/g, '_') }]);
      toast.success('تم إنشاء الدور بنجاح');
    }
    setShowRoleDialog(false);
    setEditingRole(null);
    setRoleForm({ name: '', name_ar: '', permissions: {}, defaultDashboard: 'main' });
  };

  const filteredUsers = users.filter(u => 
    u.full_name.includes(searchQuery) || u.email.includes(searchQuery)
  );

  const getPermissionBadge = (level) => {
    const config = permissionLevels.find(p => p.value === level);
    return <Badge className={`bg-${config?.color}-500/20 text-${config?.color}-400 text-xs`}>{config?.label}</Badge>;
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500/20">
            <Users className="w-4 h-4 ml-1" />
            إدارة المستخدمين
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-purple-500/20">
            <Shield className="w-4 h-4 ml-1" />
            الأدوار والصلاحيات
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="data-[state=active]:bg-amber-500/20">
            <LayoutDashboard className="w-4 h-4 ml-1" />
            لوحات التحكم الافتراضية
          </TabsTrigger>
        </TabsList>

        {/* إدارة المستخدمين */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن مستخدم..."
                  className="bg-slate-800 border-slate-700 pr-10 w-64"
                />
              </div>
            </div>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => {
              setEditingUser(null);
              setUserForm({ full_name: '', email: '', role: 'user', role_template: 'security_operator', status: 'active' });
              setShowUserDialog(true);
            }}>
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة مستخدم
            </Button>
          </div>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-right p-4 text-slate-400 font-medium">المستخدم</th>
                    <th className="text-right p-4 text-slate-400 font-medium">البريد الإلكتروني</th>
                    <th className="text-right p-4 text-slate-400 font-medium">الدور</th>
                    <th className="text-right p-4 text-slate-400 font-medium">الحالة</th>
                    <th className="text-right p-4 text-slate-400 font-medium">آخر دخول</th>
                    <th className="text-right p-4 text-slate-400 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium">{user.full_name[0]}</span>
                          </div>
                          <span className="text-white">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{user.email}</td>
                      <td className="p-4">
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {roleTemplates[user.role_template]?.name_ar || user.role_template}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                          {user.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{user.last_login}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/20"
                            onClick={() => {
                              setEditingUser(user);
                              setUserForm(user);
                              setShowUserDialog(true);
                            }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/20"
                            onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الأدوار والصلاحيات */}
        <TabsContent value="roles" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
              setEditingRole(null);
              setRoleForm({ name: '', name_ar: '', permissions: {}, defaultDashboard: 'main' });
              setShowRoleDialog(true);
            }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة دور جديد
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {roles.map(role => (
              <Card key={role.id} className="glass-card border-purple-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      {role.name_ar || role.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-cyan-400"
                        onClick={() => {
                          setEditingRole(role);
                          setRoleForm(role);
                          setShowRoleDialog(true);
                        }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-xs mb-3">الصلاحيات:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(role.permissions || {}).slice(0, 6).map(([module, level]) => {
                        const mod = availableModules.find(m => m.id === module);
                        return (
                          <div key={module} className="flex items-center gap-1 text-xs">
                            <span>{mod?.icon}</span>
                            <span className="text-slate-400">{mod?.name}:</span>
                            {getPermissionBadge(level)}
                          </div>
                        );
                      })}
                    </div>
                    {Object.keys(role.permissions || {}).length > 6 && (
                      <p className="text-slate-500 text-xs">+{Object.keys(role.permissions).length - 6} صلاحيات أخرى</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* لوحات التحكم الافتراضية */}
        <TabsContent value="dashboards" className="mt-4 space-y-4">
          <Card className="glass-card border-amber-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                تعيين لوحات التحكم الافتراضية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span className="text-white">{role.name_ar || role.name}</span>
                    </div>
                    <Select defaultValue={role.defaultDashboard || 'main'}>
                      <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="main">لوحة التحكم الرئيسية</SelectItem>
                        <SelectItem value="security">لوحة الأمن</SelectItem>
                        <SelectItem value="municipal">لوحة البلدية</SelectItem>
                        <SelectItem value="hospital">لوحة المستشفى</SelectItem>
                        <SelectItem value="towers">لوحة الأبراج</SelectItem>
                        <SelectItem value="fleet">لوحة الأسطول</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* مودال المستخدم */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm">الاسم الكامل</label>
              <Input value={userForm.full_name} onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1" placeholder="أدخل الاسم" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">البريد الإلكتروني</label>
              <Input value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1" placeholder="example@email.com" type="email" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">الدور</label>
              <Select value={userForm.role_template} onValueChange={(v) => setUserForm({...userForm, role_template: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {roles.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name_ar || r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-400 text-sm">الحالة</label>
              <Select value={userForm.status} onValueChange={(v) => setUserForm({...userForm, status: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleSaveUser}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowUserDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* مودال الدور */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              {editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm">اسم الدور (EN)</label>
                <Input value={roleForm.name} onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                  className="bg-slate-800 border-slate-700 mt-1" placeholder="Role Name" />
              </div>
              <div>
                <label className="text-slate-400 text-sm">اسم الدور (AR)</label>
                <Input value={roleForm.name_ar} onChange={(e) => setRoleForm({...roleForm, name_ar: e.target.value})}
                  className="bg-slate-800 border-slate-700 mt-1" placeholder="اسم الدور" />
              </div>
            </div>
            
            <div>
              <label className="text-slate-400 text-sm mb-3 block">الصلاحيات</label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 bg-slate-800/30 rounded-lg">
                {availableModules.map(mod => (
                  <div key={mod.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <span className="text-white text-sm flex items-center gap-2">
                      <span>{mod.icon}</span>
                      {mod.name}
                    </span>
                    <Select value={roleForm.permissions?.[mod.id] || 'none'} 
                      onValueChange={(v) => setRoleForm({...roleForm, permissions: {...roleForm.permissions, [mod.id]: v}})}>
                      <SelectTrigger className="w-28 h-8 bg-slate-700 border-slate-600 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {permissionLevels.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm">لوحة التحكم الافتراضية</label>
              <Select value={roleForm.defaultDashboard} onValueChange={(v) => setRoleForm({...roleForm, defaultDashboard: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="main">لوحة التحكم الرئيسية</SelectItem>
                  <SelectItem value="security">لوحة الأمن</SelectItem>
                  <SelectItem value="municipal">لوحة البلدية</SelectItem>
                  <SelectItem value="hospital">لوحة المستشفى</SelectItem>
                  <SelectItem value="towers">لوحة الأبراج</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSaveRole}>
                <Save className="w-4 h-4 ml-2" />
                حفظ الدور
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