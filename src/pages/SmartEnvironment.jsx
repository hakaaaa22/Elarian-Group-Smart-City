import React from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, Wind, Thermometer, Volume2, Trash2, CloudRain, Sun, TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const airQualityZones = [
  { name: 'وسط المدينة', aqi: 45, status: 'جيد', color: 'green' },
  { name: 'المنطقة الصناعية', aqi: 125, status: 'غير صحي', color: 'red' },
  { name: 'الحي السكني', aqi: 35, status: 'ممتاز', color: 'cyan' },
  { name: 'منطقة الميناء', aqi: 85, status: 'معتدل', color: 'amber' },
];

export default function SmartEnvironment() {
  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-400" />
          البيئة الذكية
        </h1>
        <p className="text-slate-400 mt-1">مراقبة جودة الهواء والضوضاء والنفايات</p>
      </motion.div>

      {/* Environmental Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Wind className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">AQI 52</p>
            <p className="text-green-400 text-xs">جودة الهواء</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Volume2 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">58 dB</p>
            <p className="text-purple-400 text-xs">مستوى الضوضاء</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Thermometer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">32°C</p>
            <p className="text-amber-400 text-xs">درجة الحرارة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <TrendingDown className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">-12%</p>
            <p className="text-cyan-400 text-xs">البصمة الكربونية</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Air Quality Map */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">جودة الهواء حسب المنطقة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {airQualityZones.map((zone, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">{zone.name}</span>
                  <Badge className={`bg-${zone.color}-500/20 text-${zone.color}-400`}>{zone.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(zone.aqi, 100)} className="h-2 flex-1" />
                  <span className={`text-${zone.color}-400 font-bold`}>AQI {zone.aqi}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Waste Management */}
        <Card className="glass-card border-green-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-green-400" />
              إدارة النفايات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'جمع اليوم', value: '2,450', unit: 'طن' },
                { label: 'نسبة إعادة التدوير', value: '38', unit: '%' },
                { label: 'حاويات ممتلئة', value: '12', unit: '' },
                { label: 'شاحنات نشطة', value: '45', unit: '' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-400">{item.value}</p>
                  <p className="text-slate-400 text-xs">{item.label} {item.unit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sustainability Score */}
        <Card className="glass-card border-cyan-500/20 bg-[#0f1629]/80 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">نقاط الاستدامة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-cyan-400">78</p>
                <p className="text-slate-400">من 100</p>
                <Badge className="bg-green-500/20 text-green-400 mt-2">أداء جيد</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}