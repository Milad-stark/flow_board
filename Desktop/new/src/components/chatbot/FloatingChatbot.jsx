import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bot, Send, Loader2, X, Minimize2, Maximize2, FileText, BarChart3, HelpCircle, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date'),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const language = user?.language || 'en';
  const theme = user?.theme || 'light';
  const { t } = useTranslation(language);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: language === 'fa' 
            ? 'سلام! 👋 من دستیار هوشمند شما هستم. چطور می‌تونم کمک کنم؟' 
            : 'Hello! 👋 I\'m your AI assistant. How can I help you?'
        }
      ]);
    }
  }, [isOpen, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      icon: FileText,
      labelFa: "گزارش گیری",
      labelEn: "Generate Report",
      action: () => handleQuickAction(language === 'fa' ? "یک گزارش کامل از وضعیت پروژه‌ها و وظایف من بساز" : "Generate a complete report of my projects and tasks status")
    },
    {
      icon: BarChart3,
      labelFa: "تحلیل عملکرد",
      labelEn: "Performance Analysis",
      action: () => handleQuickAction(language === 'fa' ? "عملکرد من را تحلیل کن و پیشنهاد بده" : "Analyze my performance and give suggestions")
    },
    {
      icon: Lightbulb,
      labelFa: "پیشنهادات",
      labelEn: "Suggestions",
      action: () => handleQuickAction(language === 'fa' ? "چه کارهایی باید امروز انجام دهم؟" : "What should I work on today?")
    },
    {
      icon: HelpCircle,
      labelFa: "راهنما",
      labelEn: "Help",
      action: () => handleQuickAction(language === 'fa' ? "چطور می‌تونم از این سیستم استفاده کنم؟" : "How can I use this system?")
    }
  ];

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    handleSend(prompt);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const response = await base44.functions.invoke('generateReport', {
        user_id: user.id,
        language
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'fa' ? '✅ گزارش با موفقیت دانلود شد!' : '✅ Report downloaded successfully!'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'fa' ? '❌ خطا در دانلود گزارش' : '❌ Error downloading report'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (customInput = null) => {
    const messageText = customInput || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    if (!customInput) setInput("");
    setIsLoading(true);

    try {
      const myTasks = tasks.filter(t => t.assignee_id === user?.id);
      const overdueTasks = myTasks.filter(t => 
        t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'
      );
      const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
      const todoTasks = myTasks.filter(t => t.status === 'todo');

      const context = language === 'fa' ? `
اطلاعات کاربر:
- نام: ${user?.full_name || 'کاربر'}
- ایمیل: ${user?.email || '-'}
- نقش شغلی: ${user?.job_role || '-'}
- تعداد کل تسک‌ها: ${myTasks.length}
- تسک‌های در حال انجام: ${inProgressTasks.length}
- تسک‌های انجام نشده: ${todoTasks.length}
- تسک‌های عقب‌افتاده: ${overdueTasks.length}

پروژه‌های فعال:
${projects.filter(p => p.status === 'active').map(p => `- ${p.name}: ${tasks.filter(t => t.project_id === p.id).length} تسک`).join('\n')}

تسک‌های اخیر:
${myTasks.slice(0, 5).map(t => `- ${t.title} (وضعیت: ${t.status}, اولویت: ${t.priority})`).join('\n')}
      `.trim() : `
User Information:
- Name: ${user?.full_name || 'User'}
- Email: ${user?.email || '-'}
- Job Role: ${user?.job_role || '-'}
- Total Tasks: ${myTasks.length}
- In Progress: ${inProgressTasks.length}
- Todo: ${todoTasks.length}
- Overdue: ${overdueTasks.length}

Active Projects:
${projects.filter(p => p.status === 'active').map(p => `- ${p.name}: ${tasks.filter(t => t.project_id === p.id).length} tasks`).join('\n')}

Recent Tasks:
${myTasks.slice(0, 5).map(t => `- ${t.title} (status: ${t.status}, priority: ${t.priority})`).join('\n')}
      `.trim();

      const promptText = language === 'fa' ? `تو یک دستیار هوشمند مدیریت پروژه هستی که به کاربران در مدیریت تسک‌ها، پروژه‌ها و زمان‌بندی کمک می‌کنی.

اطلاعات فعلی کاربر:
${context}

سوال کاربر: ${messageText}

لطفاً:
1. به صورت دوستانه، مفید و حرفه‌ای به فارسی پاسخ بده
2. اگر کاربر در مورد تسک یا پروژه خاصی سوال کرد، از اطلاعات بالا استفاده کن
3. پیشنهادات عملی برای بهبود بهره‌وری بده
4. اگر تسک عقب‌افتاده‌ای وجود داره، یادآوری کن
5. از ایموجی برای جذاب‌تر کردن پاسخ استفاده کن
6. اگر نیاز به اقدام خاصی هست، راهنمایی کن

پاسخ کوتاه و مفید بده (حداکثر 4-5 خط).` : `You are an AI project management assistant helping users manage tasks, projects and time.

Current user data:
${context}

User question: ${messageText}

Please:
1. Respond in a friendly, helpful and professional manner in English
2. Use the data above if asked about specific tasks or projects
3. Give practical suggestions for productivity
4. Remind about overdue tasks if any
5. Use emojis to make responses engaging
6. Provide guidance if action is needed

Keep response concise (max 4-5 lines).`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: promptText,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: typeof result === 'string' ? result : result.response || (language === 'fa' ? 'متأسفانه نتوانستم پاسخ مناسبی تولید کنم.' : 'Sorry, I couldn\'t generate a proper response.')
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'fa' ? '❌ خطایی رخ داد. لطفاً دوباره تلاش کنید.' : '❌ An error occurred. Please try again.'
      }]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl relative"
              size="icon"
            >
              <Bot className="w-8 h-8 text-white" />
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window - Vertical Rectangle */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed bottom-6 left-6 z-50 w-96 shadow-2xl ${
              isMinimized ? 'h-16' : 'h-[600px]'
            }`}
          >
            <Card className={`h-full flex flex-col border-2 border-purple-200 overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{language === 'fa' ? 'دستیار هوشمند' : 'AI Assistant'}</CardTitle>
                      <p className="text-xs text-purple-100">{language === 'fa' ? 'آنلاین' : 'Online'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  {/* Quick Actions */}
                  <div className={`p-3 grid grid-cols-2 gap-2 border-b ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={action.action}
                        disabled={isLoading}
                        className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-300' : 'bg-white hover:bg-gray-100'}`}
                      >
                        <action.icon className="w-4 h-4" />
                        <span className="text-xs">{language === 'fa' ? action.labelFa : action.labelEn}</span>
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isLoading}
                    className={`m-3 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    <FileText className="w-4 h-4 ml-2 mr-2" />
                    {language === 'fa' ? 'دانلود گزارش PDF' : 'Download PDF Report'}
                  </Button>

                  {/* Messages */}
                  <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-b from-purple-50/30 to-pink-50/30'}`}>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : theme === 'dark' ? 'bg-slate-700 text-gray-100' : 'bg-white shadow-md text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-white shadow-md'}`}>
                          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className={`p-4 border-t ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={language === 'fa' ? 'پیام خود را بنویسید...' : 'Type your message...'}
                        rows={2}
                        className={`resize-none text-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="self-end bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {language === 'fa' ? 'Enter برای ارسال، Shift+Enter برای خط جدید' : 'Enter to send, Shift+Enter for new line'}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}