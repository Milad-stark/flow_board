import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, TrendingUp, Clock, Target, Zap } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Leaderboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-total_points'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['allTasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['allAchievements'],
    queryFn: () => base44.entities.Achievement.list('-created_date'),
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_active: true }, '-created_date'),
  });

  const rankColors = {
    bronze: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
    silver: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    gold: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    platinum: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    diamond: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
  };

  const topUsers = users.slice(0, 10);

  const getMedalIcon = (index) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (index === 1) return <Medal className="w-8 h-8 text-gray-400" />;
    if (index === 2) return <Award className="w-8 h-8 text-orange-600" />;
    return null;
  };

  const getCompletionRate = (userId) => {
    const userTasks = tasks.filter(t => t.assignee_id === userId);
    const completed = userTasks.filter(t => t.status === 'done').length;
    return userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            تابلوی افتخار
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">برترین اعضای تیم و مسابقات</p>
        </div>
        {user?.role === 'admin' && (
          <Link to={createPageUrl("ChallengeManagement")}>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Zap className="w-4 h-4 ml-2" />
              مدیریت مسابقات
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 ml-2" />
            رتبه‌بندی
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Zap className="w-4 h-4 ml-2" />
            مسابقات ({challenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Second Place */}
            {topUsers[1] && (
              <div className="flex flex-col items-center pt-12">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-4 ring-gray-300">
                    <AvatarImage src={topUsers[1].avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-2xl">
                      {topUsers[1].full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-3 -right-3">
                    <Medal className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <h3 className="font-bold mt-3 text-center">{topUsers[1].full_name}</h3>
                <Badge className="mt-1 bg-gray-400 text-white">{topUsers[1].total_points || 0} امتیاز</Badge>
                <div className="w-full bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-t-xl mt-4 h-32 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-600 dark:text-gray-300">2</span>
                </div>
              </div>
            )}

            {/* First Place */}
            {topUsers[0] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-yellow-400">
                    <AvatarImage src={topUsers[0].avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-3xl">
                      {topUsers[0].full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-4 -right-4">
                    <Trophy className="w-12 h-12 text-yellow-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="font-bold mt-3 text-center text-lg">{topUsers[0].full_name}</h3>
                <Badge className="mt-1 bg-yellow-500 text-white">{topUsers[0].total_points || 0} امتیاز</Badge>
                <div className="w-full bg-gradient-to-t from-yellow-300 to-yellow-200 dark:from-yellow-700 dark:to-yellow-600 rounded-t-xl mt-4 h-40 flex items-center justify-center shadow-xl">
                  <span className="text-5xl font-bold text-yellow-600 dark:text-yellow-300">1</span>
                </div>
              </div>
            )}

            {/* Third Place */}
            {topUsers[2] && (
              <div className="flex flex-col items-center pt-12">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-4 ring-orange-300">
                    <AvatarImage src={topUsers[2].avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-2xl">
                      {topUsers[2].full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-3 -right-3">
                    <Award className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <h3 className="font-bold mt-3 text-center">{topUsers[2].full_name}</h3>
                <Badge className="mt-1 bg-orange-500 text-white">{topUsers[2].total_points || 0} امتیاز</Badge>
                <div className="w-full bg-gradient-to-t from-orange-300 to-orange-200 dark:from-orange-700 dark:to-orange-600 rounded-t-xl mt-4 h-28 flex items-center justify-center">
                  <span className="text-4xl font-bold text-orange-600 dark:text-orange-300">3</span>
                </div>
              </div>
            )}
          </div>

          {/* Full Rankings */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>رتبه‌بندی کامل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsers.map((singleUser, index) => (
                  <div
                    key={singleUser.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                      index < 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-300 dark:border-yellow-700' 
                        : 'border-gray-200 dark:border-gray-700 dark:bg-slate-700/50'
                    }`}
                  >
                    <div className="w-12 flex items-center justify-center">
                      {getMedalIcon(index) || (
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
                      )}
                    </div>

                    <Avatar className="w-14 h-14">
                      <AvatarImage src={singleUser.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {singleUser.full_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{singleUser.full_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{singleUser.email}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Trophy className="w-4 h-4" />
                          <span className="font-bold text-lg">{singleUser.total_points || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">امتیاز</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Target className="w-4 h-4" />
                          <span className="font-bold text-lg">{getCompletionRate(singleUser.id)}%</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">تکمیل</p>
                      </div>

                      <Badge className={`${rankColors[singleUser.rank || 'bronze']} border`}>
                        {singleUser.rank || 'bronze'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>دستاوردهای اخیر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.slice(0, 6).map((achievement) => {
                  const achievementUser = users.find(u => u.id === achievement.user_id);
                  return (
                    <div
                      key={achievement.id}
                      className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={achievementUser?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                            {achievementUser?.full_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{achievementUser?.full_name}</p>
                          <Badge className="bg-green-500 text-white text-xs">+{achievement.points}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {achievement.description || 'دستاورد جدید'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {challenges.length === 0 ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="py-12 text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  مسابقه‌ای فعال نیست
                </h3>
                <p className="text-gray-500 dark:text-gray-400">به زودی مسابقات جدید اضافه می‌شود</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <Link key={challenge.id} to={createPageUrl("ChallengeDetail") + `?id=${challenge.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{challenge.description}</p>
                        </div>
                        <Badge className="bg-purple-500 text-white">
                          {challenge.points} امتیاز
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`
                            ${challenge.difficulty === 'easy' ? 'border-green-500 text-green-600 dark:text-green-400' : ''}
                            ${challenge.difficulty === 'medium' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : ''}
                            ${challenge.difficulty === 'hard' ? 'border-red-500 text-red-600 dark:text-red-400' : ''}
                          `}>
                            {challenge.difficulty === 'easy' && 'آسان'}
                            {challenge.difficulty === 'medium' && 'متوسط'}
                            {challenge.difficulty === 'hard' && 'سخت'}
                          </Badge>
                          <Badge variant="outline">
                            {challenge.type === 'algorithm' && 'الگوریتم'}
                            {challenge.type === 'task' && 'وظیفه'}
                            {challenge.type === 'quiz' && 'آزمون'}
                          </Badge>
                        </div>
                        {challenge.deadline && (
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatJalaliDate(challenge.deadline, 'en')}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}