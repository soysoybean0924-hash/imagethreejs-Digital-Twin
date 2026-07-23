import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const specPath = path.join(root, "src", "towerSpec.json");
const mainPath = path.join(root, "src", "main.js");
const indexPath = path.join(root, "index.html");
const zhIndexPath = path.join(root, "index.zh.html");
const readmePath = path.join(root, "README.md");

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS ${message}`);
}

const spec = JSON.parse(fs.readFileSync(specPath, "utf8").replace(/^\uFEFF/, ""));
const main = fs.readFileSync(mainPath, "utf8");
const index = fs.readFileSync(indexPath, "utf8");
const zhIndex = fs.readFileSync(zhIndexPath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");

if (spec.components.length >= spec.qualityGate.minimumComponents) {
  pass(`component count ${spec.components.length} >= ${spec.qualityGate.minimumComponents}`);
} else {
  fail(`component count ${spec.components.length} is below ${spec.qualityGate.minimumComponents}`);
}

const componentIds = new Set(spec.components.map((component) => component.id));
for (const id of spec.qualityGate.requiredComponents) {
  componentIds.has(id) ? pass(`required component ${id}`) : fail(`missing required component ${id}`);
}

const layerIds = new Set(spec.components.map((component) => component.layer));
for (const layer of spec.qualityGate.requiredLayers) {
  layerIds.has(layer) || main.includes(`${layer}: new THREE.Group()`) ? pass(`required layer ${layer}`) : fail(`missing required layer ${layer}`);
}

const connectionLabels = new Set(spec.connections.map((connection) => connection.label));
for (const label of spec.qualityGate.requiredConnections) {
  connectionLabels.has(label) ? pass(`required connection ${label}`) : fail(`missing required connection ${label}`);
}

if (index !== zhIndex) {
  pass("standalone Chinese page differs from English entry");
} else {
  fail("standalone Chinese page should not duplicate the English entry exactly");
}

for (const fileCheck of [
  [main, "towerSpec", "main imports the object spec"],
  [main, "getSceneLabel", "main can localize scene labels"],
  [main, "buildLeoSatellite", "main builds the LEO satellite"],
  [main, "buildMaritimeShip", "main builds the maritime relay"],
  [main, "buildRadioTerminals", "main builds transmitter and receiver terminals"],
  [index, "Object Spec", "English UI exposes the object spec panel"],
  [zhIndex, "lang=\"zh-CN\"", "Chinese page declares zh-CN locale"],
  [zhIndex, "specStats", "Chinese UI exposes localized spec stats container"],
  [zhIndex, "specComponents", "Chinese UI exposes localized spec component container"],
  [zhIndex, "index.zh.html", "Chinese page keeps a standalone marker"],
  [readme, "img2threejs", "README documents img2threejs workflow"],
]) {
  fileCheck[0].includes(fileCheck[1]) ? pass(fileCheck[2]) : fail(fileCheck[2]);
}

if (process.exitCode) {
  console.error("Quality gate failed.");
} else {
  console.log("Quality gate passed.");
}
