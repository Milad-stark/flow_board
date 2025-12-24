import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, StopCircle, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function TaskTimer({ taskId, userId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const queryClient = useQueryClient();

  const startTimerMutation = useMutation({
    mutationFn: async () => {
      const entry = await base44.entities.TimeEntry.create({
        task_id: taskId,
        user_id: userId,
        start_time: new Date().toISOString(),
        is_active: true,
        duration_minutes: 0
      });
      return entry;
    },
    onSuccess: (data) => {
      setActiveEntryId(data.id);
      setIsRunning(true);
      setElapsedSeconds(0);
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: async () => {
      const endTime = new Date().toISOString();
      const durationMinutes = Math.round(elapsedSeconds / 60);
      
      await base44.entities.TimeEntry.update(activeEntryId, {
        end_time: endTime,
        duration_minutes: durationMinutes,
        is_active: false
      });
    },
    onSuccess: () => {
      setIsRunning(false);
      setElapsedSeconds(0);
      setActiveEntryId(null);
      queryClient.invalidateQueries({ queryKey: ['timeEntries', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">زمان فعالیت</p>
              <p className="text-2xl font-bold font-mono">{formatTime(elapsedSeconds)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={() => startTimerMutation.mutate()}
                disabled={startTimerMutation.isPending}
                className="bg-green-500 hover:bg-green-600"
              >
                <Play className="w-4 h-4 ml-2" />
                شروع
              </Button>
            ) : (
              <Button
                onClick={() => stopTimerMutation.mutate()}
                disabled={stopTimerMutation.isPending}
                variant="destructive"
              >
                <StopCircle className="w-4 h-4 ml-2" />
                پایان
              </Button>
            )}
          </div>
        </div>

        {isRunning && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⏱️ تایمر در حال اجرا است. لطفاً پس از اتمام کار، دکمه پایان را بزنید.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}