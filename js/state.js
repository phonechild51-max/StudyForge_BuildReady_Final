/**
 * StudyForge — state.js
 * Simple Pub/Sub event bus.
 * No runtime logic in this file.
 */

export const State = {
  currentPage: 'dashboard',
  activeTimerTaskId: null, // set when timer starts from a task
  
  _listeners: {},

  /**
   * Subscribe to an event
   * @param {string} event - E.g. 'task.created'
   * @param {Function} callback 
   */
  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  },

  /**
   * Unsubscribe from an event
   * @param {string} event 
   * @param {Function} callback 
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  },

  /**
   * Emit an event
   * @param {string} event 
   * @param {any} data 
   */
  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(callback => callback(data));
  },

  /**
   * Helper to set current page and emit navigation event
   * @param {string} pageName 
   */
  setCurrentPage(pageName) {
    this.currentPage = pageName;
    this.emit('navigation.changed', pageName);
  }
};
