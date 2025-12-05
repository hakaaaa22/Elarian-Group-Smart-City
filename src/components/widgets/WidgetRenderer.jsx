import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, PieChart, LineChart, Map, Gauge, Table, Activity,
  Thermometer, Droplets, Zap, Car, Camera, Clock, Calendar,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target,
  GripVertical, Settings, X, Maximize2, Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, BarChart, Bar, LineChart as ReLineChart, Line,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const mockTimeSeriesData = [
  { time: '00:00', value: 45, prev: 40 },
  { time: '04:00', value: 52, prev: 48 },
  { time: '08:00', value: 78, prev: 70 },
  { time: '12:00', value: 85, prev: 82 },
  { time: '16:00', value: 72, prev: 75 },
  { time: '20:00', value: 58, prev: 55 },
];

const mockPieData = [
  { name: 'نشط', value: 65, color: '#22d3ee' },
  { name: 'خامل', value: 20, color: '#a855f7' },
  { name: 'غير متصل', value: 15, color: '#64748b' },
];

export default function WidgetRenderer({ widget, config = {}, isEditing, onRemove, onConfigure }) {
  const { title = widget.name, color = '#22d3ee' } = config;

  const renderContent = () => {
    switch (widget.id) {
      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={mockTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="prev" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        );

      case 'bar-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={mockPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                {mockPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        );

      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'gauge':
        const gaugeValue = 72;
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#334155" strokeWidth="8" fill="none" />
                <circle
                  cx="48" cy="48" r="40"
                  stroke={color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${gaugeValue * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{gaugeValue}%</span>
              </div>
            </div>
          </div>
        );

      case 'kpi-card':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-3xl font-bold text-white">1,234</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+12.5%</span>
            </div>
          </div>
        );

      case 'stat-card':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-4xl font-bold" style={{ color: color }}>89</p>
            <p className="text-slate-400 text-sm mt-1">عبر الإنترنت</p>
          </div>
        );

      case 'temperature':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Thermometer className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">24.5°C</p>
            <p className="text-slate-400 text-xs">طبيعي</p>
          </div>
        );

      case 'humidity':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Droplets className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">65%</p>
            <p className="text-slate-400 text-xs">رطوبة</p>
          </div>
        );

      case 'power-meter':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Zap className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">2.4 kW</p>
            <p className="text-slate-400 text-xs">استهلاك</p>
          </div>
        );

      case 'status-indicator':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white text-sm">النظام يعمل</p>
          </div>
        );

      case 'clock':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Clock className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-white font-mono">
              {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-slate-400 text-xs">
              {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>
        );

      case 'progress-bar':
        return (
          <div className="flex flex-col justify-center h-full px-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white">التقدم</span>
              <span className="text-cyan-400">75%</span>
            </div>
            <Progress value={75} className="h-3" />
          </div>
        );

      case 'alert-list':
        return (
          <div className="space-y-2 overflow-y-auto h-full p-2">
            {[
              { text: 'تجاوز السرعة - VH-001', severity: 'high' },
              { text: 'انخفاض الوقود - VH-003', severity: 'medium' },
              { text: 'صيانة قريبة - VH-005', severity: 'low' },
            ].map((alert, i) => (
              <div key={i} className={`p-2 rounded-lg flex items-center gap-2 ${
                alert.severity === 'high' ? 'bg-red-500/20' :
                alert.severity === 'medium' ? 'bg-amber-500/20' : 'bg-blue-500/20'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${
                  alert.severity === 'high' ? 'text-red-400' :
                  alert.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'
                }`} />
                <span className="text-white text-xs">{alert.text}</span>
              </div>
            ))}
          </div>
        );

      case 'live-map':
      case 'fleet-map':
      case 'heatmap':
        return (
          <div className="h-full bg-slate-900/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">خريطة تفاعلية</p>
            </div>
          </div>
        );

      case 'camera-feed':
        return (
          <div className="h-full bg-slate-900 rounded-lg flex items-center justify-center relative">
            <Camera className="w-12 h-12 text-slate-600" />
            <Badge className="absolute top-2 right-2 bg-red-500">Live</Badge>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 text-sm">{widget.name}</p>
          </div>
        );
    }
  };

  return (
    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full overflow-hidden group">
      <CardHeader className="p-2 border-b border-slate-700/50 flex flex-row items-center justify-between">
        <CardTitle className="text-white text-xs flex items-center gap-2">
          {isEditing && <GripVertical className="w-3 h-3 text-slate-500 cursor-move" />}
          {title}
        </CardTitle>
        {isEditing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400" onClick={onConfigure}>
              <Settings className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400" onClick={onRemove}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-2 h-[calc(100%-40px)]">
        {renderContent()}
      </CardContent>
    </Card>
  );
}