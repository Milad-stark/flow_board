import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Paperclip, CheckSquare, AlertTriangle } from "lucide-react";
import { isPast, differenceInDays } from "date-fns";
import { formatJalaliDate } from "@/utils/date";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TaskCard({ task, onClick, language = 'en' }) {
  const navigate = useNavigate();
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
  const daysUntilDeadline = task.deadline ? differenceInDays(new Date(task.deadline), new Date()) : null;

  const handleClick = () => {
    if (onClick) {
      onClick(task);
    } else {
      navigate(createPageUrl("TaskDetail") + `?id=${task.id}`);
    }
  };

  const completedChecklist = task.checklist?.filter(item => item.done).length || 0;
  const totalChecklist = task.checklist?.length || 0;

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 bg-white"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold text-slate-900 line-clamp-2">
            {task.title}
          </CardTitle>
          <PriorityBadge priority={task.priority} />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={task.status} />
          
          {task.labels && task.labels.length > 0 && (
            <>
              {task.labels.slice(0, 2).map((label, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
              {task.labels.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.labels.length - 2}
                </Badge>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.deadline && (
          <div className={`flex items-center gap-2 text-sm ${
            isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'
          }`}>
            <Calendar className="w-4 h-4" />
            <span>
              {formatJalaliDate(task.deadline, language)}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="mr-auto">
                <AlertTriangle className="w-3 h-3 ml-1" />
                {language === 'fa' ? 'عقب‌افتاده' : 'Overdue'}
              </Badge>
            )}
            {!isOverdue && daysUntilDeadline !== null && daysUntilDeadline <= 3 && daysUntilDeadline >= 0 && (
              <Badge variant="outline" className="mr-auto text-orange-600 border-orange-300">
                {daysUntilDeadline === 0
                  ? (language === 'fa' ? 'امروز' : 'Today')
                  : language === 'fa'
                    ? `${daysUntilDeadline} روز مانده`
                    : `${daysUntilDeadline} days left`}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {totalChecklist > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <CheckSquare className="w-4 h-4" />
                <span className="font-medium">{completedChecklist}/{totalChecklist}</span>
              </div>
            )}
            
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Paperclip className="w-4 h-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {task.logged_hours > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{task.logged_hours}ساعت</span>
              </div>
            )}
          </div>

          {task.assignee_id && (
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                ک
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}