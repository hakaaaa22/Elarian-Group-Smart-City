import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, Users, Video, Mic, MicOff, VideoOff, Phone, PhoneOff,
  Maximize2, Minimize2, Settings, Eye, EyeOff, Hand, MessageSquare,
  Share2, StopCircle, Play, Pause, ScreenShare, Circle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AdvancedScreenShare({ customerData, onShareChange }) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareMode, setShareMode] = useState('screen'); // screen, window, tab
  const [controls, setControls] = useState({
    video: true,
    audio: true,
    customerControl: false,
    annotations: true,
    recording: false,
  });
  const [viewerCount, setViewerCount] = useState(1);
  const [quality, setQuality] = useState(720);

  const startShare = () => {
    setIsSharing(true);
    onShareChange?.(true);
    toast.success('تم بدء مشاركة الشاشة');
  };

  const stopShare = () => {
    setIsSharing(false);
    onShareChange?.(false);
    toast.info('تم إيقاف مشاركة الشاشة');
  };

  const toggleControl = (key) => {
    setControls(prev => ({ ...prev, [key]: !prev[key] }));
    if (key === 'recording') {
      toast.info(controls.recording ? 'تم إيقاف التسجيل' : 'تم بدء التسجيل');
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isSharing ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className={`p-2 rounded-xl ${isSharing ? 'bg-green-500/20' : 'bg-slate-700/50'}`}
          >
            <Monitor className={`w-5 h-5 ${isSharing ? 'text-green-400' : 'text-slate-400'}`} />
          </motion.div>
          <div>
            <h4 className="text-white font-bold flex items-center gap-2">
              مشاركة الشاشة المتقدمة
              {isSharing && (
                <Badge className="bg-green-500/20 text-green-400 animate-pulse">
                  <Circle className="w-2 h-2 ml-1 fill-green-400" />
                  مباشر
                </Badge>
              )}
            </h4>
            <p className="text-slate-400 text-xs">Advanced Screen Sharing</p>
          </div>
        </div>
        <Button
          className={isSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          onClick={isSharing ? stopShare : startShare}
        >
          {isSharing ? (
            <><StopCircle className="w-4 h-4 ml-2" /> إيقاف المشاركة</>
          ) : (
            <><Share2 className="w-4 h-4 ml-2" /> بدء المشاركة</>
          )}
        </Button>
      </div>

      {/* Share Preview */}
      <Card className={`border ${isSharing ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
        <CardContent className="p-4">
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {isSharing ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
                <div className="text-center z-10">
                  <Monitor className="w-16 h-16 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-medium">جاري مشاركة الشاشة</p>
                  <p className="text-slate-400 text-sm mt-1">الجودة: {quality}p</p>
                </div>
                {controls.recording && (
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-red-500"
                    />
                    <span className="text-red-400 text-xs">تسجيل</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <Badge className="bg-slate-800/80 text-slate-300">
                    <Eye className="w-3 h-3 ml-1" />
                    {viewerCount} مشاهد
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-center">
                <ScreenShare className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">اضغط "بدء المشاركة" للبدء</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            خيارات المشاركة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Share Mode */}
          <div>
            <Label className="text-slate-400 text-xs mb-2 block">وضع المشاركة</Label>
            <div className="flex gap-2">
              {[
                { id: 'screen', label: 'الشاشة كاملة', icon: Monitor },
                { id: 'window', label: 'نافذة', icon: Maximize2 },
                { id: 'tab', label: 'تبويب', icon: Settings },
              ].map(mode => (
                <Button
                  key={mode.id}
                  size="sm"
                  variant={shareMode === mode.id ? 'default' : 'outline'}
                  className={`flex-1 h-8 ${shareMode === mode.id ? 'bg-cyan-600' : 'border-slate-600'}`}
                  onClick={() => setShareMode(mode.id)}
                >
                  <mode.icon className="w-3 h-3 ml-1" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <Label className="text-slate-400 text-xs mb-2 block">جودة البث: {quality}p</Label>
            <Slider
              value={[quality]}
              onValueChange={(v) => setQuality(v[0])}
              min={480}
              max={1080}
              step={180}
              className="w-full"
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
              <Label className="text-slate-300 text-xs flex items-center gap-1">
                {controls.video ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                فيديو
              </Label>
              <Switch checked={controls.video} onCheckedChange={() => toggleControl('video')} />
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
              <Label className="text-slate-300 text-xs flex items-center gap-1">
                {controls.audio ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                صوت
              </Label>
              <Switch checked={controls.audio} onCheckedChange={() => toggleControl('audio')} />
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
              <Label className="text-slate-300 text-xs">تحكم العميل</Label>
              <Switch checked={controls.customerControl} onCheckedChange={() => toggleControl('customerControl')} />
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
              <Label className="text-slate-300 text-xs">التعليقات</Label>
              <Switch checked={controls.annotations} onCheckedChange={() => toggleControl('annotations')} />
            </div>
            <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded">
              <Label className="text-slate-300 text-xs flex items-center gap-1">
                <Circle className={`w-2 h-2 ${controls.recording ? 'fill-red-500 text-red-500' : ''}`} />
                تسجيل
              </Label>
              <Switch checked={controls.recording} onCheckedChange={() => toggleControl('recording')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card className="bg-cyan-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                {customerData?.name?.[0] || 'ع'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium">{customerData?.name || 'العميل'}</p>
              <p className="text-slate-400 text-xs">
                {isSharing ? 'يشاهد الشاشة الآن' : 'في انتظار المشاركة'}
              </p>
            </div>
            {controls.customerControl && (
              <Badge className="bg-amber-500/20 text-amber-400 mr-auto">
                <Hand className="w-3 h-3 ml-1" />
                يمكنه التحكم
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}