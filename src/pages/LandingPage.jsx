import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Brain, Shield, Car, Building2, Cpu, Camera, Users, Zap, Activity,
  Heart, Factory, GraduationCap, ShoppingBag, Leaf, Droplets, Sun,
  Globe, Plane, Phone, Package, Wrench, BarChart3, Eye, Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Module Cards Data
const modules = [
  { icon: Brain, name: 'AI Intelligence', nameAr: 'الذكاء الاصطناعي', color: '#22d3ee', page: 'AIVisionHub' },
  { icon: Building2, name: 'Smart City', nameAr: 'المدينة الذكية', color: '#a855f7', page: 'SmartCity' },
  { icon: Shield, name: 'Public Safety', nameAr: 'السلامة العامة', color: '#ef4444', page: 'SmartPublicSafety' },
  { icon: Car, name: 'Fleet Management', nameAr: 'إدارة الأسطول', color: '#22c55e', page: 'FleetAdvanced' },
  { icon: Cpu, name: 'IoT Operations', nameAr: 'إنترنت الأشياء', color: '#f59e0b', page: 'DeviceManagement' },
  { icon: Users, name: 'Citizen Experience', nameAr: 'تجربة المواطن', color: '#ec4899', page: 'VisitorManagement' },
  { icon: Camera, name: 'Video Analytics', nameAr: 'تحليلات الفيديو', color: '#06b6d4', page: 'CameraHealth' },
  { icon: Heart, name: 'Smart Hospital', nameAr: 'المستشفى الذكي', color: '#f43f5e', page: 'HospitalCommandCenter' },
  { icon: Factory, name: 'Industrial Zones', nameAr: 'المناطق الصناعية', color: '#d97706', page: 'SmartIndustrial' },
  { icon: GraduationCap, name: 'Education', nameAr: 'التعليم الذكي', color: '#8b5cf6', page: 'SmartEducation' },
  { icon: ShoppingBag, name: 'Commerce', nameAr: 'التجارة الذكية', color: '#ec4899', page: 'SmartCommerce' },
  { icon: Leaf, name: 'Environment', nameAr: 'البيئة', color: '#10b981', page: 'SmartEnvironment' },
  { icon: Droplets, name: 'Utilities', nameAr: 'المرافق', color: '#3b82f6', page: 'SmartUtilities' },
  { icon: Sun, name: 'Energy Grid', nameAr: 'شبكة الطاقة', color: '#eab308', page: 'SmartEnergy' },
  { icon: Globe, name: 'Digital Twin', nameAr: 'التوأم الرقمي', color: '#14b8a6', page: 'CityDigitalTwin' },
  { icon: Phone, name: 'Call Center', nameAr: 'مركز الاتصال', color: '#6366f1', page: 'UnifiedCallCenter' },
];

// Floating particles
const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 5 + 3,
  delay: Math.random() * 3,
}));

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    base44.auth.redirectToLogin('/Home');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0e1a]">
      {/* Animated City Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80')`,
            filter: 'brightness(0.4) saturate(1.2)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-[#0a0e1a]/80" />
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          left: mousePosition.x * 0.02 - 100,
          top: mousePosition.y * 0.02 - 100,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)',
          right: -mousePosition.x * 0.01,
          bottom: -mousePosition.y * 0.01,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `rgba(${Math.random() > 0.5 ? '34, 211, 238' : '139, 92, 246'}, 0.6)`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Circuit Lines Animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1={`${i * 15}%`}
            y1="0%"
            x2={`${i * 15 + 10}%`}
            y2="100%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          className="p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930def126e302f23b0b6e3d/1b5c014af_image.png"
              alt="Elarian Group"
              className="h-12 lg:h-16"
            />
            <Button 
              onClick={handleEnter}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400"
            >
              دخول المنصة
            </Button>
          </div>
        </motion.header>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Smart Government Platform
              </span>
            </motion.h1>
            <motion.p
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Unlock the future of digital governance & smart city intelligence
            </motion.p>
            <motion.p
              className="text-cyan-400 text-xl mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              منصة الحكومة الذكية المتكاملة
            </motion.p>
          </motion.div>

          {/* Module Cards Grid */}
          <motion.div
            className="w-full max-w-7xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <Link to={createPageUrl(module.page)}>
                    <div className="relative p-4 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden">
                      {/* Glow Effect */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"
                        style={{ background: `radial-gradient(circle at center, ${module.color}, transparent 70%)` }}
                      />
                      
                      {/* Icon */}
                      <div className="relative flex flex-col items-center text-center">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${module.color}20`, border: `1px solid ${module.color}40` }}
                        >
                          <module.icon className="w-6 h-6" style={{ color: module.color }} />
                        </div>
                        <span className="text-white text-xs font-medium leading-tight">{module.name}</span>
                        <span className="text-slate-500 text-[10px] mt-0.5">{module.nameAr}</span>
                      </div>

                      {/* Corner Accent */}
                      <div 
                        className="absolute top-0 right-0 w-8 h-8 opacity-30"
                        style={{
                          background: `linear-gradient(135deg, ${module.color} 0%, transparent 60%)`,
                          borderTopRightRadius: '0.75rem',
                        }}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enter Button */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleEnter}
                size="lg"
                className="px-12 py-6 text-lg bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 hover:from-purple-500 hover:via-cyan-400 hover:to-pink-400 rounded-full shadow-2xl shadow-purple-500/30"
              >
                <span className="ml-2">دخول المنصة</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer Stats */}
        <motion.footer
          className="p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: '200+', label: 'AI Models' },
              { value: '50+', label: 'Smart Modules' },
              { value: '24/7', label: 'Monitoring' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="px-6">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-sm mt-6">
            © 2024 Elarian Group. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}