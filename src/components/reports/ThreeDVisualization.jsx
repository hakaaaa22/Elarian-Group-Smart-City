import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, BarChart3, Map, TrendingUp, RefreshCw, Settings, Download,
  Maximize2, Minimize2, Play, Pause, RotateCw, ZoomIn, ZoomOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// بيانات خريطة حرارية للنفايات
const wasteHeatmapData = [
  { zone: 'المنطقة الشمالية', x: 20, y: 30, intensity: 85, waste: 450 },
  { zone: 'المنطقة الجنوبية', x: 60, y: 70, intensity: 65, waste: 320 },
  { zone: 'المنطقة الشرقية', x: 80, y: 40, intensity: 92, waste: 520 },
  { zone: 'المنطقة الغربية', x: 30, y: 60, intensity: 45, waste: 210 },
  { zone: 'الوسط', x: 50, y: 50, intensity: 78, waste: 380 },
];

// بيانات المرور ثلاثية الأبعاد
const traffic3DData = [
  { hour: '06:00', north: 45, south: 38, east: 52, west: 41 },
  { hour: '08:00', north: 85, south: 78, east: 92, west: 72 },
  { hour: '10:00', north: 68, south: 62, east: 75, west: 58 },
  { hour: '12:00', north: 72, south: 68, east: 78, west: 65 },
  { hour: '14:00', north: 65, south: 58, east: 70, west: 55 },
  { hour: '16:00', north: 88, south: 82, east: 95, west: 78 },
  { hour: '18:00', north: 75, south: 70, east: 82, west: 68 },
  { hour: '20:00', north: 48, south: 42, east: 55, west: 45 },
];

export default function ThreeDVisualization() {
  const [visualType, setVisualType] = useState('heatmap');
  const [isRotating, setIsRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState([0]);
  const [zoom, setZoom] = useState([100]);
  const canvasRef = useRef(null);

  // تحليل AI للتصورات
  const analyzeVisualization = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل بيانات التصور التالية وتقديم رؤى:

بيانات النفايات:
${wasteHeatmapData.map(d => `- ${d.zone}: كثافة ${d.intensity}%, نفايات ${d.waste} طن`).join('\n')}

بيانات المرور:
${traffic3DData.map(d => `- ${d.hour}: شمال ${d.north}%, جنوب ${d.south}%`).join('\n')}

قدم:
1. الأنماط الرئيسية المكتشفة
2. المناطق الحرجة
3. توصيات التحسين
4. توقعات المستقبل`,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: { type: "array", items: { type: "string" } },
            criticalZones: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            predictions: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: () => toast.success('تم تحليل البيانات')
  });

  // رسم خريطة حرارية بسيطة باستخدام Canvas
  useEffect(() => {
    if (canvasRef.current && visualType === 'heatmap') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // مسح الخلفية
      ctx.fillStyle = '#0f1629';
      ctx.fillRect(0, 0, width, height);

      // رسم الشبكة
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo((width / 10) * i, 0);
        ctx.lineTo((width / 10) * i, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (height / 10) * i);
        ctx.lineTo(width, (height / 10) * i);
        ctx.stroke();
      }

      // رسم نقاط الحرارة
      wasteHeatmapData.forEach(point => {
        const x = (point.x / 100) * width;
        const y = (point.y / 100) * height;
        const radius = 30 + (point.intensity / 100) * 40;

        // تدرج لوني
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        if (point.intensity > 80) {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else if (point.intensity > 60) {
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // النص
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(point.zone, x, y - 5);
        ctx.fillText(`${point.intensity}%`, x, y + 12);
      });
    }
  }, [visualType, rotation, zoom]);

  // رسم رسم بياني ثلاثي الأبعاد مبسط
  useEffect(() => {
    if (canvasRef.current && visualType === '3dbar') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#0f1629';
      ctx.fillRect(0, 0, width, height);

      const barWidth = 25;
      const spacing = 50;
      const startX = 60;
      const baseY = height - 40;
      const maxHeight = height - 80;
      const rotationAngle = (rotation[0] / 100) * 0.3;

      traffic3DData.forEach((data, i) => {
        const x = startX + i * spacing;
        const directions = [
          { value: data.north, color: '#22d3ee', offset: 0 },
          { value: data.south, color: '#a855f7', offset: barWidth + 3 },
        ];

        directions.forEach(dir => {
          const barHeight = (dir.value / 100) * maxHeight;
          const offsetX = dir.offset + Math.sin(rotationAngle) * 10;
          
          // الجانب
          ctx.fillStyle = dir.color + '88';
          ctx.beginPath();
          ctx.moveTo(x + offsetX, baseY - barHeight);
          ctx.lineTo(x + offsetX + 10, baseY - barHeight - 5);
          ctx.lineTo(x + offsetX + 10, baseY - 5);
          ctx.lineTo(x + offsetX, baseY);
          ctx.closePath();
          ctx.fill();

          // الأمام
          ctx.fillStyle = dir.color;
          ctx.fillRect(x + offsetX, baseY - barHeight, barWidth, barHeight);

          // الأعلى
          ctx.fillStyle = dir.color + 'cc';
          ctx.beginPath();
          ctx.moveTo(x + offsetX, baseY - barHeight);
          ctx.lineTo(x + offsetX + 10, baseY - barHeight - 5);
          ctx.lineTo(x + offsetX + barWidth + 10, baseY - barHeight - 5);
          ctx.lineTo(x + offsetX + barWidth, baseY - barHeight);
          ctx.closePath();
          ctx.fill();
        });

        // التسمية
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data.hour, x + barWidth, baseY + 15);
      });

      // المفتاح
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(width - 100, 20, 15, 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Arial';
      ctx.fillText('شمال', width - 80, 32);

      ctx.fillStyle = '#a855f7';
      ctx.fillRect(width - 100, 42, 15, 15);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('جنوب', width - 80, 54);
    }
  }, [visualType, rotation, zoom]);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Box className="w-5 h-5 text-purple-400" />
          تصورات البيانات المتقدمة
        </h3>
        <div className="flex gap-2">
          <Select value={visualType} onValueChange={setVisualType}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heatmap">خريطة حرارية</SelectItem>
              <SelectItem value="3dbar">رسم ثلاثي الأبعاد</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-purple-500 text-purple-400" onClick={() => analyzeVisualization.mutate()} disabled={analyzeVisualization.isPending}>
            {analyzeVisualization.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <TrendingUp className="w-4 h-4 ml-2" />}
            تحليل AI
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Visualization Canvas */}
        <Card className={`${isFullscreen ? 'lg:col-span-4' : 'lg:col-span-3'} glass-card border-indigo-500/20 bg-[#0f1629]/80`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">
                {visualType === 'heatmap' ? 'خريطة توزيع النفايات الحرارية' : 'تحليل حركة المرور ثلاثي الأبعاد'}
              </CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                className="w-full rounded-lg border border-slate-700"
              />
              
              {/* Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/80 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsRotating(!isRotating)}>
                    {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <RotateCw className="w-3 h-3 text-slate-400" />
                    <Slider value={rotation} onValueChange={setRotation} max={100} step={1} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <ZoomIn className="w-3 h-3 text-slate-400" />
                    <Slider value={zoom} onValueChange={setZoom} min={50} max={150} step={10} className="flex-1" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Panel */}
        {!isFullscreen && (
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">البيانات التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {visualType === 'heatmap' ? (
                  wasteHeatmapData.map((zone, i) => (
                    <div key={i} className="p-2 bg-slate-800/50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{zone.zone}</span>
                        <Badge className={zone.intensity > 80 ? 'bg-red-500/20 text-red-400' : zone.intensity > 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                          {zone.intensity}%
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-xs">{zone.waste} طن نفايات</p>
                    </div>
                  ))
                ) : (
                  traffic3DData.slice(0, 5).map((data, i) => (
                    <div key={i} className="p-2 bg-slate-800/50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{data.hour}</span>
                        <Badge className="bg-cyan-500/20 text-cyan-400">{Math.round((data.north + data.south) / 2)}%</Badge>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-cyan-400">شمال: {data.north}%</span>
                        <span className="text-purple-400">جنوب: {data.south}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Legend */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-slate-400 text-sm">كثافة عالية (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-slate-400 text-sm">كثافة متوسطة (60-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-cyan-500" />
                <span className="text-slate-400 text-sm">كثافة منخفضة (&lt;60%)</span>
              </div>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400">
              آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}