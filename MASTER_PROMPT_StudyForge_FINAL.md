# StudyForge — Final Master Prompt (Laptop / PC)

> **Purpose:** Paste this entire file into any IDE AI agent (Cursor, Windsurf, Copilot Workspace, etc.) to produce a pixel-perfect, fully functional StudyForge study planner application. Designed **exclusively for laptop and desktop screens (≥ 1024 px)**. No mobile layout, no bottom navigation — uses a **fixed left sidebar** for navigation.

---

## 1. Role and Goal

You are a senior frontend engineer building a complete, offline-first desktop study app called **StudyForge**. You write clean, modular, beginner-readable vanilla JavaScript. You never use React, Vue, TypeScript, Tailwind, or any JS framework. You never use a backend, cloud API, or authentication service. Every feature you build must work fully offline — just open `index.html` in a browser.

Your job is to scaffold this project from zero and produce **every file listed in the File Manifest**, in the exact order listed in the Generation Instructions. Do not skip files. Do not merge files that are listed separately. Do not hallucinate library APIs. Implement everything fully — do not leave `// TODO` placeholders.

---

## 2. Project Identity

| Key | Value |
|---|---|
| **App Name** | StudyForge |
| **Tagline** | Offline Focus Command Center |
| **Version** | 1.0.0 |
| **Concept** | A local-first desktop study planner. No accounts, no cloud, no internet required. All data lives in `localStorage`. |
| **Core question it answers** | *"What should I study right now, for how long, and what is due next?"* |

---

## 2. Tech Stack & Constraints

| Layer | Technology |
|---|---|
| **Markup** | Semantic HTML5 |
| **Styling** | Vanilla CSS (4 separate files), CSS custom properties for theming |
| **Logic** | Vanilla JavaScript ES2020, native ES modules (`type="module"`) |
| **Icons** | Inline SVG strings exported from `assets/icons.js` — zero icon libraries |
| **Routing** | Hash-based SPA (`window.location.hash`), `hashchange` event listener |
| **Storage** | `localStorage` only — JSON serialized, accessed only through `storage.js` |
| **IDs** | `crypto.randomUUID()` for all entity IDs |
| **Bundler** | **None.** Files served directly. No build step required at runtime. |
| **Audio** | `AudioContext` + `OscillatorNode` for timer-end beep (sine 440 Hz, 0.5 s) |
| **Date / Time** | Native `Date`, `toISOString()`, string comparisons for date logic |

> **Do NOT use:** React, Vue, Angular, Svelte, Tailwind, Bootstrap, jQuery, any CSS framework, any bundler, any package manager dependencies at runtime. The app must run by simply opening `index.html` in a browser.

---

## 3. Color Scheme (Dark Theme — Single Theme)

All colors are defined as CSS custom properties on `:root`. The default and only theme is dark.

```css
:root {
  color-scheme: dark;

  /* Core Palette */
  --color-deep-blue:    #0A1128;   /* Sidebar background, darkest surface */
  --color-navy-surface: #121E36;   /* Toast background, secondary surfaces */
  --color-amber:        #F59E0B;   /* Primary accent — buttons, active states, highlights */
  --color-amber-hover:  #FBBF24;   /* Amber on hover */
  --color-bg-warm:      #070B19;   /* Body / page background — near black with blue undertone */
  --color-bg-card:      #111A30;   /* Card backgrounds, inputs, modals, header */
  --color-text-light:   #F9FAFB;   /* Brightest text */
  --color-text-dark:    #F3F4F6;   /* Standard body text */
  --color-text-muted:   #9CA3AF;   /* Secondary / meta text */
  --color-border:       #4B5563;   /* Borders, dividers, progress track backgrounds */
  --color-success:      #10B981;   /* Completed states, success toasts */
  --color-danger:       #EF4444;   /* Delete buttons, overdue indicators, error toasts */
  --color-warning:      #F59E0B;   /* Same as amber — warning badges */
}
```

### Accent Color Usage Rules
- **Primary buttons:** `background: var(--color-amber)`, `color: var(--color-deep-blue)` (dark text on amber).
- **Active nav links:** `color: var(--color-amber)`.
- **Focus rings on inputs:** `border-color: var(--color-amber)`, `box-shadow: 0 0 0 2px rgba(242, 181, 68, 0.2)`.
- **Card highlight variant:** `border-left: 4px solid var(--color-amber)`.
- **Progress bars / timer ring:** `stroke` or `background` uses `var(--color-amber)`.
- **Break phase timer ring:** Uses `#10B981` (success green) instead of amber.

### Subject Color Palette
When users create subjects, they pick from this preset palette (8 swatches):
```
#F2B544  #EF4444  #10B981  #3B82F6  #8B5CF6  #EC4899  #06B6D4  #F97316
```

---

## 4. Typography & Spacing

### Typography
```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

body  { font-size: 14px; font-weight: 400; line-height: 1.5; }
h1    { font-size: 24px; font-weight: 500; line-height: 1.2; }
h2    { font-size: 18px; font-weight: 500; line-height: 1.2; }
h3    { font-size: 16px; font-weight: 500; line-height: 1.2; }
label { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
```

### Spacing Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 40px;
```

### Global Resets
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; }
ul, ol { list-style: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }
input, textarea, select { font-family: inherit; font-size: 14px; color: inherit; }
```

---

## 5. Project File Structure

```
StudyForge/
├── index.html              # Entry point — shell with sidebar + main content area
├── css/
│   ├── base.css            # CSS variables, resets, typography
│   ├── layout.css          # Sidebar, main content, grid, popup mode
│   ├── components.css      # Cards, buttons, inputs, badges, modals, toasts, empty states
│   └── themes.css          # Reserved scaffold for future light theme — commented out
├── js/
│   ├── app.js              # Entry JS — imports State, renderSidebar, hash routing, lazy page imports
│   ├── state.js            # Pub/Sub event bus — State.on/off/emit, currentPage, activeTimerTaskId
│   ├── models.js           # JSDoc typedefs only — no runtime logic
│   ├── storage.js          # localStorage CRUD wrapper — all access goes through here
│   ├── ui.js               # showModal, hideModal, showToast, showConfirm, renderEmptyState, renderSidebar
│   ├── dashboard.js        # Page: Dashboard
│   ├── tasks.js            # Page: Tasks list + CRUD modal
│   ├── subjects.js         # Page: Subjects list + CRUD modal
│   ├── timer.js            # Page: Focus Timer (setup → active → completion modal)
│   ├── sessions.js         # Page: Session History list
│   ├── calendar.js         # Page: Weekly Calendar Planner
│   ├── stats.js            # Page: Statistics
│   └── settings.js         # Page: Settings (preferences, export, reset)
└── assets/
    └── icons.js            # Exports `Icons` object — inline SVG strings keyed by name
```

---

## 6. Layout Architecture (Desktop — Fixed Left Sidebar)

### HTML Shell (`index.html`)
```html
<body>
  <div id="app-container" class="app-container">
    <aside id="sidebar" class="sidebar">
      <!-- Rendered by ui.js renderSidebar() -->
    </aside>
    <main id="main-content" class="main-content">
      <header class="main-header">
        <!-- Fire SVG icon + "STUDYFORGE" gradient text -->
      </header>
      <div id="page-container" class="page-container">
        <!-- Dynamically rendered page content -->
      </div>
    </main>
  </div>
  <div id="toast-container" class="toast-container"></div>
  <script type="module" src="js/app.js"></script>
</body>
```

### Layout CSS (Desktop-Only)
```css
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: var(--color-deep-blue);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  padding: 24px 16px;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: var(--color-bg-warm);
}

.main-header {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-card);
}

.page-container {
  padding: var(--space-lg);
  flex: 1;
}
```

### Sidebar Navigation Structure
The sidebar contains **all 8 navigation links** in a vertical list — no hamburger, no drawer.

**Primary (top section):**
1. **Home** → `#dashboard` — Dashboard icon
2. **Tasks** → `#tasks` — List icon
3. **Timer** → `#timer` — Clock icon
4. **Calendar** → `#calendar` — Calendar icon

**Secondary (below a subtle "MORE" label divider):**
5. **Subjects** → `#subjects` — Copy icon
6. **History** → `#sessions` — History/refresh icon
7. **Stats** → `#stats` — Bar chart icon
8. **Settings** → `#settings` — Gear icon

### Sidebar Nav Link Style
```css
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
}
.sidebar-link:hover {
  background-color: rgba(242, 181, 68, 0.08);
  color: var(--color-text-light);
}
.sidebar-link.active {
  background-color: rgba(242, 181, 68, 0.12);
  color: var(--color-amber);
}
.sidebar-icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
  flex-shrink: 0;
}
```

### Logo in Header
The header shows a fire SVG icon + "STUDYFORGE" text:
- `font-weight: 800; font-size: 18px; letter-spacing: 1px`
- `background: linear-gradient(135deg, #fff, var(--color-amber)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`

### Popup Mode (Distraction-Free Timer)
```css
body.popup-mode .sidebar { display: none !important; }
body.popup-mode .main-content {
  margin: 0; padding: 0;
  display: flex; align-items: center; justify-content: center;
  height: 100vh;
}
body.popup-mode .page-container { max-width: 500px; width: 100%; }
```

---

## 7. UI Components (CSS Spec)

### Cards
```css
.card            { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.card--highlight { border-left: 4px solid var(--color-amber); }
.card--danger    { border-left: 4px solid var(--color-danger); }
```

### Buttons
| Variant | Background | Text Color | Hover |
|---|---|---|---|
| `.btn--primary` | `var(--color-amber)` | `var(--color-deep-blue)` | `var(--color-amber-hover)` |
| `.btn--secondary` | `var(--color-bg-card)` | `var(--color-text-light)` | `var(--color-navy-surface)` |
| `.btn--danger` | `var(--color-danger)` | `var(--color-text-light)` | `#DC2828` |
| `.btn--icon` | transparent | `var(--color-text-muted)` | `var(--color-border)` bg |

All buttons: `border-radius: 8px; font-weight: 500; font-size: 14px; padding: 8px 16px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px;`

### Inputs
- `border: 1px solid var(--color-border); border-radius: 8px; padding: 8px 12px; background: var(--color-bg-card); color: var(--color-text-dark);`
- Focus: `border-color: var(--color-amber); box-shadow: 0 0 0 2px rgba(242, 181, 68, 0.2); outline: none;`
- Number input spinners: `filter: sepia(100%) hue-rotate(330deg) saturate(150%) opacity(0.8);`
- Select dropdowns and their options use card background + dark text.

### Badges
- `.badge--high`: amber background 20%, text `#B45309`
- `.badge--medium`: gray background 10%, text muted
- `.badge--low`, `.badge--success`: green background 10%, text `#047857`
- `.badge--info`: same as high
- All: `padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;`

### Subject Color Dot
`width: 12px; height: 12px; border-radius: 50%; display: inline-block;`

### Modals
- Overlay: `position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; opacity: 0 → 1 (transition 0.2s)`
- Box: `background: var(--color-bg-card); border-radius: 12px; max-width: 480px; padding: 24px; transform: translateY(20px) → translateY(0); max-height: 90vh; overflow-y: auto;`
- Footer: `display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;`
- Clicking the overlay does NOT dismiss the modal — only the action buttons close it.

### Toasts
- Container: `position: fixed; bottom: 24px; right: 24px; z-index: 100; display: flex; flex-direction: column; gap: 8px;`
- Toast: `padding: 12px 16px; border-radius: 8px; background: var(--color-navy-surface); transform: translateX(120%) → translateX(0); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);`
- Types: `toast--success` (green left border), `toast--error` (red left border), `toast--info` (amber left border)
- Auto-dismiss after 3 seconds.

### Empty States
All empty states must be implemented — never render a blank div.
```html
<div class="empty-state">
  <!-- 48×48 SVG icon at 50% opacity -->
  <h3 class="empty-state__heading">Descriptive heading</h3>
  <p class="empty-state__body">Short, encouraging explanation. max-width: 300px</p>
  <!-- Optional: primary CTA button -->
</div>
```

Required empty states:
- **Dashboard:** No tasks today, no upcoming deadlines, no subjects yet.
- **Tasks:** Each filter view with no results.
- **Subjects:** No subjects created yet.
- **Calendar:** No blocks this week.
- **Sessions:** No sessions recorded.
- **Stats:** "Complete your first study session to see stats here."

---

## 8. Data Models

Define these in `models.js` as JSDoc typedefs. No runtime logic in this file.

### `sf_subjects` — Subject[]
| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `name` | string | Min 2 chars, unique (case-insensitive) |
| `color` | string | Hex from preset palette |
| `createdAt` | string | ISO 8601 |

### `sf_tasks` — Task[]
| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID |
| `subjectId` | string | FK to Subject |
| `title` | string | Min 2 chars |
| `topic` | string | Optional chapter/topic label |
| `priority` | `'low' \| 'medium' \| 'high'` | Default: `'medium'` |
| `dueDate` | string | `YYYY-MM-DD` or empty string |
| `estimatedMinutes` | number | 0 = unset |
| `status` | `'not-started' \| 'in-progress' \| 'completed'` | Default: `'not-started'` |
| `notes` | string | Optional |
| `createdAt` | string | ISO 8601 |
| `updatedAt` | string | ISO 8601 |

### `sf_sessions` — StudySession[]
| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID |
| `taskId` | string \| null | Optional link to task |
| `subjectId` | string \| null | Auto-derived from linked task |
| `mode` | `'study' \| 'questions' \| 'writing' \| 'revision' \| 'mock-test'` | |
| `startTime` | string | ISO 8601 (calculated retroactively: endTime minus elapsed seconds) |
| `endTime` | string | ISO 8601 |
| `durationMinutes` | number | Rounded from actual elapsed seconds |
| `completionNote` | string | User-entered, optional |
| `focusRating` | number | 1–5, default 4 |
| `completed` | boolean | `true` if timer reached 0, `false` if stopped early |
| `createdAt` | string | ISO 8601 |

### `sf_blocks` — CalendarBlock[]
| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID |
| `taskId` | string \| null | Optional link |
| `subjectId` | string \| null | Optional, auto-set from task |
| `title` | string | Required |
| `date` | string | `YYYY-MM-DD` |
| `startTime` | string | `HH:MM` |
| `durationMinutes` | number | Min 15, max 1440 |
| `createdAt` | string | ISO 8601 |

### `sf_preferences` — Preferences (single object)
| Field | Type | Default |
|---|---|---|
| `defaultTimerMode` | string | `'study'` |
| `defaultDurationMinutes` | number | `25` |
| `defaultDurationSeconds` | number | `1500` |
| `breakEnabled` | boolean | `true` |
| `breakDurationMinutes` | number | `5` |
| `breakDurationSeconds` | number | `300` |
| `soundEnabled` | boolean | `true` |
| `theme` | string | `'dark'` (vestigial, unused in v1) |

---

## 9. Storage Layer (`storage.js`)

This is the **only** file that may call `localStorage` directly. Every other module must import from `storage.js`.

localStorage key names — use **exactly** these:
- `sf_subjects`
- `sf_tasks`
- `sf_sessions`
- `sf_blocks`
- `sf_preferences`

```js
export const Storage = {
  // Subjects
  getSubjects()             // returns Subject[]
  saveSubject(subject)      // upserts by id
  deleteSubject(id)         // cascades: also deletes all tasks with this subjectId

  // Tasks
  getTasks()                // returns Task[]
  saveTask(task)            // upserts by id
  deleteTask(id)

  // Sessions
  getSessions()             // returns StudySession[]
  saveSession(session)      // upserts by id

  // Calendar blocks
  getBlocks()               // returns CalendarBlock[]
  saveBlock(block)          // upserts by id
  deleteBlock(id)

  // Preferences
  getPreferences()          // returns Preferences (with defaults merged if not set)
  savePreferences(prefs)    // saves full prefs object

  // Backup / restore
  exportAll()               // returns JSON string of all data
  importAll(jsonString)     // replaces all data; throws on invalid JSON or missing keys
  clearAll()                // removes all sf_* keys
}
```

---

## 10. Application Architecture (JS)

### State (`state.js`)
Simple pub/sub event bus — no frameworks:
```js
export const State = {
  currentPage: 'dashboard',
  activeTimerTaskId: null,  // set when timer starts from a task

  on(event, callback)  { ... },
  off(event, callback) { ... },
  emit(event, data)    { ... }
};
```

Key events to emit:
- `task.created`, `task.updated`, `task.deleted`, `task.completed`
- `session.completed`, `session.interrupted`
- `subject.created`, `subject.deleted`
- `preferences.updated`
- `navigation.changed`

### Entry Point (`app.js`)
1. Imports `State` and `renderSidebar` from `ui.js`.
2. Defines a `pages` map — each key maps to a lazy `() => import('./page.js')` dynamic import.
3. `initApp()`: renders sidebar, attaches `hashchange` listener, calls `navigate()`.
4. `navigate()`:
   - Reads `window.location.hash`, strips `#`, defaults to `'dashboard'`.
   - Calls `activePageModule.destroy()` if exists (cleanup).
   - Sets `State.currentPage`, emits `'navigation.changed'`.
   - Clears `#page-container`, dynamically imports page module, calls `module.init({ params })` where `params` is a `URLSearchParams` from the hash query string.

### Page Module Contract
Every page module exports:
```js
export function init(params) { ... }  // called on every navigation to this page
export function destroy() { ... }     // unhooks all event listeners (prevents memory leaks)
```

### UI Helpers (`ui.js`)
| Function | Purpose |
|---|---|
| `showModal(title, contentHTML, actionsHTML)` | Creates/reuses `.modal-overlay`, injects content, animates open |
| `hideModal()` | Removes `--open` class, removes element after 200ms |
| `showToast(message, type)` | Creates toast element, auto-removes after 3s. type: `'success' \| 'error' \| 'info'` |
| `showConfirm(message, onConfirm)` | Wrapper around `showModal` with Cancel + "Yes, proceed" (danger) buttons |
| `setPageTitle(title)` | Updates `document.title` to `"Title — StudyForge"` |
| `renderEmptyState(icon, heading, body, ctaLabel?, ctaId?)` | Returns HTML string for empty state with optional CTA |
| `renderSidebar()` | Builds sidebar nav items, attaches click handlers, highlights active link |

### Icons (`assets/icons.js`)
Exports a single `Icons` object. Required keys: `dashboard`, `tasks`, `subjects`, `timer`, `sessions`, `calendar`, `stats`, `settings`, `emptyFolder`, `check`, `close`, `play`, `pause`, `stop`, `refresh`, `edit`, `delete`, `fire`.
Each value is an inline `<svg>` string (`viewBox="0 0 24 24"`, `fill="currentColor"`).

---

## 11. Page-by-Page Feature Specifications

### 11.1 Dashboard (`#dashboard`)

**Purpose:** Answer "what do I study right now?"

- **Greeting header:** "Good morning/afternoon/evening, let's study" based on current hour. Show current date as "Thursday, 12 June 2025".
- **Next Best Task (card--highlight, most prominent):**
  - Algorithm: filter non-completed tasks → sort overdue first → nearest due date ascending → highest priority (high > medium > low). Show top 1.
  - Shows: title, subject dot + name, due date ("Overdue" in red if past), estimated time, "Start Timer" button linking to `#timer?taskId=ID`.
- **Today's Focus:** Tasks with `dueDate === today` OR `status === 'in-progress'` (excluding completed). Each row: subject color square, title, subject name, "Start" button.
- **Subject Progress Cards:** Grid of up to 4 subjects. Each: color dot, name, "X remaining", horizontal progress bar (completed % fill colored by subject color).
- **Today's Study + Streak row:** Two stat cards side by side.
  - Study time: total minutes from sessions whose `startTime` starts with today's `YYYY-MM-DD` string.
  - Streak: consecutive days backwards from today with ≥ 1 completed session. If today has no session yet, check yesterday — if yesterday has one, streak is not broken.
- **Upcoming Deadlines:** Top 5 non-completed tasks with `dueDate >= today`, sorted by date. Shows "Today", "Tomorrow", or "in X days" badge. Overdue tasks show in red.

**Dashboard grid layout (two-column desktop):**
```css
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
.dashboard-column { display: flex; flex-direction: column; gap: var(--space-lg); }
```
Left column: Next Best Task → Today's Focus → Subject Progress.
Right column: Today's Study + Streak row → Upcoming Deadlines.

---

### 11.2 Tasks (`#tasks`)

- **Filter:** `<select>` dropdown: `All`, `Today`, `Upcoming`, `Overdue`, `Completed`, plus one entry per subject name. Default `All`.
- **"+ New Task" button** opens task modal.
- **Task Cards:**
  - Toggle-complete circle button (hollow = incomplete, green checkmark = done, 60% opacity when completed).
  - High priority amber badge.
  - Title (line-through when completed).
  - Subject dot + name, due date 📅, estimated time ⏱.
  - Footer: "Start Timer" button (amber border, `#timer?taskId=ID`), Edit icon button, Delete icon button (red).
  - Overdue tasks get `card--danger` (red left border).
- **Sorting:** Completed at bottom → due date ascending → priority descending.
- **Task Modal fields:** Title (min 2 chars, validated), Subject (dropdown, required — if no subjects: redirect to `#subjects` with toast "Please create a subject first"), Due Date (date input), Estimated Time (H:M dual number inputs), Priority (radio: low/medium/high, default medium), Notes (textarea). Save uses `crypto.randomUUID()`.
- **Delete:** Confirm dialog → `Storage.deleteTask(id)` → emit `task.deleted`.
- **Toggle Complete:** Flips `completed` ↔ `in-progress`, emits event, shows toast "Task completed! 🎉".

---

### 11.3 Subjects (`#subjects`)

- "Create Subject" button.
- Grid of subject cards (`card--highlight`, left border colored by subject color). Shows: color dot + name, task count, Edit/Delete buttons.
- **Subject Modal:** Name input (min 2, unique case-insensitive) + color picker (8 circular swatches from preset palette; selected swatch shows a solid border ring).
- **Delete:** Confirm with warning "All assigned tasks will also be deleted!" → `Storage.deleteSubject(id)` cascades.

---

### 11.4 Timer (`#timer`)

**The centerpiece. Three phases: Setup → Active → Completion.**

**Phase 1 — Setup:**
- Centered card, `max-width: 600px`.
- Fields: "Link to Task" dropdown (non-completed tasks + "No specific task"), Mode dropdown (study/questions/writing/revision/mock-test), Duration (H : M : S — three number inputs with bold colon separators). Defaults from `Storage.getPreferences()`.
- `?taskId=ID` in hash pre-selects the task dropdown.
- Validates duration > 0.
- "Start Timer" button (`font-size: 18px; padding: 12px 32px`).

**Phase 2 — Active Timer:**
- Centered layout. Task title + mode label above the ring.
- **Circular SVG ring** (300×300 px viewport, `viewBox="0 0 100 100"`):
  - Two `<circle>` elements — background ring (`var(--color-border)`) + progress ring (`var(--color-amber)` for study, `#10B981` for break).
  - `r="45" cx="50" cy="50"`, `stroke-width: 6`, `stroke-linecap: round`.
  - `stroke-dasharray: 282.7` (= 2π × 45).
  - `stroke-dashoffset` calculated as `282.7 × (1 − remaining/total)` — ring empties as time passes.
  - SVG root: `transform: rotate(-90deg)` so progress starts at 12 o'clock.
- Large timer overlay: `font-size: 56px; font-weight: 500; font-variant-numeric: tabular-nums;` showing `HH:MM:SS`.
- Controls: "Pause/Resume" (primary) + "Stop" (secondary) buttons.
- "Toggle Pop-up Mode" button (small, at bottom — toggles `body.popup-mode`).
- `document.title` updates every tick to `"HH:MM:SS — StudyForge"`.
- Interval ticks every 1000ms. On countdown = 0: beep (if `soundEnabled`), then proceed to Phase 3.

**Phase 3 — Completion Modal:**
- Title: "Session Complete!" (natural finish) or "Session Interrupted" (stopped early).
- Fields: Focus Rating (1–5 number input, default 4), Notes (textarea, optional), Checkbox "Mark linked task as Completed?" (only if task linked; auto-checked when timer completed naturally).
- "Discard" → back to setup. "Save Log" → creates `StudySession` record in storage → emit `session.completed` or `session.interrupted`.
- If completed + break enabled: auto-starts break timer (green ring, break duration from prefs). Break completion returns to setup.
- If completed + no break: navigate to `#dashboard`.
- If stopped with < 1 minute elapsed: no session saved, silently return to setup.

**Edge case:** If linked task was deleted while timer was running, log session with `taskId: null`.

---

### 11.5 Session History (`#sessions`)

- Reverse chronological list. Grouped by date with styled date headers (border-bottom separator).
- **Each session card:**
  - Status badge: green "Completed" / gray "Interrupted"
  - Task title or "Unlinked Session"
  - Mode badge
  - Time range `HH:MM → HH:MM`
  - Duration (e.g., "1h 30m")
  - Subject color dot + name (or "—")
  - Completion note in italics (if any)
  - Focus rating as amber `★★★★☆` stars
- **Filters:** All | This Week | This Month | By Subject.

---

### 11.6 Calendar (`#calendar`)

- **Navigation bar:** Prev Week ← / Today / → Next Week. "Today" label turns amber when viewing current week. "+ New Block" button.
- **Grid:** 7-column layout (Mon–Sun) + time column on left showing hours 06:00–22:00 (17 rows × 60px = 1020px total height).
- **Column Headers:** Day name, date number (today highlighted with amber background tint), "• X Due" in red if tasks are due that day.
- **Time Blocks:** Absolutely positioned within day column. `top` = `(startHour - 6) * 60 + startMinute` px. `height` = `durationMinutes` px (min 15px). Style: `background: {subjectColor}20`, `border-left: 4px solid {subjectColor}`, `border-radius: 4px`. Shows title + time text.
- **Click empty grid space:** Opens block modal pre-filled with that date + rounded-to-nearest-15min time.
- **Click existing block:** Opens edit modal (with Delete + "Start Timer" if task linked).
- **Block Modal:** Title, Date, Start Time (`<input type="time">`), Duration (H:M dual inputs), Link Task dropdown, Subject dropdown (auto-sets from task). Validation: title required, duration 15–1440 min.

Note: Separate the calendar renderer from the data layer. The renderer receives an array of blocks for the week. This makes adding month/day views easy later.

---

### 11.7 Statistics (`#stats`)

Derive all data from `Storage.getSessions()` and `Storage.getTasks()` at render time. No caching.

- **Header Stats Row:** Today / This Week / Last Week total study time (three side-by-side stat cards).
- **Daily Breakdown (7 days):** Horizontal bar chart (pure CSS, no library). Each bar: day name, amber progress bar (width proportional to max day value), time label.
- **Subject Breakdown (This Week):** Horizontal bars per subject, colored by subject color, proportional to weekly total.
- **Streak Card (card--highlight):** 🔥 emoji + "{N}-Day Streak" + "Keep it up!".
- **Task Completion (30 Days):** Percentage + green progress bar + "X of Y tasks completed".
- **Planned vs Actual:** Planned calendar block minutes vs completed session minutes this week.
- **Subject Focus:** Most studied subject (amber text) + least studied subject (muted text, if > 1 subject).

---

### 11.8 Settings (`#settings`)

- **Timer Defaults (card):**
  - Default Mode dropdown.
  - Default Duration (H:M:S triple input).
  - "Enable Automatic Break" checkbox → enables/disables Break Duration inputs.
  - Break Duration (H:M:S triple input, disabled when break unchecked).
  - Session End Sound Beep checkbox.
  - "Save Preferences" button.
- **Data Management (card):**
  - "Export Data" → triggers download of `studyforge-backup-YYYY-MM-DD.json`.
  - **Danger Zone** (red header): "Reset All Data" → modal asks user to type "DELETE" to confirm → `Storage.clearAll()` → `window.location.reload()`.
- **Footer:** "StudyForge v1.0.0" + "Offline Focus Command Center" in muted small text.

---

## 12. Validation Rules (All Inline — No `alert()`)

| Field | Rule | Error message |
|---|---|---|
| Task title | Required, min 2 chars | "Title must be at least 2 characters" |
| Task subject | Must select | "Please select a subject" |
| Task estimated time | If filled: 1–480 min | "Enter a duration between 1 and 480 minutes" |
| Subject name | Required, min 2 chars | "Subject name is required" |
| Subject name | Must be unique (case-insensitive) | "A subject with this name already exists" |
| Timer duration | 1–180 min | "Duration must be between 1 and 180 minutes" |
| Break duration | 1–60 min | "Break must be between 1 and 60 minutes" |
| Calendar block title | Required | "Title is required" |
| Calendar block duration | 15–1440 min | "Duration must be between 15 and 1440 minutes" |
| Import JSON | Valid JSON with expected keys | "Invalid backup file — please export a fresh backup first" |
| Reset confirmation | Must type "DELETE" | "Please type DELETE to confirm" |

Show errors below the relevant `<input>` in a `<span class="field-error">`. Clear errors on input change event.

---

## 13. Naming Conventions

| Pattern | Convention | Example |
|---|---|---|
| JS functions | camelCase | `getTasksBySubject()` |
| JS constants | UPPER_SNAKE | `DEFAULT_DURATION_MINUTES` |
| CSS classes | BEM-ish kebab | `.task-card__title`, `.timer--running` |
| HTML ids | kebab-case | `#task-modal`, `#timer-ring` |
| localStorage keys | `sf_` prefix | `sf_tasks` |
| Data model IDs | UUID | `crypto.randomUUID()` |
| Event bus events | dot-namespaced | `'task.created'`, `'session.completed'` |

---

## 14. Cross-Module Connections (All Must Work)

These are the integration requirements for the app:

1. **Timer → Session History:** Completing or stopping a timer creates a `StudySession` record visible in the session history page.
2. **Timer → Dashboard:** After completing a session, the dashboard's "Today's study time" reflects the new total.
3. **Timer → Stats:** Sessions appear in stats charts on the same day.
4. **Task "Start Timer" → Timer:** Clicking "Start Timer" on any task (from dashboard, tasks page, or calendar) navigates to `#timer?taskId=ID` with the task pre-selected.
5. **Complete Task → Stats:** Marking a task complete updates the task completion rate in stats.
6. **Delete Subject → Tasks:** Deleting a subject cascades and removes all its tasks from storage.
7. **Calendar block → Timer:** Clicking a calendar block with a linked task shows "Start Timer" which opens `#timer?taskId=ID`.
8. **Preferences → Timer:** Default mode and duration from settings pre-fill the timer setup form on every visit.
9. **Export → Import round-trip:** Exported JSON can be imported back to restore all data identically with all types preserved.

---

## 15. Key Behaviors & Edge Cases

1. **No subjects → creating a task:** Redirect to `#subjects` with toast "Please create a subject first."
2. **Cascade delete:** Deleting a subject deletes all its tasks from storage.
3. **Timer < 1 minute + stopped:** No session saved, returns to setup silently.
4. **Break phase:** After a completed session (if break enabled), timer auto-starts break with green ring. Break completion → setup, not dashboard.
5. **Streak calculation:** Walk backward from today. If today has no session, check yesterday — if yesterday has one, streak is not broken (user just hasn't studied *yet* today).
6. **Date handling:** All dates compared as `YYYY-MM-DD` strings. No timezone conversion — use `toISOString().split('T')[0]`.
7. **Page cleanup:** Each page module exports `destroy()` which unhooks all event listeners to prevent memory leaks.
8. **Hash routing params:** Timer page reads `?taskId=X` from hash via `URLSearchParams`.
9. **Duration inputs:** Timer setup and settings use triple H:M:S inputs. Task estimated time and calendar blocks use dual H:M inputs.
10. **If linked task deleted during timer:** Log session with `taskId: null`, continue normally.
11. **`innerHTML` safety:** Use `textContent` for all user-controlled data. Only use `innerHTML` for trusted template strings built in JS.

---

## 16. Generation Instructions (Follow This Order Exactly)

Generate files in this exact order. Each file must be complete and working before moving to the next. Do not skip. Do not add TODO placeholders.

1. Generate `index.html` — complete shell with sidebar, main content DOM structure, loads `js/app.js` as `type="module"`, links all 4 CSS files.
2. Generate `css/base.css` — CSS variables matching the design system exactly, global resets, typography.
3. Generate `css/layout.css` — sidebar layout, main content area, popup mode, page container.
4. Generate `css/components.css` — all reusable components: cards, buttons, inputs, badges, modals, toasts, empty states, subject color dots.
5. Generate `css/themes.css` — dark theme applied (light theme scaffold commented out for future).
6. Generate `js/models.js` — JSDoc typedefs only, no runtime logic.
7. Generate `js/storage.js` — complete implementation of all Storage methods.
8. Generate `js/state.js` — complete pub/sub event bus implementation.
9. Generate `assets/icons.js` — complete `Icons` object with all required SVG strings.
10. Generate `js/ui.js` — complete implementation of all UI helpers: modal, toast, confirm, empty state, sidebar renderer.
11. Generate `js/app.js` — hash router, dynamic page imports, init, page lifecycle.
12. Generate `js/subjects.js` — complete subjects page with CRUD modal and color picker.
13. Generate `js/tasks.js` — complete tasks page with filters, CRUD modal, toggle complete, start timer.
14. Generate `js/timer.js` — complete three-phase timer: setup form, SVG ring countdown, completion modal, break phase.
15. Generate `js/sessions.js` — complete session history page with grouping and filters.
16. Generate `js/calendar.js` — complete weekly calendar grid with click-to-create and time blocks.
17. Generate `js/stats.js` — complete stats page with all required charts and cards.
18. Generate `js/dashboard.js` — complete dashboard with all required widgets and two-column layout.
19. Generate `js/settings.js` — complete settings page with preferences, export, import, danger zone.

After generating all files, output a **verification checklist:**

- [ ] All 9 cross-module connections function correctly (trace them manually)
- [ ] All empty states are implemented for every list/collection
- [ ] All inline validations are implemented (no `alert()` anywhere)
- [ ] `localStorage` is only accessed inside `storage.js`
- [ ] `localStorage` key names match the spec exactly (`sf_*`)
- [ ] Timer creates a `StudySession` on both completion and interruption
- [ ] Timer with < 1 minute elapsed + stopped saves nothing
- [ ] Dashboard "Next Best Task" algorithm is correctly implemented
- [ ] Streak calculation handles "hasn't studied today yet" correctly
- [ ] Export/import round-trip preserves all data types correctly
- [ ] Every page module exports both `init()` and `destroy()`
- [ ] SVG timer ring math is correct (`stroke-dasharray: 282.7`, offset formula)
- [ ] `document.title` updates every second while timer is active
- [ ] Subject cascade delete removes all linked tasks
- [ ] Calendar grid pixel math is correct (60px per hour, 6am base offset)

---

## 17. What NOT To Do

- **Do not** install or import any npm packages, CDN libraries, or external resources. Zero runtime dependencies.
- **Do not** use `alert()`, `confirm()`, or `prompt()` — use the modal/toast system only.
- **Do not** use `innerHTML` on user-controlled text — use `textContent` for user data, `innerHTML` only for trusted template strings.
- **Do not** add placeholder comments like `// TODO: implement this` — implement everything fully.
- **Do not** call `localStorage` directly in any file except `storage.js`.
- **Do not** use ES2022+ features — stick to ES2020 for maximum browser compatibility.
- **Do not** hard-code pixel values for window size — the layout must be fully resizable.
- **Do not** render empty `<ul>` or blank `<div>` elements — always implement the empty state.
- **Do not** simplify or stub any feature without clearly marking it as a "v1 scope decision" with a comment.
- **Do not** use `var` — use `const` and `let` only.
- **Do not** use inline `style=` attributes for themeable properties — use CSS custom properties.
