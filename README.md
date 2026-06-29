# Local Habit Lab

Local Habit Lab is a small browser app for testing personal habits like lightweight experiments. It helps you create habits, write a hypothesis for each one, check in daily, track progress, review weekly patterns, and keep short lab notes about what you notice.

The project is intentionally simple: no framework, no backend, and no account required. Your data is saved in the browser with `localStorage`, and you can export a JSON backup whenever you want.

## Features

- Create and edit habits with a target and unit.
- Add a hypothesis for each habit.
- Check habits in for today.
- See active habit count, today&apos;s check-ins, best streak, and archived habit count.
- Filter habits by all, today, watching, and archive.
- Archive habits and restore them later.
- Save daily lab notes.
- Review a weekly summary of possible and completed check-ins.
- See a 14-day history chart for each habit.
- Export and import JSON backups.
- Run locally with a tiny Node static server.
- Validate and test habit state logic with dependency-free Node scripts.

## Project Structure

```text
local-habit-lab/
  .github/workflows/release.yml
  scripts/
    package-release.js
    test.js
    validate.js
  app.js
  habitLogic.js
  index.html
  package.json
  server.js
  styles.css
  README.md
```

## Run Locally

From this folder:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:5177/
```

You can also open `index.html` directly in a browser, but the local server is the cleaner development path.

## Validate, Test, and Package

Check that the core project files are present:

```bash
npm run validate
```

Run habit state logic tests:

```bash
npm test
```

Create a release zip in `dist/`:

```bash
npm run package
```

GitHub Actions runs validation and tests on pushes and pull requests. When you push a version tag like `v0.2.0`, the release workflow builds a zip artifact and uploads it to the GitHub release.

## Current Version

This is `v0.2.0`: the issue-resolution release. It adds editing, archive restore, backup import/export, weekly summaries, per-habit history charts, and tests for core habit state logic.

## Roadmap

- Add keyboard-friendly interactions.
- Add stronger accessibility checks.
- Add richer charts over longer time ranges.
- Add optional note editing.
- Consider a framework migration once the app grows past the plain JavaScript sweet spot.

## Tech

- HTML
- CSS
- JavaScript
- Node.js static server
- Browser `localStorage`

## License

No license has been chosen yet.
