export const TEXT = {
  en: {
    layerLabels: {
      fronthaul: "eCPRI fronthaul",
      backhaul: "Backhaul / 5GC",
      power: "AC and -48V power",
      ground: "Grounding",
      monitoring: "Monitoring",
    },
    statLabels: {
      components: "components",
      connections: "connections",
      reviewLayers: "review layers",
    },
    sceneLabels: {
      "tower-lattice": "Steel lattice tower",
      "aau-array": "AAU / RU antenna array",
      "gps-beidou-timing": "GPS / BeiDou timing",
      "equipment-cabinet": "Base equipment cabinet",
      "ac-input": "AC input",
      "ground-spd": "Ground / SPD",
      "edge-data-center": "Edge data center / MEC",
      "5gc-cloud": "5GC core cloud",
      du: "DU",
      cu: "CU",
      odf: "ODF",
      rectifier: "Rectifier",
      battery: "Battery",
      ec: "EC",
    },
  },
  zh: {
    layerLabels: {
      fronthaul: "eCPRI \u524d\u4f20",
      backhaul: "\u56de\u4f20 / 5GC",
      power: "\u4ea4\u6d41\u4e0e -48V \u7535\u6e90",
      ground: "\u63a5\u5730\u7cfb\u7edf",
      monitoring: "\u76d1\u63a7\u544a\u8b66",
    },
    statLabels: {
      components: "\u4e2a\u7ec4\u4ef6",
      connections: "\u6761\u8fde\u63a5",
      reviewLayers: "\u4e2a\u5ba1\u67e5\u56fe\u5c42",
    },
    sceneLabels: {
      "tower-lattice": "\u94c1\u5854\u6841\u67b6\u7ed3\u6784",
      "aau-array": "AAU / RU \u5929\u7ebf\u9635\u5217",
      "gps-beidou-timing": "GPS / \u5317\u6597\u6388\u65f6",
      "equipment-cabinet": "\u57fa\u7ad9\u8bbe\u5907\u673a\u67dc",
      "ac-input": "\u4ea4\u6d41\u5e02\u7535\u63a5\u5165",
      "ground-spd": "\u63a5\u5730 / \u9632\u96f7 SPD",
      "edge-data-center": "\u8fb9\u7f18\u6570\u636e\u4e2d\u5fc3 / MEC",
      "5gc-cloud": "5GC \u6838\u5fc3\u7f51\u4e91",
      du: "DU",
      cu: "CU",
      odf: "ODF",
      rectifier: "\u6574\u6d41\u5668",
      battery: "\u84c4\u7535\u6c60",
      ec: "\u73af\u5883\u76d1\u63a7",
    },
    componentOverrides: {
      "tower-lattice": { label: "\u94c1\u5854\u6841\u67b6\u7ed3\u6784", role: "\u627f\u8f7d AAU\u3001\u7ebf\u7f06\u548c\u6388\u65f6\u8bbe\u5907\u7684\u7ed3\u6784\u652f\u6491" },
      "gps-beidou-timing": { label: "GPS / \u5317\u6597\u6388\u65f6\u5929\u7ebf", role: "\u4e3a 5G \u7f51\u7edc\u63d0\u4f9b\u9ad8\u7cbe\u5ea6\u65f6\u949f\u540c\u6b65" },
      "aau-array": { label: "AAU / RU \u6709\u6e90\u5929\u7ebf\u9635\u5217", role: "\u65e0\u7ebf\u63a5\u5165\u3001\u5c04\u9891\u5904\u7406\u548c\u6ce2\u675f\u8d4b\u5f62" },
      "ecpri-fronthaul": { label: "eCPRI \u524d\u4f20\u5149\u7ea4", role: "AAU \u5230 DU \u7684\u4f4e\u65f6\u5ef6\u524d\u4f20\u94fe\u8def" },
      "equipment-cabinet": { label: "\u57fa\u7ad9\u8bbe\u5907\u673a\u67dc", role: "\u7ad9\u70b9\u8bbe\u5907\u96c6\u4e2d\u5b89\u88c5\u4e0e\u9632\u62a4" },
      "du-module": { label: "DU \u5206\u5e03\u5f0f\u5355\u5143", role: "\u4f4e\u5c42\u57fa\u5e26\u5904\u7406\u4e0e\u5b9e\u65f6\u4e1a\u52a1\u627f\u8f7d" },
      "cu-module": { label: "CU \u96c6\u4e2d\u5f0f\u5355\u5143", role: "\u96c6\u4e2d\u63a7\u5236\u9762\u548c\u7528\u6237\u9762\u5904\u7406" },
      "power-distribution": { label: "\u4ea4\u6d41\u4e0e -48V \u76f4\u6d41\u7535\u6e90", role: "\u7535\u6e90\u8f6c\u6362\u3001\u5206\u914d\u4e0e\u5907\u7535\u4fdd\u969c" },
      "ground-spd": { label: "\u63a5\u5730\u4e0e\u6d6a\u6d8c\u4fdd\u62a4", role: "\u9632\u96f7\u3001\u5b89\u5168\u63a5\u5730\u548c\u8bbe\u5907\u4fdd\u62a4" },
      "edge-data-center": { label: "\u8fb9\u7f18\u6570\u636e\u4e2d\u5fc3 / MEC", role: "\u672c\u5730\u7b97\u529b\u3001\u4e1a\u52a1\u4e0b\u6c89\u4e0e\u4f20\u8f93\u6c47\u805a" },
      "5gc-cloud": { label: "5GC \u6838\u5fc3\u7f51\u4e91", role: "\u6838\u5fc3\u7f51\u63a5\u5165\u3001\u4f1a\u8bdd\u3001\u7528\u6237\u9762\u548c\u6570\u636e\u7ba1\u7406" }
    },
  },
};

export function resolveLocale(locale) {
  return locale && locale.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function getText(locale) {
  return TEXT[resolveLocale(locale)];
}
