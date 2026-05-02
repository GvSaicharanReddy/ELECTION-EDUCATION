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

/* ── Scene Numeric Constants ──────────────────────────────────────────── */

/** Background / fog colour. */
const BG_COLOUR = 0x0a0a1a;
/** Fog density exponent. */
const FOG_DENSITY = 0.035;
/** Camera field-of-view in degrees. */
const CAMERA_FOV = 60;
/** Camera near clip plane. */
const CAMERA_NEAR = 0.1;
/** Camera far clip plane. */
const CAMERA_FAR = 100;
/** Default camera Y offset. */
const CAMERA_DEFAULT_Y = 2;
/** Default camera Z offset. */
const CAMERA_DEFAULT_Z = 12;
/** Maximum device-pixel-ratio clamp. */
const MAX_PIXEL_RATIO = 2;

/** Ambient light colour. */
const AMBIENT_COLOUR = 0x404060;
/** Ambient light intensity. */
const AMBIENT_INTENSITY = 0.6;
/** Directional light colour. */
const DIR_LIGHT_COLOUR = 0xffffff;
/** Directional light intensity. */
const DIR_LIGHT_INTENSITY = 0.8;
/** Directional light X position. */
const DIR_LIGHT_X = 5;
/** Directional light Y position. */
const DIR_LIGHT_Y = 10;
/** Directional light Z position. */
const DIR_LIGHT_Z = 5;
/** Point light colour. */
const POINT_LIGHT_COLOUR = 0xff9933;
/** Point light intensity. */
const POINT_LIGHT_INTENSITY = 0.5;
/** Point light distance. */
const POINT_LIGHT_DIST = 20;
/** Point light Y position. */
const POINT_LIGHT_Y = 5;

/** Math midpoint for random spread. */
const MIDPOINT = 0.5;

/** Number of sine-wave cycles along the stage path. */
const SINE_CYCLE_COUNT = 2;
/** Node radius for dodecahedron. */
const NODE_RADIUS = 0.5;
/** Curve centre for S-curve X parameter. */
const CURVE_CENTRE = 0.5;
/** Dodecahedron detail level. */
const NODE_DETAIL = 0;
/** Node emissive intensity (default). */
const NODE_EMISSIVE = 0.3;
/** Node shininess. */
const NODE_SHININESS = 80;
/** Node base opacity. */
const NODE_OPACITY = 0.9;
/** Curve spread multiplier for S-curve X. */
const CURVE_SPREAD_X = 16;
/** Y-amplitude for S-curve. */
const CURVE_AMP_Y = 1.5;
/** Z-depth for S-curve. */
const CURVE_DEPTH_Z = 2;

/** Glow sphere radius. */
const GLOW_RADIUS = 0.8;
/** Glow sphere segments. */
const GLOW_SEGMENTS = 16;
/** Glow base opacity. */
const GLOW_OPACITY = 0.1;
/** Label Y-offset above node. */
const LABEL_Y_OFFSET = 1.0;

/** Sprite scale X. */
const SPRITE_SCALE_X = 3;
/** Sprite scale Y. */
const SPRITE_SCALE_Y = 0.75;
/** Sprite scale Z. */
const SPRITE_SCALE_Z = 1;

/** Canvas width for text sprites. */
const CANVAS_WIDTH = 512;
/** Canvas height for text sprites. */
const CANVAS_HEIGHT = 128;
/** Font size for canvas text rendering. */
const CANVAS_FONT_SIZE = 36;
/** Hex string padding length. */
const HEX_PAD_LENGTH = 6;
/** Hexadecimal string conversion radix. */
const HEX_RADIX = 16;

/** Path line colour. */
const PATH_COLOUR = 0x333366;
/** Path line opacity. */
const PATH_OPACITY = 0.5;
/** Number of interpolation points on the path curve. */
const PATH_POINTS = 100;

/** Particle count. */
const PARTICLE_COUNT = 500;
/** Vertex stride in positions array. */
const VERTEX_STRIDE = 3;
/** Offset for Z coordinate in vertex array. */
const Z_COMPONENT_OFFSET = 2;
/** Particle X spread. */
const PARTICLE_SPREAD_X = 30;
/** Particle Y spread. */
const PARTICLE_SPREAD_Y = 15;
/** Particle Z spread. */
const PARTICLE_SPREAD_Z = 20;
/** Particle colour. */
const PARTICLE_COLOUR = 0x6666aa;
/** Particle size. */
const PARTICLE_SIZE = 0.05;
/** Particle opacity. */
const PARTICLE_OPACITY = 0.6;

/** Camera focus Y offset. */
const FOCUS_Y_OFFSET = 2;
/** Camera focus Z offset. */
const FOCUS_Z_OFFSET = 6;
/** Active node emissive intensity. */
const ACTIVE_EMISSIVE = 0.6;
/** Active glow opacity. */
const ACTIVE_GLOW_OPACITY = 0.25;
/** Inactive node emissive intensity. */
const INACTIVE_EMISSIVE = 0.2;
/** Inactive glow opacity. */
const INACTIVE_GLOW_OPACITY = 0.08;

/** Camera lerp factor (smoothness). */
const CAMERA_LERP = 0.03;
/** Squared distance threshold below which camera is considered converged. */
const CAMERA_CONVERGE_THRESHOLD_SQ = 0.0001;
/** Time-to-seconds divisor. */
const TIME_DIVISOR = 0.001;
/** Node Y-rotation speed. */
const ROTATION_SPEED_Y = 0.3;
/** Node rotation index offset. */
const ROTATION_INDEX_OFFSET = 0.5;
/** Node X-rotation speed. */
const ROTATION_SPEED_X = 0.2;
/** Node X-rotation amplitude. */
const ROTATION_AMP_X = 0.1;
/** Particle drift rotation speed. */
const PARTICLE_DRIFT_SPEED = 0.02;
/** Sentinel value indicating the animation loop has been disposed. */
const DISPOSED_SENTINEL = -1;

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
  private readonly cleanupFns: Array<() => void>;
  private readonly textures: THREE.CanvasTexture[] = [];

  /**
   * Create and mount the Election Scene into the given container.
   *
   * @param container - The HTMLElement to render the WebGL canvas into.
   * @throws {Error} If WebGL is unavailable or the renderer fails to initialise.
   */
  constructor(container: HTMLElement) {
    this.isReducedMotion = prefersReducedMotion();
    this.stageNodes = [];
    this.animationId = DISPOSED_SENTINEL;
    this.cleanupFns = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.targetCameraPos = new THREE.Vector3(0, CAMERA_DEFAULT_Y, CAMERA_DEFAULT_Z);

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BG_COLOUR);
    this.scene.fog = new THREE.FogExp2(BG_COLOUR, FOG_DENSITY);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      container.clientWidth / container.clientHeight,
      CAMERA_NEAR,
      CAMERA_FAR,
    );
    this.camera.position.copy(this.targetCameraPos);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    container.appendChild(this.renderer.domElement);

    // Build scene content
    this.addLighting();
    this.stageNodes = this.createStageNodes();
    this.createPathLine();
    this.particles = this.createParticleField();

    // Events
    this.setupEventListeners(container);

    // Subscribe to state
    const unsubscribe = store.subscribe((state) => {
      this.focusOnStage(state.currentStage);
    });
    this.cleanupFns.push(unsubscribe);

    // Start render loop
    this.animationId = 0;
    this.animate();
  }

  /**
   * Add lighting to the scene.
   * Uses ambient + directional for clean visibility.
   */
  private addLighting(): void {
    const ambient = new THREE.AmbientLight(AMBIENT_COLOUR, AMBIENT_INTENSITY);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(DIR_LIGHT_COLOUR, DIR_LIGHT_INTENSITY);
    directional.position.set(DIR_LIGHT_X, DIR_LIGHT_Y, DIR_LIGHT_Z);
    this.scene.add(directional);

    const point = new THREE.PointLight(POINT_LIGHT_COLOUR, POINT_LIGHT_INTENSITY, POINT_LIGHT_DIST);
    point.position.set(0, POINT_LIGHT_Y, 0);
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
      const x = (t - CURVE_CENTRE) * CURVE_SPREAD_X;
      const y = Math.sin(t * Math.PI * SINE_CYCLE_COUNT) * CURVE_AMP_Y;
      const z = Math.cos(t * Math.PI) * CURVE_DEPTH_Z;
      const position = new THREE.Vector3(x, y, z);

      // Main mesh: dodecahedron (procedural, 12-sided)
      const geometry = new THREE.DodecahedronGeometry(NODE_RADIUS, NODE_DETAIL);
      const material = new THREE.MeshPhongMaterial({
        color: STAGE_COLOURS[stage.id],
        emissive: STAGE_COLOURS[stage.id],
        emissiveIntensity: NODE_EMISSIVE,
        shininess: NODE_SHININESS,
        transparent: true,
        opacity: NODE_OPACITY,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.userData = { stageId: stage.id, index };
      this.scene.add(mesh);

      // Glow sphere (larger, transparent)
      const glowGeometry = new THREE.SphereGeometry(GLOW_RADIUS, GLOW_SEGMENTS, GLOW_SEGMENTS);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: STAGE_COLOURS[stage.id],
        transparent: true,
        opacity: GLOW_OPACITY,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(position);
      this.scene.add(glowMesh);

      // Text label sprite (procedurally generated via canvas)
      const label = this.createTextSprite(stage.title, STAGE_COLOURS[stage.id]);
      label.position.copy(position);
      label.position.y += LABEL_Y_OFFSET;
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
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Return an empty sprite if 2D context is unavailable
      return new THREE.Sprite(new THREE.SpriteMaterial());
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `bold ${CANVAS_FONT_SIZE}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Convert hex to CSS
    const hex = `#${colour.toString(HEX_RADIX).padStart(HEX_PAD_LENGTH, '0')}`;
    ctx.fillStyle = hex;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    this.textures.push(texture);

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(SPRITE_SCALE_X, SPRITE_SCALE_Y, SPRITE_SCALE_Z);

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
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(PATH_POINTS));
    const material = new THREE.LineBasicMaterial({
      color: PATH_COLOUR,
      transparent: true,
      opacity: PATH_OPACITY,
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
    const positions = new Float32Array(PARTICLE_COUNT * VERTEX_STRIDE);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * VERTEX_STRIDE] = (Math.random() - MIDPOINT) * PARTICLE_SPREAD_X;
      positions[i * VERTEX_STRIDE + 1] = (Math.random() - MIDPOINT) * PARTICLE_SPREAD_Y;
      positions[i * VERTEX_STRIDE + Z_COMPONENT_OFFSET] =
        (Math.random() - MIDPOINT) * PARTICLE_SPREAD_Z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, VERTEX_STRIDE));

    const material = new THREE.PointsMaterial({
      color: PARTICLE_COLOUR,
      size: PARTICLE_SIZE,
      transparent: true,
      opacity: PARTICLE_OPACITY,
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
      node.position.y + FOCUS_Y_OFFSET,
      node.position.z + FOCUS_Z_OFFSET,
    );

    // Highlight active node
    this.stageNodes.forEach((n) => {
      const mat = n.mesh.material as THREE.MeshPhongMaterial;
      const glowMat = n.glowMesh.material as THREE.MeshBasicMaterial;
      if (n.stageId === stageId) {
        mat.emissiveIntensity = ACTIVE_EMISSIVE;
        glowMat.opacity = ACTIVE_GLOW_OPACITY;
      } else {
        mat.emissiveIntensity = INACTIVE_EMISSIVE;
        glowMat.opacity = INACTIVE_GLOW_OPACITY;
      }
    });
  }

  /**
   * Main animation loop.
   */
  private animate(): void {
    if (this.animationId === DISPOSED_SENTINEL) {
      return;
    }
    this.animationId = requestAnimationFrame(() => this.animate());

    // Smooth camera interpolation
    this.camera.position.lerp(this.targetCameraPos, CAMERA_LERP);

    // Only recalculate lookAt when camera is still moving
    if (this.camera.position.distanceToSquared(this.targetCameraPos) > CAMERA_CONVERGE_THRESHOLD_SQ) {
      this.camera.lookAt(0, 0, 0);
    }

    if (!this.isReducedMotion) {
      // Gentle rotation of stage nodes
      const time = Date.now() * TIME_DIVISOR;
      this.stageNodes.forEach((node, i) => {
        node.mesh.rotation.y = time * ROTATION_SPEED_Y + i * ROTATION_INDEX_OFFSET;
        node.mesh.rotation.x = Math.sin(time * ROTATION_SPEED_X + i) * ROTATION_AMP_X;
      });

      // Particle drift
      this.particles.rotation.y = time * PARTICLE_DRIFT_SPEED;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Set up mouse/keyboard event listeners.
   *
   * @param container - The DOM container element.
   */
  private setupEventListeners(container: HTMLElement): void {
    const handleResize = (): void => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    this.cleanupFns.push(() => window.removeEventListener('resize', handleResize));

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
    this.cleanupFns.push(() => container.removeEventListener('click', handleClick));

    // WebGL Context Loss Handling
    const canvas = this.renderer.domElement;
    const onContextLost = (e: Event): void => {
      e.preventDefault();
      if (this.animationId !== DISPOSED_SENTINEL) {
        cancelAnimationFrame(this.animationId);
        this.animationId = DISPOSED_SENTINEL;
      }
    };
    const onContextRestored = (): void => {
      if (this.animationId === DISPOSED_SENTINEL) {
        this.animationId = 0;
        this.animate();
      }
    };

    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    this.cleanupFns.push(() => {
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
    });
  }

  /**
   * Clean up the scene and release resources.
   */
  dispose(): void {
    const id = this.animationId;
    this.animationId = DISPOSED_SENTINEL;
    cancelAnimationFrame(id);
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.textures.forEach((t) => t.dispose());
    this.textures.length = 0;
    this.renderer.dispose();
    this.scene.clear();
  }
}
