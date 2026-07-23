import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/controls/OrbitControls.js";
import { getComponentDisplay, getLayerConfig, getModel, getModelDisplay, getModels, getSceneLabel, summarizeModel } from "./towerSpec.js?v=separate-models-1";

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
  }
  return rack;
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
  const slab = roundedBox(5.8, 0.26, 4.2, mat.concrete);
  slab.position.set(0, -0.13, 0);
  addToLayer("enclosure", slab);

  const cabinet = buildCabinetShell();
  addToLayer("enclosure", cabinet);
  addToLayer("rf", buildRack(0, 4.45, -0.78, 7));

  const powerShelf = roundedBox(2.3, 0.48, 0.18, mat.module);
  powerShelf.position.set(0, 1.05, -0.78);
  addToLayer("power", powerShelf);
  const vent = roundedBox(0.86, 1.4, 0.08, mat.darkSteel);
  vent.position.set(1.9, 2.75, 0.2);
  addToLayer("cooling", vent);

  const mast = cylinderBetween(new THREE.Vector3(-2.2, 0.2, -0.2), new THREE.Vector3(-2.2, 5.6, -0.2), 0.07, mat.darkSteel);
  addToLayer("antenna", mast);
  const antenna = roundedBox(1.0, 1.25, 0.22, mat.antenna);
  antenna.position.set(-2.2, 5.95, -0.15);
  addToLayer("antenna", antenna);

  addToLayer("signal", cable([[0.9, 3.95, -0.82], [-0.9, 4.9, -0.45], [-2.2, 5.65, -0.18]], cableMaterials.signal, 0.04));
  addToLayer("power", cable([[-0.7, 1.0, -0.82], [-1.35, 1.25, -0.42], [-1.85, 2.9, -0.24]], cableMaterials.power, 0.045));
  addToLayer("signal", cable([[-2.2, 5.95, -0.15], [-4.4, 6.5, -1.2], [-6.1, 6.1, -2.4]], cableMaterials.beam, 0.025));

  addLabel(getSceneLabel("transmitter-terminal", locale), [1.95, 4.9, 0.2]);
  addLabel(getSceneLabel("tx-rf-rack", locale), [-1.7, 3.7, -0.75], "#075985");
  addLabel(getSceneLabel("tx-antenna", locale), [-2.6, 6.8, -0.15], "#075985");
  camera.position.set(7.5, 6.4, 9.5);
  controls.target.set(0, 2.8, 0);
}

function buildReceiverModel() {
  const slab = roundedBox(5.8, 0.26, 4.2, mat.concrete);
  slab.position.set(0, -0.13, 0);
  addToLayer("enclosure", slab);

  const cabinet = buildCabinetShell(3.15, 5.2, 1.4);
  addToLayer("enclosure", cabinet);
  addToLayer("rf", buildRack(0, 4.7, -0.82, 6, 2.35));
  const decoder = buildRack(0, 2.0, -0.82, 3, 2.35);
  addToLayer("signal", decoder);

  const powerShelf = roundedBox(2.35, 0.42, 0.18, mat.module);
  powerShelf.position.set(0, 0.92, -0.82);
  addToLayer("power", powerShelf);
  const vent = roundedBox(0.74, 1.55, 0.08, mat.darkSteel);
  vent.position.set(1.95, 3.0, 0.18);
  addToLayer("cooling", vent);

  const pole = cylinderBetween(new THREE.Vector3(-2.35, 0.2, -0.2), new THREE.Vector3(-2.35, 4.45, -0.2), 0.065, mat.darkSteel);
  addToLayer("antenna", pole);
  const dish = buildDish([-2.25, 4.5, -0.2], [0.1, 0.72, -0.08], 0.95);
  addToLayer("antenna", dish);

  addToLayer("signal", cable([[-2.25, 4.4, -0.18], [-1.1, 4.25, -0.55], [0.95, 4.1, -0.82]], cableMaterials.signal, 0.04));
  addToLayer("signal", cable([[0.65, 3.0, -0.82], [-0.2, 2.35, -0.82], [0.75, 1.65, -0.82]], cableMaterials.alarm, 0.035));
  addToLayer("power", cable([[-0.75, 0.92, -0.82], [-1.6, 0.65, -0.25], [-2.2, 0.3, 0.9]], cableMaterials.power, 0.045));

  addLabel(getSceneLabel("receiver-terminal", locale), [1.95, 5.0, 0.22]);
  addLabel(getSceneLabel("rx-antenna", locale), [-3.25, 5.35, -0.25], "#075985");
  addLabel(getSceneLabel("rx-decoder", locale), [1.85, 1.75, -0.75], "#6d28d9");
  camera.position.set(7.2, 6.4, 9.2);
  controls.target.set(0, 2.7, 0);
}

function buildShipModel() {
  const ocean = roundedBox(10.5, 0.08, 6.0, mat.ocean);
  ocean.position.set(0, -0.05, 0);
  addToLayer("hull", ocean);

  const hull = roundedBox(6.8, 0.72, 1.55, mat.hull);
  hull.position.set(0, 0.55, 0);
  hull.scale.x = 1.08;
  addToLayer("hull", hull);
  const deck = roundedBox(5.6, 0.3, 1.35, mat.cabinet);
  deck.position.set(0.2, 1.08, 0);
  addToLayer("deck", deck);
  const bridge = roundedBox(1.6, 1.15, 1.05, mat.antenna);
  bridge.position.set(-1.85, 1.85, 0);
  addToLayer("deck", bridge);

  const mast = cylinderBetween(new THREE.Vector3(-0.2, 1.1, 0), new THREE.Vector3(-0.2, 5.7, 0), 0.075, mat.darkSteel);
  addToLayer("mast", mast);
  for (const x of [-0.95, 0.55]) {
    addToLayer("mast", cylinderBetween(new THREE.Vector3(x, 2.7, 0), new THREE.Vector3(-0.2, 5.3, 0), 0.035, mat.steel));
  }
  const radar = buildDish([1.75, 3.3, -0.18], [0.08, -0.58, 0.08], 0.78);
  addToLayer("antenna", radar);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 16), mat.antenna);
  dome.position.set(-1.0, 4.8, 0.25);
  dome.scale.y = 0.7;
  addToLayer("antenna", dome);

  const gateway = roundedBox(1.45, 1.15, 0.58, mat.module);
  gateway.position.set(1.35, 1.82, -0.48);
  addToLayer("rf", gateway);
  addToLayer("signal", cable([[1.3, 1.9, -0.48], [0.25, 3.1, -0.2], [-0.2, 5.45, 0]], cableMaterials.signal, 0.04));
  addToLayer("power", cable([[0.85, 1.55, -0.48], [-0.6, 1.1, -0.1], [-2.4, 0.85, 0.35]], cableMaterials.power, 0.04));
  addToLayer("antenna", cable([[1.75, 3.35, -0.18], [3.7, 5.4, -1.4], [5.6, 6.2, -2.5]], cableMaterials.beam, 0.025));

  addLabel(getSceneLabel("maritime-communication-ship", locale), [-2.1, 3.2, 1.0]);
  addLabel(getSceneLabel("ship-mast", locale), [-1.1, 5.95, 0.1], "#0f766e");
  addLabel(getSceneLabel("ship-gateway", locale), [2.45, 2.45, -0.48], "#0f766e");
  camera.position.set(7.8, 5.5, 9.2);
  controls.target.set(0, 2.2, 0);
}

function buildSatelliteModel() {
  const earth = new THREE.Mesh(new THREE.SphereGeometry(8.5, 64, 24, 0, Math.PI * 2, 0, Math.PI * 0.34), mat.earth);
  earth.position.set(0, -7.2, 0);
  addToLayer("orbit", earth);

  const bus = roundedBox(1.8, 2.25, 1.55, mat.cabinet);
  bus.position.set(0, 2.8, 0);
  addToLayer("satellite", bus);
  const payload = roundedBox(1.3, 0.72, 0.32, mat.module);
  payload.position.set(0, 2.55, -0.92);
  addToLayer("payload", payload);
  const topBox = roundedBox(0.8, 0.55, 0.55, mat.antenna);
  topBox.position.set(0.18, 4.25, 0.05);
  addToLayer("payload", topBox);

  addToLayer("solar", cylinderBetween(new THREE.Vector3(-0.95, 2.95, 0), new THREE.Vector3(-4.35, 2.95, 0), 0.04, mat.darkSteel));
  addToLayer("solar", cylinderBetween(new THREE.Vector3(0.95, 2.95, 0), new THREE.Vector3(4.35, 2.95, 0), 0.04, mat.darkSteel));
  for (const x of [-3.45, -2.4, 2.4, 3.45]) {
    const panel = roundedBox(0.95, 2.15, 0.08, mat.solar);
    panel.position.set(x, 2.95, 0);
    addToLayer("solar", panel);
  }

  const dish = buildDish([0, 4.95, -0.35], [-0.5, 0, 0], 0.78);
  addToLayer("antenna", dish);
  addToLayer("signal", cable([[-0.68, 3.0, -0.88], [-0.55, 1.95, -1.0], [0.65, 1.82, -1.0], [0.68, 3.0, -0.88]], cableMaterials.signal, 0.032));
  addToLayer("antenna", cable([[0, 4.95, -0.35], [1.4, 1.4, -1.6], [3.2, -2.0, -2.5]], cableMaterials.beam, 0.025));

  addLabel(getSceneLabel("leo-satellite", locale), [0, 5.95, 0]);
  addLabel(getSceneLabel("sat-solar", locale), [-3.3, 4.35, 0.2], "#1e3a8a");
  addLabel(getSceneLabel("sat-payload", locale), [1.65, 2.35, -0.9], "#1e3a8a");
  camera.position.set(7.2, 6.2, 9.4);
  controls.target.set(0, 2.0, 0);
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
