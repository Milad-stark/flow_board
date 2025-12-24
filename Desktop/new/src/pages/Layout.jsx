
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  CheckSquare,
  Trello,
  FolderKanban,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  User,
  Trophy,
  Pin,
  PinOff,
  Moon,
  Sun
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import FloatingChatbot from "@/components/chatbot/FloatingChatbot";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? base44.entities.Notification.filter({ user_id: user.id, is_read: false }, '-created_date', 10) : [],
    enabled: !!user?.id,
  });

  const updateThemeMutation = useMutation({
    mutationFn: (newTheme) => base44.auth.updateMe({ theme: newTheme }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const language = user?.language || 'en';
  const theme = user?.theme || 'light';
  const { t } = useTranslation(language);
  
  const navigationItems = [
    { title: t('dashboard'), url: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { title: t('myTasks'), url: createPageUrl("TaskList"), icon: CheckSquare },
    { title: t('kanban'), url: createPageUrl("TaskBoard"), icon: Trello },
    { title: t('projects'), url: createPageUrl("Projects"), icon: FolderKanban },
    { title: t('reports'), url: createPageUrl("Reports"), icon: BarChart3 },
    { title: t('leaderboard'), url: createPageUrl("Leaderboard"), icon: Trophy },
    { title: t('profile'), url: createPageUrl("Profile"), icon: User },
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateThemeMutation.mutate(newTheme);
  };

  const dir = language === 'fa' ? 'rtl' : 'ltr';

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark' : ''}`} dir={dir}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { 
          font-family: ${language === 'fa' ? 'Vazirmatn, sans-serif' : 'Inter, sans-serif'};
        }
        
        body {
          background: ${theme === 'dark' ? '#0f172a' : '#f8fafc'};
          color: ${theme === 'dark' ? '#f1f5f9' : '#0f172a'};
        }
      `}</style>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: language === 'fa' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'fa' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed top-0 ${language === 'fa' ? 'right-0' : 'left-0'} h-full w-80 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-2xl z-50 lg:hidden`}
            >
              <div className={`p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} border-b`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Trello className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'fa' ? 'مدیریت پروژه' : 'Project Manager'}
                      </h2>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {language === 'fa' ? 'سیستم جامع' : 'Complete System'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-3 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.url}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      location.pathname === item.url
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${sidebarPinned ? 'w-64' : 'w-20'} transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-${language === 'fa' ? 'l' : 'r'}`}>
        <div className="h-full flex flex-col">
          <div className={`p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} border-b flex items-center ${sidebarPinned ? 'justify-between' : 'justify-center'}`}>
            {sidebarPinned ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Trello className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {language === 'fa' ? 'مدیریت پروژه' : 'PM System'}
                    </h2>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {language === 'fa' ? 'سیستم جامع' : 'Complete'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarPinned(false)}>
                  <PinOff className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSidebarPinned(true)}>
                <Pin className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              </Button>
            )}
          </div>

          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                  location.pathname === item.url
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                } ${!sidebarPinned && 'justify-center'}`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarPinned && <span className="font-medium">{item.title}</span>}
                {!sidebarPinned && (
                  <div className={`absolute ${language === 'fa' ? 'right-full mr-2' : 'left-full ml-2'} ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-900'} text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50`}>
                    {item.title}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className={`p-4 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} border-t ${!sidebarPinned && 'flex justify-center'}`}>
            {sidebarPinned && user ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {user.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.full_name}</p>
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                </div>
              </div>
            ) : (
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30`}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className={`absolute ${language === 'fa' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input
                placeholder={t('search')}
                className={`${language === 'fa' ? 'pr-10' : 'pl-10'} ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-400' : 'bg-gray-50 border-gray-200 placeholder:text-gray-500'}`}
              />
            </div>
          </div>

          <LanguageSwitcher />

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Link to={createPageUrl("Notifications")}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white border-0">
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </Link>

          <Link to={createPageUrl("Settings")}>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </header>

        {/* Page Content */}
        <div className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
          {children}
        </div>

        {/* Floating Chatbot */}
        <FloatingChatbot />
      </main>
    </div>
  );
}
