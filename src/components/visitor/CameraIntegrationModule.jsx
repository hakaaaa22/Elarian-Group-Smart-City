import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Eye, MapPin, User, Clock, AlertTriangle, Play, Pause,
  Maximize2, Link2, Activity, CheckCircle, Video, Image as ImageIcon,
  RefreshCw, Settings, Search, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const linkedCameras = [
  { 
    id: 'cam1', 
    name: 'كاميرا البوابة الرئيسية', 
    zone: 'المدخل الرئيسي',
    status: 'active',
    faceRecognition: true,
    detections: 45,
    alerts: 2,
    lastActivity: '2025-01-15 10:30'
  },
  { 
    id: 'cam2', 
    name: 'كاميرا الاستقبال', 
    zone: 'منطقة الاستقبال',
    status: 'active',
    faceRecognition: true,
    detections: 32,
    alerts: 0,
    lastActivity: '2025-01-15 10:28'
  },
  { 
    id: 'cam3', 
    name: 'كاميرا موقف الزوار', 
    zone: 'موقف السيارات',
    status: 'active',
    faceRecognition: false,
    detections: 28,
    alerts: 1,
    lastActivity: '2025-01-15 10:25'
  },
  { 
    id: 'cam4', 
    name: 'كاميرا الممر A', 
    zone: 'الممر الرئيسي',
    status: 'maintenance',
    faceRecognition: true,
    detections: 0,
    alerts: 0,
    lastActivity: '2025-01-15 08:00'
  },
];

const visitorTracking = [
  {
    id: 1,
    visitor: 'أحمد محمد',
    photo: null,
    currentZone: 'منطقة الاستقبال',
    entryTime: '09:30',
    duration: '1:00 ساعة',
    linkedCameras: ['cam1', 'cam2'],
    status: 'active',
    alerts: []
  },
  {
    id: 2,
    visitor: 'سارة خالد',
    photo: null,
    currentZone: 'المكاتب الإدارية',
    entryTime: '08:45',
    duration: '1:45 ساعة',
    linkedCameras: ['cam1', 'cam2'],
    status: 'overtime',
    alerts: ['تجاوز الوقت المسموح']
  },
  {
    id: 3,
    visitor: 'محمد علي',
    photo: null,
    currentZone: 'موقف السيارات',
    entryTime: '10:15',
    duration: '0:15 دقيقة',
    linkedCameras: ['cam3'],
    status: 'active',
    alerts: []
  },
];

const cameraRecordings = [
  { id: 1, camera: 'cam1', visitor: 'سارة خالد', event: 'تجاوز وقت الخروج', timestamp: '2025-01-15 10:30', duration: '00:45', thumbnail: null },
  { id: 2, camera: 'cam2', visitor: 'زائر غير معروف', event: 'كشف وجه غير مسجل', timestamp: '2025-01-15 10:20', duration: '00:30', thumbnail: null },
  { id: 3, camera: 'cam1', visitor: 'أحمد محمد', event: 'دخول المنشأة', timestamp: '2025-01-15 09:30', duration: '00:15', thumbnail: null },
];

export default function CameraIntegrationModule() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);

  const getCameraById = (id) => linkedCameras.find(c => c.id === id);

  const stats = {
    activeCameras: linkedCameras.filter(c => c.status === 'active').length,
    totalDetections: linkedCameras.reduce((acc, c) => acc + c.detections, 0),
    activeAlerts: linkedCameras.reduce((acc, c) => acc + c.alerts, 0),
    trackingVisitors: visitorTracking.length
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
            <Camera className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">تكامل نظام المراقبة</h3>
            <p className="text-slate-500 text-sm">ربط الزوار بالكاميرات والتعرف على الوجه</p>
          </div>
        </div>
        <Button variant="outline" className="border-slate-600">
          <Settings className="w-4 h-4 ml-2" />
          إعدادات التكامل
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Camera className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.activeCameras}</p>
              <p className="text-green-400 text-sm">كاميرا نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Eye className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalDetections}</p>
              <p className="text-cyan-400 text-sm">عملية كشف</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.activeAlerts}</p>
              <p className="text-amber-400 text-sm">تنبيهات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.trackingVisitors}</p>
              <p className="text-purple-400 text-sm">زائر متتبع</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Cameras */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-pink-400" />
              الكاميرات النشطة في مناطق الزوار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {linkedCameras.map(camera => (
              <motion.div
                key={camera.id}
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  camera.status === 'active' 
                    ? 'bg-slate-900/50 border-slate-700/50 hover:border-pink-500/30' 
                    : 'bg-slate-900/30 border-slate-700/30 opacity-60'
                }`}
                onClick={() => setSelectedCamera(camera)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${camera.status === 'active' ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                      <Camera className={`w-4 h-4 ${camera.status === 'active' ? 'text-green-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{camera.name}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {camera.zone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {camera.faceRecognition && (
                      <Badge className="bg-pink-500/20 text-pink-400 text-xs">
                        <Eye className="w-3 h-3 ml-1" />
                        Face ID
                      </Badge>
                    )}
                    <Badge className={camera.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {camera.status === 'active' ? 'نشط' : 'صيانة'}
                    </Badge>
                  </div>
                </div>
                {camera.status === 'active' && (
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-slate-500">
                      <Eye className="w-3 h-3 inline ml-1" />
                      {camera.detections} كشف
                    </span>
                    {camera.alerts > 0 && (
                      <span className="text-amber-400">
                        <AlertTriangle className="w-3 h-3 inline ml-1" />
                        {camera.alerts} تنبيه
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Visitor Tracking */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              تتبع الزوار بالوقت الفعلي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visitorTracking.map(visitor => (
              <motion.div
                key={visitor.id}
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  visitor.status === 'overtime' 
                    ? 'bg-red-500/5 border-red-500/30' 
                    : 'bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/30'
                }`}
                onClick={() => setSelectedVisitor(visitor)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-purple-500">
                      <AvatarFallback className="bg-transparent text-white text-sm">
                        {visitor.visitor.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium text-sm">{visitor.visitor}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {visitor.currentZone}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge className={visitor.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {visitor.status === 'active' ? 'نشط' : 'تجاوز الوقت'}
                    </Badge>
                    <p className="text-slate-500 text-xs mt-1">{visitor.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-slate-500 text-xs">الكاميرات:</span>
                  {visitor.linkedCameras.map(camId => {
                    const cam = getCameraById(camId);
                    return cam && (
                      <Badge key={camId} variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                        <Camera className="w-3 h-3 ml-1" />
                        {cam.zone}
                      </Badge>
                    );
                  })}
                </div>
                {visitor.alerts.length > 0 && (
                  <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {visitor.alerts[0]}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alert-Linked Recordings */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-400" />
            التسجيلات المرتبطة بالتنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {cameraRecordings.map(recording => {
              const camera = getCameraById(recording.camera);
              return (
                <motion.div
                  key={recording.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 cursor-pointer hover:border-amber-500/30 transition-all"
                  onClick={() => { setSelectedRecording(recording); setShowRecordingDialog(true); }}
                >
                  <div className="aspect-video bg-slate-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Play className="w-10 h-10 text-white/80" />
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                      {recording.duration}
                    </Badge>
                  </div>
                  <p className="text-white font-medium text-sm">{recording.event}</p>
                  <p className="text-slate-500 text-xs mt-1">{recording.visitor}</p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-slate-500">{camera?.name}</span>
                    <span className="text-slate-600">{recording.timestamp}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recording Dialog */}
      <Dialog open={showRecordingDialog} onOpenChange={setShowRecordingDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-400" />
              تسجيل: {selectedRecording?.event}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-16 h-16 text-white/50" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-500">الزائر</p>
                <p className="text-white">{selectedRecording?.visitor}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-500">التوقيت</p>
                <p className="text-white">{selectedRecording?.timestamp}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-500">الكاميرا</p>
                <p className="text-white">{getCameraById(selectedRecording?.camera)?.name}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-500">المدة</p>
                <p className="text-white">{selectedRecording?.duration}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}