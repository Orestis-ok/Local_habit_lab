const storageKey = "local-habit-lab-v1";

const todayKey = () => new Date().toISOString().slice(0, 10);

const starterState = {
  filter: "all",
  habits: [
    {
      id: crypto.randomUUID(),
      name: "Walk after lunch",
      hypothesis: "A short walk will lower afternoon friction and make deep work easier.",
      target: 7,
      unit: "days",
      archived: false,
      checkins: [todayKey()],
    },
    {
      id: crypto.randomUUID(),
      name: "Read before phone",
      hypothesis: "Ten pages first will make the morning feel less reactive.",
      target: 5,
      unit: "sessions",
      archived: false,
      checkins: [],
    },
  ],
  notes: [
    {
      id: crypto.randomUUID(),
      date: todayKey(),
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

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return starterState;

  try {
    return JSON.parse(saved);
  } catch {
    return starterState;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function hasCheckedInToday(habit) {
  return habit.checkins.includes(todayKey());
}

function currentStreak(habit) {
  const checked = new Set(habit.checkins);
  let streak = 0;
  const cursor = new Date();

  while (checked.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function filteredHabits() {
  const active = state.habits.filter((habit) => !habit.archived);
  if (state.filter === "today") return active.filter(hasCheckedInToday);
  if (state.filter === "watching") {
    return active.filter((habit) => habit.checkins.length < Number(habit.target));
  }
  return active;
}

function render() {
  renderStats();
  renderFilters();
  renderHabits();
  renderNotes();
}

function renderStats() {
  const activeHabits = state.habits.filter((habit) => !habit.archived);
  document.querySelector("#activeHabitCount").textContent = activeHabits.length;
  document.querySelector("#todayCheckins").textContent =
    activeHabits.filter(hasCheckedInToday).length;
  document.querySelector("#bestStreak").textContent =
    Math.max(0, ...activeHabits.map(currentStreak));
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
    empty.textContent = "No habits match this view yet.";
    habitList.append(empty);
    return;
  }

  habits.forEach((habit) => {
    const card = habitTemplate.content.firstElementChild.cloneNode(true);
    const progress = Math.min(100, (habit.checkins.length / Number(habit.target)) * 100);
    const checkButton = card.querySelector(".check-button");

    card.querySelector("h3").textContent = habit.name;
    card.querySelector(".hypothesis").textContent =
      habit.hypothesis || "No hypothesis yet. Keep it light and testable.";
    card.querySelector(".progress-track span").style.width = `${progress}%`;
    card.querySelector(".meta").textContent =
      `${habit.checkins.length}/${habit.target} ${habit.unit} logged - ${currentStreak(habit)} day streak`;

    checkButton.classList.toggle("is-complete", hasCheckedInToday(habit));
    checkButton.addEventListener("click", () => toggleToday(habit.id));

    card.querySelector(".ghost-button").addEventListener("click", () => archiveHabit(habit.id));
    habitList.append(card);
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

function toggleToday(id) {
  const habit = state.habits.find((item) => item.id === id);
  if (!habit) return;

  const today = todayKey();
  habit.checkins = hasCheckedInToday(habit)
    ? habit.checkins.filter((date) => date !== today)
    : [today, ...habit.checkins];

  saveState();
  render();
}

function archiveHabit(id) {
  const habit = state.habits.find((item) => item.id === id);
  if (!habit) return;
  habit.archived = true;
  saveState();
  render();
}

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const habit = {
    id: crypto.randomUUID(),
    name: document.querySelector("#habitName").value.trim(),
    hypothesis: document.querySelector("#habitHypothesis").value.trim(),
    target: Number(document.querySelector("#habitTarget").value),
    unit: document.querySelector("#habitUnit").value,
    archived: false,
    checkins: [],
  };

  if (!habit.name) return;
  state.habits.unshift(habit);
  habitForm.reset();
  document.querySelector("#habitTarget").value = 7;
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
    date: todayKey(),
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
  document.querySelector("#habitName").focus();
});

render();
