/**
 * StudyForge — subjects.js
 * Subject management page.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

const PRESET_COLORS = [
  '#F2B544', '#EF4444', '#10B981', '#3B82F6', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
];

/**
 * Initialize the Subjects page
 * @param {URLSearchParams} params 
 */
export function init(params) {
  UI.setPageTitle('Subjects');
  render();
  
  // Listen for storage changes
  State.on('subject.created', render);
  State.on('subject.deleted', render);
}

/**
 * Cleanup on page destruction
 */
export function destroy() {
  State.off('subject.created', render);
  State.off('subject.deleted', render);
}

/**
 * Render the full subjects page
 */
function render() {
  const container = document.getElementById('page-container');
  const subjects = Storage.getSubjects();
  const tasks = Storage.getTasks();

  let subjectsHtml = '';
  
  if (subjects.length === 0) {
    subjectsHtml = `
      <div class="page-content">
        ${UI.renderEmptyState(
          'subjects', 
          'No subjects yet', 
          'Creating subjects helps you organize your tasks and track your focus by category.',
          'Create First Subject',
          'btn-create-first-subject'
        )}
      </div>
    `;
  } else {
    subjectsHtml = `
      <div class="section-header">
        <div class="section-title-group">
          <h2>Your Subjects</h2>
          <span class="section-subtitle">${subjects.length} ${subjects.length === 1 ? 'category' : 'categories'} established</span>
        </div>
        <button id="btn-new-subject" class="btn btn--primary">
          ${Icons.add} New Subject
        </button>
      </div>
      
      <div class="page-content">
        <div class="subjects-grid">
          ${subjects.map(subject => {
            const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
            const completedCount = subjectTasks.filter(t => t.status === 'completed').length;
            const totalCount = subjectTasks.length;
            
            return `
              <div class="card card--highlight animate-in" style="border-left-color: ${subject.color}">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background: ${subject.color}; box-shadow: 0 0 5px ${subject.color}66"></span>
                    ${subject.name}
                  </h3>
                  <div class="card-actions">
                    <button class="btn--icon btn-edit" data-id="${subject.id}">${Icons.edit}</button>
                    <button class="btn--icon btn-delete" data-id="${subject.id}" style="color: var(--color-danger)">${Icons.delete}</button>
                  </div>
                </div>
                <div class="card-body">
                  <p class="text-muted" style="font-size: 13px; color: var(--color-text-muted)">
                    ${totalCount} Task${totalCount !== 1 ? 's' : ''} (${completedCount} completed)
                  </p>
                  <div class="progress-bar-container" style="height: 4px; background: var(--color-navy-surface); border-radius: 2px; margin-top: 8px; overflow: hidden;">
                    <div class="progress-bar-fill" style="height: 100%; width: ${totalCount === 0 ? 0 : (completedCount / totalCount) * 100}%; background: ${subject.color}; transition: width 0.3s ease;"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = subjectsHtml;

  // Event Listeners
  const newBtn = document.getElementById('btn-new-subject');
  if (newBtn) newBtn.onclick = () => openSubjectModal();
  
  const firstBtn = document.getElementById('btn-create-first-subject');
  if (firstBtn) firstBtn.onclick = () => openSubjectModal();

  // Edit/Delete handlers
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const subject = subjects.find(s => s.id === id);
      openSubjectModal(subject);
    };
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      UI.showConfirm(
        'All assigned tasks will also be deleted! Continue?',
        () => {
          Storage.deleteSubject(id);
          State.emit('subject.deleted', id);
          UI.showToast('Subject deleted', 'error');
        }
      );
    };
  });
}

/**
 * Subject Modal for Creation/Editing
 * @param {Subject | null} subject 
 */
function openSubjectModal(subject = null) {
  const isEdit = !!subject;
  let selectedColor = subject ? subject.color : PRESET_COLORS[0];

  const content = `
    <div class="form-group">
      <label for="subject-name">Subject Name</label>
      <input type="text" id="subject-name" class="input-field" placeholder="e.g. Mathematics" value="${subject ? subject.name : ''}" maxlength="30">
      <span id="name-error" class="field-error hidden"></span>
    </div>
    
    <div class="form-group">
      <label>Choose Color</label>
      <div class="color-palette" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 10px;">
        ${PRESET_COLORS.map(color => `
          <div class="color-swatch ${color === selectedColor ? 'selected' : ''}" 
               data-color="${color}" 
               style="height: 40px; background: ${color}; border-radius: 8px; cursor: pointer; border: 3px solid transparent; transition: all 0.2s;">
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const actions = `
    <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
    <button class="btn btn--primary" id="modal-save">${isEdit ? 'Update Subject' : 'Create Subject'}</button>
  `;

  UI.showModal(isEdit ? 'Edit Subject' : 'New Subject', content, actions);

  // Add styles for the color picker
  const style = document.createElement('style');
  style.id = 'modal-temp-style';
  style.textContent = `
    .color-swatch.selected { border-color: white !important; box-shadow: 0 0 10px rgba(255,255,255,0.3); transform: scale(1.05); }
  `;
  document.head.appendChild(style);

  // Modal event listeners
  document.getElementById('modal-cancel').onclick = () => UI.hideModal();
  
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(swatch => {
    swatch.onclick = () => {
      swatches.forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedColor = swatch.getAttribute('data-color');
    };
  });

  const saveBtn = document.getElementById('modal-save');
  saveBtn.onclick = () => {
    const name = document.getElementById('subject-name').value.trim();
    const errorSpan = document.getElementById('name-error');

    // Validation
    if (name.length < 2) {
      errorSpan.textContent = 'Subject name must be at least 2 characters.';
      errorSpan.classList.remove('hidden');
      return;
    }

    const subjects = Storage.getSubjects();
    const isDuplicate = subjects.some(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== (subject ? subject.id : null));
    if (isDuplicate) {
      errorSpan.textContent = 'A subject with this name already exists.';
      errorSpan.classList.remove('hidden');
      return;
    }

    const newSubject = {
      id: subject ? subject.id : (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
      name,
      color: selectedColor,
      createdAt: subject ? subject.createdAt : new Date().toISOString()
    };

    Storage.saveSubject(newSubject);
    State.emit('subject.created', newSubject);
    UI.showToast(isEdit ? 'Subject updated' : 'New subject created!', 'success');
    UI.hideModal();
  };
}
