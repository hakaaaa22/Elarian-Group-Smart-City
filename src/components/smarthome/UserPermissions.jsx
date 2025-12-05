import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Shield, Key, Settings, Check, X, Edit, Trash2,
  Home, Lock, Eye, EyeOff, Smartphone, Clock, AlertTriangle, Calendar,
  RefreshCw, Bell, FileText, ChevronRight, Filter, History, UserCheck,
  Layers, Timer, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockUsers = [
  { 
    id: 1, 
    name: 'أحمد محمد', 
    email: 'ahmed@example.com', 
    role: 'admin', 
    status: 'active',
    lastActive: 'الآن',
    permissions: ['all'],
    devices: 'all'
  },
  { 
    id: 2, 
    name: 'سارة أحمد', 
    email: 'sara@example.com', 
    role: 'member', 
    status: 'active',
    lastActive: '5 دقائق',
    permissions: ['control', 'view'],
    devices: ['living_room', 'bedroom']
  },
  { 
    id: 3, 
    name: 'محمد علي', 
    email: 'mohamed@example.com', 
    role: 'guest', 
    status: 'inactive',
    lastActive: '2 يوم',
    permissions: ['view'],
    devices: ['living_room']
  },
];

const roles = [
  { id: 'admin', name: 'مدير', color: 'amber', permissions: ['all'], isSystem: true },
  { id: 'member', name: 'عضو', color: 'cyan', permissions: ['control', 'view', 'automation'], isSystem: true },
  { id: 'guest', name: 'ضيف', color: 'slate', permissions: ['view'], isSystem: true },
  { id: 'child', name: 'طفل', color: 'pink', permissions: ['limited_control'], isSystem: true },
  { id: 'device_control', name: 'تحكم بأجهزة محددة', color: 'green', permissions: ['device_specific'], isSystem: false },
  { id: 'automation_only', name: 'إنشاء أتمتة فقط', color: 'purple', permissions: ['automation'], isSystem: false },
  { id: 'readonly', name: 'قراءة فقط', color: 'blue', permissions: ['view'], isSystem: false },
];

const permissionsList = [
  { id: 'view', name: 'عرض الأجهزة', icon: Eye },
  { id: 'control', name: 'التحكم بالأجهزة', icon: Settings },
  { id: 'device_specific', name: 'تحكم بأجهزة محددة', icon: Smartphone },
  { id: 'automation', name: 'إنشاء الأتمتة', icon: Clock },
  { id: 'automation_view', name: 'عرض الأتمتة فقط', icon: Eye },
  { id: 'security', name: 'إعدادات الأمان', icon: Shield },
  { id: 'users', name: 'إدارة المستخدمين', icon: Users },
  { id: 'settings', name: 'الإعدادات العامة', icon: Settings },
  { id: 'energy', name: 'إدارة الطاقة', icon: AlertTriangle },
  { id: 'notifications', name: 'إدارة الإشعارات', icon: Clock },
];

// Audit log
const mockAuditLog = [
  { id: 1, user: 'admin@elarian.com', action: 'تعديل أتمتة', target: 'صباح الخير', time: '2 دقيقة', type: 'automation' },
  { id: 2, user: 'user1@elarian.com', action: 'تشغيل جهاز', target: 'إضاءة غرفة المعيشة', time: '15 دقيقة', type: 'device' },
  { id: 3, user: 'admin@elarian.com', action: 'إضافة مستخدم', target: 'guest@example.com', time: '1 ساعة', type: 'user' },
  { id: 4, user: 'admin@elarian.com', action: 'تعديل صلاحيات', target: 'سارة أحمد', time: '2 ساعة', type: 'permission' },
  { id: 5, user: 'system', action: 'تفعيل أتمتة تلقائية', target: 'توفير الطاقة', time: '3 ساعة', type: 'automation' },
];

const rooms = [
  { id: 'living_room', name: 'غرفة المعيشة' },
  { id: 'bedroom', name: 'غرفة النوم' },
  { id: 'kitchen', name: 'المطبخ' },
  { id: 'bathroom', name: 'الحمام' },
  { id: 'entrance', name: 'المدخل' },
];

// Device Groups for granular permissions
const deviceGroups = [
  { id: 'lights_living', name: 'إضاءة غرفة المعيشة', room: 'living_room', devices: ['main_light', 'corner_lamp', 'led_strip'] },
  { id: 'climate_all', name: 'أجهزة التكييف', room: 'all', devices: ['ac_living', 'ac_bedroom', 'ac_office'] },
  { id: 'security_all', name: 'أجهزة الأمان', room: 'all', devices: ['door_lock', 'camera_entrance', 'alarm'] },
  { id: 'entertainment', name: 'أجهزة الترفيه', room: 'living_room', devices: ['tv', 'speaker', 'gaming'] },
  { id: 'kitchen_appliances', name: 'أجهزة المطبخ', room: 'kitchen', devices: ['coffee_maker', 'oven', 'fridge'] },
];

// Permission Review Schedule
const reviewSchedules = [
  { id: 'weekly', name: 'أسبوعياً', days: 7 },
  { id: 'monthly', name: 'شهرياً', days: 30 },
  { id: 'quarterly', name: 'كل 3 أشهر', days: 90 },
  { id: 'yearly', name: 'سنوياً', days: 365 },
];

// Temporary Role Templates
const tempRoleTemplates = [
  { id: 'guest_visit', name: 'زيارة ضيف', duration: '24', permissions: ['view', 'limited_control'], deviceGroups: ['lights_living', 'entertainment'] },
  { id: 'contractor', name: 'متعاقد/عامل صيانة', duration: '8', permissions: ['view', 'control'], deviceGroups: ['climate_all'] },
  { id: 'house_sitter', name: 'مراقب المنزل', duration: '168', permissions: ['view', 'control', 'security'], deviceGroups: ['lights_living', 'climate_all', 'security_all'] },
  { id: 'party_access', name: 'وصول حفلة', duration: '6', permissions: ['view', 'limited_control'], deviceGroups: ['lights_living', 'entertainment'] },
];

// Permission Review History
const mockReviewHistory = [
  { id: 1, date: '2024-12-01', reviewer: 'admin@elarian.com', usersReviewed: 5, changesApplied: 2, status: 'completed' },
  { id: 2, date: '2024-11-01', reviewer: 'admin@elarian.com', usersReviewed: 4, changesApplied: 1, status: 'completed' },
  { id: 3, date: '2024-10-01', reviewer: 'admin@elarian.com', usersReviewed: 3, changesApplied: 0, status: 'completed' },
];

export default function UserPermissions() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState(mockUsers);
  const [customRoles, setCustomRoles] = useState([]);
  const [auditLog, setAuditLog] = useState(mockAuditLog);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showTempAccessDialog, setShowTempAccessDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showDeviceGroupDialog, setShowDeviceGroupDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showTempRoleDialog, setShowTempRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'member', permissions: [], devices: [], deviceGroups: [], tempAccess: null });
  const [newRole, setNewRole] = useState({ name: '', color: 'cyan', permissions: [], deviceGroups: [] });
  const [tempAccessDuration, setTempAccessDuration] = useState('24');
  const [selectedTempTemplate, setSelectedTempTemplate] = useState(null);
  const [reviewSchedule, setReviewSchedule] = useState('monthly');
  const [nextReviewDate, setNextReviewDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [reviewHistory, setReviewHistory] = useState(mockReviewHistory);
  const [pendingReviews, setPendingReviews] = useState([]);

  // Check for users needing review
  useEffect(() => {
    const checkPendingReviews = () => {
      const pending = users.filter(u => {
        if (u.role === 'admin') return false;
        if (u.lastReview) {
          const daysSinceReview = Math.floor((Date.now() - new Date(u.lastReview).getTime()) / (1000 * 60 * 60 * 24));
          const scheduleObj = reviewSchedules.find(s => s.id === reviewSchedule);
          return daysSinceReview >= (scheduleObj?.days || 30);
        }
        return true;
      });
      setPendingReviews(pending);
    };
    checkPendingReviews();
  }, [users, reviewSchedule]);

  // Check for expired temp roles
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.tempAccess && new Date(u.tempAccess.expires) < new Date()) {
          return { ...u, tempAccess: null, role: 'guest', status: 'inactive' };
        }
        return u;
      }));
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getRoleConfig = (roleId) => roles.find(r => r.id === roleId);

  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    const user = {
      ...newUser,
      id: Date.now(),
      status: 'pending',
      lastActive: '-'
    };
    setUsers([...users, user]);
    setShowAddDialog(false);
    setNewUser({ name: '', email: '', role: 'member', permissions: [], devices: [] });
    toast.success('تم إرسال دعوة للمستخدم');
  };

  const updateUser = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setShowEditDialog(false);
    toast.success('تم تحديث المستخدم');
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

  const createCustomRole = () => {
    if (!newRole.name) {
      toast.error('يرجى إدخال اسم الدور');
      return;
    }
    const role = { ...newRole, id: `custom-${Date.now()}`, isSystem: false };
    setCustomRoles([...customRoles, role]);
    setShowRoleDialog(false);
    setNewRole({ name: '', color: 'cyan', permissions: [] });
    toast.success('تم إنشاء الدور المخصص');
  };

  const grantTempAccess = (userId) => {
    const hours = parseInt(tempAccessDuration);
    const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    const template = selectedTempTemplate ? tempRoleTemplates.find(t => t.id === selectedTempTemplate) : null;
    
    setUsers(users.map(u => 
      u.id === userId ? { 
        ...u, 
        tempAccess: { 
          expires: expiry.toISOString(), 
          hours,
          templateName: template?.name,
          autoExpire: true
        },
        permissions: template ? template.permissions : u.permissions,
        deviceGroups: template ? template.deviceGroups : u.deviceGroups
      } : u
    ));
    setShowTempAccessDialog(false);
    setSelectedTempTemplate(null);
    toast.success(`تم منح الوصول المؤقت لمدة ${hours} ساعة`);
  };

  const createTempRole = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    const hours = parseInt(tempAccessDuration);
    const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    const template = selectedTempTemplate ? tempRoleTemplates.find(t => t.id === selectedTempTemplate) : null;
    
    const user = {
      ...newUser,
      id: Date.now(),
      status: 'active',
      lastActive: '-',
      role: 'temp_' + (template?.id || 'custom'),
      tempAccess: {
        expires: expiry.toISOString(),
        hours,
        templateName: template?.name || 'مخصص',
        autoExpire: true
      },
      permissions: template ? template.permissions : newUser.permissions,
      deviceGroups: template ? template.deviceGroups : newUser.deviceGroups
    };
    setUsers([...users, user]);
    setShowTempRoleDialog(false);
    setNewUser({ name: '', email: '', role: 'member', permissions: [], devices: [], deviceGroups: [], tempAccess: null });
    setSelectedTempTemplate(null);
    toast.success(`تم إنشاء دور مؤقت ينتهي خلال ${hours} ساعة`);
  };

  const completeReview = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, lastReview: new Date().toISOString() } : u
    ));
    setPendingReviews(pendingReviews.filter(p => p.id !== userId));
    toast.success('تم إكمال مراجعة الصلاحيات');
  };

  const completeAllReviews = () => {
    const reviewed = pendingReviews.length;
    setUsers(users.map(u => ({
      ...u,
      lastReview: pendingReviews.find(p => p.id === u.id) ? new Date().toISOString() : u.lastReview
    })));
    setReviewHistory([
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        reviewer: 'admin@elarian.com',
        usersReviewed: reviewed,
        changesApplied: 0,
        status: 'completed'
      },
      ...reviewHistory
    ]);
    setPendingReviews([]);
    toast.success(`تم إكمال مراجعة ${reviewed} مستخدمين`);
  };

  const allRoles = [...roles, ...customRoles];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            إدارة المستخدمين والأذونات المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">تحكم في الوصول مع دعم مجموعات الأجهزة والأدوار المؤقتة</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-slate-600" onClick={() => setShowAuditDialog(true)}>
            <History className="w-4 h-4 ml-2" />
            سجل النشاط
          </Button>
          <Button variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => setShowReviewDialog(true)}>
            <UserCheck className="w-4 h-4 ml-2" />
            مراجعة الصلاحيات
            {pendingReviews.length > 0 && (
              <Badge className="bg-red-500 text-white text-xs mr-2">{pendingReviews.length}</Badge>
            )}
          </Button>
          <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => setShowTempRoleDialog(true)}>
            <Timer className="w-4 h-4 ml-2" />
            دور مؤقت
          </Button>
          <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => setShowRoleDialog(true)}>
            <Shield className="w-4 h-4 ml-2" />
            دور مخصص
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowAddDialog(true)}>
            <UserPlus className="w-4 h-4 ml-2" />
            دعوة مستخدم
          </Button>
        </div>
      </div>

      {/* Review Alert */}
      {pendingReviews.length > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white font-medium">مراجعة الصلاحيات الدورية</p>
                <p className="text-slate-400 text-sm">{pendingReviews.length} مستخدمين بحاجة لمراجعة صلاحياتهم</p>
              </div>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowReviewDialog(true)}>
              <UserCheck className="w-4 h-4 ml-2" />
              بدء المراجعة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-slate-400 text-xs">إجمالي المستخدمين</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</p>
            <p className="text-slate-400 text-xs">نشط</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{users.filter(u => u.tempAccess).length}</p>
            <p className="text-slate-400 text-xs">أدوار مؤقتة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{deviceGroups.length}</p>
            <p className="text-slate-400 text-xs">مجموعات أجهزة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{pendingReviews.length}</p>
            <p className="text-slate-400 text-xs">بانتظار المراجعة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Users className="w-3 h-3 ml-1" />
            المستخدمون
          </TabsTrigger>
          <TabsTrigger value="device-groups" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Layers className="w-3 h-3 ml-1" />
            مجموعات الأجهزة
          </TabsTrigger>
          <TabsTrigger value="temp-roles" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Timer className="w-3 h-3 ml-1" />
            الأدوار المؤقتة
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <UserCheck className="w-3 h-3 ml-1" />
            المراجعات
            {pendingReviews.length > 0 && <Badge className="bg-red-500 text-white text-xs mr-1">{pendingReviews.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-3 mt-4">

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user, i) => {
          const role = getRoleConfig(user.role);
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`bg-${role?.color || 'slate'}-500/20 text-${role?.color || 'slate'}-400`}>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{user.name}</h4>
                        <Badge className={`bg-${role?.color || 'slate'}-500/20 text-${role?.color || 'slate'}-400 text-xs`}>
                          {role?.name}
                        </Badge>
                        <Badge className={`text-xs ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {user.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                      <p className="text-slate-500 text-xs mt-1">آخر نشاط: {user.lastActive}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={user.status === 'active'} 
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => { setSelectedUser(user); setShowEditDialog(true); }}
                      >
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      {user.role === 'guest' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => { setSelectedUser(user); setShowTempAccessDialog(true); }}
                          title="وصول مؤقت"
                        >
                          <Clock className="w-4 h-4 text-amber-400" />
                        </Button>
                      )}
                      {user.role !== 'admin' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Temp Access Badge */}
                  {user.tempAccess && (
                    <div className="mt-2 p-2 bg-amber-500/10 rounded border border-amber-500/30">
                      <p className="text-amber-400 text-xs">
                        <Clock className="w-3 h-3 inline ml-1" />
                        وصول مؤقت - ينتهي خلال {user.tempAccess.hours} ساعة
                      </p>
                    </div>
                  )}

                  {/* Permissions Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                    {user.permissions.includes('all') ? (
                      <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                        <Key className="w-3 h-3 ml-1" />
                        وصول كامل
                      </Badge>
                    ) : (
                      user.permissions.map(p => (
                        <Badge key={p} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {permissionsList.find(pl => pl.id === p)?.name || p}
                        </Badge>
                      ))
                    )}
                    {user.deviceGroups?.map(dg => (
                      <Badge key={dg} variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                        <Layers className="w-3 h-3 ml-1" />
                        {deviceGroups.find(g => g.id === dg)?.name || dg}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        </div>
        </TabsContent>

        {/* Device Groups Tab */}
        <TabsContent value="device-groups" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">مجموعات الأجهزة للصلاحيات</h4>
            <Button variant="outline" className="border-purple-500/50 text-purple-400">
              <Layers className="w-4 h-4 ml-2" />
              إنشاء مجموعة
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deviceGroups.map((group, i) => (
              <Card key={group.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Layers className="w-5 h-5 text-purple-400" />
                      </div>
                      <h4 className="text-white font-medium">{group.name}</h4>
                    </div>
                    <Badge className="bg-slate-700 text-slate-300 text-xs">{group.devices.length} أجهزة</Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    الغرفة: {rooms.find(r => r.id === group.room)?.name || 'جميع الغرف'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.devices.slice(0, 3).map(d => (
                      <Badge key={d} variant="outline" className="border-slate-600 text-slate-400 text-xs">{d}</Badge>
                    ))}
                    {group.devices.length > 3 && (
                      <Badge variant="outline" className="border-slate-600 text-slate-500 text-xs">+{group.devices.length - 3}</Badge>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-slate-500 text-xs">
                      المستخدمون: {users.filter(u => u.deviceGroups?.includes(group.id)).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Temporary Roles Tab */}
        <TabsContent value="temp-roles" className="space-y-4 mt-4">
          <Card className="glass-card border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Timer className="w-4 h-4 text-green-400" />
                قوالب الأدوار المؤقتة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {tempRoleTemplates.map(template => (
                  <div key={template.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{template.name}</h4>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">{template.duration} ساعة</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.permissions.map(p => (
                        <Badge key={p} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {permissionsList.find(pl => pl.id === p)?.name || p}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.deviceGroups.map(dg => (
                        <Badge key={dg} variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                          {deviceGroups.find(g => g.id === dg)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">الأدوار المؤقتة النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.filter(u => u.tempAccess).map(user => {
                  const expiresIn = new Date(user.tempAccess.expires).getTime() - Date.now();
                  const hoursLeft = Math.max(0, Math.floor(expiresIn / (1000 * 60 * 60)));
                  const minutesLeft = Math.max(0, Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60)));
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-500/20 text-green-400">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-white font-medium">{user.name}</h4>
                          <p className="text-slate-400 text-xs">{user.tempAccess.templateName || 'دور مؤقت'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={`${hoursLeft < 2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'} text-xs`}>
                          <Clock className="w-3 h-3 ml-1" />
                          {hoursLeft}س {minutesLeft}د متبقية
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {users.filter(u => u.tempAccess).length === 0 && (
                  <div className="text-center py-6">
                    <Timer className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">لا توجد أدوار مؤقتة نشطة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  جدول المراجعة الدورية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">تكرار المراجعة</Label>
                    <Select value={reviewSchedule} onValueChange={setReviewSchedule}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {reviewSchedules.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">المراجعة القادمة</p>
                    <p className="text-white font-medium">{nextReviewDate.toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  سجل المراجعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reviewHistory.slice(0, 3).map(review => (
                    <div key={review.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                      <div>
                        <p className="text-white text-sm">{review.date}</p>
                        <p className="text-slate-400 text-xs">{review.usersReviewed} مستخدمين تمت مراجعتهم</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {pendingReviews.length > 0 && (
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    مستخدمون بحاجة للمراجعة ({pendingReviews.length})
                  </div>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={completeAllReviews}>
                    <Check className="w-3 h-3 ml-1" />
                    مراجعة الكل
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingReviews.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-600 text-slate-300">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm">{user.name}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-slate-600" onClick={() => { setSelectedUser(user); setShowEditDialog(true); }}>
                          <Edit className="w-3 h-3 ml-1" />
                          مراجعة
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => completeReview(user.id)}>
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">دعوة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">الاسم</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="اسم المستخدم"
              />
            </div>
            <div>
              <Label className="text-slate-300">البريد الإلكتروني</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label className="text-slate-300">الدور</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {allRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} {!role.isSystem && <span className="text-purple-400 text-xs">(مخصص)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            <div>
              <Label className="text-slate-300">الغرف المسموحة</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {rooms.map(room => (
                  <Badge 
                    key={room.id}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      newUser.devices.includes(room.id) 
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' 
                        : 'border-slate-600 text-slate-400'
                    }`}
                    onClick={() => {
                      const devices = newUser.devices.includes(room.id)
                        ? newUser.devices.filter(d => d !== room.id)
                        : [...newUser.devices, room.id];
                      setNewUser({ ...newUser, devices });
                    }}
                  >
                    {room.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={addUser}>
              <UserPlus className="w-4 h-4 ml-2" />
              إرسال الدعوة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">الدور</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, role: v })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {allRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} {!role.isSystem && <span className="text-purple-400 text-xs">(مخصص)</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

              <div>
                <Label className="text-slate-300 mb-2 block">الصلاحيات</Label>
                <div className="space-y-2">
                  {permissionsList.map(perm => (
                    <div key={perm.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                      <div className="flex items-center gap-2">
                        <perm.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-white text-sm">{perm.name}</span>
                      </div>
                      <Switch 
                        checked={selectedUser.permissions.includes('all') || selectedUser.permissions.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          const perms = checked
                            ? [...selectedUser.permissions, perm.id]
                            : selectedUser.permissions.filter(p => p !== perm.id);
                          setSelectedUser({ ...selectedUser, permissions: perms });
                        }}
                        disabled={selectedUser.permissions.includes('all')}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={updateUser}>
                <Check className="w-4 h-4 ml-2" />
                حفظ التغييرات
              </Button>
              </div>
              )}
              </DialogContent>
              </Dialog>

              {/* Create Role Dialog */}
              <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
              <DialogHeader>
              <DialogTitle className="text-white">إنشاء دور مخصص</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
              <div>
              <Label className="text-slate-300">اسم الدور</Label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: مراقب"
              />
              </div>
              <div>
              <Label className="text-slate-300 mb-2 block">الصلاحيات</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {permissionsList.map(perm => (
                  <div key={perm.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                    <div className="flex items-center gap-2">
                      <perm.icon className="w-4 h-4 text-slate-400" />
                      <span className="text-white text-sm">{perm.name}</span>
                    </div>
                    <Switch 
                      checked={newRole.permissions.includes(perm.id)}
                      onCheckedChange={(checked) => {
                        const perms = checked
                          ? [...newRole.permissions, perm.id]
                          : newRole.permissions.filter(p => p !== perm.id);
                        setNewRole({ ...newRole, permissions: perms });
                      }}
                    />
                  </div>
                ))}
              </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={createCustomRole}>
              <Check className="w-4 h-4 ml-2" />
              إنشاء الدور
              </Button>
              </div>
              </DialogContent>
              </Dialog>

              {/* Temp Access Dialog */}
              <Dialog open={showTempAccessDialog} onOpenChange={setShowTempAccessDialog}>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
              <DialogHeader>
              <DialogTitle className="text-white">منح وصول مؤقت</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
              {selectedUser && (
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedUser.name}</p>
                <p className="text-slate-400 text-xs">{selectedUser.email}</p>
              </div>
              )}
              <div>
              <Label className="text-slate-300">مدة الوصول</Label>
              <Select value={tempAccessDuration} onValueChange={setTempAccessDuration}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1">ساعة واحدة</SelectItem>
                  <SelectItem value="6">6 ساعات</SelectItem>
                  <SelectItem value="12">12 ساعة</SelectItem>
                  <SelectItem value="24">24 ساعة</SelectItem>
                  <SelectItem value="48">يومان</SelectItem>
                  <SelectItem value="168">أسبوع</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => selectedUser && grantTempAccess(selectedUser.id)}>
              <Clock className="w-4 h-4 ml-2" />
              منح الوصول
              </Button>
              </div>
              </DialogContent>
              </Dialog>

              {/* Audit Log Dialog */}
              <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
              <DialogTitle className="text-white">سجل النشاط</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
              {auditLog.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  log.type === 'automation' ? 'bg-purple-500/20' :
                  log.type === 'device' ? 'bg-cyan-500/20' :
                  log.type === 'user' ? 'bg-green-500/20' : 'bg-amber-500/20'
                }`}>
                  {log.type === 'automation' ? <Settings className="w-4 h-4 text-purple-400" /> :
                   log.type === 'device' ? <Smartphone className="w-4 h-4 text-cyan-400" /> :
                   log.type === 'user' ? <Users className="w-4 h-4 text-green-400" /> :
                   <Shield className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{log.action}</p>
                    <span className="text-slate-500 text-xs">{log.time}</span>
                  </div>
                  <p className="text-slate-400 text-xs">{log.target}</p>
                  <p className="text-slate-500 text-xs">{log.user}</p>
                </div>
              </div>
              ))}
              </div>
              </DialogContent>
              </Dialog>

              {/* Temporary Role Creation Dialog */}
              <Dialog open={showTempRoleDialog} onOpenChange={setShowTempRoleDialog}>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-green-400" />
                إنشاء دور مؤقت
              </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">اختر قالب</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {tempRoleTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedTempTemplate === template.id
                            ? 'bg-green-500/20 border border-green-500/50'
                            : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => {
                          setSelectedTempTemplate(template.id);
                          setTempAccessDuration(template.duration);
                        }}
                      >
                        <p className="text-white text-sm font-medium">{template.name}</p>
                        <p className="text-slate-400 text-xs">{template.duration} ساعة</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">الاسم</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    placeholder="اسم المستخدم"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">مدة الصلاحية</Label>
                  <Select value={tempAccessDuration} onValueChange={setTempAccessDuration}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1">ساعة واحدة</SelectItem>
                      <SelectItem value="4">4 ساعات</SelectItem>
                      <SelectItem value="8">8 ساعات</SelectItem>
                      <SelectItem value="24">يوم واحد</SelectItem>
                      <SelectItem value="48">يومان</SelectItem>
                      <SelectItem value="168">أسبوع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedTempTemplate && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm font-medium mb-2">صلاحيات القالب:</p>
                    <div className="flex flex-wrap gap-1">
                      {tempRoleTemplates.find(t => t.id === selectedTempTemplate)?.permissions.map(p => (
                        <Badge key={p} variant="outline" className="border-green-500/50 text-green-400 text-xs">
                          {permissionsList.find(pl => pl.id === p)?.name || p}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-green-300 text-sm font-medium mt-2 mb-1">مجموعات الأجهزة:</p>
                    <div className="flex flex-wrap gap-1">
                      {tempRoleTemplates.find(t => t.id === selectedTempTemplate)?.deviceGroups.map(dg => (
                        <Badge key={dg} variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                          {deviceGroups.find(g => g.id === dg)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={createTempRole}>
                  <Timer className="w-4 h-4 ml-2" />
                  إنشاء الدور المؤقت
                </Button>
              </div>
              </DialogContent>
              </Dialog>

              {/* Review Dialog */}
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                مراجعة الصلاحيات الدورية
              </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-amber-300 font-medium">المستخدمون المطلوب مراجعتهم</p>
                    <Badge className="bg-red-500/20 text-red-400">{pendingReviews.length}</Badge>
                  </div>
                  <p className="text-slate-400 text-sm">راجع صلاحيات هؤلاء المستخدمين للتأكد من ملاءمتها لأدوارهم الحالية</p>
                </div>

                <div className="space-y-2">
                  {pendingReviews.map(user => (
                    <div key={user.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-slate-600 text-slate-300">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-slate-400 text-xs">{user.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-slate-600 h-7" onClick={() => { setSelectedUser(user); setShowEditDialog(true); setShowReviewDialog(false); }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7" onClick={() => completeReview(user.id)}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 h-7" onClick={() => deleteUser(user.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.map(p => (
                          <Badge key={p} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                            {permissionsList.find(pl => pl.id === p)?.name || p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {pendingReviews.length > 0 && (
                  <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={completeAllReviews}>
                    <Check className="w-4 h-4 ml-2" />
                    الموافقة على جميع الصلاحيات الحالية
                  </Button>
                )}

                {pendingReviews.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-white font-medium">جميع المراجعات مكتملة!</p>
                    <p className="text-slate-400 text-sm">المراجعة القادمة: {nextReviewDate.toLocaleDateString('ar-SA')}</p>
                  </div>
                )}
              </div>
              </DialogContent>
              </Dialog>
              </div>
              );
              }