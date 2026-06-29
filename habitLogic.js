(function publishHabitLogic(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.HabitLogic = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function createHabitLogic() {
  function todayKey(date = new Date()) {
    return new Date(date).toISOString().slice(0, 10);
  }

  function addDays(dateKey, offset) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + offset);
    return todayKey(date);
  }

  function weekDays(endingOn = todayKey()) {
    return Array.from({ length: 7 }, (_, index) => addDays(endingOn, index - 6));
  }

  function activeHabits(state) {
    return state.habits.filter((habit) => !habit.archived);
  }

  function archivedHabits(state) {
    return state.habits.filter((habit) => habit.archived);
  }

  function hasCheckedInOn(habit, dateKey = todayKey()) {
    return Array.isArray(habit.checkins) && habit.checkins.includes(dateKey);
  }

  function currentStreak(habit, endingOn = todayKey()) {
    const checked = new Set(habit.checkins || []);
    let streak = 0;
    let cursor = endingOn;

    while (checked.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    return streak;
  }

  function habitProgress(habit) {
    const target = Math.max(1, Number(habit.target) || 1);
    return Math.min(100, ((habit.checkins || []).length / target) * 100);
  }

  function historyForHabit(habit, days = 14, endingOn = todayKey()) {
    return Array.from({ length: days }, (_, index) => {
      const date = addDays(endingOn, index - (days - 1));
      return {
        date,
        checked: hasCheckedInOn(habit, date),
      };
    });
  }

  function weeklySummary(state, endingOn = todayKey()) {
    const days = weekDays(endingOn);
    const habits = activeHabits(state);
    const daySummaries = days.map((date) => {
      const completed = habits.filter((habit) => hasCheckedInOn(habit, date)).length;
      return {
        date,
        completed,
        total: habits.length,
      };
    });

    return {
      days: daySummaries,
      completed: daySummaries.reduce((sum, day) => sum + day.completed, 0),
      possible: daySummaries.reduce((sum, day) => sum + day.total, 0),
    };
  }

  function toggleCheckin(habit, dateKey = todayKey()) {
    const checkins = new Set(habit.checkins || []);
    if (checkins.has(dateKey)) {
      checkins.delete(dateKey);
    } else {
      checkins.add(dateKey);
    }

    return {
      ...habit,
      checkins: Array.from(checkins).sort().reverse(),
    };
  }

  function normalizeState(rawState) {
    const state = rawState && typeof rawState === "object" ? rawState : {};
    return {
      filter: state.filter || "all",
      habits: Array.isArray(state.habits) ? state.habits.map(normalizeHabit) : [],
      notes: Array.isArray(state.notes) ? state.notes.map(normalizeNote) : [],
    };
  }

  function normalizeHabit(habit) {
    return {
      id: String(habit.id || cryptoId()),
      name: String(habit.name || "Untitled habit"),
      hypothesis: String(habit.hypothesis || ""),
      target: Math.max(1, Number(habit.target) || 1),
      unit: String(habit.unit || "days"),
      archived: Boolean(habit.archived),
      checkins: Array.isArray(habit.checkins) ? [...new Set(habit.checkins)].sort().reverse() : [],
    };
  }

  function normalizeNote(note) {
    return {
      id: String(note.id || cryptoId()),
      date: String(note.date || todayKey()),
      text: String(note.text || ""),
    };
  }

  function cryptoId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  return {
    activeHabits,
    archivedHabits,
    currentStreak,
    habitProgress,
    hasCheckedInOn,
    historyForHabit,
    normalizeState,
    todayKey,
    toggleCheckin,
    weeklySummary,
  };
});
