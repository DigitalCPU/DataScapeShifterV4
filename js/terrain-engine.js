/**
 * Terrain Engine - Three.js based 3D terrain rendering
 * Handles scene setup, rendering, and basic terrain mesh creation
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

class TerrainEngine {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.terrain = null;
    this.resizeObserver = null;

    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a2942);

    // Camera setup
    // Use a temporary size, the real size will be set by onWindowResize()
    const width = Math.max(1, this.container.clientWidth || window.innerWidth);
    const height = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      10000
    );
    this.camera.position.set(100, 150, 100);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);

    // Append renderer DOM element
    this.container.appendChild(this.renderer.domElement);

    // Ensure correct initial size and respond to layout changes
    this.onWindowResize();

    // Observe container size changes so canvas always matches
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.onWindowResize());
      this.resizeObserver.observe(this.container);
    } else {
      // Fallback: listen to window resize
      window.addEventListener('resize', () => this.onWindowResize());
    }

    // Lighting
    this.setupLighting();

    // Create terrain (default resolution and size)
    this.createTerrainMesh();

    // Start render loop
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 300, 100);
    this.scene.add(directionalLight);
  }

  createTerrainMesh() {
    // Mesh resolution should map to your heightmap resolution if possible.
    const widthSegments = 255; // match 256 heightmap resolution -> 255 segments
    const heightSegments = 255;
    const width = 512;
    const height = 512;

    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    geometry.rotateX(-Math.PI / 2);

    // Generate an initial height (optional small noise)
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] = 0; // start flat
    }

    geometry.computeVertexNormals();
    positionAttribute.needsUpdate = true;

    const material = new THREE.MeshPhongMaterial({
      color: 0x4a7c59,
      emissive: 0x1a3a2a,
      shininess: 30
    });

    this.terrain = new THREE.Mesh(geometry, material);
    this.scene.add(this.terrain);
  }

  // Render loop
  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  onWindowResize() {
    // Prefer container size; if zero, fall back to window size
    let width = this.container.clientWidth || window.innerWidth;
    let height = this.container.clientHeight || window.innerHeight;

    // Guard against zero sizes
    if (width === 0) width = Math.max(1, window.innerWidth);
    if (height === 0) height = Math.max(1, window.innerHeight);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
  }

  // Map a float heightmap array (0..1) to the terrain mesh vertices.
  // heightArray: Float32Array or Array with length hmapWidth * hmapHeight
  // hmapWidth, hmapHeight: dimensions of the height array
  // heightScale: how tall the terrain gets (default 50)
  updateHeightmapFromArray(heightArray, hmapWidth, hmapHeight, heightScale = 50) {
    if (!this.terrain || !this.terrain.geometry) return;
    const geometry = this.terrain.geometry;
    const posAttr = geometry.getAttribute('position');
    const vertexCount = posAttr.count;
    const pos = posAttr.array;

    // Plane geometry parameters (used to map vertex x/z to [0,1])
    const planeWidth = (geometry.parameters && geometry.parameters.width) || 512;
    const planeHeight = (geometry.parameters && geometry.parameters.height) || 512;

    for (let i = 0; i < vertexCount; i++) {
      const xi = pos[i * 3 + 0];
      const zi = pos[i * 3 + 2];

      // Map from plane coordinates (-w/2..+w/2) to u/v in [0..1]
      const u = (xi / planeWidth) + 0.5;
      const v = (zi / planeHeight) + 0.5;

      // Convert to pixel indices in the heightmap
      const px = Math.floor(u * (hmapWidth - 1));
      const py = Math.floor((1 - v) * (hmapHeight - 1)); // flip v if needed

      const clampedPx = Math.max(0, Math.min(hmapWidth - 1, px));
      const clampedPy = Math.max(0, Math.min(hmapHeight - 1, py));
      const idx = clampedPy * hmapWidth + clampedPx;
      const h = heightArray[idx] || 0;

      pos[i * 3 + 1] = h * heightScale;
    }

    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  // Optional cleanup if you later destroy the engine
  dispose() {
    if (this.resizeObserver) {
      try { this.resizeObserver.disconnect(); } catch (e) { /* ignore */ }
      this.resizeObserver = null;
    } else {
      window.removeEventListener('resize', () => this.onWindowResize());
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
  }
}

export { TerrainEngine };
