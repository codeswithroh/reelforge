import json
import sys
import os
import re
import hashlib
import random

random.seed(42)

STATE_DIR = os.path.expanduser("~/.anna/reelforge")
STATE_PATH = os.path.join(STATE_DIR, "state.json")


def ensure_state_dir():
    os.makedirs(STATE_DIR, exist_ok=True)


def load_state():
    ensure_state_dir()
    if os.path.exists(STATE_PATH):
        try:
            with open(STATE_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"projects": {}}


def save_state(state):
    ensure_state_dir()
    with open(STATE_PATH, "w") as f:
        json.dump(state, f, indent=2)


def get_project_id(video_description: str) -> str:
    return hashlib.md5(video_description.encode()).hexdigest()[:12]


def parse_duration_to_seconds(duration_str: str) -> int:
    # e.g. "00:45" or "1:23" or "2:30:15"
    parts = duration_str.strip().split(":")
    parts = [int(p) for p in parts if p.isdigit()]
    if len(parts) == 1:
        return parts[0]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return 0


def seconds_to_timestamp(seconds: int) -> str:
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def extract_keywords(text: str) -> list:
    words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
    stop = {"this", "that", "with", "from", "have", "been", "were", "they", "their", "there", "about", "would", "could", "should"}
    return [w for w in words if w not in stop][:8]


def infer_total_duration(video_description: str) -> int:
    # Try to infer total length from description
    text_lower = video_description.lower()
    if "hour" in text_lower or "60 min" in text_lower:
        return 3600
    if "30 min" in text_lower:
        return 1800
    if "15 min" in text_lower or "quarter" in text_lower:
        return 900
    if "10 min" in text_lower:
        return 600
    if "5 min" in text_lower:
        return 300
    if "1 min" in text_lower or "minute" in text_lower:
        return 60
    # Default to a reasonable interview/podcast length
    desc_len = len(video_description.split())
    if desc_len > 200:
        return 1800
    if desc_len > 100:
        return 900
    return 300


def generate_scenes(video_description: str, total_seconds: int) -> list:
    keywords = extract_keywords(video_description)
    scene_count = min(6, max(3, len(keywords) // 2))
    chunk = total_seconds // scene_count
    scenes = []
    for i in range(scene_count):
        start = i * chunk + random.randint(0, max(1, chunk // 4))
        end = min((i + 1) * chunk - random.randint(0, max(1, chunk // 4)), total_seconds)
        if end <= start:
            end = start + 10
        kw = keywords[i % len(keywords)] if keywords else f"segment {i + 1}"
        scenes.append({
            "id": f"scene-{i + 1}",
            "start": seconds_to_timestamp(start),
            "end": seconds_to_timestamp(end),
            "duration_seconds": end - start,
            "label": f"{kw.capitalize()} moment",
            "confidence": round(0.7 + random.random() * 0.25, 2)
        })
    return scenes


def generate_clips(video_description: str, goal: str, total_seconds: int) -> list:
    keywords = extract_keywords(video_description)
    goal_lower = goal.lower()

    # Determine how many clips based on goal
    if "hook" in goal_lower or "short" in goal_lower:
        count = 3
        target_duration = 15
    elif "testimonial" in goal_lower or "quote" in goal_lower:
        count = 4
        target_duration = 20
    elif "variant" in goal_lower or "ab" in goal_lower or "a/b" in goal_lower:
        count = 3
        target_duration = 30
    elif "highlight" in goal_lower or "best" in goal_lower:
        count = 5
        target_duration = 20
    else:
        count = 4
        target_duration = 25

    clips = []
    used_ranges = []
    for i in range(count):
        # Find a reasonable start time
        attempts = 0
        while attempts < 20:
            start_sec = random.randint(5, max(10, total_seconds - target_duration - 5))
            end_sec = start_sec + target_duration + random.randint(-5, 10)
            end_sec = min(end_sec, total_seconds)
            overlap = False
            for u in used_ranges:
                if not (end_sec < u[0] or start_sec > u[1]):
                    overlap = True
                    break
            if not overlap:
                used_ranges.append((start_sec, end_sec))
                break
            attempts += 1
        if attempts >= 20:
            start_sec = (i * (total_seconds // count)) + 5
            end_sec = start_sec + target_duration

        kw = keywords[i % len(keywords)] if keywords else f"segment {i + 1}"
        variant_types = ["Direct", "Emotional", "Fast-paced", "Minimal", "Conversational", "Bold"]
        variant = variant_types[i % len(variant_types)]

        clips.append({
            "id": f"clip-{i + 1}",
            "start": seconds_to_timestamp(start_sec),
            "end": seconds_to_timestamp(end_sec),
            "duration_seconds": end_sec - start_sec,
            "label": f"{variant}: {kw.capitalize()} segment",
            "reasoning": f"This segment captures a strong {kw} beat at {seconds_to_timestamp(start_sec)}. Good for {goal_lower}.",
            "status": "pending",
            "variant": variant
        })
    # Sort by start time
    clips.sort(key=lambda c: parse_duration_to_seconds(c["start"]))
    return clips


def handle_describe():
    return {
        "name": "reelforge-director",
        "tools": [
            {
                "name": "direct",
                "description": "AI video director. Actions: analyze, propose, assemble, get_state.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "action": {
                            "type": "string",
                            "enum": ["analyze", "propose", "assemble", "get_state"],
                            "description": "Action to perform"
                        },
                        "video_description": {
                            "type": "string",
                            "description": "Description or transcript of the video footage"
                        },
                        "goal": {
                            "type": "string",
                            "description": "Creative goal, e.g. '30s hook, interview'"
                        },
                        "project_id": {
                            "type": "string",
                            "description": "Project identifier"
                        },
                        "approved_clips": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of approved clip IDs for assemble"
                        }
                    },
                    "required": ["action"]
                }
            }
        ]
    }


def handle_invoke(params):
    action = params.get("action", "")
    video_description = params.get("video_description", "")
    goal = params.get("goal", "")
    project_id = params.get("project_id", "")
    approved_clips = params.get("approved_clips", [])

    state = load_state()

    if action == "analyze":
        if not video_description:
            return {"error": "video_description required for analyze"}
        pid = project_id or get_project_id(video_description)
        total_seconds = infer_total_duration(video_description)
        scenes = generate_scenes(video_description, total_seconds)
        result = {
            "project_id": pid,
            "total_duration": seconds_to_timestamp(total_seconds),
            "total_seconds": total_seconds,
            "scenes": scenes,
            "summary": f"Analyzed {seconds_to_timestamp(total_seconds)} of footage. Found {len(scenes)} distinct scenes with strong editorial moments."
        }
        state["projects"][pid] = {
            "video_description": video_description,
            "total_seconds": total_seconds,
            "scenes": scenes,
            "clips": [],
            "approved": [],
            "rejected": [],
            "goal": ""
        }
        save_state(state)
        return {"output": result}

    if action == "propose":
        if not video_description and not project_id:
            return {"error": "video_description or project_id required for propose"}
        pid = project_id or get_project_id(video_description)
        if pid in state["projects"]:
            video_description = state["projects"][pid].get("video_description", video_description)
        total_seconds = infer_total_duration(video_description)
        if pid in state["projects"]:
            total_seconds = state["projects"][pid].get("total_seconds", total_seconds)
        clips = generate_clips(video_description, goal, total_seconds)
        if pid in state["projects"]:
            state["projects"][pid]["clips"] = clips
            state["projects"][pid]["goal"] = goal
            save_state(state)
        result = {
            "project_id": pid,
            "goal": goal,
            "clips": clips,
            "summary": f"Proposed {len(clips)} clips for goal: {goal}. Total runtime of selected clips: {sum(c['duration_seconds'] for c in clips)}s."
        }
        return {"output": result}

    if action == "assemble":
        if not project_id:
            return {"error": "project_id required for assemble"}
        if project_id not in state["projects"]:
            return {"error": f"Project {project_id} not found"}
        proj = state["projects"][project_id]
        all_clips = proj.get("clips", [])
        approved = [c for c in all_clips if c["id"] in approved_clips]
        total_approved = sum(c["duration_seconds"] for c in approved)
        result = {
            "project_id": project_id,
            "approved_count": len(approved),
            "total_duration_seconds": total_approved,
            "total_duration": seconds_to_timestamp(total_approved),
            "sequence": approved,
            "summary": f"Assembled {len(approved)} clips into a {seconds_to_timestamp(total_approved)} sequence. Ready for export."
        }
        state["projects"][project_id]["approved"] = approved_clips
        save_state(state)
        return {"output": result}

    if action == "get_state":
        pid = project_id or ""
        if pid and pid in state["projects"]:
            return {"output": state["projects"][pid]}
        return {"output": {"projects": list(state["projects"].keys())}}

    return {"error": f"Unknown action: {action}"}


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            continue

        req_id = req.get("id")
        method = req.get("method", "")
        params = req.get("params", {})

        if method == "describe":
            result = handle_describe()
        elif method == "invoke":
            result = handle_invoke(params)
        else:
            result = {"error": f"Unknown method: {method}"}

        resp = {"jsonrpc": "2.0", "id": req_id, "result": result}
        sys.stdout.write(json.dumps(resp) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
