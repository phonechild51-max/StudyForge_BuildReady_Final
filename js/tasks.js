/**
 * StudyForge — tasks.js
 * Task management page.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

let currentFilter = 'all';

/**
 * Initialize Tasks page
 * @param {URLSearchParams} params 
 */
export function init(params) {
  UI.setPageTitle('Tasks');
  currentFilter = params.get('filter') || 'all';
  render();
  
  State.on('task.created', render);
  State.on('task.updated', render);
  State.on('task.deleted', render);
  State.on('subject.created', render);
  State.on('subject.deleted', render);
}

/**
 * Cleanup
 */
export function destroy() {
  State.off('task.created', render);
  State.off('task.updated', render);
  State.off('task.deleted', render);
  State.off('subject.created', render);
  State.off('subject.deleted', render);
}

/**
 * Main Render
 */
function render() {
  const container = document.getElementById('page-container');
  const allTasks = Storage.getTasks();
  const subjects = Storage.getSubjects();
  const today = new Date().toISOString().split('T')[0];

  // Filtering Logic
  let tasks = [...allTasks];
  if (currentFilter === 'today') {
    tasks = tasks.filter(t => t.dueDate === today && t.status !== 'completed');
  } else if (currentFilter === 'upcoming') {
    tasks = tasks.filter(t => t.dueDate > today && t.status !== 'completed');
  } else if (currentFilter === 'overdue') {
    tasks = tasks.filter(t => t.dueDate < today && t.dueDate !== '' && t.status !== 'completed');
  } else if (currentFilter === 'completed') {
    tasks = tasks.filter(t => t.status === 'completed');
  } else if (currentFilter.startsWith('sub_')) {
    const subId = currentFilter.replace('sub_', '');
    tasks = tasks.filter(t => t.subjectId === subId);
  }

  // Sorting: Incomplete first -> Due Date ASC -> Priority DESC
  tasks.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    } else if (a.dueDate) return -1;
    else if (b.dueDate) return 1;

    const priorityMap = { high: 3, medium: 2, low: 1 };
    return priorityMap[b.priority] - priorityMap[a.priority];
  });

  let html = `
    <div class="section-header">
      <div class="section-title-group">
        <h2>Tasks</h2>
      </div>
      <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
        <div class="filter-bar" id="tasks-filter-container">
          <!-- Custom Dropdown -->
        </div>
        <button id="btn-new-task" class="btn btn--primary">${Icons.add} New Task</button>
      </div>
    </div>
  `;

  if (tasks.length === 0) {
    html += `
      <div class="page-content">
        ${UI.renderEmptyState(
          'tasks', 
          'No tasks found', 
          'This view is empty. Try a different filter or create a new task.',
          'Create Task',
          'btn-create-task-empty'
        )}
      </div>
    `;
  } else {
    html += `
      <div class="page-content">
        <div class="tasks-list">
          ${tasks.map(task => {
            const subject = subjects.find(s => s.id === task.subjectId) || { name: 'Unknown', color: '#666' };
            const isOverdue = task.dueDate < today && task.dueDate !== '' && task.status !== 'completed';
            const isCompleted = task.status === 'completed';
            
            return `
              <div class="card ${isOverdue ? 'card--danger' : ''} task-card ${isCompleted ? 'task--completed' : ''} animate-in" 
                   style="padding: 16px; opacity: ${isCompleted ? 0.6 : 1}; ${isCompleted ? 'border-style: dashed;' : ''}">
                <div style="display: flex; align-items: flex-start; gap: 16px;">
                  <button class="btn-toggle-complete" data-id="${task.id}" style="margin-top: 4px; color: ${isCompleted ? 'var(--color-success)' : 'var(--color-border)'}">
                    ${isCompleted ? Icons.check : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`}
                  </button>
                  
                  <div style="flex-grow: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      <h3 style="text-decoration: ${isCompleted ? 'line-through' : 'none'}">${task.title}</h3>
                      <span class="badge badge--${task.priority}">${task.priority}</span>
                    </div>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--color-text-muted);">
                      <span style="display: flex; align-items: center; gap: 4px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${subject.color}"></span>
                        ${subject.name}
                      </span>
                      ${task.dueDate ? `<span>📅 ${task.dueDate}</span>` : ''}
                      ${task.estimatedMinutes ? `<span>⏱ ${task.estimatedMinutes}m</span>` : ''}
                    </div>
                  </div>
                  <div class="task-actions" style="display: flex; gap: 4px;">
                    ${!isCompleted ? `<a href="#timer?taskId=${task.id}" class="btn btn--secondary btn--icon" title="Start Timer">${Icons.play}</a>` : ''}
                    <button class="btn--icon btn-edit" data-id="${task.id}">${Icons.edit}</button>
                    <button class="btn--icon btn-delete" data-id="${task.id}" style="color: var(--color-danger)">${Icons.delete}</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Initialize Filter Dropdown
  const filterOptions = [
    { label: 'All Tasks', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Completed', value: 'completed' },
    ...subjects.map(s => ({ label: s.name, value: `sub_${s.id}`, group: 'By Subject' }))
  ];

  UI.renderCustomDropdown('tasks-filter-container', filterOptions, currentFilter, (val) => {
    currentFilter = val;
    window.location.hash = `#tasks?filter=${currentFilter}`;
    render();
  });

  // Event Listeners
  const newBtn = document.getElementById('btn-new-task');
  if (newBtn) newBtn.onclick = () => openTaskModal();

  const emptyBtn = document.getElementById('btn-create-task-empty');
  if (emptyBtn) emptyBtn.onclick = () => openTaskModal();

  container.querySelectorAll('.btn-toggle-complete').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const task = allTasks.find(t => t.id === id);
      task.status = task.status === 'completed' ? 'in-progress' : 'completed';
      task.updatedAt = new Date().toISOString();
      Storage.saveTask(task);
      State.emit('task.updated', task);
      if (task.status === 'completed') UI.showToast('Task completed! 🎉', 'success');
    };
  });

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const task = allTasks.find(t => t.id === id);
      openTaskModal(task);
    };
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      UI.showConfirm('Delete this task?', () => {
        Storage.deleteTask(id);
        State.emit('task.deleted', id);
        UI.showToast('Task removed', 'info');
      });
    };
  });
}

function openTaskModal(task = null) {
  const isEdit = !!task;
  const subjects = Storage.getSubjects();

  if (subjects.length === 0) {
    UI.showToast('Please create a subject first', 'error');
    window.location.hash = '#subjects';
    return;
  }

  const content = `
    <div class="form-group">
      <label for="task-title">Task Title</label>
      <input type="text" id="task-title" class="input-field" placeholder="e.g. Read Chapter 5" value="${task ? task.title : ''}">
      <span id="title-error" class="field-error hidden"></span>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div id="modal-subject-container" class="form-group">
        <!-- Rendered by UI -->
      </div>
      <div id="modal-priority-container" class="form-group">
        <!-- Rendered by UI -->
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div class="form-group">
        <label for="task-due">Due Date</label>
        <input type="date" id="task-due" class="input-field" value="${task ? task.dueDate : ''}">
      </div>
      <div class="form-group">
        <label>Duration (H:M:S)</label>
        <div class="timer-input-group" style="justify-content: flex-start; gap: 8px;">
          <input type="number" id="task-dur-h" class="timer-input-box" value="${task ? Math.floor(task.estimatedMinutes / 60) : 0}" min="0" max="23" style="width: 48px; font-size: 13px; padding: 4px;">
          <span class="timer-separator">:</span>
          <input type="number" id="task-dur-m" class="timer-input-box" value="${task ? Math.floor(task.estimatedMinutes % 60) : 25}" min="0" max="59" style="width: 48px; font-size: 13px; padding: 4px;">
          <span class="timer-separator">:</span>
          <input type="number" id="task-dur-s" class="timer-input-box" value="0" min="0" max="59" style="width: 48px; font-size: 13px; padding: 4px;">
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="task-notes">Notes (Optional)</label>
      <textarea id="task-notes" class="input-field" placeholder="Add some context...">${task ? task.notes : ''}</textarea>
    </div>
  `;

  const actions = `
    <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
    <button class="btn btn--primary" id="modal-save">${isEdit ? 'Update Task' : 'Create Task'}</button>
  `;

  UI.showModal(isEdit ? 'Edit Task' : 'New Task', content, actions);

  // Initialize Modal Dropdowns
  let selectedSubjectId = task ? task.subjectId : subjects[0].id;
  let selectedPriority = task ? task.priority : 'medium';

  UI.renderCustomDropdown('modal-subject-container', subjects.map(s => ({ label: s.name, value: s.id })), selectedSubjectId, (val) => {
    selectedSubjectId = val;
  }, { label: 'Subject', fullWidth: true });

  UI.renderCustomDropdown('modal-priority-container', [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ], selectedPriority, (val) => {
    selectedPriority = val;
  }, { label: 'Priority', fullWidth: true });

  document.getElementById('modal-cancel').onclick = () => UI.hideModal();
  document.getElementById('modal-save').onclick = () => {
    const title = document.getElementById('task-title').value.trim();
    const dueDate = document.getElementById('task-due').value;
    
    const dh = parseInt(document.getElementById('task-dur-h').value) || 0;
    const dm = parseInt(document.getElementById('task-dur-m').value) || 0;
    const ds = parseInt(document.getElementById('task-dur-s').value) || 0;
    const estimatedMinutes = parseFloat(((dh * 60) + dm + (ds / 60)).toFixed(2));

    const notes = document.getElementById('task-notes').value.trim();

    if (title.length < 2) {
      const err = document.getElementById('title-error');
      err.textContent = 'Title must be at least 2 characters';
      err.classList.remove('hidden');
      return;
    }

    const newTask = {
      id: task ? task.id : (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
      subjectId: selectedSubjectId,
      title,
      priority: selectedPriority,
      dueDate,
      estimatedMinutes,
      notes,
      status: task ? task.status : 'not-started',
      createdAt: task ? task.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    Storage.saveTask(newTask);
    State.emit(isEdit ? 'task.updated' : 'task.created', newTask);
    UI.showToast(isEdit ? 'Task updated' : 'Task forged!', 'success');
    UI.hideModal();
  };
}
