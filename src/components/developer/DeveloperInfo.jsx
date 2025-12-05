import React from 'react';
import { motion } from 'framer-motion';
import {
  Code, Mail, Phone, MapPin, Award, Briefcase, GraduationCap,
  Globe, Linkedin, Github, Calendar, Star, Lightbulb, Target,
  Cpu, Brain, Zap, Shield, Users, TrendingUp, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const developerInfo = {
  name: 'Khaled Abd El Hamed El Arian',
  nameAr: 'خالد عبد الحميد العريان',
  title: 'Technology Executive | Smart City & AI/IoT Innovation Leader',
  email: 'khaledalarian@outlook.com',
  phone: '+966501442765',
  nationality: 'Egyptian',
  
  expertise: [
    'AI technologies',
    'IoT ecosystems',
    'GIS-driven solutions',
    'Intelligent automation',
    'Smart city infrastructure',
    'RF-ID enabled collaborative systems',
    'Environmental compliance',
    'Urban safety',
    'Digital resilience'
  ],
  
  specializations: [
    'Smart waste management',
    'Smart landfill technologies',
    'Smart traffic systems',
    'Analytics and MS solutions',
    'Advanced sensor networks',
    'Real-time environmental monitoring',
    'Temperature and position tracking',
    'Environmental compliance systems'
  ],

  experience: [
    'Over 15 years of proven leadership in AI technologies',
    'Successfully designed and delivered large-scale IoT ecosystems',
    'Expert in intelligent automation and smart city environments',
    'Transforming operational challenges into intelligent solutions',
    'Leading globally-minded ecosystems for digital resilience',
    '80+ enabled collaborative systems',
    'Smart city infrastructure deployment',
    'Cloud/on-prem architectures'
  ],

  approach: [
    'Strategic leadership, operational excellence',
    'Clear focus on building high-impact smart city platforms',
    'Enhance public safety, digital transformation',
    'Sustainable decision-making capabilities',
    'Optimizing IoT-driven platforms',
    'Long-term value and measurable ROI'
  ],

  achievements: [
    'Contributed to global smart city initiatives',
    'Delivered intelligent, resilient, and secure urban systems',
    'Led transformative technologies and VMS deployments',
    'Achieved measurable environmental and operational awareness',
    'Enhanced public safety and urban accountability'
  ]
};

export default function DeveloperInfo() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-pink-500/10 border-purple-500/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Photo */}
              <div className="relative group">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(139, 92, 246, 0.3)',
                      '0 0 40px rgba(6, 182, 212, 0.4)',
                      '0 0 20px rgba(139, 92, 246, 0.3)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-52 h-52 rounded-2xl overflow-hidden border-4 border-purple-500/50 relative"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 z-10 pointer-events-none" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930def126e302f23b0b6e3d/cfe8a1dd1_Q_0Pt5t3fuoAFKtP4xBos.png"
                    alt="Khaled El Arian"
                    className="w-full h-full object-cover relative z-0 group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
                {/* Floating Badge */}
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-3 -right-3 p-3 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-600 rounded-xl shadow-lg shadow-purple-500/40"
                >
                  <Code className="w-6 h-6 text-white" />
                </motion.div>
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-right">
                <h2 className="text-3xl font-bold text-white mb-2">{developerInfo.nameAr}</h2>
                <h3 className="text-xl text-purple-400 mb-3">{developerInfo.name}</h3>
                <p className="text-cyan-400 text-lg mb-4">{developerInfo.title}</p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4">
                  <Badge className="bg-purple-500/20 text-purple-400">
                    <Mail className="w-3 h-3 ml-1" />
                    {developerInfo.email}
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-400">
                    <Phone className="w-3 h-3 ml-1" />
                    {developerInfo.phone}
                  </Badge>
                  <Badge className="bg-pink-500/20 text-pink-400">
                    <MapPin className="w-3 h-3 ml-1" />
                    {developerInfo.nationality}
                  </Badge>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Mail className="w-4 h-4 ml-1" />
                    التواصل
                  </Button>
                  <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
                    <Linkedin className="w-4 h-4 ml-1" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expertise & Specializations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              مجالات الخبرة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {developerInfo.expertise.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-slate-300">{item}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              التخصصات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {developerInfo.specializations.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-300">{item}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Experience */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            الخبرات والإنجازات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid lg:grid-cols-2 gap-3">
            {developerInfo.experience.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 bg-slate-900/50 rounded-lg flex items-start gap-3"
              >
                <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approach */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            منهجية العمل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {developerInfo.approach.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 bg-slate-800/50 rounded-lg text-center"
              >
                <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-white text-sm">{item}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            الإنجازات الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {developerInfo.achievements.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300 text-sm">{item}</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border-purple-500/20">
        <CardContent className="p-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Code className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          </motion.div>
          <p className="text-white font-bold text-lg mb-2">نظام متكامل من تطوير</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
            خالد عبد الحميد العريان
          </p>
          <p className="text-slate-400 text-sm mt-3">Technology Executive | Smart City & AI/IoT Innovation Leader</p>
        </CardContent>
      </Card>
    </div>
  );
}