import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Bot, User, Sparkles, 
  Mic, Paperclip, MoreVertical, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: 'Hello! I\'m your VisionAI assistant. I can help you with:\n\n• Incident management and analysis\n• Camera system monitoring\n• Traffic intelligence queries\n• Cybersecurity threat assessment\n• System configuration\n\nHow can I assist you today?',
    timestamp: new Date()
  }
];

const quickActions = [
  'Show active incidents',
  'Camera health status',
  'Traffic analysis report',
  'Check cybersecurity threats',
  'Drone fleet status',
];

export default function Assistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are VisionAI Assistant, an AI helper for a smart city security operations center. 
      You help users with incident management, camera monitoring, traffic analysis, cybersecurity, and drone operations.
      Keep responses concise and helpful. Use bullet points when listing information.
      
      User question: ${input}`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" }
        }
      }
    });

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: response.response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickAction = (action) => {
    setInput(action);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-purple-400" />
          AI Assistant
        </h1>
        <p className="text-slate-400 mt-1">Intelligent chatbot for system assistance</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-[calc(100vh-200px)] flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b border-slate-700/50 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">VisionAI Assistant</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-400">Online</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30'
                          : 'bg-slate-800/80 border border-slate-700/50'
                      }`}>
                        <p className="text-white whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-slate-400 text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="bg-slate-800/50 border-slate-700 text-white pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/50"
                  onClick={() => handleQuickAction(action)}
                >
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Incident Analysis', desc: 'Review and manage incidents' },
                { label: 'System Monitoring', desc: 'Check camera and sensor status' },
                { label: 'Report Generation', desc: 'Create custom reports' },
                { label: 'Threat Assessment', desc: 'Analyze security threats' },
              ].map((cap, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-white text-sm font-medium">{cap.label}</p>
                  <p className="text-slate-400 text-xs">{cap.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}