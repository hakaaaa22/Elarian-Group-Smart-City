import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Eye, Users, Car, Shield, Activity, 
  TrendingUp, Zap, CheckCircle, Clock, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const aiModels = [
  {
    name: 'Object Detection v4.2',
    type: 'Object Detection',
    icon: Eye,
    accuracy: 98.5,
    status: 'active',
    requests: 125000,
    lastUpdated: '2 hours ago'
  },
  {
    name: 'Face Recognition Pro',
    type: 'Biometric Analysis',
    icon: Users,
    accuracy: 99.2,
    status: 'active',
    requests: 89000,
    lastUpdated: '1 hour ago'
  },
  {
    name: 'Traffic Flow Analyzer',
    type: 'Traffic Analysis',
    icon: Car,
    accuracy: 96.8,
    status: 'active',
    requests: 67000,
    lastUpdated: '30 mins ago'
  },
  {
    name: 'Anomaly Detector v2',
    type: 'Anomaly Detection',
    icon: Activity,
    accuracy: 94.5,
    status: 'training',
    requests: 45000,
    lastUpdated: '5 hours ago'
  },
  {
    name: 'Threat Classifier',
    type: 'Security Analysis',
    icon: Shield,
    accuracy: 97.1,
    status: 'active',
    requests: 32000,
    lastUpdated: '15 mins ago'
  },
  {
    name: 'Behavioral Analysis',
    type: 'Pattern Recognition',
    icon: Brain,
    accuracy: 93.8,
    status: 'inactive',
    requests: 28000,
    lastUpdated: '1 day ago'
  },
];

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  training: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function AIModels() {
  const totalRequests = aiModels.reduce((sum, m) => sum + m.requests, 0);
  const avgAccuracy = (aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length).toFixed(1);
  const activeModels = aiModels.filter(m => m.status === 'active').length;

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          AI Models
        </h1>
        <p className="text-slate-400 mt-2">Manage and monitor AI/ML models</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Models', value: aiModels.length, icon: Brain, color: 'purple' },
          { label: 'Active Models', value: activeModels, icon: CheckCircle, color: 'emerald' },
          { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: TrendingUp, color: 'cyan' },
          { label: 'Total Requests', value: `${(totalRequests / 1000).toFixed(0)}K`, icon: Zap, color: 'amber' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {aiModels.map((model, i) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                      <model.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{model.name}</h3>
                      <p className="text-slate-400 text-sm">{model.type}</p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[model.status]} border`}>
                    {model.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="text-white font-medium">{model.accuracy}%</span>
                    </div>
                    <Progress 
                      value={model.accuracy} 
                      className="h-2 bg-slate-700"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <BarChart3 className="w-4 h-4" />
                      <span>{(model.requests / 1000).toFixed(0)}K requests</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{model.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}