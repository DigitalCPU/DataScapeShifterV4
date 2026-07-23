/**
 * Theme Manager Module
 * Handles theme switching and persistence
 */
class ThemeManager {
  constructor(defaultTheme = 'default') {
    this.currentTheme = defaultTheme;
    this.storageKey = 'shapeshifter-theme';
    this.loadTheme();
  }

  setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    this.currentTheme = themeName;
    localStorage.setItem(this.storageKey, themeName);
  }

  loadTheme() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.setTheme(saved);
    }
  }

  getTheme() {
    return this.currentTheme;
  }
}

export default ThemeManager;
