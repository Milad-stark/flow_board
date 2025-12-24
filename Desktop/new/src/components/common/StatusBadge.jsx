import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Circle, 
  Clock, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { useTranslation } from "./TranslationProvider";

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  in_review: Eye,
  blocked: AlertCircle,
  done: CheckCircle2,
  cancelled: XCircle
};

const statusColors = {
  todo: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300",
  in_review: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300",
  blocked: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300",
  done: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300"
};

export default function StatusBadge({ status, showIcon = true, language = 'en' }) {
  const { t } = useTranslation(language);
  const Icon = statusIcons[status] || statusIcons.todo;
  const color = statusColors[status] || statusColors.todo;
  const label = t(status);

  return (
    <Badge className={`${color} border font-medium`}>
      {showIcon && <Icon className={`w-3 h-3 ${language === 'fa' ? 'ml-1' : 'mr-1'}`} />}
      {label}
    </Badge>
  );
}
