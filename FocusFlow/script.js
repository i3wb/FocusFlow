// ---------------- THEME ----------------
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') document.body.classList.add('light');

themeToggle.onclick = () => {
  document.body.classList.toggle('light');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('light') ? 'light' : 'dark'
  );
};

// ---------------- TASKS ----------------
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateAnalytics();
}

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="color:#94a3b8">No tasks yet. Stay focused ✨</p>';
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.draggable = true;

    li.innerHTML = `
      <span>${task.text}</span>
      <button>✓</button>
    `;

    li.querySelector('button').onclick = () => toggleTask(index);

    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      tasks = [...taskList.children].map(item => ({
        text: item.querySelector('span').textContent,
        completed: item.classList.contains('completed')
      }));
      saveTasks();
    });

    taskList.appendChild(li);
  });
}

taskList.addEventListener('dragover', e => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  const afterElement = [...taskList.children]
    .filter(el => el !== dragging)
    .find(el => e.clientY < el.offsetTop + el.offsetHeight / 2);

  if (!afterElement) {
    taskList.appendChild(dragging);
  } else {
    taskList.insertBefore(dragging, afterElement);
  }
});

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  tasks.push({ text: taskInput.value, completed: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
});

// ---------------- TIMER ----------------
let time = 25 * 60;
let interval = null;
let sessions = Number(localStorage.getItem('sessions')) || 0;

const timeDisplay = document.getElementById('time');

function updateTime() {
  const m = String(Math.floor(time / 60)).padStart(2, '0');
  const s = String(time % 60).padStart(2, '0');
  timeDisplay.textContent = `${m}:${s}`;
}

document.getElementById('start').onclick = () => {
  if (interval) return;

  interval = setInterval(() => {
    time--;
    updateTime();

    if (time === 0) {
      clearInterval(interval);
      interval = null;
      sessions++;
      localStorage.setItem('sessions', sessions);
      alert('Focus session complete! 🎉');
      time = 25 * 60;
      updateAnalytics();
      updateTime();
    }
  }, 1000);
};

document.getElementById('reset').onclick = () => {
  clearInterval(interval);
  interval = null;
  time = 25 * 60;
  updateTime();
};

// ---------------- ANALYTICS + CHART ----------------
const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length || 1;
  const percent = completed / total;

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, canvas.width * percent, canvas.height);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px Inter';
  ctx.fillText(`Completion: ${Math.round(percent * 100)}%`, 10, 30);
}

function updateAnalytics() {
  document.getElementById('total-tasks').textContent = tasks.length;
  document.getElementById('completed-tasks').textContent =
    tasks.filter(t => t.completed).length;
  document.getElementById('sessions').textContent = sessions;
  drawChart();
}

// ---------------- KEYBOARD SHORTCUTS ----------------
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement !== taskInput) {
    taskInput.focus();
  }

  if (e.key === ' ') {
    e.preventDefault();
    document.getElementById('start').click();
  }
});

// ---------------- INIT ----------------
renderTasks();
updateAnalytics();
updateTime();
