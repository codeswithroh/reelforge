# ReelForge - Hackathon Submission

## Project Name
**ReelForge**

## Tagline
AI-native video editing workspace. Collaborate with an AI director through a structured storyboard canvas. Propose, review, approve.

## Category
AI / Creative Tools / Productivity

## What it does

ReelForge is an AI-native video editing workspace built for the Anna App Runtime. It answers the hackathon's core question: "If AI demos always stop at a chatbot or prompt, what comes next?"

The answer: a structured canvas where an AI director proposes timestamped clip segments, and a human editor reviews, approves, or rejects each one through a visual storyboard interface.

**The workflow:**
1. **Describe** your footage or paste a transcript
2. **Set a goal** like "30-second hook" or "3 testimonial variants"
3. **Review clips** the AI proposes on a storyboard with timestamps, variants, and reasoning
4. **Approve or reject** each clip. The live timeline updates instantly.
5. **Assemble** your approved clips into a final cut and export.

No chat bubbles. No prompt engineering. Just a focused creative workflow with human review at every step.

## Key Features

- **Structured UI** - Storyboard canvas, not a chat interface
- **AI Director** - Proposes clips with timestamps, variants, and editorial reasoning
- **Human Review** - Every clip requires explicit Keep or Cut before assembly
- **Live Timeline** - Visual timeline bar updates as you approve clips
- **Stateful** - Project state persists between sessions via Anna storage
- **Neo-Skeuo Design** - Warm off-white, copper accents, pixel shadows, tactile buttons

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla, no framework)
- **Design:** Neo-Skeuo Tactile System (warm off-white & copper)
- **Backend:** Python stdio plugin (JSON-RPC over stdin/stdout)
- **Platform:** Anna App Runtime (iframe bundle + tool plugin + skill)
- **Distribution:** uv tool install / binary (PyInstaller + GitHub Actions)

## What makes it special

ReelForge is not another chatbot wrapper. It demonstrates what comes after the chat interface: AI as a collaborator inside structured workflows. The AI proposes, the human decides. Every decision is stateful. Every clip requires human sign-off.

This fits the Anna platform perfectly: App UI, tools, state, permissions, and human review all working together.

## How to run it

### Quick Demo (No setup needed)

Open `bundle/index.html` in any browser. The app runs in demo mode with simulated AI responses.

### Local Development

```bash
# Install Anna CLI
npm install -g @anna-ai/cli

# Install Python tool
uv tool install ./executas/reelforge-director --reinstall

# Run dev harness
anna-app dev
```

Then open `http://localhost:5180`.

### Anna Platform (for judges)

The app is designed to run inside the Anna App Runtime as an iframe bundle. It calls the `reelforge-director` tool plugin via `anna.tools.invoke` and persists state via `anna.storage`.

## Files Included

```
reelforge/
  app.json                          # App metadata
  manifest.json                     # App manifest (permissions, tools, UI)
  package.json                      # npm scripts for publishing
  README.md                         # Full documentation
  bundle/
    index.html                      # UI entry point
    style.css                       # Neo-Skeuo design system
    app.js                          # App logic + Anna SDK + demo mode
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

## Demo Script

1. Open the app. You see the "Start a project" screen.
2. Paste a video description:
   > "A 15 minute interview with a startup founder. They talk about early struggles, finding product market fit, and a major customer win at the 8 minute mark. The energy peaks when they describe the first paying customer."
3. Click "Analyze footage." The AI analyzes the footage.
4. Click the "30-second hook" preset. Click "Propose clips."
5. The storyboard appears with 3 proposed clip cards.
6. Click "Keep" on 2 clips. Watch the timeline update.
7. Click "Assemble final cut." See the export screen with your sequenced clips.

Total demo time: under 60 seconds.

## Screenshots

See the `screenshots/` folder for full workflow screenshots.

## Team

Solo builder: Rohit Purkait

## Links

- GitHub Repository: https://github.com/codeswithroh/reelforge
- Anna Tool ID: `tool-rohitpurkait001_6943-reelforge-director-wgc7rgz5`
- Anna Skill ID: `skill-rohitpurkait001_6943-reelforge-director-tedkw6x8`

## License

MIT
