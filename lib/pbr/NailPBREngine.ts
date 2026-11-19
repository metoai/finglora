import * as THREE from 'three';
import { NailDesign, NailShape } from '@/types/nail';
import { generateNailTextureCanvas } from './NailTextureGenerator';

/**
 * Builds a parametric 3D Dual-Curved Nail Geometry with authentic
 * transverse C-Curve arch, longitudinal stress apex, and shape silhouettes.
 */
export function create3DNailGeometry(
  shape: NailShape = 'coffin',
  lengthScale = 1.0,
  widthScale = 1.0
): THREE.BufferGeometry {
  const uSegments = 32;
  const vSegments = 48;
  const vertices: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Physical dimensions (in 3D units, normalized)
  const length = 2.4 * lengthScale;
  const baseHalfWidth = 0.8 * widthScale;

  for (let iv = 0; iv <= vSegments; iv++) {
    const v = iv / vSegments; // 0 = free edge tip, 1 = cuticle base
    const y = (0.5 - v) * length;

    // Longitudinal profile: apex peak at v = 0.45 from cuticle
    const apexPos = 0.45;
    const apexHeight = 0.28;
    const longitudinalArch =
      Math.sin(Math.PI * Math.pow(v, 0.85)) * apexHeight * (1 - 0.3 * Math.abs(v - apexPos));

    // Contour width profile based on nail shape
    let widthFactor = 1.0;
    if (shape === 'coffin') {
      // Tapered walls with flat cut square tip
      if (v < 0.85) {
        widthFactor = 0.65 + (v / 0.85) * 0.35;
      } else {
        widthFactor = 1.0 - Math.pow((v - 0.85) / 0.15, 2) * 0.12;
      }
    } else if (shape === 'almond') {
      // Continuous organic convergence to a soft oval tip
      widthFactor = Math.sin(Math.pow(1 - v, 0.65) * Math.PI * 0.5) * 0.85 + 0.15;
    } else if (shape === 'stiletto') {
      // Direct taper to a sharp pointed tip
      widthFactor = Math.max(0.06, Math.pow(v, 0.85));
    } else if (shape === 'oval') {
      // Gentle curve at tip and cuticle
      widthFactor = Math.sin(Math.PI * v * 0.9 + 0.15);
    } else {
      // Square: parallel walls
      widthFactor = v > 0.88 ? 1.0 - (v - 0.88) * 0.8 : 1.0;
    }

    const currentHalfWidth = baseHalfWidth * Math.max(0.08, widthFactor);

    for (let iu = 0; iu <= uSegments; iu++) {
      const uNorm = (iu / uSegments) * 2 - 1; // -1 to +1 across width
      const x = uNorm * currentHalfWidth;

      // Transverse C-Curve: parabolic arch (cross-sectional curvature)
      const cCurveDepth = 0.26 * currentHalfWidth;
      const zCurvature = (1 - uNorm * uNorm) * cCurveDepth;
      const z = longitudinalArch + zCurvature;

      vertices.push(x, y, z);
      uvs.push(iu / uSegments, v);

      // Normal approximation: gradient of surface
      const nx = uNorm * 0.7;
      const ny = (v - 0.5) * 0.25;
      const nz = 0.85;
      const len = Math.hypot(nx, ny, nz);
      normals.push(nx / len, ny / len, nz / len);
    }
  }

  // Generate triangle faces
  for (let iv = 0; iv < vSegments; iv++) {
    for (let iu = 0; iu < uSegments; iu++) {
      const a = iv * (uSegments + 1) + iu;
      const b = (iv + 1) * (uSegments + 1) + iu;
      const c = (iv + 1) * (uSegments + 1) + (iu + 1);
      const d = iv * (uSegments + 1) + (iu + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Creates the Physically Based Material (PBR) for a NailDesign,
 * configuring optical clearcoat, transmission, and environmental sheen.
 */
export function createNailPBRMaterial(nail: NailDesign): THREE.MeshPhysicalMaterial {
  const canvas = generateNailTextureCanvas(nail);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const isChrome = nail.finish === 'chrome';
  const isMatte = nail.finish === 'matte';
  const isGlitter = nail.finish === 'glitter';

  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: isMatte ? 0.85 : isChrome ? 0.12 : 0.04,
    metalness: isChrome ? 0.88 : 0.0,
    clearcoat: isMatte ? 0.0 : 1.0,
    clearcoatRoughness: isMatte ? 1.0 : isGlitter ? 0.08 : 0.03,
    ior: 1.52, // Optical index of cured acrylic/gel
    reflectivity: isChrome ? 0.95 : 0.5,
    sheen: 0.25,
    sheenColor: new THREE.Color(0xffffff),
    specularIntensity: isMatte ? 0.15 : 1.0,
    specularColor: new THREE.Color(0xffffff),
    side: THREE.DoubleSide,
  });

  return material;
}

/**
 * Self-contained 3D PBR Nail Scene Controller for rendering
 * high-fidelity nail preview canvases with interactive lighting.
 */
export class NailPBRScene {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public nailMesh: THREE.Mesh | null = null;
  private animId: number | null = null;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 4.6);

    this.setupLighting();
  }

  private setupLighting() {
    // 1. Ambient Fill Light (Soft warm daylight)
    const ambientLight = new THREE.AmbientLight(0xfff5f8, 0.85);
    this.scene.add(ambientLight);

    // 2. Primary Key Light (Upper right specular reflection)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.5, 4.0, 3.5);
    this.scene.add(keyLight);

    // 3. Rim/Apex Specular Light (Glints across the C-curve)
    const rimLight = new THREE.DirectionalLight(0xffe4e6, 1.4);
    rimLight.position.set(-2.5, -1.0, 2.0);
    this.scene.add(rimLight);

    // 4. Subtle front bounce
    const frontLight = new THREE.PointLight(0xffffff, 0.8, 10);
    frontLight.position.set(0, 0, 3.0);
    this.scene.add(frontLight);
  }

  public updateNail(nail: NailDesign) {
    if (this.nailMesh) {
      this.scene.remove(this.nailMesh);
      this.nailMesh.geometry.dispose();
      if (Array.isArray(this.nailMesh.material)) {
        this.nailMesh.material.forEach((m) => m.dispose());
      } else {
        this.nailMesh.material.dispose();
      }
    }

    const lengthScale = nail.length === 'short' ? 0.82 : nail.length === 'long' ? 1.18 : 1.0;
    const geometry = create3DNailGeometry(nail.shape || 'coffin', lengthScale, 1.0);
    const material = createNailPBRMaterial(nail);

    this.nailMesh = new THREE.Mesh(geometry, material);
    // Slight default tilt to catch the apex light
    this.nailMesh.rotation.x = 0.15;
    this.scene.add(this.nailMesh);

    this.render();
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.render();
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.nailMesh) {
      this.nailMesh.geometry.dispose();
      if (Array.isArray(this.nailMesh.material)) {
        this.nailMesh.material.forEach((m) => m.dispose());
      } else {
        this.nailMesh.material.dispose();
      }
    }
    this.renderer.dispose();
  }
}
