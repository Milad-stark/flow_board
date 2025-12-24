import React, { createContext, useContext } from 'react';

export const translations = {
  fa: {
    // Navigation
    dashboard: "داشبورد",
    myTasks: "وظایف من",
    kanban: "بورد کانبان",
    projects: "پروژه‌ها",
    reports: "گزارش‌ها",
    leaderboard: "تابلوی افتخار",
    profile: "پروفایل",
    settings: "تنظیمات",
    notifications: "اعلان‌ها",
    
    // Common
    search: "جستجوی سریع...",
    save: "ذخیره",
    cancel: "انصراف",
    delete: "حذف",
    edit: "ویرایش",
    create: "ایجاد",
    update: "بروزرسانی",
    submit: "ارسال",
    close: "بستن",
    loading: "در حال بارگذاری...",
    noData: "داده‌ای وجود ندارد",
    
    // Task statuses
    todo: "انجام نشده",
    in_progress: "در حال انجام",
    in_review: "در حال بررسی",
    blocked: "مسدود",
    done: "انجام شده",
    cancelled: "لغو شده",
    
    // Priorities
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
    critical: "بحرانی",
    
    // Dashboard
    totalTasks: "کل وظایف",
    completedTasks: "انجام شده",
    inProgressTasks: "در حال انجام",
    overdueTasks: "عقب‌افتاده",
    myTasksTitle: "وظایف من",
    overdueTitle: "عقب‌افتاده",
    todayTitle: "امروز",
    upcomingTitle: "هفته آینده",
    activeProjects: "پروژه‌های فعال",
    recentActivity: "فعالیت اخیر",
    
    // Projects
    projectsTitle: "پروژه‌ها",
    activeProjectsCount: "پروژه فعال",
    newProject: "پروژه جدید",
    projectName: "نام پروژه",
    projectDescription: "توضیحات پروژه",
    projectColor: "رنگ پروژه",
    projectStatus: "وضعیت پروژه",
    active: "فعال",
    archived: "آرشیو شده",
    onHold: "معلق",
    editProject: "ویرایش پروژه",
    deleteProject: "حذف پروژه",
    
    // Tasks
    taskTitle: "عنوان وظیفه",
    taskDescription: "توضیحات",
    assignee: "مسئول",
    deadline: "مهلت",
    priority: "اولویت",
    labels: "برچسب‌ها",
    attachments: "پیوست‌ها",
    comments: "نظرات",
    timeLog: "ثبت زمان",
    checklist: "چک‌لیست",
    newTask: "وظیفه جدید",
    
    // Profile
    personalInfo: "اطلاعات شخصی",
    fullName: "نام کامل",
    email: "ایمیل",
    age: "سن",
    phone: "شماره تماس",
    address: "آدرس",
    fieldOfWork: "حوزه فعالیت",
    bio: "درباره من",
    monthlyPerformance: "نمودار عملکرد ماهانه",
    recentAchievements: "دستاوردهای اخیر",
    totalPoints: "امتیاز کل",
    rank: "رتبه",
    editProfile: "ویرایش پروفایل",
    
    // Ranks
    bronze: "برنزی",
    silver: "نقره‌ای",
    gold: "طلایی",
    platinum: "پلاتینیوم",
    diamond: "الماس",
    
    // Leaderboard
    leaderboardTitle: "تابلوی افتخار",
    topMembers: "اعضای برتر",
    ranking: "رتبه‌بندی",
    challenges: "مسابقات",
    points: "امتیاز",
    completionRate: "نرخ تکمیل",
    createChallenge: "ایجاد مسابقه",
    activeChallenge: "مسابقه فعال",
    
    // Challenges
    challengeTitle: "عنوان چالش",
    challengeDescription: "توضیحات چالش",
    challengeType: "نوع چالش",
    difficulty: "سطح دشواری",
    easy: "آسان",
    hard: "سخت",
    algorithm: "الگوریتم",
    task: "وظیفه",
    quiz: "آزمون",
    submitAnswer: "ارسال پاسخ",
    yourAnswer: "پاسخ شما",
    correctAnswer: "پاسخ صحیح",
    pending: "در انتظار بررسی",
    approved: "تأیید شده",
    rejected: "رد شده",
    submissions: "پاسخ‌ها",
    review: "بررسی",
    
    // Settings
    settingsTitle: "تنظیمات",
    language: "زبان",
    theme: "تم",
    lightMode: "روشن",
    darkMode: "تاریک",
    appearance: "ظاهر",
    notificationsEnabled: "فعال بودن اعلان‌ها",
    soundEnabled: "صدای اعلان‌ها",
    dangerZone: "منطقه خطر",
    logout: "خروج از حساب کاربری",
    saveChanges: "ذخیره تغییرات",
    interfaceLanguage: "زبان رابط کاربری",
    selectLanguage: "انتخاب زبان نمایش",
    selectTheme: "انتخاب تم روشن یا تاریک",
    receiveNotifications: "دریافت اعلان برای رویدادهای مهم",
    playSounds: "پخش صدا هنگام دریافت اعلان",
    signOut: "خروج از سیستم",
    
    // Reports
    reportsTitle: "گزارش‌ها و آمار",
    performanceAnalysis: "تحلیل عملکرد پروژه‌ها",
    completionRateTitle: "نرخ تکمیل",
    loggedTime: "زمان ثبت شده",
    estimatedTime: "زمان تخمینی",
    taskDistribution: "توزیع وضعیت وظایف",
    priorityDistribution: "توزیع اولویت",
    projectStats: "آمار پروژه‌ها",
    
    // Time
    hours: "ساعت",
    minutes: "دقیقه",
    days: "روز",
    weeks: "هفته",
    months: "ماه",
    
    // Messages
    noTasksFound: "وظیفه‌ای یافت نشد",
    noProjectsFound: "پروژه‌ای یافت نشد",
    noChallengesFound: "مسابقه‌ای یافت نشد",
    confirmDelete: "آیا مطمئن هستید؟",
    deleteSuccess: "با موفقیت حذف شد",
    updateSuccess: "با موفقیت بروزرسانی شد",
    createSuccess: "با موفقیت ایجاد شد",
  },
  
  en: {
    // Navigation
    dashboard: "Dashboard",
    myTasks: "My Tasks",
    kanban: "Kanban Board",
    projects: "Projects",
    reports: "Reports",
    leaderboard: "Leaderboard",
    profile: "Profile",
    settings: "Settings",
    notifications: "Notifications",
    
    // Common
    search: "Quick search...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    submit: "Submit",
    close: "Close",
    loading: "Loading...",
    noData: "No data available",
    
    // Task statuses
    todo: "To Do",
    in_progress: "In Progress",
    in_review: "In Review",
    blocked: "Blocked",
    done: "Done",
    cancelled: "Cancelled",
    
    // Priorities
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Dashboard
    totalTasks: "Total Tasks",
    completedTasks: "Completed",
    inProgressTasks: "In Progress",
    overdueTasks: "Overdue",
    myTasksTitle: "My Tasks",
    overdueTitle: "Overdue",
    todayTitle: "Today",
    upcomingTitle: "Next Week",
    activeProjects: "Active Projects",
    recentActivity: "Recent Activity",
    
    // Projects
    projectsTitle: "Projects",
    activeProjectsCount: "active projects",
    newProject: "New Project",
    projectName: "Project Name",
    projectDescription: "Project Description",
    projectColor: "Project Color",
    projectStatus: "Project Status",
    active: "Active",
    archived: "Archived",
    onHold: "On Hold",
    editProject: "Edit Project",
    deleteProject: "Delete Project",
    
    // Tasks
    taskTitle: "Task Title",
    taskDescription: "Description",
    assignee: "Assignee",
    deadline: "Deadline",
    priority: "Priority",
    labels: "Labels",
    attachments: "Attachments",
    comments: "Comments",
    timeLog: "Time Log",
    checklist: "Checklist",
    newTask: "New Task",
    
    // Profile
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email",
    age: "Age",
    phone: "Phone",
    address: "Address",
    fieldOfWork: "Field of Work",
    bio: "About Me",
    monthlyPerformance: "Monthly Performance Chart",
    recentAchievements: "Recent Achievements",
    totalPoints: "Total Points",
    rank: "Rank",
    editProfile: "Edit Profile",
    
    // Ranks
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
    diamond: "Diamond",
    
    // Leaderboard
    leaderboardTitle: "Leaderboard",
    topMembers: "Top Members",
    ranking: "Ranking",
    challenges: "Challenges",
    points: "Points",
    completionRate: "Completion Rate",
    createChallenge: "Create Challenge",
    activeChallenge: "Active Challenge",
    
    // Challenges
    challengeTitle: "Challenge Title",
    challengeDescription: "Challenge Description",
    challengeType: "Challenge Type",
    difficulty: "Difficulty",
    easy: "Easy",
    hard: "Hard",
    algorithm: "Algorithm",
    task: "Task",
    quiz: "Quiz",
    submitAnswer: "Submit Answer",
    yourAnswer: "Your Answer",
    correctAnswer: "Correct Answer",
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    submissions: "Submissions",
    review: "Review",
    
    // Settings
    settingsTitle: "Settings",
    language: "Language",
    theme: "Theme",
    lightMode: "Light",
    darkMode: "Dark",
    appearance: "Appearance",
    notificationsEnabled: "Enable Notifications",
    soundEnabled: "Notification Sounds",
    dangerZone: "Danger Zone",
    logout: "Logout",
    saveChanges: "Save Changes",
    interfaceLanguage: "Interface Language",
    selectLanguage: "Select display language",
    selectTheme: "Select light or dark theme",
    receiveNotifications: "Receive notifications for important events",
    playSounds: "Play sound when receiving notifications",
    signOut: "Sign out of your account",
    
    // Reports
    reportsTitle: "Reports & Analytics",
    performanceAnalysis: "Project Performance Analysis",
    completionRateTitle: "Completion Rate",
    loggedTime: "Logged Time",
    estimatedTime: "Estimated Time",
    taskDistribution: "Task Status Distribution",
    priorityDistribution: "Priority Distribution",
    projectStats: "Project Statistics",
    
    // Time
    hours: "hours",
    minutes: "minutes",
    days: "days",
    weeks: "weeks",
    months: "months",
    
    // Messages
    noTasksFound: "No tasks found",
    noProjectsFound: "No projects found",
    noChallengesFound: "No challenges found",
    confirmDelete: "Are you sure?",
    deleteSuccess: "Successfully deleted",
    updateSuccess: "Successfully updated",
    createSuccess: "Successfully created",
  }
};

const TranslationContext = createContext();

export const useTranslation = (language = 'en') => {
  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };
  
  return { t };
};

export default function TranslationProvider({ children, language = 'en' }) {
  return (
    <TranslationContext.Provider value={{ language }}>
      {children}
    </TranslationContext.Provider>
  );
}