import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function FilterBar({ filters, setFilters, projects = [] }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const language = user?.language || 'en';
  const { t } = useTranslation(language);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      project: "all"
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status !== "all" || 
    filters.priority !== "all" ||
    filters.project !== "all";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className={`absolute ${language === 'fa' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400`} />
          <Input
            placeholder={t('searchTasks')}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={language === 'fa' ? 'pr-10' : 'pl-10'}
          />
        </div>

        <div className="flex gap-3 flex-wrap md:flex-nowrap">
          <Select
            value={filters.project}
            onValueChange={(value) => setFilters({ ...filters, project: value })}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t('project')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allProjects')}</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="todo">{t('todo')}</SelectItem>
              <SelectItem value="in_progress">{t('in_progress')}</SelectItem>
              <SelectItem value="in_review">{t('in_review')}</SelectItem>
              <SelectItem value="blocked">{t('blockedStatus')}</SelectItem>
              <SelectItem value="done">{t('done')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters({ ...filters, priority: value })}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t('priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPriorities')}</SelectItem>
              <SelectItem value="low">{t('low')}</SelectItem>
              <SelectItem value="medium">{t('medium')}</SelectItem>
              <SelectItem value="high">{t('high')}</SelectItem>
              <SelectItem value="critical">{t('critical')}</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
