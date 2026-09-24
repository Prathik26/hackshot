# 🤝 Contributing to HackShot

Thank you for your interest in contributing to **HackShot**! This guide will help you get started.

---

## 📋 Code of Conduct

Be kind, inclusive, and respectful. We welcome contributors of all skill levels.

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge)
- A text editor (VS Code recommended)
- Git

### Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/hackshot.git
cd hackshot

# 3. Open in VS Code (optional)
code .

# 4. Open index.html in your browser, or serve locally
npx serve .
# → Visit http://localhost:3000
```

No build step, no dependencies, no Node.js required. Just open the file!

---

## 🌿 Branching Strategy

Create a descriptive branch for your changes:

```bash
git checkout -b feat/moving-targets
git checkout -b fix/streak-counter-bug
git checkout -b style/dark-theme-update
git checkout -b docs/update-readme
```

### Branch Prefixes

| Prefix      | Purpose                                 |
|-------------|-----------------------------------------|
| `feat/`     | New features                            |
| `fix/`      | Bug fixes                               |
| `style/`    | CSS/visual changes                      |
| `docs/`     | Documentation only                      |
| `refactor/` | Code restructuring (no behavior change) |
| `perf/`     | Performance improvements                |

---

## 📝 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description

[optional body]
```

**Examples:**
```
feat(game): add moving targets mode
fix(audio): prevent audio context error on Safari
style(hud): improve timer bar animation
docs(readme): add installation instructions
refactor(game): extract target spawning logic
```

---

## 🔄 Pull Request Process

1. Ensure your branch is up to date with `main`
2. Test your changes in at least one browser
3. Write a clear PR description explaining what and why
4. Reference any related issues: `Closes #42`
5. Be responsive to review feedback

### PR Template

When opening a PR, please include:

```markdown
## What does this PR do?
Brief description of the change.

## Why is this needed?
Context and motivation.

## How to test?
Steps to test this locally.

## Screenshots (if visual change)
Before / After screenshots.

## Checklist
- [ ] Tested in Chrome/Firefox
- [ ] No console errors
- [ ] Code is readable and commented where needed
```

---

## 🗂️ File Guide

| File              | What to edit                           |
|-------------------|----------------------------------------|
| `css/style.css`   | All visual styles, themes, animations  |
| `js/game.js`      | Game logic, modes, scoring             |
| `js/audio.js`     | Sound effects (procedural)             |
| `js/particles.js` | Canvas particle system                 |
| `js/ui.js`        | Screen management, HUD, leaderboard    |
| `js/main.js`      | Event wiring, initialization           |
| `index.html`      | HTML structure and markup              |

---

## 💡 Contribution Ideas

### Beginner
- Fix typos in comments or README
- Improve CSS animations
- Add more target color variations
- Improve mobile layout

### Intermediate
- Add a new game mode
- Add moving/bouncing targets
- Implement a combo multiplier
- Add keyboard-only accessibility mode
- Add a high-score display on the game HUD

### Advanced
- Add online leaderboard (backend integration)
- Build a level editor
- Add touch/swipe support for mobile
- Implement a replay system

---

## ❓ Questions?

Open a [GitHub Discussion](../../discussions) or file an [Issue](../../issues). We're happy to help!

---

Made with ❤️ — Open Source
