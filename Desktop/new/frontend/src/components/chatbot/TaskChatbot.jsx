import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Bot, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TaskChatbot({ task }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `سلام! من دستیار هوشمند تسک "${task.title}" هستم. چطور می‌تونم کمکتون کنم؟`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = `
تسک: ${task.title}
توضیحات: ${task.description || 'ندارد'}
وضعیت: ${task.status}
اولویت: ${task.priority}
${task.deadline ? `مهلت: ${task.deadline}` : ''}
      `.trim();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `تو یک دستیار هوشمند برای کمک به انجام تسک‌ها هستی. 
        
اطلاعات تسک:
${context}

سوال کاربر: ${input}

لطفاً به صورت مفید، مختصر و دوستانه به فارسی پاسخ بده. اگر نیاز به کد یا راهنمایی تکنیکال است، جزئیات بیشتری بده.`,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: typeof result === 'string' ? result : result.response || 'متأسفانه نتوانستم پاسخ مناسبی تولید کنم.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ خطایی رخ داد. لطفاً دوباره تلاش کنید.'
      }]);
    }

    setIsLoading(false);
  };

  return (
    <Card className="h-[500px] flex flex-col border-2 border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          چت‌بات هوشمند
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
        </div>

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
            placeholder="سوال خود را بپرسید..."
            rows={2}
            className="resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}