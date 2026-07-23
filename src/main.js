import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f8fb);
scene.fog = new THREE.Fog(0xf7f8fb, 32, 70);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
camera.position.set(15, 13, 22);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 6.5, 0);
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 10;
controls.maxDistance = 42;

const layers = {
  fronthaul: new THREE.Group(),
  backhaul: new THREE.Group(),
  power: new THREE.Group(),
  ground: new THREE.Group(),
  monitoring: new THREE.Group(),
};
Object.values(layers).forEach((group) => scene.add(group));

const mat = {
  steel: new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.72, roughness: 0.32 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x39424c, metalness: 0.6, roughness: 0.36 }),
  antenna: new THREE.MeshStandardMaterial({ color: 0xf3f5f7, metalness: 0.2, roughness: 0.38 }),
  cabinet: new THREE.MeshStandardMaterial({ color: 0xdfe5eb, metalness: 0.35, roughness: 0.28 }),
  module: new THREE.MeshStandardMaterial({ color: 0x2f3945, metalness: 0.35, roughness: 0.5 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x7fc8ff, metalness: 0.1, roughness: 0.22, transparent: true, opacity: 0.72 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xd9d5cc, roughness: 0.72 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x91b98f, roughness: 0.85 }),
  cloud: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 0.2 }),
};

const cableMaterials = {
  fronthaul: new THREE.MeshStandardMaterial({ color: 0xf2c94c, emissive: 0x5f4a00, emissiveIntensity: 0.18 }),
  backhaul: new THREE.MeshStandardMaterial({ color: 0x2d9cdb, emissive: 0x06344d, emissiveIntensity: 0.22 }),
  dc: new THREE.MeshStandardMaterial({ color: 0xeb5757, emissive: 0x4b1111, emissiveIntensity: 0.18 }),
  ac: new THREE.MeshStandardMaterial({ color: 0xf2994a, emissive: 0x512500, emissiveIntensity: 0.16 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x27ae60, emissive: 0x073b1d, emissiveIntensity: 0.18 }),
  monitoring: new THREE.MeshStandardMaterial({ color: 0x9b51e0, emissive: 0x2b0a49, emissiveIntensity: 0.18 }),
};

function roundedBox(width, height, depth, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 3, 3, 3);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinderBetween(start, end, radius, material, radialSegments = 12) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, radialSegments);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

function cable(points, material, radius = 0.035) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.TubeGeometry(curve, 80, radius, 10, false);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function label(text, position, color = "#1e293b") {
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = 512;
  spriteCanvas.height = 128;
  const ctx = spriteCanvas.getContext("2d");
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = "rgba(20,40,70,0.16)";
  ctx.lineWidth = 4;
  ctx.roundRect(12, 20, 488, 82, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "600 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 63);
  const texture = new THREE.CanvasTexture(spriteCanvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.set(...position);
  sprite.scale.set(2.6, 0.65, 1);
  scene.add(sprite);
  return sprite;
}

function buildGround() {
  const slab = roundedBox(12, 0.35, 10, mat.concrete);
  slab.position.set(0, -0.18, 0);
  scene.add(slab);

  const soil = roundedBox(13, 0.5, 11, new THREE.MeshStandardMaterial({ color: 0x8b6445, roughness: 0.95 }));
  soil.position.set(0, -0.62, 0);
  scene.add(soil);
}

function buildTower() {
  const tower = new THREE.Group();
  const levels = 8;
  const height = 15;
  const baseHalf = 2.35;
  const topHalf = 0.95;
  const corners = [];

  for (let i = 0; i <= levels; i += 1) {
    const y = (height / levels) * i;
    const half = baseHalf + (topHalf - baseHalf) * (i / levels);
    corners.push([
      new THREE.Vector3(-half, y, -half),
      new THREE.Vector3(half, y, -half),
      new THREE.Vector3(half, y, half),
      new THREE.Vector3(-half, y, half),
    ]);
  }

  for (let i = 0; i < levels; i += 1) {
    for (let c = 0; c < 4; c += 1) {
      tower.add(cylinderBetween(corners[i][c], corners[i + 1][c], 0.055, mat.steel));
      tower.add(cylinderBetween(corners[i][c], corners[i + 1][(c + 1) % 4], 0.035, mat.steel));
    }
  }

  for (let i = 0; i <= levels; i += 1) {
    for (let c = 0; c < 4; c += 1) {
      tower.add(cylinderBetween(corners[i][c], corners[i][(c + 1) % 4], 0.04, mat.steel));
    }
  }

  tower.add(cylinderBetween(new THREE.Vector3(0, height - 0.2, 0), new THREE.Vector3(0, height + 3.2, 0), 0.1, mat.darkSteel, 18));
  scene.add(tower);
  label("Steel lattice tower", [-3.7, 9.2, -2.4]);
}

function buildAntennas() {
  const positions = [
    [-1.65, 15.6, -1.15, -0.2],
    [1.65, 15.6, -1.15, 0.2],
    [-1.65, 14.0, 1.15, Math.PI - 0.2],
    [1.65, 14.0, 1.15, Math.PI + 0.2],
  ];

  positions.forEach(([x, y, z, ry], index) => {
    const antenna = roundedBox(0.48, 3.0, 0.25, mat.antenna);
    antenna.position.set(x, y, z);
    antenna.rotation.y = ry;
    scene.add(antenna);

    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), new THREE.MeshStandardMaterial({ color: 0x1c6be3 }));
    badge.position.set(x, y + 0.55, z + (z < 0 ? -0.14 : 0.14));
    badge.rotation.y = ry;
    scene.add(badge);

    layers.fronthaul.add(cable([[x, y - 1.4, z], [x * 0.7, 12.2, z * 0.5], [0.35 - index * 0.18, 5.2, 0.2]], cableMaterials.fronthaul, 0.045));
  });

  const timing = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 16), mat.antenna);
  timing.scale.set(1.25, 0.72, 1.25);
  timing.position.set(0, 18.25, 0.18);
  scene.add(timing);

  scene.add(cylinderBetween(new THREE.Vector3(-0.65, 18.1, -0.35), new THREE.Vector3(-0.65, 19.25, -0.35), 0.06, mat.darkSteel));
  label("AAU / RU antenna array", [3.65, 15.2, -1.6]);
  label("GPS / BeiDou timing", [-2.8, 18.1, 0.4]);
}

function buildCabinet() {
  const cabinet = new THREE.Group();
  const body = roundedBox(3.4, 5.2, 1.35, mat.cabinet);
  body.position.set(0, 2.55, 2.3);
  cabinet.add(body);

  const doorL = roundedBox(0.08, 5.1, 1.25, mat.cabinet);
  doorL.position.set(-1.98, 2.55, 2.34);
  doorL.rotation.y = -0.42;
  cabinet.add(doorL);

  const doorR = roundedBox(0.08, 5.1, 1.25, mat.cabinet);
  doorR.position.set(1.98, 2.55, 2.34);
  doorR.rotation.y = 0.42;
  cabinet.add(doorR);

  ["DU", "CU", "ODF", "Rectifier", "Battery", "EC"].forEach((name, i) => {
    const y = 4.75 - i * 0.72;
    const unit = roundedBox(2.65, 0.52, 0.12, mat.module);
    unit.position.set(0, y, 1.58);
    cabinet.add(unit);
    const face = roundedBox(0.48, 0.28, 0.04, mat.glass);
    face.position.set(0.83, y, 1.49);
    cabinet.add(face);
    label(name, [1.85, y, 1.55], name === "DU" || name === "CU" ? "#1d4ed8" : "#334155");
  });

  scene.add(cabinet);
  label("Base equipment cabinet", [-3.25, 4.7, 2.3]);

  layers.power.add(cable([[0.85, 3.1, 1.45], [1.75, 2.4, 2.5], [4.8, 0.1, 3.2]], cableMaterials.dc, 0.055));
  layers.power.add(cable([[-0.85, 2.4, 1.45], [-1.8, 1.4, 2.7], [-5.2, 0.1, 3.4]], cableMaterials.ac, 0.055));
  layers.ground.add(cable([[1.1, 1.2, 1.45], [2.9, 0.2, 2.6], [3.5, -0.4, 4.5]], cableMaterials.ground, 0.05));
  layers.monitoring.add(cable([[-0.2, 1.0, 1.45], [-1.2, 0.3, 2.8], [-0.6, -0.35, 4.8]], cableMaterials.monitoring, 0.045));
}

function buildExternalSystems() {
  const powerBox = roundedBox(1.7, 1.9, 1.35, mat.cabinet);
  powerBox.position.set(-5.2, 0.95, 2.65);
  scene.add(powerBox);
  label("AC input", [-5.2, 2.45, 2.65]);

  const rod = cylinderBetween(new THREE.Vector3(3.8, -0.55, 4.6), new THREE.Vector3(3.8, 1.1, 4.6), 0.055, cableMaterials.ground);
  scene.add(rod);
  label("Ground / SPD", [4.15, 1.55, 4.55], "#166534");

  const dataCenter = new THREE.Group();
  const base = roundedBox(3.1, 0.32, 2.2, mat.concrete);
  base.position.set(6.2, 0.16, -2.9);
  dataCenter.add(base);
  for (let i = 0; i < 4; i += 1) {
    const rack = roundedBox(0.48, 1.9, 0.72, mat.module);
    rack.position.set(5.25 + i * 0.62, 1.25, -2.9);
    dataCenter.add(rack);
    const glow = roundedBox(0.3, 1.45, 0.04, mat.glass);
    glow.position.set(5.25 + i * 0.62, 1.25, -3.28);
    dataCenter.add(glow);
  }
  scene.add(dataCenter);
  label("Edge data center / MEC", [6.2, 2.75, -2.9], "#075985");

  layers.backhaul.add(cable([[0.65, 4.0, 1.45], [3.0, 4.8, 0.5], [6.2, 2.4, -2.9]], cableMaterials.backhaul, 0.045));

  const cloudGroup = new THREE.Group();
  [[0, 0, 0, 0.58], [0.55, 0.05, 0, 0.42], [-0.55, 0.02, 0, 0.42], [0.05, 0.38, 0, 0.5]].forEach(([x, y, z, r]) => {
    const part = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), mat.cloud);
    part.position.set(x, y, z);
    cloudGroup.add(part);
  });
  cloudGroup.position.set(8.2, 5.2, -4.2);
  scene.add(cloudGroup);
  layers.backhaul.add(cable([[6.9, 2.2, -2.9], [7.4, 3.8, -3.5], [8.2, 5.0, -4.2]], cableMaterials.backhaul, 0.035));
  label("5GC core cloud", [8.2, 6.2, -4.1], "#0369a1");
}

function buildLights() {
  const hemi = new THREE.HemisphereLight(0xffffff, 0xb2c0d0, 2.1);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(8, 16, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -8;
  scene.add(key);

  const rim = new THREE.PointLight(0x8ad3ff, 45, 30);
  rim.position.set(-6, 8, -7);
  scene.add(rim);
}

function setupToggles() {
  const toggleRoot = document.querySelector("#layerToggles");
  [
    ["fronthaul", "eCPRI fronthaul"],
    ["backhaul", "Backhaul / 5GC"],
    ["power", "AC and -48V power"],
    ["ground", "Grounding"],
    ["monitoring", "Monitoring"],
  ].forEach(([key, labelText]) => {
    const button = document.createElement("button");
    button.className = "layer-toggle active";
    button.type = "button";
    button.innerHTML = `<span></span>${labelText}`;
    button.addEventListener("click", () => {
      layers[key].visible = !layers[key].visible;
      button.classList.toggle("active", layers[key].visible);
    });
    toggleRoot.appendChild(button);
  });
}

function resize() {
  const { clientWidth, clientHeight } = renderer.domElement.parentElement;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

buildGround();
buildTower();
buildAntennas();
buildCabinet();
buildExternalSystems();
buildLights();
setupToggles();
resize();
window.addEventListener("resize", resize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
