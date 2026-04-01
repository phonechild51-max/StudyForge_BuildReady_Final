/**
 * StudyForge — dashboard.js
 * Summary Stats and Quick Actions.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

/**
 * Initialize Dashboard
 * @param {URLSearchParams} params 
 */
export function init(params) {
  UI.setPageTitle('Dashboard');
  render();
  
  State.on('task.created', render);
  State.on('task.updated', render);
  State.on('session.completed', render);
}

/**
 * Cleanup
 */
export function destroy() {
  State.off('task.created', render);
  State.off('task.updated', render);
  State.off('session.completed', render);
}

/**
 * Main Render
 */
function render() {
  const container = document.getElementById('page-container');
  const tasks = Storage.getTasks();
  const subjects = Storage.getSubjects();
  const sessions = Storage.getSessions();
  const today = new Date().toISOString().split('T')[0];

  // Calculations
  const todaySessions = sessions.filter(s => s.endTime.startsWith(today));
  const focusMinutesToday = todaySessions.reduce((acc, current) => acc + (current.durationMinutes || 0), 0);
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const overdueTasksCount = tasks.filter(t => t.dueDate < today && t.dueDate !== '' && t.status !== 'completed').length;
  const nextTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);

  // Time-of-day Greeting
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  const html = `
    <div class="page-content">
      <div class="dashboard-root animate-in">
        <div class="section-header" style="margin-bottom: 32px; padding-left: 0; padding-right: 0;">
          <div>
            <h1 style="font-size: 28px;">${greeting}, Explorer</h1>
            <p class="text-muted">You have spent <b>${focusMinutesToday}m</b> focusing today. Keep it up!</p>
          </div>
          <div style="display: flex; gap: 12px;">
             <button id="btn-quick-task" class="btn btn--secondary">${Icons.add} Quick Task</button>
             <a href="#timer" class="btn btn--primary">${Icons.play} Start Timer</a>
          </div>
        </div>

        <!-- Stat Cards -->
        <div class="stats-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
          <div class="card card--highlight" style="border-left-color: var(--color-amber);">
            <p class="section-subtitle">Today's Focus</p>
            <div style="display:flex; align-items: baseline; gap: 8px; margin-top: 8px;">
              <span style="font-size: 32px; font-weight: 700;">${focusMinutesToday}</span>
              <span class="text-muted">mins</span>
            </div>
          </div>
          
          <div class="card card--highlight" style="border-left-color: var(--color-success);">
            <p class="section-subtitle">Tasks Completed</p>
            <div style="display:flex; align-items: baseline; gap: 8px; margin-top: 8px;">
              <span style="font-size: 32px; font-weight: 700;">${completedTasksCount}</span>
              <span class="text-muted">total</span>
            </div>
          </div>

          <div class="card card--highlight" style="border-left-color: var(--color-danger);">
            <p class="section-subtitle">Overdue</p>
            <div style="display:flex; align-items: baseline; gap: 8px; margin-top: 8px;">
              <span style="font-size: 32px; font-weight: 700;">${overdueTasksCount}</span>
              <span class="text-muted">tasks</span>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px;">
          <!-- High Priority / Next Tasks -->
          <section>
            <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3>Up Next</h3>
              <a href="#tasks" style="font-size: 13px; color: var(--color-amber);">View All →</a>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${nextTasks.length === 0 ? `
                <div class="card" style="padding: 32px; text-align: center; border-style: dashed;">
                  <p class="text-muted">No pending tasks. Start by creating one!</p>
                </div>
              ` : nextTasks.map(t => {
                const sub = subjects.find(s => s.id === t.subjectId);
                return `
                  <div class="card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                       <div style="width: 10px; height: 10px; border-radius: 50%; background: ${sub ? sub.color : '#666'}"></div>
                       <span>${t.title}</span>
                    </div>
                    <a href="#timer?taskId=${t.id}" class="btn--icon" style="color: var(--color-amber)">${Icons.play}</a>
                  </div>
                `;
              }).join('')}
            </div>
          </section>

          <!-- Subject Breakdown -->
          <section>
            <div style="margin-bottom: 16px;">
              <h3>Subject Distribution</h3>
            </div>
            <div class="card">
              ${subjects.length === 0 ? `
                <p class="text-muted" style="text-align: center;">No subjects created.</p>
              ` : subjects.map(s => {
                const subTasks = tasks.filter(t => t.subjectId === s.id);
                const percentage = tasks.length === 0 ? 0 : (subTasks.length / tasks.length) * 100;
                return `
                  <div style="margin-bottom: 16px;">
                    <div style="display:flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                      <span>${s.name}</span>
                      <span class="text-muted">${subTasks.length} tasks</span>
                    </div>
                    <div style="height: 6px; background: var(--color-navy-surface); border-radius: 3px; overflow: hidden;">
                      <div style="height: 100%; width: ${percentage}%; background: ${s.color};"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Add Quick Task Handler
  const quickTaskBtn = document.getElementById('btn-quick-task');
  if (quickTaskBtn) {
    quickTaskBtn.onclick = async () => {
      const { init: taskInit } = await import('./tasks.js');
      // Directly trigger the tasks.js modal logic
      // But Since we are on dashboard, let's just navigate to tasks with a param
      window.location.hash = '#tasks?action=new';
    };
  }
}
