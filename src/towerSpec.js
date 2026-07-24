import spec from "./towerSpec.json?v=ship-reference-3" with { type: "json" };
import { getText, resolveLocale } from "./i18n.js?v=ship-reference-3";

export function getProjectSpec() {
  return spec;
}

export function getModels() {
  return spec.models;
}

export function getModel(id) {
  return spec.models.find((model) => model.id === id) || spec.models[0];
}

export function getLayerConfig(modelId, locale = "en") {
  const labels = getText(locale).layerLabels;
  return getModel(modelId).layers.map((layer) => [layer, labels[layer] || layer]);
}

export function getSceneLabel(id, locale = "en") {
  const text = getText(locale);
  return text.sceneLabels[id] || id;
}

export function getModelDisplay(model, locale = "en") {
  const key = resolveLocale(locale);
  const override = getText(key).modelOverrides?.[model.id];
  return override || { name: model.name, summary: model.summary, chain: model.chain };
}

export function getComponentDisplay(component, locale = "en") {
  const key = resolveLocale(locale);
  const override = getText(key).componentOverrides?.[component.id];
  return override || { label: component.label, role: component.role };
}

export function summarizeModel(modelId, locale = "en") {
  const model = getModel(modelId);
  return {
    componentCount: model.components.length,
    connectionCount: model.connections.length,
    layerCount: model.layers.length,
    labels: getText(locale).statLabels,
  };
}
