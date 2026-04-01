/**
 * StudyForge — stats.js
 * Visualizing focus data and trends.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

export function init() {
  UI.setPageTitle('Stats');
  renderResults();
  
  State.on('session.completed', renderResults);
}

export function destroy() {
  State.off('session.completed', renderResults);
}

function renderResults() {
  const container = document.getElementById('page-container');
  const sessions = Storage.getSessions();
  const subjects = Storage.getSubjects();

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="page-content">
        ${UI.renderEmptyState('stats', 'No data collected', 'Complete your first study session to see insights and trends.')}
      </div>
    `;
    return;
  }

  // 1. Core Metrics
  const totalMinutes = sessions.reduce((acc, current) => acc + current.durationMinutes, 0);
  const avgRating = (sessions.reduce((acc, current) => acc + (current.focusRating || 0), 0) / sessions.length).toFixed(1);
  const sessionsCount = sessions.length;

  // 2. Trend Data (Last 7 Days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    last7Days.push({
      dateStr: dayStr,
      shortLabel: d.toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: sessions.filter(s => s.endTime.startsWith(dayStr)).reduce((acc, c) => acc + c.durationMinutes, 0)
    });
  }
  const maxDayMinutes = Math.max(...last7Days.map(d => d.minutes), 60);

  // 3. Subject-wise breakdown
  const subjectStats = subjects.map(s => {
    const subSessions = sessions.filter(sess => sess.subjectId === s.id);
    return {
      name: s.name,
      color: s.color,
      minutes: subSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0),
      count: subSessions.length
    };
  }).sort((a,b) => b.minutes - a.minutes);

  const html = `
    <div class="page-content">
      <div class="stats-container animate-in">
        <div class="section-header" style="margin-bottom: 24px;">
          <h2>Focus Analytics</h2>
          <span class="section-subtitle">Visualizing your study habits and performance</span>
        </div>

        <div class="card card--highlight" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 32px; border-left-color: var(--color-amber); margin-bottom: 40px; text-align: center;">
           <div>
              <p class="text-muted" style="font-size: 13px;">Total Focus Time</p>
              <div style="font-size: 32px; font-weight: 700; margin-top: 8px;">${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</div>
           </div>
           <div style="border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border);">
              <p class="text-muted" style="font-size: 13px;">Avg. Focus Rating</p>
              <div style="font-size: 32px; font-weight: 700; margin-top: 8px;">${avgRating} <span style="font-size: 16px;">/ 5</span></div>
           </div>
           <div>
              <p class="text-muted" style="font-size: 13px;">Total Sessions</p>
              <div style="font-size: 32px; font-weight: 700; margin-top: 8px;">${sessionsCount}</div>
           </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
           
           <!-- Trend Chart -->
           <section>
              <h3 style="margin-bottom: 20px;">7-Day Focus Trend</h3>
              <div class="card" style="height: 300px; display: flex; align-items: flex-end; justify-content: space-between; padding: 32px;">
                 ${last7Days.map(day => {
                   const heightPct = (day.minutes / maxDayMinutes) * 100;
                   return `
                      <div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                         <div style="width: 24px; height: ${heightPct}%; min-height: 4px; background: var(--color-amber); border-radius: 4px; position: relative; transition: height 0.5s;">
                            <div class="chart-tooltip" style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: black; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; opacity: 0;">${day.minutes}m</div>
                         </div>
                         <span class="text-muted" style="font-size: 12px;">${day.shortLabel}</span>
                      </div>
                   `;
                 }).join('')}
              </div>
           </section>

           <!-- Subject Performance -->
           <section>
              <h3 style="margin-bottom: 20px;">Subject Performance</h3>
              <div class="card" style="display: flex; flex-direction: column; gap: 20px; padding: 32px;">
                 ${subjectStats.length === 0 ? `<p class="text-muted">No subject data.</p>` : subjectStats.map(s => {
                   const pct = totalMinutes === 0 ? 0 : (s.minutes / totalMinutes) * 100;
                   return `
                      <div>
                         <div style="display:flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${s.name}</span>
                            <span class="text-muted">${s.minutes}m (${s.count} sessions)</span>
                         </div>
                         <div style="height: 8px; background: var(--color-navy-surface); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${pct}%; background: ${s.color};"></div>
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
}
