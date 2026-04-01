/**
 * StudyForge — ui.js
 * Global UI Helper Functions.
 */

import { Icons } from '../assets/icons.js';
import { State } from './state.js';
import { Storage } from './storage.js';

export const UI = {
  /**
   * Helper to set page title
   * @param {string} title 
   */
  setPageTitle(title) {
    document.title = `${title} — StudyForge`;
  },

  /**
   * Toast Notification System
   * @param {string} message 
   * @param {'success' | 'error' | 'info'} type 
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    let icon = Icons.check;
    if (type === 'error') icon = Icons.close;
    if (type === 'info') icon = Icons.timer;

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('toast--show'), 10);

    // Auto-remove after 3s
    setTimeout(() => {
      toast.classList.remove('toast--show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  /**
   * Universal Modal System
   * @param {string} title 
   * @param {string} contentHTML 
   * @param {string} actionsHTML 
   */
  showModal(title, contentHTML, actionsHTML = '') {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-box">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="btn--icon" id="modal-close-btn">${Icons.close}</button>
          </div>
          <div class="modal-body">
            ${contentHTML}
          </div>
          ${actionsHTML ? `<div class="modal-footer">${actionsHTML}</div>` : ''}
        </div>
      </div>
    `;

    const overlay = document.getElementById('modal-overlay');
    
    // Force reflow for animation
    void overlay.offsetWidth;
    overlay.classList.add('modal-overlay--open');

    // Close handlers
    const closeBtn = document.getElementById('modal-close-btn');
    closeBtn.onclick = () => this.hideModal();
    
    // Note: Clicking overlay does NOT close modal as per spec
  },

  hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    
    overlay.classList.remove('modal-overlay--open');
    setTimeout(() => {
      const root = document.getElementById('modal-root');
      root.innerHTML = '';
    }, 300);
  },

  /**
   * Confirmation Dialog Wrapper
   * @param {string} message 
   * @param {Function} onConfirm 
   */
  showConfirm(message, onConfirm) {
    const content = `<p>${message}</p>`;
    const actions = `
      <button class="btn btn--secondary" id="confirm-cancel">Cancel</button>
      <button class="btn btn--danger" id="confirm-yes">Yes, proceed</button>
    `;
    
    this.showModal('Are you sure?', content, actions);
    
    document.getElementById('confirm-cancel').onclick = () => this.hideModal();
    document.getElementById('confirm-yes').onclick = () => {
      onConfirm();
      this.hideModal();
    };
  },

  /**
   * Empty State Generator
   * @param {string} iconName 
   * @param {string} heading 
   * @param {string} body 
   * @param {string} ctaLabel 
   * @param {string} ctaId 
   * @returns {string} HTML string
   */
  renderEmptyState(iconName, heading, body, ctaLabel = '', ctaId = '') {
    return `
      <div class="empty-state animate-in">
        <div class="empty-state__icon">${Icons[iconName] || Icons.emptyFolder}</div>
        <h3 class="empty-state__heading">${heading}</h3>
        <p class="empty-state__body">${body}</p>
        ${ctaLabel ? `<button id="${ctaId}" class="btn btn--primary">${ctaLabel}</button>` : ''}
      </div>
    `;
  },

  /**
   * Sidebar Navigation Renderer
   */
  renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const prefs = Storage.getPreferences();
    const isCollapsed = prefs.sidebarCollapsed;
    
    // Apply initial state
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }

    const navItems = [
      { id: 'dashboard', label: 'Home', icon: 'dashboard', section: 'primary' },
      { id: 'tasks', label: 'Tasks', icon: 'tasks', section: 'primary' },
      { id: 'timer', label: 'Timer', icon: 'timer', section: 'primary' },
      { id: 'calendar', label: 'Calendar', icon: 'calendar', section: 'primary' },
      { label: 'More', section: 'divider' },
      { id: 'subjects', label: 'Subjects', icon: 'subjects', section: 'secondary' },
      { id: 'sessions', label: 'History', icon: 'sessions', section: 'secondary' },
      { id: 'stats', label: 'Stats', icon: 'stats', section: 'secondary' },
      { id: 'settings', label: 'Settings', icon: 'settings', section: 'secondary' }
    ];

    let html = '';
    navItems.forEach(item => {
      if (item.section === 'divider') {
        html += `<div class="sidebar-divider"></div><div class="nav-label">${item.label}</div>`;
        return;
      }

      const activeClass = State.currentPage === item.id ? 'active' : '';
      html += `
        <a href="#${item.id}" class="sidebar-link ${activeClass}" data-page="${item.id}">
          <span class="sidebar-icon">${Icons[item.icon]}</span>
          <span class="sidebar-label">${item.label}</span>
        </a>
      `;
    });

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-icon">${Icons.fire}</div>
        <span class="logo-text">STUDY FORGE</span>
      </div>

      <div class="sidebar-nav-container">
        <nav class="nav-list">
          ${html}
        </nav>
      </div>

      <div class="sidebar-bottom">
        <button id="sidebar-toggle" class="sidebar-toggle" title="Toggle Sidebar">
          ${isCollapsed ? Icons.chevronRight : Icons.chevronLeft}
        </button>
      </div>
    `;

    // Toggle Handler
    const toggleBtn = document.getElementById('sidebar-toggle');
    toggleBtn.onclick = () => {
      const nowCollapsed = sidebar.classList.toggle('collapsed');
      
      // Update pref
      const currentPrefs = Storage.getPreferences();
      currentPrefs.sidebarCollapsed = nowCollapsed;
      Storage.savePreferences(currentPrefs);

      // Update Icon
      toggleBtn.innerHTML = nowCollapsed ? Icons.chevronRight : Icons.chevronLeft;
      
      // Optional: Emit event if other components need to know
      State.emit('sidebar.toggled', nowCollapsed);
    };
  },

  /**
   * Modern Custom Dropdown Renderer
   * @param {string} containerId 
   * @param {Array} options [{ label, value, group? }]
   * @param {string} currentVal 
   * @param {Function} onChange 
   * @param {Object} config { label, fullWidth, placeholder }
   */
  renderCustomDropdown(containerId, options, currentVal, onChange, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentOption = options.find(o => String(o.value) === String(currentVal)) || options[0];
    
    // Group options
    const grouped = options.reduce((acc, opt) => {
      const group = opt.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(opt);
      return acc;
    }, {});

    const groups = Object.keys(grouped);

    container.innerHTML = `
      ${config.label ? `<label class="input-label">${config.label}</label>` : ''}
      <div class="custom-select ${config.fullWidth ? 'custom-select--full' : ''}" id="${containerId}-select">
        <div class="custom-select__trigger" id="${containerId}-trigger">
          <span class="custom-select__selected-text">${currentOption.label}</span>
          <span class="custom-select__arrow">${Icons.chevronDown}</span>
        </div>
        <div class="custom-select__options-container" id="${containerId}-options">
          ${groups.map(group => `
            ${group !== 'General' ? `<div class="custom-select__group-label">${group}</div>` : ''}
            ${grouped[group].map(opt => `
              <div class="custom-select__option ${String(opt.value) === String(currentVal) ? 'is-selected' : ''}" data-value="${opt.value}">
                ${opt.label}
                ${String(opt.value) === String(currentVal) ? `<span class="selection-check">${Icons.check}</span>` : ''}
              </div>
            `).join('')}
          `).join('')}
        </div>
      </div>
    `;

    const trigger = document.getElementById(`${containerId}-trigger`);
    const select = document.getElementById(`${containerId}-select`);

    trigger.onclick = (e) => {
      e.stopPropagation();
      
      // Close other dropdowns
      document.querySelectorAll('.custom-select').forEach(s => {
        if (s.id !== `${containerId}-select`) s.classList.remove('is-open');
      });

      const isOpen = select.classList.toggle('is-open');
      
      if (isOpen) {
        // Ensure dropdown is within viewport or scrollable
        const rect = select.getBoundingClientRect();
        const optionsList = document.getElementById(`${containerId}-options`);
        const listHeight = optionsList.offsetHeight || 300;
        const spaceBelow = window.innerHeight - rect.bottom;
        
        if (spaceBelow < listHeight && rect.top > listHeight) {
          select.classList.add('is-open--top');
        } else {
          select.classList.remove('is-open--top');
        }
      }
    };

    container.querySelectorAll('.custom-select__option').forEach(opt => {
      opt.onclick = () => {
        const val = opt.getAttribute('data-value');
        if (String(val) !== String(currentVal)) {
          onChange(val);
        }
        select.classList.remove('is-open');
      };
    });

    // Close on click outside
    if (!window._dropdownGlobalListener) {
      window._dropdownGlobalListener = true;
      document.addEventListener('click', () => {
        document.querySelectorAll('.is-open').forEach(s => s.classList.remove('is-open'));
      });
    }
  }
};
