// ── State ──────────────────────────────────────────────
let tasks = loadTasks();

// ── DOM refs ───────────────────────────────────────────
const input     = document.getElementById('task-input');
const addBtn    = document.getElementById('add-btn');
const taskList  = document.getElementById('task-list');
const counter   = document.getElementById('counter');
const emptyMsg  = document.getElementById('empty-msg');

// ── Init ───────────────────────────────────────────────
render();

// ── Event listeners ────────────────────────────────────
addBtn.addEventListener('click', addTask);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// ── Core functions ─────────────────────────────────────
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  tasks.push({ id: Date.now(), text, done: false });
  input.value = '';
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// ── Render ─────────────────────────────────────────────
function render() {
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = task.text;
    span.title       = 'Doble clic para editar';
    span.addEventListener('dblclick', () => startEdit(task.id, li, span));

    const delBtn = document.createElement('button');
    delBtn.className   = 'delete-btn';
    delBtn.textContent = '✕';
    delBtn.title       = 'Eliminar tarea';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, span, delBtn);
    taskList.appendChild(li);
  });

  updateCounter();
  toggleEmptyMessage();
}

function updateCounter() {
  const pending = tasks.filter(t => !t.done).length;
  counter.textContent = pending === 1 ? '1 pendiente' : `${pending} pendientes`;
}

function toggleEmptyMessage() {
  emptyMsg.classList.toggle('hidden', tasks.length > 0);
}

// ── Edit ───────────────────────────────────────────────
function startEdit(id, li, span) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'edit-input';
  editInput.value     = task.text;

  li.classList.add('editing');
  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();

  let committed = false;

  function commit() {
    if (committed) return;
    committed = true;

    const newText = editInput.value.trim();
    if (!newText) {
      deleteTask(id);
    } else {
      task.text = newText;
      saveTasks();
      render();
    }
  }

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') { committed = true; render(); }
  });

  editInput.addEventListener('blur', commit);
}

// ── localStorage ───────────────────────────────────────
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  } catch {
    return [];
  }
}
