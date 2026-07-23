/**
 * Tab Manager Module
 * Handles tab switching and state
 */
class TabManager {
  constructor() {
    this.tabs = document.querySelectorAll('.tab-button');
    this.activeTab = null;
    this.init();
  }

  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.selectTab(e.target));
    });
    // Set first tab as active by default
    if (this.tabs.length > 0) {
      this.selectTab(this.tabs[0]);
    }
  }

  selectTab(tab) {
    // Remove active from all tabs
    this.tabs.forEach(t => t.classList.remove('active'));
    // Add active to selected tab
    tab.classList.add('active');
    this.activeTab = tab;
    
    // Dispatch custom event for tab content switching
    const tabName = tab.textContent.trim();
    window.dispatchEvent(new CustomEvent('tab-changed', { detail: { tabName } }));
  }

  getActiveTab() {
    return this.activeTab;
  }
}

export default TabManager;
