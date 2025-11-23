/**
 * Event Log System for Vivarium Debugging
 * Tracks simulation events to help diagnose graphical errors and state issues
 */

class EventLog {
  constructor(maxEvents = 500) {
    this.events = [];
    this.maxEvents = maxEvents;
    this.enabled = true;
    this.filters = new Set(); // Empty = show all
  }

  /**
   * Log an event to the system
   * @param {string} type - Event type (creature, food, corpse, energy, reproduction, error, render)
   * @param {string} message - Human-readable message
   * @param {object} data - Additional data for debugging
   */
  log(type, message, data = {}) {
    if (!this.enabled) return;

    const event = {
      timestamp: Date.now(),
      frame: data.frame || 0,
      type,
      message,
      data
    };

    this.events.push(event);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log to console for debugging
    if (type === 'error') {
      console.error(`[${type}] ${message}`, data);
    } else {
      console.log(`[${type}] ${message}`, data);
    }
  }

  /**
   * Get recent events, optionally filtered
   * @param {number} count - Number of recent events to return
   * @param {string[]} types - Filter by event types (empty = all)
   * @returns {Array} Recent events
   */
  getRecent(count = 50, types = []) {
    let filtered = this.events;

    if (types.length > 0) {
      filtered = this.events.filter(e => types.includes(e.type));
    }

    return filtered.slice(-count);
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = [];
  }

  /**
   * Export events as JSON for analysis
   */
  export() {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Get event statistics
   */
  getStats() {
    const stats = {};
    this.events.forEach(e => {
      stats[e.type] = (stats[e.type] || 0) + 1;
    });
    return stats;
  }

  /**
   * Set which event types to filter
   */
  setFilters(types) {
    this.filters = new Set(types);
  }

  /**
   * Toggle event logging on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Create global event log instance
const eventLog = new EventLog();

// Make available globally
window.eventLog = eventLog;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventLog, eventLog };
}
