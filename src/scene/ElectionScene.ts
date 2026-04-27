/**
 * Election Scene — Main Three.js 3D scene orchestrator.
 *
 * Creates a procedural 3D election journey visualisation
 * using only algorithmic geometry — no external assets.
 * All shapes are generated from math primitives.
 *
 * @module scene/ElectionScene
 */

import * as THREE from 'three';
import { JourneyStageId } from '../types/index';
import { ELECTION_STAGES } from '../data/election-stages';
import { prefersReducedMotion } from '../utils/a11y';
import { store } from '../state/store';

/** Stage node colours matching the Indian palette. */
const STAGE_COLOURS: Record<JourneyStageId, number> = {
  [JourneyStageId.ELIGIBILITY]: 0xff9933, // Saffron
  [JourneyStageId.REGISTRATION]: 0xffffff, // White
  [JourneyStageId.CANDIDATES]: 0x138808, // Green
  [JourneyStageId.VOTING_METHODS]: 0x000080, // Navy
  [JourneyStageId.TIMELINE]: 0xff9933, // Saffron
  [JourneyStageId.POLLING_DAY]: 0x138808, // Green
  [JourneyStageId.POST_VOTE]: 0x000080, // Navy
};

/** Metadata for a 3D stage node. */
interface StageNode {
  stageId: JourneyStageId;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  glowMesh: THREE.Mesh;
  label: THREE.Sprite;
}

/**
 * The main 3D election journey scene.
 *
 * Renders 7 interactive stage nodes connected by a procedural path.
 * Supports navigation, hover effects, and synchronises with the
 * accessible DOM fallback via the global state store.
 */
export class ElectionScene {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly raycaster: THREE.Raycaster;
  private readonly mouse: THREE.Vector2;
  private readonly isReducedMotion: boolean;
  private stageNodes: StageNode[];
  private particles: THREE.Points;
  private animationId: number;
  private targetCameraPos: THREE.Vector3;

  /**
   * Create and mount the Election Scene into the given container.
   *
   * @param container - The HTMLElement to render the WebGL canvas into.
   * @throws {Error} If WebGL is unavailable or the renderer fails to initialise.
   */
  constructor(container: HTMLElement) {
    this.isReducedMotion = prefersReducedMotion();
    this.stageNodes = [];
    this.animationId = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.targetCameraPos = new THREE.Vector3(0, 2, 12);

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.035);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    this.camera.position.copy(this.targetCameraPos);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Build scene content
    this.addLighting();
    this.stageNodes = this.createStageNodes();
    this.createPathLine();
    this.particles = this.createParticleField();

    // Events
    this.setupEventListeners(container);

    // Subscribe to state
    store.subscribe((state) => {
      this.focusOnStage(state.currentStage);
    });

    // Start render loop
    this.animate();
  }

  /**
   * Add lighting to the scene.
   * Uses ambient + directional for clean visibility.
   */
  private addLighting(): void {
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 5);
    this.scene.add(directional);

    const point = new THREE.PointLight(0xff9933, 0.5, 20);
    point.position.set(0, 5, 0);
    this.scene.add(point);
  }

  /**
   * Create 7 procedural stage nodes arranged in a curved path.
   *
   * Each node is a dodecahedron with a glow sphere and text label.
   *
   * @returns Array of stage node objects.
   */
  private createStageNodes(): StageNode[] {
    const nodes: StageNode[] = [];

    ELECTION_STAGES.forEach((stage, index) => {
      // Position nodes in a gentle S-curve
      const t = index / (ELECTION_STAGES.length - 1);
      const x = (t - 0.5) * 16;
      const y = Math.sin(t * Math.PI * 2) * 1.5;
      const z = Math.cos(t * Math.PI) * 2;
      const position = new THREE.Vector3(x, y, z);

      // Main mesh: dodecahedron (procedural, 12-sided)
      const geometry = new THREE.DodecahedronGeometry(0.5, 0);
      const material = new THREE.MeshPhongMaterial({
        color: STAGE_COLOURS[stage.id],
        emissive: STAGE_COLOURS[stage.id],
        emissiveIntensity: 0.3,
        shininess: 80,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.userData = { stageId: stage.id, index };
      this.scene.add(mesh);

      // Glow sphere (larger, transparent)
      const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: STAGE_COLOURS[stage.id],
        transparent: true,
        opacity: 0.1,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(position);
      this.scene.add(glowMesh);

      // Text label sprite (procedurally generated via canvas)
      const label = this.createTextSprite(stage.title, STAGE_COLOURS[stage.id]);
      label.position.copy(position);
      label.position.y += 1.0;
      this.scene.add(label);

      nodes.push({ stageId: stage.id, mesh, position, glowMesh, label });
    });

    return nodes;
  }

  /**
   * Create a text sprite using Canvas2D rendering.
   * No font files required — uses system fonts.
   *
   * @param text - Label text.
   * @param colour - Text colour as hex number.
   * @returns Three.js Sprite with the text texture.
   */
  private createTextSprite(text: string, colour: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Return an empty sprite if 2D context is unavailable
      return new THREE.Sprite(new THREE.SpriteMaterial());
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Convert hex to CSS
    const hex = `#${colour.toString(16).padStart(6, '0')}`;
    ctx.fillStyle = hex;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 0.75, 1);

    return sprite;
  }

  /**
   * Create a path line connecting all stage nodes.
   *
   * @returns Three.js Line object.
   */
  private createPathLine(): THREE.Line {
    const points = this.stageNodes.map((n) => n.position);
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
    const material = new THREE.LineBasicMaterial({
      color: 0x333366,
      transparent: true,
      opacity: 0.5,
    });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    return line;
  }

  /**
   * Create a procedural particle field for background atmosphere.
   *
   * @returns Three.js Points object.
   */
  private createParticleField(): THREE.Points {
    const count = 500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x6666aa,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    return points;
  }

  /**
   * Smoothly move the camera to focus on a specific stage.
   *
   * @param stageId - Target stage ID.
   */
  focusOnStage(stageId: JourneyStageId): void {
    const node = this.stageNodes.find((n) => n.stageId === stageId);
    if (!node) {
      return;
    }

    this.targetCameraPos = new THREE.Vector3(
      node.position.x,
      node.position.y + 2,
      node.position.z + 6,
    );

    // Highlight active node
    this.stageNodes.forEach((n) => {
      const mat = n.mesh.material as THREE.MeshPhongMaterial;
      const glowMat = n.glowMesh.material as THREE.MeshBasicMaterial;
      if (n.stageId === stageId) {
        mat.emissiveIntensity = 0.6;
        glowMat.opacity = 0.25;
      } else {
        mat.emissiveIntensity = 0.2;
        glowMat.opacity = 0.08;
      }
    });
  }

  /**
   * Main animation loop.
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Smooth camera interpolation
    this.camera.position.lerp(this.targetCameraPos, 0.03);
    this.camera.lookAt(0, 0, 0);

    if (!this.isReducedMotion) {
      // Gentle rotation of stage nodes
      const time = Date.now() * 0.001;
      this.stageNodes.forEach((node, i) => {
        node.mesh.rotation.y = time * 0.3 + i * 0.5;
        node.mesh.rotation.x = Math.sin(time * 0.2 + i) * 0.1;
      });

      // Particle drift
      this.particles.rotation.y = time * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Set up mouse/keyboard event listeners.
   *
   * @param container - The DOM container element.
   */
  private setupEventListeners(container: HTMLElement): void {
    // Resize
    const handleResize = (): void => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Click/tap on stage nodes
    const handleClick = (event: MouseEvent): void => {
      const rect = container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const meshes = this.stageNodes.map((n) => n.mesh);
      const intersects = this.raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const stageId = intersects[0].object.userData.stageId as JourneyStageId;
        store.goToStage(stageId);
      }
    };
    container.addEventListener('click', handleClick);
  }

  /**
   * Clean up the scene and release resources.
   */
  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    this.scene.clear();
  }
}
