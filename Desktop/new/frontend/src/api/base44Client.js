// API Client - Uses real API service when available, falls back to mock in development
import apiService from './apiService';

// Check if we should use mock (development mode without backend)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL;

// Local mock implementation for development
const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const db = {
  users: [
    {
      id: "u_demo",
      full_name: "Demo User",
      email: "demo@example.com",
      language: "fa",
      theme: "light",
      role: "admin",
      total_points: 120,
      rank: "gold",
      job_role: "Product Manager",
      avatar_url: "",
      notifications_enabled: true,
      sound_enabled: true,
    },
  ],
  projects: [
    {
      id: "p_demo_1",
      name: "پروژه نمونه",
      description: "این یک پروژه نمونه برای اجرای لوکال است.",
      color: "#3B82F6",
      status: "active",
    },
  ],
  tasks: [
    {
      id: "t_demo_1",
      title: "اولین تسک نمونه",
      description: "این تسک برای تست محیط لوکال است.",
      status: "todo",
      priority: "medium",
      project_id: "p_demo_1",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimate_hours: 4,
      labels: ["نمونه"],
      checklist: [],
      assignee_id: "u_demo",
      updated_date: new Date().toISOString(),
    },
  ],
  comments: [],
  timeLogs: [],
  timeEntries: [],
  notifications: [],
  achievements: [],
  challenges: [],
  challengeSubmissions: [],
};

const compareByOrder = (fieldWithDirection) => (a, b) => {
  if (!fieldWithDirection) return 0;
  const desc = fieldWithDirection.startsWith("-");
  const field = desc ? fieldWithDirection.slice(1) : fieldWithDirection;
  const av = a[field];
  const bv = b[field];
  if (av === bv) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (av > bv) return desc ? -1 : 1;
  return desc ? 1 : -1;
};

const entityMap = {
  users: 'User',
  projects: 'Project',
  tasks: 'Task',
  comments: 'Comment',
  timeLogs: 'TimeEntry',
  timeEntries: 'TimeEntry',
  notifications: 'Notification',
  achievements: 'Achievement',
  challenges: 'Challenge',
  challengeSubmissions: 'ChallengeSubmission',
};

const createStore = (collectionKey) => ({
  async list(orderBy) {
    if (!USE_MOCK) {
      try {
        const entityName = entityMap[collectionKey] || collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1);
        return await apiService.entities[entityName].list(orderBy);
      } catch (e) {
        console.warn('API call failed, using mock:', e);
      }
    }
    await delay();
    const items = [...db[collectionKey]];
    if (orderBy) items.sort(compareByOrder(orderBy));
    return items;
  },

  async create(data) {
    if (!USE_MOCK) {
      try {
        const entityName = entityMap[collectionKey] || collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1);
        return await apiService.entities[entityName].create(data);
      } catch (e) {
        console.warn('API call failed, using mock:', e);
      }
    }
    await delay();
    const item = { id: generateId(), ...data };
    db[collectionKey].unshift(item);
    return item;
  },

  async update(id, data) {
    if (!USE_MOCK) {
      try {
        const entityName = entityMap[collectionKey] || collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1);
        return await apiService.entities[entityName].update(id, data);
      } catch (e) {
        console.warn('API call failed, using mock:', e);
      }
    }
    await delay();
    const items = db[collectionKey];
    const index = items.findIndex((x) => x.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...data };
    items[index] = updated;
    return updated;
  },

  async delete(id) {
    if (!USE_MOCK) {
      try {
        const entityName = entityMap[collectionKey] || collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1);
        return await apiService.entities[entityName].delete(id);
      } catch (e) {
        console.warn('API call failed, using mock:', e);
      }
    }
    await delay();
    db[collectionKey] = db[collectionKey].filter((x) => x.id !== id);
    return { success: true };
  },

  async filter(where = {}, orderBy, limit) {
    if (!USE_MOCK) {
      try {
        const entityName = entityMap[collectionKey] || collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1);
        return await apiService.entities[entityName].filter(where, orderBy, limit);
      } catch (e) {
        console.warn('API call failed, using mock:', e);
      }
    }
    await delay();
    let items = db[collectionKey].filter((item) => {
      return Object.entries(where).every(([key, value]) => item[key] === value);
    });
    if (orderBy) items.sort(compareByOrder(orderBy));
    if (typeof limit === "number") items = items.slice(0, limit);
    return items;
  },
});

export const base44 = {
  auth: {
    async me() {
      if (!USE_MOCK) {
        try {
          const response = await apiService.auth.me();
          return response.data || response;
        } catch (e) {
          console.warn('API call failed, using mock:', e);
        }
      }
      await delay();
      return db.users[0] || null;
    },

    async updateMe(data) {
      if (!USE_MOCK) {
        try {
          const response = await apiService.auth.updateMe(data);
          return response.data || response;
        } catch (e) {
          console.warn('API call failed, using mock:', e);
        }
      }
      await delay();
      if (!db.users[0]) return null;
      db.users[0] = { ...db.users[0], ...data };
      db.users = db.users.map((u) => (u.id === db.users[0].id ? db.users[0] : u));
      return db.users[0];
    },

    async logout() {
      if (!USE_MOCK) {
        try {
          return await apiService.auth.logout();
        } catch (e) {
          console.warn('API call failed, using mock:', e);
        }
      }
      await delay(50);
      return { success: true };
    },

    async list(orderBy) {
      const store = createStore("users");
      return store.list(orderBy);
    },
  },

  entities: {
    User: createStore("users"),
    Project: createStore("projects"),
    Task: createStore("tasks"),
    Comment: createStore("comments"),
    TimeLog: createStore("timeLogs"),
    TimeEntry: createStore("timeEntries"),
    Notification: createStore("notifications"),
    Achievement: createStore("achievements"),
    Challenge: createStore("challenges"),
    ChallengeSubmission: createStore("challengeSubmissions"),
  },

  integrations: {
    Core: {
      async InvokeLLM({ prompt }) {
        await delay(400);
        return (
          "این یک پاسخ نمایشی (mock) است تا برنامه بدون اتصال به Base44 کار کند.\n\n" +
          "خلاصه‌ای از پیام شما:\n" +
          (prompt || "").slice(0, 300)
        );
      },

      async UploadFile({ file }) {
        await delay(200);
        const file_url = file ? URL.createObjectURL(file) : "";
        return { file_url };
      },

      async SendEmail() {
        await delay(200);
        return { success: true };
      },

      async GenerateImage() {
        await delay(300);
        return { url: "https://via.placeholder.com/512x512.png?text=Mock+Image" };
      },

      async ExtractDataFromUploadedFile() {
        await delay(300);
        return { data: {}, success: true };
      },

      async CreateFileSignedUrl() {
        await delay(100);
        return { url: "https://example.com/mock-signed-url" };
      },

      async UploadPrivateFile({ file }) {
        await delay(200);
        const file_url = file ? URL.createObjectURL(file) : "";
        return { file_url };
      },
    },
  },

  functions: {
    async transitionTaskStatus({ taskId, status }) {
      if (!USE_MOCK) {
        try {
          return await apiService.functions.transitionTaskStatus({ taskId, status });
        } catch (e) {
          console.warn('API call failed, using mock:', e);
        }
      }
      await delay(150);
      if (!taskId) return { success: false };
      await base44.entities.Task.update(taskId, { status });
      return { success: true };
    },

    async generateReport({ user_id, language }) {
      if (!USE_MOCK) {
        try {
          return await apiService.functions.generateReport({ user_id, language });
        } catch (e) {
          console.warn('API call failed, using mock:', e);
        }
      }
      await delay(300);
      const text = `Mock report for user: ${user_id || "local-user"} (${language || "fa"})`;
      return { data: text };
    },

    async invoke(name, payload) {
      if (name === "generateReport") {
        return this.generateReport(payload || {});
      }
      await delay(200);
      return { data: `Mock function '${name}' executed locally.` };
    },
  },
};
