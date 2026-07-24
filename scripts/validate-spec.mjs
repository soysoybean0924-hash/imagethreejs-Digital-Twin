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

if (Array.isArray(spec.models)) {
  pass("spec declares independent models array");
} else {
  fail("spec must declare independent models array");
}

const modelIds = new Set((spec.models || []).map((model) => model.id));
for (const id of spec.qualityGate.requiredModels) {
  modelIds.has(id) ? pass(`required independent model ${id}`) : fail(`missing independent model ${id}`);
}

for (const model of spec.models || []) {
  if (model.components.length >= spec.qualityGate.minimumComponentsPerModel) {
    pass(`${model.id} component count ${model.components.length} >= ${spec.qualityGate.minimumComponentsPerModel}`);
  } else {
    fail(`${model.id} component count ${model.components.length} is below ${spec.qualityGate.minimumComponentsPerModel}`);
  }

  if (model.layers.length >= 4) {
    pass(`${model.id} has review layers`);
  } else {
    fail(`${model.id} needs at least four review layers`);
  }

  if (model.connections.length >= 3) {
    pass(`${model.id} has semantic connections`);
  } else {
    fail(`${model.id} needs at least three semantic connections`);
  }
}

for (const fnName of spec.qualityGate.requiredBuilderFunctions) {
  main.includes(`function ${fnName}`) ? pass(`main defines ${fnName}`) : fail(`main missing ${fnName}`);
}

for (const modelName of spec.qualityGate.requiredModelNames) {
  readme.includes(modelName) || index.includes(modelName)
    ? pass(`documentation references ${modelName}`)
    : fail(`documentation missing ${modelName}`);
}

for (const fileCheck of [
  [main, "modelSelector", "main wires the independent model selector"],
  [main, "renderModel", "main renders one selected model at a time"],
  [main, "network-scene-1", "main uses network scene cache version"],
  [main, "function buildNetworkScene", "main defines integrated network scene"],
  [main, "maritime-network", "main exposes maritime network scene route"],
  [index, "Asset Library and Scene", "English UI exposes asset library and scene"],
  [index, "modelSelector", "English UI exposes model selector"],
  [zhIndex, "lang=\"zh-CN\"", "Chinese page declares zh-CN locale"],
  [zhIndex, "index.zh.html", "Chinese page keeps a standalone marker"],
  [zhIndex, "modelSelector", "Chinese UI exposes model selector"],
  [readme, "four reusable image2-to-3D object assets", "README documents reusable image2-to-3D assets"],
  [readme, "maritime-space communication scene", "README documents integrated scene"],
  [readme, "img2threejs", "README documents img2threejs workflow"],
]) {
  fileCheck[0].includes(fileCheck[1]) ? pass(fileCheck[2]) : fail(fileCheck[2]);
}

if (index !== zhIndex) {
  pass("standalone Chinese page differs from English entry");
} else {
  fail("standalone Chinese page should not duplicate the English entry exactly");
}

if (process.exitCode) {
  console.error("Quality gate failed.");
} else {
  console.log("Quality gate passed.");
}
