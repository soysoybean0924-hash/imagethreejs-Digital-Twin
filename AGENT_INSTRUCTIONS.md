# AGENT_INSTRUCTIONS.md

## Project Rule

All modifications for `imagethreejs-Digital-Twin` must be made only in:

```text
D:\GitHubProjects\imagethreejs-Digital-Twin
```

Do not modify the original desktop/source image location or any earlier scratch directory. The source image is reference material only.

## Required End-of-Task Git Flow

At the end of every completed task, run and report:

```powershell
git status
git diff
git add .
git commit -m "<clear message>"
git push origin main
```

If there is no GitHub remote yet, stop after the local commit and ask the user to create an empty GitHub repository named `imagethreejs-Digital-Twin`, then add it as `origin`.

## Technical Direction

This is an image-to-3D digital twin research prototype. Preserve the project purpose:

- Convert 2D telecom/engineering imagery into structured 3D scenes.
- Use Three.js for the browser-based digital twin.
- Keep components semantically named and easy to extend.
- Avoid hardcoding unrelated poster text into the 3D scene.
- Prefer data-driven component definitions for future image parsing or AI extraction.

## Current Domain Model

The initial scene models a 5G communication tower with:

- GPS/BeiDou timing antenna.
- AAU/RU active antenna units.
- eCPRI fronthaul fiber.
- Tower steel lattice.
- Base cabinet with DU, CU, ODF, rectifier/power, battery backup, and EC monitoring.
- AC input, DC power, grounding, backhaul, edge data center/MEC, and 5GC cloud.

## Development Notes

- Keep the app usable as a static browser prototype.
- Use `npm.cmd run start` on Windows when PowerShell blocks `npm.ps1`.
- Three.js is loaded from CDN in this first commit.
- Generated or derived visual assets belong in `assets/`.
