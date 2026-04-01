/**
 * StudyForge — app.js
 * Main Entry Point and Hash Router.
 */

import { State } from './state.js';
import { UI } from './ui.js';

// Page Registry - Lazy Dynamic Imports
const PAGE_MODULES = {
  dashboard: () => import('./dashboard.js'),
  tasks:     () => import('./tasks.js'),
  subjects:  () => import('./subjects.js'),
  timer:     () => import('./timer.js'),
  sessions:  () => import('./sessions.js'),
  calendar:  () => import('./calendar.js'),
  stats:     () => import('./stats.js'),
  settings:  () => import('./settings.js')
};

let activePageModule = null;

/**
 * The core navigation engine
 */
async function navigate() {
  // 1. Cleanup previous page
  if (activePageModule && typeof activePageModule.destroy === 'function') {
    activePageModule.destroy();
  }

  // 2. Resolve target page from hash
  let hash = window.location.hash.slice(1) || 'dashboard';
  let [pageId, queryString] = hash.split('?');
  
  if (!PAGE_MODULES[pageId]) {
    pageId = 'dashboard';
  }

  // 3. Update Global State
  State.setCurrentPage(pageId);
  UI.renderSidebar(); // Highlight active link

  // 4. Loading State
  const container = document.getElementById('page-container');
  container.innerHTML = `<div class="page-loading"><div class="spinner"></div></div>`;

  try {
    // 5. Load and Initialize Page Module
    const module = await PAGE_MODULES[pageId]();
    activePageModule = module;
    
    // Clear spinner
    container.innerHTML = '';
    
    // Parse params if any
    const params = new URLSearchParams(queryString || '');
    
    // Call Page Init
    if (typeof module.init === 'function') {
      module.init(params);
    }

    // Scroll to top
    container.scrollTo(0, 0);

  } catch (err) {
    console.error(`Failed to load page: ${pageId}`, err);
    container.innerHTML = UI.renderEmptyState('error', 'Navigation Error', 'We had trouble loading that page. Please refresh or try another link.');
  }
}

/**
 * Initialize the application
 */
function initApp() {
  // Listen for hash changes
  window.addEventListener('hashchange', navigate);
  
  // Initial navigation
  navigate();

  // Global Logo injection
  UI.renderSidebar();

  console.log('StudyForge v1.0.0 Initialized');
}

// Kick off
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
