# imagethreejs-Digital-Twin

`imagethreejs-Digital-Twin` is a research starter project for turning 2D technical reference images into browser-based Three.js digital twins. The current prototype has four reusable image2-to-3D object assets for a transmitter, receiver, maritime communication ship, and LEO communication satellite, plus an integrated maritime-space communication scene that places those assets into a larger digital-twin environment.

## Source Understanding

The referenced WeChat article could not be directly opened in the browser, but its recoverable `Image 2` method is a visual research communication workflow: read a project or technical object, extract its architecture and key entities, and convert it into a high-density visual explanation. This project adapts that idea by removing poster-style frames and rebuilding each supplied subject as an interactive 3D object.

For the original 5G tower experiment, the project proved that a single technical image can be decomposed into visible equipment, cables, antennas, power paths, and semantic labels. This iteration keeps that object-level workflow, then adds a scene composer layer so the generated objects can be placed into a larger operational network.

## img2threejs Method

This iteration follows the image-to-Three.js idea from [hoainho/img2threejs](https://github.com/hoainho/img2threejs): use each reference image as a visual design brief, decompose it into named objects, then rebuild the subject with procedural Three.js geometry that can be inspected, tested, reused, and extended inside scenes.

Applied to the four supplied object images, the workflow is:

1. Select one image subject at a time: transmitter, receiver, maritime communication ship, or LEO satellite.
2. Extract visible components such as cabinet shells, rack modules, antennas, masts, solar arrays, payload boxes, cables, and power/signal paths.
3. Store the extracted model intent in `src/towerSpec.json` as four independent object specifications.
4. Render the selected object with Three.js primitives and semantic review layers.
5. Compose the reusable object assets into an integrated maritime-space communication scene.
6. Use the selector, layer toggles, and Object Spec panel to inspect each reconstruction or the final scene.
7. Run `npm.cmd test` to validate all four independent models, their builder functions, and the scene route.

## Independent Reconstruction Set

- `Transmitter`: equipment cabinet, RF power rack, feeder bundle, power shelf, cooling vents, and directional transmit antenna.
- `Receiver`: receiver cabinet, receiving antenna, receiver rack, signal decoder, protected power shelf, and ventilation path.
- `Maritime Communication Ship`: hull, ocean plane, bridge, integrated communication mast, radar/satellite dish, gateway cabinet, and visible cable bay.
- `LEO Satellite`: satellite bus, solar array wings, payload modules, parabolic antenna, external harnesses, and Earth limb reference.

## Integrated Scene Result

The final scene route is a composition layer for later digital-twin work:

```text
http://localhost:5173/index.zh.html?scene=maritime-network
```

It places six assets into one maritime-space communication network:

- maritime communication ship on the sea domain,
- LEO satellite in the space domain,
- shore 5G tower on the land domain,
- transmitter terminal,
- receiver terminal,
- edge data center.

The scene includes cross-domain beam links, signal paths, power routing, sea/shore grid references, and layer toggles so each part can be inspected or hidden independently. The procedural assets can later be replaced with higher-fidelity `glTF/GLB` models without changing the scene route or interaction layout.

## Prototype Features

- Interactive Three.js scene with orbit controls.
- Four separate procedural image2-to-3D model builders plus one combined cross-domain scene.
- Selector for independent review of transmitter, receiver, maritime ship, LEO satellite, or the integrated maritime-space network.
- Per-model layer toggles for enclosure, antenna, RF, power, signal, cooling, hull, mast, solar, payload, and orbit references.
- Object Spec panel driven by structured JSON.
- No mutation of the original images; they are used only as visual references.

## Run Locally

```powershell
cd D:\GitHubProjects\imagethreejs-Digital-Twin
npm.cmd run start
```

Open `http://localhost:5173`.

Chinese standalone version: `http://localhost:5173/index.zh.html`.

Direct model URLs:

```text
http://localhost:5173/index.zh.html?model=transmitter
http://localhost:5173/index.zh.html?model=receiver
http://localhost:5173/index.zh.html?model=ship
http://localhost:5173/index.zh.html?model=satellite
http://localhost:5173/index.zh.html?scene=maritime-network
```

The app imports Three.js from a CDN at runtime. For offline research use, vendor the Three.js module locally in a future iteration.

## Test

```powershell
npm.cmd test
```

The test command runs a JavaScript syntax check and `scripts/validate-spec.mjs`, which verifies the img2threejs-style object specification against the rendered app, pages, and README.

## Repository Workflow

All future changes must happen in this directory only:

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

