/**
 * StudyForge — settings.js
 * User Preferences and Data Management.
 */

import { Storage } from './storage.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Icons } from '../assets/icons.js';

export function init() {
  UI.setPageTitle('Settings');
  renderConfig();
}

export function destroy() {}

function renderConfig() {
  const container = document.getElementById('page-container');
  const prefs = Storage.getPreferences();

  const html = `
    <div class="page-content">
      <div class="settings-container animate-in" style="max-width: 700px; margin: 0 auto;">
        <div class="section-header" style="margin-bottom: 32px;">
          <h2>Settings</h2>
          <span class="section-subtitle">Fine-tune your focus experience</span>
        </div>

        <!-- 1. Timer Defaults -->
        <section class="card" style="margin-bottom: 24px; padding: 24px;">
           <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
              ${Icons.timer} Timer & Breaks
           </h3>
           
           <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
              <div>
                 <label>Default Pomodoro (H:M:S)</label>
                 <div class="timer-input-group" style="justify-content: flex-start; margin-top: 8px;">
                    <input type="number" id="pref-pomo-h" class="timer-input-box" value="${Math.floor(prefs.defaultDurationSeconds / 3600)}" min="0" max="23" style="width: 60px; font-size: 16px; padding: 8px;">
                    <span class="timer-separator">:</span>
                    <input type="number" id="pref-pomo-m" class="timer-input-box" value="${Math.floor((prefs.defaultDurationSeconds % 3600) / 60)}" min="0" max="59" style="width: 60px; font-size: 16px; padding: 8px;">
                    <span class="timer-separator">:</span>
                    <input type="number" id="pref-pomo-s" class="timer-input-box" value="${prefs.defaultDurationSeconds % 60}" min="0" max="59" style="width: 60px; font-size: 16px; padding: 8px;">
                 </div>
              </div>
              <div>
                 <label>Default Break (H:M:S)</label>
                 <div class="timer-input-group" style="justify-content: flex-start; margin-top: 8px;">
                    <input type="number" id="pref-break-h" class="timer-input-box" value="${Math.floor(prefs.breakDurationSeconds / 3600)}" min="0" max="23" style="width: 60px; font-size: 16px; padding: 8px;">
                    <span class="timer-separator">:</span>
                    <input type="number" id="pref-break-m" class="timer-input-box" value="${Math.floor((prefs.breakDurationSeconds % 3600) / 60)}" min="0" max="59" style="width: 60px; font-size: 16px; padding: 8px;">
                    <span class="timer-separator">:</span>
                    <input type="number" id="pref-break-s" class="timer-input-box" value="${prefs.breakDurationSeconds % 60}" min="0" max="59" style="width: 60px; font-size: 16px; padding: 8px;">
                 </div>
              </div>
           </div>

           <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
              <div>
                 <label style="margin:0;">Enable Completion Sound</label>
                 <p class="text-muted" style="font-size: 12px; margin-top: 4px;">Play a gentle beep when the session ends</p>
              </div>
              <input type="checkbox" id="pref-sound" style="width: 20px; height: 20px;" ${prefs.soundEnabled ? 'checked' : ''}>
           </div>
           
           <div style="margin-top: 32px; text-align: right;">
              <button id="btn-save-prefs" class="btn btn--primary">Save Preferences</button>
           </div>
        </section>

        <!-- 2. Data Management -->
        <section class="card" style="margin-bottom: 24px; padding: 24px; border-left: 4px solid var(--color-amber);">
           <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
              ${Icons.refresh} Data Portability
           </h3>
           <p class="text-muted" style="margin-bottom: 20px; font-size: 14px;">StudyForge stores all data locally on your computer. You can back it up or move it to another device here.</p>
           
           <div style="display: flex; gap: 12px;">
              <button id="btn-export-backup" class="btn btn--secondary" style="flex: 1;">
                 ${Icons.add} Export Backup (JSON)
              </button>
              <button id="btn-import-backup" class="btn btn--secondary" style="flex: 1;">
                 ${Icons.edit} Import Backup
              </button>
              <input type="file" id="file-import" style="display: none;" accept=".json">
           </div>
        </section>

        <!-- 3. Advanced / Danger -->
        <section class="card" style="padding: 24px; border-left: 4px solid var(--color-danger);">
           <h3 style="margin-bottom: 20px; color: var(--color-danger); display: flex; align-items: center; gap: 8px;">
              ⚠️ Danger Zone
           </h3>
           <p class="text-muted" style="margin-bottom: 20px; font-size: 14px;">This will permanently wipe all subjects, tasks, and history. This action cannot be undone.</p>
           <button id="btn-reset-app" class="btn btn--danger">Reset All Application Data</button>
        </section>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: var(--color-text-muted);">
           <p>StudyForge Desktop v1.0.0 — Offline Edition</p>
           <p style="margin-top: 4px;">Designed with Focus in Mind</p>
        </div>
      </div>
    </div>  </div>
  `;

  container.innerHTML = html;

  // Prefs Handlers
  document.getElementById('btn-save-prefs').onclick = () => {
    const ph = parseInt(document.getElementById('pref-pomo-h').value) || 0;
    const pm = parseInt(document.getElementById('pref-pomo-m').value) || 0;
    const ps = parseInt(document.getElementById('pref-pomo-s').value) || 0;
    
    const bh = parseInt(document.getElementById('pref-break-h').value) || 0;
    const bm = parseInt(document.getElementById('pref-break-m').value) || 0;
    const bs = parseInt(document.getElementById('pref-break-s').value) || 0;

    const sound = document.getElementById('pref-sound').checked;

    const pomoSecs = (ph * 3600) + (pm * 60) + ps;
    const breakSecs = (bh * 3600) + (bm * 60) + bs;

    if (pomoSecs <= 0) {
      UI.showToast('Pomodoro must be at least 1 second', 'error');
      return;
    }

    const newPrefs = {
      ...prefs,
      defaultDurationMinutes: Math.floor(pomoSecs / 60),
      defaultDurationSeconds: pomoSecs,
      breakDurationMinutes: Math.floor(breakSecs / 60),
      breakDurationSeconds: breakSecs,
      soundEnabled: sound
    };

    Storage.savePreferences(newPrefs);
    UI.showToast('Preferences updated', 'success');
  };

  // Export
  document.getElementById('btn-export-backup').onclick = () => {
    const data = Storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyForge_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    UI.showToast('Backup exported!', 'success');
  };

  // Import
  const fileInput = document.getElementById('file-import');
  document.getElementById('btn-import-backup').onclick = () => fileInput.click();
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = Storage.importAll(event.target.result);
      if (success) {
        UI.showToast('Backup restored! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        UI.showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset
  document.getElementById('btn-reset-app').onclick = () => {
    UI.showConfirm('EVERYTHING will be deleted. Are you absolutely certain?', () => {
      Storage.clearAll();
      UI.showToast('Application reset.', 'info');
      setTimeout(() => window.location.href = '#dashboard', 1000);
    });
  };
}
