/**
 * StudyForge — sessions.js
 * Focus session history and logs.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

let currentFilter = 'all';

/**
 * Initialize History Page
 * @param {URLSearchParams} params 
 */
export function init(params) {
  UI.setPageTitle('History');
  currentFilter = params.get('filter') || 'all';
  render();
  
  State.on('session.completed', render);
}

/**
 * Cleanup
 */
export function destroy() {
  State.off('session.completed', render);
}

/**
 * Main Render
 */
function render() {
  const container = document.getElementById('page-container');
  const sessions = Storage.getSessions();
  const subjects = Storage.getSubjects();
  const tasks = Storage.getTasks();

  // Filter sessions
  let filteredSessions = [...sessions];
  if (currentFilter !== 'all') {
    if (currentFilter.startsWith('sub_')) {
      const subId = currentFilter.replace('sub_', '');
      filteredSessions = filteredSessions.filter(s => s.subjectId === subId);
    } else {
      filteredSessions = filteredSessions.filter(s => s.mode === currentFilter);
    }
  }

  // Pre-process date grouping
  const groups = {};
  filteredSessions.forEach(s => {
    const date = s.endTime.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(s);
  });

  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  let html = `
    <div class="section-header">
      <div class="section-title-group">
        <h2>Focus History</h2>
      </div>
      <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
        <div class="filter-bar" id="filter-dropdown-container">
          <!-- Custom Dropdown populated by UI.renderCustomDropdown -->
        </div>
        <button id="btn-export-data" class="btn btn--secondary">${Icons.refresh} Export CSV</button>
        <button id="btn-clear-history" class="btn btn--danger">${Icons.delete} Clear All</button>
      </div>
    </div>
  `;

  if (filteredSessions.length === 0) {
    html += `
      <div class="page-content">
        ${UI.renderEmptyState('sessions', 'No logs found', 'Finish a timer session to see your focus history here.')}
      </div>
    `;
  } else {
    html += `
      <div class="page-content">
        <div class="history-list" style="display: flex; flex-direction: column; gap: 40px; margin-top: 24px;">
          ${dates.map(date => {
            const dateSessions = groups[date];
            const dayFocus = dateSessions.reduce((acc, current) => acc + current.durationMinutes, 0);
            
            return `
              <div class="date-group animate-in">
                <h4 style="margin-bottom: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
                   <span>${formatDate(date)}</span>
                   <span style="color: var(--color-amber);">${dayFocus}m Focus</span>
                </h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  ${dateSessions.map(sess => {
                    const sub = subjects.find(s => s.id === sess.subjectId);
                    const task = tasks.find(t => t.id === sess.taskId);
                    return `
                      <div class="card session-card" style="padding: 16px; border-style: ${sess.completed ? 'solid' : 'dashed'}; border-radius: 12px;">
                        <div style="display:flex; justify-content: space-between; align-items: flex-start;">
                           <div style="flex-grow: 1; min-width: 0; padding-right: 16px;">
                              <div style="display:flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                 <span style="width: 8px; height: 8px; border-radius: 50%; background: ${sub ? sub.color : '#666'}"></span>
                                 <span style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sub ? sub.name : 'General'}</span>
                                 <span class="badge" style="background: rgba(255,255,255,0.05); flex-shrink: 0;">${sess.mode.toUpperCase()}</span>
                              </div>
                              ${task ? `<p style="margin-bottom: 4px; font-size: 14px;">📝 ${task.title}</p>` : ''}
                              ${sess.completionNote ? `<p class="text-muted" style="font-size: 13px; font-style: italic;">"${sess.completionNote}"</p>` : ''}
                           </div>
                           <div style="display: flex; align-items: flex-start; gap: 16px; flex-shrink: 0;">
                              <div style="text-align: right;">
                                 <div style="font-size: 18px; font-weight: 700; color: var(--color-amber);">${sess.durationMinutes}m</div>
                                 <div style="font-size: 11px; color: var(--color-text-muted);">${sess.endTime.split('T')[1].slice(0, 5)}</div>
                                 <div style="margin-top: 4px;">${'⭐'.repeat(sess.focusRating || 0)}</div>
                              </div>
                              <button class="btn--icon btn-delete-session" data-id="${sess.id}" title="Delete Log" style="opacity: 0.3; transition: opacity 0.2s; margin-top: -4px;">
                                ${Icons.delete}
                              </button>
                           </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // --- Initialize Custom Dropdown ---
  const dropdownOptions = [
    { label: 'All Logs', value: 'all' },
    { label: 'Study', value: 'study', group: 'By Mode' },
    { label: 'Questions', value: 'questions', group: 'By Mode' },
    { label: 'Revision', value: 'revision', group: 'By Mode' },
    ...subjects.map(s => ({ label: s.name, value: `sub_${s.id}`, group: 'By Subject' }))
  ];

  UI.renderCustomDropdown('filter-dropdown-container', dropdownOptions, currentFilter, (val) => {
    currentFilter = val;
    window.location.hash = `#sessions?filter=${currentFilter}`;
    render(); // Re-render with new filter
  });

  // --- Event Listeners ---

  document.getElementById('btn-export-data').onclick = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Subject,Mode,Duration,Rating,Note\n" + 
      sessions.map(s => {
        const sub = subjects.find(sb => sb.id === s.subjectId);
        return `${s.endTime.split('T')[0]},${sub ? sub.name : 'None'},${s.mode},${s.durationMinutes},${s.focusRating},"${(s.completionNote || '').replace(/"/g, '""')}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StudyForge_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    UI.showToast('History exported as CSV', 'success');
  };

  const btnClear = document.getElementById('btn-clear-history');
  if (btnClear) {
    btnClear.onclick = () => {
      UI.showConfirm('This will permanently delete all your focus logs. Continue?', () => {
        Storage.clearSessions();
        UI.showToast('History cleared', 'success');
        render();
      });
    };
  }

  // Individual delete buttons
  document.querySelectorAll('.btn-delete-session').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      UI.showConfirm('Delete this focus log?', () => {
        Storage.deleteSession(id);
        UI.showToast('Log deleted', 'success');
        render();
      });
    };
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}
