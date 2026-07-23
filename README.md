# imagethreejs-Digital-Twin

`imagethreejs-Digital-Twin` is a research starter project for turning a 2D technical image into a browser-based 3D digital twin. The first prototype reconstructs a 5G communication tower from the supplied infographic: tower steel structure, AAU antenna units, GPS/BeiDou timing antenna, eCPRI fronthaul, DU/CU cabinet, power and grounding routes, backhaul, edge data center, and 5GC cloud relationship.

## Source Understanding

The referenced WeChat article could not be directly opened in the browser, but its recoverable `Image 2` method is a visual research communication workflow: read a project or technical object, extract its architecture and key entities, and convert it into a high-density visual explanation. This project adapts that idea by removing the poster-style frames and rebuilding the subject as an interactive 3D digital-twin scene.

For the provided 5G tower image, the technical structure is:

- `UE -> RU/AAU -> DU -> CU -> 5GC` is the main 5G network chain.
- `AAU` integrates antenna and RF functions at the tower top.
- `eCPRI` front-haul fiber connects AAU/RU to DU with low-latency transport.
- `DU` handles lower-layer baseband processing; `CU` handles centralized control/user-plane functions.
- The base cabinet contains DU/CU, transmission switching, optical distribution, rectifier/power supply, battery backup, and environment monitoring.
- Colored routes represent fronthaul fiber, backhaul fiber, DC power, AC power, grounding, and alarm/monitoring links.
- External systems include city AC power input, grounding/SPD protection, backhaul transport, edge data center/MEC, and 5GC core cloud.

## img2threejs Method

This iteration follows the image-to-Three.js idea from [hoainho/img2threejs](https://github.com/hoainho/img2threejs): use the reference image as a visual design brief, decompose it into named objects, then rebuild the subject with procedural Three.js geometry that can be inspected, tested, and extended.

Applied to the provided 5G tower image, the workflow is:

1. Extract visible components: lattice tower, AAU/RU panels, timing antenna, cabinet modules, cable systems, edge data center, and 5GC cloud.
2. Store the extracted model intent in `src/towerSpec.json` as an object/connection specification.
3. Render the scene with Three.js primitives and semantic layers rather than flattening the picture into a texture.
4. Review the model through UI layer toggles and the Object Spec panel.
5. Run `npm.cmd test` to validate required components, required connections, and README/UI integration.

## Prototype Features

- Interactive Three.js scene with orbit controls.
- Procedural tower lattice with antennas, timing antenna, cable bundles, open equipment cabinet, edge data center, core cloud, and colored connection paths.
- Component legend, Object Spec panel, and scene toggles for cable systems.
- Generated frameless 3D reference image in `assets/5g-tower-frameless-3d.png`.
- No mutation of the original image; it is used only as a visual source.

## Run Locally

```powershell
cd D:\GitHubProjects\imagethreejs-Digital-Twin
npm.cmd run start
```

Open `http://localhost:5173`.

The app imports Three.js from a CDN at runtime. For offline research use, vendor the Three.js module locally in a future iteration.

## Test

```powershell
npm.cmd test
```

The test command runs a JavaScript syntax check and `scripts/validate-spec.mjs`, which verifies the img2threejs-style object specification against the rendered app and README.

## Repository Workflow

After the GitHub remote is created, all future changes must happen in this directory only:

```text
D:\GitHubProjects\imagethreejs-Digital-Twin
```

Every task should end with:

```powershell
git status
git diff
git add .
git commit -m "..."
git push origin main
```
