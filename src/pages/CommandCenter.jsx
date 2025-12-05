import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, Camera, AlertTriangle, Radio, Phone, Users, Map, Zap,
  Shield, Activity, Bell, Volume2, Maximize2, Grid3X3, Play, Pause,
  RotateCcw, Settings, ChevronRight, Clock, CheckCircle, XCircle, Plane, Brain
} from 'lucide-react';
import DroneAIAnalytics from '@/components/drones/DroneAIAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// الحوادث النشطة
const activeIncidents = [
  { id: 1, type: 'emergency', title: 'حريق في المنطقة الصناعية', location: 'المنطقة C', time: '5 دقائق', status: 'active', responders: 4, priority: 'critical' },
  { id: 2, type: 'security', title: 'اختراق أمني - البوابة 3', location: 'البوابة الشمالية', time: '12 دقيقة', status: 'responding', responders: 2, priority: 'high' },
  { id: 3, type: 'traffic', title: 'حادث مروري', location: 'الطريق السريع', time: '20 دقيقة', status: 'monitoring', responders: 1, priority: 'medium' },
];

// الكاميرات
const cameras = [
  { id: 1, name: 'كاميرا البوابة الرئيسية', status: 'online', zone: 'المدخل', recording: true },
  { id: 2, name: 'كاميرا الموقف A', status: 'online', zone: 'المواقف', recording: true },
  { id: 3, name: 'كاميرا المنطقة الصناعية', status: 'alert', zone: 'الصناعية', recording: true },
  { id: 4, name: 'كاميرا المستودع', status: 'online', zone: 'المستودعات', recording: true },
  { id: 5, name: 'كاميرا الطوارئ 1', status: 'online', zone: 'الطوارئ', recording: true },
  { id: 6, name: 'كاميرا المكتب الإداري', status: 'offline', zone: 'الإدارة', recording: false },
];

// فرق الاستجابة
const responseTeams = [
  { id: 1, name: 'فريق الطوارئ A', status: 'deployed', location: 'المنطقة الصناعية', members: 4 },
  { id: 2, name: 'الأمن المتنقل', status: 'available', location: 'البوابة الرئيسية', members: 2 },
  { id: 3, name: 'فريق الإسعاف', status: 'standby', location: 'المركز الطبي', members: 3 },
  { id: 4, name: 'فريق الإطفاء', status: 'deployed', location: 'المنطقة الصناعية', members: 6 },
];

export default function CommandCenter() {
  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [gridView, setGridView] = useState(4);

  const activateEmergency = () => {
    setEmergencyMode(true);
    toast.error('تم تفعيل وضع الطوارئ!');
  };

  const deactivateEmergency = () => {
    setEmergencyMode(false);
    toast.success('تم إلغاء وضع الطوارئ');
  };

  const dispatchTeam = (team) => {
    toast.success(`تم إرسال ${team.name} للموقع`);
  };

  return (
    <div className={`min-h-screen p-4 lg:p-6 ${emergencyMode ? 'bg-red-950/20' : ''}`} dir="rtl">
      {/* Emergency Banner */}
      {emergencyMode && (
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 p-3 text-center"
        >
          <div className="flex items-center justify-center gap-4">
            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            <span className="text-white font-bold text-lg">وضع الطوارئ مُفعّل</span>
            <Button size="sm" variant="outline" className="border-white text-white" onClick={deactivateEmergency}>
              إلغاء
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 ${emergencyMode ? 'mt-12' : ''}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Monitor className="w-8 h-8 text-cyan-400" />
              مركز القيادة والتحكم
            </h1>
            <p className="text-slate-400 mt-1">C4/C5 - غرفة العمليات المركزية</p>
          </div>
          <div className="flex gap-2">
            <Button 
              className={emergencyMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={emergencyMode ? deactivateEmergency : activateEmergency}
            >
              <AlertTriangle className="w-4 h-4 ml-2" />
              {emergencyMode ? 'إلغاء الطوارئ' : 'وضع الطوارئ'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'حوادث نشطة', value: activeIncidents.length, icon: AlertTriangle, color: 'red' },
          { label: 'كاميرات متصلة', value: `${cameras.filter(c => c.status !== 'offline').length}/${cameras.length}`, icon: Camera, color: 'cyan' },
          { label: 'فرق مُرسلة', value: responseTeams.filter(t => t.status === 'deployed').length, icon: Users, color: 'amber' },
          { label: 'مستوى الأمان', value: '94%', icon: Shield, color: 'green' },
          { label: 'تنبيهات اليوم', value: 12, icon: Bell, color: 'purple' },
          { label: 'وقت الاستجابة', value: '3 د', icon: Clock, color: 'blue' },
        ].map((stat, i) => (
          <Card key={stat.label} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${emergencyMode && stat.color === 'red' ? 'border-red-500 animate-pulse' : ''}`}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="cameras" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="cameras" className="data-[state=active]:bg-cyan-500/20">
            <Camera className="w-4 h-4 ml-1" />
            الكاميرات
          </TabsTrigger>
          <TabsTrigger value="drones" className="data-[state=active]:bg-purple-500/20">
            <Plane className="w-4 h-4 ml-1" />
            تحليلات الدرونز AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cameras">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Camera Grid */}
            <div className="lg:col-span-2">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  شبكة الكاميرات
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={String(gridView)} onValueChange={(v) => setGridView(Number(v))}>
                    <SelectTrigger className="w-20 bg-slate-800/50 border-slate-700 text-white h-8">
                      <Grid3X3 className="w-4 h-4" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1">1×1</SelectItem>
                      <SelectItem value="4">2×2</SelectItem>
                      <SelectItem value="6">2×3</SelectItem>
                      <SelectItem value="9">3×3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost"><Maximize2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-2 ${gridView === 1 ? 'grid-cols-1' : gridView === 4 ? 'grid-cols-2' : gridView === 6 ? 'grid-cols-3' : 'grid-cols-3'}`}>
                {cameras.slice(0, gridView).map(cam => (
                  <div 
                    key={cam.id}
                    onClick={() => setSelectedCamera(cam)}
                    className={`relative aspect-video bg-slate-900 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedCamera?.id === cam.id ? 'border-cyan-500' : 
                      cam.status === 'alert' ? 'border-red-500 animate-pulse' : 
                      cam.status === 'offline' ? 'border-slate-700' : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Camera Feed Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {cam.status === 'offline' ? (
                        <XCircle className="w-8 h-8 text-slate-600" />
                      ) : (
                        <Camera className={`w-8 h-8 ${cam.status === 'alert' ? 'text-red-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                    {/* Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs truncate">{cam.name}</span>
                        <div className="flex items-center gap-1">
                          {cam.recording && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                          <span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-green-500' : cam.status === 'alert' ? 'bg-red-500' : 'bg-slate-500'}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Incidents */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                الحوادث النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeIncidents.map(incident => (
                  <div key={incident.id} className={`p-3 rounded-lg border ${
                    incident.priority === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                    incident.priority === 'high' ? 'bg-amber-500/10 border-amber-500/50' :
                    'bg-slate-800/30 border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          incident.priority === 'critical' ? 'text-red-400' :
                          incident.priority === 'high' ? 'text-amber-400' : 'text-blue-400'
                        }`} />
                        <span className="text-white font-medium">{incident.title}</span>
                      </div>
                      <Badge className={
                        incident.status === 'active' ? 'bg-red-500/20 text-red-400' :
                        incident.status === 'responding' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }>
                        {incident.status === 'active' ? 'نشط' : incident.status === 'responding' ? 'استجابة' : 'مراقبة'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{incident.location}</span>
                      <span className="text-slate-500">{incident.time} • {incident.responders} مستجيب</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Teams & Controls */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="border-red-500/50 text-red-400 h-16 flex-col">
                  <AlertTriangle className="w-5 h-5 mb-1" />
                  <span className="text-xs">إنذار عام</span>
                </Button>
                <Button variant="outline" className="border-amber-500/50 text-amber-400 h-16 flex-col">
                  <Radio className="w-5 h-5 mb-1" />
                  <span className="text-xs">بث طوارئ</span>
                </Button>
                <Button variant="outline" className="border-cyan-500/50 text-cyan-400 h-16 flex-col">
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-xs">اتصال جماعي</span>
                </Button>
                <Button variant="outline" className="border-green-500/50 text-green-400 h-16 flex-col">
                  <Shield className="w-5 h-5 mb-1" />
                  <span className="text-xs">قفل المنشأة</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response Teams */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                فرق الاستجابة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responseTeams.map(team => (
                  <div key={team.id} className="p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{team.name}</span>
                      <Badge className={
                        team.status === 'deployed' ? 'bg-red-500/20 text-red-400' :
                        team.status === 'available' ? 'bg-green-500/20 text-green-400' :
                        'bg-amber-500/20 text-amber-400'
                      }>
                        {team.status === 'deployed' ? 'مُرسل' : team.status === 'available' ? 'متاح' : 'احتياط'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">{team.location}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">{team.members} أفراد</span>
                        {team.status !== 'deployed' && (
                          <Button size="sm" className="h-6 text-xs bg-cyan-600" onClick={() => dispatchTeam(team)}>
                            إرسال
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                حالة الأنظمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'نظام الكاميرات', status: 98 },
                  { name: 'نظام الإنذار', status: 100 },
                  { name: 'الاتصالات', status: 95 },
                  { name: 'قاعدة البيانات', status: 99 },
                ].map(sys => (
                  <div key={sys.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">{sys.name}</span>
                      <span className={`text-sm ${sys.status >= 95 ? 'text-green-400' : 'text-amber-400'}`}>{sys.status}%</span>
                    </div>
                    <Progress value={sys.status} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="drones">
          <DroneAIAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}