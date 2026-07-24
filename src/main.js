import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/controls/OrbitControls.js";
import { getComponentDisplay, getLayerConfig, getModel, getModelDisplay, getModels, getSceneLabel, summarizeModel } from "./towerSpec.js?v=ship-reference-2";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f8fb);
scene.fog = new THREE.Fog(0xf7f8fb, 34, 86);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);
camera.position.set(9, 8, 13);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2.6, 0);
controls.minDistance = 5;
controls.maxDistance = 34;

const locale = document.documentElement.lang;
const modelRoot = new THREE.Group();
const labelRoot = new THREE.Group();
scene.add(modelRoot, labelRoot);

let activeModelId = new URLSearchParams(window.location.search).get("model") || "transmitter";
let activeLayers = {};

const mat = {
  cabinet: new THREE.MeshStandardMaterial({ color: 0xdfe5eb, metalness: 0.34, roughness: 0.32 }),
  door: new THREE.MeshStandardMaterial({ color: 0xcfd6de, metalness: 0.35, roughness: 0.35 }),
  module: new THREE.MeshStandardMaterial({ color: 0x2f3945, metalness: 0.34, roughness: 0.48 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb6bec7, metalness: 0.72, roughness: 0.3 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x39424c, metalness: 0.62, roughness: 0.36 }),
  antenna: new THREE.MeshStandardMaterial({ color: 0xf3f5f7, metalness: 0.2, roughness: 0.36 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x8ed4ff, metalness: 0.08, roughness: 0.18, transparent: true, opacity: 0.76 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xd9d5cc, roughness: 0.72 }),
  ocean: new THREE.MeshStandardMaterial({ color: 0x1d6d86, metalness: 0.05, roughness: 0.58, transparent: true, opacity: 0.78 }),
  hull: new THREE.MeshStandardMaterial({ color: 0x2f4658, metalness: 0.28, roughness: 0.46 }),
  solar: new THREE.MeshStandardMaterial({ color: 0x0f3f7a, metalness: 0.22, roughness: 0.26 }),
  earth: new THREE.MeshStandardMaterial({ color: 0x2b79bd, roughness: 0.74, transparent: true, opacity: 0.82 }),
  whitePanel: new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.18, roughness: 0.28 }),
  darkGlass: new THREE.MeshStandardMaterial({ color: 0x263746, metalness: 0.12, roughness: 0.18, transparent: true, opacity: 0.82 }),
  warning: new THREE.MeshStandardMaterial({ color: 0xf2c94c, emissive: 0x5f4a00, emissiveIntensity: 0.18 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xf2994a, emissive: 0x512500, emissiveIntensity: 0.16 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x2d9cdb, emissive: 0x06344d, emissiveIntensity: 0.18 }),
  green: new THREE.MeshStandardMaterial({ color: 0x27ae60, emissive: 0x073b1d, emissiveIntensity: 0.16 }),
};

const cableMaterials = {
  signal: new THREE.MeshStandardMaterial({ color: 0x2d9cdb, emissive: 0x06344d, emissiveIntensity: 0.25 }),
  power: new THREE.MeshStandardMaterial({ color: 0xf2994a, emissive: 0x512500, emissiveIntensity: 0.18 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x27ae60, emissive: 0x073b1d, emissiveIntensity: 0.18 }),
  alarm: new THREE.MeshStandardMaterial({ color: 0x9b51e0, emissive: 0x2b0a49, emissiveIntensity: 0.2 }),
  beam: new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0x8aa6d8, emissiveIntensity: 0.55, transparent: true, opacity: 0.68 }),
};

function roundedBox(width, height, depth, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 3, 3, 3), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinderBetween(start, end, radius, material, radialSegments = 14) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, radialSegments), material);
  mesh.position.copy(start).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

function cable(points, material, radius = 0.035) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, radius, 10, false), material);
  mesh.castShadow = true;
  return mesh;
}

function addToLayer(layer, object) {
  activeLayers[layer]?.add(object);
  return object;
}

function addLabel(text, position, color = "#1e293b") {
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = 512;
  spriteCanvas.height = 128;
  const ctx = spriteCanvas.getContext("2d");
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.strokeStyle = "rgba(20,40,70,0.14)";
  ctx.lineWidth = 4;
  ctx.roundRect(12, 20, 488, 82, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "600 40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 63);
  const texture = new THREE.CanvasTexture(spriteCanvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.set(...position);
  sprite.scale.set(2.7, 0.68, 1);
  labelRoot.add(sprite);
  return sprite;
}

function buildDish(position, rotation, scale = 1) {
  const dish = new THREE.Group();
  const reflector = new THREE.Mesh(new THREE.ConeGeometry(0.86 * scale, 0.32 * scale, 40, 1, true), mat.antenna);
  reflector.rotation.x = Math.PI * 0.5;
  dish.add(reflector);
  dish.add(cylinderBetween(new THREE.Vector3(0, 0, 0.03 * scale), new THREE.Vector3(0, 0.34 * scale, 0.72 * scale), 0.03 * scale, mat.darkSteel, 10));
  const feed = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 16, 8), mat.darkSteel);
  feed.position.set(0, 0.38 * scale, 0.78 * scale);
  dish.add(feed);
  dish.position.set(...position);
  dish.rotation.set(...rotation);
  return dish;
}

function buildRack(x, y, z, rows, width = 2.2) {
  const rack = new THREE.Group();
  for (let i = 0; i < rows; i += 1) {
    const unit = roundedBox(width, 0.34, 0.16, mat.module);
    unit.position.set(x, y - i * 0.43, z);
    rack.add(unit);
    const display = roundedBox(0.34, 0.16, 0.04, mat.glass);
    display.position.set(x + width * 0.28, y - i * 0.43, z - 0.1);
    rack.add(display);
    for (let j = 0; j < 4; j += 1) {
      const port = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 12), j % 2 ? mat.warning : mat.steel);
      port.rotation.x = Math.PI * 0.5;
      port.position.set(x - width * 0.36 + j * 0.18, y - i * 0.43, z - 0.105);
      rack.add(port);
    }
  }
  return rack;
}

function addCableBundle(layer, xBase, yTop, yBottom, z, colors = [cableMaterials.signal, cableMaterials.power, cableMaterials.ground, cableMaterials.alarm]) {
  colors.forEach((material, index) => {
    const x = xBase + index * 0.16;
    addToLayer(layer, cable([[x, yTop, z], [x + 0.18, (yTop + yBottom) * 0.5, z - 0.38], [x - 0.08, yBottom, z]], material, 0.026));
  });
}

function addVentSlats(layer, x, y, z, rows = 8) {
  const group = new THREE.Group();
  for (let i = 0; i < rows; i += 1) {
    const slat = roundedBox(0.95, 0.035, 0.035, mat.darkSteel);
    slat.position.set(x, y + i * 0.12, z);
    group.add(slat);
  }
  addToLayer(layer, group);
  return group;
}

function addSolarGrid(panel, cols = 4, rows = 5) {
  for (let i = 1; i < cols; i += 1) {
    const rib = roundedBox(0.025, 2.12, 0.095, mat.warning);
    rib.position.set((i - cols / 2) * 0.24, 0, -0.055);
    panel.add(rib);
  }
  for (let j = 1; j < rows; j += 1) {
    const rib = roundedBox(0.9, 0.025, 0.095, mat.warning);
    rib.position.set(0, (j - rows / 2) * 0.36, -0.055);
    panel.add(rib);
  }
}

function buildCabinetShell(width = 3.1, height = 5.0, depth = 1.35) {
  const shell = new THREE.Group();
  const body = roundedBox(width, height, depth, mat.cabinet);
  body.position.set(0, height / 2, 0);
  shell.add(body);
  const leftDoor = roundedBox(0.08, height * 0.96, depth * 0.92, mat.door);
  leftDoor.position.set(-width * 0.58, height / 2, 0.08);
  leftDoor.rotation.y = -0.48;
  shell.add(leftDoor);
  const rightDoor = roundedBox(0.08, height * 0.96, depth * 0.92, mat.door);
  rightDoor.position.set(width * 0.58, height / 2, 0.08);
  rightDoor.rotation.y = 0.48;
  shell.add(rightDoor);
  return shell;
}

function buildTransmitterModel() {
  const slab = roundedBox(6.8, 0.28, 4.8, mat.concrete);
  slab.position.set(0, -0.14, 0);
  addToLayer("enclosure", slab);

  const cabinet = buildCabinetShell(3.3, 5.6, 1.5);
  cabinet.position.set(0.35, 0, 0);
  addToLayer("enclosure", cabinet);
  addToLayer("rf", buildRack(0.35, 5.05, -0.88, 9, 2.45));

  const sideBox = roundedBox(0.75, 2.2, 0.55, mat.cabinet);
  sideBox.position.set(-2.35, 2.15, -0.2);
  addToLayer("rf", sideBox);
  addVentSlats("cooling", 1.95, 2.6, 0.36, 10);

  const powerShelf = roundedBox(2.45, 0.5, 0.18, mat.module);
  powerShelf.position.set(0.35, 0.9, -0.88);
  addToLayer("power", powerShelf);
  addCableBundle("signal", -0.75, 4.8, 1.05, -1.02);
  addCableBundle("power", 1.0, 3.9, 0.6, -1.04, [cableMaterials.power, cableMaterials.power, cableMaterials.ground]);

  const pole = cylinderBetween(new THREE.Vector3(-2.45, 0.25, -0.1), new THREE.Vector3(-2.45, 6.6, -0.1), 0.07, mat.darkSteel);
  addToLayer("antenna", pole);
  const squareAntenna = roundedBox(1.05, 1.22, 0.32, mat.whitePanel);
  squareAntenna.position.set(-2.45, 6.9, -0.12);
  addToLayer("antenna", squareAntenna);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 32), mat.steel);
  cap.position.set(-2.45, 7.6, -0.12);
  addToLayer("antenna", cap);
  addToLayer("signal", cable([[-2.25, 6.25, -0.2], [-1.35, 5.2, -0.55], [0.95, 4.7, -0.88]], cableMaterials.signal, 0.04));
  addToLayer("signal", cable([[-2.45, 6.95, -0.18], [-4.1, 7.7, -1.1], [-5.8, 7.3, -2.5]], cableMaterials.beam, 0.026));

  addLabel(getSceneLabel("transmitter-terminal", locale), [2.25, 5.35, 0.25]);
  addLabel(getSceneLabel("tx-rf-rack", locale), [-1.55, 4.25, -0.85], "#075985");
  addLabel(getSceneLabel("tx-antenna", locale), [-3.2, 7.75, -0.2], "#075985");
  camera.position.set(7.6, 6.8, 9.8);
  controls.target.set(0, 3.0, 0);
}
function buildReceiverModel() {
  const slab = roundedBox(6.4, 0.28, 4.6, mat.concrete);
  slab.position.set(0, -0.14, 0);
  addToLayer("enclosure", slab);

  const cabinet = buildCabinetShell(3.25, 5.8, 1.55);
  cabinet.position.set(0.35, 0, 0);
  addToLayer("enclosure", cabinet);
  addToLayer("rf", buildRack(0.35, 5.35, -0.92, 8, 2.45));
  addToLayer("signal", buildRack(0.35, 2.05, -0.92, 4, 2.45));
  addCableBundle("signal", -0.8, 5.0, 1.1, -1.06, [cableMaterials.signal, cableMaterials.power, cableMaterials.ground, cableMaterials.alarm, cableMaterials.signal]);

  const leftPole = cylinderBetween(new THREE.Vector3(-2.5, 0.2, -0.25), new THREE.Vector3(-2.5, 6.0, -0.25), 0.07, mat.darkSteel);
  addToLayer("antenna", leftPole);
  const panel = roundedBox(1.05, 1.1, 0.34, mat.whitePanel);
  panel.position.set(-2.5, 6.35, -0.25);
  addToLayer("antenna", panel);
  const lowerRadio = roundedBox(0.74, 1.75, 0.5, mat.cabinet);
  lowerRadio.position.set(-2.45, 3.05, -0.1);
  addToLayer("rf", lowerRadio);

  const dish = buildDish([-1.9, 4.8, -0.55], [0.12, 0.82, -0.1], 0.72);
  addToLayer("antenna", dish);
  const decoder = roundedBox(2.45, 0.48, 0.18, mat.module);
  decoder.position.set(0.35, 0.86, -0.92);
  addToLayer("signal", decoder);
  addVentSlats("cooling", 1.95, 3.05, 0.38, 12);

  addToLayer("signal", cable([[-2.45, 6.0, -0.25], [-1.25, 5.0, -0.55], [1.0, 4.8, -0.92]], cableMaterials.signal, 0.04));
  addToLayer("signal", cable([[0.75, 2.1, -0.92], [-0.15, 1.55, -0.92], [0.7, 0.88, -0.92]], cableMaterials.alarm, 0.035));
  addToLayer("power", cable([[-0.8, 0.82, -0.92], [-1.65, 0.55, -0.25], [-2.3, 0.25, 0.9]], cableMaterials.power, 0.045));

  addLabel(getSceneLabel("receiver-terminal", locale), [2.2, 5.4, 0.24]);
  addLabel(getSceneLabel("rx-antenna", locale), [-3.3, 6.9, -0.25], "#075985");
  addLabel(getSceneLabel("rx-decoder", locale), [2.1, 1.3, -0.85], "#6d28d9");
  camera.position.set(7.4, 6.8, 9.6);
  controls.target.set(0, 3.0, 0);
}
function buildShipModel() {
  const ocean = roundedBox(13.8, 0.08, 7.4, mat.ocean);
  ocean.position.set(0, -0.1, 0);
  addToLayer("hull", ocean);
  for (let i = 0; i < 10; i += 1) {
    const foam = cable([[-6.2 + i * 1.3, 0.02, -1.85], [-5.75 + i * 1.3, 0.04, -2.25], [-5.25 + i * 1.3, 0.02, -1.9]], cableMaterials.beam, 0.018);
    addToLayer("hull", foam);
  }

  const hull = new THREE.Group();
  const mainHull = roundedBox(9.0, 0.92, 1.72, mat.hull);
  mainHull.position.set(0.15, 0.56, 0);
  hull.add(mainHull);
  const upperHull = roundedBox(8.1, 0.46, 1.42, mat.hull);
  upperHull.position.set(-0.05, 1.02, 0);
  hull.add(upperHull);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.7, 4), mat.hull);
  bow.rotation.z = -Math.PI * 0.5;
  bow.rotation.y = Math.PI * 0.25;
  bow.position.set(-5.0, 0.72, 0);
  hull.add(bow);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 16), mat.hull);
  bulb.scale.set(1.25, 0.72, 0.62);
  bulb.position.set(-5.45, 0.18, 0);
  hull.add(bulb);
  const redKeel = roundedBox(8.0, 0.18, 1.48, new THREE.MeshStandardMaterial({ color: 0x8f3b2f, roughness: 0.5 }));
  redKeel.position.set(0.2, 0.06, 0);
  hull.add(redKeel);
  addToLayer("hull", hull);

  const deck = roundedBox(7.4, 0.28, 1.5, mat.whitePanel);
  deck.position.set(-0.25, 1.25, 0);
  addToLayer("deck", deck);
  const bridgeBase = roundedBox(2.9, 0.8, 1.18, mat.whitePanel);
  bridgeBase.position.set(-2.45, 1.85, 0);
  addToLayer("deck", bridgeBase);
  const bridgeTop = roundedBox(2.35, 0.72, 1.08, mat.whitePanel);
  bridgeTop.position.set(-2.55, 2.55, 0);
  addToLayer("deck", bridgeTop);
  for (let row = 0; row < 2; row += 1) {
    for (let i = 0; i < 8; i += 1) {
      const window = roundedBox(0.23, 0.2, 0.045, mat.darkGlass);
      window.position.set(-3.38 + i * 0.27, 2.0 + row * 0.62, -0.61);
      addToLayer("deck", window);
    }
  }
  for (let i = 0; i < 14; i += 1) {
    const post = cylinderBetween(new THREE.Vector3(-4.1 + i * 0.55, 1.34, -0.86), new THREE.Vector3(-4.1 + i * 0.55, 1.78, -0.86), 0.012, mat.steel, 8);
    addToLayer("deck", post);
  }
  addToLayer("deck", cylinderBetween(new THREE.Vector3(-4.35, 1.76, -0.86), new THREE.Vector3(3.4, 1.76, -0.86), 0.014, mat.steel, 8));

  const forwardWinch = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 24), mat.darkSteel);
  forwardWinch.rotation.z = Math.PI * 0.5;
  forwardWinch.position.set(-4.05, 1.48, -0.42);
  addToLayer("deck", forwardWinch);
  const craneBoom = cylinderBetween(new THREE.Vector3(4.15, 1.65, 0.45), new THREE.Vector3(5.8, 2.35, 0.42), 0.045, mat.steel, 10);
  addToLayer("deck", craneBoom);
  addToLayer("deck", cylinderBetween(new THREE.Vector3(4.15, 1.18, 0.45), new THREE.Vector3(4.15, 2.0, 0.45), 0.055, mat.darkSteel, 12));

  const bayFrame = roundedBox(2.05, 1.42, 0.24, mat.whitePanel);
  bayFrame.position.set(1.45, 1.9, -0.86);
  addToLayer("rf", bayFrame);
  addToLayer("rf", buildRack(1.05, 2.42, -1.02, 4, 0.72));
  addToLayer("rf", buildRack(1.85, 2.42, -1.02, 4, 0.72));
  addCableBundle("signal", 0.75, 2.58, 1.15, -1.14, [cableMaterials.signal, cableMaterials.power, cableMaterials.ground, cableMaterials.alarm, cableMaterials.signal]);
  const aftBay = roundedBox(1.45, 1.15, 0.22, mat.module);
  aftBay.position.set(3.3, 1.68, -0.82);
  addToLayer("rf", aftBay);
  addCableBundle("signal", 2.92, 2.0, 1.1, -1.05, [cableMaterials.power, cableMaterials.signal, cableMaterials.ground]);

  const mastA = cylinderBetween(new THREE.Vector3(-0.55, 1.35, 0), new THREE.Vector3(-0.55, 6.75, 0), 0.065, mat.darkSteel);
  const mastB = cylinderBetween(new THREE.Vector3(0.15, 1.35, 0), new THREE.Vector3(0.15, 6.25, 0), 0.055, mat.darkSteel);
  const mastC = cylinderBetween(new THREE.Vector3(-0.2, 1.35, -0.48), new THREE.Vector3(-0.2, 5.9, -0.48), 0.045, mat.darkSteel);
  addToLayer("mast", mastA);
  addToLayer("mast", mastB);
  addToLayer("mast", mastC);
  for (let y = 2.05; y < 6.35; y += 0.62) {
    addToLayer("mast", cylinderBetween(new THREE.Vector3(-0.9, y, -0.52), new THREE.Vector3(0.55, y + 0.48, 0.42), 0.022, mat.steel));
    addToLayer("mast", cylinderBetween(new THREE.Vector3(-0.9, y, 0.42), new THREE.Vector3(0.55, y + 0.48, -0.52), 0.022, mat.steel));
    addToLayer("mast", cylinderBetween(new THREE.Vector3(-0.88, y, -0.52), new THREE.Vector3(0.55, y, -0.52), 0.018, mat.steel, 8));
  }
  for (const x of [-1.2, 0.65, 1.0]) {
    const whip = cylinderBetween(new THREE.Vector3(x, 3.0, 0.55), new THREE.Vector3(x, 5.8 + Math.abs(x) * 0.7, 0.55), 0.012, mat.darkSteel, 8);
    addToLayer("antenna", whip);
  }
  const domeLarge = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 16), mat.antenna);
  domeLarge.position.set(-1.15, 4.3, 0.34);
  domeLarge.scale.y = 0.72;
  addToLayer("antenna", domeLarge);
  const domeSmall = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 12), mat.antenna);
  domeSmall.position.set(-2.95, 2.95, 0.55);
  domeSmall.scale.y = 0.75;
  addToLayer("antenna", domeSmall);
  const midDish = buildDish([-0.95, 3.95, -0.45], [0.12, 0.55, -0.08], 0.48);
  addToLayer("antenna", midDish);

  const dishTowerBase = cylinderBetween(new THREE.Vector3(2.75, 1.15, 0.36), new THREE.Vector3(2.75, 3.25, 0.36), 0.05, mat.steel, 12);
  addToLayer("mast", dishTowerBase);
  for (const offset of [-0.32, 0.32]) {
    addToLayer("mast", cylinderBetween(new THREE.Vector3(2.75 + offset, 1.25, 0.1), new THREE.Vector3(2.75, 3.2, 0.36), 0.022, mat.steel, 8));
  }
  const mainDish = buildDish([3.0, 3.65, 0.36], [0.05, -0.72, 0.06], 1.02);
  addToLayer("antenna", mainDish);

  addToLayer("signal", cable([[1.45, 2.45, -0.95], [0.45, 3.45, -0.4], [-0.35, 6.1, 0]], cableMaterials.signal, 0.04));
  addToLayer("power", cable([[0.85, 1.45, -0.98], [-0.9, 1.05, -0.2], [-2.9, 0.82, 0.35]], cableMaterials.power, 0.04));
  addToLayer("signal", cable([[1.2, 2.25, -1.0], [2.3, 2.9, -0.35], [3.0, 3.62, 0.36]], cableMaterials.ground, 0.032));
  addToLayer("antenna", cable([[3.0, 3.72, 0.36], [4.8, 5.9, -1.45], [6.4, 6.45, -2.75]], cableMaterials.beam, 0.026));

  addLabel(getSceneLabel("maritime-communication-ship", locale), [-2.55, 3.45, 1.05]);
  addLabel(getSceneLabel("ship-mast", locale), [-1.25, 6.95, 0.1], "#0f766e");
  addLabel(getSceneLabel("ship-gateway", locale), [2.55, 2.55, -0.75], "#0f766e");
  camera.position.set(9.2, 6.0, 9.8);
  controls.target.set(0, 2.8, 0);
}
function buildSatelliteModel() {
  const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 90; i += 1) {
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.018 + (i % 3) * 0.01, 8, 4), starMat);
    star.position.set((Math.random() - 0.5) * 15, 3.5 + Math.random() * 6, -5 - Math.random() * 5);
    addToLayer("orbit", star);
  }
  const earth = new THREE.Mesh(new THREE.SphereGeometry(9.6, 64, 24, 0, Math.PI * 2, 0, Math.PI * 0.34), mat.earth);
  earth.position.set(0, -7.5, 0.4);
  addToLayer("orbit", earth);

  const bus = new THREE.Group();
  const core = roundedBox(1.9, 2.4, 1.65, mat.cabinet);
  core.position.set(0, 2.8, 0);
  bus.add(core);
  for (let i = 0; i < 5; i += 1) {
    const box = roundedBox(0.72, 0.48, 0.28, i % 2 ? mat.whitePanel : mat.module);
    box.position.set(-0.48 + (i % 2) * 0.96, 3.62 - Math.floor(i / 2) * 0.58, -0.98);
    bus.add(box);
  }
  addToLayer("satellite", bus);

  const topCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.42, 32), mat.antenna);
  topCylinder.position.set(0.25, 4.35, 0.08);
  addToLayer("payload", topCylinder);
  const bottomRing = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.72, 0.22, 48), mat.steel);
  bottomRing.position.set(0, 1.48, 0);
  addToLayer("payload", bottomRing);

  addToLayer("solar", cylinderBetween(new THREE.Vector3(-0.95, 2.95, 0), new THREE.Vector3(-5.0, 2.95, 0), 0.04, mat.darkSteel));
  addToLayer("solar", cylinderBetween(new THREE.Vector3(0.95, 2.95, 0), new THREE.Vector3(5.0, 2.95, 0), 0.04, mat.darkSteel));
  for (const x of [-4.25, -3.1, 3.1, 4.25]) {
    const panel = roundedBox(1.05, 2.55, 0.08, mat.solar);
    panel.position.set(x, 2.95, 0);
    addSolarGrid(panel, 4, 6);
    addToLayer("solar", panel);
  }
  for (const x of [-1.2, 1.2]) {
    addToLayer("satellite", cylinderBetween(new THREE.Vector3(x, 2.0, -0.88), new THREE.Vector3(x * 1.8, 1.25, -1.35), 0.035, mat.steel));
  }

  const dish = buildDish([0, 5.05, -0.38], [-0.5, 0, 0], 0.86);
  addToLayer("antenna", dish);
  addToLayer("signal", cable([[-0.74, 3.05, -1.02], [-0.55, 1.9, -1.18], [0.68, 1.78, -1.12], [0.74, 3.05, -1.02]], cableMaterials.signal, 0.032));
  addToLayer("signal", cable([[-0.7, 3.8, -0.95], [-1.25, 3.25, -1.1], [-1.1, 2.2, -1.05]], cableMaterials.power, 0.028));
  addToLayer("antenna", cable([[0, 5.05, -0.38], [1.35, 1.2, -1.75], [3.25, -2.1, -2.65]], cableMaterials.beam, 0.026));

  addLabel(getSceneLabel("leo-satellite", locale), [0, 6.05, 0]);
  addLabel(getSceneLabel("sat-solar", locale), [-3.55, 4.55, 0.2], "#1e3a8a");
  addLabel(getSceneLabel("sat-payload", locale), [1.8, 2.45, -0.95], "#1e3a8a");
  camera.position.set(7.8, 6.7, 9.8);
  controls.target.set(0, 2.35, 0);
}
const builders = {
  transmitter: buildTransmitterModel,
  receiver: buildReceiverModel,
  ship: buildShipModel,
  satellite: buildSatelliteModel,
};

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse?.((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose?.());
      else object.material?.dispose?.();
    });
  }
}

function setupLayerGroups(modelId) {
  clearGroup(modelRoot);
  clearGroup(labelRoot);
  activeLayers = {};
  getModel(modelId).layers.forEach((layer) => {
    activeLayers[layer] = new THREE.Group();
    modelRoot.add(activeLayers[layer]);
  });
}

function setupModelButtons() {
  const root = document.querySelector("#modelSelector");
  if (!root || root.children.length) return;
  getModels().forEach((model) => {
    const display = getModelDisplay(model, locale);
    const button = document.createElement("button");
    button.className = "model-button";
    button.type = "button";
    button.dataset.model = model.id;
    button.textContent = display.name;
    button.addEventListener("click", () => renderModel(model.id));
    root.appendChild(button);
  });
}

function setupToggles(modelId) {
  const toggleRoot = document.querySelector("#layerToggles");
  if (!toggleRoot) return;
  toggleRoot.innerHTML = "";
  getLayerConfig(modelId, locale).forEach(([key, labelText]) => {
    const button = document.createElement("button");
    button.className = "layer-toggle active";
    button.type = "button";
    button.innerHTML = "<span></span>" + labelText;
    button.addEventListener("click", () => {
      activeLayers[key].visible = !activeLayers[key].visible;
      button.classList.toggle("active", activeLayers[key].visible);
    });
    toggleRoot.appendChild(button);
  });
}

function populateSpecPanel(modelId) {
  const model = getModel(modelId);
  const display = getModelDisplay(model, locale);
  const summary = summarizeModel(modelId, locale);
  const statsRoot = document.querySelector("#specStats");
  const componentRoot = document.querySelector("#specComponents");
  const modelTitle = document.querySelector("#activeModelTitle");
  const modelSummary = document.querySelector("#activeModelSummary");
  const modelChain = document.querySelector("#activeModelChain");

  if (modelTitle) modelTitle.textContent = display.name;
  if (modelSummary) modelSummary.textContent = display.summary;
  if (modelChain) modelChain.textContent = display.chain;
  if (statsRoot) {
    statsRoot.innerHTML = [
      "<span>" + summary.componentCount + " " + summary.labels.components + "</span>",
      "<span>" + summary.connectionCount + " " + summary.labels.connections + "</span>",
      "<span>" + summary.layerCount + " " + summary.labels.reviewLayers + "</span>",
    ].join("");
  }
  if (componentRoot) {
    componentRoot.innerHTML = model.components
      .map((component) => {
        const item = getComponentDisplay(component, locale);
        return "<li><strong>" + item.label + "</strong><span>" + item.role + "</span></li>";
      })
      .join("");
  }
  document.querySelectorAll(".model-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.model === modelId);
  });
}

function renderModel(modelId) {
  activeModelId = builders[modelId] ? modelId : "transmitter";
  const url = new URL(window.location.href);
  url.searchParams.set("model", activeModelId);
  window.history.replaceState({}, "", url);
  setupLayerGroups(activeModelId);
  builders[activeModelId]();
  setupToggles(activeModelId);
  populateSpecPanel(activeModelId);
  controls.update();
}

function buildLights() {
  const hemi = new THREE.HemisphereLight(0xffffff, 0xb2c0d0, 2.1);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(8, 16, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -8;
  scene.add(key);
  const rim = new THREE.PointLight(0x8ad3ff, 36, 28);
  rim.position.set(-6, 7, -7);
  scene.add(rim);
}

function resize() {
  const { clientWidth, clientHeight } = renderer.domElement.parentElement;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

buildLights();
setupModelButtons();
renderModel(activeModelId);
resize();
window.addEventListener("resize", resize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
