import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  Users, Shield, AlertTriangle, Car, MapPin, Factory,
  Beaker, Route, Globe, Lock, Activity, Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const modules = [
  {
    name: 'People Analytics',
    description: 'Crowd monitoring & behavior analysis',
    icon: Users,
    color: 'cyan',
    size: 'large',
    page: 'Home'
  },
  {
    name: 'Industrial Security AI',
    description: 'Vulnerability assessments',
    icon: Shield,
    color: 'purple',
    size: 'large',
    page: 'CybersecurityMap'
  },
  {
    name: 'Incident & Alerts',
    description: 'Real-time incident management',
    icon: AlertTriangle,
    color: 'amber',
    size: 'medium',
    page: 'IncidentCenter'
  },
  {
    name: 'Alerts',
    description: 'System notifications',
    icon: Activity,
    color: 'yellow',
    size: 'small',
    page: 'IncidentCenter'
  },
  {
    name: 'Threat Detection',
    description: 'AI-powered threat analysis',
    icon: Target,
    color: 'red',
    size: 'medium',
    page: 'CybersecurityMap'
  },
  {
    name: 'Traffic Analysis',
    description: 'Flow optimization & monitoring',
    icon: Car,
    color: 'green',
    size: 'medium',
    page: 'TrafficIntelligence'
  },
  {
    name: 'EvacSys / Evac Routes',
    description: 'Emergency evacuation planning',
    icon: Route,
    color: 'orange',
    size: 'large',
    page: 'SmartCityMap'
  },
  {
    name: 'Smart City',
    description: 'Infrastructure Monitoring',
    icon: Globe,
    color: 'blue',
    size: 'large',
    page: 'SmartCityMap'
  },
];

export default function Modules() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-white">Modules</h1>
        <p className="text-slate-400 mt-2">Access all system capabilities</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {modules.map((module, i) => {
          const sizeClasses = {
            small: 'col-span-1 row-span-1',
            medium: 'col-span-1 row-span-1',
            large: 'col-span-1 lg:col-span-2 row-span-1'
          };

          return (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={sizeClasses[module.size]}
            >
              <Link to={createPageUrl(module.page)}>
                <Card className="h-full glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 transition-all cursor-pointer group overflow-hidden relative">
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-${module.color}-500/10 to-transparent`} />
                  
                  {/* Border Glow */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity`} 
                       style={{ 
                         boxShadow: `inset 0 0 30px rgba(99, 102, 241, 0.1), 0 0 30px rgba(99, 102, 241, 0.1)` 
                       }} />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br from-${module.color}-500/20 to-${module.color}-600/10 border border-${module.color}-500/30`}>
                        <module.icon className={`w-6 h-6 text-${module.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors">
                          {module.name}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">{module.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}