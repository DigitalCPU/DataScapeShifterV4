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
    
    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a2942);

    // Camera setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
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
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.setupLighting();

    // Create terrain
    this.createTerrainMesh();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

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
    const width = 256;
    const height = 256;
    const geometry = new THREE.PlaneGeometry(512, 512, width - 1, height - 1);
    geometry.rotateX(-Math.PI / 2);

    // Generate heightmap
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      let noise = 0;
      for (let octave = 0; octave < 4; octave++) {
        const frequency = Math.pow(2, octave);
        const amplitude = Math.pow(0.5, octave);
        noise += amplitude * Math.sin((x / 100) * frequency) * Math.cos((z / 100) * frequency);
      }
      
      positions[i + 1] = noise * 50;
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

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

export { TerrainEngine };
