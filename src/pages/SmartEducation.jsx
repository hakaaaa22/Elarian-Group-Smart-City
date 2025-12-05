import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, Bus, Brain, BookOpen, Monitor, Calendar,
  CheckCircle, Clock, TrendingUp, Award, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const schools = [
  { name: 'مدرسة المستقبل الثانوية', students: 1200, attendance: 94, smartClassrooms: 25, buses: 8 },
  { name: 'مدرسة النور الابتدائية', students: 850, attendance: 96, smartClassrooms: 18, buses: 6 },
  { name: 'مدرسة الإبداع المتوسطة', students: 920, attendance: 92, smartClassrooms: 20, buses: 7 },
];

const busTracking = [
  { id: 'BUS-01', route: 'المسار الشمالي', status: 'on_route', students: 35, eta: '10 دقائق' },
  { id: 'BUS-02', route: 'المسار الجنوبي', status: 'arrived', students: 42, eta: 'وصل' },
  { id: 'BUS-03', route: 'المسار الشرقي', status: 'delayed', students: 38, eta: '15 دقيقة' },
];

export default function SmartEducation() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-purple-400" />
          التعليم الذكي
        </h1>
        <p className="text-slate-400 mt-1">إدارة المدارس والفصول الذكية والحافلات</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">45,200</p>
            <p className="text-purple-400 text-xs">طالب</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">94%</p>
            <p className="text-green-400 text-xs">نسبة الحضور</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Monitor className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">320</p>
            <p className="text-cyan-400 text-xs">فصل ذكي</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Bus className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">85</p>
            <p className="text-amber-400 text-xs">حافلة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">المدارس</TabsTrigger>
          <TabsTrigger value="classrooms">الفصول الذكية</TabsTrigger>
          <TabsTrigger value="buses">تتبع الحافلات</TabsTrigger>
          <TabsTrigger value="ai">المعلم AI</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-3">
            {schools.map((school, i) => (
              <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{school.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span><Users className="w-3 h-3 inline ml-1" />{school.students} طالب</span>
                        <span><Monitor className="w-3 h-3 inline ml-1" />{school.smartClassrooms} فصل</span>
                        <span><Bus className="w-3 h-3 inline ml-1" />{school.buses} حافلة</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-slate-400 text-xs">نسبة الحضور</p>
                      <div className="flex items-center gap-2">
                        <Progress value={school.attendance} className="h-2 w-20" />
                        <span className="text-green-400 font-bold">{school.attendance}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Smart Classrooms Tab */}
        <TabsContent value="classrooms" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { feature: 'سبورة تفاعلية', count: 320, icon: Monitor },
              { feature: 'كاميرا AI للحضور', count: 280, icon: CheckCircle },
              { feature: 'مختبر افتراضي', count: 45, icon: Brain },
            ].map((item, i) => (
              <Card key={i} className="glass-card border-cyan-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4 text-center">
                  <item.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{item.count}</p>
                  <p className="text-slate-400 text-sm">{item.feature}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bus Tracking Tab */}
        <TabsContent value="buses" className="mt-4">
          <div className="space-y-3">
            {busTracking.map(bus => (
              <Card key={bus.id} className={`glass-card border-${bus.status === 'arrived' ? 'green' : bus.status === 'delayed' ? 'red' : 'amber'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bus className={`w-6 h-6 text-${bus.status === 'arrived' ? 'green' : bus.status === 'delayed' ? 'red' : 'amber'}-400`} />
                      <div>
                        <p className="text-white font-medium">{bus.id}</p>
                        <p className="text-slate-400 text-sm">{bus.route}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge className={bus.status === 'arrived' ? 'bg-green-500/20 text-green-400' : bus.status === 'delayed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                        {bus.status === 'arrived' ? 'وصل' : bus.status === 'delayed' ? 'متأخر' : 'في الطريق'}
                      </Badge>
                      <p className="text-slate-400 text-xs mt-1">{bus.students} طالب • {bus.eta}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Tutor Tab */}
        <TabsContent value="ai" className="mt-4">
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardContent className="p-6 text-center">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">المعلم الذكي AI</h3>
              <p className="text-slate-400 mb-4">مساعد تعليمي ذكي لكل طالب</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-slate-800/50 rounded">
                  <p className="text-purple-400 font-bold">12,450</p>
                  <p className="text-slate-500 text-xs">جلسة تعليمية</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded">
                  <p className="text-cyan-400 font-bold">89%</p>
                  <p className="text-slate-500 text-xs">رضا الطلاب</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded">
                  <p className="text-green-400 font-bold">+15%</p>
                  <p className="text-slate-500 text-xs">تحسن الأداء</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <MessageSquare className="w-4 h-4 ml-2" />
                تجربة المعلم AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}