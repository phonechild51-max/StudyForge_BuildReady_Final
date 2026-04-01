/**
 * StudyForge — calendar.js
 * Weekly Grid Planning View with Multi-Week Navigation.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

let weekOffset = 0;

/**
 * Initialize Calendar
 */
export function init() {
  UI.setPageTitle('Planner');
  weekOffset = 0; // Reset on entry
  renderWeeklyGrid();
  
  State.on('block.created', renderWeeklyGrid);
  State.on('block.deleted', renderWeeklyGrid);
}

/**
 * Cleanup
 */
export function destroy() {
  State.off('block.created', renderWeeklyGrid);
  State.off('block.deleted', renderWeeklyGrid);
}

function renderWeeklyGrid() {
  const container = document.getElementById('page-container');
  const blocks = Storage.getBlocks();
  const subjects = Storage.getSubjects();

  // 1. Generate 7 Days based on weekOffset
  const days = [];
  const today = new Date();
  today.setHours(0,0,0,0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + (weekOffset * 7) + i);
    
    const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
    const dateStr = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    
    days.push({
      iso: d.toISOString().split('T')[0],
      weekday,
      date: dateStr,
      isToday: d.getTime() === today.getTime()
    });
  }

  // 2. Define Hours (00:00 to 23:00)
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, '0') + ':00');
  }

  let html = `
    <div class="section-header">
      <div class="section-title-group">
        <h2>Weekly Planner</h2>
        <span class="section-subtitle">Plan focus blocks across different weeks</span>
      </div>
      <div class="header-actions">
        <div class="nav-group">
          <button id="btn-prev-week" class="btn btn--icon-only" title="Previous Week">${Icons.chevronLeft}</button>
          <button id="btn-today" class="btn btn--secondary btn--sm">Today</button>
          <button id="btn-next-week" class="btn btn--icon-only" title="Next Week">${Icons.chevronRight}</button>
        </div>
        <button id="btn-add-block" class="btn btn--primary">${Icons.calendar} New Block</button>
      </div>
    </div>

    <div class="page-content">
      <div class="sf-calendar-grid-wrapper animate-in">
        <div class="sf-calendar-grid">
          <!-- Header Row -->
          <div class="sf-grid-header" style="color: var(--color-amber); font-weight: 800; font-size: 10px; letter-spacing: 0.1em;">TIME</div>
          ${days.map(d => `
            <div class="sf-grid-header">
              <div class="header-day">${d.weekday}</div>
              <div class="header-date">${d.date}</div>
              ${d.isToday ? '<div class="today-marker">TODAY</div>' : ''}
            </div>
          `).join('')}

          <!-- Time Rows -->
          ${hours.map(time => `
            <div class="sf-grid-time-label">${time}</div>
            ${days.map(day => {
              const hourInt = parseInt(time.split(':')[0]);
              const cellBlocks = blocks.filter(b => {
                const bHour = parseInt(b.startTime.split(':')[0]);
                return b.date === day.iso && bHour === hourInt;
              });

              return `
                <div class="sf-grid-cell" data-date="${day.iso}" data-time="${time}">
                  ${cellBlocks.map(b => {
                    const sub = subjects.find(s => s.id === b.subjectId);
                    const startParts = b.startTime.split(':');
                    const startDate = new Date(2000, 0, 1, parseInt(startParts[0]), parseInt(startParts[1]));
                    const endDate = new Date(startDate.getTime() + (b.durationMinutes * 60000));
                    const endTime = endDate.getHours().toString().padStart(2, '0') + ':' + 
                                    endDate.getMinutes().toString().padStart(2, '0');

                    return `
                      <div class="planned-chip" style="background: ${sub ? sub.color : '#444'};" data-id="${b.id}">
                        <div class="chip-title">${b.title}</div>
                        <div class="chip-meta">${b.startTime} - ${endTime}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Auto-scroll to 6:00 (approx 6 * 61px per cell + borders)
  setTimeout(() => {
    const wrapper = container.querySelector('.sf-calendar-grid-wrapper');
    if (wrapper) {
      wrapper.scrollTop = 6 * 61;
    }
  }, 10);

  // Handlers
  document.getElementById('btn-add-block').onclick = () => openBlockModal();
  
  document.getElementById('btn-prev-week').onclick = () => {
    weekOffset--;
    renderWeeklyGrid();
  };
  
  document.getElementById('btn-next-week').onclick = () => {
    weekOffset++;
    renderWeeklyGrid();
  };
  
  document.getElementById('btn-today').onclick = () => {
    weekOffset = 0;
    renderWeeklyGrid();
  };

  // Cell clicks
  container.querySelectorAll('.sf-grid-cell').forEach(cell => {
    cell.onclick = (e) => {
      if (e.target.closest('.planned-chip')) {
        const id = e.target.closest('.planned-chip').getAttribute('data-id');
        UI.showConfirm('Remove this focus block?', () => {
          Storage.deleteBlock(id);
          State.emit('block.deleted', id);
          UI.showToast('Block deleted', 'info');
        });
        return;
      }

      const date = cell.getAttribute('data-date');
      const time = cell.getAttribute('data-time');
      openBlockModal(date, time);
    };
  });
}

function openBlockModal(initialDate = null, initialTime = null) {
  const subjects = Storage.getSubjects();
  const tasks = Storage.getTasks().filter(t => t.status !== 'completed');
  const today = new Date().toISOString().split('T')[0];

  const content = `
    <div class="form-group">
      <label for="block-title">Block Title / Goal</label>
      <input type="text" id="block-title" class="input-field" placeholder="What are you focusing on?" autofocus>
      <span id="block-title-error" class="field-error hidden"></span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div class="form-group">
        <label for="block-date">Date</label>
        <input type="date" id="block-date" class="input-field" value="${initialDate || today}">
      </div>
      <div class="form-group">
        <label for="block-time">Start Time</label>
        <input type="time" id="block-time" class="input-field" value="${initialTime || '09:00'}">
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div id="modal-subject-container" class="form-group">
        <!-- Rendered by UI -->
      </div>
      <div class="form-group">
        <label>Duration (H:M:S)</label>
        <div class="timer-input-group" style="justify-content: flex-start; margin-top: 8px;">
          <input type="number" id="block-dur-h" class="timer-input-box" value="1" min="0" max="23" style="width: 54px; font-size: 14px; padding: 6px;">
          <span class="timer-separator">:</span>
          <input type="number" id="block-dur-m" class="timer-input-box" value="0" min="0" max="59" style="width: 54px; font-size: 14px; padding: 6px;">
          <span class="timer-separator">:</span>
          <input type="number" id="block-dur-s" class="timer-input-box" value="0" min="0" max="59" style="width: 54px; font-size: 14px; padding: 6px;">
        </div>
      </div>
    </div>

    <div id="modal-task-container" class="form-group">
      <!-- Rendered by UI -->
    </div>
  `;

  const actions = `
    <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
    <button class="btn btn--primary" id="modal-save">Save Block</button>
  `;

  UI.showModal('Plan Your Focus', content, actions);

  // Initialize Custom Dropdowns
  let selectedSubjectId = "";
  let selectedTaskId = "";

  UI.renderCustomDropdown('modal-subject-container', [
    { label: 'None / General', value: '' },
    ...subjects.map(s => ({ label: s.name, value: s.id }))
  ], selectedSubjectId, (val) => {
    selectedSubjectId = val;
  }, { label: 'Subject', fullWidth: true });

  UI.renderCustomDropdown('modal-task-container', [
    { label: 'None', value: '' },
    ...tasks.map(t => ({ label: t.title, value: t.id }))
  ], selectedTaskId, (val) => {
    selectedTaskId = val;
  }, { label: 'Link to Specific Task (Optional)', fullWidth: true });

  document.getElementById('modal-cancel').onclick = () => UI.hideModal();
  document.getElementById('modal-save').onclick = () => {
    const title = document.getElementById('block-title').value.trim();
    if (title.length < 2) {
      const err = document.getElementById('block-title-error');
      err.textContent = 'Please enter a goal for this block';
      err.classList.remove('hidden');
      return;
    }

    const bh = parseInt(document.getElementById('block-dur-h').value) || 0;
    const bm = parseInt(document.getElementById('block-dur-m').value) || 0;
    const bs = parseInt(document.getElementById('block-dur-s').value) || 0;
    const totalMinutes = (bh * 60) + bm + (bs / 60);

    const newBlock = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      title,
      date: document.getElementById('block-date').value,
      startTime: document.getElementById('block-time').value,
      durationMinutes: parseFloat(totalMinutes.toFixed(2)),
      subjectId: selectedSubjectId || null,
      taskId: selectedTaskId || null,
      createdAt: new Date().toISOString()
    };

    Storage.saveBlock(newBlock);
    State.emit('block.created', newBlock);
    UI.showToast('Block added to your schedule!', 'success');
    UI.hideModal();
  };
}
