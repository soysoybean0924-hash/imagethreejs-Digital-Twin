import spec from "./towerSpec.json" with { type: "json" };

export function getTowerSpec() {
  return spec;
}

export function getLayerConfig() {
  return [
    ["fronthaul", "eCPRI fronthaul"],
    ["backhaul", "Backhaul / 5GC"],
    ["power", "AC and -48V power"],
    ["ground", "Grounding"],
    ["monitoring", "Monitoring"],
  ];
}

export function summarizeSpec() {
  return {
    componentCount: spec.components.length,
    connectionCount: spec.connections.length,
    requiredLayerCount: spec.qualityGate.requiredLayers.length,
  };
}
