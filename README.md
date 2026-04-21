# Plappy Bird

A small browser game inspired by classic “flappy” gameplay: you steer a car through gaps between pipes, one tap at a time. Built with plain HTML, CSS, and JavaScript on the HTML5 Canvas—no frameworks or build step.

**Repository:** [github.com/hoangvantrong/plappybird](https://github.com/hoangvantrong/plappybird)

## How to play

1. Open the game in a modern browser (Chrome, Firefox, Safari, Edge).
2. Press **Play** on the start screen.
3. **Flap** (give the car upward speed) to fly through the gaps between pipes.
4. Each pipe pair you pass increases your **score** in the top bar.
5. Hitting a pipe, the **ground**, or losing control ends the run—use **Play again** to restart.

## Controls

| Input        | Action                          |
| ------------ | ------------------------------- |
| **Space**    | Flap (also during play)         |
| **Click**    | Flap (on the game canvas)      |
| **Touch**    | Flap (on phones and tablets)   |
| **Play**     | Start from the title screen     |
| **Play again** | Restart after game over       |

The viewport is fixed for a consistent play area; the page asks the browser not to zoom on pinch for a steadier touch experience.

## Run locally

You only need the files in this repo.

**Option A — open the file**

- Double-click `index.html`, or drag it into a browser window.

**Option B — local HTTP server** (recommended if anything behaves oddly with `file://` URLs)

```bash
# from the project folder
python3 -m http.server 8080
```

Then visit `http://localhost:8080` in your browser.

## What’s in the repo

| File        | Role |
| ----------- | ---- |
| `index.html` | Page shell, canvas, HUD, start / game-over overlay |
| `style.css`  | Layout, theme, overlay and button styles |
| `game.js`    | Game loop, physics, pipes, collisions, drawing |

The game uses `requestAnimationFrame` for smooth updates, simple gravity and flap velocity, rectangular hitboxes with a small inset so collisions feel fair, and procedurally placed pipe gaps within safe margins.

## Requirements

- A browser with **Canvas 2D** and **`roundRect`** on the canvas context (widely available; very old browsers may fall back to ordinary rectangles for the car body).

## Ideas for later

- Host on **GitHub Pages** for a public URL from this same repo.
- Add sound, high score in `localStorage`, or difficulty that ramps with score.

---

Made for fun and learning. Feel free to fork and experiment.
