// ===================== TASK MANAGEMENT SYSTEM =====================

// Counters to track task IDs and task statuses
let taskCounter = 1;    // Unique ID for each task
let inProgress = 0;     // Number of tasks currently in progress
let completed = 0;      // Number of tasks completed

// Map priorities to numbers for sorting (High = 1, Medium = 2, Low = 3)
const priorityOrder = { High: 1, Medium: 2, Low: 3 };

// ===================== LINKED LIST IMPLEMENTATION =====================
// A linked list is a chain of nodes where each node points to the next
// Allows efficient adding, removing, and traversing tasks

class ListNode {
  constructor(data) {
    this.data = data;   // Store task information
    this.next = null;   // Pointer to the next node in the list
  }
}

class LinkedList {
  constructor() {
    this.head = null;   // First node of the list
    this.tail = null;   // Last node of the list
    this.size = 0;      // Number of nodes in the list
  }

// this part is crucial because it defines how linked list itself behaves and moves
// these are methods to manipulate and check the linked list, remove one and the
// web cannot call the function like delete, add or update current satus datas

// to add data at the end
  append(data) {
    const node = new ListNode(data);
    if (!this.head) this.head = this.tail = node; // First node in empty list
    else {
      this.tail.next = node;  // Link last node to new node
      this.tail = node;       // Update tail
    }
    this.size++;
  }
// to add data
  prepend(data) {
    const node = new ListNode(data);
    if (!this.head) this.head = this.tail = node;
    else {
      node.next = this.head; // New node points to current head
      this.head = node;      // Update head
    }
    this.size++;
  }
// delete data
  remove(task) {
    if (!this.head) return false; // Nothing to remove
    if (this.head.data === task) { // Task is at the head
      this.head = this.head.next;
      if (!this.head) this.tail = null; // List is empty now
      this.size--;
      return true;
    }
    let current = this.head;
    while (current.next) {           // Traverse list
      if (current.next.data === task) {
        current.next = current.next.next; // Skip removed node
        if (!current.next) this.tail = current; // Update tail if needed
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false; // Task not found
  }
// to check status
  findById(id) {
    let current = this.head;
    while (current) {
      if (current.data.id === id) return current.data;
      current = current.next;
    }
    return null;
  }

  forEach(callback) {
    let current = this.head;
    while (current) {
      callback(current.data);
      current = current.next;
    }
  }

  isEmpty() {
    return this.size === 0;
  }
}

// ===================== STACK & PRIORITY QUEUE =====================
// Stack = Last In First Out (latest task on top)
// Priority Queue = always returns task with highest priority first

class TaskStack {
  constructor() { this.list = new LinkedList(); }
  push(task) { this.list.prepend(task); }   // Add new task to top
  pop() {
    if (this.list.isEmpty()) return null;
    const task = this.list.head.data;
    this.list.remove(task);                  // Remove top task
    return task;
  }
  isEmpty() { return this.list.isEmpty(); }
  forEach(cb) { this.list.forEach(cb); }
}

class PriorityQueue {
  constructor() { this.list = new LinkedList(); }

  enqueue(task) {
    // Insert task based on its priority (High goes first)
    if (this.list.isEmpty()) { this.list.append(task); return; }
    let prev = null, current = this.list.head;
    while (current && priorityOrder[current.data.priority] <= priorityOrder[task.priority]) {
      prev = current;
      current = current.next;
    }
    const node = new ListNode(task);
    if (!prev) { node.next = this.list.head; this.list.head = node; }
    else { node.next = prev.next; prev.next = node; }
    if (!node.next) this.list.tail = node;
    this.list.size++;
  }

  dequeue() {
    if (this.list.isEmpty()) return null;
    const task = this.list.head.data;
    this.list.remove(task); // Remove highest priority task
    return task;
  }

  isEmpty() { return this.list.isEmpty(); }
  forEach(cb) { this.list.forEach(cb); }
}

// ===================== INSTANCES =====================

let taskStack = new TaskStack();  // Main task stack
let pq = new PriorityQueue();      // Urgent tasks queue
let sortByDateAsc = true;         // Toggle for date sorting

// ===================== CORE FUNCTIONS =====================

// Update stats on screen yung sa left side
function updateStats() {
  let totalTasks = 0;
  taskStack.forEach(t => { if (!t.status) totalTasks++; });
  document.getElementById("stats").textContent =
    `Tasks: ${totalTasks} | Completed: ${completed} | In Progress: ${inProgress}`;
}

// Adds a new task this is stack push and priority queue enqueue
function addTask(name, desc, due, priority) {
  const task = {
    id: taskCounter++,                     // Unique ID
    name, desc,                            // Task name and description
    added: new Date().toISOString().split("T")[0], // Today’s date
    due, priority,
    status: false                          // Not completed yet
  };

  taskStack.push(task);  // Add to main stack
  pq.enqueue(task);      // Add to priority queue
  inProgress++;          // Increment in-progress counter
  renderTasks();         // Update task table
}

// ===================== RENDERING TASKS =====================
//purpose of renderTasks is to update the HTML table whenever the data changes 
// this is importatn for the No task to Accomplish message
function renderTasks(filteredTasks = null) {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";   // Clears current table

  let tasksToRender = filteredTasks ? filteredTasks : [];
  if (!filteredTasks) taskStack.forEach(t => { if (!t.status) tasksToRender.push(t); });

  // Render each task as a table row
  tasksToRender.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" onchange="moveToCompleted(this, ${t.id})"></td>
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

  updateStats();  // Refresh task counters
  checkIfEmpty(); // checks if the table is empty
}

// ===================== COMPLETING TASKS =====================
// Move task to completed when checkbox is checked
function moveToCompleted(checkbox, id) {
  if (!checkbox.checked) return;
  const task = taskStack.list.findById(id);
  if (!task) return;

  task.status = true;  // Mark as done
  completed++;
  inProgress--;

  // Add task to completed tasks window
  const completedBody = document.getElementById("completedModalBody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${task.name}</td>
    <td>${task.desc}</td>
    <td>${task.due}</td>
    <td>${task.added}</td>
    <td class="priority-${task.priority}">${task.priority}</td>
    <td style="text-align:center;">
      <button class="remove-btn" onclick="removeTask(${task.id})">×</button>
    </td>
  `;
  completedBody.insertBefore(row, completedBody.firstChild);
  renderTasks();
}

// ===================== SORTING FUNCTIONS =====================
// Sort tasks by priority (High, Medium, Low)
function sortByPriority() {
  const sorted = [];
  taskStack.forEach(t => { if (!t.status) sorted.push(t); });
  sorted.sort((a, b) => {
    const prioDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (prioDiff !== 0) return prioDiff;      // Compare by priority first
    return new Date(a.due) - new Date(b.due); // If same priority, compare due date
  });
  renderTasks(sorted);
}

// Toggle sorting by date added (ascending/descending) cannot be demonstrated unless mag wait until next day
function sortByDateAdded() {
  const sorted = [];
  taskStack.forEach(t => { if (!t.status) sorted.push(t); });
  sorted.sort((a, b) => sortByDateAsc
    ? new Date(a.added) - new Date(b.added)
    : new Date(b.added) - new Date(a.added));
  renderTasks(sorted);
  sortByDateAsc = !sortByDateAsc;
}

// ===================== USER INTERFACE WINDOWS THE FRAMES IN THE BUTTONS =====================
const modal = document.getElementById("taskModal"); // Task form window
const span = document.querySelector(".close");      // Close button for task form window
const form = document.getElementById("taskForm");

// Open/close task form window
function openTaskDialog() { modal.style.display = "block"; }
span.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; }

// Handle task form submission
form.addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const due = document.getElementById("taskDue").value;

  if (!name || !desc || !due) { alert("Please fill in all fields!"); return; }
  addTask(name, desc, due, priority);
  form.reset();
  modal.style.display = "none";
});

// Completed tasks window
function toggleCompleted() {
  const completedWindow = document.getElementById("completedModal"); // Completed tasks window
  const completedBody = document.getElementById("completedModalBody");
  completedBody.innerHTML = "";

  const completedTasks = [];
  taskStack.forEach(t => { if (t.status) completedTasks.unshift(t); });

  completedTasks.forEach(t => {
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
    completedBody.appendChild(row);
  });

  completedWindow.style.display = "block";
}
document.getElementById("completedClose").onclick = () => {
  document.getElementById("completedModal").style.display = "none";
};

// ===================== UTILITIES =====================
// Show "no tasks accomplish" message if table is empty and utilizes the checkIfEmpty function on the top
function checkIfEmpty() {
  const tbody = document.querySelector("#taskTable tbody");
  document.getElementById("noTasksMessage").style.display =
    tbody.children.length === 0 ? "block" : "none";
}

// Prevent selecting past dates for due date in the calendar
document.getElementById("taskDue").setAttribute("min", new Date().toISOString().split("T")[0]);

// Loader animation on page load yung three dots
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";
    setTimeout(() => loader.style.display = "none", 500);
  }, 1200); // time of the loader animation yung tatlong dots
});

// Initialize stats and empty table message yung stats sa geldi para mag adjust
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  checkIfEmpty();
});

// ===================== DELETE CONFIRMATION WINDOW =====================
let taskToDelete = null;

// Show delete confirmation window
function removeTask(id) {
  taskToDelete = id;
  document.getElementById("deleteModal").style.display = "block";
}

// Confirm deletion
document.getElementById("confirmDelete").onclick = () => {
  if (taskToDelete !== null) {
    const task = taskStack.list.findById(taskToDelete);
    if (task) {
      if (task.status) completed--; else inProgress--;
      taskStack.list.remove(task);
      pq.list.remove(task);

      // Remove from completed tasks window
      document.querySelectorAll("#completedModalBody tr").forEach(row => {
        if (row.innerHTML.includes(`removeTask(${taskToDelete})`)) row.remove();
      });

      renderTasks();
      updateStats();
    }
    taskToDelete = null;
    document.getElementById("deleteModal").style.display = "none";
  }
};

// Cancel deletion
document.getElementById("cancelDelete").onclick = () => {
  taskToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
};

// Close delete window when clicking outside
window.addEventListener("click", (e) => {
  const deleteWindow = document.getElementById("deleteModal");
  if (e.target === deleteWindow) {
    deleteWindow.style.display = "none";
    taskToDelete = null;
  }
});

