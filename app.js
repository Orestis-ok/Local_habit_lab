const storageKey = "local-habit-lab-v2";
const previousStorageKey = "local-habit-lab-v1";
const logic = window.HabitLogic;

const starterState = {
  filter: "all",
  editingHabitId: null,
  habits: [
    {
      id: crypto.randomUUID(),
      name: "Walk after lunch",
      hypothesis: "A short walk will lower afternoon friction and make deep work easier.",
      target: 7,
      unit: "days",
      archived: false,
      checkins: [logic.todayKey(), shiftDate(-1), shiftDate(-2)],
    },
    {
      id: crypto.randomUUID(),
      name: "Read before phone",
      hypothesis: "Ten pages first will make the morning feel less reactive.",
      target: 5,
      unit: "sessions",
      archived: false,
      checkins: [shiftDate(-3)],
    },
  ],
  notes: [
    {
      id: crypto.randomUUID(),
      date: logic.todayKey(),
      text: "Started the lab. First question: which habit changes the texture of the day fastest?",
    },
  ],
};

let state = loadState();

const habitList = document.querySelector("#habitList");
const noteList = document.querySelector("#noteList");
const habitTemplate = document.querySelector("#habitTemplate");
const habitForm = document.querySelector("#habitForm");
const noteForm = document.querySelector("#noteForm");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const importInput = document.querySelector("#importInput");

function shiftDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return logic.todayKey(date);
}

function loadState() {
  const saved = localStorage.getItem(storageKey) || localStorage.getItem(previousStorageKey);
  if (!saved) return logic.normalizeState(starterState);

  try {
    return {
      ...logic.normalizeState(JSON.parse(saved)),
      editingHabitId: null,
    };
  } catch {
    return logic.normalizeState(starterState);
  }
}

function saveState() {
  const persisted = {
    filter: state.filter,
    habits: state.habits,
    notes: state.notes,
  };
  localStorage.setItem(storageKey, JSON.stringify(persisted));
}

function filteredHabits() {
  if (state.filter === "archive") return logic.archivedHabits(state);

  const active = logic.activeHabits(state);
  if (state.filter === "today") {
    return active.filter((habit) => logic.hasCheckedInOn(habit, logic.todayKey()));
  }
  if (state.filter === "watching") {
    return active.filter((habit) => habit.checkins.length < Number(habit.target));
  }
  return active;
}

function render() {
  renderStats();
  renderFilters();
  renderHabits();
  renderWeeklySummary();
  renderNotes();
  renderHabitFormMode();
}

function renderStats() {
  const activeHabits = logic.activeHabits(state);
  const archivedHabits = logic.archivedHabits(state);
  document.querySelector("#activeHabitCount").textContent = activeHabits.length;
  document.querySelector("#todayCheckins").textContent =
    activeHabits.filter((habit) => logic.hasCheckedInOn(habit, logic.todayKey())).length;
  document.querySelector("#bestStreak").textContent =
    Math.max(0, ...activeHabits.map((habit) => logic.currentStreak(habit)));
  document.querySelector("#archivedHabitCount").textContent = archivedHabits.length;
}

function renderFilters() {
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });
}

function renderHabits() {
  const habits = filteredHabits();
  habitList.replaceChildren();

  if (habits.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = state.filter === "archive"
      ? "No archived habits yet."
      : "No habits match this view yet.";
    habitList.append(empty);
    return;
  }

  habits.forEach((habit) => {
    const card = habitTemplate.content.firstElementChild.cloneNode(true);
    const progress = logic.habitProgress(habit);
    const checkButton = card.querySelector(".check-button");
    const archiveButton = card.querySelector("[data-action='archive']");
    const restoreButton = card.querySelector("[data-action='restore']");
    const editButton = card.querySelector("[data-action='edit']");

    card.querySelector("h3").textContent = habit.name;
    card.querySelector(".hypothesis").textContent =
      habit.hypothesis || "No hypothesis yet. Keep it light and testable.";
    card.querySelector(".progress-track span").style.width = `${progress}%`;
    card.querySelector(".meta").textContent =
      `${habit.checkins.length}/${habit.target} ${habit.unit} logged - ${logic.currentStreak(habit)} day streak`;

    checkButton.classList.toggle("is-complete", logic.hasCheckedInOn(habit, logic.todayKey()));
    checkButton.disabled = habit.archived;
    checkButton.addEventListener("click", () => toggleToday(habit.id));

    editButton.addEventListener("click", () => startEditing(habit.id));
    archiveButton.addEventListener("click", () => setArchiveState(habit.id, true));
    restoreButton.addEventListener("click", () => setArchiveState(habit.id, false));

    archiveButton.hidden = habit.archived;
    restoreButton.hidden = !habit.archived;
    editButton.hidden = habit.archived;
    renderHistory(card.querySelector(".history-grid"), habit);
    habitList.append(card);
  });
}

function renderHistory(container, habit) {
  container.replaceChildren();

  logic.historyForHabit(habit).forEach((day) => {
    const item = document.createElement("span");
    item.className = day.checked ? "history-day is-complete" : "history-day";
    item.title = `${day.date}: ${day.checked ? "checked in" : "missed"}`;
    item.setAttribute("aria-label", item.title);
    container.append(item);
  });
}

function renderWeeklySummary() {
  const summary = logic.weeklySummary(state);
  const rate = summary.possible === 0 ? 0 : Math.round((summary.completed / summary.possible) * 100);
  document.querySelector("#weeklyScore").textContent = `${rate}%`;
  document.querySelector("#weeklyDetail").textContent =
    `${summary.completed} of ${summary.possible} possible check-ins completed this week`;

  const list = document.querySelector("#weeklyDays");
  list.replaceChildren();
  summary.days.forEach((day) => {
    const item = document.createElement("li");
    item.innerHTML = "<span></span><strong></strong>";
    item.querySelector("span").textContent = day.date.slice(5);
    item.querySelector("strong").textContent = `${day.completed}/${day.total}`;
    list.append(item);
  });
}

function renderNotes() {
  noteList.replaceChildren();

  state.notes.slice(0, 5).forEach((note) => {
    const item = document.createElement("article");
    item.className = "note";
    item.innerHTML = `
      <p></p>
      <span class="note-date"></span>
    `;
    item.querySelector("p").textContent = note.text;
    item.querySelector(".note-date").textContent = note.date;
    noteList.append(item);
  });
}

function renderHabitFormMode() {
  const editingHabit = state.habits.find((habit) => habit.id === state.editingHabitId);
  document.querySelector("#habitFormTitle").textContent = editingHabit ? "Edit Habit" : "New Habit";
  document.querySelector("#habitSubmitButton").textContent = editingHabit ? "Save changes" : "Create habit";
  document.querySelector("#cancelEditButton").hidden = !editingHabit;
}

function toggleToday(id) {
  state.habits = state.habits.map((habit) => {
    if (habit.id !== id) return habit;
    return logic.toggleCheckin(habit, logic.todayKey());
  });

  saveState();
  render();
}

function setArchiveState(id, archived) {
  state.habits = state.habits.map((habit) => {
    if (habit.id !== id) return habit;
    return { ...habit, archived };
  });

  if (state.editingHabitId === id) {
    resetHabitForm();
  }

  saveState();
  render();
}

function startEditing(id) {
  const habit = state.habits.find((item) => item.id === id);
  if (!habit) return;

  state.editingHabitId = id;
  document.querySelector("#habitName").value = habit.name;
  document.querySelector("#habitHypothesis").value = habit.hypothesis;
  document.querySelector("#habitTarget").value = habit.target;
  document.querySelector("#habitUnit").value = habit.unit;
  document.querySelector("#habitName").focus();
  renderHabitFormMode();
}

function resetHabitForm() {
  state.editingHabitId = null;
  habitForm.reset();
  document.querySelector("#habitTarget").value = 7;
  renderHabitFormMode();
}

function exportBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    app: "local-habit-lab",
    version: "0.2.0",
    state: {
      filter: "all",
      habits: state.habits,
      notes: state.notes,
    },
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `local-habit-lab-backup-${logic.todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const nextState = logic.normalizeState(parsed.state || parsed);
      state = {
        ...nextState,
        filter: "all",
        editingHabitId: null,
      };
      saveState();
      resetHabitForm();
      render();
    } catch {
      window.alert("That backup file could not be imported.");
    }
  });
  reader.readAsText(file);
}

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const habitFields = {
    name: document.querySelector("#habitName").value.trim(),
    hypothesis: document.querySelector("#habitHypothesis").value.trim(),
    target: Number(document.querySelector("#habitTarget").value),
    unit: document.querySelector("#habitUnit").value,
  };

  if (!habitFields.name) return;

  if (state.editingHabitId) {
    state.habits = state.habits.map((habit) => {
      if (habit.id !== state.editingHabitId) return habit;
      return logic.normalizeState({ habits: [{ ...habit, ...habitFields }] }).habits[0];
    });
  } else {
    state.habits.unshift({
      id: crypto.randomUUID(),
      ...habitFields,
      archived: false,
      checkins: [],
    });
  }

  resetHabitForm();
  saveState();
  render();
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#noteInput");
  const text = input.value.trim();
  if (!text) return;

  state.notes.unshift({
    id: crypto.randomUUID(),
    date: logic.todayKey(),
    text,
  });

  input.value = "";
  saveState();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    saveState();
    render();
  });
});

document.querySelector("#addHabitButton").addEventListener("click", () => {
  resetHabitForm();
  document.querySelector("#habitName").focus();
});

document.querySelector("#cancelEditButton").addEventListener("click", resetHabitForm);
document.querySelector("#exportButton").addEventListener("click", exportBackup);
document.querySelector("#importButton").addEventListener("click", () => importInput.click());
importInput.addEventListener("change", () => {
  importBackup(importInput.files[0]);
  importInput.value = "";
});

render();
