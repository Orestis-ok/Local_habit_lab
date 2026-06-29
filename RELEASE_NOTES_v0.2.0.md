## v0.2.0 - Issue Resolution Release

Local Habit Lab v0.2.0 resolves the first public issue set and turns the prototype into a more complete local-first habit experiment tool.

### Added

- Habit editing for existing habits.
- Archive view for archived habits.
- Restore action for archived habits.
- JSON backup export.
- JSON backup import.
- Weekly summary view with completed versus possible check-ins.
- 14-day per-habit history chart.
- Shared habit state logic module.
- Dependency-free Node tests for habit state logic.
- GitHub Actions test step in the release workflow.

### Changed

- Updated the app storage key to `local-habit-lab-v2`.
- Migrates existing `local-habit-lab-v1` browser data when available.
- Updated package version to `0.2.0`.
- Updated README for the new feature set and scripts.
- Release package now includes scripts and workflow files.

### Fixed

- Archived habits can now be recovered instead of disappearing from normal workflows.
- Habit state calculations are now covered by tests.

### Resolved Issues

- #2 Add habit editing
- #3 Add archive view and restore action
- #4 Add export/import backup
- #5 Add weekly summary view
- #6 Add per-habit history chart
- #7 Add tests for habit state logic

### Verify Locally

```bash
npm run validate
npm test
npm run package
```

### Release Tag

```bash
v0.2.0
```
