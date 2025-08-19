// --- Task Management ---
let taskCounter = 1;
let inProgress = 0, completed = 0;

// Priority mapping 
const priorityOrder = { High: 1, Medium: 2, Low: 3 };

// ------------------- Linked List Implementation -------------------
class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  append(data) {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.size++;
  }

  prepend(data) {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this.size++;
  }

  remove(data) {
    if (!this.head) return false;
    if (this.head.data === data) {
      this.head = this.head.next;
      this.size--;
      if (!this.head) this.tail = null;
      return true;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.data === data) {
        current.next = current.next.next;
        if (!current.next) this.tail = current;
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  toArray() {
    const arr = [];
    let current = this.head;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }

  isEmpty() {
    return this.size === 0;
  }
}

// ------------------- Data Structures Using LinkedList -------------------
class TaskStack {
  constructor() { this.list = new LinkedList(); }
  push(task) { this.list.prepend(task); }
  pop() {
    if (this.list.isEmpty()) return null;
    const task = this.list.head.data;
    this.list.remove(task);
    return task;
  }
  peek() { return this.list.head ? this.list.head.data : null; }
  isEmpty() { return this.list.isEmpty(); }
  toArray() { return this.list.toArray(); }
}

class TaskQueue {
  constructor() { this.list = new LinkedList(); }
  enqueue(task) { this.list.append(task); }
  dequeue() {
    if (this.list.isEmpty()) return null;
    const task = this.list.head.data;
    this.list.remove(task);
    return task;
  }
  front() { return this.list.head ? this.list.head.data : null; }
  isEmpty() { return this.list.isEmpty(); }
  toArray() { return this.list.toArray(); }
}

class PriorityQueue {
  constructor() { this.list = new LinkedList(); }
  enqueue(task) {
    if (this.list.isEmpty()) { this.list.append(task); return; }
    let prev = null, current = this.list.head;
    while (current && priorityOrder[current.data.priority] <= priorityOrder[task.priority]) {
      prev = current;
      current = current.next;
    }
    const node = new ListNode(task);
    if (!prev) {
      node.next = this.list.head;
      this.list.head = node;
    } else {
      node.next = prev.next;
      prev.next = node;
    }
    if (!node.next) this.list.tail = node;
    this.list.size++;
  }
  dequeue() {
    if (this.list.isEmpty()) return null;
    const task = this.list.head.data;
    this.list.remove(task);
    return task;
  }
  peek() { return this.list.head ? this.list.head.data : null; }
  isEmpty() { return this.list.isEmpty(); }
  toArray() { return this.list.toArray(); }
}

// ------------------- Instances -------------------
let taskStack = new TaskStack();
let taskQueue = new TaskQueue();
let pq = new PriorityQueue();
let taskList = []; // used for rendering
let sortByDateAsc = true;

// ------------------- Core Functions -------------------
function updateStats() {
  document.getElementById("stats").textContent =
    `Tasks: ${taskList.filter(t => !t.status).length} | Completed: ${completed} | In Progress: ${inProgress}`;
}

function addTask(name, desc, due, priority) {
  const task = {
    id: taskCounter++,
    name,
    desc,
    added: new Date().toISOString().split("T")[0],
    due,
    priority,
    status: false
  };

  taskStack.push(task);
  taskQueue.enqueue(task);
  pq.enqueue(task);
  taskList.push(task);

  inProgress++;
  renderTasks();
}

// ------------------- Render Tasks -------------------
function renderTasks(tasks = null) {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";

  // Stack is LIFO, newest task is already at the front
  let tasksToRender = tasks || [...taskStack.toArray()].filter(t => !t.status);

  tasksToRender.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" onchange="moveToCompleted(this, ${taskList.indexOf(t)})"></td>
      <td>${t.name}</td>
      <td>${t.desc}</td>
      <td>${t.due}</td>
      <td>${t.added}</td>
      <td class="priority-${t.priority}">${t.priority}</td>
      <td style="text-align:center;">
        <button class="remove-btn" onclick="removeTask(${t.id})">×</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  updateStats();
  checkIfEmpty();
}

// ------------------- Task Completion -------------------
function moveToCompleted(checkbox, index) {
  if (checkbox.checked) {
    const task = taskList[index];
    task.status = true;
    completed++;
    inProgress--;

    const clone = document.createElement("tr");
    clone.innerHTML = `
      <td>${task.name}</td>
      <td>${task.desc}</td>
      <td>${task.due}</td>
      <td>${task.added}</td>
      <td class="priority-${task.priority}">${task.priority}</td>
      <td style="text-align:center;">
        <button class="remove-btn" onclick="removeTask(${task.id})">×</button>
      </td>
    `;
    const completedBody = document.getElementById("completedModalBody");
    completedBody.insertBefore(clone, completedBody.firstChild);

    renderTasks();
  }
}

// ------------------- Sorting -------------------
function sortByStack() {
  renderTasks([...taskStack.toArray()].filter(t => !t.status));
}

function sortByPriority() {
  const sorted = [...taskStack.toArray()]
    .filter(t => !t.status)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  renderTasks(sorted);
  document.getElementById("stackSortBtn").disabled = true;
}

function sortByDateAdded() {
  const sorted = [...taskStack.toArray()]
    .filter(t => !t.status)
    .sort((a, b) => sortByDateAsc
      ? new Date(a.added) - new Date(b.added)
      : new Date(b.added) - new Date(a.added));
  renderTasks(sorted);
  sortByDateAsc = !sortByDateAsc;
}

// ------------------- Extra Features -------------------
function undoTask() {
  const lastTask = taskStack.pop();
  if (lastTask) removeTask(lastTask.id);
}

function processNextTask() {
  const task = taskQueue.dequeue();
  if (task) moveToCompleted({ checked: true }, taskList.indexOf(task));
}

function processUrgentTask() {
  const urgent = pq.dequeue();
  if (urgent) moveToCompleted({ checked: true }, taskList.indexOf(urgent));
}

// ------------------- Modal & Form -------------------
const modal = document.getElementById("taskModal");
const span = document.querySelector(".close");
const form = document.getElementById("taskForm");

function openTaskDialog() { modal.style.display = "block"; }
span.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; }

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const due = document.getElementById("taskDue").value;

  if (!name || !desc || !due) {
    alert("Please fill in all fields!");
    return;
  }

  addTask(name, desc, due, priority);
  form.reset();
  modal.style.display = "none";
});

// ------------------- Completed Tasks Modal -------------------
function toggleCompleted() {
  const completedModal = document.getElementById("completedModal");
  const completedModalBody = document.getElementById("completedModalBody");

  completedModalBody.innerHTML = "";
  taskList.filter(t => t.status).reverse().forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.name}</td>
      <td>${t.desc}</td>
      <td>${t.due}</td>
      <td>${t.added}</td>
      <td class="priority-${t.priority}">${t.priority}</td>
      <td style="text-align:center;">
        <button class="remove-btn" onclick="removeTask(${t.id})">×</button>
      </td>
    `;
    completedModalBody.appendChild(row);
  });

  completedModal.style.display = "block";
}

document.getElementById("completedClose").onclick = () => {
  document.getElementById("completedModal").style.display = "none";
};

// ------------------- Utilities -------------------
function checkIfEmpty() {
  const tbody = document.querySelector("#taskTable tbody");
  const noTasksMessage = document.getElementById("noTasksMessage");
  noTasksMessage.style.display = tbody.children.length === 0 ? "block" : "none";
}

const taskDueInput = document.getElementById("taskDue");
const today = new Date().toISOString().split("T")[0];
taskDueInput.setAttribute("min", today);

// Loader
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";
    setTimeout(() => loader.style.display = "none", 500);
  }, 1200);
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  checkIfEmpty();
});

// ------------------- Delete Confirmation Modal -------------------
let taskToDelete = null;

function removeTask(id) {
  taskToDelete = id;
  document.getElementById("deleteModal").style.display = "block";
}

document.getElementById("confirmDelete").onclick = () => {
  if (taskToDelete !== null) {
    const indexList = taskList.findIndex(t => t.id === taskToDelete);
    if (indexList > -1) {
      const task = taskList.splice(indexList, 1)[0];
      if (task.status) completed--; else inProgress--;
      renderTasks();
      updateStats();
    }

    taskStack.list.remove(task);
    taskQueue.list.remove(task);
    pq.list.remove(task);

    document.querySelectorAll("#completedModalBody tr").forEach(row => {
      if (row.innerHTML.includes(`removeTask(${taskToDelete})`)) row.remove();
    });

    taskToDelete = null;
    document.getElementById("deleteModal").style.display = "none";
  }
};

document.getElementById("cancelDelete").onclick = () => {
  taskToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
};

window.onclick = (e) => {
  const deleteModal = document.getElementById("deleteModal");
  if (e.target === deleteModal) {
    deleteModal.style.display = "none";
    taskToDelete = null;
  }
};
