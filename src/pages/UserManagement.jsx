import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, RefreshCw, Edit, Trash2, Shield, Key, Mail,
  UserCheck, UserX, Clock, MoreVertical, ChevronDown, Check, X,
  Lock, Unlock, Eye, EyeOff, Settings, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Predefined roles with permissions
const defaultRoles = [
  {
    id: 'admin',
    name: 'مسؤول',
    description: 'صلاحيات كاملة على النظام',
    color: 'red',
    permissions: {
      dashboard: { view: true, edit: true, delete: true },
      users: { view: true, edit: true, delete: true },
      devices: { view: true, edit: true, delete: true },
      reports: { view: true, edit: true, export: true },
      settings: { view: true, edit: true },
      fleet: { view: true, edit: true, delete: true },
      alerts: { view: true, manage: true },
    }
  },
  {
    id: 'analyst',
    name: 'محلل',
    description: 'عرض وتحليل البيانات والتقارير',
    color: 'cyan',
    permissions: {
      dashboard: { view: true, edit: true, delete: false },
      users: { view: false, edit: false, delete: false },
      devices: { view: true, edit: false, delete: false },
      reports: { view: true, edit: true, export: true },
      settings: { view: false, edit: false },
      fleet: { view: true, edit: false, delete: false },
      alerts: { view: true, manage: false },
    }
  },
  {
    id: 'operator',
    name: 'مشغل',
    description: 'تشغيل ومراقبة الأنظمة',
    color: 'green',
    permissions: {
      dashboard: { view: true, edit: false, delete: false },
      users: { view: false, edit: false, delete: false },
      devices: { view: true, edit: true, delete: false },
      reports: { view: true, edit: false, export: false },
      settings: { view: false, edit: false },
      fleet: { view: true, edit: true, delete: false },
      alerts: { view: true, manage: true },
    }
  },
  {
    id: 'viewer',
    name: 'مشاهد',
    description: 'عرض البيانات فقط',
    color: 'slate',
    permissions: {
      dashboard: { view: true, edit: false, delete: false },
      users: { view: false, edit: false, delete: false },
      devices: { view: true, edit: false, delete: false },
      reports: { view: true, edit: false, export: false },
      settings: { view: false, edit: false },
      fleet: { view: true, edit: false, delete: false },
      alerts: { view: true, manage: false },
    }
  },
];

const permissionModules = [
  { id: 'dashboard', name: 'لوحات القيادة', actions: ['view', 'edit', 'delete'] },
  { id: 'users', name: 'المستخدمين', actions: ['view', 'edit', 'delete'] },
  { id: 'devices', name: 'الأجهزة', actions: ['view', 'edit', 'delete'] },
  { id: 'reports', name: 'التقارير', actions: ['view', 'edit', 'export'] },
  { id: 'settings', name: 'الإعدادات', actions: ['view', 'edit'] },
  { id: 'fleet', name: 'الأسطول', actions: ['view', 'edit', 'delete'] },
  { id: 'alerts', name: 'التنبيهات', actions: ['view', 'manage'] },
];

const actionLabels = {
  view: 'عرض',
  edit: 'تعديل',
  delete: 'حذف',
  export: 'تصدير',
  manage: 'إدارة',
};

const mockUsers = [
  { id: 'u1', name: 'أحمد محمد', email: 'ahmed@example.com', role: 'admin', status: 'active', lastLogin: '2025-12-04 10:30', avatar: 'أ' },
  { id: 'u2', name: 'سارة علي', email: 'sara@example.com', role: 'analyst', status: 'active', lastLogin: '2025-12-04 09:15', avatar: 'س' },
  { id: 'u3', name: 'محمد خالد', email: 'mohammed@example.com', role: 'operator', status: 'active', lastLogin: '2025-12-03 16:45', avatar: 'م' },
  { id: 'u4', name: 'فاطمة حسن', email: 'fatima@example.com', role: 'viewer', status: 'inactive', lastLogin: '2025-11-28 11:00', avatar: 'ف' },
  { id: 'u5', name: 'عمر يوسف', email: 'omar@example.com', role: 'operator', status: 'active', lastLogin: '2025-12-04 08:00', avatar: 'ع' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [roles, setRoles] = useState(defaultRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' });
  const [newRole, setNewRole] = useState({ name: '', description: '', color: 'cyan', permissions: {} });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleInfo = (roleId) => roles.find(r => r.id === roleId);

  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    
    const user = {
      id: `u-${Date.now()}`,
      ...newUser,
      status: 'active',
      lastLogin: '-',
      avatar: newUser.name[0]
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'viewer' });
    setShowAddUser(false);
    toast.success('تم إضافة المستخدم');
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success('تم حذف المستخدم');
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const saveRole = () => {
    if (!newRole.name) {
      toast.error('يرجى إدخال اسم الدور');
      return;
    }

    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...newRole } : r));
      toast.success('تم تحديث الدور');
    } else {
      const role = {
        id: `role-${Date.now()}`,
        ...newRole
      };
      setRoles([...roles, role]);
      toast.success('تم إنشاء الدور');
    }
    
    setNewRole({ name: '', description: '', color: 'cyan', permissions: {} });
    setEditingRole(null);
    setShowAddRole(false);
  };

  const deleteRole = (roleId) => {
    if (['admin', 'analyst', 'operator', 'viewer'].includes(roleId)) {
      toast.error('لا يمكن حذف الأدوار الأساسية');
      return;
    }
    setRoles(roles.filter(r => r.id !== roleId));
    toast.success('تم حذف الدور');
  };

  const togglePermission = (moduleId, action) => {
    setNewRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...prev.permissions[moduleId],
          [action]: !prev.permissions[moduleId]?.[action]
        }
      }
    }));
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              إدارة المستخدمين والصلاحيات
            </h1>
            <p className="text-slate-400 mt-1">إدارة المستخدمين والأدوار والصلاحيات</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-slate-400 text-sm">إجمالي المستخدمين</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <UserCheck className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-slate-400 text-sm">نشط</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{roles.length}</p>
              <p className="text-slate-400 text-sm">الأدوار</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Key className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-slate-400 text-sm">مسؤولين</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Users className="w-4 h-4 ml-2" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Shield className="w-4 h-4 ml-2" />
            الأدوار والصلاحيات
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="بحث بالاسم أو البريد..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة مستخدم
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0f1629] border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">إضافة مستخدم جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="text-slate-300">الاسم الكامل</Label>
                        <Input
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">البريد الإلكتروني</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">الدور</Label>
                        <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {roles.map(role => (
                              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={addUser}>
                        إضافة المستخدم
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">المستخدم</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الدور</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الحالة</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">آخر دخول</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, i) => {
                      const role = getRoleInfo(user.role);
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-slate-700/30 hover:bg-slate-800/30"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium">{user.avatar}</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-slate-400 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={`bg-${role?.color}-500/20 text-${role?.color}-400`}>
                              <Shield className="w-3 h-3 ml-1" />
                              {role?.name}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                              {user.status === 'active' ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-400 text-sm">{user.lastLogin}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400"
                                onClick={() => toggleUserStatus(user.id)}
                              >
                                {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-400"
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء دور جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">{editingRole ? 'تعديل الدور' : 'إنشاء دور جديد'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">اسم الدور</Label>
                      <Input
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">اللون</Label>
                      <Select value={newRole.color} onValueChange={(v) => setNewRole({ ...newRole, color: v })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {['cyan', 'purple', 'green', 'amber', 'red', 'slate'].map(color => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                                {color}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-300">الوصف</Label>
                    <Input
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-3 block">الصلاحيات</Label>
                    <div className="space-y-3">
                      {permissionModules.map(module => (
                        <div key={module.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{module.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {module.actions.map(action => (
                              <label key={action} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                  checked={newRole.permissions[module.id]?.[action] || false}
                                  onCheckedChange={() => togglePermission(module.id, action)}
                                  className="border-slate-600"
                                />
                                <span className="text-slate-300 text-sm">{actionLabels[action]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={saveRole}>
                    {editingRole ? 'حفظ التعديلات' : 'إنشاء الدور'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Roles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role, i) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-${role.color}-500/50 transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-${role.color}-500/20`}>
                        <Shield className={`w-6 h-6 text-${role.color}-400`} />
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-400"
                          onClick={() => {
                            setEditingRole(role);
                            setNewRole(role);
                            setShowAddRole(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-400"
                          onClick={() => deleteRole(role.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="text-white font-bold">{role.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{role.description}</p>
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-slate-500 text-xs">
                        {users.filter(u => u.role === role.id).length} مستخدم
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}