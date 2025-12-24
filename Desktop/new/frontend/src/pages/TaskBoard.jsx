import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskCard from "../components/tasks/TaskCard";
import FilterBar from "../components/tasks/FilterBar";
import StatusBadge from "../components/common/StatusBadge";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function TaskBoard() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    project: "all"
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const language = user?.language || 'en';
  const { t } = useTranslation(language);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date'),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const COLUMNS = [
    { id: "todo", title: t('todo'), color: "bg-slate-100" },
    { id: "in_progress", title: t('in_progress'), color: "bg-blue-100" },
    { id: "in_review", title: t('in_review'), color: "bg-purple-100" },
    { id: "done", title: t('done'), color: "bg-green-100" }
  ];

  const filteredTasks = tasks.filter(task => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }
    if (filters.project !== "all" && task.project_id !== filters.project) {
      return false;
    }
    return true;
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTaskMutation.mutate({
        id: taskId,
        data: { status: newStatus }
      });
    }
  };

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  return (
    <div className="p-6 space-y-6 h-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('kanbanBoard')}</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-1">{t('kanbanSubtitle')}</p>
      </div>

      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        projects={projects}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6" style={{ minHeight: 'calc(100vh - 300px)' }}>
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} dark:bg-slate-800 rounded-t-xl p-4 border-b-2 border-slate-200 dark:border-slate-700`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white dark:bg-slate-700">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 bg-slate-50 dark:bg-slate-900 rounded-b-xl p-3 space-y-3 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-slate-800' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging ? 'opacity-50 rotate-2' : ''
                              }`}
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-8 text-slate-400 dark:text-gray-600">
                          <p className="text-sm">{t('noTasksInColumn')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
