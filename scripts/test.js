const assert = require("assert");
const logic = require("../habitLogic");

const state = {
  filter: "all",
  habits: [
    {
      id: "walk",
      name: "Walk",
      hypothesis: "",
      target: 7,
      unit: "days",
      archived: false,
      checkins: ["2026-06-25", "2026-06-24", "2026-06-22"],
    },
    {
      id: "read",
      name: "Read",
      hypothesis: "",
      target: 3,
      unit: "sessions",
      archived: false,
      checkins: ["2026-06-23"],
    },
    {
      id: "old",
      name: "Old",
      hypothesis: "",
      target: 1,
      unit: "days",
      archived: true,
      checkins: ["2026-06-25"],
    },
  ],
  notes: [],
};

assert.equal(logic.activeHabits(state).length, 2);
assert.equal(logic.archivedHabits(state).length, 1);
assert.equal(logic.hasCheckedInOn(state.habits[0], "2026-06-25"), true);
assert.equal(logic.hasCheckedInOn(state.habits[0], "2026-06-23"), false);
assert.equal(logic.currentStreak(state.habits[0], "2026-06-25"), 2);
assert.equal(logic.currentStreak(state.habits[1], "2026-06-25"), 0);
assert.ok(Math.abs(logic.habitProgress(state.habits[1]) - (100 / 3)) < 0.001);

const toggledOff = logic.toggleCheckin(state.habits[0], "2026-06-25");
assert.equal(logic.hasCheckedInOn(toggledOff, "2026-06-25"), false);

const toggledOn = logic.toggleCheckin(toggledOff, "2026-06-21");
assert.equal(logic.hasCheckedInOn(toggledOn, "2026-06-21"), true);

const summary = logic.weeklySummary(state, "2026-06-25");
assert.equal(summary.possible, 14);
assert.equal(summary.completed, 4);
assert.deepEqual(summary.days.map((day) => day.date), [
  "2026-06-19",
  "2026-06-20",
  "2026-06-21",
  "2026-06-22",
  "2026-06-23",
  "2026-06-24",
  "2026-06-25",
]);

const history = logic.historyForHabit(state.habits[0], 3, "2026-06-25");
assert.deepEqual(history, [
  { date: "2026-06-23", checked: false },
  { date: "2026-06-24", checked: true },
  { date: "2026-06-25", checked: true },
]);

const normalized = logic.normalizeState({
  habits: [{ id: 123, name: "", target: 0, checkins: ["2026-06-25", "2026-06-25"] }],
  notes: [{ text: "note" }],
});
assert.equal(normalized.habits[0].target, 1);
assert.equal(normalized.habits[0].checkins.length, 1);
assert.equal(normalized.notes[0].text, "note");

console.log("Habit logic tests passed.");
