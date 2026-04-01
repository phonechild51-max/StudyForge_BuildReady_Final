/**
 * StudyForge — timer.js
 * The core Focus Timer engine.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

let timerInterval = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let isPaused = false;
let isBreak = false;
let currentTaskId = null;
let currentMode = 'study';
let startTime = null;
let isPageActive = false;
let pendingCompletion = false;

/**
 * Initialize Timer page
 * @param {URLSearchParams} params 
 */
export function init(params) {
  UI.setPageTitle('Timer');
  isPageActive = true;

  if (timerInterval) {
    // If timer is already running in background, restore active view
    renderActiveTimer();
    updateDisplay();
  } else if (pendingCompletion) {
    // If it finished while we were away, show the summary
    pendingCompletion = false;
    openCompletionModal(true);
  } else {
    // Standard setup
    const taskId = params.get('taskId');
    if (taskId) currentTaskId = taskId;
    renderSetup();
  }
}

/**
 * Cleanup on page destruction
 */
export function destroy() {
  isPageActive = false;
  document.body.classList.remove('popup-mode');
  if (!timerInterval) {
    UI.setPageTitle('StudyForge');
  }
}

function resetTimerState() {
  remainingSeconds = 0;
  totalSeconds = 0;
  isPaused = false;
  isBreak = false;
  startTime = null;
  pendingCompletion = false;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

/**
 * PHASE 1: Timer Setup Form
 */
function renderSetup() {
  const container = document.getElementById('page-container');
  const prefs = Storage.getPreferences();
  const subjects = Storage.getSubjects();
  const tasks = Storage.getTasks().filter(t => t.status !== 'completed');

  // Pre-fill from prefs
  currentMode = prefs.defaultTimerMode || 'study';
  remainingSeconds = prefs.defaultDurationSeconds || 1500;

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const html = `
    <div class="page-content" style="display: flex; flex-direction: column; justify-content: center; min-height: calc(100vh - 100px);">
      <div class="timer-setup-container animate-in" style="max-width: 600px; margin: 0 auto; width: 100%;">
        <div class="card card--glass">
          <h2 style="margin-bottom: 24px; text-align: center;">Focus Session Setup</h2>
          
          <div id="timer-task-container" class="form-group">
            <!-- Rendered by UI -->
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div id="timer-mode-container" class="form-group">
              <!-- Rendered by UI -->
            </div>
            <div class="form-group">
              <label>Duration</label>
              <div class="timer-input-group">
                <input type="number" id="setup-h" class="timer-input-box" value="${hours}" min="0" max="23">
                <span class="timer-separator">:</span>
                <input type="number" id="setup-m" class="timer-input-box" value="${minutes}" min="0" max="59">
                <span class="timer-separator">:</span>
                <input type="number" id="setup-s" class="timer-input-box" value="${seconds}" min="0" max="59">
              </div>
            </div>
          </div>

          <div style="margin-top: 32px; text-align: center;">
            <button id="btn-start-timer" class="btn btn--primary" style="padding: 14px 48px; font-size: 16px;">
              ${Icons.play} Start Focusing
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Initialize Custom Dropdowns
  const taskOptions = [
    { label: 'No specific task (General Study)', value: '' },
    ...tasks.map(t => {
      const sub = subjects.find(s => s.id === t.subjectId);
      return { label: t.title, value: t.id, group: sub ? sub.name : 'General' };
    })
  ];

  UI.renderCustomDropdown('timer-task-container', taskOptions, currentTaskId, (val) => {
    currentTaskId = val;
  }, { label: 'Link to Task', fullWidth: true });

  UI.renderCustomDropdown('timer-mode-container', [
    { label: 'Standard Study', value: 'study' },
    { label: 'Solving Questions', value: 'questions' },
    { label: 'Writing / Drafting', value: 'writing' },
    { label: 'Final Revision', value: 'revision' },
    { label: 'Mock Test', value: 'mock-test' }
  ], currentMode, (val) => {
    currentMode = val;
  }, { label: 'Session Mode', fullWidth: true });

  document.getElementById('btn-start-timer').onclick = () => {
    const h = parseInt(document.getElementById('setup-h').value) || 0;
    const m = parseInt(document.getElementById('setup-m').value) || 0;
    const s = parseInt(document.getElementById('setup-s').value) || 0;
    
    totalSeconds = (h * 3600) + (m * 60) + s;
    if (totalSeconds <= 0) {
      UI.showToast('Duration must be at least 1 second', 'error');
      return;
    }

    remainingSeconds = totalSeconds;
    startFocusSession();
  };
}

/**
 * PHASE 2: Active Timer
 */
function startFocusSession() {
  startTime = new Date().toISOString();
  isBreak = false;
  isPaused = false;
  renderActiveTimer();
  tick();
  timerInterval = setInterval(tick, 1000);
}

function renderActiveTimer() {
  const container = document.getElementById('page-container');
  const tasks = Storage.getTasks();
  const task = tasks.find(t => t.id === currentTaskId);
  const subjects = Storage.getSubjects();
  const subject = task ? subjects.find(s => s.id === task.subjectId) : null;

  const html = `
    <div class="page-content" style="display: flex; flex-direction: column; justify-content: center; min-height: calc(100vh - 100px);">
      <div class="active-timer-container animate-in" style="text-align: center; max-width: 600px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 24px;">
          <h2 id="timer-status-text">${isBreak ? 'Relaxation Break' : 'Focusing Deeply'}</h2>
          <p style="color: var(--color-text-muted); font-size: 16px; margin-top: 8px;">
            ${subject ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${subject.color}; margin-right:8px;"></span>` : ''}
            ${task ? task.title : (isBreak ? 'Time to recharge' : 'General Session')}
          </p>
        </div>

        <div class="timer-visual-root" style="position: relative; width: 320px; height: 320px; margin: 0 auto;">
          <!-- SVG Progress Ring -->
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            <circle cx="50" cy="50" r="45" stroke="var(--color-navy-surface)" stroke-width="6" fill="none"></circle>
            <circle id="progress-ring" cx="50" cy="50" r="45" 
                    stroke="${isBreak ? 'var(--color-success)' : 'var(--color-amber)'}" 
                    stroke-width="6" fill="none"
                    stroke-dasharray="282.7"
                    stroke-dashoffset="0"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 1s linear, stroke 0.3s;"></circle>
          </svg>
          
          <!-- Large Timer Readout -->
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div id="timer-display" style="font-size: 56px; font-weight: 500; font-variant-numeric: tabular-nums;">00:00:00</div>
            <div id="timer-mode-badge" class="badge" style="margin-top: 8px; background: rgba(255,255,255,0.1);">${currentMode.toUpperCase()}</div>
          </div>
        </div>

        <div class="timer-controls" style="margin-top: 40px; display: flex; justify-content: center; gap: 16px;">
          <button id="btn-pause-resume" class="btn btn--secondary" style="width: 120px;">
            ${isPaused ? Icons.play : Icons.pause} <span>${isPaused ? 'Resume' : 'Pause'}</span>
          </button>
          <button id="btn-stop-timer" class="btn btn--danger" style="width: 120px;">
            ${Icons.stop} Stop
          </button>
        </div>

        <div style="margin-top: 48px;">
          <button id="btn-toggle-popup" class="btn btn--icon" title="Toggle Pop-up Mode" style="border: 1px solid var(--color-border); padding: 8px 16px; border-radius: 20px; font-size: 12px;">
             🖥 Distraction-Free Mode
          </button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById('btn-pause-resume').onclick = () => {
    isPaused = !isPaused;
    const btn = document.getElementById('btn-pause-resume');
    btn.innerHTML = `${isPaused ? Icons.play : Icons.pause} <span>${isPaused ? 'Resume' : 'Pause'}</span>`;
    UI.showToast(isPaused ? 'Session Paused' : 'Session Resumed', 'info');
  };

  document.getElementById('btn-stop-timer').onclick = () => {
    UI.showConfirm('Stop focusing and log progress?', () => {
      stopTimer();
      openCompletionModal(false);
    });
  };

  document.getElementById('btn-toggle-popup').onclick = () => {
    document.body.classList.toggle('popup-mode');
  };
}

function tick() {
  if (isPaused) return;

  if (remainingSeconds > 0) {
    remainingSeconds--;
    if (isPageActive) {
      updateDisplay();
    } else {
      // Update browser title even in background
      UI.setPageTitle(getFormattedTime());
    }
  } else {
    stopTimer();
    playBeep();
    
    if (isBreak) {
      UI.showToast('Break finished! Ready to work?', 'success');
      if (isPageActive) renderSetup();
      else pendingCompletion = false; // Breaks don't need a summary modal
    } else {
      if (isPageActive) {
        openCompletionModal(true);
      } else {
        pendingCompletion = true;
        UI.showToast('Focus session complete! 🎉', 'success');
      }
    }
  }
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function updateDisplay() {
  const display = document.getElementById('timer-display');
  const ring = document.getElementById('progress-ring');
  
  const timeStr = getFormattedTime();
  if (display) display.textContent = timeStr;
  UI.setPageTitle(timeStr);

  // Update ring
  if (ring && totalSeconds > 0) {
    const percentage = remainingSeconds / totalSeconds;
    const offset = 282.7 * (1 - percentage);
    ring.style.strokeDashoffset = offset;
  }
}

function getFormattedTime() {
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * PHASE 3: Completion Modal
 */
function openCompletionModal(naturalFinish) {
  const elapsedMinutes = Math.round((totalSeconds - remainingSeconds) / 60);
  
  // If less than 1 min worked, just reset
  if (elapsedMinutes < 1 && !naturalFinish) {
    UI.showToast('Session too short to log', 'info');
    renderSetup();
    return;
  }

  const tasks = Storage.getTasks();
  const task = tasks.find(t => t.id === currentTaskId);

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px; margin-bottom: 8px;">${naturalFinish ? '🎉' : '⏱'}</div>
      <h3>${naturalFinish ? 'Session Complete!' : 'Session Interrupted'}</h3>
      <p style="color: var(--color-text-muted);">You focused for ${elapsedMinutes} minute${elapsedMinutes !== 1 ? 's' : ''}.</p>
    </div>

    <div class="form-group">
      <label>Focus Rating</label>
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-navy-surface); padding: 12px; border-radius: 8px;">
        ${[1, 2, 3, 4, 5].map(i => `
          <button class="rating-btn" data-val="${i}" style="font-size: 24px; opacity: ${i <= 4 ? 1 : 0.3}; transition: 0.2s;">
            ${i <= 4 ? '⭐' : '☆'}
          </button>
        `).join('')}
      </div>
      <input type="hidden" id="focus-rating" value="4">
    </div>

    <div class="form-group">
      <label>Quick Note</label>
      <textarea id="completion-note" class="input-field" placeholder="What did you get done?"></textarea>
    </div>

    ${task ? `
      <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 16px; background: rgba(245, 158, 11, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2);">
        <input type="checkbox" id="mark-task-done" style="width: 18px; height: 18px;" ${naturalFinish ? 'checked' : ''}>
        <label for="mark-task-done" style="margin: 0; cursor: pointer; color: var(--color-text-light);">Mark task as completed</label>
      </div>
    ` : ''}
  `;

  const actions = `
    <button class="btn btn--secondary" id="btn-discard">Discard Log</button>
    <button class="btn btn--primary" id="btn-save-log">Save ${naturalFinish ? '& Take Break' : 'Log'}</button>
  `;

  UI.showModal(naturalFinish ? 'Great Job!' : 'Session Summary', content, actions);

  // Rating handlers
  let rating = 4;
  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.onclick = () => {
      rating = parseInt(btn.getAttribute('data-val'));
      document.getElementById('focus-rating').value = rating;
      document.querySelectorAll('.rating-btn').forEach(b => {
        const val = parseInt(b.getAttribute('data-val'));
        b.innerHTML = val <= rating ? '⭐' : '☆';
        b.style.opacity = val <= rating ? 1 : 0.3;
      });
    };
  });

  document.getElementById('btn-discard').onclick = () => {
    UI.hideModal();
    renderSetup();
  };

  document.getElementById('btn-save-log').onclick = () => {
    const note = document.getElementById('completion-note').value.trim();
    const markDone = document.getElementById('mark-task-done')?.checked;
    const finalRating = parseInt(document.getElementById('focus-rating').value);

    // 1. Create Session Record
    const session = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      taskId: currentTaskId,
      subjectId: task ? task.subjectId : null,
      mode: currentMode,
      startTime: startTime,
      endTime: new Date().toISOString(),
      durationMinutes: elapsedMinutes,
      completionNote: note,
      focusRating: finalRating,
      completed: naturalFinish,
      createdAt: new Date().toISOString()
    };
    Storage.saveSession(session);
    State.emit('session.completed', session);

    // 2. Mark task done if requested
    if (markDone && task) {
      task.status = 'completed';
      task.updatedAt = new Date().toISOString();
      Storage.saveTask(task);
      State.emit('task.completed', task);
    }

    UI.hideModal();
    UI.showToast('Session logged successfully!', 'success');

    // 3. Handle Break
    const prefs = Storage.getPreferences();
    if (naturalFinish && prefs.breakEnabled) {
      startBreak(prefs.breakDurationSeconds);
    } else {
      window.location.hash = '#dashboard';
    }
  };
}

function startBreak(seconds) {
  isBreak = true;
  isPaused = false;
  totalSeconds = seconds;
  remainingSeconds = seconds;
  renderActiveTimer();
  updateDisplay();
  timerInterval = setInterval(tick, 1000);
}

/**
 * Audio Logic
 */
function playBeep() {
  const prefs = Storage.getPreferences();
  if (!prefs.soundEnabled) return;

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio beep failed', e);
  }
}
