# Braindump – AI-Powered Personal Productivity Tool

> Claysys AI Hackathon · Capture anything. We'll sort it out.

A lightweight personal productivity app built with **React**, **Tailwind CSS**, and **Lucide icons**. Braindump lets you quickly capture thoughts in plain English and automatically categorises them as a **Task**, **Note**, or **Reminder** using lightweight NLP keyword scoring.

## Features

- **Single Braindump input** — one text area for all your thoughts
- **Auto-categorisation** — natural-language keyword analysis assigns each entry to one of three types:
  - ✅ **Task** — action-oriented entries (e.g. "Fix the login bug ASAP")
  - 🔔 **Reminder** — time-referenced entries (e.g. "Remind me to call John at 3pm")
  - 📄 **Note** — everything else (e.g. "Design tokens live in the brand guide")
- **Structured JSON schema** — every item is stored as:
  ```json
  {
    "id": "uuid-v4",
    "type": "Task | Reminder | Note",
    "content": "original text",
    "createdAt": "ISO 8601 timestamp",
    "metadata": {
      "priority": "high | medium | low",
      "dueHint": "tomorrow | at 3pm | …",
      "tags": ["tag1", "tag2"]
    }
  }
  ```
- **Priority detection** — Tasks are automatically flagged High / Medium / Low based on urgency keywords
- **Due hint extraction** — Reminders surface the time phrase (e.g. "tomorrow", "next week")
- **Hashtag support** — `#tags` in your input are parsed and displayed
- **Filter bar** — filter the feed by All / Task / Reminder / Note with live counts
- **Delete items** — hover a card to reveal the delete button
- **Minimalist, mobile-responsive UI** — clean, readable on any screen size

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

