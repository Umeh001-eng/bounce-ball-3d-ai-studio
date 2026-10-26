import * as THREE from 'three';
import { getBallById } from './ballCatalog';
import { BallItem, PowerUpType } from '../types/game';
import { audio } from '../utils/audio';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, coins: number, distance: number) => void;
  onLivesUpdate: (lives: number) => void;
  onPowerUpUpdate: (type: PowerUpType | null, timeLeft: number) => void;
  onNearMiss: (combo: number) => void;
  onGameOver: (finalScore: number, finalCoins: number, distance: number, nearMisses: number) => void;
  onObstacleJumped: () => void;
}

interface EnemyBall {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
  horns: THREE.Mesh[];
  lane: number;
  active: boolean;
  cooldown: number;
  steerTimer: number;
  type: 'brimstone' | 'viper' | 'goliath';
  targetX: number;
}

interface WaveBarrier {
  group: THREE.Group;
  barriers: THREE.Group[];
  safeLane: number;
  index: number;
  hit: boolean;
}

interface CoinItem {
  group: THREE.Group;
  meshGroup: THREE.Group;
  taken: boolean;
  lane: number;
}

interface PowerUpItem {
  group: THREE.Group;
  type: PowerUpType;
  mesh: THREE.Object3D;
  ring: THREE.Mesh;
  phase: number;
}

const LANES = [-3.25, 0, 3.25];
const BALL_RADIUS = 0.38;

// Pre-allocated scratch objects to prevent GC in render loop
const _tempVec3 = new THREE.Vector3();

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private isSoftwareGl = false;

  // Day & Night Lighting references
  private hemiLight!: THREE.HemisphereLight;
  private keySun!: THREE.DirectionalLight;
  private rimBlue!: THREE.DirectionalLight;
  public isDayMode = false;

  private ball!: THREE.Mesh;
  private ballGroup!: THREE.Group;
  private ballShadow!: THREE.Mesh;
  private ballParticles: THREE.Mesh[] = [];

  // Shockwave ring for high tier impacts
  private shockwaveRing!: THREE.Mesh;
  private shockwaveTimer = 0;

  private roads: THREE.Group[] = [];
  private buildings: { group: THREE.Group; zOrig: number }[] = [];
  private lamps: THREE.Group[] = [];
  private waves: WaveBarrier[] = [];
  private coins: CoinItem[] = [];
  private powerUps: PowerUpItem[] = [];
  private enemies: EnemyBall[] = [];

  // Game state
  public isRunning = false;
  public isPaused = false;
  public isGameOver = false;

  private score = 0;
  private coinCount = 0;
  private distance = 0;
  private speed = 14;
  private targetX = 0;
  private currentX = 0;
  private jumpVelocity = 0;
  private isJumping = false;
  private airJumpUsed = false;
  private landingBounce = 0;
  private lives = 3;
  private damageCooldown = 0;
  private invulnerable = 0;

  // Power-ups
  private activePower: PowerUpType | null = null;
  private powerTimer = 0;
  private shieldActive = false;

  // Near miss & combo
  private nearMissCombo = 0;
  private comboResetTimer = 0;

  // Input
  public leftHeld = false;
  public rightHeld = false;
  public tiltEnabled = false;
  public tiltSensitivity = 1.0;
  private tiltBaseline: number | null = null;

  private equippedBallItem: BallItem;
  private lastTime = 0;
  private frameId: number | null = null;

  // Texture cache
  private textureLoader = new THREE.TextureLoader();
  private loadedTextures: Record<string, THREE.Texture> = {};

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks, initialBallId = 'chrome', isDay = false) {
    this.container = container;
    this.callbacks = callbacks;
    this.equippedBallItem = getBallById(initialBallId);
    this.isDayMode = isDay;

    this.initThree();
    this.createWorld();
    this.createPlayerBall();
    this.createEnemies();
    this.createObstacles();
    this.createCoins();
    this.createPowerUps();

    this.setDayNightMode(this.isDayMode);

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    this.animate = this.animate.bind(this);
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.animate);
  }

  private initThree() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060c1c);
    this.scene.fog = new THREE.FogExp2(0x060c1c, 0.014);

    this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 0.1, 350);
    this.camera.position.set(0, 6.2, 11.5);
    this.camera.lookAt(0, 1.2, -12);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // Studio Lighting
    this.hemiLight = new THREE.HemisphereLight(0x7da4ff, 0x121b2f, 1.8);
    this.scene.add(this.hemiLight);

    this.keySun = new THREE.DirectionalLight(0xffdf88, 2.4);
    keySunPosition: this.keySun.position.set(-15, 35, 15);
    this.scene.add(this.keySun);

    this.rimBlue = new THREE.DirectionalLight(0x38bdf8, 1.1);
    this.rimBlue.position.set(20, 10, -25);
    this.scene.add(this.rimBlue);
  }

  public setDayNightMode(isDay: boolean) {
    this.isDayMode = isDay;
    if (isDay) {
      // Vibrant sunlit day highway
      this.scene.background = new THREE.Color(0x38bdf8);
      if (this.scene.fog) {
        this.scene.fog.color.set(0x60a5fa);
        (this.scene.fog as THREE.FogExp2).density = 0.008;
      }
      this.hemiLight.color.set(0xffffff);
      this.hemiLight.groundColor.set(0x94a3b8);
      this.hemiLight.intensity = 2.4;

      this.keySun.color.set(0xfff7d9);
      this.keySun.intensity = 3.0;
      this.rimBlue.color.set(0x0284c7);
      this.rimBlue.intensity = 1.0;
      this.renderer.toneMappingExposure = 1.2;
    } else {
      // Cyberpunk metropolis night highway (Grounded on reference IMG_0742)
      this.scene.background = new THREE.Color(0x0a061c);
      if (this.scene.fog) {
        this.scene.fog.color.set(0x0c0828);
        (this.scene.fog as THREE.FogExp2).density = 0.012;
      }
      this.hemiLight.color.set(0x8b5cf6);
      this.hemiLight.groundColor.set(0x060312);
      this.hemiLight.intensity = 1.9;

      this.keySun.color.set(0xf59e0b);
      this.keySun.intensity = 2.2;
      this.rimBlue.color.set(0x00f0ff);
      this.rimBlue.intensity = 1.6;
      this.renderer.toneMappingExposure = 1.25;
    }
  }

  private createNeonSignMesh(text: string, textColor: string, borderColor: string, w = 5.2, h = 1.5): THREE.Group {
    const signGroup = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Deep dark acrylic sign board
      ctx.fillStyle = '#050212';
      ctx.fillRect(0, 0, 512, 128);

      // Neon outer glow border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 500, 116);

      // Inner neon text glow
      ctx.shadowColor = textColor;
      ctx.shadowBlur = 24;
      ctx.fillStyle = textColor;
      ctx.font = '900 48px "Arial Black", "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 64);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const frontPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: false, side: THREE.DoubleSide })
    );
    signGroup.add(frontPlane);

    // Glowing housing frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.15),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(borderColor) })
    );
    frame.position.z = -0.09;
    signGroup.add(frame);

    return signGroup;
  }

  private createWorld() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f1523, roughness: 0.38, metalness: 0.3 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.75, metalness: 0.2 });

    // 7 Seamless road chunks with glowing cyberpunk lane dividers and orange safety fences
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      g.position.z = -i * 45;

      // Road deck (3 lanes + wide shoulders)
      const deck = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.4, 45), roadMat);
      deck.position.y = -0.2;
      g.add(deck);

      // Glowing Neon Cyan Continuous Lane Dividers (Exact reference from IMG_0742)
      [-1.625, 1.625].forEach(lx => {
        const cyanTrack = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.04, 45),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff })
        );
        cyanTrack.position.set(lx, 0.02, 0);
        g.add(cyanTrack);
      });

      // Sidewalk curbs with Hot Magenta Neon Edge Strips
      [-6.9, 6.9].forEach(side => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 45), sidewalkMat);
        curb.position.set(side, -0.05, 0);
        g.add(curb);

        // Glowing Magenta neon edge strip along sidewalk
        const neonMagenta = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.08, 45),
          new THREE.MeshBasicMaterial({ color: 0xd946ef })
        );
        neonMagenta.position.set(side < 0 ? side + 0.72 : side - 0.72, 0.22, 0);
        g.add(neonMagenta);
      });

      // Roadside Illuminated Orange Safety Light Bar Fences (Exact reference from IMG_0742)
      [-5.6, 5.6].forEach(fx => {
        // Vertical steel support posts
        for (let pz = -20; pz <= 20; pz += 7.5) {
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 1.15, 0.12),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 })
          );
          post.position.set(fx, 0.58, pz);
          g.add(post);

          // Glowing amber post cap
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.08, 0.16),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
          );
          cap.position.set(fx, 1.18, pz);
          g.add(cap);
        }

        // 3 Horizontal Glowing Orange Neon Rails
        [0.38, 0.68, 0.98].forEach(hy => {
          const rail = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.08, 45),
            new THREE.MeshBasicMaterial({ color: 0xf97316 })
          );
          rail.position.set(fx, hy, 0);
          g.add(rail);
        });
      });

      // Speed chevron road decals
      for (const cx of LANES) {
        const chevron = new THREE.Mesh(
          new THREE.ConeGeometry(0.35, 1.2, 3),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: false })
        );
        chevron.rotation.x = -Math.PI / 2;
        chevron.rotation.z = Math.PI;
        chevron.position.set(cx, 0.025, 6);
        g.add(chevron);
      }

      this.scene.add(g);
      this.roads.push(g);
    }

    // Extended ground terrain in dark cyber purple
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(350, 600),
      new THREE.MeshStandardMaterial({ color: 0x060312, roughness: 1.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.6, -150);
    this.scene.add(ground);

    // Atmospheric twinkling starfield in the upper night sky
    const starCount = 280;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let s = 0; s < starCount; s++) {
      starPos[s * 3] = (Math.random() - 0.5) * 250;
      starPos[s * 3 + 1] = 16 + Math.random() * 85;
      starPos[s * 3 + 2] = -300 + Math.random() * 320;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 1.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);

    // Cyberpunk Metropolis Skyscrapers & Neon Facades (Inspired by IMG_0742)
    const buildingColors = [0x0c0c1e, 0x080816, 0x111128, 0x0e1326, 0x070b1a];
    for (let i = 0; i < 48; i++) {
      const z = -20 - i * 9.5;
      const hLeft = 18 + Math.random() * 42;
      const wLeft = 6 + Math.random() * 4;
      this.createSkyscraper(-14 - Math.random() * 6, z, wLeft, hLeft, 7, buildingColors[i % buildingColors.length], i, 'left');

      const hRight = 20 + Math.random() * 48;
      const wRight = 6 + Math.random() * 4;
      this.createSkyscraper(14 + Math.random() * 6, z - 4, wRight, hRight, 7, buildingColors[(i + 2) % buildingColors.length], i, 'right');

      // Cyber Lampposts every two buildings
      if (i % 2 === 0) {
        this.createLamppost(-6.4, z);
        this.createLamppost(6.4, z - 5);
      }
    }
  }

  private createSkyscraper(x: number, z: number, w: number, h: number, d: number, colorHex: number, index: number, side: 'left' | 'right') {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Main tower block
    const mainMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.7, metalness: 0.3 })
    );
    mainMesh.position.y = h / 2;
    g.add(mainMesh);

    // Glowing Neon Vertical Cyber Light Stripes along tower corners
    const isCyanStrip = index % 2 === 0;
    const stripColor = isCyanStrip ? 0x00f0ff : 0xff007f;
    const stripMat = new THREE.MeshBasicMaterial({ color: stripColor });

    // Inward facing corner strip (facing the highway)
    const cornerX = side === 'left' ? w / 2 - 0.05 : -w / 2 + 0.05;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.16, h, 0.16), stripMat);
    strip.position.set(cornerX, h / 2, d / 2 - 0.05);
    g.add(strip);

    // Roof Spire / Crown with Neon Glow
    const crownMat = new THREE.MeshBasicMaterial({ color: isCyanStrip ? 0x38bdf8 : 0xd946ef });
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, 1.4, d * 0.75), crownMat);
    cap.position.y = h + 0.7;
    g.add(cap);

    // Glowing Antenna Beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0055 })
    );
    beacon.position.y = h + 1.8;
    g.add(beacon);

    // Storefront and Mid-Rise Floating Cyber Neon Signboards (Exact features from IMG_0742)
    // Sign texts: "NEON RUN", "CYBERDRIVE", "SPEEDWAY", "LEVEL 5"
    if (index % 3 === 0) {
      let signText = 'NEON RUN';
      let textColor = '#ff007f';
      let borderColor = '#00f0ff';

      if (index % 6 === 1 || side === 'right') {
        signText = 'CYBERDRIVE';
        textColor = '#00f0ff';
        borderColor = '#d946ef';
      } else if (index % 6 === 3) {
        signText = 'SPEEDWAY';
        textColor = '#f59e0b';
        borderColor = '#f97316';
      } else if (index % 6 === 5) {
        signText = 'LEVEL 5';
        textColor = '#38bdf8';
        borderColor = '#a855f7';
      }

      const signMesh = this.createNeonSignMesh(signText, textColor, borderColor, 5.0, 1.4);
      // Position sign on the side of the skyscraper facing the road
      const signX = side === 'left' ? w / 2 + 0.08 : -w / 2 - 0.08;
      const signY = 4.5 + (index % 4) * 2.2;
      signMesh.position.set(signX, signY, 0);
      signMesh.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
      g.add(signMesh);
    }

    // Grid of illuminated window tiles (warm amber + cyber cyan)
    const rows = Math.min(10, Math.floor(h / 3.2));
    const cols = Math.min(4, Math.floor(w / 1.6));
    const winGeo = new THREE.PlaneGeometry(0.65, 0.85);
    const winLitMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const winCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.4) {
          const mat = Math.random() < 0.35 ? winCyanMat : winLitMat;
          const win = new THREE.Mesh(winGeo, mat);
          win.position.set(-w / 2 + (c + 0.5) * (w / cols), 2.8 + r * (h / rows), d / 2 + 0.05);
          g.add(win);
        }
      }
    }

    this.scene.add(g);
    this.buildings.push({ group: g, zOrig: z });
  }

  private createLamppost(x: number, z: number) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // High-tech cyber lamp post
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 5.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.9 })
    );
    pole.position.y = 2.6;
    g.add(pole);

    // Cantilever arm extending inward over sidewalk
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.1, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.9 })
    );
    arm.position.set(x < 0 ? 0.7 : -0.7, 5.1, 0);
    g.add(arm);

    // Glowing Cyan Cyber Lamp Head
    const bulb = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.12, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    bulb.position.set(x < 0 ? 1.3 : -1.3, 5.0, 0);
    g.add(bulb);

    this.scene.add(g);
    this.lamps.push(g);
  }

  private createPlayerBall() {
    this.ballGroup = new THREE.Group();
    this.ballGroup.position.set(0, BALL_RADIUS, 2.5);
    this.scene.add(this.ballGroup);

    // Ball 3D Mesh
    const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 64, 48);
    const ballMat = new THREE.MeshPhysicalMaterial({
      color: 0xcbd5e1,
      metalness: 0.95,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    this.ball = new THREE.Mesh(ballGeo, ballMat);
    this.ballGroup.add(this.ball);

    // Soft Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(BALL_RADIUS * 1.5, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    this.ballShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.ballShadow.rotation.x = -Math.PI / 2;
    this.ballShadow.position.set(0, 0.02, 2.5);
    this.scene.add(this.ballShadow);

    // Shockwave ring
    const shockGeo = new THREE.RingGeometry(0.3, 0.6, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.shockwaveRing = new THREE.Mesh(shockGeo, shockMat);
    this.shockwaveRing.rotation.x = -Math.PI / 2;
    this.shockwaveRing.position.set(0, 0.03, 2.5);
    this.scene.add(this.shockwaveRing);

    // Trail particle pool
    const particleGeo = new THREE.SphereGeometry(0.08, 12, 10);
    for (let i = 0; i < 14; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const p = new THREE.Mesh(particleGeo, pMat);
      p.visible = false;
      this.scene.add(p);
      this.ballParticles.push(p);
    }

    this.applyBallMaterial(this.equippedBallItem);
  }

  public applyEquippedBall(item: BallItem) {
    this.equippedBallItem = item;
    this.applyBallMaterial(item);
  }

  private applyBallMaterial(item: BallItem) {
    if (!this.ball) return;
    const mat = this.ball.material as THREE.MeshPhysicalMaterial;

    mat.color.set(item.color);
    mat.emissive.set(item.emissiveColor);
    mat.emissiveIntensity = item.glow;
    mat.roughness = item.roughness;
    mat.metalness = item.metalness;
    mat.clearcoat = item.rarity === 'MYTHIC' || item.rarity === 'GOD' ? 1.0 : 0.8;
    mat.clearcoatRoughness = 0.1;

    // Load texture if present
    if (item.texturePath) {
      if (this.loadedTextures[item.texturePath]) {
        mat.map = this.loadedTextures[item.texturePath];
        mat.needsUpdate = true;
      } else {
        this.textureLoader.load(
          item.texturePath,
          tex => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
            this.loadedTextures[item.texturePath!] = tex;
            if (this.equippedBallItem.id === item.id) {
              mat.map = tex;
              mat.needsUpdate = true;
            }
          },
          undefined,
          () => {
            mat.map = null;
            mat.needsUpdate = true;
          }
        );
      }
    } else {
      mat.map = null;
      mat.needsUpdate = true;
    }

    // Update particle colors
    this.ballParticles.forEach(p => {
      (p.material as THREE.MeshBasicMaterial).color.set(item.color);
    });
  }

  private createEnemies() {
    const enemyConfigs = [
      { type: 'brimstone' as const, name: 'Brimstone Chaser', eyeColor: 0xff0033 },
      { type: 'viper' as const, name: 'Viper Prowler', eyeColor: 0xffaa00 },
      { type: 'goliath' as const, name: 'Goliath Crusher', eyeColor: 0xff2222 }
    ];

    enemyConfigs.forEach((cfg, idx) => {
      const g = new THREE.Group();

      // Enemy composite body: 3-8 distinct parts!
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.35,
        metalness: 0.3,
        emissive: 0x450a0a,
        emissiveIntensity: 0.4
      });
      const body = new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS * 0.95, 28, 24), bodyMat);
      body.position.y = BALL_RADIUS * 0.95;
      g.add(body);

      // Horns / spikes
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.2, metalness: 0.8 });
      const horns: THREE.Mesh[] = [];
      [-0.18, 0.18].forEach(hx => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 6), hornMat);
        horn.position.set(hx, BALL_RADIUS * 1.8, 0.05);
        horn.rotation.z = -hx * 1.8;
        horn.rotation.x = -0.2;
        g.add(horn);
        horns.push(horn);
      });

      // Glowing eyes
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const eyeGlowMat = new THREE.MeshBasicMaterial({ color: cfg.eyeColor });

      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), eyeWhiteMat);
      eyeL.position.set(-0.13, BALL_RADIUS * 1.15, 0.3);
      eyeL.scale.z = 0.4;
      g.add(eyeL);

      const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), eyeGlowMat);
      pupilL.position.set(-0.13, BALL_RADIUS * 1.15, 0.33);
      g.add(pupilL);

      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), eyeWhiteMat);
      eyeR.position.set(0.13, BALL_RADIUS * 1.15, 0.3);
      eyeR.scale.z = 0.4;
      g.add(eyeR);

      const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), eyeGlowMat);
      pupilR.position.set(0.13, BALL_RADIUS * 1.15, 0.33);
      g.add(pupilR);

      // Aggressive brow ridge
      const browMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.5 });
      [-0.13, 0.13].forEach(bx => {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.035, 0.03), browMat);
        brow.position.set(bx, BALL_RADIUS * 1.25, 0.31);
        brow.rotation.z = (bx < 0 ? 0.3 : -0.3);
        g.add(brow);
      });

      // Glowing mouth slit
      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.035, 0.03),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      mouth.position.set(0, BALL_RADIUS * 0.72, 0.34);
      g.add(mouth);

      const startLane = idx % 3;
      g.position.set(LANES[startLane], 0, -80 - idx * 55);
      this.scene.add(g);

      this.enemies.push({
        group: g,
        bodyMesh: body,
        eyeLeft: pupilL,
        eyeRight: pupilR,
        horns,
        lane: startLane,
        active: idx === 0,
        cooldown: 0,
        steerTimer: 1.5 + Math.random() * 2,
        type: cfg.type,
        targetX: LANES[startLane]
      });
    });
  }

  private createObstacles() {
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
    const orangeStripe = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4,
      emissive: 0xc2410c,
      emissiveIntensity: 0.3
    });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });
    const warnLightMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 });

    for (let i = 0; i < 9; i++) {
      const g = new THREE.Group();
      const wave: WaveBarrier = {
        group: g,
        barriers: [],
        safeLane: i % 3,
        index: i,
        hit: false
      };

      g.position.set(0, 0, -30 - i * 26);

      // Barriers for non-safe lanes
      LANES.forEach((x, laneIdx) => {
        if (laneIdx !== wave.safeLane) {
          const b = new THREE.Group();
          b.position.x = x;

          const isLaserType = (i % 2 === 1);
          const h = 0.8 + (i % 3) * 0.35;
          const w = 2.95;

          if (isLaserType) {
            // High-tech laser gate barrier!
            [-w / 2 + 0.15, w / 2 - 0.15].forEach(px => {
              const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h + 0.3, 12), steelMat);
              pylon.position.set(px, (h + 0.3) / 2, 0);
              b.add(pylon);

              const glowTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), warnLightMat);
              glowTip.position.set(px, h + 0.35, 0);
              b.add(glowTip);
            });

            // Glowing red laser beam
            const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, w - 0.3, 8), laserMat);
            beam.rotation.z = Math.PI / 2;
            beam.position.set(0, h * 0.65, 0);
            b.add(beam);

            // Barrier base warning plate
            const basePlate = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, 0.7), orangeStripe);
            basePlate.position.y = 0.12;
            b.add(basePlate);
          } else {
            // Road hazard barricade matching reference IMG_0742
            const mainBar = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.75, 0.22), barrierMat);
            mainBar.position.y = h * 0.48;
            b.add(mainBar);

            // Bold diagonal hazard striped plate
            const hazardPlate = new THREE.Mesh(
              new THREE.BoxGeometry(w * 0.96, h * 0.65, 0.25),
              new THREE.MeshBasicMaterial({ color: 0xef4444 })
            );
            hazardPlate.position.y = h * 0.48;
            b.add(hazardPlate);

            // Black diagonal chevron stripes across the hazard board
            for (let sx = -w / 2 + 0.45; sx <= w / 2 - 0.45; sx += 0.55) {
              const chevron = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, h * 0.72, 0.27),
                new THREE.MeshBasicMaterial({ color: 0x0f172a })
              );
              chevron.position.set(sx, h * 0.48, 0);
              chevron.rotation.z = -0.42;
              b.add(chevron);
            }

            // A-frame support legs & Twin Glowing Red Warning Beacons (Matching IMG_0742)
            [-w / 2 + 0.3, w / 2 - 0.3].forEach(px => {
              // Left leg
              const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.95, 0.1), steelMat);
              leg1.position.set(px, h * 0.48, 0.18);
              leg1.rotation.x = 0.22;
              b.add(leg1);

              // Right leg
              const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.95, 0.1), steelMat);
              leg2.position.set(px, h * 0.48, -0.18);
              leg2.rotation.x = -0.22;
              b.add(leg2);

              // Glowing Red Beacon Globe on each top corner (Exact feature from reference)
              const beaconGlobe = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0xff1e00 })
              );
              beaconGlobe.position.set(px, h + 0.08, 0);
              b.add(beaconGlobe);
            });
          }

          b.userData = { width: w, height: h };
          g.add(b);
          wave.barriers.push(b);
        }
      });

      this.scene.add(g);
      this.waves.push(wave);
    }
  }

  /**
   * Builds realistic 3D gameplay coins using the uploaded asset IMG_0741:
   * Thick milled golden outer rim, raised bevel lip, and high-fidelity coin face.
   */
  private createCoins() {
    const coinTexture = this.textureLoader.load('/assets/aistudio/IMG_0741_9c2ce743.jpeg');
    coinTexture.colorSpace = THREE.SRGBColorSpace;

    const goldRimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.18,
      metalness: 0.95,
      emissive: 0x78350f,
      emissiveIntensity: 0.35
    });

    const goldFaceMat = new THREE.MeshStandardMaterial({
      map: coinTexture,
      roughness: 0.22,
      metalness: 0.88,
      emissive: 0x92400e,
      emissiveIntensity: 0.25
    });

    for (let row = 0; row < 12; row++) {
      for (let j = 0; j < 4; j++) {
        const root = new THREE.Group();
        const meshGroup = new THREE.Group();
        root.add(meshGroup);

        // 1. Thick Gold Coin Rim
        const outerRim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), goldRimMat);
        outerRim.rotation.x = Math.PI / 2;
        meshGroup.add(outerRim);

        // 2. Raised Bevel Lip (Front & Back)
        [-0.041, 0.041].forEach(sideZ => {
          const torusLip = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.02, 10, 32), goldRimMat);
          torusLip.position.z = sideZ;
          meshGroup.add(torusLip);
        });

        // 3. High-fidelity 3D Coin Face from uploaded asset (Front & Back)
        const faceFront = new THREE.Mesh(new THREE.CircleGeometry(0.25, 32), goldFaceMat);
        faceFront.position.z = 0.042;
        meshGroup.add(faceFront);

        const faceBack = new THREE.Mesh(new THREE.CircleGeometry(0.25, 32), goldFaceMat);
        faceBack.rotation.y = Math.PI;
        faceBack.position.z = -0.042;
        meshGroup.add(faceBack);

        const lane = row % 3;
        root.position.set(LANES[lane], 0.65, -22 - row * 24 - j * 1.8);
        this.scene.add(root);
        this.coins.push({ group: root, meshGroup, taken: false, lane });
      }
    }
  }

  private createPowerUps() {
    const types: PowerUpType[] = ['shield', 'speed', 'magnet', 'shield', 'speed', 'magnet'];

    types.forEach((type, idx) => {
      const g = new THREE.Group();
      let meshObj: THREE.Object3D;
      let col = 0x38bdf8;

      if (type === 'shield') {
        col = 0x38bdf8;
        meshObj = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.38),
          new THREE.MeshStandardMaterial({
            color: col,
            roughness: 0.2,
            metalness: 0.6,
            emissive: col,
            emissiveIntensity: 0.6
          })
        );
      } else if (type === 'speed') {
        col = 0xfacc15;
        meshObj = new THREE.Mesh(
          new THREE.ConeGeometry(0.26, 0.62, 6),
          new THREE.MeshStandardMaterial({
            color: col,
            roughness: 0.2,
            metalness: 0.8,
            emissive: col,
            emissiveIntensity: 0.7
          })
        );
        meshObj.rotation.z = Math.PI;
      } else {
        col = 0xc084fc;
        meshObj = new THREE.Mesh(
          new THREE.TorusGeometry(0.28, 0.1, 12, 24, Math.PI),
          new THREE.MeshStandardMaterial({
            color: col,
            roughness: 0.2,
            metalness: 0.7,
            emissive: col,
            emissiveIntensity: 0.6
          })
        );
      }

      meshObj.position.y = 0.65;
      g.add(meshObj);

      // Rotating orbit ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.52, 0.025, 8, 32),
        new THREE.MeshBasicMaterial({ color: col })
      );
      ring.position.y = 0.65;
      g.add(ring);

      const lane = idx % 3;
      g.position.set(LANES[lane], 0, -50 - idx * 62);
      this.scene.add(g);

      this.powerUps.push({
        group: g,
        type,
        mesh: meshObj,
        ring,
        phase: Math.random() * Math.PI * 2
      });
    });
  }

  // Input & steering methods
  public steerLeft() {
    this.targetX = THREE.MathUtils.clamp(this.targetX - 3.25, -3.25, 3.25);
  }

  public steerRight() {
    this.targetX = THREE.MathUtils.clamp(this.targetX + 3.25, -3.25, 3.25);
  }

  /**
   * Direct finger drag navigation:
   * Smoothly navigates the ball across lanes based on drag delta.
   */
  public dragSteer(deltaX: number) {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    this.targetX = THREE.MathUtils.clamp(this.targetX + deltaX * 0.018, -3.25, 3.25);
  }

  /**
   * Direct finger position tracking:
   * Map normalized screen coordinate (-1.0 to 1.0) directly to highway lanes.
   */
  public setDirectTargetX(normalizedScreenX: number) {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    this.targetX = THREE.MathUtils.clamp(normalizedScreenX * 3.8, -3.25, 3.25);
  }

  public jump() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    const item = this.equippedBallItem;

    if (this.isJumping) {
      if (!item.doubleJump || this.airJumpUsed) return;
      this.airJumpUsed = true;
      this.jumpVelocity = item.jumpPower * 0.82;
      audio.jump(true, item.id === 'lava');
      return;
    }

    this.isJumping = true;
    this.landingBounce = 0;
    this.airJumpUsed = false;
    this.jumpVelocity = item.jumpPower;
    audio.jump(false, item.id === 'lava');
  }

  public handleTilt(gamma: number) {
    if (!this.tiltEnabled || !this.isRunning) return;
    if (this.tiltBaseline === null) {
      this.tiltBaseline = gamma;
      return;
    }

    const diff = (gamma - this.tiltBaseline) * this.tiltSensitivity;
    if (Math.abs(diff) < 2) return;
    this.targetX = THREE.MathUtils.clamp(diff * 0.22, -3.25, 3.25);
  }

  public resetTiltBaseline() {
    this.tiltBaseline = null;
  }

  public startRun() {
    this.resetRunState();
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    audio.startMusic();
    this.lastTime = performance.now();
  }

  public pauseRun() {
    if (!this.isRunning || this.isGameOver) return;
    this.isPaused = true;
    this.isRunning = false;
    audio.stopMusic();
  }

  public resumeRun() {
    if (!this.isPaused || this.isGameOver) return;
    this.isPaused = false;
    this.isRunning = true;
    audio.startMusic();
    this.lastTime = performance.now();
  }

  public resetRunState() {
    this.score = 0;
    this.coinCount = 0;
    this.distance = 0;
    this.speed = 14;
    this.targetX = 0;
    this.currentX = 0;
    this.jumpVelocity = 0;
    this.isJumping = false;
    this.airJumpUsed = false;
    this.landingBounce = 0;
    this.lives = 3;
    this.damageCooldown = 0;
    this.invulnerable = 0;
    this.activePower = null;
    this.powerTimer = 0;
    this.shieldActive = false;
    this.nearMissCombo = 0;
    this.comboResetTimer = 0;

    this.ballGroup.position.set(0, BALL_RADIUS, 2.5);
    this.ballGroup.rotation.set(0, 0, 0);
    this.ballGroup.scale.set(1, 1, 1);
    this.ballGroup.visible = true;

    // Reset roads & buildings
    this.roads.forEach((r, i) => (r.position.z = -i * 45));
    this.buildings.forEach(b => (b.group.position.z = b.zOrig));
    this.lamps.forEach((l, i) => (l.position.z = -20 - i * 9.5));

    // Reset obstacles & coins
    this.waves.forEach((w, i) => {
      w.group.position.z = -30 - i * 26;
      w.hit = false;
    });

    this.coins.forEach((c, i) => {
      c.taken = false;
      c.group.visible = true;
      const row = Math.floor(i / 4);
      const lane = row % 3;
      c.lane = lane;
      c.group.position.set(LANES[lane], 0.65, -22 - row * 24 - (i % 4) * 1.8);
    });

    this.enemies.forEach((e, idx) => {
      e.active = idx === 0;
      e.cooldown = 0;
      e.lane = idx % 3;
      e.targetX = LANES[e.lane];
      e.group.position.set(LANES[e.lane], 0, -80 - idx * 55);
      e.group.visible = e.active;
    });

    this.callbacks.onScoreUpdate(0, 0, 0);
    this.callbacks.onLivesUpdate(3);
    this.callbacks.onPowerUpUpdate(null, 0);
  }

  private handleDamage(isEnemy = false) {
    if (this.invulnerable > 0 || this.damageCooldown > 0) return;

    if (this.shieldActive) {
      this.shieldActive = false;
      this.activePower = null;
      this.powerTimer = 0;
      this.callbacks.onPowerUpUpdate(null, 0);
      audio.shieldBreak();
      this.invulnerable = 1.0;
      return;
    }

    this.lives = Math.max(0, this.lives - 1);
    this.damageCooldown = 2.8;
    this.invulnerable = 2.8;
    audio.hit(isEnemy);
    this.callbacks.onLivesUpdate(this.lives);

    if ('vibrate' in navigator) {
      try { navigator.vibrate([120, 60, 180]); } catch {}
    }

    if (this.lives <= 0) {
      this.endGame();
    }
  }

  private endGame() {
    this.isRunning = false;
    this.isGameOver = true;
    audio.stopMusic();
    this.callbacks.onGameOver(this.score, this.coinCount, Math.floor(this.distance), this.nearMissCombo);
  }

  private update(dt: number) {
    dt = Math.min(dt, 0.04);

    // Timers
    this.damageCooldown = Math.max(0, this.damageCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);

    // Power-up duration
    if (this.activePower && this.powerTimer > 0) {
      this.powerTimer = Math.max(0, this.powerTimer - dt);
      this.callbacks.onPowerUpUpdate(this.activePower, this.powerTimer);
      if (this.powerTimer <= 0) {
        this.activePower = null;
        this.shieldActive = false;
        this.callbacks.onPowerUpUpdate(null, 0);
      }
    }

    // Near miss combo timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.nearMissCombo = 0;
      }
    }

    // Horizontal Movement
    if (!this.tiltEnabled) {
      if (this.leftHeld) this.targetX -= 10 * dt;
      if (this.rightHeld) this.targetX += 10 * dt;
    }
    this.targetX = THREE.MathUtils.clamp(this.targetX, -3.25, 3.25);
    this.currentX += (this.targetX - this.currentX) * Math.min(1, dt * 15);
    this.ballGroup.position.x = this.currentX;

    // Jumping physics
    const item = this.equippedBallItem;
    if (this.isJumping) {
      this.ballGroup.position.y += this.jumpVelocity * dt;
      this.jumpVelocity -= 22 * dt;

      if (this.ballGroup.position.y <= BALL_RADIUS && this.jumpVelocity < 0) {
        this.ballGroup.position.y = BALL_RADIUS;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.airJumpUsed = false;
        this.landingBounce = 1.0;
        audio.land(item.id === 'lava');

        // Shockwave impact effect
        if (item.id === 'solar_hyperdrive' || item.id === 'lava') {
          this.shockwaveTimer = 0.5;
          this.shockwaveRing.position.x = this.ballGroup.position.x;
          this.shockwaveRing.position.z = this.ballGroup.position.z;
        }
      }
    } else if (this.landingBounce > 0) {
      this.landingBounce = Math.max(0, this.landingBounce - dt * 4.2);
      this.ballGroup.position.y = BALL_RADIUS + Math.sin((1 - this.landingBounce) * Math.PI) * 0.25 * item.bounceBoost;
    } else {
      this.ballGroup.position.y = BALL_RADIUS + Math.abs(Math.sin(performance.now() * 0.012)) * 0.02;
    }

    // Shockwave expansion
    if (this.shockwaveTimer > 0) {
      this.shockwaveTimer -= dt;
      const progress = 1 - (this.shockwaveTimer / 0.5);
      const scale = 1 + progress * 5;
      this.shockwaveRing.scale.set(scale, scale, 1);
      (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.8;
    } else {
      (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    // Squash & Stretch
    if (this.isJumping) {
      const v = Math.min(1, Math.abs(this.jumpVelocity) / 8.0);
      this.ball.scale.set(1 - 0.1 * v, 1 + 0.15 * v, 1 - 0.1 * v);
    } else if (this.landingBounce > 0) {
      this.ball.scale.set(1 + 0.15 * this.landingBounce, 1 - 0.18 * this.landingBounce, 1 + 0.15 * this.landingBounce);
    } else {
      this.ball.scale.lerp(_tempVec3.set(1, 1, 1), Math.min(1, dt * 12));
    }

    // Ball Rolling Rotation
    const speedMult = this.activePower === 'speed' ? 1.35 : 1.0;
    this.speed = Math.min(26, 14 + this.distance * 0.0035) * speedMult;
    this.distance += this.speed * dt;
    this.score = Math.floor(this.distance * 2) + this.coinCount * 25 + this.nearMissCombo * 100;

    this.ball.rotation.x -= this.speed * dt * 2.2;
    this.ball.rotation.z = THREE.MathUtils.clamp((this.targetX - this.currentX) * -0.22, -0.4, 0.4);

    // Ball Shadow Grounding
    const heightAboveRoad = Math.max(0, this.ballGroup.position.y - BALL_RADIUS);
    const shadowScale = 1 + Math.min(1, heightAboveRoad / 1.8) * 0.6;
    this.ballShadow.position.x = this.ballGroup.position.x;
    this.ballShadow.position.z = this.ballGroup.position.z;
    this.ballShadow.scale.set(shadowScale, shadowScale * 0.6, 1);
    (this.ballShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.08, 0.45 - heightAboveRoad * 0.2);

    // Invulnerability flashing
    this.ball.visible = this.invulnerable <= 0 || Math.floor(performance.now() / 140) % 2 === 0;

    // Trail particles
    this.ballParticles.forEach((p, i) => {
      const shouldShow = item.power >= 2 || this.isJumping || this.activePower === 'speed';
      p.visible = shouldShow;
      if (shouldShow) {
        p.position.set(
          this.ballGroup.position.x + (Math.random() - 0.5) * 0.1,
          this.ballGroup.position.y + (Math.random() - 0.5) * 0.1,
          this.ballGroup.position.z + 0.35 + i * 0.22
        );
        (p.material as THREE.MeshBasicMaterial).opacity = (1 - (i + 1) / this.ballParticles.length) * 0.6;
      }
    });

    // Highway & Scenery Infinite Scrolling
    this.roads.forEach(seg => {
      seg.position.z += this.speed * dt;
      if (seg.position.z > 45) {
        const minZ = Math.min(...this.roads.map(r => r.position.z));
        seg.position.z = minZ - 45;
      }
    });

    this.buildings.forEach(b => {
      b.group.position.z += this.speed * dt;
      if (b.group.position.z > 25) {
        b.group.position.z -= 450;
      }
    });

    this.lamps.forEach(l => {
      l.position.z += this.speed * dt;
      if (l.position.z > 22) l.position.z -= 230;
    });

    // Enemy ball behaviors
    const activeEnemyCount = this.distance < 150 ? 1 : this.distance < 450 ? 2 : 3;
    this.enemies.forEach((e, idx) => {
      if (idx >= activeEnemyCount) {
        e.active = false;
        e.group.visible = false;
        return;
      }

      if (!e.active) {
        e.active = true;
        e.group.visible = true;
        e.lane = Math.floor(Math.random() * 3);
        e.targetX = LANES[e.lane];
        e.group.position.set(LANES[e.lane], 0, -95 - Math.random() * 20);
      }

      // Lane tracking AI: adapts if ahead of player
      e.steerTimer -= dt;
      const aheadZ = -e.group.position.z + this.ballGroup.position.z;
      if (e.steerTimer <= 0 && aheadZ > 15 && aheadZ < 55) {
        const playerLaneIdx = THREE.MathUtils.clamp(Math.round((this.currentX - LANES[0]) / 3.25), 0, 2);
        const diff = playerLaneIdx - e.lane;

        const switchChance = e.type === 'viper' ? 0.75 : e.type === 'brimstone' ? 0.5 : 0.3;
        if (diff !== 0 && Math.random() < switchChance) {
          e.lane += Math.sign(diff);
        } else if (Math.random() < 0.25) {
          e.lane = THREE.MathUtils.clamp(e.lane + (Math.random() < 0.5 ? -1 : 1), 0, 2);
        }

        e.targetX = LANES[e.lane];
        e.steerTimer = e.type === 'viper' ? 1.8 : 3.2;
      }

      // Smooth enemy lane transition
      e.group.position.x += (e.targetX - e.group.position.x) * Math.min(1, dt * 4.5);

      const enemyForwardSpeed = this.speed * 0.65 + 1.2;
      e.group.position.z += enemyForwardSpeed * dt;
      e.bodyMesh.rotation.x -= enemyForwardSpeed * dt * 2.5;

      // Enemy Collision Check
      const dz = Math.abs(e.group.position.z - this.ballGroup.position.z);
      const dx = Math.abs(e.group.position.x - this.ballGroup.position.x);
      const isPlayerLow = this.ballGroup.position.y < BALL_RADIUS + 0.55;

      if (dz < 0.85 && dx < 0.65 && isPlayerLow && e.cooldown <= 0) {
        this.handleDamage(true);
        e.cooldown = 3.0;
        e.group.position.z = -90 - Math.random() * 20;
      } else if (dz < 1.2 && dx > 0.65 && dx < 1.35 && isPlayerLow) {
        this.registerNearMiss();
      }

      e.cooldown = Math.max(0, e.cooldown - dt);
      if (e.group.position.z > 8) {
        e.group.position.z = -95 - Math.random() * 25;
        e.lane = Math.floor(Math.random() * 3);
        e.targetX = LANES[e.lane];
      }
    });

    // Obstacle Waves & Collisions
    this.waves.forEach(w => {
      w.group.position.z += this.speed * dt;
      const dz = Math.abs(w.group.position.z - this.ballGroup.position.z);

      if (!w.hit && dz < 1.1) {
        for (const b of w.barriers) {
          const bw = b.userData.width || 2.95;
          const bh = b.userData.height || 0.9;
          const dx = Math.abs(this.ballGroup.position.x - b.position.x);
          const isOverlapX = dx < bw / 2 + BALL_RADIUS * 0.5;
          const isUnderBarrier = (this.ballGroup.position.y - BALL_RADIUS) < bh;

          if (isOverlapX) {
            if (isUnderBarrier) {
              this.handleDamage(false);
              w.hit = true;
              break;
            } else {
              this.callbacks.onObstacleJumped();
            }
          } else if (dx < bw / 2 + 1.1 && isUnderBarrier) {
            this.registerNearMiss();
          }
        }
      }

      // Recycle wave to far horizon
      if (w.group.position.z > 12) {
        const minZ = Math.min(...this.waves.map(wv => wv.group.position.z));
        w.group.position.z = minZ - 26;
        w.hit = false;
        w.safeLane = Math.floor(Math.random() * 3);
      }
    });

    // Realistic 3D Coins collection & magnet attraction
    const isMagnetActive = this.activePower === 'magnet';
    this.coins.forEach(c => {
      c.group.position.z += this.speed * dt;

      // Realistic 3D Coin Spin & Floating Wobble
      c.meshGroup.rotation.y += dt * 3.8;
      c.meshGroup.position.y = Math.sin(performance.now() * 0.006 + c.group.position.z * 0.2) * 0.08;

      // Magnet pulls coins towards player
      if (isMagnetActive && !c.taken) {
        const distZ = c.group.position.z - this.ballGroup.position.z;
        const distX = c.group.position.x - this.ballGroup.position.x;
        const distTotal = Math.sqrt(distZ * distZ + distX * distX);

        if (distTotal < 7.5) {
          c.group.position.x += (this.ballGroup.position.x - c.group.position.x) * Math.min(1, dt * 7.5);
          c.group.position.z += (this.ballGroup.position.z - c.group.position.z) * Math.min(1, dt * 7.5);
        }
      }

      // Coin pickup check
      const dz = Math.abs(c.group.position.z - this.ballGroup.position.z);
      const dx = Math.abs(c.group.position.x - this.ballGroup.position.x);
      const dy = Math.abs(c.group.position.y - this.ballGroup.position.y);

      if (!c.taken && dz < 1.05 && dx < 0.85 && dy < 1.35) {
        c.taken = true;
        c.group.visible = false;
        this.coinCount++;
        audio.coin();
      }

      // Recycle coin to horizon
      if (c.group.position.z > 8) {
        c.group.position.z = -160 - Math.random() * 30;
        c.lane = Math.floor(Math.random() * 3);
        c.group.position.x = LANES[c.lane];
        c.taken = false;
        c.group.visible = true;
      }
    });

    // Power-up pickups
    this.powerUps.forEach(p => {
      p.group.position.z += this.speed * dt;
      p.group.rotation.y += dt * 2.2;
      p.group.position.y = 0.15 + Math.sin(performance.now() * 0.005 + p.phase) * 0.12;

      const dz = Math.abs(p.group.position.z - this.ballGroup.position.z);
      const dx = Math.abs(p.group.position.x - this.ballGroup.position.x);

      if (dz < 1.2 && dx < 0.95) {
        this.activatePowerUp(p.type);
        p.group.position.z = -200 - Math.random() * 50;
        p.group.position.x = LANES[Math.floor(Math.random() * 3)];
      }

      if (p.group.position.z > 8) {
        p.group.position.z = -200 - Math.random() * 50;
        p.group.position.x = LANES[Math.floor(Math.random() * 3)];
      }
    });

    // Camera follow smoothly
    this.camera.position.x += (this.currentX * 0.4 - this.camera.position.x) * Math.min(1, dt * 4.5);
    this.camera.lookAt(this.currentX * 0.2, 1.2, -12);

    this.callbacks.onScoreUpdate(this.score, this.coinCount, Math.floor(this.distance));
  }

  private registerNearMiss() {
    this.nearMissCombo++;
    this.comboResetTimer = 4.0;
    audio.nearMiss();
    this.callbacks.onNearMiss(this.nearMissCombo);
  }

  private activatePowerUp(type: PowerUpType) {
    this.activePower = type;
    this.powerTimer = type === 'shield' ? 12 : type === 'speed' ? 7 : 10;
    if (type === 'shield') this.shieldActive = true;
    audio.powerUp();
    this.callbacks.onPowerUpUpdate(type, this.powerTimer);
  }

  private animate() {
    this.frameId = requestAnimationFrame(this.animate);
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000 || 0, 0.04);
    this.lastTime = now;

    if (this.isRunning && !this.isPaused) {
      this.update(dt);
    } else {
      // Menu idle animation: rotate hero ball & gentle camera sway
      if (this.ball) {
        this.ball.rotation.y += dt * 0.8;
        this.ball.rotation.x += dt * 0.3;
      }
      this.camera.position.x = Math.sin(now * 0.0006) * 1.5;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    if (!this.camera || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public destroy() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
