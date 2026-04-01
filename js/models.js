/**
 * StudyForge — models.js
 * JSDoc Typedefs for all entity models.
 * No runtime logic in this file.
 */

/**
 * @typedef {Object} Subject
 * @property {string} id - UUID
 * @property {string} name - Unique subject name
 * @property {string} color - Hex color from preset palette
 * @property {string} createdAt - ISO 8601 string
 */

/**
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} subjectId - Foreign key to Subject.id
 * @property {string} title - Task title (min 2 chars)
 * @property {string} topic - Optional chapter/topic label
 * @property {'low' | 'medium' | 'high'} priority - Default: 'medium'
 * @property {string} dueDate - YYYY-MM-DD or empty string
 * @property {number} estimatedMinutes - 0 = unset
 * @property {'not-started' | 'in-progress' | 'completed'} status - Default: 'not-started'
 * @property {string} notes - Optional task notes
 * @property {string} createdAt - ISO 8601 string
 * @property {string} updatedAt - ISO 8601 string
 */

/**
 * @typedef {Object} StudySession
 * @property {string} id - UUID
 * @property {string | null} taskId - Optional link to Task.id
 * @property {string | null} subjectId - Auto-derived from linked task or set manually
 * @property {'study' | 'questions' | 'writing' | 'revision' | 'mock-test'} mode
 * @property {string} startTime - ISO 8601 (endTime minus duration)
 * @property {string} endTime - ISO 8601 
 * @property {number} durationMinutes - Actual elapsed time
 * @property {string} completionNote - User-entered note
 * @property {number} focusRating - 1-5 rating, default 4
 * @property {boolean} completed - True if timer finished, False if interrupted
 * @property {string} createdAt - ISO 8601 string
 */

/**
 * @typedef {Object} CalendarBlock
 * @property {string} id - UUID
 * @property {string | null} taskId - Optional link to Task.id
 * @property {string | null} subjectId - Auto-set from task
 * @property {string} title - Required title
 * @property {string} date - YYYY-MM-DD
 * @property {string} startTime - HH:MM
 * @property {number} durationMinutes - 15-1440
 * @property {string} createdAt - ISO 8601 string
 */

/**
 * @typedef {Object} Preferences
 * @property {string} defaultTimerMode - Default: 'study'
 * @property {number} defaultDurationMinutes - Default: 25
 * @property {number} defaultDurationSeconds - Default: 1500
 * @property {boolean} breakEnabled - Default: true
 * @property {number} breakDurationMinutes - Default: 5
 * @property {number} breakDurationSeconds - Default: 300
 * @property {boolean} soundEnabled - Default: true
 * @property {string} theme - Default: 'dark'
 */

export {};
