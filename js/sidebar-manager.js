/**
 * Sidebar Manager Module
 * Handles sidebar collapse/expand functionality
 */
class SidebarManager {
  constructor() {
    this.sidebar = document.querySelector('.sidebar');
    this.toggleBtn = document.querySelector('.sidebar-toggle');
    this.isCollapsed = false;
    this.init();
  }

  init() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.sidebar.classList.add('collapsed');
    } else {
      this.sidebar.classList.remove('collapsed');
    }
  }

  collapse() {
    this.isCollapsed = true;
    this.sidebar.classList.add('collapsed');
  }

  expand() {
    this.isCollapsed = false;
    this.sidebar.classList.remove('collapsed');
  }
}

export default SidebarManager;
