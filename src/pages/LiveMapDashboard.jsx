import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Map, Activity, Filter, RefreshCw, Maximize2, Download, Layers,
  Camera, Car, Radio, Package, Shield, Droplets, Zap
} from 'lucide-react';
import LiveAssetMap from '@/components/map/LiveAssetMap';
import PredictiveAlertSystem from '@/components/alerts/PredictiveAlertSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LiveMapDashboard() {
  const [activeTab, setActiveTab] = useState('map');

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
              <Map className="w-8 h-8 text-cyan-400" />
              الخرائط التفاعلية الحية
            </h1>
            <p className="text-slate-400 mt-1">تتبع الأصول الحيوية والبيانات المباشرة على الخريطة</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-700">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
            <Button variant="outline" className="border-slate-700">
              <Maximize2 className="w-4 h-4 ml-2" />
              ملء الشاشة
            </Button>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 mb-4">
          <TabsTrigger value="map" className="data-[state=active]:bg-cyan-500/20">
            <Map className="w-4 h-4 ml-1" />
            الخريطة
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-500/20">
            <Activity className="w-4 h-4 ml-1" />
            التنبيهات التنبؤية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <LiveAssetMap height="600px" showControls={true} />
        </TabsContent>

        <TabsContent value="alerts">
          <PredictiveAlertSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}