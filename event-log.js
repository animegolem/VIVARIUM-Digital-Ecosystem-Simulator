// Minimal event log - just provides the global for code that references it
// The verbose logging UI has been removed for cleaner gameplay

class EventLog {
    constructor() {
        this.enabled = false; // Disabled by default now
    }
    
    log(type, message, data = {}) {
        // Only log errors to console
        if (type === 'error') {
            console.error(`[${type}] ${message}`, data);
        }
    }
    
    toggle() { this.enabled = !this.enabled; return this.enabled; }
    clear() {}
    getRecent() { return []; }
    export() { return '[]'; }
}

window.eventLog = new EventLog();
