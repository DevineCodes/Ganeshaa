Ganeshaa
=================

A browser-based festive game built with vanilla HTML, CSS, and JavaScript. Play across five stages and celebrate Ganesh Chaturthi.

Features
-----------------
- Landing screen with: Start, Continue, Rules, About, Settings
- Stage 1 – Make Idol: pick head, body, mouse, background; saved to localStorage
- Stage 2 – Collect Flowers: arcade bucket catcher with penalties and 60s timer
- Stage 3 – Modak Candy Crush: simple match-3; 3 small -> 1 big; 3 big -> 1 mega to basket (2 min)
- Stage 4 – Mystery Room: move to collect Bati, Diya, Matchbox in a dark room; diya lights
- Stage 5 – Puja: show idol, controls for bell/drum, rotate diya, drop flowers, DJ lights, share buttons, username under idol, final message

Tech
-----------------
- No frameworks; modular ES Modules
- Single-page navigation via a minimalist router
- State persisted with localStorage

Local Dev
-----------------
Open `index.html` directly or use any static server:

```bash
npx serve .
```

Deploy to GitHub Pages
-----------------
1. Create a new GitHub repo and push this folder.
2. Ensure default branch is `main`.
3. GitHub Actions workflow included at `.github/workflows/pages.yml` will publish to Pages on push.
4. Enable GitHub Pages in repo settings (Build and deployment: GitHub Actions).

Customize
-----------------
- Sprites: currently placeholder geometric shapes with labels; replace with actual images by setting `background-image` on idol layers or drawing in canvases.
- Game tuning: adjust timers, speeds in respective stage modules under `js/modules/screens`.
- Username: set in Settings; saved in localStorage.

License
-----------------
MIT

