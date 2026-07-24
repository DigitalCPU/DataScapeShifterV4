/**
 * ShapeShifterV4 - Main Application Entry Point
 * Initializes terrain engine when DOM is ready
 */

import { TerrainEngine } from './terrain-engine.js';
import { PaintCanvas } from './paint-canvas.js';

class ShapeShifterApp {
  constructor() {
    this.terrainEngine = null;
    this.painter = null;
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

    // Initialize painter overlay (heightmap resolution should match terrain sampling resolution)
    this.painter = new PaintCanvas(canvasContainer, {
      resolution: 256,
      displayScale: 2,
      brushSize: 12,
      brushStrength: 0.03
    });

    // When painting changes, update the terrain (consider throttling for performance)
    this.painter.onChange = (heightData, w, h) => {
      this.terrainEngine.updateHeightmapFromArray(heightData, w, h);
    };

    console.log('✓ Terrain engine and painter initialized');
  }
}

// Initialize app
const app = new ShapeShifterApp();
