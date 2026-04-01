/**
 * StudyForge — storage.js
 * LocalStorage CRUD layer.
 * Only file that accesses localStorage directly.
 */

const KEYS = {
  SUBJECTS: 'sf_subjects',
  TASKS: 'sf_tasks',
  SESSIONS: 'sf_sessions',
  BLOCKS: 'sf_blocks',
  PREFS: 'sf_preferences'
};

const DEFAULT_PREFS = {
  defaultTimerMode: 'study',
  defaultDurationMinutes: 25,
  defaultDurationSeconds: 1500,
  breakEnabled: true,
  breakDurationMinutes: 5,
  breakDurationSeconds: 300,
  soundEnabled: true,
  theme: 'dark',
  sidebarCollapsed: false
};

export const Storage = {
  // --- Private Helpers ---
  _get(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },

  _save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- Subjects ---
  getSubjects() {
    return this._get(KEYS.SUBJECTS);
  },

  saveSubject(subject) {
    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === subject.id);
    if (index > -1) {
      subjects[index] = subject;
    } else {
      subjects.push(subject);
    }
    this._save(KEYS.SUBJECTS, subjects);
  },

  deleteSubject(id) {
    let subjects = this.getSubjects();
    subjects = subjects.filter(s => s.id !== id);
    this._save(KEYS.SUBJECTS, subjects);

    // Cascade delete: Remove all tasks with this subjectId
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.subjectId !== id);
    this._save(KEYS.TASKS, tasks);
  },

  // --- Tasks ---
  getTasks() {
    return this._get(KEYS.TASKS);
  },

  saveTask(task) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    this._save(KEYS.TASKS, tasks);
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this._save(KEYS.TASKS, tasks);
  },

  // --- Sessions ---
  getSessions() {
    const sessions = this._get(KEYS.SESSIONS);
    // Sort reverse chronological
    return sessions.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
  },

  saveSession(session) {
    const sessions = this._get(KEYS.SESSIONS);
    sessions.push(session);
    this._save(KEYS.SESSIONS, sessions);
  },

  deleteSession(id) {
    let sessions = this.getSessions();
    sessions = sessions.filter(s => s.id !== id);
    this._save(KEYS.SESSIONS, sessions);
  },

  clearSessions() {
    this._save(KEYS.SESSIONS, []);
  },

  // --- Blocks ---
  getBlocks() {
    return this._get(KEYS.BLOCKS);
  },

  saveBlock(block) {
    const blocks = this.getBlocks();
    const index = blocks.findIndex(b => b.id === block.id);
    if (index > -1) {
      blocks[index] = block;
    } else {
      blocks.push(block);
    }
    this._save(KEYS.BLOCKS, blocks);
  },

  deleteBlock(id) {
    let blocks = this.getBlocks();
    blocks = blocks.filter(b => b.id !== id);
    this._save(KEYS.BLOCKS, blocks);
  },

  // --- Preferences ---
  getPreferences() {
    const prefs = localStorage.getItem(KEYS.PREFS);
    return prefs ? { ...DEFAULT_PREFS, ...JSON.parse(prefs) } : DEFAULT_PREFS;
  },

  savePreferences(prefs) {
    this._save(KEYS.PREFS, prefs);
  },

  // --- Backup / Restore ---
  exportAll() {
    const data = {
      subjects: this.getSubjects(),
      tasks: this.getTasks(),
      sessions: this.getSessions(),
      blocks: this.getBlocks(),
      preferences: this.getPreferences()
    };
    return JSON.stringify(data, null, 2);
  },

  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.subjects) this._save(KEYS.SUBJECTS, data.subjects);
      if (data.tasks) this._save(KEYS.TASKS, data.tasks);
      if (data.sessions) this._save(KEYS.SESSIONS, data.sessions);
      if (data.blocks) this._save(KEYS.BLOCKS, data.blocks);
      if (data.preferences) this._save(KEYS.PREFS, data.preferences);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  clearAll() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
};
