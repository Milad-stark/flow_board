import React from "react";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import { useTranslation } from "./TranslationProvider";

const priorityColors = {
  low: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900 dark:text-red-300"
};

export default function PriorityBadge({ priority, language = 'en' }) {
  const { t } = useTranslation(language);
  const color = priorityColors[priority] || priorityColors.medium;
  const label = t(priority);

  return (
    <Badge className={`${color} border font-medium`}>
      <Flag className={`w-3 h-3 ${language === 'fa' ? 'ml-1' : 'mr-1'}`} />
      {label}
    </Badge>
  );
}
