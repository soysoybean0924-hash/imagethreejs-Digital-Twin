# imagethreejs-Digital-Twin

`imagethreejs-Digital-Twin` is a research starter project for turning 2D technical reference images into browser-based Three.js digital twins. The current prototype no longer merges the new references into one large scene; it generates four independent image2-to-3D reconstructions for a transmitter, receiver, maritime communication ship, and LEO communication satellite.

## Source Understanding

The referenced WeChat article could not be directly opened in the browser, but its recoverable `Image 2` method is a visual research communication workflow: read a project or technical object, extract its architecture and key entities, and convert it into a high-density visual explanation. This project adapts that idea by removing poster-style frames and rebuilding each supplied subject as an interactive 3D object.

For the original 5G tower experiment, the project proved that a single technical image can be decomposed into visible equipment, cables, antennas, power paths, and semantic labels. This iteration applies the same pattern separately to four new communication objects.

## img2threejs Method

This iteration follows the image-to-Three.js idea from [hoainho/img2threejs](https://github.com/hoainho/img2threejs): use each reference image as a visual design brief, decompose it into named objects, then rebuild the subject with procedural Three.js geometry that can be inspected, tested, and extended.

Applied to the four supplied object images, the workflow is:

1. Select one image subject at a time: transmitter, receiver, maritime communication ship, or LEO satellite.
2. Extract visible components such as cabinet shells, rack modules, antennas, masts, solar arrays, payload boxes, cables, and power/signal paths.
3. Store the extracted model intent in `src/towerSpec.json` as four independent object specifications.
4. Render only the selected object with Three.js primitives and semantic review layers.
5. Use the model selector, layer toggles, and Object Spec panel to inspect each reconstruction.
6. Run `npm.cmd test` to validate all four independent models and their builder functions.

## Independent Reconstruction Set

- `Transmitter`: equipment cabinet, RF power rack, feeder bundle, power shelf, cooling vents, and directional transmit antenna.
- `Receiver`: receiver cabinet, receiving antenna, receiver rack, signal decoder, protected power shelf, and ventilation path.
- `Maritime Communication Ship`: hull, ocean plane, bridge, integrated communication mast, radar/satellite dish, gateway cabinet, and visible cable bay.
- `LEO Satellite`: satellite bus, solar array wings, payload modules, parabolic antenna, external harnesses, and Earth limb reference.

## Prototype Features

- Interactive Three.js scene with orbit controls.
- Four separate procedural image2-to-3D model builders instead of one combined cross-domain scene.
- Model selector for independent review of transmitter, receiver, maritime ship, and LEO satellite.
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

