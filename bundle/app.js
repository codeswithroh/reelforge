/** ReelForge App Bundle - Anna App UI Runtime */

const TOOL_ID = "tool-rohitpurkait001_6943-reelforge-director-wgc7rgz5";
const STORAGE_KEY = "reelforge:project:v1";

let anna = null;
let sdkReady = false;

const state = {
  screen: "start",
  projectId: "",
  videoDescription: "",
  totalDuration: "",
  goal: "",
  clips: [],
  approved: [],
  rejected: [],
  scenes: [],
  loading: false
};

const icons = {
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  film: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  arrowRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  arrowLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  loader: `<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`,
  checkCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`
};

async function initSdk() {
  try {
    const { AnnaAppRuntime } = await import("/static/anna-apps/_sdk/latest/index.js");
    anna = await AnnaAppRuntime.connect();
    sdkReady = true;
    await anna.window.set_title({ title: "ReelForge" });
    await loadState();
  } catch (e) {
    console.warn("Anna SDK not available. Running in standalone preview mode.", e);
    sdkReady = false;
  }
  switchScreen(state.screen);
  renderDemoBanner();
}

async function callTool(action, extraArgs = {}) {
  if (!sdkReady) {
    console.warn("Tool call skipped in preview mode:", action, extraArgs);
    return null;
  }
  try {
    const result = await anna.tools.invoke({
      tool_id: TOOL_ID,
      method: "direct",
      args: { action, ...extraArgs }
    });
    return result?.output || result?.result || result;
  } catch (e) {
    console.error("Tool call failed:", e);
    showToast("Tool call failed: " + (e.message || "Unknown error"), "error");
    return null;
  }
}

// ---- Demo Mode: Works when SDK is unavailable ----

function inferTotalSeconds(videoDescription) {
  const text = videoDescription.toLowerCase();
  if (text.includes("hour") || text.includes("60 min")) return 3600;
  if (text.includes("30 min")) return 1800;
  if (text.includes("15 min") || text.includes("quarter")) return 900;
  if (text.includes("10 min")) return 600;
  if (text.includes("5 min")) return 300;
  if (text.includes("1 min") || text.includes("minute")) return 60;
  const words = text.split(/\s+/).length;
  if (words > 200) return 1800;
  if (words > 100) return 900;
  return 300;
}

function secondsToTimestamp(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function extractKeywords(text) {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const stop = new Set(["this","that","with","from","have","been","were","they","their","there","about","would","could","should"]);
  return words.filter(w => !stop.has(w)).slice(0, 8);
}

function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0x7fffffff;
  return h.toString(16).substring(0, 12);
}

function demoAnalyze(videoDescription) {
  const totalSeconds = inferTotalSeconds(videoDescription);
  const keywords = extractKeywords(videoDescription);
  const sceneCount = Math.min(6, Math.max(3, Math.floor(keywords.length / 2)));
  const chunk = Math.floor(totalSeconds / sceneCount);
  const scenes = [];
  for (let i = 0; i < sceneCount; i++) {
    const start = i * chunk + Math.floor(Math.random() * Math.max(1, chunk / 4));
    const end = Math.min((i + 1) * chunk - Math.floor(Math.random() * Math.max(1, chunk / 4)), totalSeconds);
    const kw = keywords[i % keywords.length] || `segment ${i + 1}`;
    scenes.push({ id: `scene-${i + 1}`, start: secondsToTimestamp(start), end: secondsToTimestamp(end), duration_seconds: end - start, label: `${kw.charAt(0).toUpperCase() + kw.slice(1)} moment`, confidence: parseFloat((0.7 + Math.random() * 0.25).toFixed(2)) });
  }
  return { project_id: hashId(videoDescription), total_duration: secondsToTimestamp(totalSeconds), total_seconds: totalSeconds, scenes, summary: `Analyzed ${secondsToTimestamp(totalSeconds)} of footage. Found ${scenes.length} distinct scenes with strong editorial moments.` };
}

function demoPropose(videoDescription, goal) {
  const totalSeconds = inferTotalSeconds(videoDescription);
  const keywords = extractKeywords(videoDescription);
  const goalLower = goal.toLowerCase();
  let count = 4, targetDuration = 25;
  if (goalLower.includes("hook") || goalLower.includes("short")) { count = 3; targetDuration = 15; }
  else if (goalLower.includes("testimonial") || goalLower.includes("quote")) { count = 4; targetDuration = 20; }
  else if (goalLower.includes("variant") || goalLower.includes("ab") || goalLower.includes("a/b")) { count = 3; targetDuration = 30; }
  else if (goalLower.includes("highlight") || goalLower.includes("best")) { count = 5; targetDuration = 20; }
  const clips = [];
  const usedRanges = [];
  const variants = ["Direct", "Emotional", "Fast-paced", "Minimal", "Conversational", "Bold"];
  for (let i = 0; i < count; i++) {
    let startSec, endSec, overlap, attempts = 0;
    do {
      startSec = 5 + Math.floor(Math.random() * Math.max(10, totalSeconds - targetDuration - 5));
      endSec = Math.min(startSec + targetDuration + Math.floor(Math.random() * 11) - 5, totalSeconds);
      overlap = usedRanges.some(u => !(endSec < u[0] || startSec > u[1]));
      attempts++;
    } while (overlap && attempts < 20);
    if (attempts >= 20) { startSec = i * (totalSeconds / count) + 5; endSec = startSec + targetDuration; }
    usedRanges.push([startSec, endSec]);
    const kw = keywords[i % keywords.length] || `segment ${i + 1}`;
    const variant = variants[i % variants.length];
    clips.push({ id: `clip-${i + 1}`, start: secondsToTimestamp(startSec), end: secondsToTimestamp(endSec), duration_seconds: endSec - startSec, label: `${variant}: ${kw.charAt(0).toUpperCase() + kw.slice(1)} segment`, reasoning: `This segment captures a strong ${kw} beat at ${secondsToTimestamp(startSec)}. Good for ${goalLower}.`, status: "pending", variant });
  }
  clips.sort((a, b) => {
    const ta = parseInt(a.start.split(":")[0]) * 60 + parseInt(a.start.split(":")[1] || 0);
    const tb = parseInt(b.start.split(":")[0]) * 60 + parseInt(b.start.split(":")[1] || 0);
    return ta - tb;
  });
  return { project_id: hashId(videoDescription), goal, clips, summary: `Proposed ${clips.length} clips for goal: ${goal}. Total runtime of selected clips: ${clips.reduce((s, c) => s + c.duration_seconds, 0)}s.` };
}

function demoAssemble(projectId, approvedClips, allClips) {
  const approved = allClips.filter(c => approvedClips.includes(c.id));
  const totalSeconds = approved.reduce((s, c) => s + c.duration_seconds, 0);
  return { project_id: projectId, approved_count: approved.length, total_duration_seconds: totalSeconds, total_duration: secondsToTimestamp(totalSeconds), sequence: approved, summary: `Assembled ${approved.length} clips into a ${secondsToTimestamp(totalSeconds)} sequence. Ready for export.` };
}

async function callToolOrDemo(action, extraArgs = {}) {
  if (sdkReady) return await callTool(action, extraArgs);
  console.warn("Demo mode:", action, extraArgs);
  await new Promise(r => setTimeout(r, 800));
  if (action === "analyze") return demoAnalyze(extraArgs.video_description || "");
  if (action === "propose") return demoPropose(extraArgs.video_description || state.videoDescription, extraArgs.goal || "");
  if (action === "assemble") return demoAssemble(extraArgs.project_id || "", extraArgs.approved_clips || [], state.clips);
  return null;
}

async function saveState() {
  if (!sdkReady) return;
  try {
    const payload = JSON.stringify(state);
    await anna.storage.set({ key: STORAGE_KEY, value: payload });
  } catch (e) {
    console.error("Save state failed:", e);
  }
}

async function loadState() {
  if (!sdkReady) return;
  try {
    const { value } = await anna.storage.get({ key: STORAGE_KEY });
    if (value) {
      const parsed = JSON.parse(value);
      Object.assign(state, parsed);
    }
  } catch (e) {
    console.error("Load state failed:", e);
  }
}

function switchScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("screen-" + id).classList.add("active");
  state.screen = id;
  saveState();
  window.scrollTo(0, 0);
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  let icon = icons.info;
  if (type === "success") icon = icons.checkCircle;
  if (type === "error") icon = icons.alert;
  toast.innerHTML = icon + "<span>" + escapeHtml(message) + "</span>";
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function setLoading(el, isLoading) {
  if (!el) return;
  if (isLoading) {
    el.disabled = true;
    el.dataset.originalText = el.innerHTML;
    el.innerHTML = icons.loader + "<span>Working...</span>";
  } else {
    el.disabled = false;
    if (el.dataset.originalText) el.innerHTML = el.dataset.originalText;
  }
}

// ---- Start Screen ----

document.getElementById("btn-analyze").addEventListener("click", async () => {
  const desc = document.getElementById("video-desc").value.trim();
  const dur = document.getElementById("video-duration").value.trim();
  if (!desc) {
    showToast("Please describe your footage first.", "error");
    document.getElementById("video-desc").focus();
    return;
  }

  const btn = document.getElementById("btn-analyze");
  setLoading(btn, true);

  state.videoDescription = desc;
  state.totalDuration = dur;
  state.loading = true;

  const result = await callToolOrDemo("analyze", { video_description: desc });
  if (result) {
    state.projectId = result.project_id || "";
    state.scenes = result.scenes || [];
    showToast("Footage analyzed. " + (result.summary || ""), "success");
    switchScreen("goal");
  } else {
    showToast("Analysis failed. Check your connection.", "error");
  }

  state.loading = false;
  setLoading(btn, false);
});

// ---- Goal Screen ----

document.getElementById("btn-back-start").addEventListener("click", () => switchScreen("start"));

document.querySelectorAll(".preset-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.getElementById("goal-input").value = chip.dataset.goal;
  });
});

document.getElementById("btn-propose").addEventListener("click", async () => {
  const goal = document.getElementById("goal-input").value.trim();
  if (!goal) {
    showToast("Set a creative goal first.", "error");
    document.getElementById("goal-input").focus();
    return;
  }

  const btn = document.getElementById("btn-propose");
  setLoading(btn, true);

  state.goal = goal;
  state.loading = true;

  const result = await callToolOrDemo("propose", {
    video_description: state.videoDescription,
    goal: goal,
    project_id: state.projectId
  });

  if (result) {
    state.projectId = result.project_id || state.projectId;
    state.clips = result.clips || [];
    state.approved = [];
    state.rejected = [];
    showToast("Proposed " + state.clips.length + " clips. Review them below.", "success");
    renderClips();
    updateStats();
    renderTimeline();
    switchScreen("storyboard");
  } else {
    showToast("Clip proposal failed. Try again.", "error");
  }

  state.loading = false;
  setLoading(btn, false);
});

// ---- Storyboard Screen ----

document.getElementById("btn-back-goal").addEventListener("click", () => switchScreen("goal"));

document.getElementById("btn-assemble").addEventListener("click", async () => {
  if (state.approved.length === 0) {
    showToast("Approve at least one clip before assembling.", "error");
    return;
  }

  const btn = document.getElementById("btn-assemble");
  setLoading(btn, true);

  const result = await callToolOrDemo("assemble", {
    project_id: state.projectId,
    approved_clips: state.approved
  });

  if (result) {
    renderExport(result);
    showToast("Assembled " + result.approved_count + " clips into a " + result.total_duration + " cut.", "success");
    switchScreen("export");
  } else {
    showToast("Assembly failed.", "error");
  }

  setLoading(btn, false);
});

function renderClips() {
  const grid = document.getElementById("clips-grid");
  if (!state.clips.length) {
    grid.innerHTML = `<div class="empty-state">${icons.info}<p>No clips yet. Propose some from the goal screen.</p></div>`;
    return;
  }

  grid.innerHTML = state.clips.map(clip => {
    const status = state.approved.includes(clip.id) ? "approved" : (state.rejected.includes(clip.id) ? "rejected" : "pending");
    const statusLabel = status === "approved" ? "Kept" : (status === "rejected" ? "Cut" : "Pending");
    return `
      <div class="clip-card ${status}" data-id="${clip.id}">
        <div class="clip-status-badge">${statusLabel}</div>
        <div class="clip-card-header">
          <span class="clip-variant">${escapeHtml(clip.variant || "Clip")}</span>
          <span class="clip-timestamp">${escapeHtml(clip.start)} - ${escapeHtml(clip.end)}</span>
        </div>
        <div class="clip-body">
          <p class="clip-label">${escapeHtml(clip.label)}</p>
          <p class="clip-reasoning">${escapeHtml(clip.reasoning)}</p>
          <span class="clip-duration">${icons.clock} ${clip.duration_seconds}s</span>
        </div>
        <div class="clip-actions">
          <button class="btn-approve" data-id="${clip.id}" ${status === "approved" ? 'disabled' : ''}>
            ${icons.check} ${status === "approved" ? "Kept" : "Keep"}
          </button>
          <button class="btn-reject" data-id="${clip.id}" ${status === "rejected" ? 'disabled' : ''}>
            ${icons.x} ${status === "rejected" ? "Cut" : "Cut"}
          </button>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".btn-approve").forEach(btn => {
    btn.addEventListener("click", () => approveClip(btn.dataset.id));
  });
  grid.querySelectorAll(".btn-reject").forEach(btn => {
    btn.addEventListener("click", () => rejectClip(btn.dataset.id));
  });
}

function approveClip(id) {
  if (!state.approved.includes(id)) {
    state.approved.push(id);
  }
  state.rejected = state.rejected.filter(x => x !== id);
  updateClipCard(id);
  updateStats();
  renderTimeline();
  saveState();
  showToast("Clip kept. Added to timeline.", "success");
  checkAssembleReady();
}

function rejectClip(id) {
  if (!state.rejected.includes(id)) {
    state.rejected.push(id);
  }
  state.approved = state.approved.filter(x => x !== id);
  updateClipCard(id);
  updateStats();
  renderTimeline();
  saveState();
  showToast("Clip cut. Removed from timeline.", "info");
  checkAssembleReady();
}

function updateClipCard(id) {
  const card = document.querySelector(`.clip-card[data-id="${id}"]`);
  if (!card) return;
  const status = state.approved.includes(id) ? "approved" : (state.rejected.includes(id) ? "rejected" : "pending");
  const statusLabel = status === "approved" ? "Kept" : (status === "rejected" ? "Cut" : "Pending");

  card.className = `clip-card ${status}`;
  card.querySelector(".clip-status-badge").textContent = statusLabel;

  const approveBtn = card.querySelector(".btn-approve");
  const rejectBtn = card.querySelector(".btn-reject");

  if (status === "approved") {
    approveBtn.disabled = true;
    approveBtn.innerHTML = `${icons.check} Kept`;
    rejectBtn.disabled = false;
    rejectBtn.innerHTML = `${icons.x} Cut`;
  } else if (status === "rejected") {
    approveBtn.disabled = false;
    approveBtn.innerHTML = `${icons.check} Keep`;
    rejectBtn.disabled = true;
    rejectBtn.innerHTML = `${icons.x} Cut`;
  } else {
    approveBtn.disabled = false;
    approveBtn.innerHTML = `${icons.check} Keep`;
    rejectBtn.disabled = false;
    rejectBtn.innerHTML = `${icons.x} Cut`;
  }
}

function updateStats() {
  const approved = state.approved.length;
  const rejected = state.rejected.length;
  const pending = state.clips.length - approved - rejected;
  document.getElementById("stat-approved").textContent = approved;
  document.getElementById("stat-rejected").textContent = rejected;
  document.getElementById("stat-pending").textContent = pending;
}

function renderTimeline() {
  const track = document.getElementById("timeline-track");
  const approvedClips = state.clips.filter(c => state.approved.includes(c.id));
  const totalDuration = approvedClips.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
  document.getElementById("timeline-duration").textContent = totalDuration + "s";

  if (!approvedClips.length) {
    track.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:12px;">No clips approved yet. Keep clips to build your timeline.</div>`;
    return;
  }

  const total = Math.max(totalDuration, 1);
  track.innerHTML = approvedClips.map((clip, i) => {
    const widthPct = ((clip.duration_seconds || 10) / total) * 100;
    return `<div class="timeline-segment" style="width:${widthPct}%;" title="${escapeHtml(clip.label)} (${clip.duration_seconds}s)">
      <span class="timeline-segment-label">${i + 1}</span>
    </div>`;
  }).join("");
}

function checkAssembleReady() {
  const btn = document.getElementById("btn-assemble");
  btn.disabled = state.approved.length === 0;
}

// ---- Export Screen ----

function renderExport(result) {
  const summary = document.getElementById("export-summary");
  const sequence = result.sequence || [];
  const subtitle = document.getElementById("export-subtitle");
  subtitle.textContent = "Your approved clips have been sequenced into a " + (result.total_duration || "0s") + " cut.";

  if (!sequence.length) {
    summary.innerHTML = `<div class="empty-state">${icons.info}<p>No clips in the final sequence.</p></div>`;
    return;
  }

  summary.innerHTML = `
    <div class="export-sequence">
      ${sequence.map((clip, i) => `
        <div class="export-sequence-item">
          <div class="export-sequence-index">${i + 1}</div>
          <div class="export-sequence-info">
            <p class="export-sequence-label">${escapeHtml(clip.label)}</p>
            <p class="export-sequence-time">${escapeHtml(clip.start)} - ${escapeHtml(clip.end)}</p>
          </div>
          <div class="export-sequence-duration">${clip.duration_seconds}s</div>
        </div>
      `).join("")}
    </div>
  `;
}

document.getElementById("btn-back-storyboard").addEventListener("click", () => {
  switchScreen("storyboard");
});

document.getElementById("btn-export").addEventListener("click", () => {
  const format = document.getElementById("export-format").value;
  const quality = document.getElementById("export-quality").value;
  showToast("Export queued: " + format.toUpperCase() + " at " + quality + ". This is a prototype.", "success");
});

// ---- Demo Mode Banner ----

function renderDemoBanner() {
  if (sdkReady) return;
  const banner = document.createElement("div");
  banner.className = "demo-banner";
  banner.innerHTML = `${icons.info}<span>Demo mode: AI responses are simulated. Connect to Anna for real tool calls.</span>`;
  document.getElementById("app").appendChild(banner);
}

// ---- Loading Overlay ----

function showLoadingOverlay(message) {
  let overlay = document.getElementById("loading-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "loading-overlay";
    overlay.className = "loading-overlay";
    overlay.innerHTML = `<div class="loading-box">${icons.loader}<p>Loading...</p></div>`;
    document.getElementById("app").appendChild(overlay);
  }
  overlay.querySelector("p").textContent = message || "Loading...";
  overlay.classList.add("active");
}

function hideLoadingOverlay() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.classList.remove("active");
}

// ---- Keyboard Shortcuts ----

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    const activeBtn = document.querySelector(".screen.active .btn-primary:not([disabled])");
    if (activeBtn) activeBtn.click();
  }
  if (e.key === "Escape") {
    const backBtn = document.querySelector(".screen.active .btn-secondary");
    if (backBtn) backBtn.click();
  }
});

// ---- Help Modal ----

function showHelpModal() {
  let modal = document.getElementById("help-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "help-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>How ReelForge Works</h3>
          <button class="btn-icon" id="btn-close-help">${icons.x}</button>
        </div>
        <div class="modal-body">
          <p>ReelForge is an AI-native video editing workspace. Instead of typing prompts into a chatbot, you work through a structured canvas with an AI director.</p>
          <h4>The Workflow</h4>
          <ol>
            <li><strong>Describe</strong> your footage or paste a transcript.</li>
            <li><strong>Set a goal</strong> like "30-second hook" or "3 testimonial variants."</li>
            <li><strong>Review clips</strong> the AI proposes on a storyboard. Keep or Cut each one.</li>
            <li><strong>Assemble</strong> your approved clips into a final cut and export.</li>
          </ol>
          <h4>Keyboard Shortcuts</h4>
          <ul>
            <li><kbd>Ctrl + Enter</kbd> - Submit current form</li>
            <li><kbd>Esc</kbd> - Go back to previous screen</li>
          </ul>
          <h4>About Demo Mode</h4>
          <p>In demo mode, the AI generates realistic mock clips based on your description. When connected to Anna, the tool calls a real AI director plugin.</p>
        </div>
      </div>
    `;
    document.getElementById("app").appendChild(modal);
    document.getElementById("btn-close-help").addEventListener("click", hideHelpModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) hideHelpModal(); });
  }
  modal.classList.add("active");
}

function hideHelpModal() {
  const modal = document.getElementById("help-modal");
  if (modal) modal.classList.remove("active");
}

// ---- Error Boundary ----

window.addEventListener("error", (e) => {
  console.error("App error:", e);
  showToast("Something went wrong. Please refresh and try again.", "error");
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e);
  showToast("A background task failed. Please try again.", "error");
});

// ---- Reset ----

document.getElementById("btn-reset").addEventListener("click", async () => {
  if (!confirm("Start a new project? Current progress will be lost.")) return;
  state.projectId = "";
  state.videoDescription = "";
  state.totalDuration = "";
  state.goal = "";
  state.clips = [];
  state.approved = [];
  state.rejected = [];
  state.scenes = [];
  state.screen = "start";
  document.getElementById("video-desc").value = "";
  document.getElementById("video-duration").value = "";
  document.getElementById("goal-input").value = "";
  await saveState();
  switchScreen("start");
  showToast("New project started.", "success");
});

// ---- Help ----

document.getElementById("btn-help").addEventListener("click", showHelpModal);

// ---- Init ----

initSdk();
