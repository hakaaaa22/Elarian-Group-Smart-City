import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, Plus, Edit, Trash2, Power, Lightbulb, Thermometer, Shield,
  Tv, Zap, Gauge, ChevronDown, ChevronRight, Settings, Check, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const groupIcons = [
  { id: 'folder', icon: Folder },
  { id: 'lightbulb', icon: Lightbulb },
  { id: 'thermometer', icon: Thermometer },
  { id: 'shield', icon: Shield },
  { id: 'tv', icon: Tv },
  { id: 'zap', icon: Zap },
];

const groupColors = ['cyan', 'purple', 'amber', 'green', 'red', 'pink', 'indigo', 'blue'];

export default function DeviceGroups({ devices, onToggleDevice }) {
  const [groups, setGroups] = useState([
    { id: 'g1', name: 'أضواء الطابق السفلي', icon: 'lightbulb', color: 'amber', deviceIds: ['dev-1'], expanded: true },
    { id: 'g2', name: 'أجهزة الأمان', icon: 'shield', color: 'red', deviceIds: ['dev-3', 'dev-4', 'dev-11'], expanded: false },
    { id: 'g3', name: 'مكيفات المنزل', icon: 'thermometer', color: 'cyan', deviceIds: ['dev-2', 'dev-9'], expanded: false },
  ]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', icon: 'folder', color: 'cyan', deviceIds: [] });

  const toggleGroupExpand = (groupId) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g));
  };

  const toggleGroupPower = (group) => {
    const groupDevices = devices.filter(d => group.deviceIds.includes(d.id));
    const allOn = groupDevices.every(d => d.state.on);
    groupDevices.forEach(d => {
      if (d.state.on !== undefined) {
        onToggleDevice(d.id, !allOn);
      }
    });
    toast.success(`تم ${allOn ? 'إيقاف' : 'تشغيل'} مجموعة "${group.name}"`);
  };

  const createGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('يرجى إدخال اسم المجموعة');
      return;
    }
    const group = {
      id: `g-${Date.now()}`,
      ...newGroup,
      expanded: true
    };
    setGroups([...groups, group]);
    setNewGroup({ name: '', icon: 'folder', color: 'cyan', deviceIds: [] });
    setShowCreateDialog(false);
    toast.success('تم إنشاء المجموعة بنجاح');
  };

  const updateGroup = () => {
    setGroups(groups.map(g => g.id === editingGroup.id ? editingGroup : g));
    setEditingGroup(null);
    toast.success('تم تحديث المجموعة');
  };

  const deleteGroup = (groupId) => {
    setGroups(groups.filter(g => g.id !== groupId));
    toast.success('تم حذف المجموعة');
  };

  const getGroupIcon = (iconId) => {
    const found = groupIcons.find(i => i.id === iconId);
    return found ? found.icon : Folder;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Folder className="w-5 h-5 text-cyan-400" />
          مجموعات الأجهزة المخصصة
        </h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 ml-1" />
              مجموعة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">إنشاء مجموعة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">اسم المجموعة</Label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="مثال: أضواء غرفة النوم"
                />
              </div>
              <div>
                <Label className="text-slate-300">الأيقونة</Label>
                <div className="flex gap-2 mt-2">
                  {groupIcons.map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setNewGroup({ ...newGroup, icon: id })}
                      className={`p-2 rounded-lg transition-all ${
                        newGroup.icon === id ? 'bg-cyan-500/30 ring-2 ring-cyan-500' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-slate-300">اللون</Label>
                <div className="flex gap-2 mt-2">
                  {groupColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewGroup({ ...newGroup, color })}
                      className={`w-8 h-8 rounded-full bg-${color}-500 transition-all ${
                        newGroup.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-slate-300">اختر الأجهزة</Label>
                <div className="mt-2 max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-800/50 rounded-lg">
                  {devices.map(device => (
                    <label key={device.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-700/50 rounded">
                      <Checkbox
                        checked={newGroup.deviceIds.includes(device.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewGroup({ ...newGroup, deviceIds: [...newGroup.deviceIds, device.id] });
                          } else {
                            setNewGroup({ ...newGroup, deviceIds: newGroup.deviceIds.filter(id => id !== device.id) });
                          }
                        }}
                      />
                      <span className="text-white text-sm">{device.name}</span>
                      <span className="text-slate-500 text-xs">({device.room})</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={createGroup}>
                إنشاء المجموعة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {groups.map(group => {
          const GroupIcon = getGroupIcon(group.icon);
          const groupDevices = devices.filter(d => group.deviceIds.includes(d.id));
          const onlineCount = groupDevices.filter(d => d.status === 'online').length;
          const allOn = groupDevices.filter(d => d.state.on !== undefined).every(d => d.state.on);

          return (
            <Card key={group.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-0">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleGroupExpand(group.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${group.color}-500/20`}>
                      <GroupIcon className={`w-5 h-5 text-${group.color}-400`} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{group.name}</h4>
                      <p className="text-slate-400 text-xs">{groupDevices.length} أجهزة • {onlineCount} متصل</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={allOn}
                      onCheckedChange={() => toggleGroupPower(group)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400"
                      onClick={(e) => { e.stopPropagation(); setEditingGroup(group); }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400"
                      onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {group.expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {group.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-700/50 overflow-hidden"
                    >
                      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {groupDevices.map(device => (
                          <div
                            key={device.id}
                            className={`p-3 rounded-lg bg-slate-800/50 flex items-center justify-between ${
                              device.status === 'offline' ? 'opacity-50' : ''
                            }`}
                          >
                            <div>
                              <p className="text-white text-sm">{device.name}</p>
                              <p className="text-slate-500 text-xs">{device.room}</p>
                            </div>
                            {device.state.on !== undefined && (
                              <Switch
                                checked={device.state.on}
                                onCheckedChange={() => onToggleDevice(device.id)}
                                disabled={device.status === 'offline'}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل المجموعة</DialogTitle>
          </DialogHeader>
          {editingGroup && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">اسم المجموعة</Label>
                <Input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">اختر الأجهزة</Label>
                <div className="mt-2 max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-800/50 rounded-lg">
                  {devices.map(device => (
                    <label key={device.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-700/50 rounded">
                      <Checkbox
                        checked={editingGroup.deviceIds.includes(device.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditingGroup({ ...editingGroup, deviceIds: [...editingGroup.deviceIds, device.id] });
                          } else {
                            setEditingGroup({ ...editingGroup, deviceIds: editingGroup.deviceIds.filter(id => id !== device.id) });
                          }
                        }}
                      />
                      <span className="text-white text-sm">{device.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={updateGroup}>
                حفظ التغييرات
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}