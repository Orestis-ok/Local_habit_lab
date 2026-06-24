# Local Habit Lab

Local Habit Lab is a small browser app for testing personal habits like lightweight experiments. It helps you create habits, write a hypothesis for each one, check in daily, track progress, and keep short lab notes about what you notice.

The first version is intentionally simple: no framework, no backend, and no account required. Your data is saved in the browser with `localStorage`.

## Features

- Create habits with a target and unit.
- Add a hypothesis for each habit.
- Check habits in for today.
- See active habit count, today&apos;s check-ins, and best streak.
- Filter habits by all, today, and watching.
- Archive habits you no longer want to track.
- Save daily lab notes.
- Run locally with a tiny Node static server.

## Project Structure

```text
local-habit-lab/
  index.html
  styles.css
  app.js
  server.js
  README.md
```

## Run Locally

From this folder:

```bash
node server.js
```

Then open:

```text
http://127.0.0.1:5177/
```

You can also open `index.html` directly in a browser, but the local server is the cleaner development path.

## Current Version

This is the first usable version of the project. It is best treated as `v0.1.0`: a working prototype with local persistence and the core habit experiment loop.

## Roadmap

- Add habit editing.
- Add an archive view and restore action.
- Add weekly summaries.
- Add export and import for backup.
- Add visual history per habit.
- Add keyboard-friendly interactions.
- Add tests before the project grows.

## Tech

- HTML
- CSS
- JavaScript
- Node.js static server
- Browser `localStorage`

## License

No license has been chosen yet.
