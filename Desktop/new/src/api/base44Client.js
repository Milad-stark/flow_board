// Local mock implementation to replace the Base44 SDK.
// This lets the app run fully on the client without any external Base44 dependency.

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// In‑memory "database" – lives only while the app is open.
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

const createStore = (collectionKey) => ({
  async list(orderBy) {
    await delay();
    const items = [...db[collectionKey]];
    if (orderBy) items.sort(compareByOrder(orderBy));
    return items;
  },

  async create(data) {
    await delay();
    const item = { id: generateId(), ...data };
    db[collectionKey].unshift(item);
    return item;
  },

  async update(id, data) {
    await delay();
    const items = db[collectionKey];
    const index = items.findIndex((x) => x.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...data };
    items[index] = updated;
    return updated;
  },

  async delete(id) {
    await delay();
    db[collectionKey] = db[collectionKey].filter((x) => x.id !== id);
    return { success: true };
  },

  async filter(where = {}, orderBy, limit) {
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
      await delay();
      return db.users[0] || null;
    },

    async updateMe(data) {
      await delay();
      if (!db.users[0]) return null;
      db.users[0] = { ...db.users[0], ...data };
      db.users = db.users.map((u) => (u.id === db.users[0].id ? db.users[0] : u));
      return db.users[0];
    },

    async logout() {
      await delay(50);
      // No-op in local mode
      return { success: true };
    },

    async list(orderBy) {
      // for pages that call base44.entities.User.list(...)
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
        // Use a temporary object URL so that avatar upload flows still work visually
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
      await delay(150);
      if (!taskId) return { success: false };
      await base44.entities.Task.update(taskId, { status });
      return { success: true };
    },

    async generateReport({ user_id, language }) {
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

