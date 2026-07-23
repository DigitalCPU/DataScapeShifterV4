/**
 * ShapeShifterV4 Main Module
 * Orchestrates initialization of all components
 */
import ThemeManager from './theme-manager.js';
import SidebarManager from './sidebar-manager.js';
import TabManager from './tab-manager.js';

class App {
  constructor() {
    this.themeManager = new ThemeManager('default');
    this.sidebarManager = new SidebarManager();
    this.tabManager = new TabManager();
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('ShapeShifterV4 initialized');
  }

  setupEventListeners() {
    // Listen for settings button clicks
    const settingsBtn = document.querySelector('.header-settings-button');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.toggleSettings());
    }
  }

  toggleSettings() {
    // Settings toggle logic here
    console.log('Settings toggled');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}
