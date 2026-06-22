# ReelForge

AI-native video editing workspace built for the Anna App Runtime.

## What it does

ReelForge lets creators collaborate with an AI director through a structured storyboard canvas. Upload footage (by describing it), set a creative goal, and the AI proposes timestamped clips. You review, approve, or reject each clip on a visual canvas. The AI assembles your approved selections into a final cut.

No chat bubbles. No prompts. Just a focused workflow with human review at every step.

## Project structure

```
reelforge/
  app.json                          # App metadata for Anna App Store
  manifest.json                     # App manifest (permissions, executas, UI config)
  package.json                      # npm scripts for publishing
  README.md                         # Full documentation
  SUBMISSION.md                     # Hackathon submission details
  bundle/
    index.html                      # UI entry point (static SPA)
    style.css                       # Neo-Skeuo tactile design system
    app.js                          # App logic + Anna SDK integration + demo mode
    icon.svg                        # App icon
  executas/
    reelforge-director/
      executa.json                  # Tool registration
      pyproject.toml                # Python package config
      reelforge_director.py         # Stdio JSON-RPC plugin
      package_binary.sh             # PyInstaller build script
  .github/workflows/
    build-reelforge-binary.yml      # GitHub Actions for multi-platform builds
  skill/
    SKILL.md                        # AI director behavior instructions
```

## What was built

### 1. Python Tool Plugin (`reelforge_director.py`)
A stdio JSON-RPC plugin that Anna calls to:
- **analyze** footage descriptions and return scene breakdowns
- **propose** clip segments based on a creative goal (hook, testimonial, highlight reel, etc.)
- **assemble** approved clips into a final sequence
- **get_state** for persistence

The plugin intelligently infers video duration, extracts keywords, and generates realistic clip proposals with timestamps, variants, and reasoning.

### 2. UI Bundle (HTML/CSS/JS)
A complete single-page app with 4 screens:
1. **Start** - Enter footage description and optional duration
2. **Goal** - Set creative goal with quick-pick presets
3. **Storyboard** - Review clip cards, approve/reject, live timeline
4. **Export** - View assembled sequence, choose format/quality

Design: Neo-Skeuo tactile system (warm off-white, copper accents, pixel shadows, 2px borders). No emojis. Lucide-style inline SVG icons.

### 3. Skill (`SKILL.md`)
Teaches Anna's agent how to behave as a creative co-director inside the app. Proposes, does not impose. Respects human review decisions.
