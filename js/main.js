/**
 * ShapeShifterV4 - Main Application Entry Point
 * Initializes terrain engine when DOM is ready
 */

import { TerrainEngine } from './terrain-engine.js';

class ShapeShifterApp {
  constructor() {
    this.terrainEngine = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    console.log('ShapeShifterV4 initializing...');

    const canvasContainer = document.querySelector('.center-body');
    
    if (!canvasContainer) {
      console.error('Canvas container not found');
      return;
    }

    // Initialize terrain engine
    this.terrainEngine = new TerrainEngine(canvasContainer);
    console.log('✓ Terrain engine initialized');
  }
}

// Initialize app
const app = new ShapeShifterApp();
