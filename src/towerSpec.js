import spec from "./towerSpec.json" with { type: "json" };
import { getText, resolveLocale } from "./i18n.js";

export function getTowerSpec() {
  return spec;
}

export function getLayerConfig(locale = "en") {
  const labels = getText(locale).layerLabels;
  return [
    ["fronthaul", labels.fronthaul],
    ["backhaul", labels.backhaul],
    ["power", labels.power],
    ["ground", labels.ground],
    ["monitoring", labels.monitoring],
  ];
}

export function getSceneLabel(id, locale = "en") {
  const text = getText(locale);
  return text.sceneLabels[id] || id;
}

export function getComponentDisplay(component, locale = "en") {
  const key = resolveLocale(locale);
  const override = getText(key).componentOverrides?.[component.id];
  return override || { label: component.label, role: component.role };
}

export function summarizeSpec(locale = "en") {
  return {
    componentCount: spec.components.length,
    connectionCount: spec.connections.length,
    requiredLayerCount: spec.qualityGate.requiredLayers.length,
    labels: getText(locale).statLabels,
  };
}
