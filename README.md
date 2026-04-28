# YKI 2026 - Swedish B1 Exam Practice App

An exam-style web app for **YKI Swedish intermediate (B1 focus)** practice, designed for learners preparing for practical tasks.

Built with React + TypeScript + Vite.

## What This App Includes

- Realistic listening and writing practice flows
- Separate paper-style views for:
  - Listening paper (Swedish)
  - Listening paper (English)
  - Writing paper (Swedish)
  - Writing paper (English)
- Real-time listening support:
  - Live Swedish captions
  - English translation line-by-line
  - Auto-scroll to current line while audio runs
- Learning mode vs exam strict mode
- Sticky mini audio control bars for easier playback while scrolling
- B1-focused wording for task instructions and paper prompts

## Main Features

### Listening

- Real exam scenario flow:
  - Spoken instruction -> intro -> main audio
  - Countdown and stage cues
  - Play limit handling
- Paper mode:
  - Big center play button inside paper body
  - Sticky audio controls (`Play / Stop / Current part`)
  - Live caption panel synced with running audio
- Practice mode:
  - Topic-based listening drills
  - Live translation while audio is playing
  - Sticky practice audio bar

### Writing

- Practical message + opinion task formats
- Structured guidance and checklists
- Paper-style writing sheets with candidate fields
- Swedish/English paper switching

### Learning Resources

- In-app resource links and preparation guidance
- B1-oriented preparation strategy and workflow notes

## Tech Stack

- React 19
- TypeScript
- Vite
- CSS (custom styles)

## Project Structure

```text
src/
  App.tsx        # Main app logic and UI flows
  App.css        # Main styling
  main.tsx       # App entrypoint
```

## Run Locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the local URL shown in terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

## Notes

- Audio playback uses browser speech synthesis (`sv-SE`) for practice simulation.
- This project is designed for practical B1 preparation; it is not an official YKI exam product.


