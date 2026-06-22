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

## How to test locally

### Option 1: Demo Mode (No Anna account needed)

The app includes a built-in demo mode that generates realistic clip data directly in the browser. This lets you test the full UI workflow without any Anna platform dependencies.

```bash
cd reelforge/bundle
python3 -m http.server 8765
```

Then open `http://localhost:8765` in your browser. The app will run in demo mode and all 4 screens will work.

### Option 2: Anna Dev Harness (Requires Anna login)

Install the dev tools and run the harness:

```bash
# Install Anna CLI
npm install -g @anna-ai/cli

# Install Python tool runner
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH
export PATH="/Users/rohitpurkait/.local/bin:$PATH"
export PATH="/Users/rohitpurkait/Library/Application Support/kimi-desktop/daimon-share/daimon/npm-global/bin:$PATH"

# Install the plugin
cd reelforge/executas/reelforge-director
uv tool install . --reinstall

# Run the dev harness
cd reelforge
anna-app dev
```

Open `http://localhost:5180` to see the app running with the Anna runtime.

**Note:** Verified developer status on Anna is required for the live dev harness. Use demo mode for quick testing and hackathon demos.

## How to submit to Anna App Store

1. Go to https://anna.partners/executa -> My Apps -> Create App
2. Fill in listing details from `app.json`
3. Create version, paste `manifest.json`
4. Upload bundle files (`index.html`, `style.css`, `app.js`, `icon.svg`)
5. Submit for review

The app is at `/Users/rohitpurkait/Documents/kimi/workspace/reelforge/`.

## Demo script for the hackathon

When showing the demo, follow this flow:

1. **Start:** Paste a video description like:
   > "A 10 minute interview with a founder. They discuss early failures, pivoting, and a big customer win at 7 minutes. Very energetic when talking about the first sale."

2. **Goal:** Type "30-second hook for LinkedIn" or click the "30-second hook" preset.

3. **Storyboard:** See 3-4 proposed clip cards with timestamps and reasoning. Click "Keep" on 2 clips. Watch the timeline bar update at the bottom.

4. **Assemble and Export.**

Total time: under 60 seconds per demo.

## Key Anna features showcased

- **App UI:** Structured HTML/CSS/JS canvas (not a chatbot)
- **Tool calls:** `anna.tools.invoke` routes to the Python stdio plugin
- **State:** `anna.storage.get/set` persists project data between sessions
- **Human Review:** Every clip requires explicit approve/reject before assembly
- **Permissions:** App manifest declares tool, storage, and chat access
- **Skill:** SKILL.md teaches the agent director behavior

## Notes

- The plugin generates realistic mock clips based on the description text. It does not use ffmpeg or process real video files. For a hackathon prototype, this is sufficient and demonstrates the workflow clearly.
- If you want to add real video processing later, you would replace the clip generation logic with actual frame analysis (using something like Whisper for transcripts + vision models for scene detection).
- The design follows the Neo-Skeuo Tactile System reference: warm off-white base, copper primary, 2px pixel borders, stepped shadows, no emojis, concise copy.

## License

MIT
