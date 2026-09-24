# 🎯 HackShot — Hacktoberfest Aim Trainer

<div align="center">

![HackShot Banner](https://img.shields.io/badge/🎃%20Hacktoberfest-2026-ff6b35?style=for-the-badge&labelColor=0a0a0f)
![License](https://img.shields.io/badge/License-MIT-9b59b6?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-00d4aa?style=for-the-badge)
![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-e91e8c?style=for-the-badge)

**A fast-paced browser aim trainer game, built for Hacktoberfest open-source contributions.**

[🎮 Play Now](#getting-started) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues) · [🏆 Leaderboard](#contribute)

</div>

---

## ✨ Features

- 🎯 **3 Game Modes** — Classic, Precision, and Frenzy
- 🔥 **Streak System** — Chain hits for multiplier glory
- 🏆 **Local Leaderboard** — Per-mode persistent scoring
- 🎵 **Procedural Audio** — Sounds generated via Web Audio API (no files needed!)
- ✨ **Particle Effects** — Canvas-based hit bursts and ambient particles
- ⚙️ **Settings** — Customize difficulty, size, speed, SFX, and more
- ⌨️ **Keyboard Shortcuts** — `P` to pause, `R` to restart, `ESC` to pause
- 📱 **PWA-Ready** — Installable as a Progressive Web App
- 🎨 **Zero Dependencies** — Pure HTML, CSS, and JavaScript

---

## 🚀 Getting Started

No build step needed! Just open `index.html` in your browser:

```bash
git clone https://github.com/YOUR_USERNAME/hacktoberfest-aim-trainer.git
cd hacktoberfest-aim-trainer
# Open index.html in your browser, OR:
npx serve .
```

Or with Python:
```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## 🕹️ How to Play

| Action         | Method                     |
|----------------|----------------------------|
| Select mode    | Click a mode card on home  |
| Start game     | Click `START GAME`         |
| Hit target     | Left click on target       |
| Pause          | Press `P` or `Escape`      |
| Restart        | Press `R` (when paused)    |

### Game Modes

| Mode       | Duration | Description                          |
|------------|----------|--------------------------------------|
| 🎯 Classic  | 30s      | Standard targets, beginner friendly  |
| 🔥 Precision| 45s      | Targets shrink over time             |
| ⚡ Frenzy   | 60s      | Fast spawns, maximum chaos           |

### Target Types

| Target   | Points | Description                      |
|----------|--------|----------------------------------|
| 🔴 Normal | 10     | Standard orange target            |
| 🟣 Bonus  | 20     | Purple `2x` multiplier target     |
| 🟡 Speed  | 8      | Yellow fast target                |

---

## 📁 Project Structure

```
hacktoberfest-aim-trainer/
├── index.html          # Main entry point
├── css/
│   └── style.css       # All styles (dark theme, animations)
├── js/
│   ├── audio.js        # Procedural audio engine (Web Audio API)
│   ├── particles.js    # Canvas particle system
│   ├── game.js         # Core game engine (modes, scoring, leaderboard)
│   ├── ui.js           # UI layer (screens, HUD, leaderboard rendering)
│   └── main.js         # Entry point & event wiring
├── CONTRIBUTING.md     # Contribution guide
├── LICENSE             # MIT License
└── README.md           # This file
```

---

## 🤝 Contributing

This project is **Hacktoberfest-friendly**! All contributions count toward your Hacktoberfest goal.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

### Quick Start for Contributors

1. **Fork** the repo
2. **Clone** your fork
3. **Create** a branch: `git checkout -b feat/your-feature`
4. **Make changes** (see issues for ideas!)
5. **Commit**: `git commit -m "feat: add your feature"`
6. **Push**: `git push origin feat/your-feature`
7. **Open a Pull Request** 🎉

### 💡 Good First Issues

Look for issues labeled:
- `good first issue` — Perfect for newcomers
- `hacktoberfest` — Specifically tagged for the event
- `enhancement` — New feature ideas

### Ideas for Contributions

- 🎨 New color themes or skins
- 🎮 New game modes (e.g., Moving Targets, Time Attack)
- 🌐 Internationalization (i18n) support
- 📊 Stats visualization / charts
- 🎵 New sound effects
- 📱 Mobile touch support improvements
- ♿ Accessibility improvements
- 🔧 Bug fixes

---

## ⌨️ Keyboard Shortcuts

| Key       | Action              |
|-----------|---------------------|
| `P`       | Pause / Resume      |
| `Escape`  | Pause / Resume      |
| `R`       | Restart (when paused/results) |

---

## 📜 License

MIT © 2026 — See [LICENSE](LICENSE) for details.

---

<div align="center">

Made with ❤️ for **Hacktoberfest 2026**

⭐ Star this repo if you found it useful!

</div>
