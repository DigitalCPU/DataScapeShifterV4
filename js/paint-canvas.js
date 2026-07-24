// js/paint-canvas.js
// Simple paint canvas that accumulates into a Float32Array heightmap
export class PaintCanvas {
  constructor(containerElement, opts = {}) {
    this.container = containerElement;
    this.resolution = opts.resolution || 256; // heightmap resolution (square)
    this.displayScale = opts.displayScale || 1; // how big canvas appears relative to resolution
    this.brushSize = opts.brushSize || 16; // pixels in heightmap space
    this.brushStrength = opts.brushStrength || 0.02; // how much each stamp adds (0..1)
    this.brushType = opts.brushType || 'soft'; // 'soft' | 'hard' | 'linear'
    this.isPainting = false;

    // Float buffer for precise accumulation
    this.width = this.height = this.resolution;
    this.heightData = new Float32Array(this.width * this.height);

    // visible canvas shown to user (for painting and feedback)
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    // scale up for display if desired
    this.canvas.style.width = `${this.width * this.displayScale}px`;
    this.canvas.style.height = `${this.height * this.displayScale}px`;
    this.canvas.style.touchAction = 'none';
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.classList.add('paint-canvas-overlay');
    this.ctx = this.canvas.getContext('2d');

    // Put the canvas into the container (center-body)
    this.container.appendChild(this.canvas);

    this._buildBrushKernels();
    this._attachEvents();

    // callback when heightmap changes: (heightData, w, h) => {}
    this.onChange = null;

    // initial render
    this._renderToCanvas();
  }

  _buildBrushKernels() {
    this.kernels = {};
    const maxRadius = Math.ceil(this.brushSize * 2);
    ['soft', 'hard', 'linear'].forEach(type => {
      const radius = this.brushSize;
      const size = radius * 2 + 1;
      const kernel = new Float32Array(size * size);
      const cx = radius, cy = radius;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - cx, dy = y - cy;
          const dist = Math.sqrt(dx*dx + dy*dy);
          let v = 0;
          if (type === 'hard') {
            v = dist <= radius ? 1 : 0;
          } else if (type === 'linear') {
            v = dist <= radius ? 1 - (dist / radius) : 0;
          } else { // soft (gaussian-like)
            if (dist <= radius) {
              v = Math.exp(- (dist*dist) / (2 * (radius/2)**2));
            } else v = 0;
          }
          kernel[y * size + x] = v;
        }
      }
      // normalize kernel max to 1 so strength controls final effect
      let max = 0; for (let i=0;i<kernel.length;i++) max = Math.max(max, kernel[i]);
      if (max > 0) for (let i=0;i<kernel.length;i++) kernel[i] /= max;
      this.kernels[type] = { kernel, size, radius };
    });
  }

  setBrush(size, strength, type) {
    this.brushSize = size;
    this.brushStrength = strength;
    this.brushType = type;
    this._buildBrushKernels();
  }

  _attachEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.floor(((clientX - rect.left) / rect.width) * this.width);
      const y = Math.floor(((clientY - rect.top) / rect.height) * this.height);
      return { x, y };
    };

    const down = (e) => { e.preventDefault(); this.isPainting = true; const p = getPos(e); this._stamp(p.x, p.y); };
    const move = (e) => { if (!this.isPainting) return; e.preventDefault(); const p = getPos(e); this._stamp(p.x, p.y); };
    const up = (e) => { this.isPainting = false; };

    this.canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    // support touch
    this.canvas.addEventListener('touchstart', down, {passive:false});
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('touchend', up);
  }

  _stamp(cx, cy) {
    const { kernel, size, radius } = this.kernels[this.brushType];
    const startX = cx - radius;
    const startY = cy - radius;
    for (let ky = 0; ky < size; ky++) {
      const y = startY + ky;
      if (y < 0 || y >= this.height) continue;
      for (let kx = 0; kx < size; kx++) {
        const x = startX + kx;
        if (x < 0 || x >= this.width) continue;
        const kVal = kernel[ky * size + kx];
        if (kVal <= 0) continue;
        const idx = y * this.width + x;
        // accumulate, clamp to [0,1] (saturating)
        this.heightData[idx] = Math.min(1, this.heightData[idx] + kVal * this.brushStrength);
      }
    }
    this._renderToCanvas();
    if (typeof this.onChange === 'function') {
      // you can throttle this if updates are too frequent
      this.onChange(this.heightData, this.width, this.height);
    }
  }

  // convert float buffer to grayscale image for display
  _renderToCanvas() {
    const img = this.ctx.createImageData(this.width, this.height);
    const data = img.data;
    for (let i = 0, j = 0; i < this.heightData.length; i++, j += 4) {
      const v = Math.max(0, Math.min(1, this.heightData[i]));
      const c = Math.round(v * 255);
      data[j] = c;
      data[j+1] = c;
      data[j+2] = c;
      data[j+3] = 255;
    }
    this.ctx.putImageData(img, 0, 0);
  }

  // helper to export as ImageData or Canvas if needed
  getImageDataCanvas() {
    return this.canvas;
  }

  // reset
  clear() {
    this.heightData.fill(0);
    this._renderToCanvas();
    if (typeof this.onChange === 'function') this.onChange(this.heightData, this.width, this.height);
  }
}
