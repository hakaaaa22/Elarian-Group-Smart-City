import React from 'react';
import { useLanguage } from './LanguageProvider';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguageSelector({ collapsed = false }) {
  const { language, setLanguage, t } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={collapsed ? "icon" : "sm"}
          className="text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          <Globe className="w-4 h-4" />
          {!collapsed && (
            <span className="mr-2">{currentLang?.flag} {currentLang?.name}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-[#0f1629] border-slate-700 min-w-[150px]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${
              language === lang.code 
                ? 'bg-cyan-500/20 text-cyan-400' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="ml-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}